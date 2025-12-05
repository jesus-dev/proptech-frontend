"use client";

import React, { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon, 
  CheckCircleIcon, 
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api';

interface Tenant {
  id: number;
  name: string;
  active: boolean;
  createdAt?: string;
}

interface TenantSwitcherProps {
  currentTenant: Tenant | null;
  onTenantChange: (tenant: Tenant) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function TenantSwitcher({ 
  currentTenant, 
  onTenantChange, 
  isOpen, 
  onClose 
}: TenantSwitcherProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(currentTenant);

  useEffect(() => {
    if (isOpen) {
      loadTenants();
    }
  }, [isOpen]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/super-admin/tenants');
      setTenants(response.data || []);
    } catch (error) {
      console.error('Error cargando tenants:', error);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTenant = async (tenant: Tenant) => {
    try {
      // Llamar al endpoint para cambiar de tenant
      const response = await apiClient.post(`/api/super-admin/switch-tenant/${tenant.id}`);

      if (response.data) {
        // Guardar tenant seleccionado en localStorage
        localStorage.setItem('selectedTenant', JSON.stringify(tenant));
        
        // Actualizar estado local
        setSelectedTenant(tenant);
        
        // Notificar al componente padre
        onTenantChange(tenant);
        
        // Recargar la página para aplicar el nuevo contexto
        window.location.reload();
      }
    } catch (error) {
      console.error('Error cambiando de tenant:', error);
    }
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <BuildingOfficeIcon className="w-8 h-8" />
              Seleccionar Tenant
            </h2>
            <p className="text-brand-100 text-sm mt-1">
              Como Super Admin, puedes gestionar cualquier tenant
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tenant Actual */}
        {currentTenant && (
          <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tenant Actual:</p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">
                  {currentTenant.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Buscador */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
          </div>
        </div>

        {/* Lista de Tenants */}
        <div className="px-6 py-4 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No se encontraron tenants
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTenants.map((tenant) => {
                const isSelected = selectedTenant?.id === tenant.id;
                const isCurrent = currentTenant?.id === tenant.id;
                
                return (
                  <button
                    key={tenant.id}
                    onClick={() => handleSelectTenant(tenant)}
                    disabled={isCurrent}
                    className={`
                      relative p-6 rounded-xl border-2 transition-all duration-300 text-left
                      ${isCurrent 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 cursor-default' 
                        : isSelected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }
                      ${!isCurrent && 'transform hover:scale-105 hover:shadow-lg'}
                    `}
                  >
                    {/* Badge de estado actual */}
                    {isCurrent && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Actual
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Icono */}
                      <div className={`
                        w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                        ${isCurrent 
                          ? 'bg-green-600' 
                          : 'bg-gradient-to-br from-brand-600 to-brand-700'
                        }
                      `}>
                        <BuildingOfficeIcon className="w-8 h-8 text-white" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate">
                          {tenant.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          ID: {tenant.id}
                        </p>
                        {tenant.createdAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Creado: {new Date(tenant.createdAt).toLocaleDateString('es-ES')}
                          </p>
                        )}

                        {!isCurrent && (
                          <div className="mt-3 flex items-center gap-2 text-brand-600 dark:text-brand-400 text-sm font-semibold">
                            <span>Cambiar a este tenant</span>
                            <ArrowRightIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredTenants.length} tenant{filteredTenants.length !== 1 ? 's' : ''} disponible{filteredTenants.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

