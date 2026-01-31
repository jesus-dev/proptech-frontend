"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus as PlusIcon, MapPin as MapPinIcon, Trash2 as TrashIcon, Pencil as PencilIcon, Star as StarIcon, Search as SearchIcon, ChevronDown as ChevronDownIcon, X as XIcon } from 'lucide-react';
import { Star as StarIconSolid } from 'lucide-react';
import { NearbyFacility, FacilityTypeLabels } from '../../../catalogs/nearby-facilities/types';
import { nearbyFacilityService } from '../../../catalogs/nearby-facilities/services/nearbyFacilityService';
import { apiClient } from '@/lib/api';
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
  /** En nueva propiedad (sin propertyId), usa las facilidades ya guardadas en el formulario para mostrar/evitar sobrescribir */
  initialFacilities?: Array<PropertyNearbyFacility | { nearbyFacilityId: number; nearbyFacility?: unknown; [k: string]: unknown }>;
  onDataChange?: (facilities: PropertyNearbyFacility[]) => void;
}

export default function NearbyFacilitiesStep({ propertyId, initialFacilities, onDataChange }: NearbyFacilitiesStepProps) {
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
  const [catalogSearchTerm, setCatalogSearchTerm] = useState('');
  const [selectedCatalogFacilityId, setSelectedCatalogFacilityId] = useState<number | ''>('');
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [propertyId]);

  // Cerrar combobox al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsComboboxOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [facilitiesData, availableData] = await Promise.all([
        propertyId ? loadPropertyFacilities() : Promise.resolve((initialFacilities ?? []) as PropertyNearbyFacility[]),
        nearbyFacilityService.getActive()
      ]);
      
      setFacilities(facilitiesData);
      setAvailableFacilities(availableData);
      // Solo sincronizar desde API al formulario cuando estamos editando; en nueva propiedad no sobrescribir
      if (propertyId) {
        onDataChange?.(facilitiesData);
      }
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
      const data = Array.isArray(response.data) ? response.data : [];

      // Normalizar el shape que viene del backend a lo que espera el frontend
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

      setIsModalOpen(false);
      setSelectedFacility(null);
    } catch (error: any) {
      console.error('Error saving facility:', error);
      const axiosErr = error as AxiosError<any>;

      // Si ya está asociada, recargar lista y no mostrar error fuerte
      if (axiosErr?.response?.status === 409) {
        await loadData();
        setIsModalOpen(false);
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

  // Filtrar facilidades ya asociadas (defensivo por si la API devuelve algo inesperado)
  const safeFacilities = Array.isArray(facilities) ? facilities : [];
  const safeAvailableFacilities = Array.isArray(availableFacilities) ? availableFacilities : [];

  const availableToAdd = safeAvailableFacilities
    .filter(facility => !safeFacilities.some(f => f.nearbyFacilityId === facility.id))
    .filter(facility => {
      if (!catalogSearchTerm.trim()) return true;
      const term = catalogSearchTerm.toLowerCase();
      return (
        facility.name.toLowerCase().includes(term) ||
        (facility.address || '').toLowerCase().includes(term) ||
        FacilityTypeLabels[facility.type].toLowerCase().includes(term)
      );
    });

  const handleSelectFromCatalog = (facilityId?: number) => {
    const idToUse = facilityId || selectedCatalogFacilityId;
    if (!idToUse) return;
    // Buscar solo entre las que realmente están disponibles para agregar (ya filtradas)
    const facility = availableToAdd.find(f => f.id === idToUse);
    if (!facility) return;
    // Limpiar selección y buscador para el siguiente uso
    setCatalogSearchTerm('');
    setSelectedCatalogFacilityId('');
    setIsComboboxOpen(false);
    setHighlightedIndex(-1);
    handleAddFacility(facility);
  };

  const handleComboboxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < availableToAdd.length - 1 ? prev + 1 : prev
      );
      setIsComboboxOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectFromCatalog(availableToAdd[highlightedIndex].id);
    } else if (e.key === 'Escape') {
      setIsComboboxOpen(false);
      setHighlightedIndex(-1);
    }
  };

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
            Facilidades cercanas de esta propiedad
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Elige desde el catálogo qué facilidades cercanas aplicar a esta propiedad y, opcionalmente, define distancias y tiempos.
          </p>
        </div>
        {safeFacilities.length > 0 && (
          <div className="text-sm text-gray-500">
            {safeFacilities.length} facilidad{safeFacilities.length !== 1 ? 'es' : ''} asociada{safeFacilities.length !== 1 ? 's' : ''}
          </div>
        )}
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

      {/* Facilidades asociadas a la propiedad */}
      {safeFacilities.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Facilidades asociadas a esta propiedad</h4>
          <div className="grid gap-3">
            {safeFacilities.map((facility) => (
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

      {/* Facilidades disponibles en el catálogo */}
      {safeAvailableFacilities.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Facilidades disponibles en el catálogo</h4>
          <div className="relative" ref={comboboxRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar y seleccionar facilidad..."
                value={catalogSearchTerm}
                onChange={(e) => {
                  setCatalogSearchTerm(e.target.value);
                  setIsComboboxOpen(true);
                  setHighlightedIndex(-1);
                }}
                onFocus={() => setIsComboboxOpen(true)}
                onKeyDown={handleComboboxKeyDown}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {catalogSearchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setCatalogSearchTerm('');
                    setSelectedCatalogFacilityId('');
                    inputRef.current?.focus();
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsComboboxOpen(!isComboboxOpen)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <ChevronDownIcon className={`h-5 w-5 transition-transform ${isComboboxOpen ? 'transform rotate-180' : ''}`} />
              </button>
            </div>
            
            {isComboboxOpen && availableToAdd.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {availableToAdd.map((facility, index) => (
                  <div
                    key={facility.id}
                    onClick={() => handleSelectFromCatalog(facility.id)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      index === highlightedIndex
                        ? 'bg-orange-50 border-l-4 border-orange-500'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-xl flex-shrink-0">{getTypeIcon(facility.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {facility.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {FacilityTypeLabels[facility.type]}
                        </div>
                        {facility.address && (
                          <div className="text-xs text-gray-500 truncate mt-1">
                            📍 {facility.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {isComboboxOpen && availableToAdd.length === 0 && catalogSearchTerm && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                No se encontraron facilidades que coincidan con "{catalogSearchTerm}"
              </div>
            )}
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
                Asociar {selectedFacility.name} a la propiedad
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
                    Marcar como facilidad destacada en esta propiedad
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
