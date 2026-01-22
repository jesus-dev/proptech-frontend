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
      // PRIMERO: Verificar localStorage para tener algo que mostrar inmediatamente
      const savedTenant = localStorage.getItem('selectedTenant');
      if (savedTenant) {
        try {
          const parsed = JSON.parse(savedTenant);
          if (parsed && (parsed.id === 0 || parsed.id > 0)) {
            setCurrentTenant(parsed);
            console.log('✅ TenantIndicator - Usando tenant guardado en localStorage:', parsed);
          }
        } catch (e) {
          console.warn('⚠️ TenantIndicator - Error parseando tenant guardado:', e);
          localStorage.removeItem('selectedTenant');
        }
      }

      // Intentar cargar desde el backend
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

        // Si hay tenantId en la respuesta, usarlo (sobrescribe localStorage)
        if (data?.tenantId) {
          const tenantFromBackend = {
            id: data.tenantId,
            name: data.tenantName || 'Sin nombre',
            active: true
          };
          setCurrentTenant(tenantFromBackend);
          // Sincronizar con localStorage
          localStorage.setItem('selectedTenant', JSON.stringify(tenantFromBackend));
          console.log('✅ TenantIndicator - Usando tenant del contexto:', data.tenantId);
        } else if (!savedTenant) {
          // Si no hay tenant seleccionado y no hay en localStorage, significa "Mostrar todo"
          const allTenantsOption = { id: 0, name: 'Todos los tenants', active: true };
          setCurrentTenant(allTenantsOption);
          localStorage.setItem('selectedTenant', JSON.stringify(allTenantsOption));
          console.log('✅ TenantIndicator - Sin tenant seleccionado, usando "Todos los tenants"');
        }
      } catch (apiError: any) {
        // Si falla el API (CORS, red, etc.), usar localStorage como fallback
        console.warn('⚠️ TenantIndicator - Error cargando contexto del API, usando localStorage:', apiError);
        
        // Si hay tenant en localStorage, asumir que es SUPER_ADMIN y mostrarlo
        if (savedTenant) {
          try {
            const parsed = JSON.parse(savedTenant);
            if (parsed && (parsed.id === 0 || parsed.id > 0)) {
              // Asumir que es SUPER_ADMIN si tiene tenant guardado
              setIsSuperAdmin(true);
              setCurrentTenant(parsed);
              console.log('✅ TenantIndicator - Usando tenant de localStorage (fallback por error API):', parsed);
            }
          } catch (e) {
            console.warn('⚠️ TenantIndicator - Error parseando tenant en fallback:', e);
          }
        } else {
          // Si no hay tenant guardado y falla el API, no mostrar el componente
          setIsSuperAdmin(false);
        }
      }
    } catch (error: any) {
      console.error('❌ TenantIndicator - Error inesperado:', error);
      // En caso de error inesperado, intentar usar localStorage
      const savedTenant = localStorage.getItem('selectedTenant');
      if (savedTenant) {
        try {
          const parsed = JSON.parse(savedTenant);
          if (parsed && (parsed.id === 0 || parsed.id > 0)) {
            setIsSuperAdmin(true);
            setCurrentTenant(parsed);
          }
        } catch (e) {
          setIsSuperAdmin(false);
        }
      } else {
        setIsSuperAdmin(false);
      }
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

