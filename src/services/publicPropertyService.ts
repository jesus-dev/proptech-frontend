/**
 * Servicio para Propiedades Públicas
 * Usa apiClient que YA TIENE reintentos automáticos
 */

import { apiClient } from '@/lib/api';

class PublicPropertyService {
  /**
   * Obtener propiedades paginadas
   */
  async getPropertiesPaginated({ page = 1, limit = 6 }: { page: number; limit: number }) {
    try {
      const response = await apiClient.get(`/api/public/properties/paginated?page=${page}&limit=${limit}`);
      const data = response.data;
      
      return {
        properties: data.properties || [],
        pagination: data.pagination || { currentPage: page, totalPages: 0, totalProperties: 0, propertiesPerPage: limit }
      };
    } catch (error) {
      console.warn('⚠️ Error cargando propiedades');
      return { properties: [], pagination: { currentPage: page, totalPages: 0, totalProperties: 0, propertiesPerPage: limit } };
    }
  }

  /**
   * Incrementar vistas (silencioso)
   */
  async incrementViews(propertyId: string): Promise<void> {
    try {
      await apiClient.patch(`/api/public/properties/${propertyId}/increment-views`);
    } catch (error) {
      // Silencioso
    }
  }

  /**
   * Toggle favorito (requiere auth)
   */
  async toggleFavorite(propertyId: string): Promise<boolean> {
    try {
      await apiClient.post(`/properties/${propertyId}/favorites/toggle`);
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
   * Obtener propiedad por slug
   */
  async getPropertySummaryBySlug(slug: string): Promise<any> {
    try {
      // Intentar endpoint /summary primero
      try {
        const response = await apiClient.get(`/api/public/properties/slug/${slug}/summary`);
        return response.data;
      } catch (error) {
        // Si falla, probar endpoint completo
      }

      // Endpoint completo
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
   * Obtener galería
   */
  async getPropertyGallery(slug: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/public/properties/slug/${slug}/gallery`);
      return response.data;
    } catch (error) {
      return { galleryImages: [] };
    }
  }

  /**
   * Obtener amenidades
   */
  async getPropertyAmenities(slug: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/public/properties/slug/${slug}/amenities`);
      return response.data;
    } catch (error) {
      return { amenityIds: [], amenities: [] };
    }
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
}

export const publicPropertyService = new PublicPropertyService();
