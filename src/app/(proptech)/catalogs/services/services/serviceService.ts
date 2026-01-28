import { apiClient } from '@/lib/api';

export interface Service {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

// Get all services
export const getAllServices = async (): Promise<Service[]> => {
  const res = await apiClient.get('/api/services');
  return res.data;
};

// Get service by ID
export const getServiceById = async (id: number): Promise<Service | null> => {
  try {
    const res = await apiClient.get(`/api/services/${id}`);
    return res.data;
  } catch (error) {
    return null;
  }
};

// Create new service
export const createService = async (data: { name: string; description?: string; icon?: string }) => {
  const res = await apiClient.post('/api/services', data);
  return res.data;
};

// Update service
export const updateService = async (id: number, data: { name: string; description?: string; icon?: string }) => {
  const res = await apiClient.put(`/api/services/${id}`, data);
  return res.data;
};

// Delete service
export const deleteService = async (id: number) => {
  await apiClient.delete(`/api/services/${id}`);
}; 