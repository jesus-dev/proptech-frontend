import { apiClient } from '@/lib/api';

export interface CondominiumAssembly {
  id: number;
  condominiumId: number;
  title: string;
  assemblyDate?: string;
  location?: string;
  description?: string;
  minutes?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const condominiumAssemblyService = {
  async list(condominiumId: number): Promise<CondominiumAssembly[]> {
    const response = await apiClient.get(`/api/condominiums/assemblies?condominiumId=${condominiumId}`);
    return response.data as CondominiumAssembly[];
  },
  async getById(id: number): Promise<CondominiumAssembly> {
    const response = await apiClient.get(`/api/condominiums/assemblies/${id}`);
    return response.data as CondominiumAssembly;
  },
  async create(data: Partial<CondominiumAssembly>): Promise<CondominiumAssembly> {
    const response = await apiClient.post('/api/condominiums/assemblies', data);
    return response.data as CondominiumAssembly;
  },
  async update(id: number, data: Partial<CondominiumAssembly>): Promise<CondominiumAssembly> {
    const response = await apiClient.put(`/api/condominiums/assemblies/${id}`, data);
    return response.data as CondominiumAssembly;
  },
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/condominiums/assemblies/${id}`);
  },
};
