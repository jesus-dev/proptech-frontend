import { apiClient } from '@/lib/api';

export interface Agent {
  id: number;
  // Datos del usuario (vienen de la relación con User)
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Datos específicos del agente
  dni?: string;
  license?: string;
  position?: string;
  bio?: string;
  photo?: string;
  agencyId?: number;
  agencyName?: string;
  username: string;
  isActive: boolean;
  active: boolean;
  role: 'ADMIN' | 'AGENTE' | 'SUPERVISOR';
  createdAt: string;
  updatedAt: string;
}

class AgentService {

  async getAllAgents(): Promise<Agent[]> {
    try {
      const response = await apiClient.get('/api/agents');
      return response.data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      return [];
    }
  }

  async getAgentById(id: number): Promise<Agent> {
    try {
      const response = await apiClient.get(`/api/agents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  }

  async getAgentsByAgency(agencyId: number): Promise<Agent[]> {
    try {
      const response = await apiClient.get(`/api/agents/agency/${agencyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agents by agency:', error);
      return [];
    }
  }

  async getIndependentAgents(): Promise<Agent[]> {
    try {
      const response = await apiClient.get('/api/agents/independent');
      return response.data;
    } catch (error) {
      console.error('Error fetching independent agents:', error);
      return [];
    }
  }

  async getAgentByEmail(email: string): Promise<Agent | null> {
    try {
      const response = await apiClient.get(`/api/agents/by-email/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error: any) {
      // 404 es esperado cuando no hay agente asociado al usuario
      // El interceptor de apiClient ya suprime estos errores en la consola
      if (error.response?.status === 404) {
        return null;
      }
      // Solo registrar otros errores
      console.error('Error fetching agent by email:', error);
      return null;
    }
  }

  async getAgentByUserId(userId: number): Promise<Agent | null> {
    try {
      const response = await apiClient.get(`/api/agents/by-user-id/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching agent by userId:', error);
      return null;
    }
  }
}

export const agentService = new AgentService(); 