import { getEndpoint } from '@/lib/api-config';

export interface PropertyType {
  id: number;
  name: string;
  description?: string;
  active?: boolean;
}

// Get property types from backend (sin mapeo manual)
export async function getActivePropertyTypes() {
  const res = await fetch(getEndpoint('/api/property-types'));
  if (!res.ok) throw new Error('No se pudieron obtener los tipos de propiedad');
  return await res.json(); // [{ id, name, ... }]
} 