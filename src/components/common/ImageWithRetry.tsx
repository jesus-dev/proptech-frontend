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
  maxRetries = 3,
  retryDelay = 2000,
  priority = false,
  onLoad,
  onError,
}: ImageWithRetryProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Actualizar src cuando cambie la prop
  useEffect(() => {
    setCurrentSrc(src);
    setRetryCount(0);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    // ⭐ AUTO-RETRY TRANSPARENTE
    if (retryCount < maxRetries) {
      console.log(`🔄 Imagen falló, reintentando (${retryCount + 1}/${maxRetries})...`);
      
      // Esperar y reintentar
      timeoutRef.current = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        // Forzar recarga agregando timestamp
        setCurrentSrc(`${src}?retry=${retryCount + 1}&t=${Date.now()}`);
      }, retryDelay);
    } else {
      // Ya agotó reintentos, mostrar placeholder
      console.warn('❌ Imagen no cargó después de', maxRetries, 'intentos');
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
    // Mostrar placeholder si falló definitivamente
    return (
      <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center`}>
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <>
      {/* Skeleton mientras carga */}
      {isLoading && (
        <div className={`${className} absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse`} />
      )}
      
      {/* Imagen real */}
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}  // ⭐ Prioridad alta = cargar YA
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}  // ⭐ Alta prioridad en red
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </>
  );
}

