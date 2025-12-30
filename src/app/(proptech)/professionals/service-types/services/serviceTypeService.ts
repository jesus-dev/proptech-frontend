import { getEndpoint } from '@/lib/api-config';

export interface ServiceType {
  id: number;
  code: string;
  name: string;
  icon?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const serviceTypeService = {
  async getAllServiceTypes(): Promise<ServiceType[]> {
    try {
      const response = await fetch(getEndpoint('/api/service-types'));
      if (!response.ok) {
        throw new Error('Error al obtener tipos de servicio');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching service types:', error);
      return [];
    }
  },

  async getActiveServiceTypes(): Promise<ServiceType[]> {
    try {
      const response = await fetch(getEndpoint('/api/service-types/active'));
      if (!response.ok) {
        throw new Error('Error al obtener tipos de servicio activos');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching active service types:', error);
      return [];
    }
  },

  async getServiceTypeById(id: number): Promise<ServiceType | null> {
    try {
      const response = await fetch(getEndpoint(`/api/service-types/${id}`));
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Error al obtener el tipo de servicio');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching service type:', error);
      throw error;
    }
  },

  async createServiceType(data: Partial<ServiceType>): Promise<ServiceType> {
    try {
      const response = await fetch(getEndpoint('/api/service-types'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating service type:', error);
      throw error;
    }
  },

  async updateServiceType(id: number, data: Partial<ServiceType>): Promise<ServiceType> {
    try {
      const response = await fetch(getEndpoint(`/api/service-types/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating service type:', error);
      throw error;
    }
  },

  async deleteServiceType(id: number): Promise<void> {
    try {
      const response = await fetch(getEndpoint(`/api/service-types/${id}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el tipo de servicio');
      }
    } catch (error) {
      console.error('Error deleting service type:', error);
      throw error;
    }
  },
};

