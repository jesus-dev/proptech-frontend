import { Client } from '../components/types';
import { apiClient } from '@/lib/api';

// Mapeo entre Client (frontend) y Contact (backend)
interface ContactDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: string;
  status: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
  source?: string;
  assignedTo?: string;
  lastContact?: string;
  nextFollowUp?: string;
  createdAt?: string;
  updatedAt?: string;
  budget?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  tags?: string[];
}

// Convertir ContactDTO a Client
const contactToClient = (contact: ContactDTO): Client => ({
  id: contact.id,
  firstName: contact.firstName,
  lastName: contact.lastName,
  email: contact.email,
  phone: contact.phone,
  dni: contact.notes || '', // Usamos notes para DNI temporalmente
  address: contact.address || '',
  city: contact.city || '',
  state: contact.state || '',
  zip: contact.zip || '',
  createdAt: contact.createdAt || new Date().toISOString(),
  updatedAt: contact.updatedAt || new Date().toISOString(),
});

// Convertir Client a ContactDTO
const clientToContact = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Partial<ContactDTO> => ({
  firstName: client.firstName,
  lastName: client.lastName,
  email: client.email,
  phone: client.phone,
  type: 'CLIENT',
  status: 'ACTIVE',
  address: client.address,
  city: client.city,
  state: client.state,
  zip: client.zip,
  notes: client.dni, // Guardamos DNI en notes
});

export const clientService = {
  async getAllClients(): Promise<Client[]> {
    try {
      const response = await apiClient.get<ContactDTO[]>('/api/contacts?type=client');
      
      
      // Manejar diferentes estructuras de respuesta
      let contacts: ContactDTO[] = [];
      
      if (response.data) {
        // Si response.data existe, usarlo directamente
        contacts = Array.isArray(response.data) ? response.data : [];
      } else {
        // Si no hay datos, usar array vacío
        contacts = [];
      }
      
      return contacts.map(contactToClient);
    } catch (error) {
      console.error('❌ ClientService: Error fetching clients:', error);
      // Retornar array vacío en lugar de lanzar error para evitar que rompa la UI
      return [];
    }
  },

  async getClientById(id: string): Promise<Client | undefined> {
    try {
      const response = await apiClient.get<ContactDTO>(`/api/contacts/${id}`);
      
      if (!response.data) {
        return undefined;
      }

      const contact: ContactDTO = response.data;
      return contactToClient(contact);
    } catch (error) {
      console.error('❌ ClientService: Error fetching client:', error);
      return undefined;
    }
  },

  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    try {
      const contactData = clientToContact(client);

      const response = await apiClient.post<ContactDTO>('/api/contacts', contactData);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }

      const createdContact: ContactDTO = response.data;
      return contactToClient(createdContact);
    } catch (error) {
      console.error('❌ ClientService: Error creating client:', error);
      throw new Error('Error al crear cliente');
    }
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
    try {
      const contactData = clientToContact(updates as Omit<Client, 'id' | 'createdAt' | 'updatedAt'>);
      
      const response = await apiClient.put<ContactDTO>(`/api/contacts/${id}`, contactData);
      
      if (!response.data) {
        return undefined;
      }

      const updatedContact: ContactDTO = response.data;
      return contactToClient(updatedContact);
    } catch (error) {
      console.error('❌ ClientService: Error updating client:', error);
      return undefined;
    }
  },

  async deleteClient(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/contacts/${id}`);
      
      return true;
    } catch (error) {
      console.error('❌ ClientService: Error deleting client:', error);
      return false;
    }
  },

  async searchClients(query: string): Promise<Client[]> {
    try {
      const response = await apiClient.get<ContactDTO[]>(`/api/contacts/search?q=${encodeURIComponent(query)}`);
      
      let contacts: ContactDTO[] = [];
      
      if (response.data) {
        contacts = Array.isArray(response.data) ? response.data : [];
      }
      
      // Filtrar solo clientes (type = CLIENT)
      const clientContacts = contacts.filter(contact => contact.type === 'CLIENT');
      return clientContacts.map(contactToClient);
    } catch (error) {
      console.error('❌ ClientService: Error searching clients:', error);
      return [];
    }
  }
}; 