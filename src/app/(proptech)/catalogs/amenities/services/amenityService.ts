import { getEndpoint } from '@/lib/api-config';

export interface Amenity {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
}

// Get all amenities
export const getAllAmenities = async (): Promise<Amenity[]> => {
  const res = await fetch(getEndpoint('/api/amenities'));
  if (!res.ok) throw new Error('Error al obtener amenidades');
  return res.json();
};

// Get amenity by ID
export const getAmenityById = async (id: number): Promise<Amenity | null> => {
  const res = await fetch(getEndpoint(`/api/amenities/${id}`));
  if (!res.ok) return null;
  return res.json();
};

// Create new amenity
export const createAmenity = async (data: { name: string; description?: string; icon?: string }) => {
  const res = await fetch(getEndpoint('/api/amenities'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear amenidad');
  return res.json();
};

// Update amenity
export const updateAmenity = async (id: number, data: { name: string; description?: string; icon?: string }) => {
  const res = await fetch(getEndpoint(`/api/amenities/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar amenidad');
  return res.json();
};

// Delete amenity
export const deleteAmenity = async (id: number) => {
  const res = await fetch(getEndpoint(`/api/amenities/${id}`), { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar amenidad');
}; 