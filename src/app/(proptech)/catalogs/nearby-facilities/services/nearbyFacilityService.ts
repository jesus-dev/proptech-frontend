import { apiClient } from '@/lib/api';
import { NearbyFacility, NearbyFacilityFormData, FacilityType } from '../types';

export const nearbyFacilityService = {
  // Obtener todas las facilidades
  async getAll(): Promise<NearbyFacility[]> {
    const response = await apiClient.get('/api/nearby-facilities');
    return response.data;
  },

  // Obtener facilidades activas
  async getActive(): Promise<NearbyFacility[]> {
    const response = await apiClient.get('/api/nearby-facilities?active=true');
    return response.data;
  },

  // Obtener facilidad por ID
  async getById(id: number): Promise<NearbyFacility> {
    const response = await apiClient.get(`/api/nearby-facilities/${id}`);
    return response.data;
  },

  // Obtener facilidades por tipo
  async getByType(type: FacilityType): Promise<NearbyFacility[]> {
    const response = await apiClient.get(`/api/nearby-facilities/type/${type}`);
    return response.data;
  },

  // Buscar facilidades por nombre
  async searchByName(name: string): Promise<NearbyFacility[]> {
    const response = await apiClient.get(`/api/nearby-facilities/search?name=${encodeURIComponent(name)}`);
    return response.data;
  },

  // Obtener facilidades cercanas por coordenadas
  async getNearbyFacilities(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 5
  ): Promise<NearbyFacility[]> {
    const response = await apiClient.get(
      `/api/nearby-facilities/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radiusKm}`
    );
    return response.data;
  },

  // Obtener todos los tipos de facilidades
  async getTypes(): Promise<FacilityType[]> {
    const response = await apiClient.get('/api/nearby-facilities/types');
    return response.data;
  },

  // Crear nueva facilidad
  async create(data: NearbyFacilityFormData): Promise<NearbyFacility> {
    const response = await apiClient.post('/api/nearby-facilities', data);
    return response.data;
  },

  // Actualizar facilidad
  async update(id: number, data: NearbyFacilityFormData): Promise<NearbyFacility> {
    const response = await apiClient.put(`/api/nearby-facilities/${id}`, data);
    return response.data;
  },

  // Eliminar facilidad
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/nearby-facilities/${id}`);
  },

  // Cambiar estado activo/inactivo
  async toggleActive(id: number): Promise<void> {
    await apiClient.patch(`/api/nearby-facilities/${id}/toggle-active`);
  }
};
