import { getEndpoint } from '@/lib/api-config';
import { apiClient } from '@/lib/api';

export interface Professional {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentNumber?: string;
  documentType?: string;
  serviceTypeId?: number;
  serviceTypeName?: string;
  serviceTypeCode?: string;
  status: string;
  companyName?: string;
  companyRegistration?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  socialMedia?: string[];
  serviceAreas?: string[];
  skills?: string[];
  certifications?: string[];
  description?: string;
  hourlyRate?: number;
  minimumServicePrice?: number;
  currencyCode?: string;
  experienceYears?: number;
  completedJobs?: number;
  averageRating?: number;
  totalReviews?: number;
  isVerified?: boolean;
  verificationDate?: string;
  isAvailable?: boolean;
  responseTimeHours?: number;
  availabilitySchedule?: string;
  photo?: string;
  portfolioImages?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const professionalService = {
  async getAllProfessionals(): Promise<Professional[]> {
    try {
      const response = await apiClient.get('/api/professionals');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching professionals:', error);
      return [];
    }
  },

  async getProfessionalById(id: number): Promise<Professional | null> {
    try {
      const response = await apiClient.get(`/api/professionals/${id}`);
      return response.data || null;
    } catch (error: any) {
      console.error('Error fetching professional:', error);
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async createProfessional(data: Partial<Professional>): Promise<Professional> {
    try {
      const response = await apiClient.post('/api/professionals', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating professional:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al crear el profesional';
      throw new Error(errorMessage);
    }
  },

  async updateProfessional(id: number, data: Partial<Professional>): Promise<Professional> {
    try {
      const response = await apiClient.put(`/api/professionals/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating professional:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al actualizar el profesional';
      throw new Error(errorMessage);
    }
  },

  async deleteProfessional(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/professionals/${id}`);
    } catch (error: any) {
      console.error('Error deleting professional:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al eliminar el profesional';
      throw new Error(errorMessage);
    }
  },

  async uploadProfessionalPhoto(id: number, file: File, oldPhotoUrl?: string): Promise<{ fileUrl: string; success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      if (oldPhotoUrl) {
        formData.append('oldPhotoUrl', oldPhotoUrl);
      }

      const response = await apiClient.post(`/api/professionals/${id}/upload-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error uploading professional photo:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al subir la foto';
      throw new Error(`Error al subir la foto: ${errorMessage}`);
    }
  },

  async deleteProfessionalPhoto(id: number, photoUrl?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/api/professionals/${id}/photo`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting professional photo:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al eliminar la foto';
      throw new Error(`Error al eliminar la foto: ${errorMessage}`);
    }
  },
};

