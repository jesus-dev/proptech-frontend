'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PropShot, PropShotService, CreatePropShotRequest } from '@/services/propShotService';
import { AgentService, Agent } from '@/services/agentService';
import { getEndpoint } from '@/lib/api-config';
import CreatePropShotModal from '@/components/social/CreatePropShotModal';
import PropShotGrid from '@/components/social/PropShotGrid';
import PropShotReelViewer from '@/components/social/PropShotReelViewer';
import { 
  Camera,
  Search,
  Filter,
  Plus,
  XCircle,
  Pencil
} from 'lucide-react';

export default function PropShotsPage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [propShots, setPropShots] = useState<PropShot[]>([]);
  const [filteredPropShots, setFilteredPropShots] = useState<PropShot[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreatePropShot, setShowCreatePropShot] = useState(false);
  const [creatingPropShot, setCreatingPropShot] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterLikes, setFilterLikes] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPropShot, setSelectedPropShot] = useState<PropShot | null>(null);
  const [editingPropShot, setEditingPropShot] = useState<PropShot | null>(null);
  const [editPropShotTitle, setEditPropShotTitle] = useState('');
  const [editPropShotDescription, setEditPropShotDescription] = useState('');
  const [savingEditPropShot, setSavingEditPropShot] = useState(false);

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterAgent('all');
    setFilterDate('all');
    setFilterLikes('all');
  };

  // Cargar todos los PropShots
  useEffect(() => {
    const loadPropShots = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedPropShots = await PropShotService.getPropShots();
        setPropShots(fetchedPropShots || []);
        setFilteredPropShots(fetchedPropShots || []);
      } catch (err: any) {
        console.error('Error loading PropShots:', err);
        setError('Error al cargar los PropShots. Por favor, intenta recargar la página.');
        setPropShots([]);
        setFilteredPropShots([]);
      } finally {
        setLoading(false);
      }
    };

    // Cargar PropShots (no requiere autenticación para ver)
    loadPropShots();
  }, []);

  // Cargar agentes dinámicamente
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoadingAgents(true);
        const fetchedAgents = await AgentService.getAllAgents();
        console.log('Agentes cargados:', fetchedAgents?.length || 0, fetchedAgents);
        setAgents(fetchedAgents || []);
      } catch (err: any) {
        console.error('Error loading agents:', err);
        console.error('Error details:', err?.response?.data || err?.message);
        setAgents([]);
      } finally {
        setLoadingAgents(false);
      }
    };

    loadAgents();
  }, []);

  // Filtrar PropShots basado en búsqueda y filtros
  useEffect(() => {
    let filtered = propShots;

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(shot => 
        shot.title.toLowerCase().includes(lowercaseQuery) ||
        shot.description.toLowerCase().includes(lowercaseQuery) ||
        `${shot.agentFirstName || ''} ${shot.agentLastName || ''}`.toLowerCase().includes(lowercaseQuery)
      );
    }

    // Filtro por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(shot => shot.status === filterStatus);
    }

    // Filtro por agente
    if (filterAgent !== 'all') {
      filtered = filtered.filter(shot => 
        shot.agentId?.toString() === filterAgent
      );
    }



    // Filtro por fecha
    if (filterDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter(shot => {
        const shotDate = new Date(shot.createdAt);
        const diffDays = Math.floor((now.getTime() - shotDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filterDate) {
          case 'today': return diffDays === 0;
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          case 'year': return diffDays <= 365;
          default: return true;
        }
      });
    }

    // Filtro por likes
    if (filterLikes !== 'all') {
      filtered = filtered.filter(shot => {
        const likes = shot.likes || 0;
        
        switch (filterLikes) {
          case 'popular': return likes >= 100;
          case 'trending': return likes >= 50;
          case 'new': return likes < 10;
          default: return true;
        }
      });
    }

    setFilteredPropShots(filtered);
  }, [propShots, searchQuery, filterStatus, filterAgent, filterDate, filterLikes]);

  // Función para crear PropShot
  const handleCreatePropShot = async (propShotData: any) => {
    if (!isAuthenticated || !user) {
      alert('Debes iniciar sesión para crear PropShots');
      window.location.href = '/login';
      return;
    }
    
    if (!propShotData.video || !propShotData.title.trim()) return;

    try {
      setCreatingPropShot(true);

      const requestData: CreatePropShotRequest = {
        title: propShotData.title,
        description: propShotData.description,
        duration: propShotData.duration,
        link: propShotData.link || undefined,
        videoFile: propShotData.video,
        thumbnailFile: propShotData.thumbnail || undefined,
        userId: user?.id || 0
      };

      const createdPropShot = await PropShotService.createPropShot(requestData);

      // Recargar los PropShots para mostrar el nuevo
      const updatedPropShots = await PropShotService.getPropShots();
      setPropShots(updatedPropShots);

      // Cerrar modal
      setShowCreatePropShot(false);

      alert('PropShot creado exitosamente');
    } catch (error) {
      console.error('Error creating PropShot:', error);
      alert('Error al crear el PropShot. Intenta nuevamente.');
    } finally {
      setCreatingPropShot(false);
    }
  };

  // Función para dar like a un PropShot
  const handleLikePropShot = async (propShotId: number) => {
    try {
      const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userData ? JSON.parse(userData) : null;
      const likedPropShots = JSON.parse(localStorage.getItem('likedPropShots') || '[]');
      
      // Verificar si ya se dio like
      const alreadyLiked = likedPropShots.includes(propShotId);
      
      const userId = user?.id || 0;
      await PropShotService.likePropShot(propShotId, userId);
      
      // Guardar en localStorage si es anónimo
      if (!isAuthenticated && !alreadyLiked) {
        likedPropShots.push(propShotId);
        localStorage.setItem('likedPropShots', JSON.stringify(likedPropShots));
      }
      
      // Actualizar el PropShot en la lista (solo si no se había dado like antes)
      if (!alreadyLiked) {
        setPropShots(prev => prev.map(shot =>
          shot.id === propShotId
            ? { ...shot, likes: shot.likes + 1 }
            : shot
        ));
        
        // Actualizar también en filteredPropShots
        setFilteredPropShots(prev => prev.map(shot =>
          shot.id === propShotId
            ? { ...shot, likes: shot.likes + 1 }
            : shot
        ));
        
        // Actualizar también el selectedPropShot si es el mismo
        if (selectedPropShot?.id === propShotId) {
          setSelectedPropShot(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
        }
      }
    } catch (error) {
      console.error('Error liking PropShot:', error);
      // No mostrar alert para no interrumpir la experiencia
    }
  };

  // Función para ver un PropShot
  const handleViewPropShot = async (propShotId: number) => {
    try {
      await PropShotService.incrementViews(propShotId);
      
      // Actualizar el contador de vistas en la lista
      setPropShots(prev => prev.map(shot =>
        shot.id === propShotId
          ? { ...shot, views: (shot.views || 0) + 1 }
          : shot
      ));
      
      // Actualizar también en filteredPropShots
      setFilteredPropShots(prev => prev.map(shot =>
        shot.id === propShotId
          ? { ...shot, views: (shot.views || 0) + 1 }
          : shot
      ));
      
      // Actualizar también el selectedPropShot si es el mismo
      if (selectedPropShot?.id === propShotId) {
        setSelectedPropShot(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null);
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  // Función para agregar comentario a un PropShot
  const handleCommentPropShot = async (propShotId: number, content: string, userId: number, userName: string) => {
    try {
      await PropShotService.addComment(propShotId, content, userId, userName);
      
      // Actualizar el PropShot en la lista (incrementar contador)
      setPropShots(prev => prev.map(shot =>
        shot.id === propShotId
          ? { ...shot, comments: (shot.comments || 0) + 1 }
          : shot
      ));
      
      // Actualizar también en filteredPropShots
      setFilteredPropShots(prev => prev.map(shot =>
        shot.id === propShotId
          ? { ...shot, comments: (shot.comments || 0) + 1 }
          : shot
      ));
      
      // Si es el PropShot seleccionado, actualizarlo también
      if (selectedPropShot?.id === propShotId) {
        setSelectedPropShot(prev => prev ? { ...prev, comments: (prev.comments || 0) + 1 } : null);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  // Handler para abrir el reel viewer
  const handlePropShotClick = (shot: PropShot) => {
    setSelectedPropShot(shot);
    handleViewPropShot(shot.id);
  };

  const handleOpenEditPropShot = (shot: PropShot) => {
    setEditingPropShot(shot);
    setEditPropShotTitle(shot.title || '');
    setEditPropShotDescription(shot.description || '');
    setSelectedPropShot(null);
  };

  const handleSaveEditPropShot = async () => {
    if (!editingPropShot) return;
    if (!editPropShotTitle.trim()) {
      alert('El título es obligatorio.');
      return;
    }
    try {
      setSavingEditPropShot(true);
      const updated = await PropShotService.updatePropShot(editingPropShot.id, {
        title: editPropShotTitle.trim(),
        description: editPropShotDescription.trim()
      });
      setPropShots(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
      setFilteredPropShots(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
      setEditingPropShot(null);
      setEditPropShotTitle('');
      setEditPropShotDescription('');
    } catch (error: any) {
      alert(error?.message || 'Error al guardar. Intenta de nuevo.');
    } finally {
      setSavingEditPropShot(false);
    }
  };

  const handleDeletePropShot = async (shot: PropShot) => {
    if (!confirm('¿Eliminar este reel? Esta acción no se puede deshacer.')) return;
    try {
      await PropShotService.deletePropShot(shot.id);
      setPropShots(prev => prev.filter(s => s.id !== shot.id));
      setFilteredPropShots(prev => prev.filter(s => s.id !== shot.id));
      if (selectedPropShot?.id === shot.id) setSelectedPropShot(null);
      if (editingPropShot?.id === shot.id) {
        setEditingPropShot(null);
        setEditPropShotTitle('');
        setEditPropShotDescription('');
      }
    } catch (error: any) {
      alert(error?.message || 'Error al eliminar el reel.');
    }
  };

  // Función para convertir URLs relativas en URLs completas
  // Usa api.proptech.com.py con endpoint optimizado para Cloudflare
  const getFullUrl = (url: string): string => {
    if (!url) {
      return '';
    }
    
    let result = '';
    
    // Si ya es una URL completa, retornarla
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      result = url;
    }
    // HLS streams: usar endpoint de HLS (PRIORIDAD ALTA)
    else if (url.endsWith('.m3u8')) {
      // Extraer videoId del path (el directorio antes de playlist.m3u8)
      const parts = url.split('/');
      const playlistIndex = parts.findIndex(p => p.endsWith('.m3u8'));
      if (playlistIndex > 0) {
        const videoId = parts[playlistIndex - 1];
        const filename = parts[playlistIndex];
        result = getEndpoint(`/api/social/propshots/hls/${videoId}/${filename}`);
      } else {
        result = getEndpoint(url);
      }
    }
    // Videos de PropShots: usar endpoint optimizado
    else if (url.includes('/social/propshots/') && (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov'))) {
      const filename = url.split('/').pop();
      result = getEndpoint(`/api/social/propshots/video/${filename}`);
    }
    // Solo nombre de archivo de video
    else if (!url.startsWith('/') && !url.includes('/') && (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov'))) {
      result = getEndpoint(`/api/social/propshots/video/${url}`);
    }
    // Si es una URL relativa del backend (como /uploads/...), usar getEndpoint
    else if (url.startsWith('/uploads/')) {
      result = getEndpoint(url);
    }
    // Si es una URL de API, usar getEndpoint
    else if (url.startsWith('/api/')) {
      result = getEndpoint(url);
    }
    // Para cualquier otra ruta relativa, usar getEndpoint
    else {
      result = getEndpoint(url.startsWith('/') ? url : `/${url}`);
    }
    
    console.log('🎬 [VIDEO-URL] Input:', url, '-> Output:', result);
    return result;
  };

  // Ya no se requiere autenticación para ver PropShots
  // Solo se requiere para crear PropShots

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mejorado Responsive */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16">
            <h1 className="text-base sm:text-lg lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent">PropShots</h1>
            {isAuthenticated ? (
              <button
                onClick={() => setShowCreatePropShot(true)}
                className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-indigo-600 hover:to-indigo-700 text-white px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 transition-all duration-300 text-xs sm:text-sm lg:text-base shadow-lg hover:shadow-xl hover:scale-105 group"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="hidden sm:inline">Crear PropShot</span>
                <span className="sm:hidden">Crear</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda - Mejorado Responsive */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-3 lg:py-6">
          {/* Header con búsqueda y botón de filtros */}
          <div className="flex items-center gap-2 justify-between">
            {/* Búsqueda principal */}
            <div className="flex-1 w-full max-w-md">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar PropShots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 shadow-sm outline-none focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-transparent focus:shadow-md transition-all sm:text-base text-sm"
                />
              </div>
            </div>

            {/* Botón para mostrar/ocultar filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 outline-none focus:outline-none focus:ring-2 focus:ring-blue-500/60 font-medium shadow-sm group transition-all"
            >
              <Filter className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180 text-blue-600' : 'group-hover:text-blue-600 text-blue-500'}`} />
              <span className="text-sm">{showFilters ? 'Filtros' : 'Filtros'}</span>
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-blue-600 border border-blue-200 text-[10px] font-bold">
                {(filterStatus !== 'all' || filterAgent !== 'all' || filterDate !== 'all' || filterLikes !== 'all') ? '1' : '0'}
              </span>
            </button>
          </div>

          {/* Filtros desplegables */}
          <div className={`mt-4 transition-all duration-300 ease-in-out overflow-hidden ${
            showFilters ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5 space-y-5">
              {/* Título de la sección */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Filtros avanzados</h3>
                <button onClick={clearAllFilters} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600">
                  <XCircle className="w-4 h-4" />
                  Limpiar filtros
                </button>
              </div>

              {/* Filtros organizados en grupos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Filtro de Estado */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">Estado</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white/90 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500/80 focus:border-transparent shadow-sm"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">✅ Activos</option>
                    <option value="pending">⏳ Pendientes</option>
                    <option value="archived">📁 Archivados</option>
                  </select>
                </div>

                {/* Filtro de Agente */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">Agente</label>
                  <select
                    value={filterAgent}
                    onChange={(e) => setFilterAgent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white/90 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500/80 focus:border-transparent shadow-sm"
                    disabled={loadingAgents}
                  >
                    <option value="all">Todos los agentes</option>
                    {agents.map((agent) => {
                      // El backend retorna nombre/apellido, pero normalizamos a firstName/lastName
                      const displayName = agent.firstName && agent.lastName
                        ? `${agent.firstName} ${agent.lastName}`.trim()
                        : agent.firstName || agent.lastName || 'Agente sin nombre';
                      return (
                        <option key={agent.id} value={String(agent.id)}>
                          👤 {displayName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Filtro de Fecha */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">Fecha</label>
                  <select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white/90 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500/80 focus:border-transparent shadow-sm"
                  >
                    <option value="all">Todas las fechas</option>
                    <option value="today">📅 Hoy</option>
                    <option value="week">📅 Esta semana</option>
                    <option value="month">📅 Este mes</option>
                    <option value="year">📅 Este año</option>
                  </select>
                </div>

                {/* Filtro de Popularidad */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">Popularidad</label>
                  <select
                    value={filterLikes}
                    onChange={(e) => setFilterLikes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white/90 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500/80 focus:border-transparent shadow-sm"
                  >
                    <option value="all">Todas las categorías</option>
                    <option value="popular">🔥 Populares (100+ likes)</option>
                    <option value="trending">📈 Trending (50+ likes)</option>
                    <option value="new">🆕 Nuevos (menos de 10 likes)</option>
                  </select>
                </div>
              </div>

              {/* Indicador de filtros activos */}
              {(searchQuery || filterStatus !== 'all' || filterAgent !== 'all' || filterDate !== 'all' || filterLikes !== 'all') && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Filtros activos */}
                                         <div className="flex flex-wrap gap-2">
                       <span className="text-sm font-medium text-gray-700">Filtros aplicados:</span>
                       {searchQuery && (
                         <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                           🔍 "{searchQuery}"
                           <button
                             onClick={() => setSearchQuery('')}
                             className="ml-1 hover:text-blue-600"
                           >
                             ×
                           </button>
                         </span>
                       )}
                       {filterStatus !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          📊 {filterStatus === 'active' ? 'Activos' : filterStatus === 'pending' ? 'Pendientes' : 'Archivados'}
                          <button
                            onClick={() => setFilterStatus('all')}
                            className="ml-1 hover:text-blue-600"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {filterAgent !== 'all' && (() => {
                        const selectedAgent = agents.find(a => String(a.id) === filterAgent);
                        const agentName = selectedAgent 
                          ? `${selectedAgent.firstName || ''} ${selectedAgent.lastName || ''}`.trim()
                          : 'Agente';
                        return (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            👤 {agentName}
                            <button
                              onClick={() => setFilterAgent('all')}
                              className="ml-1 hover:text-green-600"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })()}
                      {filterDate !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          📅 {filterDate === 'today' ? 'Hoy' : filterDate === 'week' ? 'Esta semana' : filterDate === 'month' ? 'Este mes' : 'Este año'}
                          <button
                            onClick={() => setFilterDate('all')}
                            className="ml-1 hover:text-purple-600"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {filterLikes !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          ❤️ {filterLikes === 'popular' ? 'Populares' : filterLikes === 'trending' ? 'Trending' : 'Nuevos'}
                          <button
                            onClick={() => setFilterLikes('all')}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>

                    {/* Botón para limpiar todos */}
                                         <button
                       onClick={() => {
                         setSearchQuery('');
                         setFilterStatus('all');
                         setFilterAgent('all');
                         setFilterDate('all');
                         setFilterLikes('all');
                       }}
                       className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                       Limpiar todos
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal - Mejorado Responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Contador de resultados - Responsive */}
        {!loading && (
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                  {filteredPropShots.length === 0 ? 'No se encontraron resultados' : `${filteredPropShots.length} PropShot${filteredPropShots.length !== 1 ? 's' : ''} encontrado${filteredPropShots.length !== 1 ? 's' : ''}`}
                </h3>
                {(searchQuery || filterStatus !== 'all' || filterAgent !== 'all' || filterDate !== 'all' || filterLikes !== 'all') && (
                  <span className="text-sm text-gray-500">
                    de {propShots.length} total
                  </span>
                )}
              </div>
              
              {/* Ordenamiento */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Ordenar por:</span>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option value="newest">Más recientes</option>
                  <option value="oldest">Más antiguos</option>
                  <option value="popular">Más populares</option>
                  <option value="title">Título A-Z</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800 font-medium mb-2">Error al cargar PropShots</p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando PropShots...</p>
          </div>
        ) : filteredPropShots.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay PropShots</h3>
            <p className="text-gray-600">
              {searchQuery || filterStatus !== 'all' || filterAgent !== 'all' || filterDate !== 'all' || filterLikes !== 'all'
                ? 'No se encontraron PropShots con los filtros aplicados'
                : 'Crea tu primer PropShot para mostrar propiedades en video'
              }
            </p>
          </div>
        ) : (
          <>
          {user && console.log('🔑 [DEBUG USER]', { userId: user.id, agentId: (user as any)?.agentId, agentObjId: user?.agent?.id, firstPropShotAgentId: filteredPropShots[0]?.agentId, resolvedId: (user as any)?.agentId || user?.agent?.id || user?.id, allUserKeys: Object.keys(user) })}
          <PropShotGrid
            propShots={filteredPropShots}
            loading={false}
            onLike={handleLikePropShot}
            onView={handleViewPropShot}
            onPropShotClick={handlePropShotClick}
            currentUserId={(user as any)?.agentId || user?.agent?.id || user?.id}
            onEdit={handleOpenEditPropShot}
            onDelete={handleDeletePropShot}
            showEmptyState={false}
            gridCols={{
              default: 2,
              sm: 2,
              md: 3,
              lg: 4
            }}
          />
          </>
        )}
      </div>

      {/* Modal PropShot reel viewer */}
      {selectedPropShot && (
        <PropShotReelViewer
          initialPropShot={selectedPropShot}
          allPropShots={filteredPropShots}
          onLike={handleLikePropShot}
          onView={handleViewPropShot}
          onComment={handleCommentPropShot}
          getFullUrl={getFullUrl}
          onClose={() => setSelectedPropShot(null)}
          isOwner={isAuthenticated && !!user && selectedPropShot?.agentId != null && Number(selectedPropShot.agentId) === Number((user as any)?.agentId || user?.agent?.id || user?.id)}
          onEdit={() => selectedPropShot && handleOpenEditPropShot(selectedPropShot)}
          onDelete={handleDeletePropShot}
        />
      )}

      {/* Modal editar PropShot (solo dueño) */}
      {editingPropShot && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !savingEditPropShot && setEditingPropShot(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Editar reel
            </h3>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
            <input
              type="text"
              value={editPropShotTitle}
              onChange={e => setEditPropShotTitle(e.target.value)}
              placeholder="Título del reel"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea
              value={editPropShotDescription}
              onChange={e => setEditPropShotDescription(e.target.value)}
              placeholder="Descripción (opcional)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingPropShot(null)}
                disabled={savingEditPropShot}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEditPropShot}
                disabled={savingEditPropShot || !editPropShotTitle.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {savingEditPropShot ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear PropShot */}
      <CreatePropShotModal
        isOpen={showCreatePropShot}
        onClose={() => setShowCreatePropShot(false)}
        onSubmit={handleCreatePropShot}
        creating={creatingPropShot}
      />
    </div>
  );
}
