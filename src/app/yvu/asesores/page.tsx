'use client';

import { useState, useEffect } from 'react';
import { Search, Phone, Mail, Star, Users, Award, TrendingUp, Heart } from 'lucide-react';
import { AgentService, Agent } from '@/services/agentService';
import { getEndpoint } from '@/lib/api-config';

interface AdvisorDisplay {
  id: string;
  name: string;
  avatar: string;
  role: string;
  phone: string;
  email: string;
  specialties: string[];
  rating: number;
  experience: string;
  available: boolean;
  photo?: string;
}

export default function AsesoresPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [advisors, setAdvisors] = useState<AdvisorDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [togglingFav, setTogglingFav] = useState<string | null>(null);

  // Cargar favoritos desde BD al montar
  useEffect(() => {
    AgentService.getFavoriteAgentIds().then(ids => setFavoriteIds(ids));
  }, []);

  // Cargar agentes desde la BD
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        console.log('📥 Cargando agentes desde BD...');
        const agents = await AgentService.getAllAgents();
        console.log('📊 Agentes recibidos del servicio:', agents.length);
        console.log('📊 Detalle de agentes:', agents.map(a => ({
          id: a.id,
          firstName: a.firstName,
          lastName: a.lastName,
          nombre: (a as any).nombre,
          apellido: (a as any).apellido,
          active: a.active,
          isActive: a.isActive,
          email: a.email
        })));
        
        // Convertir agentes de BD al formato de display
        // El servicio ya normaliza los campos (español -> inglés)
        // El backend ya filtra por activos, así que mostramos todos los que vienen
        const displayAdvisors: AdvisorDisplay[] = agents
          .map(agent => {
            console.log(`🔍 Procesando agente ${agent.id}:`, {
              firstName: agent.firstName,
              lastName: agent.lastName,
              active: agent.active,
              isActive: agent.isActive,
              email: agent.email
            });
            return {
            id: String(agent.id),
            name: `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Agente',
            avatar: agent.firstName?.charAt(0) || agent.lastName?.charAt(0) || 'A',
            role: agent.position || 'Agente Inmobiliario',
            phone: agent.phone || 'No disponible',
            email: agent.email || 'No disponible',
            specialties: [agent.role || 'General'],
            rating: 4.5, // Por ahora estático, se puede agregar rating real después
            experience: agent.agencyName ? `en ${agent.agencyName}` : 'Independiente',
            available: !!(agent.active || agent.isActive),
            photo: agent.photo
            };
          });

        setAdvisors(displayAdvisors);
        console.log(`✅ ${displayAdvisors.length} agentes activos cargados`);
      } catch (error) {
        console.error('Error loading agents:', error);
        setAdvisors([]);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []); // Solo cargar al montar el componente

  // Función para obtener URL completa de la foto del agente
  const getFullPhotoUrl = (photo: string | undefined): string => {
    if (!photo) return '';
    
    // Si ya es una URL completa, retornarla
    if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('blob:')) {
      return photo;
    }
    
    // Si es una URL relativa del backend (como /uploads/...), usar getEndpoint
    if (photo.startsWith('/uploads/')) {
      return getEndpoint(photo);
    }
    
    // Si es una URL de API, usar getEndpoint
    if (photo.startsWith('/api/')) {
      return getEndpoint(photo);
    }
    
    // Si solo es el nombre del archivo (sin ruta), intentar rutas comunes
    if (!photo.startsWith('/') && !photo.includes('/')) {
      // Intentar primero con /uploads/inmo/ (fotos de agentes)
      return getEndpoint(`/uploads/inmo/${photo}`);
    }
    
    // Para cualquier otra ruta relativa, usar getEndpoint
    return getEndpoint(photo.startsWith('/') ? photo : `/${photo}`);
  };

  // Toggle favorito en BD
  const handleToggleFavorite = async (agentId: string) => {
    setTogglingFav(agentId);
    try {
      const result = await AgentService.toggleFavorite(agentId);
      if (result.isFavorite) {
        setFavoriteIds(prev => [...prev, Number(agentId)]);
      } else {
        setFavoriteIds(prev => prev.filter(id => id !== Number(agentId)));
      }
    } catch (error) {
      console.error('Error al toggle favorito:', error);
    } finally {
      setTogglingFav(null);
    }
  };

  // Filtrar asesores por especialidad y búsqueda, favoritos primero
  const filteredAdvisors = advisors
    .filter(advisor => {
      const matchesSpecialty = selectedSpecialty === 'Todas' || advisor.specialties.includes(selectedSpecialty);
      const matchesSearch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           advisor.role.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSpecialty && matchesSearch;
    })
    .sort((a, b) => {
      const aFav = favoriteIds.includes(Number(a.id)) ? 1 : 0;
      const bFav = favoriteIds.includes(Number(b.id)) ? 1 : 0;
      return bFav - aFav; // Favoritos primero
    });

  // Obtener especialidades únicas
  const allSpecialties = Array.from(new Set(advisors.flatMap(advisor => advisor.specialties)));

  return (
    <>
      {/* Header de la página - Mejorado */}
      <div className="relative mb-6 sm:mb-8">
        <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-50 rounded-2xl p-6 sm:p-8 shadow-sm border border-blue-200">
          <div className="flex items-center justify-center mb-3">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-full flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <Award className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2 sm:mb-3">
            Nuestros Agentes Inmobiliarios
          </h1>
          <p className="text-sm sm:text-base text-gray-700 text-center max-w-2xl mx-auto leading-relaxed">
            Conecta con profesionales certificados para encontrar tu propiedad ideal o maximizar tus inversiones
          </p>
        </div>
      </div>

      {/* Filtros y Búsqueda - Mejorado */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Buscar por nombre o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base bg-white/80 backdrop-blur-sm outline-none"
              />
            </div>
          </div>

          {/* Filtro de especialidad */}
          <div className="md:w-56">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base bg-white outline-none cursor-pointer"
            >
              <option value="Todas">✨ Todas las especialidades</option>
              {allSpecialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Contador de resultados */}
        {(searchTerm || selectedSpecialty !== 'Todas') && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600">
              <span className="font-semibold text-blue-600">{filteredAdvisors.length}</span> {filteredAdvisors.length === 1 ? 'agente encontrado' : 'agentes encontrados'}
            </p>
          </div>
        )}
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 overflow-hidden animate-pulse">
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 p-3 sm:p-5 md:p-6 pb-12 sm:pb-16 md:pb-20">
                <div className="flex justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gray-400"></div>
                </div>
              </div>
              <div className="px-2 sm:px-4 md:px-6 -mt-8 sm:-mt-10 md:-mt-12 relative z-10">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-2 sm:p-4 md:p-6 border border-gray-100">
                  <div className="h-3 sm:h-4 md:h-6 bg-gray-300 rounded mb-1 sm:mb-2"></div>
                  <div className="h-2 sm:h-3 md:h-4 bg-gray-200 rounded mb-2 sm:mb-3"></div>
                  <div className="flex gap-1 sm:gap-1.5 md:gap-2 justify-center">
                    <div className="h-4 sm:h-5 md:h-6 w-8 sm:w-12 md:w-16 bg-gray-200 rounded-full"></div>
                    <div className="h-4 sm:h-5 md:h-6 w-8 sm:w-12 md:w-16 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 space-y-1 sm:space-y-2">
                <div className="h-2 sm:h-3 md:h-4 bg-gray-200 rounded"></div>
                <div className="h-2 sm:h-3 md:h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de Asesores - Mejorada */}
      {!loading && (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6">
          {filteredAdvisors.map((advisor) => (
          <div key={advisor.id} className={`group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl border-2 overflow-hidden hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 ${
            favoriteIds.includes(Number(advisor.id))
              ? 'border-red-300 dark:border-red-500 ring-1 ring-red-200 dark:ring-red-800'
              : 'border-gray-200 dark:border-gray-700'
          }`}>
            {/* Header del card con gradiente mejorado */}
            <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-3 sm:p-5 md:p-8 pb-16 sm:pb-20 md:pb-24 overflow-hidden">
              {/* Patrón decorativo de fondo mejorado */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full blur-xl"></div>
              </div>
              
              {/* Botón de favorito (corazón) */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(advisor.id); }}
                disabled={togglingFav === advisor.id}
                className={`absolute top-2 left-2 sm:top-3 sm:left-3 md:top-5 md:left-5 z-10 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                  favoriteIds.includes(Number(advisor.id))
                    ? 'bg-red-500 hover:bg-red-600 text-white scale-110'
                    : 'bg-white/80 hover:bg-white text-gray-500 hover:text-red-500'
                } ${togglingFav === advisor.id ? 'opacity-50 animate-pulse' : ''}`}
                title={favoriteIds.includes(Number(advisor.id)) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${favoriteIds.includes(Number(advisor.id)) ? 'fill-current' : ''}`} />
              </button>

              {/* Badge de disponibilidad mejorado */}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-5 md:right-5 z-10">
                <span className={`inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[9px] sm:text-[10px] md:text-xs font-bold rounded-full shadow-2xl backdrop-blur-md border-2 ${
                  advisor.available 
                    ? 'bg-green-500/95 text-white border-green-300' 
                    : 'bg-gray-500/95 text-white border-gray-300'
                }`}>
                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full ${advisor.available ? 'bg-white animate-pulse shadow-lg' : 'bg-gray-200'}`}></span>
                  <span className="hidden sm:inline">{advisor.available ? 'Disponible' : 'Ocupado'}</span>
                  <span className="sm:hidden">{advisor.available ? 'Disp' : 'Ocup'}</span>
                </span>
              </div>
              
              {/* Avatar centrado con mejor diseño */}
              <div className="flex justify-center relative z-10 mt-1 sm:mt-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  {advisor.photo ? (
                    <img 
                      src={getFullPhotoUrl(advisor.photo)}
                      alt={advisor.name}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full object-cover shadow-2xl ring-2 sm:ring-3 md:ring-4 ring-white/60 group-hover:ring-white/90 transition-all duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                          target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className = `relative w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center text-white text-base sm:text-xl md:text-2xl lg:text-3xl font-bold shadow-2xl ring-2 sm:ring-3 md:ring-4 ring-white/60 ${
                            advisor.available ? 'bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`;
                          fallback.textContent = advisor.avatar;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center text-white text-base sm:text-xl md:text-2xl lg:text-3xl font-bold shadow-2xl ring-2 sm:ring-3 md:ring-4 ring-white/60 ${
                      advisor.available ? 'bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      {advisor.avatar}
                    </div>
                  )}
                  {/* Badge de premio mejorado */}
                  {advisor.rating >= 4.8 && (
                    <div className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 md:-bottom-2 md:-right-2 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full border-2 sm:border-3 md:border-4 border-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <Award className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información principal mejorada */}
            <div className="px-2 sm:px-4 md:px-6 -mt-10 sm:-mt-12 md:-mt-16 relative z-10">
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-2 sm:p-4 md:p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl font-extrabold text-gray-900 dark:text-white text-center mb-1 sm:mb-2 line-clamp-1 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {advisor.name}
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 text-center mb-2 sm:mb-3 md:mb-5 line-clamp-1">{advisor.role}</p>
                
                {/* Rating y experiencia mejorados */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-5 mb-2 sm:mb-3 md:mb-5 pb-2 sm:pb-3 md:pb-5 border-b-2 border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 ${
                            i < Math.floor(advisor.rating) 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : i < advisor.rating 
                                ? 'text-yellow-400 fill-yellow-400 opacity-50' 
                                : 'text-gray-300 dark:text-gray-600'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-[9px] sm:text-[10px] md:text-sm font-bold text-gray-900 dark:text-white">{advisor.rating}</span>
                  </div>
                  <div className="w-px h-4 sm:h-6 md:h-8 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700"></div>
                  <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-gray-600 dark:text-gray-400 text-center max-w-[60px] sm:max-w-[80px] md:max-w-[120px] truncate">{advisor.experience}</span>
                  </div>
                </div>

                {/* Especialidades mejoradas */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 justify-center">
                  {advisor.specialties.slice(0, 2).map((specialty, index) => (
                    <span key={index} className="px-1.5 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-[8px] sm:text-[9px] md:text-xs rounded-lg sm:rounded-xl font-semibold border-2 border-blue-200 dark:border-blue-700 shadow-sm">
                      {specialty}
                    </span>
                  ))}
                  {advisor.specialties.length > 2 && (
                    <span className="px-1.5 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 text-[8px] sm:text-[9px] md:text-xs rounded-lg sm:rounded-xl font-semibold border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                      +{advisor.specialties.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Información de contacto mejorada */}
            <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-5 space-y-1.5 sm:space-y-2 md:space-y-3 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-900/10">
              <a 
                href={`tel:${advisor.phone}`}
                className="flex items-center gap-2 sm:gap-3 md:gap-4 p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-300 group/contact"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center group-hover/contact:from-blue-200 group-hover/contact:to-blue-300 dark:group-hover/contact:from-blue-800/60 dark:group-hover/contact:to-blue-700/60 transition-all duration-300 shadow-sm flex-shrink-0">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">Teléfono</p>
                  <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 dark:text-white truncate">{advisor.phone}</p>
                </div>
              </a>
              <a 
                href={`mailto:${advisor.email}`}
                className="flex items-center gap-2 sm:gap-3 md:gap-4 p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg transition-all duration-300 group/contact"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 flex items-center justify-center group-hover/contact:from-indigo-200 group-hover/contact:to-indigo-300 dark:group-hover/contact:from-indigo-800/60 dark:group-hover/contact:to-indigo-700/60 transition-all duration-300 shadow-sm flex-shrink-0">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">Email</p>
                  <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 dark:text-white truncate">{advisor.email}</p>
                </div>
              </a>
            </div>

            {/* Botones de acción mejorados */}
            <div className="px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6 pt-2 sm:pt-3 md:pt-4 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                <button 
                  onClick={() => window.location.href = `tel:${advisor.phone}`}
                  className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white px-2 sm:px-3 md:px-5 py-1.5 sm:py-2 md:py-3.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] md:text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2"
                >
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">Llamar</span>
                </button>
                <button 
                  onClick={() => window.location.href = `mailto:${advisor.email}`}
                  className="flex-1 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 sm:px-3 md:px-5 py-1.5 sm:py-2 md:py-3.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 shadow-sm hover:shadow-md"
                >
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">Email</span>
                </button>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* Mensaje si no hay resultados - Mejorado */}
      {!loading && filteredAdvisors.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <Search className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No se encontraron agentes</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
            Intenta ajustar los filtros o términos de búsqueda para encontrar el agente perfecto.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialty('Todas');
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          >
            <Users className="w-4 h-4" />
            Ver todos los agentes
          </button>
        </div>
      )}
    </>
  );
}
