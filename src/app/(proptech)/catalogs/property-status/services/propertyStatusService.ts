import { getEndpoint } from '@/lib/api-config';

export interface PropertyStatus {
  id: number;
  name: string;
  description?: string;
}

// Get all property statuses
export const getAllPropertyStatuses = async (): Promise<PropertyStatus[]> => {
  const res = await fetch(getEndpoint('/api/property-status'));
  if (!res.ok) throw new Error('Error al obtener estados de propiedad');
  return res.json();
};

// Get property status by ID
export const getPropertyStatusById = async (id: number): Promise<PropertyStatus | null> => {
  const res = await fetch(getEndpoint(`/api/property-status/${id}`));
  if (!res.ok) return null;
  return res.json();
};

// Create new property status
export const createPropertyStatus = async (data: { name: string; description?: string }) => {
  const res = await fetch(getEndpoint('/api/property-status'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear estado de propiedad');
  return res.json();
};

// Update property status
export const updatePropertyStatus = async (id: number, data: { name: string; description?: string }) => {
  const res = await fetch(getEndpoint(`/api/property-status/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar estado de propiedad');
  return res.json();
};

// Delete property status
export const deletePropertyStatus = async (id: number) => {
  const res = await fetch(getEndpoint(`/api/property-status/${id}`), { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar estado de propiedad');
}; 