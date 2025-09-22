import { apiClient } from '@/lib/api';
import { CityZone, CityZoneFormData } from '../types';

const BASE_URL = '/api/city-zones';

export const getAllCityZones = async (): Promise<CityZone[]> => {
  try {
    const response = await apiClient.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching city zones:', error);
    throw new Error('Error al cargar las zonas urbanas');
  }
};

export const getCityZoneById = async (id: number): Promise<CityZone> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching city zone:', error);
    throw new Error('Error al cargar la zona urbana');
  }
};

export const createCityZone = async (data: CityZoneFormData): Promise<CityZone> => {
  try {
    const response = await apiClient.post(BASE_URL, {
      name: data.name,
      description: data.description,
      cityId: parseInt(data.cityId),
      active: data.active
    });
    return response.data;
  } catch (error) {
    console.error('Error creating city zone:', error);
    throw new Error('Error al crear la zona urbana');
  }
};

export const updateCityZone = async (id: number, data: CityZoneFormData): Promise<CityZone> => {
  try {
    const response = await apiClient.put(`${BASE_URL}/${id}`, {
      name: data.name,
      description: data.description,
      cityId: parseInt(data.cityId),
      active: data.active
    });
    return response.data;
  } catch (error) {
    console.error('Error updating city zone:', error);
    throw new Error('Error al actualizar la zona urbana');
  }
};

export const deleteCityZone = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error('Error deleting city zone:', error);
    throw new Error('Error al eliminar la zona urbana');
  }
};

export const getCityZonesByCity = async (cityId: number): Promise<CityZone[]> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/city/${cityId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching city zones by city:', error);
    throw new Error('Error al cargar las zonas urbanas de la ciudad');
  }
};
