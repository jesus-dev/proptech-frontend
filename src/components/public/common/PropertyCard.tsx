"use client";

import React, { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  HomeModernIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  HeartIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import OptimizedImage from './OptimizedImage';

interface PropertyCardProps {
  property: {
    id: number;
    slug?: string;
    title: string;
    price: number;
    currencyCode?: string;
    featuredImage?: string | null;
    cityName?: string;
    address?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    parking?: number;
    operacion?: 'SALE' | 'RENT';
    featured?: boolean;
    views?: number;
    agent?: {
      name?: string;
      fotoPerfilUrl?: string;
      avatar?: string;
    };
  };
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  viewMode?: 'grid' | 'list';
  index?: number;
}

/**
 * Componente de tarjeta de propiedad optimizado y memoizado
 */
const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorite = false,
  onToggleFavorite,
  viewMode = 'grid',
  index = 0,
}) => {
  const formatPrice = (price: number, currency: string) => {
    const currencySymbol = currency === 'PYG' ? 'Gs.' : '$';
    const formattedPrice = new Intl.NumberFormat('es-PY').format(price);
    return `${currencySymbol} ${formattedPrice}`;
  };

  const propertyUrl = property.slug 
    ? `/propiedad/${property.slug}` 
    : `/propiedades/${property.id}`;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4, 
        delay: index * 0.05,
        ease: 'easeOut'
      }
    },
    hover: { 
      y: -4,
      transition: { duration: 0.2 }
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.article
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        <Link href={propertyUrl} className="flex flex-col sm:flex-row">
          {/* Imagen */}
          <div className="relative w-full sm:w-64 h-56 sm:h-full min-h-[224px] sm:min-h-0 flex-shrink-0">
            <OptimizedImage
              src={property.featuredImage}
              alt={property.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 256px"
            />
            {property.featured && (
              <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                ⭐ Destacada
              </div>
            )}
            {property.operacion && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                {property.operacion === 'SALE' ? 'VENTA' : 'ALQUILER'}
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                {property.title}
              </h3>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPinIcon className="w-4 h-4 mr-1" />
                <span className="text-sm">{property.cityName || property.address || 'Ubicación no disponible'}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                {property.bedrooms !== undefined && property.bedrooms > 0 && (
                  <div className="flex items-center">
                    <HomeModernIcon className="w-4 h-4 mr-1" />
                    <span>{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms !== undefined && property.bathrooms > 0 && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{property.bathrooms}</span>
                  </div>
                )}
                {property.area && (
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                    <span>{property.area} m²</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(property.price, property.currencyCode || 'PYG')}
              </div>
              {property.views !== undefined && (
                <div className="flex items-center text-gray-500 text-sm">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  <span>{property.views}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  // Vista grid (default)
  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
    >
      <Link href={propertyUrl} className="flex flex-col h-full">
        {/* Imagen */}
        <div className="relative w-full h-56 sm:h-48 md:h-52 lg:h-56 overflow-hidden">
          <OptimizedImage
            src={property.featuredImage}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Overlay con badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {property.featured && (
            <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              ⭐ Destacada
            </div>
          )}
          
          {property.operacion && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {property.operacion === 'SALE' ? 'VENTA' : 'ALQUILER'}
            </div>
          )}

          {/* Botón favorito */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(property.id);
              }}
              className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 shadow-lg hover:scale-110"
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              {isFavorite ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 p-5 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
          
          <div className="flex items-center text-gray-600 mb-4 text-sm">
            <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{property.cityName || property.address || 'Ubicación no disponible'}</span>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
            {property.bedrooms !== undefined && property.bedrooms > 0 && (
              <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
                <HomeModernIcon className="w-4 h-4 mr-1" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms !== undefined && property.bathrooms > 0 && (
              <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.area && (
              <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                <span>{property.area} m²</span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xl font-bold text-blue-600">
              {formatPrice(property.price, property.currencyCode || 'PYG')}
            </div>
            {property.views !== undefined && (
              <div className="flex items-center text-gray-500 text-xs">
                <EyeIcon className="w-4 h-4 mr-1" />
                <span>{property.views}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default memo(PropertyCard);

