'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropShot } from '@/services/propShotService';
import { getEndpoint } from '@/lib/api-config';
import HlsVideo from './HlsVideo';
import { 
  Camera,
  Play,
  Heart as HeartIcon,
  MessageCircle as MessageIcon,
  Eye as EyeIcon,
  Building2,
  Pencil,
  MoreHorizontal,
  Link2,
  Trash2
} from 'lucide-react';

interface PropShotGridProps {
  propShots: PropShot[];
  loading?: boolean;
  onLike?: (propShotId: number) => void;
  onView?: (propShotId: number) => void;
  limit?: number; // Limitar número de PropShots mostrados (útil para dashboard)
  showEmptyState?: boolean;
  onPropShotClick?: (propShot: PropShot) => void; // Callback opcional para clicks
  /** Si se pasa, se muestra botón Editar en los reels del usuario (agentId === currentUserId) */
  currentUserId?: number;
  onEdit?: (shot: PropShot) => void;
  /** Si se pasa, se muestra opción Eliminar en el menú para el dueño */
  onDelete?: (shot: PropShot) => void;
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
  currentUserId,
  onEdit,
  onDelete,
  className = '',
  gridCols = {
    default: 2,
    sm: 2,
    md: 3,
    lg: 4
  }
}: PropShotGridProps) {
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Verificar si el usuario actual es dueño del PropShot
  // currentUserId puede ser el userId o el agentId, comparamos ambos
  const isOwnerOf = (shot: PropShot): boolean => {
    if (currentUserId == null || shot.agentId == null) return false;
    return Number(shot.agentId) === Number(currentUserId);
  };

  // Aplicar límite si se especifica
  const displayedPropShots = limit ? propShots.slice(0, limit) : propShots;

  // Función para obtener URL completa
  // Soporta videos HLS (.m3u8) y videos normales
  const getFullUrl = (url: string): string => {
    if (!url) return '';
    
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
    // Si solo es el nombre del archivo (sin ruta), intentar rutas comunes
    else if (!url.startsWith('/') && !url.includes('/')) {
      result = getEndpoint(`/uploads/inmo/${url}`);
    }
    // Para cualquier otra ruta relativa, usar getEndpoint
    else {
      result = getEndpoint(url.startsWith('/') ? url : `/${url}`);
    }
    
    console.log('🎬 [VIDEO-URL] Input:', url, '-> Output:', result);
    return result;
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
          className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
          onClick={() => handlePropShotClick(shot)}
        >
          {/* Thumbnail del video */}
          <div className="relative mb-3">
            {shot.mediaUrl ? (
              <div className="aspect-[9/16] rounded-xl overflow-hidden shadow-lg relative">
                <HlsVideo
                  src={getFullUrl(shot.mediaUrl)}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  onClick={(e) => {
                    // Al hacer click, abrir el reproductor completo con sonido
                    e.stopPropagation();
                    handleViewPropShot(shot.id);
                    handlePropShotClick(shot);
                  }}
                />
                
                {/* Overlay de información */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                
                {/* Indicador de PropShot */}
                <div className="absolute top-3 left-3 pointer-events-none">
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-bold shadow-lg">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                    <span>PropShots</span>
                  </div>
                </div>

                {/* Menú tres puntos (siempre visible) y lápiz (solo dueño) */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-auto z-10">
                  {isOwnerOf(shot) && onEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(shot);
                      }}
                      className="w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center shadow-lg text-white"
                      title="Editar reel"
                      aria-label="Editar reel"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === shot.id ? null : shot.id);
                    }}
                    className="w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center shadow-lg text-white"
                    title="Opciones"
                    aria-label="Opciones"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {openMenuId === shot.id && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 py-1 z-30">
                        {isOwnerOf(shot) && onEdit && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onEdit(shot); setOpenMenuId(null); }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Pencil className="w-4 h-4" /> Editar
                          </button>
                        )}
                        {isOwnerOf(shot) && onDelete && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDelete(shot); setOpenMenuId(null); }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Eliminar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(typeof window !== 'undefined' ? `${window.location.origin}/yvu/propshots?r=${shot.id}` : '');
                            setOpenMenuId(null);
                            if (typeof window !== 'undefined') alert('Enlace copiado');
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Link2 className="w-4 h-4" /> Copiar enlace
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Duración del video */}
                <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded-lg font-medium pointer-events-none">
                  0:30
                </div>
              </div>
            ) : (
              <div className="aspect-[9/16] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl overflow-hidden shadow-lg">
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-6 h-6 text-blue-500 ml-1" />
                  </div>
                </div>
                
                {/* Indicador de PropShot */}
                <div className="absolute top-3 left-3">
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white text-xs rounded-full font-bold shadow-lg">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                    <span>PropShots</span>
                  </div>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  {isOwnerOf(shot) && onEdit && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onEdit(shot); }}
                      className="w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg text-blue-600"
                      title="Editar reel"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === shot.id ? null : shot.id); }}
                    className="w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg text-gray-600"
                    title="Opciones"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {openMenuId === shot.id && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 py-1 z-30">
                        {isOwnerOf(shot) && onEdit && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(shot); setOpenMenuId(null); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                            <Pencil className="w-4 h-4" /> Editar
                          </button>
                        )}
                        {isOwnerOf(shot) && onDelete && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(shot); setOpenMenuId(null); }} className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Eliminar
                          </button>
                        )}
                        <button type="button" onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(typeof window !== 'undefined' ? `${window.location.origin}/yvu/propshots?r=${shot.id}` : ''); setOpenMenuId(null); if (typeof window !== 'undefined') alert('Enlace copiado'); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                          <Link2 className="w-4 h-4" /> Copiar enlace
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Duración del video */}
                <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded-lg font-medium">
                  0:30
                </div>
              </div>
            )}
          </div>
                    
          {/* Información del PropShot */}
          <div className="px-1">
            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
              {shot.title}
            </h4>
            <p className="text-gray-600 text-xs mb-2">
              {shot.agentFirstName} {shot.agentLastName}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{shot.views ?? 0}</span>
                </span>
                <span className="flex items-center gap-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  <span>{shot.shares || 0}</span>
                </span>
                <span className="flex items-center gap-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>{shot.likes}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

