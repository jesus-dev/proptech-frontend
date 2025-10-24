import { getEndpoint } from '@/lib/api-config';

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
  private baseUrl = getEndpoint('/api/agents');

  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async getAllAgents(): Promise<Agent[]> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  }

  async getAgentById(id: number): Promise<Agent> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  }

  async getAgentsByAgency(agencyId: number): Promise<Agent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/agency/${agencyId}`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching agents by agency:', error);
      throw error;
    }
  }

  async getIndependentAgents(): Promise<Agent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/independent`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching independent agents:', error);
      throw error;
    }
  }

  async getAgentByEmail(email: string): Promise<Agent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/by-email/${encodeURIComponent(email)}`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching agent by email:', error);
      return null;
    }
  }

  async getAgentByUserId(userId: number): Promise<Agent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/by-user-id/${userId}`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching agent by userId:', error);
      return null;
    }
  }
}

export const agentService = new AgentService(); 