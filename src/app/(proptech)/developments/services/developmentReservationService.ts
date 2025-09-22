import { apiClient } from '@/lib/api';
import { DevelopmentReservation } from '../components/types';

export const developmentReservationService = {
  // Obtener todas las reservas
  async getAllReservations(): Promise<DevelopmentReservation[]> {
    const response = await apiClient.get<DevelopmentReservation[]>('/api/developments/reservations');
    return response.data || [];
  },

  // Obtener reservas por desarrollo
  async getReservationsByDevelopmentId(developmentId: string): Promise<DevelopmentReservation[]> {
    const response = await apiClient.get<DevelopmentReservation[]>(`/api/developments/reservations/development/${developmentId}`);
    return response.data || [];
  },

  // Obtener reserva por ID
  async getReservationById(id: string): Promise<DevelopmentReservation> {
    const response = await apiClient.get<DevelopmentReservation>(`/api/developments/reservations/${id}`);
    return response.data!;
  },

  // Crear nueva reserva
  async createReservation(developmentId: string, reservation: Partial<DevelopmentReservation>): Promise<DevelopmentReservation> {
    const response = await apiClient.post<DevelopmentReservation>(`/api/developments/reservations/development/${developmentId}`, reservation);
    return response.data!;
  },

  // Actualizar reserva
  async updateReservation(id: string, reservation: Partial<DevelopmentReservation>): Promise<DevelopmentReservation> {
    const response = await apiClient.put<DevelopmentReservation>(`/api/developments/reservations/${id}`, reservation);
    return response.data!;
  },

  // Eliminar reserva
  async deleteReservation(id: string): Promise<void> {
    await apiClient.delete(`/api/developments/reservations/${id}`);
  },

  // Obtener reservas por estado
  async getReservationsByStatus(status: string): Promise<DevelopmentReservation[]> {
    const response = await apiClient.get<DevelopmentReservation[]>(`/api/developments/reservations/status/${status}`);
    return response.data || [];
  },

  // Obtener reservas por unidad
  async getReservationsByUnitId(unitId: string): Promise<DevelopmentReservation[]> {
    const response = await apiClient.get<DevelopmentReservation[]>(`/api/developments/reservations/unit/${unitId}`);
    return response.data || [];
  },

  // Obtener reservas por cliente
  async getReservationsByClientEmail(email: string): Promise<DevelopmentReservation[]> {
    const response = await apiClient.get<DevelopmentReservation[]>(`/api/developments/reservations/client/${email}`);
    return response.data || [];
  },

  // Obtener reservas por documento
  async getReservationsByClientDocument(document: string): Promise<DevelopmentReservation[]> {
    const response = await apiClient.get<DevelopmentReservation[]>(`/api/developments/reservations/document/${document}`);
    return response.data || [];
  },

  // Obtener reservas vencidas
  async getExpiredReservations(): Promise<DevelopmentReservation[]> {
    const response = await apiClient.get<DevelopmentReservation[]>('/api/developments/reservations/expired');
    return response.data || [];
  },

  // Obtener reservas que vencen pronto
  async getExpiringSoonReservations(daysAhead: number = 7): Promise<DevelopmentReservation[]> {
    const response = await apiClient.get<DevelopmentReservation[]>(`/api/developments/reservations/expiring-soon?days=${daysAhead}`);
    return response.data || [];
  },

  // Obtener reservas pendientes
  async getPendingReservations(): Promise<DevelopmentReservation[]> {
    const response = await apiClient.get<DevelopmentReservation[]>('/api/developments/reservations/pending');
    return response.data || [];
  },

  // Obtener reservas por agente
  async getReservationsByAgentId(agentId: string): Promise<DevelopmentReservation[]> {
    const response = await apiClient.get<DevelopmentReservation[]>(`/api/developments/reservations/agent/${agentId}`);
    return response.data || [];
  },

  // Confirmar reserva
  async confirmReservation(id: string): Promise<DevelopmentReservation> {
    const response = await apiClient.post<DevelopmentReservation>(`/api/developments/reservations/${id}/confirm`);
    return response.data!;
  },

  // Cancelar reserva
  async cancelReservation(id: string, reason?: string): Promise<DevelopmentReservation> {
    const response = await apiClient.post<DevelopmentReservation>(`/api/developments/reservations/${id}/cancel`, { reason });
    return response.data!;
  },

  // Convertir reserva a venta
  async convertToSale(id: string): Promise<DevelopmentReservation> {
    const response = await apiClient.post<DevelopmentReservation>(`/api/developments/reservations/${id}/convert`);
    return response.data!;
  },

  // Obtener estadísticas
  async getStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    expired: number;
    cancelled: number;
    converted: number;
    totalAmount: number;
    pendingAmount: number;
  }> {
    const response = await apiClient.get<{
      total: number;
      pending: number;
      confirmed: number;
      expired: number;
      cancelled: number;
      converted: number;
      totalAmount: number;
      pendingAmount: number;
    }>('/api/developments/reservations/stats');
    return response.data!;
  }
}; 