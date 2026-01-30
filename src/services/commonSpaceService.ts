import { apiClient } from '@/lib/api';

export interface CommonSpace {
  id: number;
  condominiumId: number;
  name: string;
  description?: string;
  capacity?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const commonSpaceService = {
  async list(condominiumId: number): Promise<CommonSpace[]> {
    const response = await apiClient.get(`/api/condominiums/common-spaces?condominiumId=${condominiumId}`);
    return response.data as CommonSpace[];
  },
  async getById(id: number): Promise<CommonSpace> {
    const response = await apiClient.get(`/api/condominiums/common-spaces/${id}`);
    return response.data as CommonSpace;
  },
  async create(data: Partial<CommonSpace>): Promise<CommonSpace> {
    const response = await apiClient.post('/api/condominiums/common-spaces', data);
    return response.data as CommonSpace;
  },
  async update(id: number, data: Partial<CommonSpace>): Promise<CommonSpace> {
    const response = await apiClient.put(`/api/condominiums/common-spaces/${id}`, data);
    return response.data as CommonSpace;
  },
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/condominiums/common-spaces/${id}`);
  },
};
