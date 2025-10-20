"use client";

import React, { useState, useEffect } from 'react';
import { Plus as PlusIcon, MapPin as MapPinIcon, Trash2 as TrashIcon, Pencil as PencilIcon, Star as StarIcon } from 'lucide-react';
import { Star as StarIconSolid } from 'lucide-react';
import { NearbyFacility, FacilityTypeLabels } from '../../../catalogs/nearby-facilities/types';
import { nearbyFacilityService } from '../../../catalogs/nearby-facilities/services/nearbyFacilityService';
import { apiClient } from '@/lib/api';

interface PropertyNearbyFacility {
  id?: number;
  nearbyFacilityId: number;
  nearbyFacility: NearbyFacility;
  distanceKm?: number;
  walkingTimeMinutes?: number;
  drivingTimeMinutes?: number;
  isFeatured: boolean;
  notes?: string;
}

interface NearbyFacilitiesStepProps {
  propertyId?: string;
  onDataChange?: (facilities: PropertyNearbyFacility[]) => void;
}

export default function NearbyFacilitiesStep({ propertyId, onDataChange }: NearbyFacilitiesStepProps) {
  const [facilities, setFacilities] = useState<PropertyNearbyFacility[]>([]);
  const [availableFacilities, setAvailableFacilities] = useState<NearbyFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<NearbyFacility | null>(null);
  const [formData, setFormData] = useState({
    distanceKm: '',
    walkingTimeMinutes: '',
    drivingTimeMinutes: '',
    isFeatured: false,
    notes: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [facilitiesData, availableData] = await Promise.all([
        propertyId ? loadPropertyFacilities() : Promise.resolve([]),
        nearbyFacilityService.getActive()
      ]);
      
      setFacilities(facilitiesData);
      setAvailableFacilities(availableData);
    } catch (error) {
      console.error('Error loading nearby facilities:', error);
      setError('Error al cargar las facilidades cercanas');
    } finally {
      setLoading(false);
    }
  };

  const loadPropertyFacilities = async (): Promise<PropertyNearbyFacility[]> => {
    if (!propertyId) return [];
    
    try {
      const response = await apiClient.get(`/api/properties/${propertyId}/nearby-facilities`);
      return response.data;
    } catch (error) {
      console.error('Error loading property facilities:', error);
      return [];
    }
  };

  const handleAddFacility = (facility: NearbyFacility) => {
    setSelectedFacility(facility);
    setFormData({
      distanceKm: '',
      walkingTimeMinutes: '',
      drivingTimeMinutes: '',
      isFeatured: false,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveFacility = async () => {
    if (!selectedFacility) return;

    try {
      setError(null);
      
      const facilityData = {
        nearbyFacilityId: selectedFacility.id,
        distanceKm: formData.distanceKm ? parseFloat(formData.distanceKm) : undefined,
        walkingTimeMinutes: formData.walkingTimeMinutes ? parseInt(formData.walkingTimeMinutes) : undefined,
        drivingTimeMinutes: formData.drivingTimeMinutes ? parseInt(formData.drivingTimeMinutes) : undefined,
        isFeatured: formData.isFeatured,
        notes: formData.notes
      };

      let newFacility: PropertyNearbyFacility;

      if (propertyId) {
        // Guardar en el backend
        const response = await apiClient.post(`/api/properties/${propertyId}/nearby-facilities`, facilityData);
        newFacility = response.data;
      } else {
        // Solo en el frontend para nuevas propiedades
        const { nearbyFacilityId, ...rest } = facilityData;
        newFacility = {
          nearbyFacilityId: selectedFacility.id,
          nearbyFacility: selectedFacility,
          ...rest
        };
      }

      const updatedFacilities = [...facilities, newFacility];
      setFacilities(updatedFacilities);
      onDataChange?.(updatedFacilities);
      setIsModalOpen(false);
      setSelectedFacility(null);
    } catch (error) {
      console.error('Error saving facility:', error);
      setError('Error al guardar la facilidad');
    }
  };

  const handleRemoveFacility = async (facility: PropertyNearbyFacility) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta facilidad?')) {
      return;
    }

    try {
      setError(null);
      
      if (propertyId && facility.id) {
        await apiClient.delete(`/api/properties/${propertyId}/nearby-facilities/${facility.nearbyFacilityId}`);
      }
      
      const updatedFacilities = facilities.filter(f => f.nearbyFacilityId !== facility.nearbyFacilityId);
      setFacilities(updatedFacilities);
      onDataChange?.(updatedFacilities);
    } catch (error) {
      console.error('Error removing facility:', error);
      setError('Error al eliminar la facilidad');
    }
  };

  const handleToggleFeatured = async (facility: PropertyNearbyFacility) => {
    try {
      setError(null);
      
      const updatedFacility = { ...facility, isFeatured: !facility.isFeatured };
      
      if (propertyId && facility.id) {
        await apiClient.put(`/api/properties/${propertyId}/nearby-facilities/${facility.nearbyFacilityId}`, {
          distanceKm: facility.distanceKm,
          walkingTimeMinutes: facility.walkingTimeMinutes,
          drivingTimeMinutes: facility.drivingTimeMinutes,
          isFeatured: updatedFacility.isFeatured,
          notes: facility.notes
        });
      }
      
      const updatedFacilities = facilities.map(f => 
        f.nearbyFacilityId === facility.nearbyFacilityId ? updatedFacility : f
      );
      setFacilities(updatedFacilities);
      onDataChange?.(updatedFacilities);
    } catch (error) {
      console.error('Error updating facility:', error);
      setError('Error al actualizar la facilidad');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'HOSPITAL': return '🏥';
      case 'SCHOOL': case 'UNIVERSITY': return '🎓';
      case 'SHOPPING_CENTER': case 'SUPERMARKET': return '🛒';
      case 'RESTAURANT': return '🍽️';
      case 'BANK': return '🏦';
      case 'PHARMACY': return '💊';
      case 'GYM': return '💪';
      case 'PARK': return '🌳';
      case 'TRANSPORT_STATION': return '🚇';
      case 'GAS_STATION': return '⛽';
      case 'POLICE_STATION': return '👮';
      case 'FIRE_STATION': return '🚒';
      case 'POST_OFFICE': return '📮';
      case 'LIBRARY': return '📚';
      case 'CINEMA': return '🎬';
      case 'THEATER': return '🎭';
      case 'MUSEUM': return '🏛️';
      case 'SPORTS_CENTER': return '⚽';
      case 'CHURCH': return '⛪';
      default: return '📍';
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '-';
    return `${distance} km`;
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  // Filtrar facilidades ya agregadas
  const availableToAdd = availableFacilities.filter(
    facility => !facilities.some(f => f.nearbyFacilityId === facility.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MapPinIcon className="h-5 w-5 text-orange-600 mr-2" />
            Facilidades Cercanas
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Agrega facilidades cercanas que sean relevantes para esta propiedad
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {facilities.length} facilidad{facilities.length !== 1 ? 'es' : ''} agregada{facilities.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Facilidades agregadas */}
      {facilities.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Facilidades agregadas</h4>
          <div className="grid gap-3">
            {facilities.map((facility) => (
              <div
                key={facility.nearbyFacilityId}
                className={`p-4 border rounded-lg ${
                  facility.isFeatured ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{getTypeIcon(facility.nearbyFacility.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-gray-900">
                          {facility.nearbyFacility.name}
                        </h5>
                        {facility.isFeatured && (
                          <StarIconSolid className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {FacilityTypeLabels[facility.nearbyFacility.type]}
                      </p>
                      <p className="text-sm text-gray-500">
                        {facility.nearbyFacility.address}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {facility.distanceKm && (
                          <span>📍 {formatDistance(facility.distanceKm)}</span>
                        )}
                        {facility.walkingTimeMinutes && (
                          <span>🚶 {formatTime(facility.walkingTimeMinutes)}</span>
                        )}
                        {facility.drivingTimeMinutes && (
                          <span>🚗 {formatTime(facility.drivingTimeMinutes)}</span>
                        )}
                      </div>
                      {facility.notes && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          "{facility.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleFeatured(facility)}
                      className={`p-1 rounded ${
                        facility.isFeatured
                          ? 'text-orange-500 hover:text-orange-600'
                          : 'text-gray-400 hover:text-orange-500'
                      }`}
                      title={facility.isFeatured ? 'Quitar de destacados' : 'Marcar como destacado'}
                    >
                      <StarIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveFacility(facility)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Eliminar facilidad"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agregar facilidades */}
      {availableToAdd.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Agregar facilidades</h4>
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {availableToAdd.map((facility) => (
              <div
                key={facility.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-xl">{getTypeIcon(facility.type)}</div>
                  <div>
                    <h5 className="font-medium text-gray-900">{facility.name}</h5>
                    <p className="text-sm text-gray-500">
                      {FacilityTypeLabels[facility.type]} • {facility.address}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddFacility(facility)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-orange-600 bg-orange-100 hover:bg-orange-200"
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Agregar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {availableToAdd.length === 0 && facilities.length === 0 && (
        <div className="text-center py-8">
          <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay facilidades disponibles</h3>
          <p className="mt-1 text-sm text-gray-500">
            Primero debes crear facilidades cercanas en el catálogo.
          </p>
        </div>
      )}

      {/* Modal para agregar facilidad */}
      {isModalOpen && selectedFacility && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Agregar {selectedFacility.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distancia (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distanceKm}
                    onChange={(e) => setFormData(prev => ({ ...prev, distanceKm: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ej: 0.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiempo a pie (min)
                    </label>
                    <input
                      type="number"
                      value={formData.walkingTimeMinutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, walkingTimeMinutes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Ej: 10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiempo en auto (min)
                    </label>
                    <input
                      type="number"
                      value={formData.drivingTimeMinutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, drivingTimeMinutes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Ej: 5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Información adicional sobre esta facilidad..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                    Marcar como destacada
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveFacility}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
