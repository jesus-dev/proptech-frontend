import React from "react";
import Link from "next/link";
import { 
  StarIcon, 
  SparklesIcon, 
  MapPinIcon, 
  HomeIcon, 
  BuildingOfficeIcon,
  CheckCircleIcon,
  HeartIcon
} from "@heroicons/react/24/outline";
import { Property } from "./types";
import { PropertyRecommendation } from "../services/recommendationService";

interface RecommendationCardProps {
  recommendation: PropertyRecommendation;
  onFavorite?: (propertyId: number) => void;
  onView?: (propertyId: number) => void;
  showExplanations?: boolean;
  compact?: boolean;
}

export default function RecommendationCard({
  recommendation,
  onFavorite,
  onView,
  showExplanations = true,
  compact = false
}: RecommendationCardProps) {
  const { property, score } = recommendation;

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

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          {/* Score Badge */}
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(score.totalScore)}`}>
            {Math.round(score.totalScore * 100)}%
          </div>
          
          {/* Image */}
          <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden rounded-t-xl">
            {property.featuredImage ? (
              <img
                src={property.featuredImage}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BuildingOfficeIcon className="w-8 h-8 text-white opacity-50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
              {property.title}
            </h3>
            <div className="flex space-x-1 ml-2">
              {property.featured && <StarIcon className="h-4 w-4 text-yellow-500" />}
              {property.premium && <SparklesIcon className="h-4 w-4 text-purple-500" />}
            </div>
          </div>

          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
            <MapPinIcon className="h-3 w-3 mr-1" />
            <span className="text-xs">{property.address}</span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(property.price || 0, property.currency)}
            </span>
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <HomeIcon className="h-3 w-3 mr-1" />
                {property.bedrooms || 0}
              </span>
              <span className="flex items-center">
                <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                {property.bathrooms || 0}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Link
              href={`/properties/${property.id}`}
              className="flex-1 px-3 py-2 bg-sky-500 text-white text-xs text-center rounded-lg hover:bg-sky-600 transition-colors"
            >
              Ver
            </Link>
            <button 
              onClick={() => onFavorite?.(Number(property.id) || 0)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <HeartIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700">
      {/* Score Badge */}
      <div className="relative">
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(score.totalScore)}`}>
          <div className="flex items-center space-x-1">
            <span>{Math.round(score.totalScore * 100)}%</span>
            <span className="text-xs">({getScoreLabel(score.totalScore)})</span>
          </div>
        </div>
        
        {/* Image */}
        <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden">
          {property.featuredImage ? (
            <img
              src={property.featuredImage}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BuildingOfficeIcon className="w-16 h-16 text-white opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          
          {/* Property Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">
              {property.title}
            </h3>
            <p className="text-white/90 text-sm">{property.address}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(property.price || 0, property.currency)}
          </span>
          <div className="flex space-x-1">
            {property.featured && <StarIcon className="h-5 w-5 text-yellow-500" />}
            {property.premium && <SparklesIcon className="h-5 w-5 text-purple-500" />}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <HomeIcon className="h-4 w-4 mr-1" />
              {property.bedrooms || 0} hab.
            </span>
            <span className="flex items-center">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              {property.bathrooms || 0} baños
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-sm">
              {property.area || 0}m²
            </span>
          </div>
        </div>

        {/* Explanations */}
        {showExplanations && score.explanations.length > 0 && (
          <div className="space-y-2 mb-4">
            {score.explanations.slice(0, 3).map((explanation, idx) => (
              <div key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                {explanation}
              </div>
            ))}
          </div>
        )}

        {/* Score Breakdown */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Factores de Recomendación</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Precio:</span>
              <span className="font-medium">{Math.round(score.priceMatch * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Ubicación:</span>
              <span className="font-medium">{Math.round(score.locationMatch * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
              <span className="font-medium">{Math.round(score.typeMatch * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Amenidades:</span>
              <span className="font-medium">{Math.round(score.amenityMatch * 100)}%</span>
            </div>
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
          <button 
            onClick={() => onFavorite?.(Number(property.id) || 0)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center min-h-[44px]"
          >
            <HeartIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 