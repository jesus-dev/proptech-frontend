"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  SparklesIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  EyeIcon,
  StarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { Property } from "../components/types";
import { propertyService } from "../services/propertyService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import RecommendationCard from "../components/RecommendationCard";
import PropertyImage from "../components/PropertyImage";
import Link from "next/link";

interface RecommendationCriteria {
  priceRange: [number, number];
  location: string[];
  propertyType: string[];
  bedrooms: number[];
  bathrooms: number[];
  area: [number, number];
  amenities: string[];
  features: string[];
  urgency: 'low' | 'medium' | 'high';
  investmentType: 'residential' | 'commercial' | 'investment' | 'luxury';
}

interface UserBehavior {
  viewedProperties: string[];
  favoritedProperties: string[];
  contactedProperties: string[];
  searchHistory: string[];
  preferences: Partial<RecommendationCriteria>;
}

interface RecommendationScore {
  property: Property;
  score: number;
  factors: {
    priceMatch: number;
    locationMatch: number;
    typeMatch: number;
    amenityMatch: number;
    popularity: number;
    urgency: number;
    investmentPotential: number;
    marketTrend: number;
  };
  explanation: string[];
}

export default function PropertyRecommendationsPage() {

  const router = useRouter();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [userBehavior, setUserBehavior] = useState<UserBehavior>({
    viewedProperties: [],
    favoritedProperties: [],
    contactedProperties: [],
    searchHistory: [],
    preferences: {}
  });
  const [criteria, setCriteria] = useState<RecommendationCriteria>({
    priceRange: [0, 1000000],
    location: [],
    propertyType: [],
    bedrooms: [1, 2, 3, 4, 5],
    bathrooms: [1, 2, 3, 4],
    area: [50, 500],
    amenities: [],
    features: [],
    urgency: 'medium',
    investmentType: 'residential'
  });
  const [activeTab, setActiveTab] = useState<'smart' | 'custom' | 'trending' | 'ai'>('smart');
  const [showFilters, setShowFilters] = useState(false);

  // Cargar propiedades con timeout de seguridad
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const loadProperties = async () => {
      // Timeout de seguridad: forzar fin después de 12 segundos
      timeoutId = setTimeout(() => {
        console.warn('⚠️ Timeout cargando propiedades para recomendaciones');
        setLoading(false);
      }, 12000);

      try {
        setLoading(true);
        const response = await propertyService.getAllProperties();
        clearTimeout(timeoutId);
        setAllProperties(Array.isArray(response) ? response : response.data || []);
        
        // Simular comportamiento del usuario (en producción vendría de analytics)
        simulateUserBehavior();
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Simular comportamiento del usuario
  const simulateUserBehavior = () => {
    const mockBehavior: UserBehavior = {
      viewedProperties: ['1', '3', '5', '7'],
      favoritedProperties: ['3', '7'],
      contactedProperties: ['3'],
      searchHistory: ['casa villa morra', 'apartamento centro', 'quinta san bernardino'],
      preferences: {
        priceRange: [50000, 300000],
        location: ['Villa Morra', 'Centro'],
        propertyType: ['Casa', 'Apartamento'],
        bedrooms: [2, 3, 4],
        bathrooms: [2, 3],
        area: [100, 300]
      }
    };
    setUserBehavior(mockBehavior);
  };

  // Calcular factores de recomendación
  const calculateRecommendationFactors = (
    property: Property, 
    criteria: RecommendationCriteria, 
    behavior: UserBehavior
  ) => {
    const factors = {
      priceMatch: 0,
      locationMatch: 0,
      typeMatch: 0,
      amenityMatch: 0,
      popularity: 0,
      urgency: 0,
      investmentPotential: 0,
      marketTrend: 0
    };

    // Factor de precio (0-1)
    const price = property.price || 0;
    const [minPrice, maxPrice] = criteria.priceRange;
    if (price >= minPrice && price <= maxPrice) {
      factors.priceMatch = 1;
    } else if (price < minPrice) {
      factors.priceMatch = 0.8; // Bonus por estar bajo el presupuesto
    } else {
      factors.priceMatch = Math.max(0, 1 - (price - maxPrice) / maxPrice);
    }

    // Factor de ubicación (0-1)
    if (criteria.location.length > 0) {
      const propertyLocation = property.city?.toLowerCase() || '';
      const locationMatch = criteria.location.some(loc => 
        propertyLocation.includes(loc.toLowerCase())
      );
      factors.locationMatch = locationMatch ? 1 : 0.3;
    } else {
      factors.locationMatch = 0.5; // Neutral si no hay preferencia
    }

    // Factor de tipo de propiedad (0-1)
    if (criteria.propertyType.length > 0) {
      const propertyType = property.type?.toLowerCase() || '';
      const typeMatch = criteria.propertyType.some(type => 
        propertyType.includes(type.toLowerCase())
      );
      factors.typeMatch = typeMatch ? 1 : 0.3;
    } else {
      factors.typeMatch = 0.7; // Neutral si no hay preferencia
    }

    // Factor de amenidades (0-1)
    if (criteria.amenities.length > 0 && property.amenities && Array.isArray(property.amenities)) {
      // Since amenities is number[], we'll use a simple count-based approach
      const amenityCount = property.amenities.length;
      const criteriaCount = criteria.amenities.length;
      factors.amenityMatch = Math.min(amenityCount / Math.max(criteriaCount, 1), 1);
    } else {
      factors.amenityMatch = 0.5;
    }

    // Factor de popularidad (basado en comportamiento del usuario)
    const isViewed = behavior.viewedProperties.includes(property.id?.toString() || '');
    const isFavorited = behavior.favoritedProperties.includes(property.id?.toString() || '');
    const isContacted = behavior.contactedProperties.includes(property.id?.toString() || '');
    
    factors.popularity = (isViewed ? 0.3 : 0) + (isFavorited ? 0.4 : 0) + (isContacted ? 0.3 : 0);

    // Factor de urgencia (propiedades destacadas/premium)
    factors.urgency = (property.featured ? 0.3 : 0) + (property.premium ? 0.4 : 0) + 0.3;

    // Factor de potencial de inversión
    const pricePerM2 = property.price && property.area ? property.price / property.area : 0;
    const avgPricePerM2 = 1500; // Precio promedio por m² en Paraguay
    factors.investmentPotential = pricePerM2 < avgPricePerM2 ? 0.8 : 0.4;

    // Factor de tendencia del mercado (simulado)
    factors.marketTrend = Math.random() * 0.4 + 0.6; // Entre 0.6 y 1.0

    return factors;
  };

  const calculateTotalScore = (factors: any) => {
    const weights = {
      priceMatch: 0.25,
      locationMatch: 0.20,
      typeMatch: 0.15,
      amenityMatch: 0.10,
      popularity: 0.10,
      urgency: 0.08,
      investmentPotential: 0.07,
      marketTrend: 0.05
    };

    return Object.keys(factors).reduce((total, factor) => {
      return total + (factors[factor] * weights[factor as keyof typeof weights]);
    }, 0);
  };

  const generateExplanation = (factors: any, property: Property) => {
    const explanations: string[] = [];

    if (factors.priceMatch > 0.8) {
      explanations.push("✅ Perfecto para tu presupuesto");
    }
    if (factors.locationMatch > 0.8) {
      explanations.push("📍 En tu zona preferida");
    }
    if (factors.typeMatch > 0.8) {
      explanations.push("🏠 Tipo de propiedad que buscas");
    }
    if (factors.amenityMatch > 0.7) {
      explanations.push("✨ Tiene las amenidades que necesitas");
    }
    if (factors.popularity > 0.5) {
      explanations.push("👥 Muy popular entre usuarios similares");
    }
    if (factors.urgency > 0.7) {
      explanations.push("🔥 Propiedad destacada");
    }
    if (factors.investmentPotential > 0.7) {
      explanations.push("📈 Excelente potencial de inversión");
    }

    return explanations;
  };

  // Algoritmo de recomendación inteligente
  const generateRecommendations = useMemo(() => {
    if (!Array.isArray(allProperties) || allProperties.length === 0) return [];

    const scoredProperties: RecommendationScore[] = allProperties.map(property => {
      const factors = calculateRecommendationFactors(property, criteria, userBehavior);
      const totalScore = calculateTotalScore(factors);
      const explanation = generateExplanation(factors, property);

      return {
        property,
        score: totalScore,
        factors,
        explanation
      };
    });

    // Ordenar por score descendente y filtrar por umbral mínimo
    return scoredProperties
      .filter(rec => rec.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [allProperties, criteria, userBehavior]);

  // Actualizar recomendaciones cuando cambien los criterios
  useEffect(() => {
    setRecommendations(generateRecommendations);
  }, [generateRecommendations]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-blue-600 bg-blue-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8 w-full min-w-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl">
                  <SparklesIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-800 dark:from-white dark:via-blue-200 dark:to-slate-200 bg-clip-text text-transparent">
                    Recomendador Inteligente
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Descubre propiedades perfectas para ti usando IA avanzada
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 flex items-center shadow-lg"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filtros
              </button>
              <button
                onClick={() => router.push('/properties')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-lg hover:from-blue-700 hover:to-slate-800 flex items-center shadow-lg"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Ver Todas
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl mb-8">
            <div className="border-b-2 border-gray-300 dark:border-gray-700">
             <nav className="flex gap-2 sm:gap-4 px-1 sm:px-6 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 py-2 sm:py-4 backdrop-blur-md" aria-label="Tabs">
              {[
                { id: 'smart', name: 'Recomendaciones Inteligentes', icon: SparklesIcon, description: 'Basado en tu comportamiento' },
                { id: 'custom', name: 'Búsqueda Personalizada', icon: AdjustmentsHorizontalIcon, description: 'Define tus criterios' },
                { id: 'trending', name: 'Tendencias del Mercado', icon: SparklesIcon, description: 'Propiedades populares' },
                { id: 'ai', name: 'IA Predictiva', icon: RocketLaunchIcon, description: 'Análisis avanzado' }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      isActive
                        ? 'border-blue-600 text-blue-700 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div>{tab.name}</div>
                      <div className="text-xs text-slate-400">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Filtros Avanzados */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl mb-8 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Filtros Inteligentes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Rango de Precio */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Rango de Precio
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={criteria.priceRange[0]}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]]
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    value={criteria.priceRange[1]}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], parseInt(e.target.value) || 1000000]
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Tipo de Inversión */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tipo de Inversión
                </label>
                <select
                  value={criteria.investmentType}
                  onChange={(e) => setCriteria(prev => ({
                    ...prev,
                    investmentType: e.target.value as any
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="residential">Residencial</option>
                  <option value="commercial">Comercial</option>
                  <option value="investment">Inversión</option>
                  <option value="luxury">Lujo</option>
                </select>
              </div>

              {/* Urgencia */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Urgencia
                </label>
                <select
                  value={criteria.urgency}
                  onChange={(e) => setCriteria(prev => ({
                    ...prev,
                    urgency: e.target.value as any
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              {/* Habitaciones */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Habitaciones
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      onClick={() => {
                        const current = criteria.bedrooms;
                        const newBedrooms = current.includes(num)
                          ? current.filter(b => b !== num)
                          : [...current, num];
                        setCriteria(prev => ({ ...prev, bedrooms: newBedrooms }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        criteria.bedrooms.includes(num)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {num}+
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas de Recomendaciones */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 w-full min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Recomendaciones</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{recommendations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Score Promedio</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {recommendations.length > 0 
                    ? Math.round((recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl">
                <EyeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Propiedades Vistas</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{userBehavior.viewedProperties.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl">
                <HeartIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Favoritos</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{userBehavior.favoritedProperties.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Recomendaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-w-0 overflow-x-auto">
          {recommendations.map((recommendation, index) => (
            <div
              key={recommendation.property.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Score Badge */}
              <div className="relative">
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(recommendation.score)}`}>
                  {(recommendation.score * 100).toFixed(0)}%
                </div>
                
                {/* Imagen */}
                <div className="h-48 bg-sky-100 relative overflow-hidden rounded-t-2xl">
                  {(() => {
                    const { featuredImage, images, propertyGalleryImages, title } = recommendation.property;
                    let imageUrl = featuredImage;
                    if (!imageUrl && Array.isArray(images) && images.length > 0) imageUrl = images[0];
                    if (!imageUrl && Array.isArray(propertyGalleryImages) && propertyGalleryImages.length > 0) imageUrl = propertyGalleryImages[0];
                    
                    return (
                      <PropertyImage
                        imageUrl={imageUrl}
                        title={title}
                        className="w-full h-full object-cover"
                        placeholderClassName="w-full h-full flex items-center justify-center bg-sky-200"
                        onError={(error) => {
                          // El componente ya maneja el logging, aquí podrías agregar analytics si es necesario
                        }}
                      />
                    );
                  })()}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {recommendation.property.title}
                  </h3>
                  <div className="flex space-x-1">
                    {recommendation.property.featured && (
                      <StarIcon className="h-5 w-5 text-yellow-500" />
                    )}
                    {recommendation.property.premium && (
                      <SparklesIcon className="h-5 w-5 text-purple-500" />
                    )}
                  </div>
                </div>

                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{recommendation.property.address}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(recommendation.property.price || 0, recommendation.property.currency)}
                  </span>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <HomeIcon className="h-4 w-4 mr-1" />
                      {recommendation.property.bedrooms || 0}
                    </span>
                    <span className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                      {recommendation.property.bathrooms || 0}
                    </span>
                  </div>
                </div>

                {/* Explicación de la recomendación */}
                <div className="space-y-2 mb-4">
                  {recommendation.explanation.slice(0, 3).map((explanation, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                      {explanation}
                    </div>
                  ))}
                </div>

                {/* Acciones */}
                <div className="flex space-x-2">
                  <Link
                    href={`/properties/${recommendation.property.id}`}
                    className="flex-1 px-4 py-2 bg-sky-500 text-white text-center rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    Ver Detalles
                  </Link>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <HeartIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje si no hay recomendaciones */}
        {recommendations.length === 0 && (
          <div className="text-center py-12">
            <SparklesIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay recomendaciones disponibles
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ajusta tus filtros o explora todas las propiedades disponibles
            </p>
            <button
              onClick={() => router.push('/properties')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              Explorar Propiedades
            </button>
          </div>
        )}

        {/* Información del Algoritmo */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <InformationCircleIcon className="h-5 w-5 mr-2" />
            ¿Cómo funciona nuestro recomendador?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Factores Analizados</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• <strong>Precio:</strong> Comparación con tu presupuesto</li>
                <li>• <strong>Ubicación:</strong> Zonas que prefieres</li>
                <li>• <strong>Tipo:</strong> Propiedades similares a las que has visto</li>
                <li>• <strong>Amenidades:</strong> Características que buscas</li>
                <li>• <strong>Popularidad:</strong> Propiedades favoritas por usuarios similares</li>
                <li>• <strong>Potencial:</strong> Análisis de inversión y mercado</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Algoritmo Inteligente</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• <strong>Machine Learning:</strong> Aprende de tu comportamiento</li>
                <li>• <strong>Análisis Predictivo:</strong> Predice tus preferencias</li>
                <li>• <strong>Filtrado Colaborativo:</strong> Usa datos de usuarios similares</li>
                <li>• <strong>Actualización en Tiempo Real:</strong> Se adapta a tus cambios</li>
                <li>• <strong>Análisis de Mercado:</strong> Considera tendencias actuales</li>
                <li>• <strong>Score Personalizado:</strong> Cada recomendación es única</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 