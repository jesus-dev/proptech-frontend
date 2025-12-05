"use client";

import React, { useState, useEffect } from 'react';
import { BuildingOfficeIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api';
import TenantSwitcher from './TenantSwitcher';

interface Tenant {
  id: number;
  name: string;
  active: boolean;
  createdAt?: string;
}

export default function TenantIndicator() {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentContext();
  }, []);

  const loadCurrentContext = async () => {
    try {
      const response = await apiClient.get('/api/super-admin/current-context');
      const data = response.data;
      
      setIsSuperAdmin(data.isSuperAdmin || false);
      
      if (data.tenantId) {
        setCurrentTenant({
          id: data.tenantId,
          name: data.tenantName || 'Sin nombre',
          active: true
        });
      }

      // Verificar si hay tenant seleccionado en localStorage
      const savedTenant = localStorage.getItem('selectedTenant');
      if (savedTenant) {
        try {
          const parsed = JSON.parse(savedTenant);
          setCurrentTenant(parsed);
        } catch (e) {
          // Ignorar si el JSON está corrupto
        }
      }
    } catch (error: any) {
      console.error('Error cargando contexto:', error);
      // Si no es SUPER_ADMIN o hay error, no mostrar el componente
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTenantChange = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    setShowSwitcher(false);
  };

  // No mostrar nada si no es super admin
  if (!isSuperAdmin || loading) {
    return null;
  }

  return (
    <>
      {/* Indicador en el header */}
      <button
        onClick={() => setShowSwitcher(true)}
        className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <BuildingOfficeIcon className="w-5 h-5" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs text-brand-100">Tenant Actual:</p>
            <p className="font-bold text-sm leading-tight">
              {currentTenant?.name || 'Sin seleccionar'}
            </p>
          </div>
        </div>
        <ChevronDownIcon className="w-4 h-4 opacity-75" />
      </button>

      {/* Modal de selección */}
      <TenantSwitcher
        currentTenant={currentTenant}
        onTenantChange={handleTenantChange}
        isOpen={showSwitcher}
        onClose={() => setShowSwitcher(false)}
      />
    </>
  );
}

