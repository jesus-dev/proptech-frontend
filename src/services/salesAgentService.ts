import { apiConfig } from '@/lib/api-config';

export interface SalesAgent {
  id: number;
  agentCode: string;
  fullName: string;
  email: string;
  phone: string;
  commissionPercentage: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  totalSales: number;
  totalCommissions: number;
  pendingCommissions: number;
  hireDate: string;
  notes?: string;
}

export interface CreateSalesAgentRequest {
  agentCode: string;
  fullName: string;
  email: string;
  phone: string;
  commissionPercentage: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  notes?: string;
}

export interface UpdateSalesAgentRequest extends Partial<CreateSalesAgentRequest> {
  id: number;
}

class SalesAgentService {
  private baseUrl = `${apiConfig.getApiUrl()}/api/sales-agents`;

  async getAllAgents(): Promise<SalesAgent[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sales agents:', error);
      throw error;
    }
  }

  async getAgentById(id: number): Promise<SalesAgent> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sales agent:', error);
      throw error;
    }
  }

  async createAgent(agentData: CreateSalesAgentRequest): Promise<SalesAgent> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating sales agent:', error);
      throw error;
    }
  }

  async updateAgent(id: number, agentData: Partial<CreateSalesAgentRequest>): Promise<SalesAgent> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating sales agent:', error);
      throw error;
    }
  }

  async deleteAgent(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting sales agent:', error);
      throw error;
    }
  }

  async getAgentStats(): Promise<{
    totalAgents: number;
    activeAgents: number;
    totalSales: number;
    totalCommissions: number;
    pendingCommissions: number;
  }> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching agent stats:', error);
      throw error;
    }
  }

  async getAgentPerformance(id: number): Promise<{
    monthlySales: Array<{ month: string; amount: number }>;
    commissionHistory: Array<{ date: string; amount: number }>;
    topProperties: Array<{ propertyId: number; propertyName: string; saleAmount: number }>;
  }> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.baseUrl}/${id}/performance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching agent performance:', error);
      throw error;
    }
  }
}

export const salesAgentService = new SalesAgentService();
