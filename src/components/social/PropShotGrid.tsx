'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PropShot } from '@/services/propShotService';
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

  // Función para obtener URL completa
  const getFullUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http')) {
      return url;
    }
    
    // Manejar URLs incorrectas de PropShots
    if (url.includes('/api/prop-shots/media/')) {
      const filename = url.split('/').pop();
      url = `/uploads/prop-shots/media/${filename}`;
    }
    
    // Construir URL completa para el backend
    const fullUrl = `http://localhost:8080${url.startsWith('/') ? url : `/${url}`}`;
    return fullUrl;
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
          className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => handlePropShotClick(shot)}
        >
          {/* Video Thumbnail */}
          <div className="relative aspect-[9/16] bg-gray-100 rounded-t-2xl overflow-hidden">
            {shot.mediaUrl ? (
              <div className="relative w-full h-full">
                {/* Primera frame del video como thumbnail */}
                <video
                  src={getFullUrl(shot.mediaUrl)}
                  className="w-full h-full object-cover"
                  preload="metadata"
                  muted
                  playsInline
                />
                
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-400 rounded-full blur-xl opacity-30"></div>
                  <Camera className="relative w-16 h-16 text-orange-500" />
                </div>
              </div>
            )}
          </div>

          {/* Información */}
          <div className="p-2 sm:p-3 lg:p-4">
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2 text-xs sm:text-sm lg:text-base">
              {shot.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 hidden sm:block">
              {shot.description}
            </p>

            {/* Agente */}
            {shot.agentFirstName && (
              <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-600 truncate">
                  {shot.agentFirstName} {shot.agentLastName}
                </span>
              </div>
            )}

            {/* Estadísticas */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikePropShot(shot.id);
                  }}
                  className="flex items-center gap-1 hover:text-orange-600 transition-all duration-300 group/like hover:scale-110"
                >
                  <div className="relative">
                    <HeartIcon className="w-4 h-4 group-hover/like:fill-orange-600 transition-all duration-300" />
                    <div className="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-0 group-hover/like:opacity-50 transition-opacity duration-300"></div>
                  </div>
                  <span className="font-semibold">{shot.likes}</span>
                </button>
                <div className="flex items-center gap-1 group/comment">
                  <MessageIcon className="w-4 h-4 group-hover/comment:text-blue-500 transition-colors duration-300" />
                  <span className="font-semibold">{shot.comments || 0}</span>
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(shot.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

