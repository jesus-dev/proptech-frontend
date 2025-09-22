"use client";

import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface SuspenseBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

const DefaultFallback = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center p-8 ${className}`}>
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-2 text-sm text-gray-500">Cargando...</p>
    </div>
  </div>
);

const SuspenseBoundary: React.FC<SuspenseBoundaryProps> = ({ 
  children, 
  fallback,
  className 
}) => {
  return (
    <Suspense fallback={fallback || <DefaultFallback className={className} />}>
      {children}
    </Suspense>
  );
};

export default React.memo(SuspenseBoundary); 