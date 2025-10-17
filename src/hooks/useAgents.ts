import { useState, useEffect, useCallback } from 'react';
import { useUserApi } from './useUserApi';
import { salesAgentService, SalesAgent } from '@/services/salesAgentService';

export interface SalesAgentFilters {
  page?: number;
  limit?: number;
  search?: string;
  agencyId?: string;
  agentId?: string;
  isActive?: boolean;
  experience?: number;
  minExperience?: number;
  maxExperience?: number;
  propertiesCount?: number;
  minPropertiesCount?: number;
  maxPropertiesCount?: number;
  sortBy?: 'name' | 'experience' | 'propertiesCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AgentsResponse {
  agents: SalesAgent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useAgents = (filters?: SalesAgentFilters) => {
  const { canViewAll, isAgent, isAgencyAdmin, agentId, agencyId, fetchWithUserContext } = useUserApi();
  const [agents, setAgents] = useState<AgentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAgents = useCallback(async (customFilters?: SalesAgentFilters) => {
    try {
      setLoading(true);
      setError(null);

      // Build filters based on user context
      const userFilters: SalesAgentFilters = {
        ...filters,
        ...customFilters,
      };

      // Add user-specific filters
      if (!canViewAll) {
        if (isAgencyAdmin && agencyId) {
          // Agency admin can see all agents in their agency
          userFilters.agencyId = agencyId;
        } else if (isAgent) {
          // Agent can only see themselves
          userFilters.agentId = agentId || undefined;
        }
      }

      // Use the filtered endpoint
      const queryParams = new URLSearchParams();
      Object.entries(userFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => queryParams.append(key, item.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const queryString = queryParams.toString();
      const endpoint = `/api/sales-agents${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetchWithUserContext(endpoint, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Error fetching agents: ${response.status}`);
      }

      const data = await response.json();
      setAgents(data);
    } catch (err) {
      console.error('Error loading agents:', err);
      setError(err instanceof Error ? err.message : 'Error loading agents');
    } finally {
      setLoading(false);
    }
  }, [canViewAll, isAgent, isAgencyAdmin, agentId, agencyId, fetchWithUserContext, filters]);

  const refresh = useCallback(() => {
    loadAgents();
  }, [loadAgents]);

  const loadWithFilters = useCallback((newFilters: SalesAgentFilters) => {
    loadAgents(newFilters);
  }, [loadAgents]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  return {
    agents,
    loading,
    error,
    refresh,
    loadWithFilters,
    canViewAll,
    isAgent,
    isAgencyAdmin,
  };
};
