import { useAuthContext } from '@/context/AuthContext';
import { getEndpoint } from '@/lib/api-config';

export const useUserApi = () => {
  const { user, getUserContext, getFilterParams } = useAuthContext();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  const getFilteredEndpoint = (baseEndpoint: string) => {
    const filterParams = getFilterParams();
    
    // If user has no access, return a restricted endpoint
    if (filterParams.access === 'denied') {
      return getEndpoint('/api/restricted');
    }

    // Build query string from filter parameters
    const queryParams = new URLSearchParams();
    Object.entries(filterParams).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const separator = baseEndpoint.includes('?') ? '&' : '?';
    
    return queryString 
      ? `${getEndpoint(baseEndpoint)}${separator}${queryString}`
      : getEndpoint(baseEndpoint);
  };

  const fetchWithUserContext = async (endpoint: string, options: RequestInit = {}) => {
    const url = getFilteredEndpoint(endpoint);
    const headers = {
      ...getAuthHeaders(),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  const getApiUrl = (endpoint: string) => {
    return getFilteredEndpoint(endpoint);
  };

  const context = getUserContext();

  return {
    user,
    canViewAll: context.canViewAll,
    isAdmin: context.isAdmin,
    isAgent: context.isAgent,
    isAgencyAdmin: context.isAgencyAdmin,
    agentId: context.agentId,
    agencyId: context.agencyId,
    getAuthHeaders,
    getFilteredEndpoint,
    fetchWithUserContext,
    getApiUrl,
  };
};
