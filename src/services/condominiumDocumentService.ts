import { apiClient } from '@/lib/api';

export interface CondominiumDocument {
  id: number;
  condominiumId: number;
  title: string;
  documentType?: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const condominiumDocumentService = {
  async list(condominiumId: number): Promise<CondominiumDocument[]> {
    const response = await apiClient.get(`/api/condominiums/documents?condominiumId=${condominiumId}`);
    return response.data as CondominiumDocument[];
  },
  async getById(id: number): Promise<CondominiumDocument> {
    const response = await apiClient.get(`/api/condominiums/documents/${id}`);
    return response.data as CondominiumDocument;
  },
  async create(data: Partial<CondominiumDocument>): Promise<CondominiumDocument> {
    const response = await apiClient.post('/api/condominiums/documents', data);
    return response.data as CondominiumDocument;
  },
  async update(id: number, data: Partial<CondominiumDocument>): Promise<CondominiumDocument> {
    const response = await apiClient.put(`/api/condominiums/documents/${id}`, data);
    return response.data as CondominiumDocument;
  },
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/condominiums/documents/${id}`);
  },
};
