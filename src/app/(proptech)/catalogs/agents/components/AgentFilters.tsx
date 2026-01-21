"use client";

import React, { useState, useEffect } from 'react';
import { AgentFilters as AgentFiltersType } from '../types';
import { useAuthContext } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
// Iconos reemplazados con SVG inline para evitar problemas de tipos

interface Tenant {
  id: number;
  name: string;
  active: boolean;
}

interface AgentFiltersProps {
  filters: AgentFiltersType;
  onFiltersChange: (filters: AgentFiltersType) => void;
  onCreateNew: () => void;
  agencies: Array<{id: string, name: string, active: boolean}>;
}

export default function AgentFilters({
  filters,
  onFiltersChange,
  onCreateNew,
  agencies,
}: AgentFiltersProps) {
  const { user } = useAuthContext();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  
  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('ADMIN');

  useEffect(() => {
    if (isSuperAdmin) {
      loadTenants();
    }
  }, [isSuperAdmin]);

  const loadTenants = async () => {
    try {
      setLoadingTenants(true);
      const response = await apiClient.get('/api/super-admin/tenants');
      setTenants(response.data || []);
    } catch (error) {
      console.error('Error cargando tenants:', error);
      setTenants([]);
    } finally {
      setLoadingTenants(false);
    }
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value });
  };

  const handleStatusChange = (value: string) => {
    const active = value === 'all' ? null : value === 'true';
    onFiltersChange({ ...filters, active });
  };

  const handleAgencyChange = (value: string) => {
    const agencyId = value === 'all' ? null : value;
    onFiltersChange({ ...filters, agencyId });
  };

  const handleAuthStatusChange = (value: string) => {
    const isActive = value === 'all' ? null : value === 'true';
    onFiltersChange({ ...filters, isActive });
  };

  const handleTenantChange = (value: string) => {
    const tenantId = value === 'all' ? null : parseInt(value);
    onFiltersChange({ ...filters, tenantId });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar agentes..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={filters.active === null ? "all" : filters.active.toString()}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">Todos los estados</option>
            <option value="true">Solo activos</option>
            <option value="false">Solo inactivos</option>
          </select>

          {/* Authentication Status Filter */}
          <select
            value={filters.isActive === null ? "all" : filters.isActive.toString()}
            onChange={(e) => handleAuthStatusChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">Todos los accesos</option>
            <option value="true">Pueden iniciar sesión</option>
            <option value="false">No pueden iniciar sesión</option>
          </select>

          {/* Agency Filter */}
          <select
            value={filters.agencyId || "all"}
            onChange={(e) => handleAgencyChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">Todas las agencias</option>
            <option value="">Sin agencia</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name}
              </option>
            ))}
          </select>

          {/* Tenant Filter (solo para Super Admin) */}
          {isSuperAdmin && (
            <select
              value={filters.tenantId?.toString() || "all"}
              onChange={(e) => handleTenantChange(e.target.value)}
              disabled={loadingTenants}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">Todos los tenants</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id.toString()}>
                  {tenant.name}
                </option>
              ))}
            </select>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Agente
          </button>
        </div>
      </div>
    </div>
  );
} 