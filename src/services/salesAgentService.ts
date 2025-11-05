/**
 * Servicio de Agentes de Ventas
 * Usa apiClient que YA TIENE reintentos automáticos
 */

import { apiClient } from '@/lib/api';

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
  async getAllAgents(): Promise<SalesAgent[]> {
    try {
      const response = await apiClient.get('/api/sales-agents');
      return response.data;
    } catch (error) {
      console.error('Error fetching sales agents:', error);
      throw error;
    }
  }

  async getAgentById(id: number): Promise<SalesAgent> {
    try {
      const response = await apiClient.get(`/api/sales-agents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales agent:', error);
      throw error;
    }
  }

  async createAgent(agentData: CreateSalesAgentRequest): Promise<SalesAgent> {
    try {
      const response = await apiClient.post('/api/sales-agents', agentData);
      return response.data;
    } catch (error) {
      console.error('Error creating sales agent:', error);
      throw error;
    }
  }

  async updateAgent(id: number, agentData: Partial<CreateSalesAgentRequest>): Promise<SalesAgent> {
    try {
      const response = await apiClient.put(`/api/sales-agents/${id}`, agentData);
      return response.data;
    } catch (error) {
      console.error('Error updating sales agent:', error);
      throw error;
    }
  }

  async deleteAgent(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/sales-agents/${id}`);
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
      const response = await apiClient.get('/api/sales-agents/stats');
      return response.data;
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
      const response = await apiClient.get(`/api/sales-agents/${id}/performance`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent performance:', error);
      throw error;
    }
  }
}

export const salesAgentService = new SalesAgentService();
