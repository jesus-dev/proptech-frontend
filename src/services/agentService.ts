/**
 * Servicio para Agentes
 * Usa apiClient que YA TIENE reintentos automáticos
 */

import { apiClient } from '@/lib/api';

export interface Agent {
  id: string;
  firstName?: string;
  lastName?: string;
  nombre?: string; // Campo del backend en español
  apellido?: string; // Campo del backend en español
  email: string;
  phone?: string;
  telefono?: string; // Campo del backend en español
  license?: string;
  licenciaInmobiliaria?: string; // Campo del backend en español
  position?: string;
  bio?: string;
  photo?: string;
  fotoPerfilUrl?: string; // Campo del backend en español
  agencyId?: string;
  agencyName?: string;
  active?: boolean;
  isActive?: boolean;
  role?: string;
}

export class AgentService {
  /**
   * Obtener todos los agentes - usa endpoint público o privado según token
   */
  static async getAllAgents(): Promise<Agent[]> {
    try {
      const token = localStorage.getItem('token');
      const isValidToken = token && token !== 'undefined' && token !== 'null';

      // Decidir endpoint según token
      const endpoint = isValidToken 
        ? `/api/agents`
        : `/api/public/agents`;

      const response = await apiClient.get(endpoint);
      const agents = response.data || [];
      console.log('📥 Respuesta del backend:', agents.length, 'agentes');
      console.log('📥 Primer agente (raw):', agents[0]);
      
      // Normalizar campos: convertir campos en español a inglés para compatibilidad
      const normalizedAgents = agents.map((agent: any) => {
        const normalized = {
          ...agent,
          id: String(agent.id),
          firstName: agent.firstName || agent.nombre || '',
          lastName: agent.lastName || agent.apellido || '',
          phone: agent.phone || agent.telefono || '',
          photo: agent.photo || agent.fotoPerfilUrl || undefined,
          active: agent.active ?? agent.isActive ?? false,
          isActive: agent.isActive ?? agent.active ?? false,
          license: agent.license || agent.licenciaInmobiliaria || undefined
        };
        console.log(`🔍 Agente ${normalized.id} normalizado:`, {
          firstName: normalized.firstName,
          lastName: normalized.lastName,
          active: normalized.active,
          isActive: normalized.isActive
        });
        return normalized;
      });
      
      console.log(`✅ ${normalizedAgents.length} agentes normalizados`);
      return normalizedAgents;
    } catch (error) {
      console.warn('Error cargando agentes, mostrando vacío');
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
