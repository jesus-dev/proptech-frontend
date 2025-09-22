'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PropShot, PropShotService, CreatePropShotRequest } from '@/services/propShotService';
import CreatePropShotModal from '@/components/social/CreatePropShotModal';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Play,
  Heart as HeartIcon,
  MessageCircle as MessageIcon,
  Camera,
  Building2,
  Search,
  Filter,
  Plus
} from 'lucide-react';

export default function PropShotsPage() {
  const { isAuthenticated, user } = useAuth();
  const [propShots, setPropShots] = useState<PropShot[]>([]);
  const [filteredPropShots, setFilteredPropShots] = useState<PropShot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropShot, setSelectedPropShot] = useState<PropShot | null>(null);
  const [showCreatePropShot, setShowCreatePropShot] = useState(false);
  const [newPropShot, setNewPropShot] = useState({ title: '', description: '', duration: '90:00', link: '' });
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [creatingPropShot, setCreatingPropShot] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterLikes, setFilterLikes] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Cargar todos los PropShots
  useEffect(() => {
    const loadPropShots = async () => {
      try {
        setLoading(true);
        const fetchedPropShots = await PropShotService.getPropShots();
        setPropShots(fetchedPropShots);
        setFilteredPropShots(fetchedPropShots);
      } catch (err) {
        console.error('Error loading PropShots:', err);
        setPropShots([]);
        setFilteredPropShots([]);
      } finally {
        setLoading(false);
      }
    };

    loadPropShots();
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
      await PropShotService.likePropShot(propShotId);
      
      // Actualizar el PropShot en la lista
      setPropShots(prev => prev.map(shot =>
        shot.id === propShotId
          ? { ...shot, likes: shot.likes + 1 }
          : shot
      ));

      // Si es el PropShot seleccionado, actualizarlo también
      if (selectedPropShot?.id === propShotId) {
        setSelectedPropShot(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
    } catch (error) {
      console.error('Error liking PropShot:', error);
    }
  };

  // Función para ver un PropShot
  const handleViewPropShot = async (propShotId: number) => {
    try {
      await PropShotService.incrementViews(propShotId);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  // Manejar selección de video
  const handleVideoSelect = (file: File) => {
    setSelectedVideo(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  // Manejar selección de thumbnail
  const handleThumbnailSelect = (file: File) => {
    setSelectedThumbnail(file);
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
  };

  // Función para convertir URLs relativas en URLs completas
  const getFullUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http')) {
      return url;
    }
    
    // Manejar URLs incorrectas de PropShots
    if (url.includes('/api/prop-shots/media/')) {
      // Convertir URL incorrecta a la correcta
      const filename = url.split('/').pop();
      const correctedUrl = `/uploads/prop-shots/media/${filename}`;
      console.log('🔧 URL corregida:', { original: url, corrected: correctedUrl });
      url = correctedUrl;
    }
    
    // Construir URL completa para el backend
    const fullUrl = `http://localhost:8080${url.startsWith('/') ? url : `/${url}`}`;
    console.log('🔗 URL convertida:', { original: url, full: fullUrl });
    return fullUrl;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h1>
          <p className="text-gray-600">Debes iniciar sesión para ver los PropShots</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">PropShots</h1>
            <button
              onClick={() => setShowCreatePropShot(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear PropShot
            </button>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda Mejorados */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header con búsqueda y botón de filtros */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Búsqueda principal */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="🔍 Buscar PropShots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-base"
                />
              </div>
            </div>

            {/* Botón para mostrar/ocultar filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl transition-all duration-200 font-medium"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              <span className="ml-1 text-xs bg-orange-200 px-2 py-1 rounded-full">
                {(filterStatus !== 'all' || filterAgent !== 'all' || filterDate !== 'all' || filterLikes !== 'all') ? 'Activos' : '0'}
              </span>
            </button>
          </div>

          {/* Filtros desplegables */}
          <div className={`mt-6 transition-all duration-300 ease-in-out overflow-hidden ${
            showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="space-y-6">
              {/* Título de la sección */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Filtros avanzados</h3>
              </div>

              {/* Filtros organizados en grupos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro de Estado */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm bg-white"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">✅ Activos</option>
                    <option value="pending">⏳ Pendientes</option>
                    <option value="archived">📁 Archivados</option>
                  </select>
                </div>

                {/* Filtro de Agente */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Agente</label>
                  <select
                    value={filterAgent}
                    onChange={(e) => setFilterAgent(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm bg-white"
                  >
                    <option value="all">Todos los agentes</option>
                    <option value="1">👤 María González</option>
                    <option value="2">👤 Carlos Mendoza</option>
                  </select>
                </div>

                {/* Filtro de Fecha */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Fecha</label>
                  <select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm bg-white"
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
                  <label className="block text-sm font-medium text-gray-700">Popularidad</label>
                  <select
                    value={filterLikes}
                    onChange={(e) => setFilterLikes(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm bg-white"
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
                         <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                           🔍 "{searchQuery}"
                           <button
                             onClick={() => setSearchQuery('')}
                             className="ml-1 hover:text-orange-600"
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
                      {filterAgent !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          👤 {filterAgent === '1' ? 'María González' : 'Carlos Mendoza'}
                          <button
                            onClick={() => setFilterAgent('all')}
                            className="ml-1 hover:text-green-600"
                          >
                            ×
                          </button>
                        </span>
                      )}
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

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contador de resultados */}
        {!loading && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
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
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm">
                  <option value="newest">Más recientes</option>
                  <option value="oldest">Más antiguos</option>
                  <option value="popular">Más populares</option>
                  <option value="title">Título A-Z</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPropShots.map((shot) => (
              <div
                key={shot.id}
                className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedPropShot(shot);
                  handleViewPropShot(shot.id);
                }}
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-[9/16] bg-gray-100">
                  {shot.mediaUrl ? (
                    <video
                      src={getFullUrl(shot.mediaUrl)}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Información */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {shot.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {shot.description}
                  </p>

                  {/* Agente */}
                  {shot.agentFirstName && (
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {shot.agentFirstName} {shot.agentLastName}
                      </span>
                    </div>
                  )}

                  {/* Estadísticas */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikePropShot(shot.id);
                        }}
                        className="flex items-center gap-1 hover:text-orange-600 transition-colors"
                      >
                        <HeartIcon className="w-4 h-4" />
                        {shot.likes}
                      </button>
                      <div className="flex items-center gap-1">
                        <MessageIcon className="w-4 h-4" />
                        {shot.comments || 0}
                      </div>
                    </div>
                    <span className="text-xs">
                      {new Date(shot.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear PropShot */}
      <CreatePropShotModal
        isOpen={showCreatePropShot}
        onClose={() => setShowCreatePropShot(false)}
        onSubmit={handleCreatePropShot}
        creating={creatingPropShot}
      />

      {/* Modal de PropShot */}
      {selectedPropShot && (
        <>
          {console.log('🔍 PropShot seleccionado:', {
            id: selectedPropShot.id,
            title: selectedPropShot.title,
            link: selectedPropShot.linkUrl,
            mediaUrl: selectedPropShot.mediaUrl
          })}
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            {/* Botón cerrar */}
            <button
              onClick={() => setSelectedPropShot(null)}
              className="absolute top-6 right-6 text-white text-3xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
            >
              ✕
            </button>
            
            {/* Botón anterior */}
            <button
              onClick={() => {
                const currentIndex = propShots.findIndex(shot => shot.id === selectedPropShot?.id);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : propShots.length - 1;
                if (prevIndex >= 0 && prevIndex < propShots.length) {
                  setSelectedPropShot(propShots[prevIndex]);
                }
              }}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
            >
              ‹
            </button>
            
            {/* Botón siguiente */}
            <button
              onClick={() => {
                const currentIndex = propShots.findIndex(shot => shot.id === selectedPropShot?.id);
                const nextIndex = currentIndex < propShots.length - 1 ? currentIndex + 1 : 0;
                if (nextIndex >= 0 && nextIndex < propShots.length) {
                  setSelectedPropShot(propShots[nextIndex]);
                }
              }}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
            >
              ›
            </button>
            
            {/* Contenido del PropShot */}
            <div className="w-full h-full flex items-center justify-center px-20">
              {/* Video real con controles */}
              <div className="relative w-full max-w-lg aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl">
                {(() => {
                  const rawVideoUrl = selectedPropShot.mediaUrl;
                  const videoUrl = rawVideoUrl ? getFullUrl(rawVideoUrl) : '';
                  
                  console.log('🎬 Intentando reproducir video:', {
                    propShotId: selectedPropShot.id,
                    propShotTitle: selectedPropShot.title,
                    rawMediaUrl: selectedPropShot.mediaUrl,
                    rawUrl: rawVideoUrl,
                    fullUrl: videoUrl,
                    hasVideo: !!rawVideoUrl
                  });
                  
                  if (rawVideoUrl) {
                    return (
                      <video
                        src={videoUrl}
                        className="w-full h-full object-cover"
                        controls
                        autoPlay
                        muted
                        loop
                        preload="metadata"
                        onLoadStart={() => console.log('🚀 Iniciando carga del video:', videoUrl)}
                        onLoadedData={() => console.log('✅ Video cargado exitosamente:', videoUrl)}
                        onCanPlay={() => console.log('🎯 Video puede reproducirse:', videoUrl)}
                        onPlay={() => handleViewPropShot(selectedPropShot.id)}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLVideoElement;
                          
                          // Log del error de forma más segura
                          console.error('❌ Error cargando video');
                          console.error('URL original:', rawVideoUrl);
                          console.error('URL completa:', videoUrl);
                          console.error('URL del video:', target.src);
                          console.error('Estado del video:', target.readyState);
                          console.error('Estado de la red:', target.networkState);
                          if (target.error) {
                            console.error('Código de error:', target.error.code);
                            console.error('Mensaje de error:', target.error.message);
                          }
                          
                          // Mostrar mensaje de error más informativo
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'w-full h-full bg-red-500 flex items-center justify-center text-white text-center p-4';
                          errorDiv.innerHTML = `
                            <div>
                              <p class="font-bold mb-2">Error al cargar video</p>
                              <p class="text-sm mb-2">URL Original: ${rawVideoUrl}</p>
                              <p class="text-sm mb-2">URL Completa: ${videoUrl}</p>
                              <p class="text-sm mb-2">Estado: ${target.readyState === 0 ? 'No hay datos' : target.readyState === 1 ? 'Metadatos cargados' : target.readyState === 2 ? 'Datos actuales' : target.readyState === 3 ? 'Datos futuros' : target.readyState === 4 ? 'Datos suficientes' : 'Desconocido'}</p>
                              <p class="text-sm mb-2">Red: ${target.networkState === 0 ? 'Vacío' : target.networkState === 1 ? 'Idle' : target.networkState === 2 ? 'Cargando' : target.networkState === 3 ? 'Sin fuente' : 'Desconocido'}</p>
                              <p class="text-xs opacity-80 mt-3">Verifica que el archivo esté disponible en el servidor</p>
                              <button onclick="window.location.reload()" class="mt-3 px-4 py-2 bg-white text-red-500 rounded-lg hover:bg-gray-100 transition-colors">
                                Recargar página
                              </button>
                            </div>
                          `;
                          
                          // Reemplazar el video con el mensaje de error
                          target.style.display = 'none';
                          target.parentElement?.appendChild(errorDiv);
                        }}
                      />
                    );
                  } else {
                    return (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Play className="w-16 h-16 mx-auto mb-4" />
                          <p className="text-lg font-medium">Video no disponible</p>
                          <p className="text-sm opacity-80">Este PropShot no tiene video</p>
                          <p className="text-xs opacity-60 mt-2">
                            mediaUrl: {selectedPropShot.mediaUrl || 'null'}
                          </p>
                          <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg">
                            <p className="text-xs opacity-80">Debug info:</p>
                            <p className="text-xs opacity-60">ID: {selectedPropShot.id}</p>
                            <p className="text-xs opacity-60">Título: {selectedPropShot.title}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}
                
                {/* Indicador de PropShot */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-orange-500 text-white text-sm rounded-full font-bold shadow-lg">
                    PropShot
                  </span>
                </div>
                        
                {/* Duración del video */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 text-white text-sm px-3 py-1 rounded-lg font-medium">
                  0:30
                </div>

                {/* Información del PropShot SUPERPUESTA sobre el video */}
                <div className="absolute bottom-20 left-0 right-0 text-center text-white">
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{selectedPropShot.title}</h3>
                  <p className="text-lg text-gray-200 mb-3 drop-shadow-lg">por {selectedPropShot.agentFirstName} {selectedPropShot.agentLastName}</p>
                  
                  {/* Estadísticas */}
                  <div className="flex items-center justify-center space-x-6 text-sm">
                    <span className="flex items-center space-x-2 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                      <span>{selectedPropShot.shares || 0} vistas</span>
                    </span>
                    <span className="flex items-center space-x-2 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span>{selectedPropShot.likes} me gusta</span>
                    </span>
                  </div>
                </div>
                       
                {/* Botones de acción del lado derecho - estilo TikTok/Instagram */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-6">
                  {/* Botón Me gusta */}
                  <button 
                    onClick={() => {
                      handleLikePropShot(selectedPropShot.id);
                    }}
                    className="flex flex-col items-center space-y-1 group"
                  >
                    <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center group-hover:bg-opacity-70 transition-all duration-300">
                      <Heart className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded-full">
                      {selectedPropShot.likes}
                    </span>
                  </button>
                  
                  {/* Botón Contactar Asesor */}
                  <button
                    onClick={() => {
                      // Aquí iría la lógica para contactar al asesor
                      console.log('Contactar asesor:', selectedPropShot.agentFirstName + ' ' + selectedPropShot.agentLastName);
                      // Podría abrir un modal de contacto o redirigir a mensajes
                    }}
                    className="flex flex-col items-center space-y-1 group"
                  >
                    <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center group-hover:bg-opacity-70 transition-all duration-300">
                      <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded-full">
                      Contactar
                    </span>
                  </button>
                  
                  {/* Botón Compartir */}
                  <button
                    onClick={() => {
                      // Aquí iría la lógica para compartir
                      console.log('Compartir PropShot:', selectedPropShot.title);
                    }}
                    className="flex flex-col items-center space-y-1 group"
                  >
                    <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center group-hover:bg-opacity-70 transition-all duration-300">
                      <Share2 className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded-full">
                      Compartir
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
