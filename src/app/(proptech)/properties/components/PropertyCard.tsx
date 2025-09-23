"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Property } from "./types";
import { formatPrice } from "@/lib/utils";
import FavoriteButton from "@/components/ui/FavoriteButton";
import PropertyTypeBadges from "@/components/ui/PropertyTypeBadges";
import { propertyService } from "../services/propertyService";
import { BedIcon, BathIcon, AreaIcon } from "@/icons";
import { ImageService } from '../services/imageService';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [status, setStatus] = useState(property.status);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(property.favorite || false);
  const imageService = new ImageService();

  const formatPropertyPrice = (price: number) => {
    return formatPrice(price, property.currency, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      const endpoint = `/api/properties/${property.id}/${status === "active" ? "deactivate" : "activate"}`;
      const res = await fetch(endpoint, { method: "PATCH" });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.propertyStatus === "Disponible" ? "active" : "inactive");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (newFavoriteState: boolean) => {
    setIsFavorite(newFavoriteState);
  };

  return (
    <div className="card-modern overflow-hidden hover-lift">
      <div className="relative h-48">
        {(() => {
          // Usar la primera imagen de la galería si no hay featuredImage
          const mainImage = property.featuredImage || 
            (property.galleryImages && property.galleryImages.length > 0 ? property.galleryImages[0].url : '');
          const fullImageUrl = imageService.getFullImageUrl(mainImage, property.id);
          
          // Debug log
          console.log('PropertyCard Image Debug:', {
            propertyId: property.id,
            featuredImage: property.featuredImage,
            galleryImages: property.galleryImages,
            mainImage,
            fullImageUrl
          });
          
          return fullImageUrl ? (
            <img
              src={fullImageUrl}
              alt={property.title}
              className="w-full h-full object-cover"
              onLoad={() => console.log('Property image loaded:', fullImageUrl)}
              onError={(e) => {
                console.log('Property image failed to load:', fullImageUrl);
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null;
        })()}
      {/* Fallback image */}
      <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 flex items-center justify-center text-gray-500">
        <div className="text-center p-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Sin imagen</p>
        </div>
      </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <FavoriteButton 
            propertyId={property.id.toString()} 
            initialIsFavorite={isFavorite}
            size="sm"
            onToggle={handleToggleFavorite}
          />
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              property.status === "active"
                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            {property.status === "active" ? "Activa" : "Inactiva"}
          </span>
        </div>
        <div className="absolute top-4 left-4 flex flex-col gap-1">
          {property.featured && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400">
              Destacada
            </span>
          )}
          {property.premium && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400">
              Premium
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Tipo de propiedad */}
        <div className="mb-4">
          <PropertyTypeBadges
            type={property.type || property.propertyType}
            className="mb-3"
            compact={false}
          />
          {property.operacion && (
            <span
              className={`px-3 py-1.5 text-sm font-bold rounded-full shadow-sm ${
                property.operacion === 'SALE'
                  ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/50 dark:to-blue-800/50 dark:text-blue-300'
                  : property.operacion === 'RENT'
                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/50 dark:to-green-800/50 dark:text-green-300'
                  : 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900/50 dark:to-purple-800/50 dark:text-purple-300'
              }`}
            >
              {property.operacion === 'SALE' ? 'Venta' : property.operacion === 'RENT' ? 'Alquiler' : 'Ambos'}
            </span>
          )}
        </div>

        <Link
          href={`/properties/${property.id}`}
          className="block mb-3 text-xl font-bold text-gray-900 dark:text-white hover:text-gradient transition-all duration-300"
        >
          {property.title}
        </Link>

        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {property.address}
        </p>

        {/* Amenities y detalles adicionales */}
        <div className="mb-4 space-y-2">
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Amenities:</span>
              <div className="flex flex-wrap gap-1">
                {property.amenities.slice(0, 3).map((amenity, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
                {property.amenities.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full">
                    +{property.amenities.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            {property.yearBuilt && (
              <span>Año: {property.yearBuilt}</span>
            )}
            {property.parking && (
              <span>Parking: {property.parking}</span>
            )}
          </div>
        </div>

        {/* Características */}
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              {property.bedrooms && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <BedIcon className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <BathIcon className="size-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>{property.bathrooms}</span>
                </div>
              )}
              {property.area && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <AreaIcon className="size-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>{property.area}m²</span>
                </div>
              )}
            </div>
            <button
              onClick={handleToggleStatus}
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                status === "active" 
                  ? "bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:from-red-200 hover:to-red-300 dark:from-red-900/50 dark:to-red-800/50 dark:text-red-300" 
                  : "bg-gradient-to-r from-green-100 to-green-200 text-green-700 hover:from-green-200 hover:to-green-300 dark:from-green-900/50 dark:to-green-800/50 dark:text-green-300"
              } ${loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg transform hover:-translate-y-0.5"}`}
            >
              {loading ? "..." : status === "active" ? "Desactivar" : "Activar"}
            </button>
          </div>
        </div>

        {/* Precio */}
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-100 dark:border-gray-600">
          <div className="text-2xl font-bold text-gray-900 dark:text-white text-gradient">
            {formatPropertyPrice(property.price)}
          </div>
          {property.pricePerSquareMeter && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {formatPropertyPrice(property.pricePerSquareMeter)}/m²
            </div>
          )}
        </div>

        {property.agent && (
          <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              {property.agent.photo && (
                <img 
                  src={property.agent.photo} 
                  alt={property.agent.name || 'Agente'} 
                  width={32} 
                  height={32} 
                  className="rounded-full border-2 border-white dark:border-gray-600 shadow-md" 
                />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {property.agent.name || 'Sin nombre'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Agente inmobiliario
                </div>
                {property.agent.phone && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    📞 {property.agent.phone}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 