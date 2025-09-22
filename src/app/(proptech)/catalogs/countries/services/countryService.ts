import { getEndpoint } from '@/lib/api-config';

export interface Country {
  id: number;
  name: string;
  code: string;
  phoneCode?: string;
}

// Get all countries
export const getAllCountries = async (): Promise<Country[]> => {
  const res = await fetch(getEndpoint('/api/countries'));
  if (!res.ok) throw new Error('Error al obtener países');
  return res.json();
};

// Get country by ID
export const getCountryById = async (id: number): Promise<Country | null> => {
  const res = await fetch(getEndpoint(`/api/countries/${id}`));
  if (!res.ok) return null;
  return res.json();
};

// Create new country
export const createCountry = async (data: { name: string; code: string; phoneCode?: string }) => {
  const res = await fetch(getEndpoint('/api/countries'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear país');
  return res.json();
};

// Update country
export const updateCountry = async (id: number, data: { name: string; code: string; phoneCode?: string }) => {
  const res = await fetch(getEndpoint(`/api/countries/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar país');
  return res.json();
};

// Delete country
export const deleteCountry = async (id: number) => {
  const res = await fetch(getEndpoint(`/api/countries/${id}`), { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar país');
}; 