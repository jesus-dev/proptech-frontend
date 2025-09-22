import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export default function LoadingSpinner({ size = 'md', className = '', message }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 48,
    md: 64,
    lg: 80
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Casa Google Home - Solo contorno que se dibuja */}
        <svg width={sizeMap[size]} height={sizeMap[size]} viewBox="0 0 64 64" fill="none">
          {/* Contorno completo que se dibuja paso a paso */}
          <path
            d="M16 36 L32 16 L48 36 L48 56 L16 56 L16 36 Z"
            stroke="#2563eb"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="140"
            strokeDashoffset="140"
            style={{
              animation: 'googleHomeDraw 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards infinite',
              animationDelay: '0s',
            }}
          />
        </svg>
        
        {/* Cuadrado de construcción */}
        <div 
          className="absolute w-2 h-2 bg-red-500 opacity-0 shadow-sm"
          style={{
            animation: 'googleHomeBuild 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
      
      {message && (
        <div className="mt-4 text-center">
          <p className="text-gray-800 text-sm font-normal">
            {message}
          </p>
        </div>
      )}
      
      <style jsx>{`
        @keyframes googleHomeDraw {
          0% { 
            stroke-dashoffset: 140;
            opacity: 0.3;
          }
          50% {
            opacity: 0.8;
          }
          100% { 
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        
        @keyframes googleHomeBuild {
          0% { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }
          15% { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          30% { 
            opacity: 1;
            transform: translate(-25%, -25%) scale(1);
          }
          45% { 
            opacity: 1;
            transform: translate(0%, -40%) scale(1);
          }
          60% { 
            opacity: 1;
            transform: translate(25%, -15%) scale(1);
          }
          75% { 
            opacity: 1;
            transform: translate(0%, 10%) scale(1);
          }
          90% { 
            opacity: 1;
            transform: translate(-25%, 15%) scale(1);
          }
          100% { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }
        }
      `}</style>
    </div>
  );
}

// LoadingHouse: casita SVG animada
export const LoadingHouse = ({ size = 64, color = '#2563eb' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="animate-house-spin"
  >
    <style>{`
      .house-stroke-dark {
        stroke-dasharray: 180;
        stroke-dashoffset: 180;
        animation: dash-dark 1.2s linear forwards;
      }
      @keyframes dash-dark {
        to {
          stroke-dashoffset: 0;
        }
      }
    `}</style>
    {/* Casa base - azul claro, estática */}
    <polyline
      points="8,32 32,12 56,32"
      stroke="#93c5fd"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="16"
      y="32"
      width="32"
      height="20"
      stroke="#93c5fd"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="28"
      y="40"
      width="8"
      height="12"
      stroke="#93c5fd"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Casa base - azul oscuro, animada */}
    <polyline
      className="house-stroke-dark"
      points="8,32 32,12 56,32"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      className="house-stroke-dark"
      x="16"
      y="32"
      width="32"
      height="20"
      stroke={color}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      className="house-stroke-dark"
      x="28"
      y="40"
      width="8"
      height="12"
      stroke={color}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// LoadingHouseModern: casita moderna con trazo animado y relleno ascendente
export const LoadingHouseModern = ({ size = 80, color = '#2563eb', fillColor = '#93c5fd' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <style>{`
      .modern-house-stroke {
        stroke-dasharray: 180;
        stroke-dashoffset: 180;
        animation: dash-modern 1.2s cubic-bezier(.4,0,.2,1) forwards;
      }
      @keyframes dash-modern {
        to {
          stroke-dashoffset: 0;
        }
      }
      .modern-house-fill {
        animation: fill-rise 1.2s 1.1s cubic-bezier(.4,0,.2,1) forwards;
        transform: translateY(32px);
        opacity: 0.8;
      }
      @keyframes fill-rise {
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `}</style>
    {/* Sol */}
    <circle cx="48" cy="16" r="7" fill="#fde68a" opacity="0.7" />
    {/* Relleno animado */}
    <rect
      className="modern-house-fill"
      x="17"
      y="33"
      width="30"
      height="18"
      fill={fillColor}
      rx="3"
    />
    {/* Casa base - trazo animado */}
    <polyline
      className="modern-house-stroke"
      points="8,32 32,12 56,32"
      stroke={color}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      className="modern-house-stroke"
      x="16"
      y="32"
      width="32"
      height="20"
      stroke={color}
      strokeWidth="4"
      fill="none"
      rx="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Puerta */}
    <rect
      className="modern-house-stroke"
      x="28"
      y="40"
      width="8"
      height="12"
      stroke={color}
      strokeWidth="3"
      fill="#fff"
      rx="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Ventana */}
    <rect
      className="modern-house-stroke"
      x="38"
      y="38"
      width="6"
      height="6"
      stroke={color}
      strokeWidth="2"
      fill="#fff"
      rx="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// LoadingHouseMinimal: casita minimalista, solo contorno, animación de trazo en loop
export const LoadingHouseMinimal = ({ size = 64, color = '#2563eb', lightColor = '#93c5fd' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <style>{`
      .minimal-house-stroke-dark {
        stroke-dasharray: 180;
        stroke-dashoffset: 180;
        animation: dash-minimal 0.7s linear infinite;
      }
      @keyframes dash-minimal {
        to {
          stroke-dashoffset: 0;
        }
      }
    `}</style>

    {/* Casa principal - contorno claro, estático (sin puerta) */}
    <polyline
      points="12,32 32,14 52,32 52,52 12,52 12,32"
      stroke={lightColor}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Puerta relleno clarito */}
    <rect
      x="28" y="44" width="8" height="8"
      fill={lightColor}
      stroke="none"
    />

    {/* Casa completa - contorno oscuro, animado (incluye puerta sin línea de abajo) */}
    <polyline
      className="minimal-house-stroke-dark"
      points="12,32 32,14 52,32 52,52 36,52 36,44 28,44 28,52 12,52 12,32"
      stroke={color}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

  </svg>
); 