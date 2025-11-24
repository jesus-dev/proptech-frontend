'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PropShot, PropShotService, PropShotComment } from '@/services/propShotService';
import { 
  Heart, 
  MessageCircle, 
  Share2,
  X,
  Volume2,
  VolumeX,
  Building2,
  User
} from 'lucide-react';

interface PropShotReelViewerProps {
  initialPropShot: PropShot;
  allPropShots: PropShot[];
  onLike: (id: number) => void;
  onView: (id: number) => void;
  onComment?: (id: number, content: string, userId: number, userName: string) => Promise<void>;
  getFullUrl: (url: string) => string;
  onClose?: () => void;
}

export default function PropShotReelViewer({
  initialPropShot,
  allPropShots,
  onLike,
  onView,
  onComment,
  getFullUrl,
  onClose
}: PropShotReelViewerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(
    allPropShots.findIndex(shot => shot.id === initialPropShot.id)
  );
  const [isMuted, setIsMuted] = useState(false); // Iniciar con sonido activado
  const videoRef = useRef<HTMLVideoElement>(null);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [showHelp, setShowHelp] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [comments, setComments] = useState<PropShotComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [currentPropShotState, setCurrentPropShotState] = useState<PropShot>(
    allPropShots.find(shot => shot.id === initialPropShot.id) || initialPropShot
  );
  
  const currentPropShot = currentPropShotState;

  // Ocultar ayuda después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => setShowHelp(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      // No cambiar URL - solo actualizar estado local
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < allPropShots.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      // No cambiar URL - solo actualizar estado local
    }
  }, [currentIndex, allPropShots.length]);


  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (videoRef.current) {
      videoRef.current.muted = newMutedState;
      // Si se desactiva el mute, intentar reproducir con sonido
      if (!newMutedState && videoRef.current.paused) {
        videoRef.current.play().catch((error) => {
          console.log('Error al reproducir con sonido:', error);
          // Si falla, volver a silenciar
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
          }
        });
      }
    }
  }, [isMuted]);

  // Navegación táctil mejorada para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;
    const absDiff = Math.abs(diff);
    
    // Solo procesar si el swipe es suficientemente grande (mínimo 80px para mobile)
    if (absDiff < 80) {
      setTouchStart(0);
      return;
    }
    
    // Swipe up (siguiente) - más sensible
    if (diff > 0) {
      handleNext();
    }
    // Swipe down (anterior) - más sensible
    else if (diff < -50) {
      handlePrevious();
    }
    
    setTouchStart(0);
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    const wasLiked = hasLiked;
    setIsLiking(true);
    setHasLiked(!hasLiked);
    
    // Actualizar estado local inmediatamente para mejor UX
    setCurrentPropShotState(prev => ({
      ...prev,
      likes: wasLiked ? prev.likes - 1 : prev.likes + 1
    }));
    
    try {
      await onLike(currentPropShot.id);
    } catch (error) {
      console.error('Error al dar like:', error);
      // Revertir si hay error
      setHasLiked(wasLiked);
      setCurrentPropShotState(prev => ({
        ...prev,
        likes: wasLiked ? prev.likes + 1 : prev.likes - 1
      }));
    } finally {
      setTimeout(() => setIsLiking(false), 300);
    }
  };

  const handleComments = async () => {
    setShowComments(true);
    await loadComments();
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const fetchedComments = await PropShotService.getComments(currentPropShot.id);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || sendingComment) return;
    
    if (!onComment) {
      console.warn('onComment handler not provided');
      return;
    }
    
    setSendingComment(true);
    const commentToSend = commentText.trim();
    setCommentText(''); // Limpiar inmediatamente para mejor UX
    
    try {
      // Obtener datos del usuario si existe
      const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userData ? JSON.parse(userData) : null;
      
      const userId = user?.id || 0;
      const userName = user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : 'Usuario Anónimo';
      
      await onComment(currentPropShot.id, commentToSend, userId, userName);
      
      // Actualizar contador de comentarios en el estado local
      setCurrentPropShotState(prev => ({
        ...prev,
        comments: (prev.comments || 0) + 1
      }));
      
      // Recargar comentarios para mostrar el nuevo
      await loadComments();
    } catch (error) {
      console.error('Error sending comment:', error);
      // Restaurar texto si hay error
      setCommentText(commentToSend);
      alert('Error al enviar el comentario');
    } finally {
      setSendingComment(false);
    }
  };

  const handleShareClick = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleShareOption = async (platform: string) => {
    const shareUrl = `${window.location.origin}/propshots/${currentPropShot.id}`;
    const text = `${currentPropShot.title} - ${currentPropShot.description}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert('¡Link copiado al portapapeles!');
        } catch (err) {
          console.error('Error al copiar:', err);
        }
        break;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: currentPropShot.title,
              text: currentPropShot.description,
              url: shareUrl
            });
          } catch (err) {
            console.log('Compartir cancelado');
          }
        }
        break;
    }
    
    setShowShareMenu(false);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Fallback: usar router para ir atrás
      router.back();
    }
  };

  // Actualizar estado cuando cambia el índice
  useEffect(() => {
    const newPropShot = allPropShots[currentIndex];
    if (newPropShot) {
      setCurrentPropShotState(newPropShot);
      // Verificar si ya se dio like (desde localStorage para usuarios anónimos)
      if (typeof window !== 'undefined') {
        const likedPropShots = JSON.parse(localStorage.getItem('likedPropShots') || '[]');
        setHasLiked(likedPropShots.includes(newPropShot.id));
      }
      // Cerrar comentarios al cambiar de video
      setShowComments(false);
    }
  }, [currentIndex, allPropShots]);

  // Sincronizar estado cuando allPropShots se actualiza (para reflejar cambios de likes/comentarios/vistas)
  useEffect(() => {
    const updatedPropShot = allPropShots.find(shot => shot.id === currentPropShotState.id);
    if (updatedPropShot) {
      setCurrentPropShotState(updatedPropShot);
    }
  }, [allPropShots, currentPropShotState.id]);

  // Reproducir video cuando cambie
  useEffect(() => {
    if (videoRef.current && currentPropShot.mediaUrl) {
      setVideoError(false);
      setVideoLoading(true);
      videoRef.current.currentTime = 0;
      videoRef.current.muted = isMuted; // Aplicar estado de mute
      videoRef.current.load();
      
      // Intentar reproducir con sonido
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Reproducción exitosa
            setVideoLoading(false);
            // Registrar vista cuando el video empieza a reproducirse
            onView(currentPropShot.id);
            // Actualizar contador de vistas localmente
            setCurrentPropShotState(prev => ({
              ...prev,
              views: (prev.views || 0) + 1
            }));
          })
          .catch((error) => {
            // Si el navegador bloquea autoplay con sonido, intentar silenciado
            if (error.name === 'NotAllowedError' && !isMuted) {
              console.log('Autoplay con sonido bloqueado, intentando silenciado...');
              if (videoRef.current) {
                videoRef.current.muted = true;
                setIsMuted(true);
                videoRef.current.play()
                  .then(() => {
                    setVideoLoading(false);
                    // Registrar vista cuando el video empieza a reproducirse
                    onView(currentPropShot.id);
                    // Actualizar contador de vistas localmente
                    setCurrentPropShotState(prev => ({
                      ...prev,
                      views: (prev.views || 0) + 1
                    }));
                  })
                  .catch(() => setVideoLoading(false));
              }
            } else {
              setVideoLoading(false);
            }
          });
      }
    }
  }, [currentIndex, currentPropShot.id, currentPropShot.mediaUrl, onView, isMuted]);

  // Prevenir scroll del body cuando el visualizador está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Cerrar menú de compartir al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showShareMenu) {
        const target = e.target as HTMLElement;
        if (!target.closest('.share-menu') && !target.closest('.share-button')) {
          setShowShareMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  // Navegación con teclado para web (Desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext, toggleMute]);

  const containerStyle = {
    touchAction: 'pan-y' as const, // Permitir scroll vertical pero prevenir zoom
    WebkitOverflowScrolling: 'touch' as const
  };

  return (
    <div 
      className="fixed inset-0 bg-black overflow-hidden select-none h-screen w-screen z-[100]"
      style={containerStyle}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Gradiente superior sutil */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent z-10 pointer-events-none" />
      
      {/* Gradiente inferior más pronunciado */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />
      {/* Header - Optimizado para mobile */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-3 sm:p-4">
        {/* Badge PropShot más elegante */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-xs sm:text-sm">PropShot</span>
        </div>
        
        {/* Contador más elegante */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full" />
          <span className="text-white/80 text-xs sm:text-sm font-medium">
            {currentIndex + 1}/{allPropShots.length}
          </span>
        </div>
        
        {/* Botón cerrar más elegante - Más grande en mobile */}
        <button
          onClick={handleClose}
          className="w-9 h-9 sm:w-8 sm:h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 active:bg-white/30 transition-all touch-manipulation"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
        </button>
      </div>

      {/* Ayuda de navegación para desktop - Se oculta después de 3 segundos */}
      {showHelp && (
        <div className="hidden md:block fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-black/80 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-lg shadow-lg">
            <p className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/20 rounded">↑↓</kbd>
              <kbd className="px-2 py-1 bg-white/20 rounded">←→</kbd>
              Navegar
              <span className="mx-2">•</span>
              <kbd className="px-2 py-1 bg-white/20 rounded">ESC</kbd>
              Salir
              <span className="mx-2">•</span>
              <kbd className="px-2 py-1 bg-white/20 rounded">M</kbd>
              Sonido
            </p>
          </div>
        </div>
      )}

      {/* Video - Estilo Reel vertical (9:16) - Optimizado para mobile */}
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        {currentPropShot.mediaUrl && !videoError ? (
          <div className="relative w-full h-full max-w-md mx-auto md:max-w-md">
            {/* Indicador de carga */}
            {videoLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-3"></div>
                  <p className="text-white text-xs sm:text-sm">Cargando video...</p>
                </div>
              </div>
            )}
            
            <video
              ref={videoRef}
              src={getFullUrl(currentPropShot.mediaUrl)}
              className="w-full h-full object-cover"
              style={{ 
                aspectRatio: '9/16',
                maxHeight: '100vh',
                maxWidth: '100vw'
              }}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              preload="auto"
              data-playsinline="true"
              data-webkit-playsinline="true"
              onClick={() => {
                if (videoRef.current) {
                  if (videoRef.current.paused) {
                    videoRef.current.play().catch(err => {
                      console.error('Error al reproducir video:', err);
                    });
                  } else {
                    videoRef.current.pause();
                  }
                }
              }}
              onError={(e) => {
                console.error('Error al cargar video:', e);
                setVideoError(true);
                setVideoLoading(false);
              }}
              onCanPlay={() => {
                setVideoLoading(false);
              }}
              onPlaying={() => {
                setVideoLoading(false);
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white">
            <div className="text-center px-4">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-10 h-10 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
              </div>
              <p className="text-xl font-semibold mb-2">Video no disponible</p>
              <p className="text-sm text-white/70 mb-4">
                {videoError 
                  ? 'Error al cargar el video. Intenta recargar la página.'
                  : 'El video no se pudo cargar'
                }
              </p>
              {videoError && (
                <button
                  onClick={() => {
                    setVideoError(false);
                    setVideoLoading(true);
                    if (videoRef.current) {
                      videoRef.current.load();
                    }
                  }}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium transition-colors"
                >
                  Reintentar
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controles de navegación - Estilo Reel */}
      {allPropShots.length > 1 && (
        <>
          {/* Flecha anterior - Más sutil */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="hidden md:flex fixed left-1/2 top-20 -translate-x-1/2 z-40 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full items-center justify-center hover:bg-white/20 transition-all group"
              title="Anterior (↑ o ←)"
            >
              <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
          
          {/* Flecha siguiente - Más sutil */}
          {currentIndex < allPropShots.length - 1 && (
            <button
              onClick={handleNext}
              className="hidden md:flex fixed left-1/2 bottom-32 -translate-x-1/2 z-40 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full items-center justify-center hover:bg-white/20 transition-all group"
              title="Siguiente (↓ o →)"
            >
              <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </>
      )}

      {/* Información overlay - Estilo Reel profesional - Optimizado para mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-3 sm:p-4 pb-20 sm:pb-8">
        <div className="max-w-sm pr-20 sm:pr-0">
          {/* Título más elegante */}
          <h2 className="text-white text-base sm:text-lg font-bold mb-1.5 sm:mb-2 leading-tight">
            {currentPropShot.title}
          </h2>
          
          {/* Descripción más elegante */}
          <p className="text-white/90 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-2">
            {currentPropShot.description}
          </p>
          
          {/* Agente con avatar */}
          {currentPropShot.agentFirstName && (
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] sm:text-xs font-bold">
                  {currentPropShot.agentFirstName[0]}{currentPropShot.agentLastName?.[0]}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium text-xs sm:text-sm truncate">
                  {currentPropShot.agentFirstName} {currentPropShot.agentLastName}
                </p>
                <p className="text-white/70 text-[10px] sm:text-xs">Agente inmobiliario</p>
              </div>
            </div>
          )}
          
          {/* Botón Ver más - Más llamativo - Optimizado para mobile */}
          {currentPropShot.linkUrl && (
            <a
              href={currentPropShot.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs sm:text-sm font-semibold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 touch-manipulation"
            >
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Ver propiedad completa</span>
              <span className="sm:hidden">Ver propiedad</span>
            </a>
          )}
        </div>
      </div>

      {/* Botones de acción - Estilo Reel profesional - Optimizado para mobile */}
      <div className="fixed right-2 sm:right-4 bottom-24 sm:bottom-32 z-40 flex flex-col items-center gap-4 sm:gap-5">
        {/* Like - Con animación - Más grande en mobile */}
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="flex flex-col items-center gap-1.5 sm:gap-2 group relative touch-manipulation active:scale-95"
        >
          <div className={`w-12 h-12 sm:w-14 sm:h-14 backdrop-blur-md rounded-full flex items-center justify-center transition-all ${
            hasLiked 
              ? 'bg-red-500/90 scale-110' 
              : 'bg-white/10 hover:bg-white/20 group-hover:scale-110 active:scale-95'
          }`}>
            <Heart 
              className={`w-6 h-6 sm:w-7 sm:h-7 transition-all ${
                hasLiked ? 'text-white fill-white animate-pulse' : 'text-white'
              }`} 
            />
          </div>
          <span className="text-white text-[10px] sm:text-xs font-bold drop-shadow-lg">
            {currentPropShotState.likes}
          </span>
        </button>

        {/* Comentarios - Con drawer - Más grande en mobile */}
        <button
          onClick={handleComments}
          className="flex flex-col items-center gap-1.5 sm:gap-2 group relative touch-manipulation active:scale-95"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all group-hover:scale-110 active:scale-95">
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-white text-[10px] sm:text-xs font-bold drop-shadow-lg">
            {currentPropShotState.comments || 0}
          </span>
        </button>

        {/* Compartir - Con menú - Más grande en mobile */}
        <div className="relative">
          <button
            onClick={handleShareClick}
            className="group share-button touch-manipulation active:scale-95"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all group-hover:scale-110 active:scale-95">
              <Share2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
          </button>

          {/* Menú de compartir - Mejorado para mobile */}
          {showShareMenu && (
            <div className="share-menu absolute right-14 sm:right-16 bottom-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-2 min-w-[180px] sm:min-w-[200px] animate-in slide-in-from-right">
              <button
                onClick={() => handleShareOption('whatsapp')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors touch-manipulation"
              >
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">WhatsApp</span>
              </button>
              
              <button
                onClick={() => handleShareOption('facebook')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors touch-manipulation"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Facebook</span>
              </button>
              
              <button
                onClick={() => handleShareOption('twitter')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors touch-manipulation"
              >
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Twitter</span>
              </button>
              
              <button
                onClick={() => handleShareOption('copy')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors touch-manipulation"
              >
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Copiar link</span>
              </button>
            </div>
          )}
        </div>

        {/* Mute - Más elegante - Más grande en mobile */}
        <button
          onClick={toggleMute}
          className="group touch-manipulation active:scale-95"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all group-hover:scale-110 active:scale-95">
            {isMuted ? (
              <VolumeX className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            )}
          </div>
        </button>
      </div>

      {/* Drawer de Comentarios - Optimizado para mobile */}
      {showComments && (
        <div className="fixed inset-0 z-[110]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm touch-none"
            onClick={() => setShowComments(false)}
          />
          
          {/* Drawer - Mejorado para mobile */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] sm:max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300 touch-pan-y">
            {/* Header - Optimizado para mobile */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Comentarios {currentPropShotState.comments ? `(${currentPropShotState.comments})` : ''}
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors touch-manipulation"
                aria-label="Cerrar comentarios"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Lista de comentarios */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingComments ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-center">
                    Aún no hay comentarios
                  </p>
                  <p className="text-sm text-gray-400 text-center mt-2">
                    Sé el primero en comentar este PropShot
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {comment.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-100 rounded-2xl px-4 py-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {comment.userName}
                          </p>
                          <p className="text-sm text-gray-800 mt-1 break-words">
                            {comment.content}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-4">
                          {new Date(comment.createdAt).toLocaleString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input de comentario - Optimizado para mobile */}
            <div className="border-t border-gray-200 p-3 sm:p-4 bg-white flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Agregar un comentario..."
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={sendingComment}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                />
                <button 
                  onClick={handleSendComment}
                  disabled={!commentText.trim() || sendingComment}
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs sm:text-sm font-semibold rounded-full hover:from-orange-600 hover:to-red-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  {sendingComment ? '...' : 'Enviar'}
                </button>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-2 ml-11 sm:ml-13">
                Presiona Enter para enviar
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
