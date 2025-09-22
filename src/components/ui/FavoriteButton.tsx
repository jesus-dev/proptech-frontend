"use client";

import React, { useState, useEffect } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { publicPropertyService } from '@/services/publicPropertyService';

interface FavoriteButtonProps {
  propertyId: string;
  initialIsFavorite?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  propertyId,
  initialIsFavorite = false,
  className = '',
  size = 'md',
  showText = false,
  onToggle
}) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  // Actualizar el estado cuando cambie la prop initialIsFavorite
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const handleToggle = async () => {
    console.log('🔍 FavoriteButton: handleToggle called for propertyId:', propertyId);
    setIsLoading(true);
    try {
      const newFavoriteState = await publicPropertyService.toggleFavorite(propertyId);
      console.log('🔍 FavoriteButton: toggleFavorite returned:', newFavoriteState);
      setIsFavorite(newFavoriteState);
      onToggle?.(newFavoriteState);
    } catch (error) {
      console.error('❌ FavoriteButton: Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        ${buttonClasses[size]} 
        bg-white/90 hover:bg-white 
        shadow-md hover:shadow-lg 
        transition-all duration-300 
        rounded-full 
        flex items-center justify-center
        ${isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      {isFavorite ? (
        <Heart className={sizeClasses[size]} fill="currentColor" />
      ) : (
        <Heart className={sizeClasses[size]} />
      )}
      {showText && (
        <span className="ml-1 text-xs font-medium">
          {isFavorite ? 'Favorito' : 'Favorito'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton; 