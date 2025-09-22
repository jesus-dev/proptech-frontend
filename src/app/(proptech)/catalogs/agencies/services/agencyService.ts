import { Agency, AgencyFormData } from '../types';
import { getEndpoint } from '@/lib/api-config';

// Get all agencies
export const getAllAgencies = async (): Promise<Agency[]> => {
  const res = await fetch(getEndpoint('/api/agencies'));
  if (!res.ok) throw new Error('Error al obtener agencias');
  return res.json();
};

// Get agency by ID
export const getAgencyById = async (id: number): Promise<Agency | null> => {
  const res = await fetch(getEndpoint(`/api/agencies/${id}`));
  if (!res.ok) return null;
  return res.json();
};

// Create new agency
export const createAgency = async (data: AgencyFormData): Promise<Agency> => {
  const res = await fetch(getEndpoint('/api/agencies'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear agencia');
  return res.json();
};

// Update agency
export const updateAgency = async (id: number, data: Partial<AgencyFormData>): Promise<Agency> => {
  const res = await fetch(getEndpoint(`/api/agencies/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar agencia');
  return res.json();
};

// Delete agency
export const deleteAgency = async (id: number): Promise<void> => {
  const res = await fetch(getEndpoint(`/api/agencies/${id}`), { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar agencia');
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
  try {
    const agencies = await getAllAgencies();
    if (agencies.length > 0) return; // Already has data
    
    const sampleAgencies: AgencyFormData[] = [
      {
        name: "Inmobiliaria Paraguay",
        description: "Agencia líder en el mercado inmobiliario de Paraguay",
        address: "Av. España 123, Asunción",
        email: "info@inmobiliariaparaguay.com",
        phone: "+595 21 123-456",
        website: "https://inmobiliariaparaguay.com",
        logoUrl: "",
        active: true,
      },
      {
        name: "Propiedades del Sur",
        description: "Especialistas en propiedades residenciales y comerciales",
        address: "Calle Palma 456, Asunción",
        email: "contacto@propiedadesdelsur.com",
        phone: "+595 21 987-654",
        website: "https://propiedadesdelsur.com",
        logoUrl: "",
        active: true,
      },
      {
        name: "Real Estate Paraguay",
        description: "Agencia internacional con presencia en Paraguay",
        address: "Av. Mcal. López 789, Asunción",
        email: "info@realestateparaguay.com",
        phone: "+595 21 555-123",
        website: "https://realestateparaguay.com",
        logoUrl: "",
        active: false,
      },
    ];
    
    for (const agencyData of sampleAgencies) {
      await createAgency(agencyData);
    }
  } catch (error) {
    console.error('Error initializing sample agencies:', error);
    throw new Error('Failed to initialize sample agencies');
  }
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