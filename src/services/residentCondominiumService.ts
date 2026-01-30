import { apiClient } from '@/lib/api';

export interface ResidentUnit {
  id: number;
  unitNumber: string;
  role: string;
}

export interface ResidentCondominium {
  id: number;
  name: string;
  units: ResidentUnit[];
}

export interface ResidentMeResponse {
  condominiums: ResidentCondominium[];
}

export const residentCondominiumService = {
  async getMe(): Promise<ResidentMeResponse> {
    const response = await apiClient.get('/api/condominiums/resident/me');
    const data = response.data;
    if (data && typeof data === 'object' && Array.isArray(data.condominiums)) {
      return data as ResidentMeResponse;
    }
    return { condominiums: data?.condominiums ?? [] };
  },
  async getDocuments(condominiumId: number) {
    const response = await apiClient.get(`/api/condominiums/resident/documents?condominiumId=${condominiumId}`);
    return response.data;
  },
  async getAnnouncements(condominiumId: number) {
    const response = await apiClient.get(`/api/condominiums/resident/announcements?condominiumId=${condominiumId}`);
    return response.data;
  },
  async getEmergencyContacts(condominiumId: number) {
    const response = await apiClient.get(`/api/condominiums/resident/emergency-contacts?condominiumId=${condominiumId}`);
    return response.data;
  },
  async getCommonSpaces(condominiumId: number) {
    const response = await apiClient.get(`/api/condominiums/resident/common-spaces?condominiumId=${condominiumId}`);
    return response.data;
  },
  async getAssemblies(condominiumId: number) {
    const response = await apiClient.get(`/api/condominiums/resident/assemblies?condominiumId=${condominiumId}`);
    return response.data;
  },
  async getMyPayments() {
    const response = await apiClient.get('/api/condominiums/resident/my-payments');
    return response.data;
  },
  async getMyReservations(condominiumId?: number) {
    const url = condominiumId
      ? `/api/condominiums/resident/my-reservations?condominiumId=${condominiumId}`
      : '/api/condominiums/resident/my-reservations';
    const response = await apiClient.get(url);
    return response.data;
  },
  async createReservation(data: {
    spaceId: number;
    unitId: number;
    reservationDate?: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
  }) {
    const response = await apiClient.post('/api/condominiums/resident/reservations', data);
    return response.data;
  },
  async cancelReservation(id: number) {
    const response = await apiClient.delete(`/api/condominiums/resident/reservations/${id}`);
    return response.data;
  },
};
