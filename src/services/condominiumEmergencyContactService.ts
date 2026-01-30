import { apiClient } from '@/lib/api';

export interface CondominiumEmergencyContact {
  id: number;
  condominiumId: number;
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  notes?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const condominiumEmergencyContactService = {
  async list(condominiumId: number): Promise<CondominiumEmergencyContact[]> {
    const response = await apiClient.get(`/api/condominiums/emergency-contacts?condominiumId=${condominiumId}`);
    return response.data as CondominiumEmergencyContact[];
  },
  async getById(id: number): Promise<CondominiumEmergencyContact> {
    const response = await apiClient.get(`/api/condominiums/emergency-contacts/${id}`);
    return response.data as CondominiumEmergencyContact;
  },
  async create(data: Partial<CondominiumEmergencyContact>): Promise<CondominiumEmergencyContact> {
    const response = await apiClient.post('/api/condominiums/emergency-contacts', data);
    return response.data as CondominiumEmergencyContact;
  },
  async update(id: number, data: Partial<CondominiumEmergencyContact>): Promise<CondominiumEmergencyContact> {
    const response = await apiClient.put(`/api/condominiums/emergency-contacts/${id}`, data);
    return response.data as CondominiumEmergencyContact;
  },
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/condominiums/emergency-contacts/${id}`);
  },
};
