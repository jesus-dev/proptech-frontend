"use client";

import React, { useState } from 'react';
import { useSector } from '@/context/SectorContext';
import { ChevronDown, Building2, MapPin } from 'lucide-react';

export const SectorSelector: React.FC = () => {
  const { 
    currentSector, 
    currentAgency, 
    availableSectors, 
    availableAgencies,
    switchSector,
    switchAgency,
    isLoading 
  } = useSector();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sectors' | 'agencies'>('sectors');

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!currentSector) {
    return null;
  }

  return (
    <div className="relative">
      {/* Botón del selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
      >
        <Building2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {currentSector.name}
          </span>
          {currentAgency && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {currentAgency.name}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('sectors')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'sectors'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Sectores
            </button>
            <button
              onClick={() => setActiveTab('agencies')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'agencies'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Agencias
            </button>
          </div>

          {/* Contenido de los tabs */}
          <div className="p-4 max-h-64 overflow-y-auto">
            {activeTab === 'sectors' ? (
              <div className="space-y-2">
                {availableSectors.map((sector) => (
                  <button
                    key={sector.id}
                    onClick={() => {
                      switchSector(sector.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 text-left ${
                      currentSector?.id === sector.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sector.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {sector.name}
                      </div>
                      {sector.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {sector.description}
                        </div>
                      )}
                    </div>
                    {currentSector?.id === sector.id && (
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {availableAgencies.map((agency) => (
                  <button
                    key={agency.id}
                    onClick={() => {
                      switchAgency(agency.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 text-left ${
                      currentAgency?.id === agency.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {agency.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {agency.sector.name}
                      </div>
                    </div>
                    {currentAgency?.id === agency.id && (
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Cambiar sector para ver contenido específico
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

