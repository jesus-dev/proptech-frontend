'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PropShot } from '@/services/propShotService';
import { getEndpoint } from '@/lib/api-config';
import { 
  Camera,
  Play,
  Heart as HeartIcon,
  MessageCircle as MessageIcon,
  Building2
} from 'lucide-react';

interface PropShotGridProps {
  propShots: PropShot[];
  loading?: boolean;
  onLike?: (propShotId: number) => void;
  onView?: (propShotId: number) => void;
  limit?: number; // Limitar número de PropShots mostrados (útil para dashboard)
  showEmptyState?: boolean;
  onPropShotClick?: (propShot: PropShot) => void; // Callback opcional para clicks
  className?: string;
  gridCols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

/**
 * Componente reutilizable para mostrar un grid de PropShots
 * Puede ser usado en el dashboard, página de social, etc.
 */
export default function PropShotGrid({
  propShots,
  loading = false,
  onLike,
  onView,
  limit,
  showEmptyState = true,
  onPropShotClick,
  className = '',
  gridCols = {
    default: 2,
    sm: 2,
    md: 3,
    lg: 4
  }
}: PropShotGridProps) {
  const router = useRouter();

  // Aplicar límite si se especifica
  const displayedPropShots = limit ? propShots.slice(0, limit) : propShots;

  // Función para obtener URL completa - usando getEndpoint como en otros componentes
  const getFullUrl = (url: string): string => {
    if (!url) return '';
    
    // Si ya es una URL completa, retornarla
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    
    // Manejar URLs incorrectas de PropShots
    if (url.includes('/api/prop-shots/media/')) {
      const filename = url.split('/').pop();
      url = `/uploads/prop-shots/media/${filename}`;
    }
    
    // Si es una URL relativa del backend (como /uploads/...), usar getEndpoint
    if (url.startsWith('/uploads/')) {
      return getEndpoint(url);
    }
    
    // Si es una URL de API, usar getEndpoint
    if (url.startsWith('/api/')) {
      return getEndpoint(url);
    }
    
    // Si solo es el nombre del archivo (sin ruta), intentar rutas comunes
    if (!url.startsWith('/') && !url.includes('/')) {
      // Intentar primero con /uploads/inmo/ (fotos de agentes)
      return getEndpoint(`/uploads/inmo/${url}`);
    }
    
    // Para cualquier otra ruta relativa, usar getEndpoint
    return getEndpoint(url.startsWith('/') ? url : `/${url}`);
  };

  // Manejar like
  const handleLikePropShot = async (propShotId: number) => {
    if (onLike) {
      onLike(propShotId);
    }
  };

  // Manejar visualización
  const handleViewPropShot = async (propShotId: number) => {
    if (onView) {
      onView(propShotId);
    }
  };

  // Manejar click en PropShot
  const handlePropShotClick = (shot: PropShot) => {
    if (onPropShotClick) {
      onPropShotClick(shot);
    } else {
      // Comportamiento por defecto: navegar a página de reel (fuera del layout social)
      handleViewPropShot(shot.id);
      router.push(`/propshots/${shot.id}`);
    }
  };

  // Construir clases de grid
  const gridClasses = `grid gap-3 sm:gap-4 lg:gap-6 ${className}`;
  const colsClasses = `grid-cols-${gridCols.default || 2} sm:grid-cols-${gridCols.sm || 2} md:grid-cols-${gridCols.md || 3} lg:grid-cols-${gridCols.lg || 4}`;

  if (loading) {
    return (
      <div className={`${gridClasses} ${colsClasses}`}>
        {Array.from({ length: limit || 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[9/16] bg-gray-200 rounded-2xl mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (displayedPropShots.length === 0 && showEmptyState) {
    return (
      <div className="col-span-full text-center py-12">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-full">
            <Camera className="w-12 h-12 text-white" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No hay PropShots disponibles</p>
      </div>
    );
  }

  return (
    <div className={`${gridClasses} ${colsClasses}`}>
      {displayedPropShots.map((shot) => (
        <div
          key={shot.id}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group"
          onClick={() => handlePropShotClick(shot)}
        >
          {/* Video Thumbnail */}
          <div className="relative aspect-[9/16] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            {shot.mediaUrl ? (
              <div className="relative w-full h-full">
                {/* Video thumbnail */}
                <video
                  src={getFullUrl(shot.mediaUrl)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onLoadedData={(e) => {
                    const videoElement = e.currentTarget;
                    // Asegurar que se reproduzca silenciado en preview
                    videoElement.muted = true;
                    videoElement.play().catch(() => {
                      // Ignorar errores de autoplay
                    });
                  }}
                />
                
                {/* Gradient overlay superior */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/40 to-transparent" />
                
                {/* Badge de estado (si existe) */}
                {shot.status && shot.status !== 'active' && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
                      shot.status === 'pending' 
                        ? 'bg-yellow-500/90 text-white' 
                        : 'bg-gray-500/90 text-white'
                    }`}>
                      {shot.status === 'pending' ? '⏳ Pendiente' : '📁 Archivado'}
                    </span>
                  </div>
                )}
                
                {/* Play button overlay - Mejorado */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                    {/* Button */}
                    <div className="relative w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                      <Play className="w-10 h-10 text-white ml-1" fill="white" />
                    </div>
                    {/* Pulse rings */}
                    <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-ping"></div>
                  </div>
                </div>
                
                {/* Estadísticas en overlay inferior */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <HeartIcon className="w-4 h-4 fill-white" />
                        <span className="text-sm font-bold">{shot.likes}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageIcon className="w-4 h-4" />
                        <span className="text-sm font-bold">{shot.comments || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 via-orange-50 to-red-100">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-full shadow-xl">
                    <Camera className="w-12 h-12 text-orange-500" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Información - Mejorada */}
          <div className="p-4 sm:p-5 bg-white">
            {/* Título */}
            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base group-hover:text-orange-600 transition-colors duration-300">
              {shot.title}
            </h3>
            
            {/* Descripción */}
            <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
              {shot.description}
            </p>

            {/* Agente - Mejorado */}
            {shot.agentFirstName && (
              <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                {shot.agentPhoto ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-md ring-2 ring-white relative">
                    <img
                      src={getFullUrl(shot.agentPhoto)}
                      alt={`${shot.agentFirstName} ${shot.agentLastName || ''}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback a avatar con iniciales si la imagen falla
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent && shot.agentFirstName) {
                          target.style.display = 'none';
                          const firstInitial = shot.agentFirstName.trim()[0] || '';
                          const lastInitial = shot.agentLastName?.trim()[0] || '';
                          // Crear elemento de fallback
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center';
                          fallback.innerHTML = `<span class="text-white text-xs font-bold">${firstInitial}${lastInitial}</span>`;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white text-xs font-bold">
                      {shot.agentFirstName.trim()[0] || ''}{shot.agentLastName?.trim()[0] || ''}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                    {shot.agentFirstName.trim()} {shot.agentLastName?.trim() || ''}
                  </p>
                  <p className="text-xs text-gray-500">Agente inmobiliario</p>
                </div>
                <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            )}

            {/* Estadísticas - Mejoradas */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikePropShot(shot.id);
                  }}
                  className="flex items-center gap-1.5 hover:text-orange-600 transition-all duration-300 group/like hover:scale-110"
                >
                  <div className="relative">
                    <HeartIcon className="w-5 h-5 group-hover/like:fill-orange-600 transition-all duration-300" />
                    <div className="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-0 group-hover/like:opacity-50 transition-opacity duration-300"></div>
                  </div>
                  <span className="font-bold text-sm">{shot.likes}</span>
                </button>
                <div className="flex items-center gap-1.5 group/comment hover:text-blue-600 transition-colors duration-300">
                  <MessageIcon className="w-5 h-5" />
                  <span className="font-bold text-sm">{shot.comments || 0}</span>
                </div>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {new Date(shot.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

