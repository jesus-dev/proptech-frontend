"use client";

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  variant?: 'default' | 'minimal' | 'dots';
}

/**
 * Componente de loading spinner reutilizable y optimizado
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  fullScreen = false,
  variant = 'default',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (variant === 'dots') {
    return (
      <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : 'py-8'}`}>
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        {text && (
          <p className={`mt-4 text-gray-600 ${textSizeClasses[size]}`}>{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'py-8'}`}>
        <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin`} />
        {text && (
          <p className={`ml-4 text-gray-600 ${textSizeClasses[size]}`}>{text}</p>
        )}
      </div>
    );
  }

  // Variant default
  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50' : 'py-8'}`}>
      <div className="relative">
        {/* Spinner doble */}
        <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin`} />
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-r-blue-500 rounded-full animate-spin`}
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
        
        {/* Icono de casa en el centro (solo para lg) */}
        {size === 'lg' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}
      </div>
      
      {text && (
        <div className="mt-6 text-center space-y-2">
          <p className={`font-semibold text-gray-700 ${textSizeClasses[size]}`}>{text}</p>
          {size === 'lg' && (
            <div className="flex space-x-2 justify-center">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(LoadingSpinner);

