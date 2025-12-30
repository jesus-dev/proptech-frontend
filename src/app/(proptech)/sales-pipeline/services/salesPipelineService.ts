import { SalesPipeline, SalesAnalytics, PipelineOverview, StageBreakdown, AgentPerformance, SourceAnalysis, PipelineFilters } from '../types';
import { apiClient } from '../../../../lib/api';

export const salesPipelineService = {
  // CRUD Operations
  async getAllPipelines(): Promise<SalesPipeline[]> {
    try {
      const response = await apiClient.get<SalesPipeline[]>('/api/sales-pipeline');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      throw new Error('Error al cargar el pipeline de ventas');
    }
  },

  async getPipelineById(id: number): Promise<SalesPipeline> {
    try {
      const response = await apiClient.get<SalesPipeline>(`/api/sales-pipeline/${id}`);
      if (!response.data) {
        throw new Error('Pipeline no encontrado');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching pipeline:', error);
      throw new Error('Error al cargar el pipeline');
    }
  },

  async createPipeline(pipeline: Omit<SalesPipeline, 'id'>): Promise<SalesPipeline> {
    try {
      const response = await apiClient.post<SalesPipeline>('/api/sales-pipeline', pipeline);
      if (!response.data) {
        throw new Error('Error al crear el pipeline');
      }
      return response.data;
    } catch (error) {
      console.error('Error creating pipeline:', error);
      throw new Error('Error al crear el pipeline');
    }
  },

  async updatePipeline(id: number, pipeline: Partial<SalesPipeline>): Promise<SalesPipeline> {
    try {
      const response = await apiClient.put<SalesPipeline>(`/api/sales-pipeline/${id}`, pipeline);
      if (!response.data) {
        throw new Error('Error al actualizar el pipeline');
      }
      return response.data;
    } catch (error) {
      console.error('Error updating pipeline:', error);
      throw new Error('Error al actualizar el pipeline');
    }
  },

  async deletePipeline(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/sales-pipeline/${id}`);
    } catch (error) {
      console.error('Error deleting pipeline:', error);
      throw new Error('Error al eliminar el pipeline');
    }
  },

  // Pipeline Management
  async moveToStage(id: number, stage: string, notes?: string): Promise<SalesPipeline> {
    try {
      const response = await apiClient.patch<SalesPipeline>(`/api/sales-pipeline/${id}/stage`, {
        stage,
        notes
      });
      if (!response.data) {
        throw new Error('Error al mover el pipeline a la etapa');
      }
      return response.data;
    } catch (error) {
      console.error('Error moving pipeline to stage:', error);
      throw new Error('Error al mover el pipeline a la etapa');
    }
  },

  async updateContact(id: number, notes: string): Promise<SalesPipeline> {
    try {
      const response = await apiClient.patch<SalesPipeline>(`/api/sales-pipeline/${id}/contact`, {
        notes
      });
      if (!response.data) {
        throw new Error('Error al actualizar el contacto');
      }
      return response.data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw new Error('Error al actualizar el contacto');
    }
  },

  async closeDeal(id: number, closeReason: string, actualValue: number, commissionEarned: number): Promise<SalesPipeline> {
    try {
      const response = await apiClient.patch<SalesPipeline>(`/api/sales-pipeline/${id}/close`, {
        closeReason,
        actualValue,
        commissionEarned
      });
      if (!response.data) {
        throw new Error('Error al cerrar el deal');
      }
      return response.data;
    } catch (error) {
      console.error('Error closing deal:', error);
      throw new Error('Error al cerrar el deal');
    }
  },

  async loseDeal(id: number, closeReason: string): Promise<SalesPipeline> {
    try {
      const response = await apiClient.patch<SalesPipeline>(`/api/sales-pipeline/${id}/lose`, {
        closeReason
      });
      if (!response.data) {
        throw new Error('Error al marcar el deal como perdido');
      }
      return response.data;
    } catch (error) {
      console.error('Error losing deal:', error);
      throw new Error('Error al marcar el deal como perdido');
    }
  },

  // Filtering and Search
  async getPipelinesByAgent(agentId: number): Promise<SalesPipeline[]> {
    try {
      const response = await apiClient.get<SalesPipeline[]>(`/api/sales-pipeline/agent/${agentId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching agent pipelines:', error);
      throw new Error('Error al cargar pipelines del agente');
    }
  },

  async getPipelinesByStage(stage: string): Promise<SalesPipeline[]> {
    try {
      const response = await apiClient.get<SalesPipeline[]>(`/api/sales-pipeline/stage/${stage}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching stage pipelines:', error);
      throw new Error('Error al cargar pipelines por etapa');
    }
  },

  async getActivePipelines(): Promise<SalesPipeline[]> {
    try {
      const response = await apiClient.get<SalesPipeline[]>('/api/sales-pipeline/active');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching active pipelines:', error);
      throw new Error('Error al cargar pipelines activos');
    }
  },

  async getLeadsNeedingFollowUp(daysThreshold: number = 7): Promise<SalesPipeline[]> {
    try {
      const response = await apiClient.get<SalesPipeline[]>(`/api/sales-pipeline/follow-up?days=${daysThreshold}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching follow-up leads:', error);
      throw new Error('Error al cargar leads que necesitan seguimiento');
    }
  },

  async getUpcomingActions(): Promise<SalesPipeline[]> {
    try {
      const response = await apiClient.get<SalesPipeline[]>('/api/sales-pipeline/upcoming-actions');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching upcoming actions:', error);
      throw new Error('Error al cargar próximas acciones');
    }
  },

  async getHighProbabilityLeads(minProbability: number = 70): Promise<SalesPipeline[]> {
    try {
      const response = await apiClient.get<SalesPipeline[]>(`/api/sales-pipeline/high-probability?minProbability=${minProbability}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching high probability leads:', error);
      throw new Error('Error al cargar leads de alta probabilidad');
    }
  },

  async getUrgentLeads(): Promise<SalesPipeline[]> {
    try {
      const response = await apiClient.get<SalesPipeline[]>('/api/sales-pipeline/urgent');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching urgent leads:', error);
      throw new Error('Error al cargar leads urgentes');
    }
  },

  // Analytics
  async getPipelineOverview(): Promise<PipelineOverview> {
    try {
      const response = await apiClient.get<PipelineOverview>('/api/sales-pipeline/analytics/overview');
      if (!response.data) {
        // Return default values if no data
        return {
          totalLeads: 0,
          activeLeads: 0,
          closedWon: 0,
          closedLost: 0,
          totalPipelineValue: 0,
          winRate: 0
        };
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching pipeline overview:', error);
      // Return default values on error
      return {
        totalLeads: 0,
        activeLeads: 0,
        closedWon: 0,
        closedLost: 0,
        totalPipelineValue: 0,
        winRate: 0
      };
    }
  },

  async getStageBreakdown(): Promise<StageBreakdown> {
    try {
      const response = await apiClient.get<StageBreakdown>('/api/sales-pipeline/analytics/stages');
      if (!response.data) {
        // Return default values if no data
        return {};
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching stage breakdown:', error);
      // Return default values on error
      return {};
    }
  },

  async getAgentPerformance(): Promise<AgentPerformance> {
    try {
      const response = await apiClient.get<AgentPerformance>('/api/sales-pipeline/analytics/agents');
      if (!response.data) {
        // Return default values if no data
        return {};
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching agent performance:', error);
      // Sin datos ficticios: devolver vacío
      return {};
    }
  },

  async getSourceAnalysis(): Promise<SourceAnalysis> {
    try {
      const response = await apiClient.get<SourceAnalysis>('/api/sales-pipeline/analytics/sources');
      if (!response.data) {
        // Return default values if no data
        return {};
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching source analysis:', error);
      // Sin datos ficticios: devolver vacío
      return {};
    }
  },

  async generateAnalytics(): Promise<void> {
    try {
      await apiClient.post('/api/sales-pipeline/analytics/generate');
    } catch (error) {
      console.error('Error generating analytics:', error);
      throw new Error('Error al generar analytics');
    }
  },

  // Utility functions
  async getFilteredPipelines(filters: PipelineFilters): Promise<SalesPipeline[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.agentId) params.append('agentId', filters.agentId.toString());
      if (filters.stage) params.append('stage', filters.stage);
      if (filters.source) params.append('source', filters.source);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.minProbability) params.append('minProbability', filters.minProbability.toString());
      if (filters.maxProbability) params.append('maxProbability', filters.maxProbability.toString());

      const response = await apiClient.get<SalesPipeline[]>(`/api/sales-pipeline?${params.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching filtered pipelines:', error);
      throw new Error('Error al cargar pipelines filtrados');
    }
  },

  // Local filtering (for client-side filtering)
  filterPipelines(pipelines: SalesPipeline[], filters: PipelineFilters): SalesPipeline[] {
    return pipelines.filter(pipeline => {
      if (filters.agentId && pipeline.agentId !== filters.agentId) return false;
      if (filters.stage && pipeline.stage !== filters.stage) return false;
      if (filters.source && pipeline.source !== filters.source) return false;
      if (filters.priority && pipeline.priority !== filters.priority) return false;
      if (filters.minProbability && pipeline.probability < filters.minProbability) return false;
      if (filters.maxProbability && pipeline.probability > filters.maxProbability) return false;
      
      if (filters.dateFrom || filters.dateTo) {
        const createdAt = new Date(pipeline.createdAt || '');
        if (filters.dateFrom && createdAt < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && createdAt > new Date(filters.dateTo)) return false;
      }
      
      return true;
    });
  },

  // Statistics calculation
  calculatePipelineStats(pipelines: SalesPipeline[]) {
    const totalValue = pipelines.reduce((sum, p) => sum + (p.expectedValue || 0), 0);
    const avgProbability = pipelines.length > 0 
      ? pipelines.reduce((sum, p) => sum + p.probability, 0) / pipelines.length 
      : 0;
    const avgDaysInPipeline = pipelines.length > 0
      ? pipelines.reduce((sum, p) => sum + (p.daysInPipeline || 0), 0) / pipelines.length
      : 0;
    
    const closedWon = pipelines.filter(p => p.stage === 'CLOSED_WON').length;
    const closedLost = pipelines.filter(p => p.stage === 'CLOSED_LOST').length;
    const totalClosed = closedWon + closedLost;
    
    const conversionRate = totalClosed > 0 ? (closedWon / totalClosed) * 100 : 0;
    const winRate = totalClosed > 0 ? (closedWon / totalClosed) * 100 : 0;

    return {
      totalValue,
      avgProbability,
      avgDaysInPipeline,
      conversionRate,
      winRate
    };
  }
}; 