import { getEndpoint } from '@/lib/api-config';

export interface Partner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentNumber?: string;
  documentType?: string;
  type?: string;
  status?: string;
  companyName?: string;
  companyRegistration?: string;
  position?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
    website?: string;
    socialMedia?: string[];
    partnershipDate?: string;
    contractStartDate?: string;
    contractEndDate?: string;
  nextPaymentDate?: string;
  totalEarnings?: number;
  pendingEarnings?: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  assignedAgentId?: number;
  agentId?: number;
  assignedAgencyId?: number;
  notes?: string;
  specializations?: string[];
  territories?: string[];
  languages?: string[];
  certifications?: string[];
  experienceYears?: number;
  propertiesManaged?: number;
  successfulDeals?: number;
  averageRating?: number;
  totalReviews?: number;
  isVerified?: boolean;
  verificationDate?: string;
  createdAt?: string;
  updatedAt?: string;
  photo?: string;
  slug?: string;
}

export interface PaginatedPartnersResponse {
  content: Partner[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

class PartnerApiService {
  async getAllPartners(params?: {
    page?: number;
    size?: number;
    search?: string;
    type?: string;
    status?: string;
    agentId?: number;
    agencyId?: number;
  }): Promise<PaginatedPartnersResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.size) searchParams.append('size', params.size.toString());
      if (params?.search) searchParams.append('search', params.search);
      if (params?.type) searchParams.append('type', params.type);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.agentId) searchParams.append('agentId', params.agentId.toString());
      if (params?.agencyId) searchParams.append('agencyId', params.agencyId.toString());

