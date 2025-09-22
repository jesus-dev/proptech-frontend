import { apiClient } from '@/lib/api';
import { DevelopmentUnit } from '../components/types';

export const developmentUnitService = {
  // Obtener todas las unidades
  async getAllUnits(): Promise<DevelopmentUnit[]> {
    const response = await apiClient.get<DevelopmentUnit[]>('/api/developments/units');
    return response.data || [];
  },

  // Obtener unidades por desarrollo
  async getUnitsByDevelopmentId(developmentId: string): Promise<DevelopmentUnit[]> {
    const response = await apiClient.get<DevelopmentUnit[]>(`/api/developments/${developmentId}/units`);
    return response.data || [];
  },

  // Obtener unidad por ID
  async getUnitById(id: string): Promise<DevelopmentUnit> {
    const response = await apiClient.get<DevelopmentUnit>(`/api/developments/units/${id}`);
    return response.data!;
  },

  // Crear nueva unidad
  async createUnit(developmentId: string, unit: Partial<DevelopmentUnit>): Promise<DevelopmentUnit> {
    const response = await apiClient.post<DevelopmentUnit>(`/api/developments/${developmentId}/units`, unit);
    return response.data!;
  },

  // Actualizar unidad
  async updateUnit(id: string, unit: Partial<DevelopmentUnit>): Promise<DevelopmentUnit> {
    const response = await apiClient.put<DevelopmentUnit>(`/api/developments/units/${id}`, unit);
    return response.data!;
  },

  // Eliminar unidad
  async deleteUnit(id: string): Promise<void> {
    await apiClient.delete(`/api/developments/units/${id}`);
  },

  // Obtener unidades por estado
  async getUnitsByStatus(status: string): Promise<DevelopmentUnit[]> {
    const response = await apiClient.get<DevelopmentUnit[]>(`/api/developments/units/status/${status}`);
    return response.data || [];
  },

  // Obtener unidades por tipo
  async getUnitsByType(type: string): Promise<DevelopmentUnit[]> {
    const response = await apiClient.get<DevelopmentUnit[]>(`/api/developments/units/type/${type}`);
    return response.data || [];
  },

  // Obtener unidades disponibles
  async getAvailableUnits(): Promise<DevelopmentUnit[]> {
    const response = await apiClient.get<DevelopmentUnit[]>('/api/developments/units/available');
    return response.data || [];
  },

  // Obtener unidades destacadas
  async getFeaturedUnits(): Promise<DevelopmentUnit[]> {
    const response = await apiClient.get<DevelopmentUnit[]>('/api/developments/units/featured');
    return response.data || [];
  },

  // Obtener unidades premium
  async getPremiumUnits(): Promise<DevelopmentUnit[]> {
    const response = await apiClient.get<DevelopmentUnit[]>('/api/developments/units/premium');
    return response.data || [];
  },

  // Incrementar vistas
  async incrementViews(id: string): Promise<void> {
    await apiClient.post(`/api/developments/units/${id}/views`);
  },

  // Incrementar favoritos
  async incrementFavorites(id: string): Promise<void> {
    await apiClient.post(`/api/developments/units/${id}/favorites`);
  },

  // Decrementar favoritos
  async decrementFavorites(id: string): Promise<void> {
    await apiClient.delete(`/api/developments/units/${id}/favorites`);
  },

  // Incrementar consultas
  async incrementInquiries(id: string): Promise<void> {
    await apiClient.post(`/api/developments/units/${id}/inquiries`);
  },

  // Obtener estadísticas
  async getStats(): Promise<{
    total: number;
    available: number;
    reserved: number;
    sold: number;
  }> {
    const response = await apiClient.get<{
      total: number;
      available: number;
      reserved: number;
      sold: number;
    }>('/api/developments/units/stats');
    return response.data!;
  }
}; 