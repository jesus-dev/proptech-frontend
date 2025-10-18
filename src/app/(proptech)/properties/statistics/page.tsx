"use client";
import React, { useEffect, useState } from "react";
import { 
  HomeIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  TrophyIcon,
  StarIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";
import { apiClient } from '@/lib/api';

export default function PropertyStatisticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30'); // 7, 30, 90, 365
  const [propertyType, setPropertyType] = useState('all');
  const [operation, setOperation] = useState('all');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params = new URLSearchParams({
          days: dateRange,
          type: propertyType !== 'all' ? propertyType : '',
          operation: operation !== 'all' ? operation : ''
        });
        
        const response = await apiClient.get(`/api/properties/statistics/summary?${params}`);
        setStats(response.data);
      } catch (err) {
        setError("No se pudieron cargar las estadísticas");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dateRange, propertyType, operation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="text-center">
            <ChartBarIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar estadísticas</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalViews = stats.totalViews || 0;
  const totalFavorites = stats.totalFavorites || 0;
  const totalShares = stats.totalShares || 0;
  const totalProperties = stats.totalProperties || 0;
  const averageViews = stats.averageViews || 0;
  const averageFavorites = stats.averageFavorites || 0;
  const mostViewed = stats.mostViewed || [];
  const mostFavorited = stats.mostFavorited || [];
  const engagementRate = totalViews > 0 ? ((totalFavorites / totalViews) * 100) : 0;
  
  // Nuevas métricas
  const totalContacts = stats.totalContacts || 0;
  const averagePrice = stats.averagePrice || 0;
  const propertiesByType = stats.propertiesByType || {};
  const propertiesByOperation = stats.propertiesByOperation || {};
  const viewsTrend = stats.viewsTrend || [];
  const conversionRate = totalViews > 0 ? ((totalContacts / totalViews) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Estadísticas de Propiedades
          </h1>
          <p className="text-gray-600">
            Análisis completo del rendimiento de tu portafolio inmobiliario
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-500" />
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 90 días</option>
                <option value="365">Último año</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
              <select 
                value={propertyType} 
                onChange={(e) => setPropertyType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Todos los tipos</option>
                <option value="Casa">Casas</option>
                <option value="Departamento">Departamentos</option>
                <option value="Terreno">Terrenos</option>
                <option value="Oficina">Oficinas</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-500" />
              <select 
                value={operation} 
                onChange={(e) => setOperation(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Todas las operaciones</option>
                <option value="VENTA">Venta</option>
                <option value="ALQUILER">Alquiler</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <HomeIcon className="w-8 h-8 text-blue-500" />
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {totalProperties}
            </h3>
            <p className="text-gray-600 text-sm">Total de Propiedades</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <EyeIcon className="w-8 h-8 text-green-500" />
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {totalViews.toLocaleString()}
            </h3>
            <p className="text-gray-600 text-sm">Total de Vistas</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <HeartIcon className="w-8 h-8 text-red-500" />
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {totalFavorites}
            </h3>
            <p className="text-gray-600 text-sm">Favoritos</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <PhoneIcon className="w-8 h-8 text-purple-500" />
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {totalContacts}
            </h3>
            <p className="text-gray-600 text-sm">Contactos</p>
          </div>
        </div>

        {/* Métricas de Rendimiento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Engagement</h2>
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-gray-900">Engagement rate</span>
                <span className="text-xl font-bold text-blue-600">
                  {engagementRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-gray-900">Conversión</span>
                <span className="text-xl font-bold text-purple-600">
                  {conversionRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Promedios</h2>
              <ChartBarIcon className="w-6 h-6 text-blue-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-gray-900">Vistas promedio</span>
                <span className="text-xl font-bold text-green-600">
                  {Math.round(averageViews)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-gray-900">Favoritos promedio</span>
                <span className="text-xl font-bold text-red-600">
                  {Math.round(averageFavorites)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Precio Promedio</h2>
              <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ${averagePrice.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Precio promedio por propiedad</p>
            </div>
          </div>
        </div>

        {/* Distribución por Tipo y Operación */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5 text-blue-500" />
              Distribución por Tipo
            </h2>
            <div className="space-y-3">
              {Object.entries(propertiesByType).map(([type, count]: [string, any]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{type}</span>
                  <span className="text-lg font-bold text-blue-600">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
              Distribución por Operación
            </h2>
            <div className="space-y-3">
              {Object.entries(propertiesByOperation).map(([operation, count]: [string, any]) => (
                <div key={operation} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{operation}</span>
                  <span className="text-lg font-bold text-green-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Más Vistas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-500 p-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrophyIcon className="w-5 h-5" />
                Top Más Vistas
              </h2>
            </div>
            <div className="p-4">
              {mostViewed.length > 0 ? (
                <div className="space-y-3">
                  {mostViewed.slice(0, 5).map((property: any, idx: number) => (
                    <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold
                          ${idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                            idx === 1 ? 'bg-gray-100 text-gray-800' :
                            idx === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'}`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{property.title}</div>
                          <div className="text-xs text-gray-500">{property.address}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          <EyeIcon className="w-3 h-3" />
                          {property.views || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No hay datos de propiedades más vistas</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Más Favoritas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-red-500 p-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <StarIcon className="w-5 h-5" />
                Top Más Favoritas
              </h2>
            </div>
            <div className="p-4">
              {mostFavorited.length > 0 ? (
                <div className="space-y-3">
                  {mostFavorited.slice(0, 5).map((property: any, idx: number) => (
                    <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold
                          ${idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                            idx === 1 ? 'bg-gray-100 text-gray-800' :
                            idx === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'}`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{property.title}</div>
                          <div className="text-xs text-gray-500">{property.address}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                          <HeartIcon className="w-3 h-3" />
                          {property.favorites || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HeartIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No hay datos de propiedades más favoritas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 