      const url = getEndpoint(`/api/partners?${searchParams.toString()}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Si el backend devuelve un array simple, convertirlo al formato paginado
      if (Array.isArray(data)) {
        const result = {
          content: data,
          totalElements: data.length,
          totalPages: 1,
          currentPage: 1,
          size: data.length
        };
        return result;
      }
      
      // Si ya es un objeto paginado, devolverlo tal como está
      return data;
    } catch (error) {
      console.error('❌ Error fetching partners:', error);
      throw new Error(`Error al cargar los socios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getPartnerById(id: number): Promise<Partner> {
    try {
      const response = await fetch(getEndpoint(`/api/partners/${id}`));
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Socio no encontrado');
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching partner:', error);
      throw new Error(`Error al cargar el socio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async createPartner(partner: Omit<Partner, 'id'>): Promise<Partner> {
    try {
      const response = await fetch(getEndpoint('/api/partners'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partner),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating partner:', error);
      throw new Error(`Error al crear el socio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async updatePartner(id: number, partner: Partial<Partner>): Promise<Partner> {
    try {
      const response = await fetch(getEndpoint(`/api/partners/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partner),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating partner:', error);
      throw new Error(`Error al actualizar el socio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async deletePartner(id: number): Promise<boolean> {
    try {
      const response = await fetch(getEndpoint(`/api/partners/${id}`), {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting partner:', error);
      throw new Error(`Error al eliminar el socio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async searchPartners(query: string): Promise<Partner[]> {
    try {
      // Obtener todos los partners y filtrar por búsqueda en el cliente
      const response = await fetch(getEndpoint('/api/partners'));
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const allPartners = await response.json();
      const searchTerm = query.toLowerCase();
      return allPartners.filter((partner: Partner) => 
        partner.firstName?.toLowerCase().includes(searchTerm) ||
        partner.lastName?.toLowerCase().includes(searchTerm) ||
        partner.email?.toLowerCase().includes(searchTerm) ||
        partner.companyName?.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching partners:', error);
      throw new Error(`Error al buscar socios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getPartnersByType(type: string): Promise<Partner[]> {
    try {
      // Obtener todos los partners y filtrar por tipo en el cliente
      const response = await fetch(getEndpoint('/api/partners'));
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const allPartners = await response.json();
      return allPartners.filter((partner: Partner) => partner.type === type);
    } catch (error) {
      console.error('Error fetching partners by type:', error);
      throw new Error(`Error al cargar socios por tipo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getPartnersByStatus(status: string): Promise<Partner[]> {
    try {
      // Obtener todos los partners y filtrar por estado en el cliente
      const response = await fetch(getEndpoint('/api/partners'));
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const allPartners = await response.json();
      return allPartners.filter((partner: Partner) => partner.status === status);
    } catch (error) {
      console.error('Error fetching partners by status:', error);
      throw new Error(`Error al cargar socios por estado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getActivePartners(): Promise<Partner[]> {
    try {
      // Obtener todos los partners y filtrar los activos en el cliente
      const response = await fetch(getEndpoint('/api/partners'));
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const allPartners = await response.json();
      return allPartners.filter((partner: Partner) => partner.status === 'ACTIVE' || !partner.status);
    } catch (error) {
      console.error('Error fetching active partners:', error);
      throw new Error(`Error al cargar socios activos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getDebtorPartners(params?: { month?: string; category?: 'SOCIAL_DUES' | 'PROPTECH' }): Promise<Partner[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.month) searchParams.append('month', params.month);
      if (params?.category) searchParams.append('category', params.category);
      const url = getEndpoint(`/api/partners/debtors?${searchParams.toString()}`);
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`No se pudieron obtener morosos (status ${response.status})`);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching debtor partners:', error);
      return [];
    }
  }

  async getPartnersWithPendingPayments(): Promise<Partner[]> {
    try {
      // Obtener todos los partners y filtrar los que tienen pagos pendientes
      const response = await fetch(getEndpoint('/api/partners'));
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const allPartners = await response.json();
      return allPartners.filter((partner: Partner) => (partner.pendingEarnings || 0) > 0);
    } catch (error) {
      console.error('Error fetching partners with pending payments:', error);
      throw new Error(`Error al cargar socios con pagos pendientes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getVerifiedPartners(): Promise<Partner[]> {
    try {
      // Obtener todos los partners y filtrar los verificados
      const response = await fetch(getEndpoint('/api/partners'));
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const allPartners = await response.json();
      return allPartners.filter((partner: Partner) => partner.isVerified === true);
    } catch (error) {
      console.error('Error fetching verified partners:', error);
      throw new Error(`Error al cargar socios verificados: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getTopPerformers(limit: number = 10): Promise<Partner[]> {
    try {
      // Obtener todos los partners y ordenarlos por ganancias totales
      const response = await fetch(getEndpoint('/api/partners'));
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const allPartners = await response.json();
      
      // Filtrar solo socios activos y ordenar por ganancias totales
      const topPerformers = allPartners
        .filter((partner: Partner) => partner.status === 'ACTIVE')
        .sort((a: Partner, b: Partner) => {
          const earningsA = a.totalEarnings || 0;
          const earningsB = b.totalEarnings || 0;
          return earningsB - earningsA; // Orden descendente
        })
        .slice(0, limit);
      
      return topPerformers;
    } catch (error) {
      console.error('Error fetching top performers:', error);
      throw new Error(`Error al cargar mejores socios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async uploadPartnerPhoto(id: number, file: File, oldPhotoUrl?: string): Promise<{ fileUrl: string; success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      if (oldPhotoUrl) {
        formData.append('oldPhotoUrl', oldPhotoUrl);
      }

      const response = await fetch(getEndpoint(`/api/partners/${id}/upload-photo`), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error del servidor: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading partner photo:', error);
      throw new Error(`Error al subir la foto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async deletePartnerPhoto(id: number, photoUrl?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(getEndpoint(`/api/partners/${id}/delete-photo`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error del servidor: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting partner photo:', error);
      throw new Error(`Error al eliminar la foto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Métodos comentados porque los endpoints no existen en el backend
  /*
  async updateEarnings(id: number, amount: number): Promise<Partner> {
    try {
      const response = await fetch(getEndpoint(`/api/partners/${id}/earnings?amount=${amount}`), {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating earnings:', error);
      throw new Error(`Error al actualizar ganancias: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async processPayment(id: number, amount: number): Promise<Partner> {
    try {
      const response = await fetch(getEndpoint(`/api/partners/${id}/payment?amount=${amount}`), {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new Error(`Error al procesar el pago: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await fetch(getEndpoint(`/api/partners/check-email?email=${encodeURIComponent(email)}`));
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const result = await response.json();
      return result.exists;
    } catch (error) {
      console.error('Error checking email:', error);
      throw new Error(`Error al verificar email: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async checkDocumentExists(documentNumber: string): Promise<boolean> {
    try {
      const response = await fetch(getEndpoint(`/api/partners/check-email?documentNumber=${encodeURIComponent(documentNumber)}`));
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const result = await response.json();
      return result.exists;
    } catch (error) {
      console.error('Error checking document:', error);
      throw new Error(`Error al verificar documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
  */
}

// Export singleton instance
export const partnerService = new PartnerApiService(); 