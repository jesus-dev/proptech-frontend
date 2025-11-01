import { apiClient } from '@/lib/api';

export interface PropertyType {
  id: number;
  name: string;
  description?: string;
  active?: boolean;
}

// Get property types from backend usando apiClient (con CORS fix)
export async function getActivePropertyTypes(): Promise<PropertyType[]> {
  try {
    const res = await apiClient.get('/api/property-types');
    return res.data || [];
  } catch (error) {
    console.error('Error fetching property types:', error);
    // Retornar array vacío en caso de error (sin fallback a datos ficticios)
    return [];
  }
} 