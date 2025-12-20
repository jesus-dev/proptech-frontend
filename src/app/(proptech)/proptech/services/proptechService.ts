import { apiClient } from '@/lib/api';

export interface PublicRegistration {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  source: string;
  createdAt: string;
}

export interface PublicAppointment {
  id: number;
  title: string;
  description?: string;
  appointmentDate: string;
  durationMinutes: number;
  appointmentType: string;
  status: string;
  location?: string;
  locationType?: string;
  clientId: number;
  clientName?: string;
  agentId: number;
  agentName?: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const proptechService = {
  /**
   * Obtener registros públicos paginados
   */
  async getPublicRegistrations(page: number = 0, size: number = 50): Promise<PaginatedResponse<PublicRegistration>> {
    try {
      const response = await apiClient.get(`/api/proptech/admin/registrations?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching public registrations:', error);
      throw error;
    }
  },

  /**
   * Obtener citas agendadas desde registros públicos paginadas
   */
  async getPublicAppointments(page: number = 0, size: number = 50): Promise<PaginatedResponse<PublicAppointment>> {
    try {
      const response = await apiClient.get(`/api/proptech/admin/appointments?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching public appointments:', error);
      throw error;
    }
  },
};

