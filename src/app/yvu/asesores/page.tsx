'use client';

import { useState, useEffect } from 'react';
import { Search, Phone, Mail, Star, Users, Heart, Building2, MapPin, Home, UserCheck } from 'lucide-react';
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
  slug?: string;
  propertiesCount?: number;
}

export default function AsesoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [advisors, setAdvisors] = useState<AdvisorDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [togglingFav, setTogglingFav] = useState<string | null>(null);

  useEffect(() => {
    AgentService.getFavoriteAgentIds().then(ids => setFavoriteIds(ids)).catch(() => {});
  }, []);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        const agents = await AgentService.getAllAgents();
        const displayAdvisors: AdvisorDisplay[] = agents.map(agent => ({
          id: String(agent.id),
          name: `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Agente',
          avatar: agent.firstName?.charAt(0)?.toUpperCase() || agent.lastName?.charAt(0)?.toUpperCase() || 'A',
          role: agent.position || 'Agente Inmobiliario',
          phone: agent.phone || '',
          email: agent.email || '',
          specialties: [agent.role || 'Inmobiliario'],
          rating: 4.5,
          experience: agent.agencyName || 'Independiente',
          available: !!(agent.active || agent.isActive),
          photo: agent.photo,
          slug: agent.slug,
          propertiesCount: agent.propertiesCount
        }));
        setAdvisors(displayAdvisors);
      } catch (error) {
        console.error('Error loading agents:', error);
        setAdvisors([]);
      } finally {
        setLoading(false);
      }
    };
    loadAgents();
  }, []);

  const getFullPhotoUrl = (photo: string | undefined): string => {
    if (!photo) return '';
    if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('blob:')) return photo;
    if (photo.startsWith('/uploads/') || photo.startsWith('/api/')) return getEndpoint(photo);
    if (!photo.startsWith('/') && !photo.includes('/')) return getEndpoint(`/uploads/inmo/${photo}`);
    return getEndpoint(photo.startsWith('/') ? photo : `/${photo}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, agentId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setTogglingFav(agentId);
    try {
      const result = await AgentService.toggleFavorite(agentId);
      if (result.isFavorite) {
        setFavoriteIds(prev => [...prev, Number(agentId)]);
      } else {
        setFavoriteIds(prev => prev.filter(id => id !== Number(agentId)));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setTogglingFav(null);
    }
  };

  const filteredAdvisors = advisors
    .filter(a => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q) || a.experience.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const af = favoriteIds.includes(Number(a.id)) ? 1 : 0;
      const bf = favoriteIds.includes(Number(b.id)) ? 1 : 0;
      return bf - af;
    });

  const isFav = (id: string) => favoriteIds.includes(Number(id));

  const avatarGradients = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-orange-500 to-red-500',
    'from-cyan-500 to-blue-600',
    'from-pink-500 to-rose-600',
    'from-amber-500 to-orange-600',
    'from-teal-500 to-emerald-600',
  ];

  return (
    <div className="py-4 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Asesores</h1>
          <span className="text-xs text-gray-400">
            {filteredAdvisors.length} resultado{filteredAdvisors.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar agentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Loading skeleton grid */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse shadow-sm">
              <div className="aspect-[4/3] bg-gray-100" />
              <div className="p-3">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1.5" />
                <div className="h-3 bg-gray-100 rounded w-20 mb-3" />
                <div className="h-8 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid de agentes */}
      {!loading && filteredAdvisors.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredAdvisors.map((advisor, idx) => {
            const fav = isFav(advisor.id);
            const gradient = avatarGradients[idx % avatarGradients.length];
            const photoUrl = getFullPhotoUrl(advisor.photo);

            return (
              <div
                key={advisor.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer group ${
                  fav ? 'border-blue-200 shadow-md shadow-blue-50/50' : 'border-gray-100 shadow-sm hover:border-gray-200'
                }`}
              >
                {/* Zona de imagen/avatar */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={advisor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback: ocultar img y mostrar el div de avatar
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = (e.target as HTMLImageElement).parentElement?.querySelector('[data-fallback]') as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Fallback avatar gradient */}
                  <div
                    data-fallback
                    className={`absolute inset-0 bg-gradient-to-br ${gradient} items-center justify-center`}
                    style={{ display: photoUrl ? 'none' : 'flex' }}
                  >
                    <span className="text-white text-4xl sm:text-5xl font-bold opacity-90">{advisor.avatar}</span>
                  </div>

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Badge disponible */}
                  {advisor.available && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500/90 text-white text-[10px] font-semibold rounded-full backdrop-blur-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Disponible
                    </span>
                  )}

                  {/* Corazón favorito */}
                  <button
                    onClick={(e) => handleToggleFavorite(e, advisor.id)}
                    disabled={togglingFav === advisor.id}
                    className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all ${
                      fav
                        ? 'bg-white/90 text-red-500 shadow-sm'
                        : 'bg-black/30 text-white/80 hover:bg-white/80 hover:text-red-500'
                    } ${togglingFav === advisor.id ? 'opacity-50 scale-90' : 'hover:scale-110'}`}
                  >
                    <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                  </button>

                  {/* Nombre sobre la imagen */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <h3 className="text-white text-sm font-bold truncate drop-shadow-md leading-tight">{advisor.name}</h3>
                    <p className="text-white/80 text-[11px] truncate drop-shadow-sm">{advisor.role}</p>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2.5">
                  {/* Empresa */}
                  <div className="flex items-center gap-1 mb-1.5">
                    <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-[11px] text-gray-500 truncate">{advisor.experience}</span>
                  </div>

                  {/* Rating + props */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(advisor.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                      ))}
                      <span className="text-[10px] text-gray-400 ml-0.5">{advisor.rating}</span>
                    </div>
                    {advisor.propertiesCount != null && advisor.propertiesCount > 0 && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded-full">
                        <Home className="w-3 h-3" /> {advisor.propertiesCount}
                      </span>
                    )}
                  </div>

                  {/* Botón Seguir */}
                  <button
                    onClick={(e) => handleToggleFavorite(e, advisor.id)}
                    disabled={togglingFav === advisor.id}
                    className={`w-full py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      fav
                        ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                    } ${togglingFav === advisor.id ? 'opacity-50' : ''}`}
                  >
                    {fav ? (
                      <><UserCheck className="w-3.5 h-3.5" /> Siguiendo</>
                    ) : (
                      <><Heart className="w-3.5 h-3.5" /> Seguir</>
                    )}
                  </button>

                  {/* Iconos contacto */}
                  <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-gray-50">
                    {advisor.phone && (
                      <a href={`tel:${advisor.phone}`} className="p-1.5 rounded-full text-gray-300 hover:text-green-600 hover:bg-green-50 transition-all" title={advisor.phone}>
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {advisor.email && (
                      <a href={`mailto:${advisor.email}`} className="p-1.5 rounded-full text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all" title={advisor.email}>
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {advisor.slug && (
                      <a href={`/agente/${advisor.slug}`} className="p-1.5 rounded-full text-gray-300 hover:text-purple-600 hover:bg-purple-50 transition-all" title="Ver perfil">
                        <MapPin className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sin resultados */}
      {!loading && filteredAdvisors.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">Sin resultados</h3>
          <p className="text-sm text-gray-500 mb-4">No se encontraron agentes para &quot;{searchTerm}&quot;</p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700"
          >
            Ver todos
          </button>
        </div>
      )}
    </div>
  );
}
