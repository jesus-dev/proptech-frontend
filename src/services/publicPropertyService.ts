import { apiClient } from '@/lib/api';

class PublicPropertyService {
  async getPropertiesPaginated({ page = 1, limit = 12 }: { page: number; limit: number }) {
    try {
      const response = await apiClient.get(`/api/public/properties/paginated?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      return { properties: [], total: 0, page: 1, size: limit };
    }
  }

  async incrementViews(propertyId: string): Promise<void> {
    try {
      await apiClient.patch(`/properties/${propertyId}/increment-views`);
    } catch (error) {
      console.error('Error incrementing views:', error);
      // No lanzar error - incrementar vistas no es crítico
    }
  }

  async toggleFavorite(propertyId: string): Promise<boolean> {
    try {
      // Obtener información del usuario actual
      const userResponse = await apiClient.get('/api/auth/me');
      const user = userResponse.data;
      
      if (!user || !user.id) {
        console.warn('No se pudo obtener ID del usuario');
        return false;
      }

      // Verificar si ya está en favoritos
      let isFavorite = false;
      try {
        const favoritesResponse = await apiClient.get(`/api/properties/favorites/${user.id}`);
        const favorites = favoritesResponse.data;
        isFavorite = favorites.some((fav: any) => fav.id === parseInt(propertyId));
      } catch (error) {
        console.warn('Error checking favorites:', error);
      }

      // Toggle del estado de favorito
      if (isFavorite) {
        await apiClient.delete(`/api/properties/${propertyId}/favorites/${user.id}`);
        return false;
      } else {
        await apiClient.post(`/api/properties/${propertyId}/favorites/${user.id}`);
        return true;
      }
    } catch (error) {
      console.warn('Error toggling favorite:', error);
      return false;
    }
  }

  async getAllProperties(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/public/properties');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching all properties:', error);
      return [];
    }
  }

  async getPropertyTypesSummary(): Promise<Array<{ type: string; count: number; example?: {
    id: number;
    title: string;
    price: number;
    currency: string;
    city?: string;
    slug: string;
    image?: string;
  } }>> {
    try {
      const response = await apiClient.get('/api/properties/type-summary');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching property types summary:', error);
      return [];
    }
  }

  async getFeaturedProperties(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/public/properties/featured');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      return [];
    }
  }

  async getPropertySummaryBySlug(slug: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/public/properties/slug/${slug}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching property summary:', error);
      throw error;
    }
  }

  async getPropertyGallery(slug: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/public/properties/slug/${slug}/gallery`);
      return response.data;
    } catch (error) {
      console.warn('Error fetching gallery:', error);
      return { galleryImages: [] };
    }
  }

  async getPropertyAmenities(slug: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/public/properties/slug/${slug}/amenities`);
      return response.data;
    } catch (error) {
      console.warn('Error fetching amenities:', error);
      return { amenityIds: [], amenities: [] };
    }
  }

  async getPropertyBySlug(slug: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/public/properties/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching property by slug:', error);
      throw error;
    }
  }
  
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

  async getPropertyById(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/public/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching property by ID:', error);
      throw error;
    }
  }

  async getCategorySummary(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/public/properties/category-summary');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching category summary:', error);
      return [];
    }
  }
}

export const publicPropertyService = new PublicPropertyService();
