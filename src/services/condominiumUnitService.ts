import { apiClient } from '@/lib/api';

export interface CondominiumUnit {
  id: number;
  condominiumId: number;
  condominiumName?: string;
  unitNumber: string;
  floorNumber?: number;
  unitType?: string;
  area?: number;
  percentageOwnership?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CondominiumUnitFilters {
  page?: number;
  limit?: number;
  condominiumId?: number;
  search?: string;
}

export interface PaginatedCondominiumUnitsResponse {
  units: CondominiumUnit[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export const condominiumUnitService = {
  async getUnitsPaginated(filters?: CondominiumUnitFilters): Promise<PaginatedCondominiumUnitsResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }
      
      const response = await apiClient.get(`/api/condominiums/units?${searchParams.toString()}`);
      return response.data as PaginatedCondominiumUnitsResponse;
    } catch (error: any) {
      console.error('Error fetching units:', error);
      throw new Error(error?.response?.data?.error || 'Error al cargar unidades');
    }
  },

  async getUnitById(id: number): Promise<CondominiumUnit> {
    try {
      const response = await apiClient.get(`/api/condominiums/units/${id}`);
      return response.data as CondominiumUnit;
    } catch (error: any) {
      console.error('Error fetching unit:', error);
      throw new Error(error?.response?.data?.error || 'Error al cargar unidad');
    }
  },

  async createUnit(data: Partial<CondominiumUnit>): Promise<CondominiumUnit> {
    try {
      const response = await apiClient.post('/api/condominiums/units', data);
      return response.data as CondominiumUnit;
    } catch (error: any) {
      console.error('Error creating unit:', error);
      throw new Error(error?.response?.data?.error || 'Error al crear unidad');
    }
  },

  async updateUnit(id: number, data: Partial<CondominiumUnit>): Promise<CondominiumUnit> {
    try {
      const response = await apiClient.put(`/api/condominiums/units/${id}`, data);
      return response.data as CondominiumUnit;
    } catch (error: any) {
      console.error('Error updating unit:', error);
      throw new Error(error?.response?.data?.error || 'Error al actualizar unidad');
    }
  },

  async deleteUnit(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/condominiums/units/${id}`);
    } catch (error: any) {
      console.error('Error deleting unit:', error);
      throw new Error(error?.response?.data?.error || 'Error al eliminar unidad');
    }
  }
};

