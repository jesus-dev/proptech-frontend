import { getEndpoint } from '@/lib/api-config';

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
      const response = await fetch(getEndpoint('/api/professionals'));
      if (!response.ok) {
        throw new Error('Error al obtener profesionales');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching professionals:', error);
      return [];
    }
  },

  async getProfessionalById(id: number): Promise<Professional | null> {
    try {
      const response = await fetch(getEndpoint(`/api/professionals/${id}`));
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Error al obtener el profesional');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching professional:', error);
      throw error;
    }
  },

  async createProfessional(data: Partial<Professional>): Promise<Professional> {
    try {
      const response = await fetch(getEndpoint('/api/professionals'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating professional:', error);
      throw error;
    }
  },

  async updateProfessional(id: number, data: Partial<Professional>): Promise<Professional> {
    try {
      const response = await fetch(getEndpoint(`/api/professionals/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating professional:', error);
      throw error;
    }
  },

  async deleteProfessional(id: number): Promise<void> {
    try {
      const response = await fetch(getEndpoint(`/api/professionals/${id}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el profesional');
      }
    } catch (error) {
      console.error('Error deleting professional:', error);
      throw error;
    }
  },
};

