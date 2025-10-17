'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PropShot, PropShotService, CreatePropShotRequest } from '@/services/propShotService';
import CreatePropShotModal from '@/components/social/CreatePropShotModal';
import PropShotGrid from '@/components/social/PropShotGrid';
import { 
  Camera,
  Search,
  Filter,
  Plus,
  XCircle
} from 'lucide-react';

export default function PropShotsPage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [propShots, setPropShots] = useState<PropShot[]>([]);
  const [filteredPropShots, setFilteredPropShots] = useState<PropShot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePropShot, setShowCreatePropShot] = useState(false);
  const [creatingPropShot, setCreatingPropShot] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterLikes, setFilterLikes] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

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
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para dar like');
      return;
    }
    
    try {
      await PropShotService.likePropShot(propShotId);
      
      // Actualizar el PropShot en la lista
      setPropShots(prev => prev.map(shot =>
        shot.id === propShotId
          ? { ...shot, likes: shot.likes + 1 }
          : shot
      ));
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

  // Ya no se requiere autenticación para ver PropShots
  // Solo se requiere para crear PropShots

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mejorado Responsive */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16">
            <h1 className="text-base sm:text-lg lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">PropShots</h1>
            {isAuthenticated ? (
              <button
                onClick={() => setShowCreatePropShot(true)}
                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 transition-all duration-300 text-xs sm:text-sm lg:text-base shadow-lg hover:shadow-xl hover:scale-105 group"
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
                  <Search className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar PropShots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 shadow-sm outline-none focus:outline-none focus:ring-2 focus:ring-orange-500/80 focus:border-transparent focus:shadow-md transition-all sm:text-base text-sm"
                />
              </div>
            </div>

            {/* Botón para mostrar/ocultar filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-300 outline-none focus:outline-none focus:ring-2 focus:ring-orange-500/60 font-medium shadow-sm group transition-all"
            >
              <Filter className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180 text-orange-600' : 'group-hover:text-orange-600 text-orange-500'}`} />
              <span className="text-sm">{showFilters ? 'Filtros' : 'Filtros'}</span>
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-orange-600 border border-orange-200 text-[10px] font-bold">
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
                <button onClick={clearAllFilters} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-orange-600">
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white/90 text-sm text-gray-800 focus:ring-2 focus:ring-orange-500/80 focus:border-transparent shadow-sm"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white/90 text-sm text-gray-800 focus:ring-2 focus:ring-orange-500/80 focus:border-transparent shadow-sm"
                  >
                    <option value="all">Todos los agentes</option>
                    <option value="1">👤 María González</option>
                    <option value="2">👤 Carlos Mendoza</option>
                  </select>
                </div>

                {/* Filtro de Fecha */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">Fecha</label>
                  <select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white/90 text-sm text-gray-800 focus:ring-2 focus:ring-orange-500/80 focus:border-transparent shadow-sm"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white/90 text-sm text-gray-800 focus:ring-2 focus:ring-orange-500/80 focus:border-transparent shadow-sm"
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
          <PropShotGrid
            propShots={filteredPropShots}
            loading={false}
            onLike={handleLikePropShot}
            onView={handleViewPropShot}
            showEmptyState={false}
            gridCols={{
              default: 2,
              sm: 2,
              md: 3,
              lg: 4
            }}
          />
        )}
      </div>

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
