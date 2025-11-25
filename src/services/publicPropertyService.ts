/**
 * Servicio para Propiedades Públicas
 * Usa apiClient que YA TIENE reintentos automáticos
 */

import { apiClient } from '@/lib/api';

export interface PublicPropertyFilters {
  search?: string;
  type?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  operacion?: 'SALE' | 'RENT' | 'BOTH';
}

class PublicPropertyService {
  /**
   * Obtener propiedades paginadas
   */
  async getPropertiesPaginated({ page = 1, limit = 6, filters }: { page?: number; limit?: number; filters?: PublicPropertyFilters }) {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());

      if (filters) {
        if (filters.search) searchParams.append('search', filters.search);
        if (filters.type) searchParams.append('type', filters.type);
        if (filters.city) searchParams.append('city', filters.city);
        if (typeof filters.minPrice === 'number') searchParams.append('minPrice', filters.minPrice.toString());
        if (typeof filters.maxPrice === 'number') searchParams.append('maxPrice', filters.maxPrice.toString());
        if (typeof filters.bedrooms === 'number') searchParams.append('bedrooms', filters.bedrooms.toString());
        if (typeof filters.bathrooms === 'number') searchParams.append('bathrooms', filters.bathrooms.toString());
        if (typeof filters.minArea === 'number') searchParams.append('minArea', filters.minArea.toString());
        if (typeof filters.maxArea === 'number') searchParams.append('maxArea', filters.maxArea.toString());
        if (filters.operacion) searchParams.append('operacion', filters.operacion);
      }

      const response = await apiClient.get(`/api/public/properties/paginated?${searchParams.toString()}`);
      const data = response.data;
      
      return {
        properties: data.properties || [],
        pagination: data.pagination || { currentPage: page, totalPages: 0, totalProperties: 0, propertiesPerPage: limit }
      };
    } catch (error) {
      return { properties: [], pagination: { currentPage: page, totalPages: 0, totalProperties: 0, propertiesPerPage: limit } };
    }
  }

  /**
   * Incrementar vistas (silencioso)
   */
  async incrementViews(propertyId: string): Promise<void> {
    try {
      console.log('👁️ [FRONTEND] Incrementando vistas para propiedad:', propertyId);
      // Usar endpoint público que registra vistas correctamente
      const response = await apiClient.patch(`/api/public/properties/${propertyId}/view`);
      console.log('✅ [FRONTEND] Vista registrada exitosamente:', response.data);
    } catch (error: any) {
      // Log del error para debugging
      console.error('❌ [FRONTEND] Error incrementing views:', error);
      console.error('❌ [FRONTEND] Error details:', error?.response?.data || error?.message);
    }
  }

  /**
   * Toggle favorito (requiere auth)
   */
  async toggleFavorite(propertyId: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/properties/${propertyId}/favorites/toggle`);
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }

  /**
   * Obtener todas las propiedades
   */
  async getAllProperties(): Promise<any[]> {
    try {
      const response = await apiClient.get(`/api/public/properties`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all properties:', error);
      return [];
    }
  }

  /**
   * Obtener resumen por tipos
   */
  async getPropertyTypesSummary(): Promise<Array<{ type: string; count: number; example?: any }>> {
    try {
      const response = await apiClient.get(`/api/properties/type-summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching property types summary:', error);
      return [];
    }
  }

  /**
   * Obtener propiedades destacadas
   */
  async getFeaturedProperties(): Promise<any[]> {
    try {
      const response = await apiClient.get(`/api/public/properties/featured`);
      const data = response.data;
      return Array.isArray(data) ? data : (data.properties || []);
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      return [];
    }
  }

  /**
   * Obtener propiedad por slug con retry (reducido sin tunnel)
   */
  async getPropertySummaryBySlug(slug: string, retries = 2): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Intentar endpoint /summary primero (más rápido)
        try {
          const response = await apiClient.get(`/api/public/properties/slug/${slug}/summary`);
          return response.data;
        } catch (error: any) {
          // Si es 404, no reintentar
          if (error.response?.status === 404) {
            throw new Error('PROPERTY_NOT_FOUND');
          }
        }

        // Fallback: Endpoint completo
        const response = await apiClient.get(`/api/public/properties/slug/${slug}`);
        return response.data;
      } catch (error: any) {
        // Si es 404, lanzar inmediatamente
        if (error.response?.status === 404) {
          throw new Error('PROPERTY_NOT_FOUND');
        }
        
        // Si es el último intento, lanzar error
        if (attempt === retries) {
          throw error;
        }
        
        // Esperar antes de reintentar (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
    
    throw new Error('PROPERTY_NOT_FOUND');
  }

  /**
   * Obtener galería con retry
   */
  async getPropertyGallery(slug: string, retries = 2): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await apiClient.get(`/api/public/properties/slug/${slug}/gallery`);
        return response.data;
      } catch (error) {
        if (attempt === retries) {
          return { galleryImages: [] };
        }
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }
    return { galleryImages: [] };
  }

  /**
   * Obtener amenidades con retry
   */
  async getPropertyAmenities(slug: string, retries = 2): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await apiClient.get(`/api/public/properties/slug/${slug}/amenities`);
        return response.data;
      } catch (error) {
        if (attempt === retries) {
          return { amenityIds: [], amenities: [] };
        }
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }
    return { amenityIds: [], amenities: [] };
  }

  /**
   * Obtener propiedad por slug (método directo)
   */
  async getPropertyBySlug(slug: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/public/properties/slug/${slug}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('PROPERTY_NOT_FOUND');
      }
      throw error;
    }
  }
  
  /**
   * Carga progresiva (mejor UX - muestra datos mientras carga el resto)
   */
  async getPropertyBySlugProgressive(slug: string): Promise<any> {
    try {
      const summary = await this.getPropertySummaryBySlug(slug);
      
      const [gallery, amenities] = await Promise.allSettled([
        this.getPropertyGallery(slug),
        this.getPropertyAmenities(slug)
      ]);
      
      return {
        ...summary,
        galleryImages: gallery.status === 'fulfilled' ? gallery.value.galleryImages : [],
        amenityIds: amenities.status === 'fulfilled' ? amenities.value.amenityIds : [],
        amenitiesDetails: amenities.status === 'fulfilled' ? amenities.value.amenities : []
      };
    } catch (error) {
      console.error('Error in progressive loading:', error);
      throw error;
    }
  }

  /**
   * Obtener propiedad por ID
   */
  async getPropertyById(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/public/properties/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('PROPERTY_NOT_FOUND');
      }
      throw error;
    }
  }

  /**
   * Obtener resumen de categorías
   */
  async getCategorySummary(): Promise<any[]> {
    try {
      const response = await apiClient.get(`/api/public/properties/category-summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category summary:', error);
      return [];
    }
  }

  async getFilterOptions(): Promise<{ cities: Array<{ id: number | null; name: string; count: number }>; propertyTypes: Array<{ id: number | null; name: string; count: number }>; operations: Array<{ value: string; label: string }> }> {
    try {
      const response = await apiClient.get('/api/public/properties/filters');
      return response.data;
    } catch (error) {
      console.error('Error fetching public filter options:', error);
      return { cities: [], propertyTypes: [], operations: [] };
    }
  }
}

export const publicPropertyService = new PublicPropertyService();
