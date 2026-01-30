import { apiClient } from '@/lib/api';

export interface Neighborhood {
  id: number;
  name: string;
  /** Present when API returns DTO (NeighborhoodResponse) */
  cityId?: number;
  cityName?: string;
  /** Present when API returns entity (objeto city anidado) */
  city?: { id: number; name?: string };
}

/** Obtiene el ID de ciudad de un barrio (soporta DTO con cityId o entidad con city) */
export function getNeighborhoodCityId(n: Neighborhood): number | undefined {
  if (n.cityId != null) return Number(n.cityId);
  if (n.city?.id != null) return Number(n.city.id);
  return undefined;
}

// Get all neighborhoods
export const getAllNeighborhoods = async (): Promise<Neighborhood[]> => {
  try {
    const res = await apiClient.get('/api/neighborhoods');
    return res.data;
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    throw new Error('Error al obtener barrios');
  }
};

// Get neighborhood by ID
export const getNeighborhoodById = async (id: number): Promise<Neighborhood | null> => {
  try {
    const res = await apiClient.get(`/api/neighborhoods/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching neighborhood:', error);
    return null;
  }
};

// Normalizar respuesta: puede ser array directo o { content/data: [] }
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

// Get neighborhoods by city
export const getNeighborhoodsByCity = async (cityId: number): Promise<Neighborhood[]> => {
  try {
    const res = await apiClient.get(`/api/neighborhoods/city/${cityId}`);
    return normalizeListResponse<Neighborhood>(res.data);
  } catch (error) {
    console.error('Error fetching neighborhoods by city:', error);
    throw new Error('Error al obtener barrios de la ciudad');
  }
};

// Create new neighborhood
export const createNeighborhood = async (data: { name: string; cityId: number }) => {
  try {
    const res = await apiClient.post('/api/neighborhoods', data);
    return res.data;
  } catch (error: any) {
    console.error('Error creating neighborhood:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
    throw new Error(`Error al crear barrio: ${errorMessage}`);
  }
};

// Update neighborhood
export const updateNeighborhood = async (id: number, data: { name: string; cityId: number }) => {
  try {
    const res = await apiClient.put(`/api/neighborhoods/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('Error updating neighborhood:', error);
    throw new Error('Error al actualizar barrio');
  }
};

// Delete neighborhood
export const deleteNeighborhood = async (id: number) => {
  try {
    await apiClient.delete(`/api/neighborhoods/${id}`);
  } catch (error) {
    console.error('Error deleting neighborhood:', error);
    throw new Error('Error al eliminar barrio');
  }
}; 