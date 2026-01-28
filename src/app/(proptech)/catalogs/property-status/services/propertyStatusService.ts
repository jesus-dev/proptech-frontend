import { apiClient } from '@/lib/api';

export interface PropertyStatus {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

// Get all property statuses
export const getAllPropertyStatuses = async (): Promise<PropertyStatus[]> => {
  const res = await apiClient.get('/api/property-status');
  return res.data;
};

// Get property status by ID
export const getPropertyStatusById = async (id: number): Promise<PropertyStatus | null> => {
  try {
    const res = await apiClient.get(`/api/property-status/${id}`);
    return res.data;
  } catch (error) {
    return null;
  }
};

// Create new property status
export const createPropertyStatus = async (data: { name: string; description?: string }) => {
  const res = await apiClient.post('/api/property-status', data);
  return res.data;
};

// Update property status
export const updatePropertyStatus = async (id: number, data: { name: string; description?: string }) => {
  const res = await apiClient.put(`/api/property-status/${id}`, data);
  return res.data;
};

// Delete property status
export const deletePropertyStatus = async (id: number) => {
  await apiClient.delete(`/api/property-status/${id}`);
}; 