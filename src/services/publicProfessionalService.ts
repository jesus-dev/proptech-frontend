import { apiClient } from '@/lib/api';

export interface PublicProfessional {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  status: string;
  companyName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  website?: string;
  description?: string;
  hourlyRate?: number;
  minimumServicePrice?: number;
  currencyCode?: string;
  experienceYears?: number;
  completedJobs?: number;
  averageRating?: number;
  totalReviews?: number;
  isVerified?: boolean;
  isAvailable?: boolean;
  photo?: string;
  socialMedia?: string[];
  serviceAreas?: string[];
  skills?: string[];
  certifications?: string[];
  portfolioImages?: string[];
}

class PublicProfessionalService {
  async getAllProfessionals(): Promise<PublicProfessional[]> {
    try {
      const response = await apiClient.get('/api/public/professionals');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching professionals:', error);
      return [];
    }
  }

  async getProfessionalById(id: number): Promise<PublicProfessional | null> {
    try {
      const response = await apiClient.get(`/api/public/professionals/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching professional:', error);
      return null;
    }
  }

  async registerProfessional(data: {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    documentNumber?: string;
    documentType?: string;
    serviceTypeId: number;
    companyName?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    description?: string;
    experienceYears?: number;
  }): Promise<{ success: boolean; message: string; professionalId?: number }> {
    try {
      // Asegurar que serviceTypeId sea un número
      const payload = {
        ...data,
        serviceTypeId: Number(data.serviceTypeId)
      };
      
      console.log('Payload enviado al backend:', payload);
      
      const response = await apiClient.post('/api/public/professionals/register', payload);
      return response.data;
    } catch (error: any) {
      console.error('Error registering professional:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al procesar el registro. Por favor, intenta nuevamente.';
      throw new Error(errorMessage);
    }
  }

  async updateAdditionalInfo(id: number, data: {
    email?: string;
    documentNumber?: string;
    documentType?: string;
    companyName?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    description?: string;
    experienceYears?: number;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.put(`/api/public/professionals/${id}/additional-info`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating additional info:', error);
      throw new Error(error.response?.data?.error || 'Error al actualizar la información');
    }
  }
}

export const publicProfessionalService = new PublicProfessionalService();

