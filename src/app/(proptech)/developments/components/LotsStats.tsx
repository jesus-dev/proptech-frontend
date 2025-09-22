"use client";

import React from 'react';
import { Lot } from './types';

interface LotsStatsProps {
  lots?: Lot[];
  className?: string;
}

export default function LotsStats({ lots = [], className = "" }: LotsStatsProps) {
  const totalLots = lots?.length || 0;
  const availableLots = lots?.filter(lot => lot.status === 'available').length || 0;
  const soldLots = lots?.filter(lot => lot.status === 'sold').length || 0;
  const reservedLots = lots?.filter(lot => lot.status === 'reserved').length || 0;
  
  const totalArea = lots?.reduce((sum, lot) => sum + lot.area, 0) || 0;
  const totalValue = lots?.reduce((sum, lot) => sum + lot.price, 0) || 0;
  const averagePrice = totalLots > 0 ? totalValue / totalLots : 0;
  const averageArea = totalLots > 0 ? totalArea / totalLots : 0;

  const stats = [
    {
      label: 'Total de Lotes',
      value: totalLots,
      color: 'bg-blue-500',
      icon: '🏠'
    },
    {
      label: 'Disponibles',
      value: availableLots,
      color: 'bg-green-500',
      icon: '✅'
    },
    {
      label: 'Vendidos',
      value: soldLots,
      color: 'bg-red-500',
      icon: '💰'
    },
    {
      label: 'Reservados',
      value: reservedLots,
      color: 'bg-yellow-500',
      icon: '⏳'
    },
    {
      label: 'Área Total',
      value: `${totalArea.toLocaleString()} m²`,
      color: 'bg-purple-500',
      icon: '📏'
    },
    {
      label: 'Valor Total',
      value: `$${totalValue.toLocaleString()}`,
      color: 'bg-indigo-500',
      icon: '💵'
    },
    {
      label: 'Precio Promedio',
      value: `$${averagePrice.toLocaleString()}`,
      color: 'bg-pink-500',
      icon: '📊'
    },
    {
      label: 'Área Promedio',
      value: `${averageArea.toFixed(0)} m²`,
      color: 'bg-teal-500',
      icon: '📐'
    }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Estadísticas de Lotes
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${stat.color} flex items-center justify-center text-white text-xl`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Progreso de ventas */}
      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
          Progreso de Ventas
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Disponibles</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {availableLots} ({totalLots > 0 ? ((availableLots / totalLots) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalLots > 0 ? (availableLots / totalLots) * 100 : 0}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Vendidos</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {soldLots} ({totalLots > 0 ? ((soldLots / totalLots) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalLots > 0 ? (soldLots / totalLots) * 100 : 0}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Reservados</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {reservedLots} ({totalLots > 0 ? ((reservedLots / totalLots) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalLots > 0 ? (reservedLots / totalLots) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
} 