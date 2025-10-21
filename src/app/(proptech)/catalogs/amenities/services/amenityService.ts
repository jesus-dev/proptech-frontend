import { apiClient } from '@/lib/api';

export interface Amenity {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
}

// Get all amenities
export const getAllAmenities = async (): Promise<Amenity[]> => {
  try {
    const response = await apiClient.get('/api/amenities');
    return response.data;
  } catch (error) {
    console.error('Error fetching amenities:', error);
    throw new Error('Error al obtener amenidades');
  }
};

// Get amenity by ID
export const getAmenityById = async (id: number): Promise<Amenity | null> => {
  try {
    const response = await apiClient.get(`/api/amenities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching amenity by id:', error);
    return null;
  }
};

// Create new amenity
export const createAmenity = async (data: { name: string; description?: string; icon?: string }) => {
  try {
    const response = await apiClient.post('/api/amenities', data);
    return response.data;
  } catch (error) {
    console.error('Error creating amenity:', error);
    throw new Error('Error al crear amenidad');
  }
};

// Update amenity
export const updateAmenity = async (id: number, data: { name: string; description?: string; icon?: string }) => {
  try {
    const response = await apiClient.put(`/api/amenities/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating amenity:', error);
    throw new Error('Error al actualizar amenidad');
  }
};

// Delete amenity
export const deleteAmenity = async (id: number) => {
  try {
    await apiClient.delete(`/api/amenities/${id}`);
  } catch (error) {
    console.error('Error deleting amenity:', error);
    throw new Error('Error al eliminar amenidad');
  }
}; 