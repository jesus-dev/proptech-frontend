import { useState, useEffect, useCallback } from 'react';
import { CityZone, CityZoneFormData } from '../types';
import { 
  getAllCityZones, 
  createCityZone, 
  updateCityZone, 
  deleteCityZone,
  getCityZonesByCity 
} from '../services/cityZoneService';

export function useCityZones() {
  const [cityZones, setCityZones] = useState<CityZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCityZones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCityZones();
      setCityZones(data);
    } catch (error) {
      console.error('Error loading city zones:', error);
      setError('Error al cargar las zonas urbanas');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CityZoneFormData): Promise<boolean> => {
    try {
      setError(null);
      const newCityZone = await createCityZone(data);
      setCityZones(prev => [...prev, newCityZone]);
      return true;
    } catch (error) {
      console.error('Error creating city zone:', error);
      setError('Error al crear la zona urbana');
      return false;
    }
  }, []);

  const update = useCallback(async (id: number, data: CityZoneFormData): Promise<boolean> => {
    try {
      setError(null);
      const updatedCityZone = await updateCityZone(id, data);
      setCityZones(prev => 
        prev.map(zone => zone.id === id ? updatedCityZone : zone)
      );
      return true;
    } catch (error) {
      console.error('Error updating city zone:', error);
      setError('Error al actualizar la zona urbana');
      return false;
    }
  }, []);

  const remove = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await deleteCityZone(id);
      setCityZones(prev => prev.filter(zone => zone.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting city zone:', error);
      setError('Error al eliminar la zona urbana');
      return false;
    }
  }, []);

  const getByCity = useCallback(async (cityId: number): Promise<CityZone[]> => {
    try {
      setError(null);
      return await getCityZonesByCity(cityId);
    } catch (error) {
      console.error('Error fetching city zones by city:', error);
      setError('Error al cargar las zonas urbanas de la ciudad');
      return [];
    }
  }, []);

  useEffect(() => {
    loadCityZones();
  }, [loadCityZones]);

  return {
    cityZones,
    loading,
    error,
    create,
    update,
    remove,
    getByCity,
    reload: loadCityZones
  };
}
