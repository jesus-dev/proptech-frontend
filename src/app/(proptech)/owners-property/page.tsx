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
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { OwnersPropertyService, Owner, OwnerProperty, OwnerReport } from '@/services/ownersPropertyService';

export default function OwnersPropertyDashboard() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [ownerProperties, setOwnerProperties] = useState<OwnerProperty[]>([]);
  const [ownerReports, setOwnerReports] = useState<OwnerReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos reales del backend
      const ownersData = await OwnersPropertyService.getOwners();
      setOwners(ownersData);
      
      // Cargar propiedades y reportes de todos los propietarios
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
      // En producción, mostrar estado vacío (sin datos ficticios)
      setOwners([]);
      setOwnerProperties([]);
      setOwnerReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos de métricas
  const totalOwners = owners.length;
  const activeOwners = owners.filter(o => o.status === 'ACTIVE').length;
  const totalProperties = ownerProperties.length;
  const totalValue = ownerProperties.reduce((sum, op) => sum + (op.property?.price || 0), 0);
  const totalViews = ownerProperties.reduce((sum, op) => sum + (op.property?.views || 0), 0);
  const totalFavorites = ownerProperties.reduce((sum, op) => sum + (op.property?.favorites || 0), 0);
  const totalReports = ownerReports.length;
  const sentReports = ownerReports.filter(r => r.status === 'SENT').length;

  // Propietarios por estado
  const ownersByStatus = {
    active: owners.filter(o => o.status === 'ACTIVE').length,
    inactive: owners.filter(o => o.status === 'INACTIVE').length,
    pending: owners.filter(o => o.status === 'PENDING').length
  };

  // Propiedades por tipo
  const propertiesByType = {
    apartment: ownerProperties.filter(op => op.property.type === 'APARTMENT').length,
    house: ownerProperties.filter(op => op.property.type === 'HOUSE').length,
    other: ownerProperties.filter(op => !['APARTMENT', 'HOUSE'].includes(op.property.type || '')).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard de Propiedades de Propietarios
            </h1>
            <p className="text-gray-600">
              Resumen completo de la gestión de propiedades y propietarios
            </p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="quarter">Este trimestre</option>
              <option value="year">Este año</option>
            </select>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              <Plus className="w-4 h-4 mr-2 inline" />
              Nuevo Propietario
            </button>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Propietarios</p>
              <p className="text-3xl font-bold text-gray-900">{totalOwners}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">{activeOwners} activos</span>
            <span className="text-gray-500 ml-2">• {ownersByStatus.pending} pendientes</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Propiedades</p>
              <p className="text-3xl font-bold text-gray-900">{totalProperties}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-600 font-medium">{propertiesByType.apartment} apartamentos</span>
            <span className="text-gray-500 ml-2">• {propertiesByType.house} casas</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalValue.toLocaleString('es-ES')}€
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+12.5%</span>
            <span className="text-gray-500 ml-2">vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reportes</p>
              <p className="text-3xl font-bold text-gray-900">{totalReports}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-purple-600 font-medium">{sentReports} enviados</span>
            <span className="text-gray-500 ml-2">• {totalReports - sentReports} pendientes</span>
          </div>
        </div>
      </div>

      {/* Gráficos y estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Propietarios por estado */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-orange-500" />
            Propietarios por Estado
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Activos</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{ownersByStatus.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Inactivos</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{ownersByStatus.inactive}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Pendientes</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{ownersByStatus.pending}</span>
            </div>
          </div>
        </div>

        {/* Propiedades por tipo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Propiedades por Tipo
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Apartamentos</span>
              <span className="text-sm font-medium text-gray-900">{propertiesByType.apartment}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Casas</span>
              <span className="text-sm font-medium text-gray-900">{propertiesByType.house}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Otros</span>
              <span className="text-sm font-medium text-gray-900">{propertiesByType.other}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Propietarios recientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-orange-500" />
              Propietarios Recientes
            </h3>
            <LinkComponent 
              href="/owners-property/owners"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Ver todos
            </LinkComponent>
          </div>
          <div className="space-y-3">
            {owners.slice(0, 5).map((owner) => (
              <div key={owner.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{owner.name}</p>
                    <p className="text-xs text-gray-500">{owner.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  owner.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  owner.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {OwnersPropertyService.getStatusDisplayName(owner.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Propiedades destacadas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Home className="w-5 h-5 mr-2 text-blue-500" />
              Propiedades Destacadas
            </h3>
            <LinkComponent 
              href="/owners-property/properties"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas
            </LinkComponent>
          </div>
          <div className="space-y-3">
            {ownerProperties.slice(0, 5).map((ownerProperty, index) => (
              <div key={`${ownerProperty.id}-${index}`} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{ownerProperty.property.title}</h4>
                  <span className="text-sm font-semibold text-orange-600">
                    {ownerProperty.property.price.toLocaleString('es-ES')}€
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{ownerProperty.property.address}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-600">
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    150 vistas
                  </span>
                  <span className="flex items-center">
                    <Heart className="w-3 h-3 mr-1" />
                    12 favoritas
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LinkComponent 
            href="/owners-property/owners"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <Users className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Gestionar Propietarios</h4>
              <p className="text-sm text-gray-500">Crear, editar y administrar propietarios</p>
            </div>
          </LinkComponent>
          
          <LinkComponent 
            href="/owners-property/properties"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <Home className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Gestionar Propiedades</h4>
              <p className="text-sm text-gray-500">Vincular y administrar propiedades</p>
            </div>
          </LinkComponent>
          
          <LinkComponent 
            href="/owners-property/reports"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Generar Reportes</h4>
              <p className="text-sm text-gray-500">Crear y enviar reportes personalizados</p>
            </div>
          </LinkComponent>
        </div>
      </div>
    </div>
  );
}
