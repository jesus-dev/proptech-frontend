"use client";

import React from 'react';
import { AgencyFilters as Filters } from '../types';
// Iconos reemplazados con SVG inline para evitar problemas de tipos

interface AgencyFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onCreateNew: () => void;
  onGenerateSample?: () => void;
  onClearData?: () => void;
  hasData: boolean;
}

export default function AgencyFilters({
  filters,
  onFiltersChange,
  onCreateNew,
  onGenerateSample,
  onClearData,
  hasData,
}: AgencyFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value });
  };

  const handleStatusChange = (value: string) => {
    const active = value === 'all' ? null : value === 'true';
    onFiltersChange({ ...filters, active });
  };

  return (
    <div className="card-modern p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar agencias..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="input-modern pl-12 pr-4 py-3 w-full"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={filters.active === null ? "all" : filters.active.toString()}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="input-modern px-4 py-3"
          >
            <option value="all">Todos los estados</option>
            <option value="true">Solo activas</option>
            <option value="false">Solo inactivas</option>
          </select>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCreateNew}
            className="btn-modern px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Agencia
          </button>
        </div>
      </div>
    </div>
  );
} 