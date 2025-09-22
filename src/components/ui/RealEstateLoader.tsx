import React from "react";

interface RealEstateLoaderProps {
  message?: string;
}

export default function RealEstateLoader({ message }: RealEstateLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
        {/* Techo */}
        <polyline
          points="10,28 32,10 54,28"
          stroke="#2563eb"
          strokeWidth="3"
          fill="none"
          strokeDasharray="60"
          strokeDashoffset="60"
          style={{
            animation: 'draw 0.7s linear forwards infinite',
            animationDelay: '0s',
          }}
        />
        {/* Cuerpo de la casa */}
        <rect
          x="16" y="28" width="32" height="26" rx="4"
          stroke="#2563eb"
          strokeWidth="3"
          fill="#fff"
          strokeDasharray="120"
          strokeDashoffset="120"
          style={{
            animation: 'draw 0.7s linear forwards infinite',
            animationDelay: '0.7s',
          }}
        />
        {/* Puerta */}
        <rect
          x="28" y="40" width="8" height="14"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          opacity="0"
          style={{
            animation: 'fadein 0.4s linear forwards',
            animationDelay: '1.4s',
          }}
        />
        <style>{`
          @keyframes draw {
            from { stroke-dashoffset: var(--dash, 60); }
            to { stroke-dashoffset: 0; }
          }
          @keyframes fadein {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </svg>
      {message && (
        <p className="text-gray-600 mt-4 text-center text-sm">{message}</p>
      )}
    </div>
  );
} 