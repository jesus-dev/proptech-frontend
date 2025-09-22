import { useState, useEffect, useCallback } from 'react';
import { locationService } from '../../../settings/services/locationService';
import { Neighborhood, City, Country } from '../types';

export function useNeighborhoods() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [neighborhoodsData, citiesData, countriesData] = await Promise.all([
        locationService.getNeighborhoods(),
        locationService.getCities(),
        locationService.getCountries()
      ]);
      setNeighborhoods(neighborhoodsData);
      setCities(citiesData);
      setCountries(countriesData);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []); // Solo se ejecuta al montar

  const createNeighborhood = useCallback(async (name: string, cityId: string): Promise<boolean> => {
    try {
      setError(null);
      await locationService.addNeighborhood(name, cityId);
      // Recargar datos después de crear
      const [neighborhoodsData, citiesData, countriesData] = await Promise.all([
        locationService.getNeighborhoods(),
        locationService.getCities(),
        locationService.getCountries()
      ]);
      setNeighborhoods(neighborhoodsData);
      setCities(citiesData);
      setCountries(countriesData);
      return true;
    } catch (error) {
      console.error("Error creating neighborhood:", error);
      setError("Error al crear el barrio");
      return false;
    }
  }, []);

  const updateNeighborhood = useCallback(async (id: string, name: string, cityId: string): Promise<boolean> => {
    try {
      setError(null);
      await locationService.updateNeighborhood(id, name, cityId);
      // Recargar datos después de actualizar
      const [neighborhoodsData, citiesData, countriesData] = await Promise.all([
        locationService.getNeighborhoods(),
        locationService.getCities(),
        locationService.getCountries()
      ]);
      setNeighborhoods(neighborhoodsData);
      setCities(citiesData);
      setCountries(countriesData);
      return true;
    } catch (error) {
      console.error("Error updating neighborhood:", error);
      setError("Error al actualizar el barrio");
      return false;
    }
  }, []);

  const deleteNeighborhood = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await locationService.deleteNeighborhood(id);
      // Recargar datos después de eliminar
      const [neighborhoodsData, citiesData, countriesData] = await Promise.all([
        locationService.getNeighborhoods(),
        locationService.getCities(),
        locationService.getCountries()
      ]);
      setNeighborhoods(neighborhoodsData);
      setCities(citiesData);
      setCountries(countriesData);
      return true;
    } catch (error) {
      console.error("Error deleting neighborhood:", error);
      setError("Error al eliminar el barrio");
      return false;
    }
  }, []);

  return {
    neighborhoods,
    cities,
    countries,
    loading,
    error,
    createNeighborhood,
    updateNeighborhood,
    deleteNeighborhood,
    setError,
    reload: loadData
  };
} 