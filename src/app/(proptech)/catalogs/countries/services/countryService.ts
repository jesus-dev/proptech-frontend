import { apiClient } from '@/lib/api';

export interface Country {
  id: number;
  name: string;
  code: string;
  phoneCode?: string;
}

// Get all countries
export const getAllCountries = async (): Promise<Country[]> => {
  try {
    const res = await apiClient.get('/api/countries');
    return res.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw new Error('Error al obtener países');
  }
};

// Get country by ID
export const getCountryById = async (id: number): Promise<Country | null> => {
  try {
    const res = await apiClient.get(`/api/countries/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching country:', error);
    return null;
  }
};

// Create new country
export const createCountry = async (data: { name: string; code: string; phoneCode?: string }) => {
  try {
    const res = await apiClient.post('/api/countries', data);
    return res.data;
  } catch (error) {
    console.error('Error creating country:', error);
    throw new Error('Error al crear país');
  }
};

// Update country
export const updateCountry = async (id: number, data: { name: string; code: string; phoneCode?: string }) => {
  try {
    const res = await apiClient.put(`/api/countries/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('Error updating country:', error);
    throw new Error('Error al actualizar país');
  }
};

// Delete country
export const deleteCountry = async (id: number) => {
  try {
    await apiClient.delete(`/api/countries/${id}`);
  } catch (error) {
    console.error('Error deleting country:', error);
    throw new Error('Error al eliminar país');
  }
}; 