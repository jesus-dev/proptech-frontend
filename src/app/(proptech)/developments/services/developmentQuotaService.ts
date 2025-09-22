import { apiClient } from '@/lib/api';
import { DevelopmentQuota } from '../components/types';

export const developmentQuotaService = {
  // Obtener todas las cuotas
  async getAllQuotas(): Promise<DevelopmentQuota[]> {
    const response = await apiClient.get<DevelopmentQuota[]>('/api/developments/quotas');
    return response.data || [];
  },

  // Obtener cuotas por desarrollo
  async getQuotasByDevelopmentId(developmentId: string): Promise<DevelopmentQuota[]> {
    const response = await apiClient.get<DevelopmentQuota[]>(`/api/developments/${developmentId}/quotas`);
    return response.data || [];
  },

  // Obtener cuota por ID
  async getQuotaById(id: string): Promise<DevelopmentQuota> {
    const response = await apiClient.get<DevelopmentQuota>(`/api/developments/quotas/${id}`);
    return response.data!;
  },

  // Crear nueva cuota
  async createQuota(developmentId: string, quota: Partial<DevelopmentQuota>): Promise<DevelopmentQuota> {
    const response = await apiClient.post<DevelopmentQuota>(`/api/developments/${developmentId}/quotas`, quota);
    return response.data!;
  },

  // Actualizar cuota
  async updateQuota(id: string, quota: Partial<DevelopmentQuota>): Promise<DevelopmentQuota> {
    const response = await apiClient.put<DevelopmentQuota>(`/api/developments/quotas/${id}`, quota);
    return response.data!;
  },

  // Eliminar cuota
  async deleteQuota(id: string): Promise<void> {
    await apiClient.delete(`/api/developments/quotas/${id}`);
  },

  // Obtener cuotas por estado
  async getQuotasByStatus(status: string): Promise<DevelopmentQuota[]> {
    const response = await apiClient.get<DevelopmentQuota[]>(`/api/developments/quotas/status/${status}`);
    return response.data || [];
  },

  // Obtener cuotas por tipo
  async getQuotasByType(type: string): Promise<DevelopmentQuota[]> {
    const response = await apiClient.get<DevelopmentQuota[]>(`/api/developments/quotas/type/${type}`);
    return response.data || [];
  },

  // Obtener cuotas por unidad
  async getQuotasByUnitId(unitId: string): Promise<DevelopmentQuota[]> {
    const response = await apiClient.get<DevelopmentQuota[]>(`/api/developments/units/${unitId}/quotas`);
    return response.data || [];
  },

  // Obtener cuotas vencidas
  async getOverdueQuotas(): Promise<DevelopmentQuota[]> {
    const response = await apiClient.get<DevelopmentQuota[]>('/api/developments/quotas/overdue');
    return response.data || [];
  },

  // Obtener cuotas que vencen pronto
  async getDueSoonQuotas(daysAhead: number = 7): Promise<DevelopmentQuota[]> {
    const response = await apiClient.get<DevelopmentQuota[]>(`/api/developments/quotas/due-soon?days=${daysAhead}`);
    return response.data || [];
  },

  // Obtener cuotas pendientes
  async getPendingQuotas(): Promise<DevelopmentQuota[]> {
    const response = await apiClient.get<DevelopmentQuota[]>('/api/developments/quotas/pending');
    return response.data || [];
  },

  // Registrar pago
  async recordPayment(id: string, paymentData: {
    paidAmount: number;
    paymentMethod: string;
    paymentReference?: string;
    notes?: string;
  }): Promise<DevelopmentQuota> {
    const response = await apiClient.post<DevelopmentQuota>(`/api/developments/quotas/${id}/payment`, paymentData);
    return response.data!;
  },

  // Obtener estadísticas
  async getStats(): Promise<{
    total: number;
    pending: number;
    paid: number;
    overdue: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  }> {
    const response = await apiClient.get<{
      total: number;
      pending: number;
      paid: number;
      overdue: number;
      totalAmount: number;
      paidAmount: number;
      pendingAmount: number;
    }>('/api/developments/quotas/stats');
    return response.data!;
  }
}; 