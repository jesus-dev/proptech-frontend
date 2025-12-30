/**
 * Servicio para Agentes
 * Usa apiClient que YA TIENE reintentos automáticos
 */

import { apiClient } from '@/lib/api';

export interface Agent {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  phone?: string;
  license?: string;
  position?: string;
  bio?: string;
  photo?: string;
  agencyId?: string;
  agencyName?: string;
  slug?: string;
  zonaOperacion?: string;
  active?: boolean;
  isActive?: boolean;
  role?: string;
  propertiesCount?: number;
}

export class AgentService {
  /**
   * Obtener todos los agentes - usa endpoint público o privado según token
   */
  static async getAllAgents(): Promise<Agent[]> {
    try {
      const token = localStorage.getItem('token');
      const isValidToken = token && token !== 'undefined' && token !== 'null';

      // Siempre usar endpoint público para PropShots (no requiere autenticación)
      const endpoint = `/api/public/agents`;
      
      console.log('🔍 Cargando agentes desde:', endpoint);
      const response = await apiClient.get(endpoint);
      const agents = response.data || [];
      console.log('📥 Respuesta del backend:', agents.length, 'agentes');
      console.log('📥 Primer agente (raw):', agents[0]);
      
      if (agents.length === 0) {
        console.warn('⚠️ No se encontraron agentes en la respuesta');
        return [];
      }
      
      // El backend retorna campos en inglés (firstName, lastName, phone, photo, license)
      const normalizedAgents = agents.map((agent: any): Agent => {
        const normalized: Agent = {
          ...agent,
          id: String(agent.id),
          // Usar directamente los campos en inglés del backend
          firstName: agent.firstName || '',
          lastName: agent.lastName || '',
          phone: agent.phone || '',
          photo: agent.photo || undefined,
          active: agent.active ?? agent.isActive ?? true,
          isActive: agent.isActive ?? agent.active ?? true,
          license: agent.license || undefined,
          email: agent.email || ''
        };
        
        console.log(`🔍 Agente normalizado ID ${normalized.id}:`, {
          firstName: normalized.firstName,
          lastName: normalized.lastName,
          hasFirstName: !!normalized.firstName,
          hasLastName: !!normalized.lastName
        });
        
        return normalized;
      }).filter((agent: Agent) => {
        // Filtrar solo agentes que tengan al menos nombre o apellido
        const hasName = (agent.firstName && agent.firstName.trim()) || (agent.lastName && agent.lastName.trim());
        if (!hasName) {
          console.warn(`⚠️ Agente ${agent.id} filtrado: sin nombre/apellido`, agent);
        }
        return hasName;
      });
      
      console.log(`✅ ${normalizedAgents.length} agentes normalizados y filtrados (de ${agents.length} totales)`);
      return normalizedAgents;
    } catch (error: any) {
      console.error('❌ Error cargando agentes:', error);
      console.error('❌ Error response:', error?.response?.data || error?.message);
      // Intentar con endpoint privado si el público falla
      try {
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined' && token !== 'null') {
          console.log('🔄 Intentando con endpoint privado...');
          const response = await apiClient.get('/api/agents');
          const agents = response.data || [];
          return agents.map((agent: any): Agent => ({
            ...agent,
            id: String(agent.id),
            firstName: agent.firstName || agent.nombre || '',
            lastName: agent.lastName || agent.apellido || '',
          })).filter((agent: Agent) => agent.firstName || agent.lastName);
        }
      } catch (fallbackError) {
        console.error('❌ Error también en endpoint privado:', fallbackError);
      }
      return [];
    }
  }

  /**
   * Obtener agente por ID
   */
  static async getAgentById(id: string): Promise<Agent | null> {
    try {
      const token = localStorage.getItem('token');
      const isValidToken = token && token !== 'undefined' && token !== 'null';

      const endpoint = isValidToken
        ? `/api/agents/${id}`
        : `/api/public/agents/${id}`;

      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent:', error);
      return null;
    }
  }

  /**
   * Crear agente
   */
  static async createAgent(agent: Partial<Agent>): Promise<Agent | null> {
    try {
      const response = await apiClient.post('/api/agents', agent);
      return response.data;
    } catch (error) {
      console.error('Error creating agent:', error);
      return null;
    }
  }

  /**
   * Actualizar agente
   */
  static async updateAgent(id: string, agent: Partial<Agent>): Promise<Agent | null> {
    try {
      const response = await apiClient.put(`/api/agents/${id}`, agent);
      return response.data;
    } catch (error) {
      console.error('Error updating agent:', error);
      return null;
    }
  }

  /**
   * Eliminar agente
   */
  static async deleteAgent(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/agents/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting agent:', error);
      return false;
    }
  }

  /**
   * Buscar agentes por término
   */
  static async searchAgents(term: string): Promise<Agent[]> {
    try {
      const token = localStorage.getItem('token');
      const isValidToken = token && token !== 'undefined' && token !== 'null';

      const endpoint = isValidToken
        ? `/api/agents/search?term=${encodeURIComponent(term)}`
        : `/api/public/agents/search?term=${encodeURIComponent(term)}`;

      const response = await apiClient.get(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Error searching agents:', error);
      return [];
    }
  }
}

export const agentService = new AgentService();
