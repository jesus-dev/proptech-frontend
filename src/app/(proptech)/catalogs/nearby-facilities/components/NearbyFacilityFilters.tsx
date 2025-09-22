"use client";

import React from 'react';
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { NearbyFacilityFilters, FacilityType, FacilityTypeLabels } from '../types';

interface NearbyFacilityFiltersProps {
  filters: NearbyFacilityFilters;
  onFiltersChange: (filters: NearbyFacilityFilters) => void;
  types: FacilityType[];
}

export default function NearbyFacilityFiltersComponent({
  filters,
  onFiltersChange,
  types
}: NearbyFacilityFiltersProps) {
  const handleSearchChange = (searchTerm: string) => {
    onFiltersChange({ ...filters, searchTerm });
  };

  const handleTypeChange = (type: FacilityType | undefined) => {
    onFiltersChange({ ...filters, type });
  };

  const handleActiveChange = (active: boolean | undefined) => {
    onFiltersChange({ ...filters, active });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      type: undefined,
      active: undefined
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.type || filters.active !== undefined;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, dirección..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>

        {/* Tipo */}
        <div>
          <select
            value={filters.type || ''}
            onChange={(e) => handleTypeChange(e.target.value ? e.target.value as FacilityType : undefined)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          >
            <option value="">Todos los tipos</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {FacilityTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <select
            value={filters.active === undefined ? '' : filters.active.toString()}
            onChange={(e) => {
              const value = e.target.value;
              handleActiveChange(value === '' ? undefined : value === 'true');
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.searchTerm && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Búsqueda: "{filters.searchTerm}"
              <button
                onClick={() => handleSearchChange('')}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-orange-400 hover:bg-orange-200 hover:text-orange-500 focus:outline-none focus:bg-orange-500 focus:text-white"
              >
                <span className="sr-only">Remover filtro</span>
                <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                </svg>
              </button>
            </span>
          )}
          {filters.type && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Tipo: {FacilityTypeLabels[filters.type]}
              <button
                onClick={() => handleTypeChange(undefined)}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
              >
                <span className="sr-only">Remover filtro</span>
                <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                </svg>
              </button>
            </span>
          )}
          {filters.active !== undefined && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Estado: {filters.active ? 'Activos' : 'Inactivos'}
              <button
                onClick={() => handleActiveChange(undefined)}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none focus:bg-green-500 focus:text-white"
              >
                <span className="sr-only">Remover filtro</span>
                <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
