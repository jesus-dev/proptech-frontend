// Servicio para manejar operaciones de leads/negocios
export interface Lead {
  id: string;
  status: string;
  // Agregar más propiedades según sea necesario
}

export interface LeadUpdateData {
  status?: string;
  // Agregar más propiedades según sea necesario
}

class LeadApiService {
  // Helper function to clean up malformed API URLs
  private resolveApiUrl(): string {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Clean up malformed URLs that might have double concatenation
    if (apiUrl.includes('https://proptech.com.py/https/api.proptech.com.py')) {
      apiUrl = 'https://api.proptech.com.py';
    } else if (apiUrl.includes('http://proptech.com.py/http/api.proptech.com.py')) {
      apiUrl = 'http://api.proptech.com.py';
    }
    
    return apiUrl;
  }

  private baseUrl = this.resolveApiUrl();

  async updateLead(leadId: string, data: LeadUpdateData): Promise<Lead | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error updating lead: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating lead:', error);
      // Retornar null en caso de error para no romper el flujo
      return null;
    }
  }

  async getLead(leadId: string): Promise<Lead | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/leads/${leadId}`);

      if (!response.ok) {
        throw new Error(`Error fetching lead: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching lead:', error);
      return null;
    }
  }

  async getAllLeads(): Promise<Lead[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/leads`);

      if (!response.ok) {
        throw new Error(`Error fetching leads: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
  }
}

export const leadApiService = new LeadApiService(); 