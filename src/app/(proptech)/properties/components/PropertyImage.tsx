"use client";

import React, { useState } from 'react';
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

    const getImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    
    // Usar la configuración centralizada de api-config
    const { getEndpoint } = require('@/lib/api-config');
    return getEndpoint(url);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const fullUrl = getImageUrl(imageUrl);
    const errorMessage = `No se pudo cargar la imagen para la propiedad: "${title}". URL: ${fullUrl}`;
    
    console.warn(errorMessage);
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

  const fullImageUrl = getImageUrl(imageUrl);
  
  if (!fullImageUrl) {
    return (
      <div className={placeholderClassName}>
        <BuildingOfficeIcon className="w-16 h-16 text-sky-400 opacity-60" />
      </div>
    );
  }

  return (
    <>
      <img
        src={fullImageUrl}
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
