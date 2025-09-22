"use client";

import React, { useState, useEffect } from "react";
import { propertyService } from "../services/propertyService";
import { Property } from "../components/types";
import PropertyCard from "../components/PropertyCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const favoriteProperties = await propertyService.getFavoriteProperties();
      setFavorites(favoriteProperties);
    } catch (err) {
      console.error('❌ FavoritesPage: Error loading favorites:', err);
      setError('Error al cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteRemoved = (propertyId: string) => {
    setFavorites(prev => prev.filter(p => p.id !== propertyId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <HeartIcon className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadFavorites}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <HeartIcon className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
        </div>
        <p className="text-gray-600">
          {favorites.length === 0 
            ? "No tienes propiedades favoritas aún." 
            : `Tienes ${favorites.length} propiedad${favorites.length !== 1 ? 'es' : ''} favorita${favorites.length !== 1 ? 's' : ''}.`
          }
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <HeartIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            No tienes favoritos
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Las propiedades que marques como favoritas aparecerán aquí para un acceso rápido.
          </p>
          <a
            href="/properties"
            className="bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 transition-colors inline-flex items-center gap-2"
          >
            Ver todas las propiedades
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property}
            />
          ))}
        </div>
      )}
    </div>
  );
} 