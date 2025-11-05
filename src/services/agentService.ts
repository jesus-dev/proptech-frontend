/**
 * Servicio Premium para Agentes
 * - Maneja tokens expirados automáticamente
 * - Fallback entre endpoints públicos y privados
 * - Timeouts y reintentos
 * - NUNCA rompe la app
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.proptech.com.py';
const TIMEOUT = 15000; // 15 segundos
const MAX_RETRIES = 5; // 5 reintentos para manejar intermitencias del túnel

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

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = TIMEOUT, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      // Si es 500/502/503, reintentar
      if ((response.status === 500 || response.status === 502 || response.status === 503) && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
        continue;
      }
      
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Última oportunidad - lanzar error
      if (attempt === retries) {
        if (error.name === 'AbortError') {
          throw new Error('TIMEOUT');
        }
        throw error;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  
  throw new Error('Max retries reached');
}

export class AgentService {
  /**
   * Obtener todos los agentes - Inteligente: usa endpoint público o privado según token
   */
  static async getAllAgents(): Promise<Agent[]> {
    try {
      const token = localStorage.getItem('token');
      const isValidToken = token && token !== 'undefined' && token !== 'null';

      // Decidir endpoint según token
      const endpoint = isValidToken 
        ? `${API_URL}/api/agents`
        : `${API_URL}/api/public/agents`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetchWithTimeout(endpoint, { 
        method: 'GET',
        headers 
      });

      if (response.ok) {
        const agents = await response.json();
        console.log(`✅ ${agents.length} agentes desde ${isValidToken ? 'privado' : 'público'}`);
        return agents;
      }

      // Si endpoint privado falla, intentar público como fallback
      if (isValidToken && (response.status === 401 || response.status === 500)) {
        console.log('⚠️ Token inválido, intentando endpoint público...');
        
        // Limpiar token inválido
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        const publicResponse = await fetchWithTimeout(`${API_URL}/api/public/agents`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (publicResponse.ok) {
          return await publicResponse.json();
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching agents:', error);
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
        ? `${API_URL}/api/agents/${id}`
        : `${API_URL}/api/public/agents/${id}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetchWithTimeout(endpoint, { 
        method: 'GET',
        headers 
      });

      if (response.ok) {
        return await response.json();
      }

      // Fallback a público si privado falla
      if (isValidToken && response.status === 401) {
        const publicResponse = await fetchWithTimeout(`${API_URL}/api/public/agents/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (publicResponse.ok) {
          return await publicResponse.json();
        }
      }

      return null;
    } catch (error) {
      console.error(`Error fetching agent ${id}:`, error);
      return null;
    }
  }
}

