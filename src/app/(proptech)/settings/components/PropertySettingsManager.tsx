"use client";

import React, { useState, useEffect } from "react";
import { PropertySettings, FeaturedSettings, PremiumSettings } from "../types";
import { propertyService } from "@/app/(proptech)/properties/services/propertyService";
import { Property } from "@/app/(proptech)/properties/components/types";

interface PropertySettingsManagerProps {
  settings: PropertySettings;
  onSettingsChange: (settings: PropertySettings) => void;
}

export default function PropertySettingsManager({ settings, onSettingsChange }: PropertySettingsManagerProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState<'featured' | 'premium'>('featured');

  const loadProperties = async () => {
    try {
      const allProperties = await propertyService.getAllProperties();
      setProperties((allProperties as any).data || allProperties);
    } catch (error) {
      console.error("Error loading properties:", error);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const updateFeaturedSettings = (updates: Partial<FeaturedSettings>) => {
    onSettingsChange({
      ...settings,
      featured: { ...settings.featured, ...updates }
    });
  };

  const updatePremiumSettings = (updates: Partial<PremiumSettings>) => {
    onSettingsChange({
      ...settings,
      premium: { ...settings.premium, ...updates }
    });
  };

  const addCity = (city: string, type: 'featured' | 'premium') => {
    if (type === 'featured') {
      const newCities = [...settings.featured.criteria.allowedCities, city];
      updateFeaturedSettings({
        criteria: { ...settings.featured.criteria, allowedCities: newCities }
      });
    } else {
      const newLocations = [...settings.premium.criteria.premiumLocations, city];
      updatePremiumSettings({
        criteria: { ...settings.premium.criteria, premiumLocations: newLocations }
      });
    }
  };

  const removeCity = (city: string, type: 'featured' | 'premium') => {
    if (type === 'featured') {
      const newCities = settings.featured.criteria.allowedCities.filter(c => c !== city);
      updateFeaturedSettings({
        criteria: { ...settings.featured.criteria, allowedCities: newCities }
      });
    } else {
      const newLocations = settings.premium.criteria.premiumLocations.filter(c => c !== city);
      updatePremiumSettings({
        criteria: { ...settings.premium.criteria, premiumLocations: newLocations }
      });
    }
  };

  const addLuxuryAmenity = (amenity: string) => {
    const newAmenities = [...settings.premium.criteria.luxuryAmenities, amenity];
    updatePremiumSettings({
      criteria: { ...settings.premium.criteria, luxuryAmenities: newAmenities }
    });
  };

  const removeLuxuryAmenity = (amenity: string) => {
    const newAmenities = settings.premium.criteria.luxuryAmenities.filter(a => a !== amenity);
    updatePremiumSettings({
      criteria: { ...settings.premium.criteria, luxuryAmenities: newAmenities }
    });
  };

  const togglePropertySelection = (propertyId: string, type: 'featured' | 'premium') => {
    if (type === 'featured') {
      const isSelected = settings.featured.manualSelection.includes(propertyId);
      const newSelection = isSelected 
        ? settings.featured.manualSelection.filter(id => id !== propertyId)
        : [...settings.featured.manualSelection, propertyId];
      updateFeaturedSettings({ manualSelection: newSelection });
    } else {
      const isSelected = settings.premium.manualSelection.includes(propertyId);
      const newSelection = isSelected 
        ? settings.premium.manualSelection.filter(id => id !== propertyId)
        : [...settings.premium.manualSelection, propertyId];
      updatePremiumSettings({ manualSelection: newSelection });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('featured')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'featured'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Propiedades Destacadas
        </button>
        <button
          onClick={() => setActiveTab('premium')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'premium'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Propiedades Premium
        </button>
      </div>

      {activeTab === 'featured' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Configuración de Propiedades Destacadas</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.featured.enabled}
                onChange={(e) => updateFeaturedSettings({ enabled: e.target.checked })}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="ml-2 text-sm text-gray-700">Habilitado</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mínimo de Amenities
              </label>
              <input
                type="number"
                value={settings.featured.criteria.minAmenities}
                onChange={(e) => updateFeaturedSettings({
                  criteria: { ...settings.featured.criteria, minAmenities: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating Mínimo
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={settings.featured.criteria.minRating}
                onChange={(e) => updateFeaturedSettings({
                  criteria: { ...settings.featured.criteria, minRating: parseFloat(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vistas Mínimas
              </label>
              <input
                type="number"
                value={settings.featured.criteria.minViews}
                onChange={(e) => updateFeaturedSettings({
                  criteria: { ...settings.featured.criteria, minViews: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año Mínimo de Construcción
              </label>
              <input
                type="number"
                value={settings.featured.criteria.minYearBuilt}
                onChange={(e) => updateFeaturedSettings({
                  criteria: { ...settings.featured.criteria, minYearBuilt: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ciudades Permitidas
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {settings.featured.criteria.allowedCities.map((city) => (
                <span
                  key={city}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-brand-100 text-brand-800"
                >
                  {city}
                  <button
                    onClick={() => removeCity(city, 'featured')}
                    className="ml-2 text-brand-600 hover:text-brand-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Agregar ciudad..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      addCity(input.value.trim(), 'featured');
                      input.value = '';
                    }
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selección Manual de Propiedades
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
              {properties.map((property) => (
                <label key={property.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={settings.featured.manualSelection.includes(property.id)}
                    onChange={() => togglePropertySelection(property.id, 'featured')}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{property.title}</p>
                    <p className="text-xs text-gray-500">{property.address}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'premium' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Configuración de Propiedades Premium</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.premium.enabled}
                onChange={(e) => updatePremiumSettings({ enabled: e.target.checked })}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="ml-2 text-sm text-gray-700">Habilitado</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Mínimo (USD)
              </label>
              <input
                type="number"
                value={settings.premium.criteria.minPrice}
                onChange={(e) => updatePremiumSettings({
                  criteria: { ...settings.premium.criteria, minPrice: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área Mínima (m²)
              </label>
              <input
                type="number"
                value={settings.premium.criteria.minArea}
                onChange={(e) => updatePremiumSettings({
                  criteria: { ...settings.premium.criteria, minArea: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dormitorios Mínimos
              </label>
              <input
                type="number"
                value={settings.premium.criteria.minBedrooms}
                onChange={(e) => updatePremiumSettings({
                  criteria: { ...settings.premium.criteria, minBedrooms: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Mínimo para Casas Quinta (USD)
              </label>
              <input
                type="number"
                value={settings.premium.criteria.minPriceForQuinta}
                onChange={(e) => updatePremiumSettings({
                  criteria: { ...settings.premium.criteria, minPriceForQuinta: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities de Lujo
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {settings.premium.criteria.luxuryAmenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800"
                >
                  {amenity}
                  <button
                    onClick={() => removeLuxuryAmenity(amenity)}
                    className="ml-2 text-amber-600 hover:text-amber-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Agregar amenity de lujo..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      addLuxuryAmenity(input.value.trim());
                      input.value = '';
                    }
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicaciones Premium
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {settings.premium.criteria.premiumLocations.map((location) => (
                <span
                  key={location}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800"
                >
                  {location}
                  <button
                    onClick={() => removeCity(location, 'premium')}
                    className="ml-2 text-amber-600 hover:text-amber-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Agregar ubicación premium..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      addCity(input.value.trim(), 'premium');
                      input.value = '';
                    }
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selección Manual de Propiedades Premium
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
              {properties.map((property) => (
                <label key={property.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={settings.premium.manualSelection.includes(property.id)}
                    onChange={() => togglePropertySelection(property.id, 'premium')}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{property.title}</p>
                    <p className="text-xs text-gray-500">{property.address}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 