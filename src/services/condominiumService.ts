import { apiClient } from '@/lib/api';

export interface Condominium {
  id: number;
  developmentId?: number | null;
  developmentName?: string | null;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
  administratorName?: string;
  administratorEmail?: string;
  administratorPhone?: string;
  currencyId?: number | null;
  currencyCode?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CondominiumFilters {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
}

export interface PaginatedCondominiumsResponse {
  condominiums: Condominium[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export const condominiumService = {
  async getCondominiumsPaginated(filters?: CondominiumFilters): Promise<PaginatedCondominiumsResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }
      
      const response = await apiClient.get(`/api/condominiums?${searchParams.toString()}`);
      console.log("🌐 API Response:", response);
      console.log("🌐 Response data:", response.data);
      
      // Asegurar que la respuesta tenga el formato correcto
      const data = response.data;
      if (!data) {
        throw new Error('No data received from API');
      }
      
      // Si la respuesta viene como { condominiums: [], total: 0, ... } usarla directamente
      // Si viene como { properties: [], ... } o similar, adaptarla
      if (data.condominiums !== undefined) {
        return data as PaginatedCondominiumsResponse;
      }
      
      // Fallback: intentar extraer datos de diferentes formatos
      return {
        condominiums: data.content || data.data || data.condominiums || [],
        total: data.total || data.totalElements || 0,
        page: data.page || data.number || 1,
        size: data.size || data.limit || 12,
        totalPages: data.totalPages || Math.ceil((data.total || 0) / (data.size || data.limit || 12))
      };
    } catch (error: any) {
      console.error('Error fetching condominiums:', error);
      throw new Error(error?.response?.data?.error || 'Error al cargar condominios');
    }
  },

  async getCondominiumById(id: number): Promise<Condominium> {
    try {
      const response = await apiClient.get(`/api/condominiums/${id}`);
      return response.data as Condominium;
    } catch (error: any) {
      console.error('Error fetching condominium:', error);
      throw new Error(error?.response?.data?.error || 'Error al cargar condominio');
    }
  },

  async createCondominium(data: Partial<Condominium>): Promise<Condominium> {
    try {
      const response = await apiClient.post('/api/condominiums', data);
      return response.data as Condominium;
    } catch (error: any) {
      console.error('Error creating condominium:', error);
      throw new Error(error?.response?.data?.error || 'Error al crear condominio');
    }
  },

  async updateCondominium(id: number, data: Partial<Condominium>): Promise<Condominium> {
    try {
      const response = await apiClient.put(`/api/condominiums/${id}`, data);
      return response.data as Condominium;
    } catch (error: any) {
      console.error('Error updating condominium:', error);
      throw new Error(error?.response?.data?.error || 'Error al actualizar condominio');
    }
  },

  async deleteCondominium(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/condominiums/${id}`);
    } catch (error: any) {
      console.error('Error deleting condominium:', error);
      throw new Error(error?.response?.data?.error || 'Error al eliminar condominio');
    }
  },

  async getCities(): Promise<string[]> {
    try {
      const response = await apiClient.get('/api/condominiums/cities');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Error fetching condominium cities:', error);
      return [];
    }
  }
};

