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
      
      console.log('🔍 TenantIndicator - Contexto recibido:', data);
      
      const isSuperAdminValue = data?.isSuperAdmin === true;
      setIsSuperAdmin(isSuperAdminValue);
      
      // Si no es SUPER_ADMIN, no mostrar el componente
      if (!isSuperAdminValue) {
        console.log('⚠️ TenantIndicator - Usuario no es SUPER_ADMIN, ocultando componente');
        setLoading(false);
        return;
      }

      // Verificar si hay tenant seleccionado en localStorage primero
      // Esta es la fuente de verdad - tiene prioridad sobre el backend
      const savedTenant = localStorage.getItem('selectedTenant');
      console.log('🔍 TenantIndicator - Verificando localStorage:', savedTenant);
      
      if (savedTenant) {
        try {
          const parsed = JSON.parse(savedTenant);
          console.log('🔍 TenantIndicator - Tenant parseado de localStorage:', parsed);
          
          // Aceptar cualquier tenant guardado (incluyendo id: 0 para "Mostrar todo")
          if (parsed && (parsed.id === 0 || parsed.id > 0)) {
            setCurrentTenant(parsed);
            console.log('✅ TenantIndicator - Usando tenant guardado en localStorage:', parsed);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('⚠️ TenantIndicator - Error parseando tenant guardado:', e);
          // Si hay error parseando, limpiar localStorage corrupto
          localStorage.removeItem('selectedTenant');
        }
      } else {
        console.log('⚠️ TenantIndicator - No hay tenant guardado en localStorage');
      }

      // Si hay tenantId en la respuesta y no hay tenant guardado en localStorage, usarlo
      if (data?.tenantId) {
        setCurrentTenant({
          id: data.tenantId,
          name: data.tenantName || 'Sin nombre',
          active: true
        });
        console.log('✅ TenantIndicator - Usando tenant del contexto:', data.tenantId);
      } else {
        // Si no hay tenant seleccionado, significa "Mostrar todo"
        const allTenantsOption = { id: 0, name: 'Todos los tenants', active: true };
        setCurrentTenant(allTenantsOption);
        // Guardar en localStorage para consistencia
        localStorage.setItem('selectedTenant', JSON.stringify(allTenantsOption));
        console.log('✅ TenantIndicator - Sin tenant seleccionado, usando "Todos los tenants"');
      }
    } catch (error: any) {
      console.error('❌ TenantIndicator - Error cargando contexto:', error);
      // Si hay error, no mostrar el componente
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
            <p className="text-xs text-brand-100">Vista Actual:</p>
            <p className="font-bold text-sm leading-tight">
              {currentTenant?.name || 'Todos los tenants'}
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

