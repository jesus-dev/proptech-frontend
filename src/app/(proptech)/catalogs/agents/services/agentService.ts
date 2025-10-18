import { Agent, AgentFormData, AgentStats } from '../types';
import { getEndpoint } from '@/lib/api-config';

// Get all agents
export const getAllAgents = async (): Promise<Agent[]> => {
  const res = await fetch(getEndpoint('/api/agents'));
  if (!res.ok) throw new Error('Error al obtener agentes');
  return res.json();
};

// Get agent by ID
export const getAgentById = async (id: string): Promise<Agent | null> => {
  const res = await fetch(getEndpoint(`/api/agents/${id}`));
  if (!res.ok) return null;
  return res.json();
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
  const res = await fetch(getEndpoint('/api/agents'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al crear agente');
  }
  return res.json();
};

// Update agent
export const updateAgent = async (id: string, data: Partial<AgentFormData>): Promise<Agent> => {
  const res = await fetch(getEndpoint(`/api/agents/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al actualizar agente');
  }
  return res.json();
};

// Delete agent
export const deleteAgent = async (id: string): Promise<boolean> => {
  const res = await fetch(getEndpoint(`/api/agents/${id}`), { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar agente');
  return true;
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
    const res = await fetch(getEndpoint('/api/agents/stats'));
    if (!res.ok) {
      console.warn('Endpoint de estadísticas no disponible, calculando desde agentes existentes');
      // Intentar calcular estadísticas desde la lista de agentes
      const agents = await getAllAgents();
      return calculateStatsFromAgents(agents);
    }
    return res.json();
  } catch (error) {
    console.warn('Error al obtener estadísticas, calculando desde agentes:', error);
    try {
      // Fallback: calcular desde agentes
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
    const res = await fetch(getEndpoint('/api/agencies'));
    if (!res.ok) throw new Error('Error al obtener agencias');
    const agencies = await res.json();
    return agencies.map((agency: unknown) => {
      if (
        typeof agency === 'object' &&
        agency !== null &&
        'id' in agency &&
        'name' in agency &&
        'active' in agency
      ) {
        return {
          id: (agency as any).id.toString(),
          name: (agency as any).name,
          active: (agency as any).active,
        };
      }
      return { id: '', name: '', active: false };
    });
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



 