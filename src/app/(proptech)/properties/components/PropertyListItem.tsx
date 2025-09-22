"use client";
import React from "react";
import Link from "next/link";
import { Property } from "./types";
import { formatPrice } from "@/lib/utils";
import { BedIcon, BathIcon, AreaIcon } from "@/icons";
import { ImageService } from '../services/imageService';

interface PropertyListItemProps {
  property: Property;
}

export default function PropertyListItem({ property }: PropertyListItemProps) {
  const imageService = new ImageService();
  
  const formatPropertyPrice = (price: number) => {
    return formatPrice(price, property.currency, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="card-modern p-6 hover-lift">
      <div className="flex-shrink-0 w-24 h-24 relative rounded-md overflow-hidden">
        {(() => {
          // Usar la primera imagen de la galería si no hay featuredImage
          const mainImage = property.featuredImage || 
            (property.galleryImages && property.galleryImages.length > 0 ? property.galleryImages[0].url : '');
          const fullImageUrl = imageService.getFullImageUrl(mainImage, property.id);
          
          // Debug log
          console.log('PropertyListItem Image Debug:', {
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
              onLoad={() => console.log('Property list image loaded:', fullImageUrl)}
              onError={(e) => {
                console.log('Property list image failed to load:', fullImageUrl);
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null;
        })()}
        {/* Fallback image */}
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg className="w-6 h-6 mx-auto mb-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-xs">Sin imagen</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1">
              <span className="text-sm font-medium text-brand-600 dark:text-brand-400">{property.type}</span>
            </div>

            <Link
              href={`/properties/${property.id}`}
              className="block text-lg font-semibold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 truncate"
            >
              {property.title}
            </Link>

            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {property.address}
            </p>

            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Amenities: </span>
                <span className="text-xs text-gray-700 dark:text-gray-200">{property.amenities.join(", ")}</span>
              </div>
            )}
            {property.yearBuilt && (
              <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Año: {property.yearBuilt}</div>
            )}
            {property.parking && (
              <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Parking: {property.parking}</div>
            )}
          </div>

          <div className="flex flex-col items-end">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                property.status === "active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {property.status === "active" ? "Activa" : "Inactiva"}
            </span>
            <div className="flex gap-1 mt-1">
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
            <div className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
            {formatPropertyPrice(property.price)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {property.currency}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-6">
          {property.bedrooms && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <BedIcon className="size-4" />
              <span>{property.bedrooms} Habitaciones</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <BathIcon className="size-4" />
              <span>{property.bathrooms} Baños</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <AreaIcon className="size-4" />
            <span>{property.area}m²</span>
          </div>
          {property.agent && (
            <div className="mt-2 flex items-center gap-2">
              {property.agent.photo && (
                <img src={property.agent.photo} alt={property.agent.name || 'Agente'} width={24} height={24} className="rounded-full" />
              )}
              <span className="text-xs text-gray-700 dark:text-gray-200">Agente: {property.agent.name || 'Sin nombre'}</span>
              {property.agent.phone && <span className="text-xs text-gray-500 ml-2">{property.agent.phone}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 