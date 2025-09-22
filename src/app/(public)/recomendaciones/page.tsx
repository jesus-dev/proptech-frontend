"use client";

import { BuildingOfficeIcon, CurrencyDollarIcon, EyeIcon, FireIcon, FunnelIcon, HeartIcon, HomeIcon, MagnifyingGlassIcon, MapPinIcon, SparklesIcon, StarIcon, XMarkIcon } from "@heroicons/react/24/outline";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// Tipos locales para evitar dependencias de (proptech)
interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images: string[];
}

interface PropertyRecommendation {
  property: Property;
  score: number;
  reasons: string[];
}

export default function PublicRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<PropertyRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: '',
    location: '',
    type: '',
    bedrooms: '',
    search: ''
  });

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      // Datos de ejemplo para evitar dependencias de (proptech)
      const mockProperties: Property[] = [
        {
          id: '1',
          title: 'Casa moderna en Asunción',
          address: 'Av. Mariscal López 1234',
          city: 'Asunción',
          price: 150000,
          type: 'Casa',
          bedrooms: 3,
          bathrooms: 2,
          area: 120,
          images: ['/images/property1.jpg']
        },
        {
          id: '2',
          title: 'Apartamento en Ciudad del Este',
          address: 'Av. San Blas 567',
          city: 'Ciudad del Este',
          price: 80000,
          type: 'Apartamento',
          bedrooms: 2,
          bathrooms: 1,
          area: 80,
          images: ['/images/property2.jpg']
        }
      ];
      
      // Generar recomendaciones simples
      const recommendations: PropertyRecommendation[] = mockProperties.map(property => ({
        property,
        score: Math.random() * 100,
        reasons: ['Ubicación estratégica', 'Precio competitivo', 'Características ideales']
      }));
      
      setRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setError('Error al cargar las recomendaciones');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const property = rec.property;
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const title = property.title?.toLowerCase() || '';
      const address = property.address?.toLowerCase() || '';
      const description = property.description?.toLowerCase() || '';
      
      if (!title.includes(searchLower) && 
          !address.includes(searchLower) && 
          !description.includes(searchLower)) {
        return false;
      }
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (property.price) {
        if (max && property.price > max) return false;
        if (min && property.price < min) return false;
      }
    }

    if (filters.location && property.city) {
      if (!property.city.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
    }

    if (filters.type && property.propertyType) {
      if (property.propertyType !== filters.type) return false;
    }

    if (filters.bedrooms && property.bedrooms) {
      if (property.bedrooms < parseInt(filters.bedrooms)) return false;
    }

    return true;
  });

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-blue-700 bg-blue-100 dark:bg-blue-900/20';
    if (score >= 0.6) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30';
    if (score >= 0.4) return 'text-blue-500 bg-blue-50/50 dark:bg-blue-900/10';
    return 'text-gray-500 bg-gray-50 dark:bg-gray-700';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excelente';
    if (score >= 0.6) return 'Muy Bueno';
    if (score >= 0.4) return 'Bueno';
    return 'Regular';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando recomendaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadRecommendations}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Propiedades Recomendadas
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre las mejores propiedades seleccionadas especialmente para ti, 
              basadas en tus preferencias y las tendencias del mercado.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HomeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recomendadas</p>
                <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <StarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Puntuación Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(recommendations.reduce((sum, rec) => sum + rec.score.totalScore, 0) / recommendations.length * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FireIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tendencias</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recommendations.filter(rec => rec.score.totalScore > 0.7).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MapPinIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ubicaciones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(recommendations.map(rec => rec.property.city).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-xl border border-white/30 rounded-xl hover:bg-white transition-all duration-300 shadow-lg"
            >
              <FunnelIcon className="h-5 w-5 mr-2 text-gray-600" />
              Filtros
            </button>
            
            <div className="flex bg-white/90 backdrop-blur-xl rounded-xl p-1 shadow-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lista
              </button>
            </div>
          </div>

          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar propiedades..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 pr-4 py-2 bg-white/90 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 w-64"
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                className="px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los precios</option>
                <option value="0-50000">Hasta $50,000</option>
                <option value="50000-100000">$50,000 - $100,000</option>
                <option value="100000-200000">$100,000 - $200,000</option>
                <option value="200000-500000">$200,000 - $500,000</option>
                <option value="500000-1000000">Más de $500,000</option>
              </select>

              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las ubicaciones</option>
                <option value="Asunción">Asunción</option>
                <option value="San Lorenzo">San Lorenzo</option>
                <option value="Luque">Luque</option>
                <option value="Capiatá">Capiatá</option>
              </select>

              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                <option value="Casa">Casa</option>
                <option value="Departamento">Departamento</option>
                <option value="Terreno">Terreno</option>
                <option value="Oficina">Oficina</option>
              </select>

              <select
                value={filters.bedrooms}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                className="px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Cualquier dormitorio</option>
                <option value="1">1+ dormitorio</option>
                <option value="2">2+ dormitorios</option>
                <option value="3">3+ dormitorios</option>
                <option value="4">4+ dormitorios</option>
              </select>

              <button
                onClick={() => setFilters({ priceRange: '', location: '', type: '', bedrooms: '', search: '' })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron recomendaciones
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar los filtros o busca con otros criterios.
            </p>
            <button
              onClick={() => setFilters({ priceRange: '', location: '', type: '', bedrooms: '', search: '' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredRecommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.property.id}
                recommendation={recommendation}
                viewMode={viewMode}
                formatCurrency={formatCurrency}
                getScoreColor={getScoreColor}
                getScoreLabel={getScoreLabel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Recommendation Card Component
function RecommendationCard({ 
  recommendation, 
  viewMode, 
  formatCurrency, 
  getScoreColor, 
  getScoreLabel 
}: {
  recommendation: PropertyRecommendation;
  viewMode: 'grid' | 'list';
  formatCurrency: (amount: number, currency: string) => string;
  getScoreColor: (score: number) => string;
  getScoreLabel: (score: number) => string;
}) {
  const { property, score } = recommendation;

  // Preferencia de imagen: featuredImage > images[0] > propertyGalleryImages[0]
  let imageUrl = property.featuredImage;
  if (!imageUrl && Array.isArray(property.images) && property.images.length > 0) {
    imageUrl = property.images[0];
  }
  if (!imageUrl && Array.isArray(property.propertyGalleryImages) && property.propertyGalleryImages.length > 0) {
    imageUrl = property.propertyGalleryImages[0];
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
        <div className="flex">
          <div className="w-48 h-32 bg-sky-100 relative overflow-hidden rounded-l-2xl flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BuildingOfficeIcon className="w-12 h-12 text-sky-600" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
          
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {property.title}
                </h3>
                <p className="text-gray-600 mb-2">{property.address}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <HomeIcon className="h-4 w-4 mr-1" />
                    {property.bedrooms || 0} dorm.
                  </span>
                  <span className="flex items-center">
                    <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                    {property.bathrooms || 0} baños
                  </span>
                  <span className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {property.area || 0}m²
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {property.price ? formatCurrency(property.price, property.currency || 'USD') : 'Consultar'}
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(score.totalScore)}`}>
                  {getScoreLabel(score.totalScore)} ({Math.round(score.totalScore * 100)}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Link
                href={`/properties/${property.id}`}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium"
              >
                Ver Detalles
              </Link>
              <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <HeartIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image */}
      <div className="h-48 bg-sky-100 relative overflow-hidden rounded-t-2xl flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <BuildingOfficeIcon className="w-12 h-12 text-sky-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Score Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(score.totalScore)}`}>
            {getScoreLabel(score.totalScore)}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
          {property.title}
        </h3>
        <p className="text-gray-600 mb-3 text-sm">{property.address}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-gray-900">
            {property.price ? formatCurrency(property.price, property.currency || 'USD') : 'Consultar'}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <HomeIcon className="h-4 w-4 mr-1" />
              {property.bedrooms || 0}
            </span>
            <span className="flex items-center">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              {property.bathrooms || 0}
            </span>
          </div>
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {property.area || 0}m²
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-3">
          <Link
            href={`/properties/${property.id}`}
            className="flex-1 px-4 py-3 bg-sky-500 text-white text-center rounded-lg hover:bg-sky-600 transition-colors font-medium flex items-center justify-center min-h-[44px]"
          >
            <span className="text-sm font-semibold">Ver Detalles</span>
          </Link>
          <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center min-h-[44px]">
            <HeartIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 