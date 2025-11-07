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
      return { properties: [], pagination: { currentPage: page, totalPages: 0, totalProperties: 0, propertiesPerPage: limit } };
    }
  }

  /**
   * Incrementar vistas (silencioso)
   */
  async incrementViews(propertyId: string): Promise<void> {
    try {
      await apiClient.post(`/api/properties/${propertyId}/views`);
    } catch (error) {
      // Silencioso - no mostrar error si falla
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
}

export const publicPropertyService = new PublicPropertyService();
