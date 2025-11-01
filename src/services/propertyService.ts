import { apiClient } from '@/lib/api';
import { Property, PropertyFilters, PropertyFormData } from '@/types/property';

export interface PropertyResponse {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PropertyService {
  getProperties: (filters?: PropertyFilters) => Promise<PropertyResponse>;
  getPropertyById: (id: string) => Promise<Property>;
  createProperty: (property: PropertyFormData) => Promise<Property>;
  updateProperty: (id: string, property: PropertyFormData) => Promise<Property>;
  deleteProperty: (id: string) => Promise<void>;
  getPropertiesByAgent: (agentId: string, filters?: PropertyFilters) => Promise<PropertyResponse>;
  getPropertiesByAgency: (agencyId: string, filters?: PropertyFilters) => Promise<PropertyResponse>;
}

class PropertyServiceImpl implements PropertyService {
  private buildQueryString(filters?: PropertyFilters): string {
    if (!filters) return '';

    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  async getProperties(filters?: PropertyFilters): Promise<PropertyResponse> {
    try {
      const queryString = this.buildQueryString(filters);
      const response = await apiClient.get(`/api/properties${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      return {
        properties: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };
    }
  }

  async getPropertyById(id: string): Promise<Property> {
    try {
      const response = await apiClient.get(`/api/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  }

  async createProperty(property: PropertyFormData): Promise<Property> {
    try {
      const response = await apiClient.post('/api/properties', property);
      return response.data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  async updateProperty(id: string, property: PropertyFormData): Promise<Property> {
    try {
      const response = await apiClient.put(`/api/properties/${id}`, property);
      return response.data;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  async deleteProperty(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/properties/${id}`);
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  async getPropertiesByAgent(agentId: string, filters?: PropertyFilters): Promise<PropertyResponse> {
    try {
      const queryString = this.buildQueryString(filters);
      const response = await apiClient.get(`/api/properties/agent/${agentId}${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching properties by agent:', error);
      return {
        properties: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };
    }
  }

  async getPropertiesByAgency(agencyId: string, filters?: PropertyFilters): Promise<PropertyResponse> {
    try {
      const queryString = this.buildQueryString(filters);
      const response = await apiClient.get(`/api/properties/agency/${agencyId}${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching properties by agency:', error);
      return {
        properties: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };
    }
  }
}

export const propertyService = new PropertyServiceImpl();
