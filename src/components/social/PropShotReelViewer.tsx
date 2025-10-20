'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PropShot } from '@/services/propShotService';
import { 
  Heart, 
  MessageCircle, 
  Share2,
  X,
  Volume2,
  VolumeX,
  Building2
} from 'lucide-react';

interface PropShotReelViewerProps {
  initialPropShot: PropShot;
  allPropShots: PropShot[];
  onLike: (id: number) => void;
  onView: (id: number) => void;
  getFullUrl: (url: string) => string;
  onClose?: () => void;
}

export default function PropShotReelViewer({
  initialPropShot,
  allPropShots,
  onLike,
  onView,
  getFullUrl,
  onClose
}: PropShotReelViewerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(
    allPropShots.findIndex(shot => shot.id === initialPropShot.id)
  );
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [touchStart, setTouchStart] = useState<number>(0);
  
  const currentPropShot = allPropShots[currentIndex] || initialPropShot;

  // Reproducir video cuando cambie
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play()
    }
    
    onView(currentPropShot.id);
  }, [currentIndex, currentPropShot.id, onView]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      router.replace(`/propshots/${allPropShots[newIndex].id}`, { scroll: false });
    }
  }, [currentIndex, allPropShots, router]);

  const handleNext = useCallback(() => {
    if (currentIndex < allPropShots.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      router.replace(`/propshots/${allPropShots[newIndex].id}`, { scroll: false });
    }
  }, [currentIndex, allPropShots, router]);


  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  }, [isMuted]);

  // Navegación táctil simplificada
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;
    
    // Swipe up (siguiente)
    if (diff > 50) {
      handleNext();
    }
    // Swipe down (anterior)
    else if (diff < -50) {
      handlePrevious();
    }
    
    setTouchStart(0);
  };

  const handleLike = () => {
    onLike(currentPropShot.id);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/propshots/${currentPropShot.id}`;
    
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
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('¡Link copiado!');
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Fallback: usar router para ir atrás
      router.back();
    }
  };

  const containerStyle = {
    touchAction: 'none' as const
  };

  return (
    <div 
      className="fixed inset-0 bg-black overflow-hidden select-none h-screen"
      style={containerStyle}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Botón cerrar */}
      <button
        onClick={handleClose}
        className="fixed top-3 right-3 z-50 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-transform"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Badge PropShot */}
      <div className="fixed top-3 left-3 z-50">
        <span className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
          PropShot
        </span>
      </div>

      {/* Contador */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
        <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
          {currentIndex + 1} / {allPropShots.length}
        </span>
      </div>

      {/* Video - Pantalla completa */}
      <div className="absolute inset-0">
        {currentPropShot.mediaUrl ? (
          <video
            ref={videoRef}
            src={getFullUrl(currentPropShot.mediaUrl)}
            className="w-full h-full object-cover"
            autoPlay
            muted={isMuted}
            loop
            playsInline
            onClick={() => {
              if (videoRef.current) {
                if (videoRef.current.paused) {
                  videoRef.current.play();
                } else {
                  videoRef.current.pause();
                }
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <p>Video no disponible</p>
          </div>
        )}
      </div>

      {/* Información overlay - inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pb-safe">
        <div className="max-w-md">
          {/* Título */}
          <h2 className="text-white text-lg font-bold mb-2 line-clamp-2">
            {currentPropShot.title}
          </h2>
          
          {/* Descripción */}
          <p className="text-white/90 text-sm mb-3 line-clamp-2">
            {currentPropShot.description}
          </p>
          
          {/* Agente */}
          {currentPropShot.agentFirstName && (
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-white/80" />
              <span className="text-white/90 text-sm font-medium">
                {currentPropShot.agentFirstName} {currentPropShot.agentLastName}
              </span>
            </div>
          )}
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-white/90 text-xs">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {currentPropShot.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {currentPropShot.comments || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Botones de acción - lado derecho */}
      <div className="fixed right-3 bottom-32 z-40 flex flex-col items-center gap-4">
        {/* Like */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <div className="w-14 h-14 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-lg">
            {currentPropShot.likes}
          </span>
        </button>

        {/* Comentarios */}
        <button
          onClick={() => console.log('Comentarios')}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <div className="w-14 h-14 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-lg">
            {currentPropShot.comments || 0}
          </span>
        </button>

        {/* Compartir */}
        <button
          onClick={handleShare}
          className="active:scale-90 transition-transform"
        >
          <div className="w-14 h-14 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Share2 className="w-7 h-7 text-white" />
          </div>
        </button>

        {/* Mute */}
        <button
          onClick={toggleMute}
          className="active:scale-90 transition-transform"
        >
          <div className="w-14 h-14 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
            {isMuted ? (
              <VolumeX className="w-7 h-7 text-white" />
            ) : (
              <Volume2 className="w-7 h-7 text-white" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
