import { config } from '@/config/environment';

const API_BASE_URL = config.API_BASE_URL;

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  license?: string;
  position?: string;
  bio?: string;
  photo?: string;
  agencyId?: string;
  agencyName?: string;
  active: boolean;
  isActive: boolean;
  role?: string;
}

export class AgentService {
  // Obtener todos los agentes SIEMPRE desde BD (sin cache)
  static async getAllAgents(): Promise<Agent[]> {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Usar endpoint público si no hay token, privado si hay token
      const endpoint = token ? `${API_BASE_URL}/api/agents` : `${API_BASE_URL}/api/public/agents`;

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(10000) // 10 segundos timeout
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 500) {
          console.warn('⚠️ Error obteniendo agentes, devolviendo lista vacía');
          return [];
        }
        throw new Error(`Error al obtener agentes: ${response.status}`);
      }

      const agents = await response.json();
      console.log(`✅ Obtenidos ${agents.length} agentes desde ${token ? 'endpoint privado' : 'endpoint público'}`);
      
      return agents;
    } catch (error) {
      console.error('Error fetching agents:', error);
      // Devolver array vacío en lugar de fallar
      return [];
    }
  }

  // Obtener un agente por ID
  static async getAgentById(id: string): Promise<Agent | null> {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Usar endpoint público si no hay token, privado si hay token
      const endpoint = token ? `${API_BASE_URL}/api/agents/${id}` : `${API_BASE_URL}/api/public/agents/${id}`;

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 500) {
          return null;
        }
        throw new Error(`Error al obtener agente: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching agent ${id}:`, error);
      return null;
    }
  }
}

