import { apiClient } from '@/lib/api';

// Servicio para manejar operaciones de leads/negocios
export interface Lead {
  id: string;
  status: string;
  // Agregar más propiedades según sea necesario
}

export interface LeadUpdateData {
  status?: string;
  // Agregar más propiedades según sea necesario
}

class LeadApiService {
  // Helper function to clean up malformed API URLs
  // apiClient ya maneja la URL base

  async updateLead(leadId: string, data: LeadUpdateData): Promise<Lead | null> {
    try {
      const response = await apiClient.put(`/api/leads/${leadId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating lead:', error);
      // Retornar null en caso de error para no romper el flujo
      return null;
    }
  }

  async getLead(leadId: string): Promise<Lead | null> {
    try {
      const response = await apiClient.get(`/api/leads/${leadId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lead:', error);
      return null;
    }
  }

  async getAllLeads(): Promise<Lead[]> {
    try {
      const response = await apiClient.get('/api/leads');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
  }
}

export const leadApiService = new LeadApiService(); 