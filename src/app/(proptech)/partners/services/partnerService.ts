import { apiClient } from '@/lib/api';

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

      const response = await apiClient.get(`/api/partners?${searchParams.toString()}`);
      const data = response.data;
      const page = params?.page ?? 1;
      const size = params?.size ?? 20;
      
      // Si el backend devuelve un array simple, aplicar filtros/paginación en el cliente
      if (Array.isArray(data)) {
        let list: Partner[] = data;

        // Filtro por búsqueda (nombre, email, documento, empresa, notas)
        if (params?.search && params.search.trim() !== '') {
          const q = params.search.toLowerCase().trim();
          list = list.filter((p) => {
            return (
              (p.firstName && p.firstName.toLowerCase().includes(q)) ||
              (p.lastName && p.lastName.toLowerCase().includes(q)) ||
              (p.email && p.email.toLowerCase().includes(q)) ||
              (p.companyName && p.companyName.toLowerCase().includes(q)) ||
              (p.documentNumber && p.documentNumber.toLowerCase().includes(q)) ||
              (p.notes && p.notes.toLowerCase().includes(q))
            );
          });
        }

        // Filtro por tipo
        if (params?.type) {
          list = list.filter((p) => p.type === params.type);
        }

        // Filtro por estado
        if (params?.status) {
          list = list.filter((p) => p.status === params.status);
        }

        const totalElements = list.length;
        const safeSize = size > 0 ? size : totalElements || 1;
        const totalPages = Math.max(1, Math.ceil(totalElements / safeSize));
        const currentPage = Math.min(Math.max(page, 1), totalPages);
        const startIndex = (currentPage - 1) * safeSize;
        const endIndex = Math.min(startIndex + safeSize, totalElements);
        const content = totalElements > 0 ? list.slice(startIndex, endIndex) : [];

        return {
          content,
          totalElements,
          totalPages,
          currentPage,
          size: safeSize,
        };
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
      const response = await apiClient.get(`/api/partners/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching partner:', error);
      throw new Error(`Error al cargar el socio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async createPartner(partner: Omit<Partner, 'id'>): Promise<Partner> {
    try {
      // Asegurar que socialMedia siempre sea un array antes de serializar
      // Eliminar campos undefined/null que no queremos enviar
      const cleanedPartner: any = { ...partner };
      
      // Asegurar que socialMedia siempre sea un array, nunca null o undefined
      if (!Array.isArray(cleanedPartner.socialMedia)) {
        cleanedPartner.socialMedia = [];
      }
      
      // Eliminar campos de fecha que no queremos enviar
      delete cleanedPartner.partnershipDate;
      delete cleanedPartner.contractStartDate;
      delete cleanedPartner.contractEndDate;
      delete cleanedPartner.nextPaymentDate;
      delete cleanedPartner.lastPaymentDate;
      
      const response = await apiClient.post('/api/partners', cleanedPartner);
      return response.data;
    } catch (error) {
      console.error('Error creating partner:', error);
      throw new Error(`Error al crear el socio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async updatePartner(id: number, partner: Partial<Partner>): Promise<Partner> {
    try {
      // Asegurar que socialMedia siempre sea un array antes de serializar
      const cleanedPartner: any = { ...partner };
      
      // Si socialMedia está presente, asegurar que sea un array
      if (cleanedPartner.socialMedia !== undefined) {
        cleanedPartner.socialMedia = Array.isArray(cleanedPartner.socialMedia) 
          ? cleanedPartner.socialMedia 
          : [];
      }
      
      // Eliminar campos de fecha que no queremos enviar
      delete cleanedPartner.partnershipDate;
      delete cleanedPartner.contractStartDate;
      delete cleanedPartner.contractEndDate;
      delete cleanedPartner.nextPaymentDate;
      delete cleanedPartner.lastPaymentDate;
      
      const response = await apiClient.put(`/api/partners/${id}`, cleanedPartner);
      return response.data;
    } catch (error) {
      console.error('Error updating partner:', error);
      throw new Error(`Error al actualizar el socio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async deletePartner(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/partners/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting partner:', error);
      throw new Error(`Error al eliminar el socio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async searchPartners(query: string): Promise<Partner[]> {
    try {
      // Obtener todos los partners y filtrar por búsqueda en el cliente
      const response = await apiClient.get('/api/partners');
      const allPartners = response.data;
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
      const response = await apiClient.get('/api/partners');
      const allPartners = response.data;
      return allPartners.filter((partner: Partner) => partner.type === type);
    } catch (error) {
      console.error('Error fetching partners by type:', error);
      throw new Error(`Error al cargar socios por tipo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getPartnersByStatus(status: string): Promise<Partner[]> {
    try {
      // Obtener todos los partners y filtrar por estado en el cliente
      const response = await apiClient.get('/api/partners');
      const allPartners = response.data;
      return allPartners.filter((partner: Partner) => partner.status === status);
    } catch (error) {
      console.error('Error fetching partners by status:', error);
      throw new Error(`Error al cargar socios por estado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getActivePartners(): Promise<Partner[]> {
    try {
      // Obtener todos los partners y filtrar los activos en el cliente
      const response = await apiClient.get('/api/partners');
      const allPartners = response.data;
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
      const response = await apiClient.get(`/api/partners/debtors?${searchParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching debtor partners:', error);
      return [];
    }
  }

  async getPartnersWithPendingPayments(): Promise<Partner[]> {
    try {
      // Obtener todos los partners y filtrar los que tienen pagos pendientes
      const response = await apiClient.get('/api/partners');
      const allPartners = response.data;
      return allPartners.filter((partner: Partner) => (partner.pendingEarnings || 0) > 0);
    } catch (error) {
      console.error('Error fetching partners with pending payments:', error);
      throw new Error(`Error al cargar socios con pagos pendientes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getVerifiedPartners(): Promise<Partner[]> {
    try {
      // Obtener todos los partners y filtrar los verificados
      const response = await apiClient.get('/api/partners');
      const allPartners = response.data;
      return allPartners.filter((partner: Partner) => partner.isVerified === true);
    } catch (error) {
      console.error('Error fetching verified partners:', error);
      throw new Error(`Error al cargar socios verificados: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getTopPerformers(limit: number = 10): Promise<Partner[]> {
    try {
      // Obtener todos los partners y ordenarlos por ganancias totales
      const response = await apiClient.get('/api/partners');
      const allPartners = response.data;
      
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

      // axios detecta automáticamente FormData y configura el Content-Type correctamente
      const response = await apiClient.post(`/api/partners/${id}/upload-photo`, formData);

      return response.data;
    } catch (error) {
      console.error('Error uploading partner photo:', error);
      throw new Error(`Error al subir la foto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async deletePartnerPhoto(id: number, photoUrl?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/api/partners/${id}/delete-photo`, {
        data: { photoUrl },
      });

      return response.data;
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