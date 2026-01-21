import { apiClient } from '@/lib/api';

export interface CondominiumFee {
  id: number;
  condominiumId: number;
  condominiumName?: string;
  period: string; // Format: "YYYY-MM"
  totalAmount: number;
  type: string; // COMMON, EXTRAORDINARY, SPECIAL
  description?: string;
  dueDate: string;
  generatedDate?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CondominiumFeeFilters {
  page?: number;
  limit?: number;
  condominiumId?: number;
  period?: string;
  type?: string;
}

export interface PaginatedCondominiumFeesResponse {
  fees: CondominiumFee[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export const condominiumFeeService = {
  async getFeesPaginated(filters?: CondominiumFeeFilters): Promise<PaginatedCondominiumFeesResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }
      
      const response = await apiClient.get(`/api/condominiums/fees?${searchParams.toString()}`);
      return response.data as PaginatedCondominiumFeesResponse;
    } catch (error: any) {
      console.error('Error fetching fees:', error);
      throw new Error(error?.response?.data?.error || 'Error al cargar cuotas');
    }
  },

  async getFeeById(id: number): Promise<CondominiumFee> {
    try {
      const response = await apiClient.get(`/api/condominiums/fees/${id}`);
      return response.data as CondominiumFee;
    } catch (error: any) {
      console.error('Error fetching fee:', error);
      throw new Error(error?.response?.data?.error || 'Error al cargar cuota');
    }
  },

  async createFee(data: Partial<CondominiumFee>): Promise<CondominiumFee> {
    try {
      const response = await apiClient.post('/api/condominiums/fees', data);
      return response.data as CondominiumFee;
    } catch (error: any) {
      console.error('Error creating fee:', error);
      throw new Error(error?.response?.data?.error || 'Error al crear cuota');
    }
  },

  async updateFee(id: number, data: Partial<CondominiumFee>): Promise<CondominiumFee> {
    try {
      const response = await apiClient.put(`/api/condominiums/fees/${id}`, data);
      return response.data as CondominiumFee;
    } catch (error: any) {
      console.error('Error updating fee:', error);
      throw new Error(error?.response?.data?.error || 'Error al actualizar cuota');
    }
  },

  async deleteFee(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/condominiums/fees/${id}`);
    } catch (error: any) {
      console.error('Error deleting fee:', error);
      throw new Error(error?.response?.data?.error || 'Error al eliminar cuota');
    }
  }
};
