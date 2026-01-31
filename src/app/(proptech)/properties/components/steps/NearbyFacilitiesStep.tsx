"use client";

import React, { useState, useEffect } from 'react';
import { Plus as PlusIcon, MapPin as MapPinIcon, Trash2 as TrashIcon, Star as StarIcon } from 'lucide-react';
import { Star as StarIconSolid } from 'lucide-react';
import { NearbyFacility, FacilityTypeLabels } from '../../../catalogs/nearby-facilities/types';
import { apiClient } from '@/lib/api';
import SelectNearbyFacilityModal from '../SelectNearbyFacilityModal';
import type { AxiosError } from 'axios';

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
  initialFacilities?: Array<PropertyNearbyFacility | { nearbyFacilityId: number; nearbyFacility?: unknown; [k: string]: unknown }>;
  onDataChange?: (facilities: PropertyNearbyFacility[]) => void;
}

export default function NearbyFacilitiesStep({ propertyId, initialFacilities, onDataChange }: NearbyFacilitiesStepProps) {
  const [facilities, setFacilities] = useState<PropertyNearbyFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<NearbyFacility | null>(null);
  const [formData, setFormData] = useState({
    distanceKm: '',
    walkingTimeMinutes: '',
    drivingTimeMinutes: '',
    isFeatured: false,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const facilitiesData = propertyId
        ? await loadPropertyFacilities()
        : ((initialFacilities ?? []) as PropertyNearbyFacility[]);
      setFacilities(facilitiesData);
      if (propertyId) {
        onDataChange?.(facilitiesData);
      }
    } catch (err) {
      console.error('Error loading nearby facilities:', err);
      setError('Error al cargar las facilidades cercanas');
    } finally {
      setLoading(false);
    }
  };

  const loadPropertyFacilities = async (): Promise<PropertyNearbyFacility[]> => {
    if (!propertyId) return [];
    
    try {
      const response = await apiClient.get(`/api/properties/${propertyId}/nearby-facilities`);
      const data = Array.isArray(response.data) ? response.data : [];
      return data.map((item: any) => ({
        id: item.id,
        nearbyFacilityId: item.nearbyFacilityId ?? item.nearbyFacility?.id,
        nearbyFacility: item.nearbyFacility,
        distanceKm: item.distanceKm,
        walkingTimeMinutes: item.walkingTimeMinutes,
        drivingTimeMinutes: item.drivingTimeMinutes,
        isFeatured: item.isFeatured ?? false,
        notes: item.notes,
      })) as PropertyNearbyFacility[];
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
    setIsAssociateModalOpen(true);
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

      if (propertyId) {
        // Guardar en el backend y recargar; loadData() sincroniza con el form vía onDataChange
        await apiClient.post(`/api/properties/${propertyId}/nearby-facilities`, facilityData);
        await loadData();
      } else {
        // Solo en el frontend para nuevas propiedades
        const { nearbyFacilityId, ...rest } = facilityData;
        const newFacility: PropertyNearbyFacility = {
          nearbyFacilityId: selectedFacility.id,
          nearbyFacility: selectedFacility,
          ...rest
        };
        const updatedFacilities = [...facilities, newFacility];
        setFacilities(updatedFacilities);
        onDataChange?.(updatedFacilities);
      }

      setIsAssociateModalOpen(false);
      setSelectedFacility(null);
    } catch (error: any) {
      console.error('Error saving facility:', error);
      const axiosErr = error as AxiosError<any>;

      // Si ya está asociada, recargar lista y no mostrar error fuerte
      if (axiosErr?.response?.status === 409) {
        await loadData();
        setIsAssociateModalOpen(false);
        setSelectedFacility(null);
        setError('Esta facilidad ya estaba asociada a la propiedad, se ha sincronizado la lista.');
        return;
      }

      const backendMessage =
        axiosErr?.response?.data?.error ||
        axiosErr?.response?.data?.message ||
        axiosErr?.message;
      setError(backendMessage ? `Error al guardar la facilidad: ${backendMessage}` : 'Error al guardar la facilidad');
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

  const safeFacilities = Array.isArray(facilities) ? facilities : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header (igual que OwnerInfoStep) */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <MapPinIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Facilidades Cercanas</h2>
            <p className="text-brand-100 text-sm">
              Agrega las facilidades cercanas a esta propiedad
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Card: Facilidades asociadas (igual que Propietarios Registrados) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Facilidades Asociadas
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {safeFacilities.length === 0
                  ? 'No hay facilidades asociadas'
                  : `${safeFacilities.length} facilidad${safeFacilities.length !== 1 ? 'es' : ''} asociada${safeFacilities.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSelectModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Agregar Facilidad
            </button>
          </div>
        </div>

        <div className="p-6">
          {safeFacilities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Sin facilidades cercanas
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                Agrega facilidades cercanas (hospitales, escuelas, comercios, etc.) para esta propiedad
              </p>
              <button
                type="button"
                onClick={() => setIsSelectModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Agregar Primera Facilidad
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeFacilities.map((facility) => (
                <div
                  key={facility.nearbyFacilityId}
                  className={`relative group rounded-lg p-4 border transition-all ${
                    facility.isFeatured
                      ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-brand-500'
                  }`}
                >
                  {facility.isFeatured && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                        Destacada
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveFacility(facility)}
                    className="absolute bottom-2 right-2 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Eliminar facilidad"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  <div className="flex items-start gap-3 pr-10">
                    <div className="text-2xl flex-shrink-0">{getTypeIcon(facility.nearbyFacility.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                          {facility.nearbyFacility.name}
                        </h4>
                        {facility.isFeatured && <StarIconSolid className="h-4 w-4 text-orange-500 flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {FacilityTypeLabels[facility.nearbyFacility.type]}
                      </p>
                      {facility.nearbyFacility.address && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                          📍 {facility.nearbyFacility.address}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {facility.distanceKm != null && <span>{formatDistance(facility.distanceKm)}</span>}
                        {facility.walkingTimeMinutes != null && <span>🚶 {formatTime(facility.walkingTimeMinutes)}</span>}
                        {facility.drivingTimeMinutes != null && <span>🚗 {formatTime(facility.drivingTimeMinutes)}</span>}
                      </div>
                      {facility.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic truncate">"{facility.notes}"</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(facility)}
                    className="absolute top-2 left-2 p-1 rounded text-gray-400 hover:text-orange-500"
                    title={facility.isFeatured ? 'Quitar destacada' : 'Marcar como destacada'}
                  >
                    <StarIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {safeFacilities.length > 0 && (
          <div className="px-6 pb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Facilidades destacadas
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Las facilidades marcadas como destacadas se mostrarán de forma preferente en la ficha de la propiedad.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal asociar (distancia, tiempos, notas) - igual que el de propietarios al elegir */}
      {isAssociateModalOpen && selectedFacility && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Asociar {selectedFacility.name} a la propiedad
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Distancia (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distanceKm}
                    onChange={(e) => setFormData(prev => ({ ...prev, distanceKm: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ej: 0.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tiempo a pie (min)
                    </label>
                    <input
                      type="number"
                      value={formData.walkingTimeMinutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, walkingTimeMinutes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ej: 10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tiempo en auto (min)
                    </label>
                    <input
                      type="number"
                      value={formData.drivingTimeMinutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, drivingTimeMinutes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ej: 5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Información adicional sobre esta facilidad..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Marcar como facilidad destacada en esta propiedad
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setIsAssociateModalOpen(false); setSelectedFacility(null); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
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

      {/* Modal de selección (igual que SelectOwnerModal) */}
      <SelectNearbyFacilityModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        onSelect={handleAddFacility}
        selectedFacilityIds={safeFacilities.map((f) => f.nearbyFacilityId)}
      />
    </div>
  );
}
