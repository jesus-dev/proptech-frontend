import { getEndpoint } from '@/lib/api-config';
import { apiClient } from '@/lib/api';
import { FloorPlanForm } from '../components/steps/FloorPlansStep';

// Servicio para manejar planos de planta asociados a propiedades

export interface FloorPlan {
  id?: number;
  propertyId: number;
  title: string;
  bedrooms: number | null;
  bathrooms: number | null;
  price: number | null;
  priceSuffix: string;
  size: number | null;
  image?: string | null;
  description: string;
}

// Función helper para convertir URLs relativas a completas (solo para visualización)
function getFullImageUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  if (url.startsWith('/api/') || url.startsWith('/uploads/')) return getEndpoint(url);
  return getEndpoint(`/api/files/${url}`);
}

export async function getFloorPlans(propertyId: number | string): Promise<FloorPlan[]> {
  try {
    const response = await apiClient.get(`/api/properties/${propertyId}/floor-plans`);
    const plans = response.data || [];
    // Devolver planos con image tal como está en el backend (ruta relativa) para persistir correctamente al guardar
    return plans.map((plan: FloorPlan) => ({
      ...plan,
      bedrooms: plan.bedrooms != null ? Number(plan.bedrooms) : null,
      bathrooms: plan.bathrooms != null ? Number(plan.bathrooms) : null,
      price: plan.price != null ? Number(plan.price) : null,
      size: plan.size != null ? Number(plan.size) : null,
      image: plan.image ?? undefined,
    }));
  } catch (error: any) {
    if (error.response?.status === 404) {
      // Si no hay planos, devolver array vacío
      return [];
    }
    console.error('Error getting floor plans:', error);
    throw new Error('Error al obtener planos de planta');
  }
}

export async function saveFloorPlans(propertyId: number | string, floorPlans: FloorPlanForm[]): Promise<void> {
  const toNum = (v: number | string | null | undefined): number | null => {
    if (v == null || v === '') return null;
    if (typeof v === 'number') return v;
    const n = parseFloat(String(v).replace(',', '.'));
    return Number.isNaN(n) ? null : n;
  };

  try {
    const mappedPlans = floorPlans.map(plan => ({
      title: plan.title || '',
      bedrooms: plan.bedrooms ?? null,
      bathrooms: plan.bathrooms ?? null,
      price: toNum(plan.price),
      priceSuffix: plan.priceSuffix || '',
      size: toNum(plan.size),
      image: plan.image ? plan.image : null,
      description: plan.description || ''
    }));
    
    await apiClient.post(`/api/properties/${propertyId}/floor-plans`, mappedPlans);
  } catch (error: any) {
    console.error('Error saving floor plans:', error);
    throw error;
  }
}

export async function uploadFloorPlanImage(propertyId: number | string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  
  try {
    const response = await apiClient.post(`/api/files/upload/floor-plans`, formData);
    const uploadedFile = response.data;
    // Devolver la URL tal como la guarda el backend (ej: /uploads/floor-plans/xxx) para persistirla en el plano
    const imageUrl = uploadedFile.url || uploadedFile.fileName || '';
    return imageUrl;
  } catch (error: any) {
    console.error('Error uploading floor plan image:', error);
    throw new Error(error.response?.data || 'Error al subir imagen del plano');
  }
}

/** URL completa para mostrar la imagen del plano en la UI */
export function getFloorPlanImageDisplayUrl(imageUrl: string | undefined): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http') || imageUrl.startsWith('blob:')) return imageUrl;
  return getFullImageUrl(imageUrl);
}

export async function deleteFloorPlans(propertyId: number | string): Promise<void> {
  try {
    await apiClient.delete(`/api/properties/${propertyId}/floor-plans`);
  } catch (error: any) {
    console.error('Error deleting floor plans:', error);
    throw new Error(error.response?.data || 'Error al eliminar planos de planta');
  }
}
