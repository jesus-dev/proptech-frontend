import { apiClient } from '@/lib/api';

export interface City {
  id: number;
  name: string;
  departmentId: number;
  departmentName?: string;
  departmentCode?: string;
  countryId?: number;
  countryName?: string;
  active?: boolean;
  state?: string;
}

// Normaliza la respuesta: puede ser array directo o { content/data: [] }
function normalizeListResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as { content: T[] }).content)) {
    return (data as { content: T[] }).content;
  }
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: T[] }).data)) {
    return (data as { data: T[] }).data;
  }
  return [];
}

// Get all cities
export const getAllCities = async (): Promise<City[]> => {
  try {
    const res = await apiClient.get('/api/cities');
    const list = normalizeListResponse<City>(res.data);
    return list;
  } catch (error: any) {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const code = error?.code;
    const message = error?.message;
    console.error('[cityService] Error fetching cities:', { status, data, code, message }, error);
    throw new Error('Error al obtener ciudades');
  }
};

// Get city by ID
export const getCityById = async (id: number): Promise<City | null> => {
  try {
    const res = await apiClient.get(`/api/cities/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching city:', error);
    return null;
  }
};

// Get cities by department
export const getCitiesByDepartment = async (departmentId: number): Promise<City[]> => {
  try {
    const res = await apiClient.get(`/api/cities/department/${departmentId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching cities by department:', error);
    throw new Error('Error al obtener ciudades del departamento');
  }
};

// Create new city
export const createCity = async (data: { name: string; departmentId: number }) => {
  try {
    const res = await apiClient.post('/api/cities', data);
    return res.data;
  } catch (error) {
    console.error('Error creating city:', error);
    throw new Error('Error al crear ciudad');
  }
};

// Update city
export const updateCity = async (id: number, data: { name: string; departmentId: number }) => {
  try {
    const res = await apiClient.put(`/api/cities/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('Error updating city:', error);
    throw new Error('Error al actualizar ciudad');
  }
};

// Delete city
export const deleteCity = async (id: number) => {
  try {
    await apiClient.delete(`/api/cities/${id}`);
  } catch (error) {
    console.error('Error deleting city:', error);
    throw new Error('Error al eliminar ciudad');
  }
};
