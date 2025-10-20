import { getEndpoint } from '@/lib/api-config';

export interface Neighborhood {
  id: number;
  name: string;
  cityId: number;
  cityName?: string;
}

// Get all neighborhoods
export const getAllNeighborhoods = async (): Promise<Neighborhood[]> => {
  const res = await fetch(getEndpoint('/api/neighborhoods'));
  if (!res.ok) throw new Error('Error al obtener barrios');
  return res.json();
};

// Get neighborhood by ID
export const getNeighborhoodById = async (id: number): Promise<Neighborhood | null> => {
  const res = await fetch(getEndpoint(`/api/neighborhoods/${id}`));
  if (!res.ok) return null;
  return res.json();
};

// Get neighborhoods by city
export const getNeighborhoodsByCity = async (cityId: number): Promise<Neighborhood[]> => {
  const res = await fetch(getEndpoint(`/api/neighborhoods/city/${cityId}`));
  if (!res.ok) throw new Error('Error al obtener barrios de la ciudad');
  return res.json();
};

// Create new neighborhood
export const createNeighborhood = async (data: { name: string; cityId: number }) => {
  const res = await fetch(getEndpoint('/api/neighborhoods'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error creating neighborhood:', { status: res.status, error: errorText });
    throw new Error(`Error al crear barrio: ${errorText || res.statusText}`);
  }
  return res.json();
};

// Update neighborhood
export const updateNeighborhood = async (id: number, data: { name: string; cityId: number }) => {
  const res = await fetch(getEndpoint(`/api/neighborhoods/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar barrio');
  return res.json();
};

// Delete neighborhood
export const deleteNeighborhood = async (id: number) => {
  const res = await fetch(getEndpoint(`/api/neighborhoods/${id}`), { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar barrio');
}; 