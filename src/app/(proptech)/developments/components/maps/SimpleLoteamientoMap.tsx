"use client";

import React from 'react';
import { Lot, Loteamiento } from '../types';

interface SimpleLoteamientoMapProps {
  development: Loteamiento;
  onLotClick?: (lot: Lot) => void;
  className?: string;
  height?: string;
}

export default function SimpleLoteamientoMap({
  development,
  onLotClick,
  className = "",
  height = "500px"
}: SimpleLoteamientoMapProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'sold':
        return 'bg-red-500';
      case 'reserved':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'sold':
        return 'Vendido';
      case 'reserved':
        return 'Reservado';
      default:
        return status;
    }
  };

  const lots = development.lots || [];

  return (
    <div className={`${className}`}>
      <div 
        className="w-full rounded-lg shadow-md bg-gray-100 dark:bg-gray-700 relative overflow-hidden"
        style={{ height }}
      >
        {/* Grid de lotes */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribución de Lotes
          </h3>
          
          {lots.length > 0 ? (
            <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {lots.map((lot) => (
                <div
                  key={lot.id}
                  className={`
                    aspect-square rounded border-2 border-white dark:border-gray-600 
                    ${getStatusColor(lot.status)} 
                    ${onLotClick ? 'cursor-pointer hover:opacity-80' : ''}
                    flex items-center justify-center text-white text-xs font-bold
                    transition-all duration-200
                  `}
                  onClick={() => onLotClick?.(lot)}
                  title={`Lote ${lot.number} - ${getStatusText(lot.status)} - ${lot.area}m² - $${lot.price.toLocaleString()}`}
                >
                  {lot.number}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No hay lotes disponibles
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Estado de los Lotes</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Vendido</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Reservado</span>
          </div>
        </div>
      </div>
    </div>
  );
} 