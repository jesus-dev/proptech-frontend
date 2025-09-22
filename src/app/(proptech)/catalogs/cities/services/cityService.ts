import { getEndpoint } from '@/lib/api-config';

export interface City {
  id: number;
  name: string;
  departmentId: number;
  departmentName?: string;
  departmentCode?: string;
  countryId?: number;
  countryName?: string;
  active?: boolean;
  state?: string;
}

// Get all cities
export const getAllCities = async (): Promise<City[]> => {
  const res = await fetch(getEndpoint('/api/cities'));
  if (!res.ok) throw new Error('Error al obtener ciudades');
  return res.json();
};

// Get city by ID
export const getCityById = async (id: number): Promise<City | null> => {
  const res = await fetch(getEndpoint(`/api/cities/${id}`));
  if (!res.ok) return null;
  return res.json();
};

// Get cities by department
export const getCitiesByDepartment = async (departmentId: number): Promise<City[]> => {
  const res = await fetch(getEndpoint(`/api/cities/department/${departmentId}`));
  if (!res.ok) throw new Error('Error al obtener ciudades del departamento');
  return res.json();
};

// Create new city
export const createCity = async (data: { name: string; departmentId: number }) => {
  const res = await fetch(getEndpoint('/api/cities'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear ciudad');
  return res.json();
};

// Update city
export const updateCity = async (id: number, data: { name: string; departmentId: number }) => {
  const res = await fetch(getEndpoint(`/api/cities/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar ciudad');
  return res.json();
};

// Delete city
export const deleteCity = async (id: number) => {
  const res = await fetch(getEndpoint(`/api/cities/${id}`), { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar ciudad');
};
