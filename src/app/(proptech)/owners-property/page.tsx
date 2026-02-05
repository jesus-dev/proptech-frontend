'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const LinkComponent = Link as any;
import { 
  Users, 
  Home, 
  FileText, 
  Plus, 
  TrendingUp,
  DollarSign,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { OwnersPropertyService, Owner, OwnerProperty, OwnerReport } from '@/services/ownersPropertyService';

export default function OwnersPropertyDashboard() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [ownerProperties, setOwnerProperties] = useState<OwnerProperty[]>([]);
  const [ownerReports, setOwnerReports] = useState<OwnerReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const ownersData = await OwnersPropertyService.getOwners();
      setOwners(ownersData);
      
      const allProperties: OwnerProperty[] = [];
      const allReports: OwnerReport[] = [];
      
      for (const owner of ownersData) {
        const properties = await OwnersPropertyService.getOwnerProperties(owner.id);
        const reports = await OwnersPropertyService.getOwnerReports(owner.id);
        allProperties.push(...properties);
        allReports.push(...reports);
      }
      
      setOwnerProperties(allProperties);
      setOwnerReports(allReports);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      setOwners([]);
      setOwnerProperties([]);
      setOwnerReports([]);
    } finally {
      setLoading(false);
    }
  };

  const totalOwners = owners.length;
  const activeOwners = owners.filter(o => o.status === 'ACTIVE').length;
  const totalProperties = ownerProperties.length;
  const totalValue = ownerProperties.reduce((sum, op) => sum + (op.property?.price || 0), 0);
  const totalReports = ownerReports.length;
  const sentReports = ownerReports.filter(r => r.status === 'SENT').length;

  const ownersByStatus = {
    active: owners.filter(o => o.status === 'ACTIVE').length,
    inactive: owners.filter(o => o.status === 'INACTIVE').length,
    pending: owners.filter(o => o.status === 'PENDING').length
  };

  const propertiesByType = {
    apartment: ownerProperties.filter(op => op.property.type === 'APARTMENT').length,
    house: ownerProperties.filter(op => op.property.type === 'HOUSE').length,
    other: ownerProperties.filter(op => !['APARTMENT', 'HOUSE'].includes(op.property.type || '')).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-orange-500 border-t-transparent"></div>
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-2xl p-4 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGMtOS45NDEgMC0xOC04LjA1OS0xOC0xOHM4LjA1OS0xOCAxOC0xOHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-medium text-orange-100">Dashboard</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-bold mb-1">
                ¡Bienvenido!
              </h1>
              <p className="text-orange-100 text-sm sm:text-base">
                Gestiona tus propietarios y propiedades
              </p>
            </div>
            <LinkComponent
              href="/owners-property/owners"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Propietario</span>
            </LinkComponent>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Propietarios */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              +{activeOwners}
            </span>
          </div>
          <p className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">{totalOwners}</p>
          <p className="text-xs sm:text-sm text-gray-500">Propietarios</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{activeOwners} activos</span>
            </div>
          </div>
        </div>

        {/* Propiedades */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {propertiesByType.apartment} aptos
            </span>
          </div>
          <p className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">{totalProperties}</p>
          <p className="text-xs sm:text-sm text-gray-500">Propiedades</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{propertiesByType.house} casas</span>
            </div>
          </div>
        </div>

        {/* Valor */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              <span>12.5%</span>
            </div>
          </div>
          <p className="text-lg sm:text-3xl font-bold text-gray-900 mb-1 truncate">
            {totalValue > 0 ? `${(totalValue / 1000000).toFixed(1)}M` : '0'}€
          </p>
          <p className="text-xs sm:text-sm text-gray-500">Valor Total</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>

        {/* Reportes */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              {sentReports} enviados
            </span>
          </div>
          <p className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">{totalReports}</p>
          <p className="text-xs sm:text-sm text-gray-500">Reportes</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" 
                style={{ width: totalReports > 0 ? `${(sentReports / totalReports) * 100}%` : '0%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <LinkComponent 
          href="/owners-property/owners"
          className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-3 sm:p-4 bg-orange-50 group-hover:bg-orange-100 rounded-2xl mb-3 transition-colors">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Propietarios</h3>
            <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Gestionar lista</p>
            <ArrowRight className="w-4 h-4 text-orange-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </LinkComponent>

        <LinkComponent 
          href="/owners-property/properties"
          className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-3 sm:p-4 bg-blue-50 group-hover:bg-blue-100 rounded-2xl mb-3 transition-colors">
              <Home className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Propiedades</h3>
            <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Ver inventario</p>
            <ArrowRight className="w-4 h-4 text-blue-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </LinkComponent>

        <LinkComponent 
          href="/owners-property/reports"
          className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-3 sm:p-4 bg-purple-50 group-hover:bg-purple-100 rounded-2xl mb-3 transition-colors">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Reportes</h3>
            <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Generar informes</p>
            <ArrowRight className="w-4 h-4 text-purple-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </LinkComponent>
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Recent Owners */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Propietarios Recientes</h3>
            <LinkComponent 
              href="/owners-property/owners"
              className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Ver todos
            </LinkComponent>
          </div>
          <div className="space-y-3">
            {owners.length > 0 ? owners.slice(0, 4).map((owner) => (
              <div key={owner.id} className="flex items-center gap-3 p-2 sm:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  {owner.name?.charAt(0) || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{owner.name}</p>
                  <p className="text-xs text-gray-500 truncate">{owner.email}</p>
                </div>
                <span className={`px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full ${
                  owner.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  owner.status === 'INACTIVE' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {owner.status === 'ACTIVE' ? 'Activo' : owner.status === 'INACTIVE' ? 'Inactivo' : 'Pendiente'}
                </span>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay propietarios</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Properties */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Propiedades Recientes</h3>
            <LinkComponent 
              href="/owners-property/properties"
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas
            </LinkComponent>
          </div>
          <div className="space-y-3">
            {ownerProperties.length > 0 ? ownerProperties.slice(0, 4).map((ownerProperty, index) => (
              <div key={`${ownerProperty.id}-${index}`} className="flex items-center gap-3 p-2 sm:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{ownerProperty.property.title}</p>
                  <p className="text-xs text-gray-500 truncate">{ownerProperty.property.address}</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600 whitespace-nowrap">
                  {ownerProperty.property.price.toLocaleString('es-ES')}€
                </span>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Home className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay propiedades</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
