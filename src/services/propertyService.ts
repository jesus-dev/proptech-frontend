import { getEndpoint } from '@/lib/api-config';
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
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

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
    const queryString = this.buildQueryString(filters);
    const response = await fetch(
      `${getEndpoint('/api/properties')}${queryString}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching properties: ${response.status}`);
    }

    return response.json();
  }

  async getPropertyById(id: string): Promise<Property> {
    const response = await fetch(`${getEndpoint('/api/properties')}/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error fetching property: ${response.status}`);
    }

    return response.json();
  }

  async createProperty(property: PropertyFormData): Promise<Property> {
    const response = await fetch(getEndpoint('/api/properties'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(property),
    });

    if (!response.ok) {
      throw new Error(`Error creating property: ${response.status}`);
    }

    return response.json();
  }

  async updateProperty(id: string, property: PropertyFormData): Promise<Property> {
    const response = await fetch(`${getEndpoint('/api/properties')}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(property),
    });

    if (!response.ok) {
      throw new Error(`Error updating property: ${response.status}`);
    }

    return response.json();
  }

  async deleteProperty(id: string): Promise<void> {
    const response = await fetch(`${getEndpoint('/api/properties')}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error deleting property: ${response.status}`);
    }
  }

  async getPropertiesByAgent(agentId: string, filters?: PropertyFilters): Promise<PropertyResponse> {
    const queryString = this.buildQueryString(filters);
    const response = await fetch(
      `${getEndpoint('/api/properties')}/agent/${agentId}${queryString}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching properties by agent: ${response.status}`);
    }

    return response.json();
  }

  async getPropertiesByAgency(agencyId: string, filters?: PropertyFilters): Promise<PropertyResponse> {
    const queryString = this.buildQueryString(filters);
    const response = await fetch(
      `${getEndpoint('/api/properties')}/agency/${agencyId}${queryString}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching properties by agency: ${response.status}`);
    }

    return response.json();
  }
}

export const propertyService = new PropertyServiceImpl();
