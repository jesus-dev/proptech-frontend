import { useState, useEffect, useCallback } from 'react';
import { NearbyFacility, NearbyFacilityFormData, NearbyFacilityFilters, FacilityType } from '../types';
import { nearbyFacilityService } from '../services/nearbyFacilityService';

export function useNearbyFacilities() {
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<NearbyFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [types, setTypes] = useState<FacilityType[]>([]);

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [facilitiesData, typesData] = await Promise.all([
        nearbyFacilityService.getAll(),
        nearbyFacilityService.getTypes()
      ]);
      setFacilities(facilitiesData);
      setFilteredFacilities(facilitiesData);
      setTypes(typesData);
    } catch (error) {
      console.error('Error loading nearby facilities:', error);
      setError('Error al cargar las facilidades cercanas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrar facilidades
  const filterFacilities = useCallback((filters: NearbyFacilityFilters) => {
    let filtered = facilities;

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(term) ||
        facility.address.toLowerCase().includes(term) ||
        facility.description?.toLowerCase().includes(term)
      );
    }

    if (filters.type) {
      filtered = filtered.filter(facility => facility.type === filters.type);
    }

    if (filters.active !== undefined) {
      filtered = filtered.filter(facility => facility.active === filters.active);
    }

    setFilteredFacilities(filtered);
  }, [facilities]);

  // Crear facilidad
  const createFacility = useCallback(async (data: NearbyFacilityFormData): Promise<boolean> => {
    try {
      setError(null);
      const newFacility = await nearbyFacilityService.create(data);
      setFacilities(prev => [...prev, newFacility]);
      setFilteredFacilities(prev => [...prev, newFacility]);
      return true;
    } catch (error) {
      console.error('Error creating nearby facility:', error);
      setError('Error al crear la facilidad cercana');
      return false;
    }
  }, []);

  // Actualizar facilidad
  const updateFacility = useCallback(async (id: number, data: NearbyFacilityFormData): Promise<boolean> => {
    try {
      setError(null);
      const updatedFacility = await nearbyFacilityService.update(id, data);
      setFacilities(prev => prev.map(facility => 
        facility.id === id ? updatedFacility : facility
      ));
      setFilteredFacilities(prev => prev.map(facility => 
        facility.id === id ? updatedFacility : facility
      ));
      return true;
    } catch (error) {
      console.error('Error updating nearby facility:', error);
      setError('Error al actualizar la facilidad cercana');
      return false;
    }
  }, []);

  // Eliminar facilidad
  const deleteFacility = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await nearbyFacilityService.delete(id);
      setFacilities(prev => prev.filter(facility => facility.id !== id));
      setFilteredFacilities(prev => prev.filter(facility => facility.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting nearby facility:', error);
      setError('Error al eliminar la facilidad cercana');
      return false;
    }
  }, []);

  // Cambiar estado activo
  const toggleActive = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await nearbyFacilityService.toggleActive(id);
      setFacilities(prev => prev.map(facility => 
        facility.id === id ? { ...facility, active: !facility.active } : facility
      ));
      setFilteredFacilities(prev => prev.map(facility => 
        facility.id === id ? { ...facility, active: !facility.active } : facility
      ));
      return true;
    } catch (error) {
      console.error('Error toggling facility active status:', error);
      setError('Error al cambiar el estado de la facilidad');
      return false;
    }
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Estadísticas
  const stats = {
    total: facilities.length,
    active: facilities.filter(f => f.active).length,
    inactive: facilities.filter(f => !f.active).length,
    byType: types.reduce((acc, type) => {
      acc[type] = facilities.filter(f => f.type === type).length;
      return acc;
    }, {} as Record<FacilityType, number>)
  };

  return {
    facilities,
    filteredFacilities,
    types,
    loading,
    error,
    stats,
    loadData,
    filterFacilities,
    createFacility,
    updateFacility,
    deleteFacility,
    toggleActive,
    clearError
  };
}
