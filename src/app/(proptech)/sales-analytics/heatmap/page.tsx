"use client";

import React, { useEffect, useState } from "react";
import { 
  MapPinIcon, 
  FireIcon, 
  FunnelIcon, 
  ChartBarIcon,
  EyeIcon,
  CurrencyDollarIcon,
  HomeIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  AdjustmentsHorizontalIcon,
  ArrowTrendingUpIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { propertyService } from "../../properties/services/propertyService";
import type { Property } from "../../properties/components/types";
import HeatmapMap from "@/components/HeatmapMap";

interface HeatmapData {
  lat: number;
  lng: number;
  intensity: number;
  property: Property;
}

interface FilterOptions {
  priceRange: string;
  propertyType: string;
  status: string;
  city: string;
  search: string;
}

// Helper for compact notation
function formatCompactCurrency(value: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

export default function HeatmapPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: '',
    propertyType: '',
    status: '',
    city: '',
    search: ''
  });
  const [zoom, setZoom] = useState(13);
  const [isClient, setIsClient] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    generateHeatmapData();
  }, [properties, filters]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyService.getAllProperties();
      // Manejar tanto array directo como objeto con data
      const allProperties = Array.isArray(response) ? response : (response?.data || []);
      setProperties(allProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      setError('Error al cargar las propiedades');
    } finally {
      setLoading(false);
    }
  };

  const generateHeatmapData = () => {
    // Asegurar que properties sea un array
    const propertiesArray = Array.isArray(properties) ? properties : [];
    
    
    const filteredProperties = propertiesArray.filter(property => {
      // Filtro por búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const title = property.title?.toLowerCase() || '';
        const address = property.address?.toLowerCase() || '';
        const city = property.city?.toLowerCase() || '';
        
        if (!title.includes(searchLower) && 
            !address.includes(searchLower) && 
            !city.includes(searchLower)) {
          return false;
        }
      }

      // Filtro por rango de precio
      if (filters.priceRange && property.price) {
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (max && property.price > max) return false;
        if (min && property.price < min) return false;
      }

      // Filtro por tipo de propiedad
      if (filters.propertyType && property.propertyType) {
        if (property.propertyType !== filters.propertyType) return false;
      }

      // Filtro por estado
      if (filters.status && property.status) {
        if (property.status !== filters.status) return false;
      }

      // Filtro por ciudad
      if (filters.city && property.city) {
        if (property.city !== filters.city) return false;
      }

      return true;
    });

    // Generar datos de heatmap
    const heatmapPoints: HeatmapData[] = [];
    
    filteredProperties.forEach(property => {
      if (property.latitude && property.longitude) {
        // Calcular intensidad basada en el precio y características
        let intensity = 1;
        
        if (property.price) {
          // Normalizar precio (0-1)
          const maxPrice = Math.max(...filteredProperties.map(p => p.price || 0));
          intensity = (property.price / maxPrice) * 100;
        }
        
        // Ajustar por características
        if (property.bedrooms) intensity += property.bedrooms * 5;
        if (property.bathrooms) intensity += property.bathrooms * 3;
        if (property.area) intensity += (property.area / 100) * 2;
        
        // Propiedades destacadas tienen mayor intensidad
        if (property.featured) intensity *= 1.5;
        if (property.premium) intensity *= 1.3;

        heatmapPoints.push({
          lat: property.latitude,
          lng: property.longitude,
          intensity: Math.min(intensity, 100),
          property
        });
      }
    });

    
    // Si no hay datos reales, no mostrar nada en el heatmap
    if (heatmapPoints.length === 0) {
      setHeatmapData([]);
      return;
    }
    setHeatmapData(heatmapPoints);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStats = () => {
    // Asegurar que properties sea un array
    const propertiesArray = Array.isArray(properties) ? properties : [];
    
    const totalProperties = propertiesArray.length;
    const propertiesWithCoords = propertiesArray.filter(p => p.latitude && p.longitude).length;
    const propertiesWithoutCoords = totalProperties - propertiesWithCoords;
    const totalValue = propertiesArray.reduce((sum, p) => sum + (p.price || 0), 0);
    const avgPrice = totalProperties > 0 ? totalValue / totalProperties : 0;
    const cities = new Set(propertiesArray.map(p => p.city).filter(Boolean)).size;
    const coordsPercentage = totalProperties > 0 ? (propertiesWithCoords / totalProperties) * 100 : 0;

    return {
      totalProperties,
      propertiesWithCoords,
      propertiesWithoutCoords,
      totalValue,
      avgPrice,
      cities,
      coordsPercentage
    };
  };

  const getMarkerColor = (intensity: number) => {
    if (intensity >= 80) return '#ef4444'; // Red
    if (intensity >= 60) return '#f97316'; // Orange
    if (intensity >= 40) return '#eab308'; // Yellow
    if (intensity >= 20) return '#22c55e'; // Green
    return '#3b82f6'; // Blue
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Cargando mapa de calor...</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Preparando visualización de datos</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FireIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error de Carga</h2>
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <button
            onClick={loadProperties}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Title Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <FireIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-900 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent flex items-center">
                  Mapa de Calor Inmobiliario
                  <SparklesIcon className="h-6 w-6 ml-2 text-yellow-500" />
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Visualiza la concentración y distribución de propiedades en Ciudad del Este
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/30"
              >
                <AdjustmentsHorizontalIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Filtros
              </button>
              <button
                onClick={() => window.location.reload()}
                className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/30"
              >
                <GlobeAltIcon className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                Recargar
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <HomeIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Propiedades</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProperties.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                <MapPinIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Con Coordenadas</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.propertiesWithCoords.toLocaleString()}</p>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    ({stats.coordsPercentage.toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCompactCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Precio Promedio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCompactCurrency(stats.avgPrice)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ciudades</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.cities}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filtros Avanzados
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar propiedades..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm transition-all duration-200"
                />
              </div>
              
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                className="px-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm transition-all duration-200"
              >
                <option value="">Todos los precios</option>
                <option value="0-50000">Hasta $50K</option>
                <option value="50000-100000">$50K - $100K</option>
                <option value="100000-200000">$100K - $200K</option>
                <option value="200000-500000">$200K - $500K</option>
                <option value="500000-">Más de $500K</option>
              </select>
              
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                className="px-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm transition-all duration-200"
              >
                <option value="">Todos los tipos</option>
                <option value="casa">Casa</option>
                <option value="apartamento">Apartamento</option>
                <option value="terreno">Terreno</option>
                <option value="comercial">Comercial</option>
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm transition-all duration-200"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
                <option value="sold">Vendida</option>
              </select>
              
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="px-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm transition-all duration-200"
              >
                <option value="">Todas las ciudades</option>
                <option value="Asunción">Asunción</option>
                <option value="San Lorenzo">San Lorenzo</option>
                <option value="Luque">Luque</option>
                <option value="Capiatá">Capiatá</option>
                <option value="Lambaré">Lambaré</option>
              </select>
            </div>
          </div>
        )}

        {/* Warning si no hay coordenadas */}
        {stats.propertiesWithoutCoords > 0 && (
          <div className="bg-amber-50/80 dark:bg-amber-900/20 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200/50 dark:border-amber-800/50 p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  {stats.propertiesWithoutCoords} {stats.propertiesWithoutCoords === 1 ? 'propiedad sin' : 'propiedades sin'} coordenadas
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                  Estas propiedades no aparecen en el mapa. Para visualizarlas, necesitan tener latitud y longitud.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const propertiesWithoutCoords = properties.filter(p => !p.latitude || !p.longitude);
                      console.log('Propiedades sin coordenadas:', propertiesWithoutCoords);
                      alert(`${propertiesWithoutCoords.length} propiedades sin coordenadas.\nRevisa la consola para más detalles.`);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Ver Lista
                  </button>
                  <a
                    href="/properties"
                    className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-lg shadow-sm hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <HomeIcon className="w-4 h-4 mr-2" />
                    Ir a Propiedades
                  </a>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
                  💡 Puedes agregar coordenadas editando cada propiedad o usando servicios de geocodificación
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Visualización de Calor
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {heatmapData.length} puntos de calor detectados
                  {heatmapData.length === 0 && stats.totalProperties > 0 && (
                    <span className="ml-2 text-amber-600 dark:text-amber-400">
                      · Agrega coordenadas a tus propiedades para visualizarlas
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Alta intensidad</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Baja intensidad</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-[600px] relative">
            {heatmapData.length === 0 && stats.totalProperties > 0 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <div className="text-center max-w-md p-8">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPinIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Sin Datos Geográficos
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Tus propiedades necesitan coordenadas (latitud y longitud) para aparecer en el mapa.
                  </p>
                  <div className="space-y-3 text-sm text-left bg-white/80 dark:bg-gray-800/80 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">1.</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        Edita tus propiedades y agrega las coordenadas manualmente
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">2.</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        Usa un servicio de geocodificación para obtenerlas automáticamente
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">3.</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        Las coordenadas de Ciudad del Este: Lat: -25.5095, Lng: -54.6154
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : isClient && (
              <HeatmapMap
                heatmapData={heatmapData}
                zoom={zoom}
                formatCurrency={formatCurrency}
                getMarkerColor={getMarkerColor}
                onPropertyClick={setSelectedProperty}
              />
            )}
          </div>
        </div>

        {/* Property Detail Modal */}
        {selectedProperty && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Detalles de la Propiedad
                  </h2>
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedProperty.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedProperty.address}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Precio</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(selectedProperty.price || 0, selectedProperty.currency || 'USD')}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tipo</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {selectedProperty.propertyType || 'No especificado'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Habitaciones</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedProperty.bedrooms || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Baños</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedProperty.bathrooms || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedProperty(null)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={() => window.open(`/properties/${selectedProperty.id}`, '_blank')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 