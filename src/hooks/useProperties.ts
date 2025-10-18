import { useState, useEffect, useCallback } from 'react';
import { useUserApi } from './useUserApi';
import { propertyService, PropertyResponse } from '@/services/propertyService';
import { PropertyFilters } from '@/types/property';

export const useProperties = (filters?: PropertyFilters) => {
  const { canViewAll, isAgent, isAgencyAdmin, agentId, agencyId, fetchWithUserContext } = useUserApi();
  const [properties, setProperties] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = useCallback(async (customFilters?: PropertyFilters) => {
    try {
      setLoading(true);
      setError(null);

      // Build filters based on user context
      const userFilters: PropertyFilters = {
        ...filters,
        ...customFilters,
      };

      // Add user-specific filters
      if (!canViewAll) {
        if (isAgencyAdmin && agencyId) {
          userFilters.agencyId = String(agencyId);
        } else if (isAgent && agencyId) {
          // Agent can see all properties from their agency
          userFilters.agencyId = String(agencyId);
        } else if (isAgent && agentId && !agencyId) {
          // Agent without agency can only see their own properties
          userFilters.agentId = String(agentId);
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
      const endpoint = `/api/properties${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetchWithUserContext(endpoint, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Error fetching properties: ${response.status}`);
      }

      const data = await response.json();
      setProperties(data);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError(err instanceof Error ? err.message : 'Error loading properties');
    } finally {
      setLoading(false);
    }
  }, [canViewAll, isAgent, isAgencyAdmin, agentId, agencyId, fetchWithUserContext, filters]);

  const refresh = useCallback(() => {
    loadProperties();
  }, [loadProperties]);

  const loadWithFilters = useCallback((newFilters: PropertyFilters) => {
    loadProperties(newFilters);
  }, [loadProperties]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  return {
    properties,
    loading,
    error,
    refresh,
    loadWithFilters,
    canViewAll,
    isAgent,
    isAgencyAdmin,
  };
};
