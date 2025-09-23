"use client";

import React, { useState, useEffect } from 'react';
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";

interface PropertyImageProps {
  imageUrl?: string | null;
  title: string;
  className?: string;
  placeholderClassName?: string;
  onError?: (error: string) => void;
}

export default function PropertyImage({ 
  imageUrl, 
  title, 
  className = "w-full h-full object-cover",
  placeholderClassName = "w-full h-full flex items-center justify-center bg-sky-200",
  onError 
}: PropertyImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  // Initialize current image URL and set up fallback logic
  useEffect(() => {
    if (imageUrl) {
      setCurrentImageUrl(getImageUrl(imageUrl));
      setImageError(false);
      setImageLoaded(false);
    }
  }, [imageUrl]);

  const getImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    
    // Usar la configuración centralizada de api-config
    const { getEndpoint } = require('@/lib/api-config');
    return getEndpoint(url);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const fullUrl = currentImageUrl;
    const errorMessage = `No se pudo cargar la imagen para la propiedad: "${title}". URL: ${fullUrl}`;
    
    console.warn(errorMessage);
    
    // Try fallback URL patterns if the original URL fails
    if (imageUrl && !imageUrl.startsWith('http')) {
      // Try different URL patterns as fallbacks
      const fallbackUrls = [
        getImageUrl(imageUrl.replace('/api/files/', '/uploads/')), // Convert /api/files to /uploads
        getImageUrl(imageUrl.replace('/uploads/', '/api/files/')), // Convert /uploads to /api/files
      ].filter(Boolean);
      
      const nextFallback = fallbackUrls.find(url => url !== currentImageUrl);
      
      if (nextFallback) {
        console.log(`Trying fallback URL: ${nextFallback}`);
        setCurrentImageUrl(nextFallback);
        setImageError(false);
        return;
      }
    }
    
    setImageError(true);
    
    if (onError) {
      onError(errorMessage);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Si no hay URL de imagen o hay un error, mostrar placeholder
  if (!imageUrl || imageError) {
    return (
      <div className={placeholderClassName}>
        <BuildingOfficeIcon className="w-16 h-16 text-sky-400 opacity-60" />
      </div>
    );
  }

  if (!currentImageUrl) {
    return (
      <div className={placeholderClassName}>
        <BuildingOfficeIcon className="w-16 h-16 text-sky-400 opacity-60" />
      </div>
    );
  }

  return (
    <>
      <img
        src={currentImageUrl}
        alt={title}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: imageLoaded ? 'block' : 'none' }}
      />
      {!imageLoaded && !imageError && (
        <div className={placeholderClassName}>
          <div className="animate-pulse">
            <BuildingOfficeIcon className="w-16 h-16 text-sky-400 opacity-60" />
          </div>
        </div>
      )}
    </>
  );
}
