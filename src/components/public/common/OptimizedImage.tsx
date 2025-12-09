"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { getImageBaseUrl } from '@/config/environment';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * Componente de imagen optimizada con fallback automático
 * Maneja errores, placeholders y optimización automática
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fill = false,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  quality = 75,
  onLoad,
  onError,
  objectFit = 'cover',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Memoizar la URL de la imagen para evitar recálculos
  const imageUrl = useMemo(() => {
    if (!src || hasError) return null;
    
    // Si ya es una URL completa, retornarla
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    // Si es una imagen local del frontend
    if (src.startsWith('/images/')) {
      return src;
    }
    
    // Construir URL completa del backend
    const baseUrl = getImageBaseUrl();
    const cleanPath = src.startsWith('/') ? src : `/${src}`;
    return `${baseUrl}${cleanPath}`;
  }, [src, hasError]);

  // Placeholder SVG optimizado
  const placeholderSvg = useMemo(() => (
    <div className={`w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center ${className}`}>
      <svg 
        className="w-12 h-12 text-indigo-300" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
        />
      </svg>
    </div>
  ), [className]);

  // Si no hay src o hay error, mostrar placeholder
  if (!imageUrl || hasError) {
    return placeholderSvg;
  }

  // Blur placeholder base64 optimizado
  const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (onError) onError();
  };

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const imageProps = {
    src: imageUrl,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    quality,
    priority,
    onError: handleError,
    onLoad: handleLoad,
    sizes,
    style: { objectFit },
  };

  if (fill) {
    return (
      <div className="relative w-full h-full overflow-hidden" style={{ minHeight: '100%' }}>
        <Image
          {...imageProps}
          fill
          style={{ 
            objectFit,
            width: '100%',
            height: '100%',
          }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
        )}
      </div>
    );
  }

  if (width && height) {
    return (
      <div className="relative overflow-hidden">
        <Image
          {...imageProps}
          width={width}
          height={height}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
        )}
      </div>
    );
  }

  return placeholderSvg;
};

export default React.memo(OptimizedImage);

