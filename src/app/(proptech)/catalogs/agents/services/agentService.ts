import { Agent, AgentFormData, AgentStats } from '../types';
import { apiClient } from '@/lib/api';
import { getEndpoint } from '@/lib/api-config';

// Get all agents
export const getAllAgents = async (): Promise<Agent[]> => {
  try {
    const response = await apiClient.get('/api/agents');
    return response.data;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw new Error('Error al obtener agentes');
  }
};

// Get agent by ID
export const getAgentById = async (id: string): Promise<Agent | null> => {
  try {
    const response = await apiClient.get(`/api/agents/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching agent by id:', error);
    return null;
  }
};

// Get agent by email
export const getAgentByEmail = async (email: string): Promise<Agent | null> => {
  try {
    const agents = await getAllAgents();
    return agents.find(agent => agent.email === email) || null;
  } catch (error) {
    console.error('Error getting agent by email:', error);
    return null;
  }
};

// Create new agent
export const createAgent = async (data: AgentFormData): Promise<Agent> => {
  try {
    const response = await apiClient.post('/api/agents', data);
    return response.data;
  } catch (error) {
    console.error('Error creating agent:', error);
    throw new Error('Error al crear agente');
  }
};

// Update agent
export const updateAgent = async (id: string, data: Partial<AgentFormData>): Promise<Agent> => {
  try {
    const response = await apiClient.put(`/api/agents/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating agent:', error);
    throw new Error('Error al actualizar agente');
  }
};

// Delete agent
export const deleteAgent = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/api/agents/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting agent:', error);
    throw new Error('Error al eliminar agente');
  }
};

// Search agents
export const searchAgents = async (searchTerm: string): Promise<Agent[]> => {
  try {
    const agents = await getAllAgents();
    const term = searchTerm.toLowerCase();
    
    return agents.filter(agent => 
      (agent.nombre || agent.firstName || '').toLowerCase().includes(term) ||
      (agent.apellido || agent.lastName || '').toLowerCase().includes(term) ||
      (agent.nombreCompleto || '').toLowerCase().includes(term) ||
      agent.email.toLowerCase().includes(term) ||
      (agent.telefono || agent.phone || '').includes(term) ||
      (agent.position || '').toLowerCase().includes(term) ||
      (agent.agencyName || '').toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching agents:', error);
    return [];
  }
};

// Get agent statistics
export const getAgentStats = async (): Promise<AgentStats> => {
  try {
    const response = await apiClient.get('/api/agents/stats');
    return response.data;
  } catch (error) {
    console.warn('Error al obtener estadísticas, calculando desde agentes:', error);
    try {
      const agents = await getAllAgents();
      return calculateStatsFromAgents(agents);
    } catch (fallbackError) {
      console.error('Error en fallback de estadísticas:', fallbackError);
      return { 
        total: 0, 
        active: 0, 
        inactive: 0, 
        withAgency: 0, 
        withoutAgency: 0,
        canLogin: 0,
        locked: 0
      };
    }
  }
};

// Función auxiliar para calcular estadísticas desde la lista de agentes
const calculateStatsFromAgents = (agents: Agent[]): AgentStats => {
  const total = agents.length;
  const active = agents.filter(agent => agent.active).length;
  const inactive = total - active;
  const withAgency = agents.filter(agent => agent.agencyId).length;
  const withoutAgency = total - withAgency;

  return {
    total,
    active,
    inactive,
    withAgency,
    withoutAgency,
    canLogin: active, // Asumimos que los activos pueden hacer login
    locked: 0 // Temporalmente 0
  };
};

// Get agents by agency
export const getAgentsByAgency = async (agencyId: string): Promise<Agent[]> => {
  try {
    const agents = await getAllAgents();
    return agents.filter(agent => agent.agencyId === agencyId);
  } catch (error) {
    console.error('Error getting agents by agency:', error);
    return [];
  }
};

// Get all agencies for dropdown
export const getAllAgencies = async (): Promise<Array<{id: string, name: string, active: boolean}>> => {
  try {
    const response = await apiClient.get('/api/agencies');
    const agencies = response.data;
    return agencies.map((agency: any) => ({
      id: agency.id.toString(),
      name: agency.name,
      active: agency.active,
    }));
  } catch (error) {
    console.error('Error getting agencies:', error);
    return [];
  }
};

// Update agent agency names when agency is updated
export const updateAgentAgencyNames = async (agencyId: string, agencyName: string): Promise<void> => {
  try {
    const agents = await getAllAgents();
    const agentsToUpdate = agents.filter(agent => agent.agencyId === agencyId);
    
    for (const agent of agentsToUpdate) {
      await updateAgent(agent.id, { agencyName });
    }
  } catch (error) {
    console.error('Error updating agent agency names:', error);
  }
};

// Remove agency from agents when agency is deleted
export const removeAgencyFromAgents = async (agencyId: string): Promise<void> => {
  try {
    const agents = await getAllAgents();
    const agentsToUpdate = agents.filter(agent => agent.agencyId === agencyId);
    
    for (const agent of agentsToUpdate) {
      await updateAgent(agent.id, { agencyId: undefined, agencyName: undefined });
    }
  } catch (error) {
    console.error('Error removing agency from agents:', error);
  }
};

// Get active agents only
export const getActiveAgents = async (): Promise<Agent[]> => {
  try {
    const agents = await getAllAgents();
    return agents.filter(agent => agent.active);
  } catch (error) {
    console.error('Error getting active agents:', error);
    return [];
  }
};



 