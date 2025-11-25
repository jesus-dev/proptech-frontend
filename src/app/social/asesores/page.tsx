'use client';

import { useState, useEffect } from 'react';
import { Search, Phone, Mail, Star, Users, Award, TrendingUp } from 'lucide-react';
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

  // Filtrar asesores por especialidad y búsqueda
  const filteredAdvisors = advisors.filter(advisor => {
    const matchesSpecialty = selectedSpecialty === 'Todas' || advisor.specialties.includes(selectedSpecialty);
    const matchesSearch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         advisor.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecialty && matchesSearch;
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
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 overflow-hidden animate-pulse">
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 p-3 sm:p-6 pb-16 sm:pb-20">
                <div className="flex justify-center">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gray-400"></div>
                </div>
              </div>
              <div className="px-3 sm:px-6 -mt-10 sm:-mt-12 relative z-10">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-2 sm:p-4 border border-gray-100">
                  <div className="h-4 sm:h-6 bg-gray-300 rounded mb-1 sm:mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2 sm:mb-3"></div>
                  <div className="flex gap-1 sm:gap-2 justify-center">
                    <div className="h-5 sm:h-6 w-12 sm:w-16 bg-gray-200 rounded-full"></div>
                    <div className="h-5 sm:h-6 w-12 sm:w-16 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="px-3 sm:px-6 py-2 sm:py-4 space-y-1 sm:space-y-2">
                <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de Asesores - Mejorada */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {filteredAdvisors.map((advisor) => (
          <div key={advisor.id} className="group bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            {/* Header del card con gradiente */}
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6 pb-16 sm:pb-20">
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 sm:gap-1.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-full shadow-sm ${
                  advisor.available 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-400 text-white'
                }`}>
                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${advisor.available ? 'bg-white animate-pulse' : 'bg-gray-200'}`}></span>
                  <span>{advisor.available ? 'Disponible' : 'Ocupado'}</span>
                </span>
              </div>
              
              {/* Avatar centrado */}
              <div className="flex justify-center">
                <div className="relative">
                  {advisor.photo ? (
                    <img 
                      src={getFullPhotoUrl(advisor.photo)}
                      alt={advisor.name}
                      className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover shadow-lg ring-2 sm:ring-4 ring-white"
                      onError={(e) => {
                        // Fallback a avatar con iniciales si la imagen falla
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                          target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className = `w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl md:text-3xl font-bold shadow-lg ${
                            advisor.available ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`;
                          fallback.textContent = advisor.avatar;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className={`w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl md:text-3xl font-bold shadow-lg ${
                      advisor.available ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      {advisor.avatar}
                    </div>
                  )}
                  {advisor.rating >= 4.8 && (
                    <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full border-2 sm:border-3 border-white flex items-center justify-center shadow-md">
                      <Award className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información principal */}
            <div className="px-3 sm:px-6 -mt-10 sm:-mt-12 relative z-10">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-2 sm:p-4 border border-gray-100">
                <h3 className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 text-center mb-0.5 sm:mb-1 line-clamp-1">{advisor.name}</h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 text-center mb-1.5 sm:mb-2 line-clamp-1">{advisor.role}</p>
                
                {/* Rating y experiencia */}
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs sm:text-sm font-bold text-gray-900">{advisor.rating}</span>
                  </div>
                  <div className="w-px h-3 sm:h-4 bg-gray-300"></div>
                  <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-gray-600">
                    <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="truncate max-w-[60px] sm:max-w-none">{advisor.experience}</span>
                  </div>
                </div>

                {/* Especialidades */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center">
                  {advisor.specialties.slice(0, 2).map((specialty, index) => (
                    <span key={index} className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-blue-100 to-indigo-50 text-blue-700 text-[9px] sm:text-[10px] md:text-xs rounded-full font-medium border border-blue-200">
                      {specialty}
                    </span>
                  ))}
                  {advisor.specialties.length > 2 && (
                    <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-blue-100 to-indigo-50 text-blue-700 text-[9px] sm:text-[10px] md:text-xs rounded-full font-medium border border-blue-200">
                      +{advisor.specialties.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="px-3 sm:px-6 py-2 sm:py-4 space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-gray-600 group/phone hover:text-blue-600 transition-colors">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{advisor.phone}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-gray-600 group/email hover:text-blue-600 transition-colors">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{advisor.email}</span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button 
                  onClick={() => window.location.href = `tel:${advisor.phone}`}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs md:text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-1 sm:gap-2"
                >
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Llamar</span>
                  <span className="sm:hidden">📞</span>
                </button>
                <button 
                  onClick={() => window.location.href = `mailto:${advisor.email}`}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs md:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2"
                >
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Email</span>
                  <span className="sm:hidden">✉️</span>
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
