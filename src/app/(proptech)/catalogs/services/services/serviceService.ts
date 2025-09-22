import { getEndpoint } from '@/lib/api-config';

export interface Service {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

// Get all services
export const getAllServices = async (): Promise<Service[]> => {
  const res = await fetch(getEndpoint('/api/services'));
  if (!res.ok) throw new Error('Error al obtener servicios');
  return res.json();
};

// Get service by ID
export const getServiceById = async (id: number): Promise<Service | null> => {
  const res = await fetch(getEndpoint(`/api/services/${id}`));
  if (!res.ok) return null;
  return res.json();
};

// Create new service
export const createService = async (data: { name: string; description?: string; icon?: string }) => {
  const res = await fetch(getEndpoint('/api/services'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear servicio');
  return res.json();
};

// Update service
export const updateService = async (id: number, data: { name: string; description?: string; icon?: string }) => {
  const res = await fetch(getEndpoint(`/api/services/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar servicio');
  return res.json();
};

// Delete service
export const deleteService = async (id: number) => {
  const res = await fetch(getEndpoint(`/api/services/${id}`), { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar servicio');
}; 