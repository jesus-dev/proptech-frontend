import { apiClient, ApiResponse, api } from '@/lib/api';

export interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}

export const healthService = {
  // Verificar el estado de salud del backend
  async checkHealth(): Promise<ApiResponse<HealthStatus>> {
    return api.get<HealthStatus>('/api/health');
  },

  // Verificar si el backend está disponible
  async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await this.checkHealth();
      return response.success && response.data?.status === 'UP';
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  },

  // Obtener información del backend
  async getBackendInfo(): Promise<HealthStatus | null> {
    try {
      const response = await this.checkHealth();
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Failed to get backend info:', error);
      return null;
    }
  }
}; 