import { apiClient } from '@/lib/api';

export interface CondominiumAnnouncement {
  id: number;
  condominiumId: number;
  title: string;
  content?: string;
  publishedAt?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const condominiumAnnouncementService = {
  async list(condominiumId: number): Promise<CondominiumAnnouncement[]> {
    const response = await apiClient.get(`/api/condominiums/announcements?condominiumId=${condominiumId}`);
    return response.data as CondominiumAnnouncement[];
  },
  async getById(id: number): Promise<CondominiumAnnouncement> {
    const response = await apiClient.get(`/api/condominiums/announcements/${id}`);
    return response.data as CondominiumAnnouncement;
  },
  async create(data: Partial<CondominiumAnnouncement>): Promise<CondominiumAnnouncement> {
    const response = await apiClient.post('/api/condominiums/announcements', data);
    return response.data as CondominiumAnnouncement;
  },
  async update(id: number, data: Partial<CondominiumAnnouncement>): Promise<CondominiumAnnouncement> {
    const response = await apiClient.put(`/api/condominiums/announcements/${id}`, data);
    return response.data as CondominiumAnnouncement;
  },
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/condominiums/announcements/${id}`);
  },
};
