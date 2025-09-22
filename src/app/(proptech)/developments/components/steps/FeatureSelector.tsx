"use client";

import React, { useState, useMemo } from 'react';
import { PlusIcon, CloseLineIcon } from '@/icons';

interface FeatureSelectorProps {
  title: string;
  description: string;
  availableItems: string[];
  selectedItems: string[];
  onSelectionChange: (newSelection: string[]) => void;
  itemColors: {
    bg: string;
    text: string;
    darkBg: string;
    darkText: string;
    hoverText: string;
  };
}

export default function FeatureSelector({
  title,
  description,
  availableItems,
  selectedItems,
  onSelectionChange,
  itemColors,
}: FeatureSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAvailableItems = useMemo(() => {
    return availableItems.filter(item =>
      !selectedItems.includes(item) &&
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableItems, selectedItems, searchTerm]);

  const handleSelect = (item: string) => {
    onSelectionChange([...selectedItems, item]);
  };

  const handleDeselect = (item: string) => {
    onSelectionChange(selectedItems.filter(selected => selected !== item));
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700/50">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-6">{description}</p>
      
      <div className="relative mb-4">
        <input
          type="text"
          placeholder={`Buscar en ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna de Disponibles */}
        <div>
          <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Disponibles</h5>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {filteredAvailableItems.length > 0 ? (
              filteredAvailableItems.map(item => (
                <div key={item} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="p-1 rounded-full text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/50"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">No hay más elementos disponibles.</p>
            )}
          </div>
        </div>
        
        {/* Columna de Seleccionados */}
        <div>
          <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Seleccionados</h5>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {selectedItems.length > 0 ? (
              selectedItems.map(item => (
                <div
                  key={item}
                  className={`flex items-center justify-between p-3 rounded-lg ${itemColors.bg} ${itemColors.text} dark:${itemColors.darkBg} dark:${itemColors.darkText}`}
                >
                  <span className="text-sm font-medium">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleDeselect(item)}
                    className={`p-1 rounded-full ${itemColors.hoverText} hover:bg-white/30`}
                  >
                    <CloseLineIcon className="h-5 w-5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Ningún elemento seleccionado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 