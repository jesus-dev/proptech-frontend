'use client';

import { useState, useEffect, useRef } from 'react';

interface ImageWithRetryProps {
  src: string;
  alt: string;
  className?: string;
  maxRetries?: number;
  retryDelay?: number;
  priority?: boolean;  // ⭐ Para primeras imágenes visibles
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componente de imagen con auto-retry transparente
 * Si la imagen falla, reintenta automáticamente en background
 */
export default function ImageWithRetry({
  src,
  alt,
  className = '',
  maxRetries = 2,          // ⭐ Solo 2 reintentos (más rápido)
  retryDelay = 500,        // ⭐ 500ms entre reintentos
  priority = false,
  onLoad,
  onError,
}: ImageWithRetryProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const loadTimeoutRef = useRef<NodeJS.Timeout>(); // ⭐ Timeout de carga

  // Actualizar src cuando cambie la prop
  useEffect(() => {
    console.log('🖼️ Iniciando carga de imagen:', src);
    setCurrentSrc(src);
    setRetryCount(0);
    setHasError(false);
    setIsLoading(true);
    
    // ⭐ TIMEOUT: Si después de 5 segundos NO cargó, marcar como error
    loadTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.error('⏱️ TIMEOUT (5s) - Imagen NO cargó:', src);
        setHasError(true);
        setIsLoading(false);
      }
    }, 5000);
    
    return () => {
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    };
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    console.log('✅ Imagen cargada OK:', src);
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    console.error(`❌ Imagen ERROR (${retryCount + 1}/${maxRetries + 1}):`, src);
    
    // ⭐ AUTO-RETRY
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      
      // Reintentar con timestamp para forzar reload
      const newUrl = `${src}${src.includes('?') ? '&' : '?'}retry=${retryCount + 1}`;
      console.log(`🔄 Reintentando con:`, newUrl);
      
      setTimeout(() => {
        setCurrentSrc(newUrl);
        setIsLoading(true);  // ⭐ Volver a loading
      }, 1000);
    } else {
      // Agotó reintentos
      console.error('💀 DEFINITIVO: Imagen no carga:', src);
      setHasError(true);
      setIsLoading(false);
      onError?.();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (hasError) {
    // ⭐ Placeholder BONITO con icono de casa (no gris feo)
    return (
      <div className={`${className} bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden`}>
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
        </div>
        
        {/* Icono de casa con gradiente */}
        <div className="relative z-10">
          <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Skeleton mientras carga */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse z-10" />
      )}
      
      {/* Imagen real - SIEMPRE renderizada */}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

