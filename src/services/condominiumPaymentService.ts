import { apiClient } from '@/lib/api';

export interface CondominiumFeePayment {
  id: number;
  feeId: number;
  feePeriod?: string;
  feeType?: string;
  unitId: number;
  unitNumber?: string;
  amount: number;
  status: string;
  paymentDate?: string;
  paymentMethod?: string;
  transactionReference?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CondominiumFeePaymentFilters {
  page?: number;
  limit?: number;
  feeId?: number;
  unitId?: number;
  status?: string;
}

export interface PaginatedCondominiumFeePaymentsResponse {
  payments: CondominiumFeePayment[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export const condominiumPaymentService = {
  async getPaymentsPaginated(filters?: CondominiumFeePaymentFilters): Promise<PaginatedCondominiumFeePaymentsResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }
      
      const response = await apiClient.get(`/api/condominiums/payments?${searchParams.toString()}`);
      return response.data as PaginatedCondominiumFeePaymentsResponse;
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      throw new Error(error?.response?.data?.error || 'Error al cargar pagos');
    }
  },

  async getPaymentById(id: number): Promise<CondominiumFeePayment> {
    try {
      const response = await apiClient.get(`/api/condominiums/payments/${id}`);
      return response.data as CondominiumFeePayment;
    } catch (error: any) {
      console.error('Error fetching payment:', error);
      throw new Error(error?.response?.data?.error || 'Error al cargar pago');
    }
  },

  async createPayment(data: Partial<CondominiumFeePayment>): Promise<CondominiumFeePayment> {
    try {
      const response = await apiClient.post('/api/condominiums/payments', data);
      return response.data as CondominiumFeePayment;
    } catch (error: any) {
      console.error('Error creating payment:', error);
      throw new Error(error?.response?.data?.error || 'Error al crear pago');
    }
  },

  async updatePayment(id: number, data: Partial<CondominiumFeePayment>): Promise<CondominiumFeePayment> {
    try {
      const response = await apiClient.put(`/api/condominiums/payments/${id}`, data);
      return response.data as CondominiumFeePayment;
    } catch (error: any) {
      console.error('Error updating payment:', error);
      throw new Error(error?.response?.data?.error || 'Error al actualizar pago');
    }
  },

  async deletePayment(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/condominiums/payments/${id}`);
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      throw new Error(error?.response?.data?.error || 'Error al eliminar pago');
    }
  }
};

