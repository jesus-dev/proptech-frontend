import { getEndpoint } from '@/lib/api-config';

export interface Agency {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  active?: boolean;
}

class AgencyService {
  private baseUrl = getEndpoint('/api/agencies');

  async getAllAgencies(): Promise<Agency[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching agencies:', error);
      throw error;
    }
  }

  async getAgencyById(id: number): Promise<Agency> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching agency:', error);
      throw error;
    }
  }

  async getActiveAgencies(): Promise<Agency[]> {
    try {
      const response = await fetch(`${this.baseUrl}/active`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching active agencies:', error);
      throw error;
    }
  }
}

export const agencyService = new AgencyService(); 