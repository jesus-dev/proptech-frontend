/**
 * Componentes de Skeleton Loader para mejorar UX durante la carga
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Skeleton básico - elemento individual
 */
export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  rounded = 'md' 
}) => {
  const roundedClass = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }[rounded];

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${roundedClass} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton para tarjetas de propiedades
 */
export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      {/* Imagen */}
      <Skeleton height={200} rounded="none" />
      
      {/* Contenido */}
      <div className="p-4 space-y-3">
        <Skeleton height={20} width="80%" />
        <Skeleton height={16} width="60%" />
        <div className="flex gap-2">
          <Skeleton height={16} width={60} />
          <Skeleton height={16} width={60} />
        </div>
        <Skeleton height={24} width="40%" />
      </div>
    </div>
  );
};

/**
 * Skeleton para lista de propiedades
 */
export const PropertyListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Skeleton para tarjetas de agentes
 */
export const AgentCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Skeleton width={64} height={64} rounded="full" />
        
        {/* Info */}
        <div className="flex-1 space-y-2">
          <Skeleton height={20} width="70%" />
          <Skeleton height={16} width="50%" />
          <Skeleton height={16} width="60%" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton para lista de agentes
 */
export const AgentListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <AgentCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Skeleton para texto (párrafos)
 */
export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          height={16} 
          width={i === lines - 1 ? '80%' : '100%'} 
        />
      ))}
    </div>
  );
};

/**
 * Skeleton para estadísticas
 */
export const StatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="text-center">
          <Skeleton height={32} width={80} className="mx-auto mb-2" />
          <Skeleton height={16} width={100} className="mx-auto" />
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton para formulario
 */
export const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height={16} width={100} />
          <Skeleton height={40} width="100%" rounded="md" />
        </div>
      ))}
      <Skeleton height={48} width={150} rounded="md" />
    </div>
  );
};

