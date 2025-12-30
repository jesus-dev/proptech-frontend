import { Agency, AgencyFormData } from '../types';
import { apiClient } from '@/lib/api';

// Get all agencies
export const getAllAgencies = async (): Promise<Agency[]> => {
  try {
    const response = await apiClient.get('/api/agencies');
    return response.data;
  } catch (error) {
    console.error('Error fetching agencies:', error);
    throw new Error('Error al obtener agencias');
  }
};

// Get agency by ID
export const getAgencyById = async (id: number): Promise<Agency | null> => {
  try {
    const response = await apiClient.get(`/api/agencies/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching agency by id:', error);
    return null;
  }
};

// Create new agency
export const createAgency = async (data: AgencyFormData): Promise<Agency> => {
  try {
    const response = await apiClient.post('/api/agencies', data);
    return response.data;
  } catch (error) {
    console.error('Error creating agency:', error);
    throw new Error('Error al crear agencia');
  }
};

// Update agency
export const updateAgency = async (id: number, data: Partial<AgencyFormData>): Promise<Agency> => {
  try {
    const response = await apiClient.put(`/api/agencies/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating agency:', error);
    throw new Error('Error al actualizar agencia');
  }
};

// Delete agency
export const deleteAgency = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/agencies/${id}`);
  } catch (error) {
    console.error('Error deleting agency:', error);
    throw new Error('Error al eliminar agencia');
  }
};

// Get active agencies only
export const getActiveAgencies = async (): Promise<Agency[]> => {
  try {
    const agencies = await getAllAgencies();
    return agencies.filter(agency => agency.active);
  } catch (error) {
    console.error('Error getting active agencies:', error);
    return [];
  }
};

// Search agencies
export const searchAgencies = async (searchTerm: string): Promise<Agency[]> => {
  try {
    const agencies = await getAllAgencies();
    const term = searchTerm.toLowerCase();
    
    return agencies.filter(agency => 
      agency.name.toLowerCase().includes(term) ||
      (agency.address || '').toLowerCase().includes(term) ||
      (agency.email || '').toLowerCase().includes(term) ||
      (agency.phone || '').includes(term) ||
      (agency.website || '').toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching agencies:', error);
    return [];
  }
};

// Get agency statistics
export const getAgencyStats = async () => {
  try {
    const agencies = await getAllAgencies();
    const active = agencies.filter(agency => agency.active).length;
    
    return {
      total: agencies.length,
      active,
      inactive: agencies.length - active,
    };
  } catch (error) {
    console.error('Error getting agency stats:', error);
    return { total: 0, active: 0, inactive: 0 };
  }
};

// Initialize sample agencies
export const initializeSampleAgencies = async (): Promise<void> => {
  // No generar datos ficticios en el sistema.
  // Mantener función como NO-OP para compatibilidad con la UI.
  return;
};

// Clear all agencies (for testing purposes)
export const clearAllAgencies = async (): Promise<void> => {
  try {
    const agencies = await getAllAgencies();
    for (const agency of agencies) {
      await deleteAgency(agency.id);
    }
  } catch (error) {
    console.error('Error clearing agencies:', error);
    throw new Error('Failed to clear agencies');
  }
}; 