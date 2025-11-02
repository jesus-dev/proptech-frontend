import { apiClient } from '@/lib/api';

class PublicPropertyService {
  async getPropertiesPaginated({ page = 1, limit = 12 }: { page: number; limit: number }) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/properties/paginated?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache',
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      return { properties: [], total: 0, page: 1, size: limit };
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/properties`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache',
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      return [];
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/properties/featured`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache',
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      return [];
    }
  }

  async getPropertySummaryBySlug(slug: string): Promise<any> {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Usar fetch directo para endpoints públicos (evitar interceptores de auth)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/properties/slug/${slug}/summary`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-cache',
        });

        if (response.ok) {
          return await response.json();
        }

        // Si es 404 real, no reintentar
        if (response.status === 404) {
          throw new Error('Property not found');
        }

        lastError = new Error(`HTTP ${response.status}`);
      } catch (error: any) {
        lastError = error;
        
        // Si es 404 o error de red sin esperanza, no reintentar
        if (error.message === 'Property not found') {
          throw error;
        }

        // Esperar antes de reintentar (100ms, 300ms, 900ms)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(3, attempt - 1)));
          console.log(`🔄 Reintentando obtener propiedad (${attempt + 1}/${maxRetries})...`);
        }
      }
    }

    console.error('Error fetching property summary after retries:', lastError);
    throw lastError;
  }

  async getPropertyGallery(slug: string): Promise<any> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/properties/slug/${slug}/gallery`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache',
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      return { galleryImages: [] };
    } catch (error) {
      console.warn('Error fetching gallery:', error);
      return { galleryImages: [] };
    }
  }

  async getPropertyAmenities(slug: string): Promise<any> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/properties/slug/${slug}/amenities`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache',
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      return { amenityIds: [], amenities: [] };
    } catch (error) {
      console.warn('Error fetching amenities:', error);
      return { amenityIds: [], amenities: [] };
    }
  }

  async getPropertyBySlug(slug: string): Promise<any> {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/properties/slug/${slug}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-cache',
        });

        if (response.ok) {
          return await response.json();
        }

        if (response.status === 404) {
          throw new Error('Property not found');
        }

        lastError = new Error(`HTTP ${response.status}`);
      } catch (error: any) {
        lastError = error;
        
        if (error.message === 'Property not found') {
          throw error;
        }

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(3, attempt - 1)));
        }
      }
    }

    console.error('Error fetching property by slug:', lastError);
    throw lastError;
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
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/properties/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-cache',
        });

        if (response.ok) {
          return await response.json();
        }

        if (response.status === 404) {
          throw new Error('Property not found');
        }

        lastError = new Error(`HTTP ${response.status}`);
      } catch (error: any) {
        lastError = error;
        
        if (error.message === 'Property not found') {
          throw error;
        }

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(3, attempt - 1)));
        }
      }
    }

    console.error('Error fetching property by ID:', lastError);
    throw lastError;
  }

  async getCategorySummary(): Promise<any[]> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/properties/category-summary`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache',
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching category summary:', error);
      return [];
    }
  }
}

export const publicPropertyService = new PublicPropertyService();
