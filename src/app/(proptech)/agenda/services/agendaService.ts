import { apiClient } from '@/lib/api';
import { propertyService } from '../../properties/services/propertyService';
import { Property } from '../../properties/components/types';

export interface Agent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo?: string;
  rating?: number;
  specialties?: string[];
  isActive: boolean;
  agency?: {
    name: string;
  };
}

export interface AppointmentRequest {
  title: string;
  description: string;
  appointmentDate: string;
  durationMinutes: number;
  propertyId: number;
  agentId: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  agentId: number;
}

export const agendaService = {
  // === Appointments ===
  async getAppointmentsByAgent(agentId: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`/api/appointments/agent/${agentId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching appointments by agent:', error);
      throw error;
    }
  },

  async updateAppointmentStatus(appointmentId: number, status: string): Promise<any> {
    try {
      const response = await apiClient.put(`/api/appointments/${appointmentId}/status?status=${encodeURIComponent(status)}`);
      return response.data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  async cancelAppointment(appointmentId: number, reason: string = ''): Promise<any> {
    try {
      const response = await apiClient.put(`/api/appointments/${appointmentId}/cancel?reason=${encodeURIComponent(reason)}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  },

  async rescheduleAppointment(appointmentId: number, newDateISO: string, newDuration?: number): Promise<any> {
    try {
      const params = new URLSearchParams({ newDate: newDateISO });
      if (typeof newDuration === 'number') params.set('newDuration', String(newDuration));
      const response = await apiClient.put(`/api/appointments/${appointmentId}/reschedule?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  },

  // Obtener propiedades activas usando el mismo servicio que se usa en propiedades
  async getActiveProperties(page: number = 0, size: number = 12): Promise<{ properties: Property[]; total: number; totalPages: number }> {
    console.log('=== getActiveProperties called ===');
    try {
      // Llamada directa a la API del backend que ya está funcionando
      // El backend espera 'limit' en lugar de 'size' y 'page' comienza en 1
      const backendPage = page + 1; // Convertir de 0-based a 1-based
      console.log(`Calling direct API to /api/properties?page=${backendPage}&limit=${size}`);
      const response = await apiClient.get(`/api/properties?page=${backendPage}&limit=${size}`);
      
      console.log('Raw API response:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
      
      // Verificar si la respuesta tiene la estructura esperada
      if (response.data && Array.isArray(response.data)) {
        console.log('Response is an array, length:', response.data.length);
        console.log('First property:', response.data[0]);
      } else if (response.data && response.data.content) {
        console.log('Response has content property, length:', response.data.content.length);
        console.log('First property:', response.data.content[0]);
      } else {
        console.log('Unexpected response structure:', response.data);
      }
      console.log('API response:', response.data);
      console.log('Properties count:', response.data?.length || 0);
      
      // Transformar los datos del backend al formato esperado por PropertyCard
      console.log('Raw property data example:', response.data.properties?.[0] || response.data[0]);
      
      const propertiesArray = response.data.properties || response.data;
      console.log('Properties array to process:', propertiesArray);
      console.log('Properties array length:', propertiesArray?.length || 0);
      
      const properties = propertiesArray.map((prop: any) => {
        const transformed = {
          id: prop.id.toString(),
          title: prop.title,
          address: prop.address,
          city: prop.cityName || '',
          state: prop.state || '',
          zip: prop.zip || '',
          price: prop.price,
          currency: prop.currencyCode || 'USD',
          images: prop.galleryImages?.map((img: any) => {
            // Corregir las URLs de las imágenes para que apunten al backend
            if (img.url && img.url.startsWith('/api/files/')) {
              return `http://localhost:8080${img.url}`;
            }
            return img.url;
          }) || [],
          galleryImages: prop.galleryImages || [],
          

          description: prop.description,
          bedrooms: prop.bedrooms || 0,
          bathrooms: prop.bathrooms || 0,
          area: prop.area || 0,
          lotSize: prop.lotSize || 0,
          type: prop.propertyTypeName || '',
          status: prop.propertyStatus?.toLowerCase() || 'active',
          privateFiles: prop.privateFiles || [],
          amenities: prop.amenities || [],
          services: prop.services || [],
          amenitiesDetails: prop.amenitiesDetails || [],
          servicesDetails: prop.servicesDetails || [],
          // Campos adicionales que PropertyCard podría necesitar
          slug: prop.slug || '',
          featured: prop.featured || false,
          premium: prop.premium || false,
          favorite: prop.favorite || false,
          operacion: prop.operacion || 'SALE'
        };
        

        return transformed;
      });
      
      // Calcular información de paginación
      const total = response.data.total || response.data.totalElements || properties.length;
      const totalPages = response.data.totalPages || Math.ceil(total / size);
      
      return {
        properties,
        total,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching properties from API:', error);
      throw error;
    }
  },

  // Obtener agentes activos
  async getActiveAgents(): Promise<Agent[]> {
    try {
      // Intentar obtener agentes del backend
      const response = await apiClient.get('/api/sales-agents?size=50');
      console.log('Agents response:', response.data);
      
      if (response.data && response.data.length > 0) {
        return response.data.map((agent: any) => ({
          id: agent.id,
          firstName: agent.firstName || agent.name || 'Agente',
          lastName: agent.lastName || '',
          email: agent.email || 'agente@proptech.com',
          phone: agent.phone || '+595-21-123-456',
          photo: agent.photo || '/images/agents/default.jpg',
          rating: agent.rating || 4.5,
          specialties: agent.specialties || ['Residencial', 'Comercial'],
          isActive: true,
          agency: agent.agency || { name: 'ON PropTech' }
        }));
      }
      
      // Si no hay agentes en el backend, usar datos simulados
      console.log('No agents found in backend, using simulated data');
      return [
        {
          id: 1,
          firstName: "María",
          lastName: "González",
          email: "maria.gonzalez@proptech.com",
          phone: "+595-21-123-456",
          photo: "/images/agents/agent1.jpg",
          rating: 4.8,
          specialties: ["Residencial", "Lujo"],
          isActive: true,
          agency: { name: "ON PropTech" }
        },
        {
          id: 2,
          firstName: "Carlos",
          lastName: "Rodríguez",
          email: "carlos.rodriguez@proptech.com",
          phone: "+595-21-123-457",
          photo: "/images/agents/agent2.jpg",
          rating: 4.6,
          specialties: ["Comercial", "Terrenos"],
          isActive: true,
          agency: { name: "ON PropTech" }
        },
        {
          id: 3,
          firstName: "Ana",
          lastName: "Martínez",
          email: "ana.martinez@proptech.com",
          phone: "+595-21-123-458",
          photo: "/images/agents/agent3.jpg",
          rating: 4.9,
          specialties: ["Residencial", "Condominios"],
          isActive: true,
          agency: { name: "ON PropTech" }
        }
      ];
    } catch (error) {
      console.error('Error fetching agents:', error);
      // Fallback a datos simulados
      console.log('Using fallback simulated agents data');
      return [
        {
          id: 1,
          firstName: "María",
          lastName: "González",
          email: "maria.gonzalez@proptech.com",
          phone: "+595-21-123-456",
          photo: "/images/agents/agent1.jpg",
          rating: 4.8,
          specialties: ["Residencial", "Lujo"],
          isActive: true,
          agency: { name: "ON PropTech" }
        },
        {
          id: 2,
          firstName: "Carlos",
          lastName: "Rodríguez",
          email: "carlos.rodriguez@proptech.com",
          phone: "+595-21-123-457",
          photo: "/images/agents/agent2.jpg",
          rating: 4.6,
          specialties: ["Comercial", "Terrenos"],
          isActive: true,
          agency: { name: "ON PropTech" }
        },
        {
          id: 3,
          firstName: "Ana",
          lastName: "Martínez",
          email: "ana.martinez@proptech.com",
          phone: "+595-21-123-458",
          photo: "/images/agents/agent3.jpg",
          rating: 4.9,
          specialties: ["Residencial", "Condominios"],
          isActive: true,
          agency: { name: "ON PropTech" }
        }
      ];
    }
  },

  // Obtener horarios disponibles para una propiedad
  async getAvailableSlots(propertyId: number, date: string): Promise<TimeSlot[]> {
    try {
      const response = await apiClient.get(`/api/appointments/public/available-slots/${propertyId}?date=${date}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching available slots:', error);
      // Fallback a slots simulados
      const slots: TimeSlot[] = [];
      for (let hour = 9; hour < 18; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const available = Math.random() > 0.3;
        const agentId = Math.floor(Math.random() * 5) + 1;
        
        slots.push({
          time,
          available,
          agentId
        });
      }
      return slots;
    }
  },

  // Crear cita pública
  async createPublicAppointment(appointmentData: AppointmentRequest): Promise<any> {
    try {
      const response = await apiClient.post('/api/appointments/public', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }
};
