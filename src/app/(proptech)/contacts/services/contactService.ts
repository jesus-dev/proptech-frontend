import { Contact, ContactFormData } from '../types';
import { contactApi, PaginatedResponse } from '../../../../lib/api';

export interface PaginatedContactsResponse {
  content: Contact[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  first: boolean;
  last: boolean;
}

export const contactService = {
  async getAllContacts(): Promise<Contact[]> {
    try {
      console.log('🔍 ContactService: Fetching all contacts from API');
      const response = await contactApi.getAll();
      const data = response.data;
      const contacts = Array.isArray(data) ? data : (data?.content || []);
      console.log('✅ ContactService: Successfully fetched', contacts.length, 'contacts');
      return contacts;
    } catch (error) {
      console.error('❌ ContactService: Error fetching contacts:', error);
      throw new Error(`Error al cargar los contactos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async getContactsPaginated(page: number = 1, size: number = 10, filters?: {
    search?: string;
    type?: string;
    status?: string;
    assignedTo?: string;
  }): Promise<PaginatedResponse<Contact>> {
    try {
      const params = {
        page,
        size,
        ...(filters?.search && { search: filters.search }),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.assignedTo && { assignedTo: filters.assignedTo }),
      };

      const response = await contactApi.getAll(params);
      const data = response.data;
      
      if (!data) {
        throw new Error('No data received from API');
      }
      
      return data as PaginatedResponse<Contact>;
    } catch (error) {
      console.error('Error fetching paginated contacts:', error);
      throw new Error(`Error al cargar los contactos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async getContactById(id: string): Promise<Contact | undefined> {
    try {
      console.log('🔍 ContactService: Fetching contact by ID:', id);
      const response = await contactApi.getById(id);
      console.log('✅ ContactService: Successfully fetched contact:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ContactService: Error fetching contact:', error);
      throw new Error(`Error al cargar el contacto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async createContact(contactData: ContactFormData): Promise<Contact> {
    try {
      console.log('🔍 ContactService: Creating new contact:', contactData);
      const response = await contactApi.create(contactData);
      console.log('✅ ContactService: Successfully created contact:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ContactService: Error creating contact:', error);
      throw new Error(`Error al crear el contacto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async updateContact(id: string, contactData: Partial<ContactFormData>): Promise<Contact | undefined> {
    try {
      console.log('🔍 ContactService: Updating contact with ID:', id, 'Data:', contactData);
      const response = await contactApi.update(id, contactData);
      console.log('✅ ContactService: Successfully updated contact:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ContactService: Error updating contact:', error);
      throw new Error(`Error al actualizar el contacto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async deleteContact(id: string): Promise<boolean> {
    try {
      console.log('🔍 ContactService: Deleting contact with ID:', id);
      await contactApi.delete(id);
      console.log('✅ ContactService: Successfully deleted contact');
      return true;
    } catch (error) {
      console.error('❌ ContactService: Error deleting contact:', error);
      throw new Error(`Error al eliminar el contacto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async getContactsByType(type: string): Promise<Contact[]> {
    try {
      console.log('🔍 ContactService: Fetching contacts by type:', type);
      const response = await contactApi.getAll({ search: type });
      const data = response.data;
      const contacts = Array.isArray(data) ? data : (data?.content || []);
      console.log('✅ ContactService: Successfully fetched', contacts.length, 'contacts by type');
      return contacts;
    } catch (error) {
      console.error('❌ ContactService: Error fetching contacts by type:', error);
      throw new Error(`Error al cargar contactos por tipo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async getContactsByStatus(status: string): Promise<Contact[]> {
    try {
      console.log('🔍 ContactService: Fetching contacts by status:', status);
      const response = await contactApi.getAll({ status });
      const data = response.data;
      const contacts = Array.isArray(data) ? data : (data?.content || []);
      console.log('✅ ContactService: Successfully fetched', contacts.length, 'contacts by status');
      return contacts;
    } catch (error) {
      console.error('❌ ContactService: Error fetching contacts by status:', error);
      throw new Error(`Error al cargar contactos por estado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async searchContacts(query: string): Promise<Contact[]> {
    try {
      console.log('🔍 ContactService: Searching contacts with query:', query);
      const response = await contactApi.getAll({ search: query });
      const data = response.data;
      const contacts = Array.isArray(data) ? data : (data?.content || []);
      console.log('✅ ContactService: Successfully found', contacts.length, 'contacts matching query');
      return contacts;
    } catch (error) {
      console.error('❌ ContactService: Error searching contacts:', error);
      throw new Error(`Error al buscar contactos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async updateContactStatus(id: string, status: string): Promise<Contact | undefined> {
    try {
      console.log('🔍 ContactService: Updating contact status for ID:', id, 'New status:', status);
      const response = await contactApi.update(id, { status });
      console.log('✅ ContactService: Successfully updated contact status:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ContactService: Error updating contact status:', error);
      throw new Error(`Error al actualizar el estado del contacto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async addNote(id: string, note: string): Promise<Contact | undefined> {
    try {
      console.log('🔍 ContactService: Adding note to contact ID:', id, 'Note:', note);
      const response = await contactApi.update(id, { notes: note });
      console.log('✅ ContactService: Successfully added note to contact:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ContactService: Error adding note:', error);
      throw new Error(`Error al agregar la nota: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async scheduleFollowUp(id: string, followUpDate: string): Promise<Contact | undefined> {
    try {
      console.log('🔍 ContactService: Scheduling follow-up for contact ID:', id, 'Date:', followUpDate);
      const response = await contactApi.update(id, { nextFollowUp: followUpDate });
      console.log('✅ ContactService: Successfully scheduled follow-up:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ContactService: Error scheduling follow-up:', error);
      throw new Error(`Error al programar el seguimiento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async markAsContacted(id: string): Promise<Contact | undefined> {
    try {
      console.log('🔍 ContactService: Marking contact as contacted, ID:', id);
      const response = await contactApi.update(id, { 
        lastContact: new Date().toISOString() 
      });
      console.log('✅ ContactService: Successfully marked contact as contacted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ContactService: Error marking as contacted:', error);
      throw new Error(`Error al marcar como contactado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}; 