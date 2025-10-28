import { apiConfig } from '@/lib/api-config';

class PublicPropertyService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = apiConfig.getApiUrl();
  }

  async getPropertiesPaginated({ page = 1, limit = 12 }: { page: number; limit: number }) {
    try {
      const url = `${this.baseUrl}/api/public/properties/paginated?page=${page}&limit=${limit}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  async incrementViews(propertyId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/properties/${propertyId}/increment-views`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  }

  async toggleFavorite(propertyId: string): Promise<boolean> {
    try {
      // Obtener el token de autenticación
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('No hay token de autenticación disponible');
        return false;
      }

      // Obtener información del usuario actual
      const userResponse = await fetch(`${this.baseUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!userResponse.ok) {
        console.warn('No se pudo obtener información del usuario');
        return false;
      }
      
      const user = await userResponse.json();
      if (!user || !user.id) {
        console.warn('No se pudo obtener ID del usuario');
        return false;
      }

      // Verificar si ya está en favoritos
      const favoritesResponse = await fetch(`${this.baseUrl}/api/properties/favorites/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      let isFavorite = false;
      if (favoritesResponse.ok) {
        const favorites = await favoritesResponse.json();
        isFavorite = favorites.some((fav: any) => fav.id === parseInt(propertyId));
      }

      // Toggle del estado de favorito
      if (isFavorite) {
        // Remover de favoritos
        const removeResponse = await fetch(`${this.baseUrl}/api/properties/${propertyId}/favorites/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!removeResponse.ok) {
          console.warn('Error removing from favorites:', removeResponse.status);
          return isFavorite; // Mantener el estado actual
        }
        
        return false;
      } else {
        // Agregar a favoritos
        const addResponse = await fetch(`${this.baseUrl}/api/properties/${propertyId}/favorites/${user.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!addResponse.ok) {
          console.warn('Error adding to favorites:', addResponse.status);
          return isFavorite; // Mantener el estado actual
        }
        
        return true;
      }
    } catch (error) {
      console.warn('Error toggling favorite:', error);
      // En caso de error, devolver false para evitar estados inconsistentes
      return false;
    }
  }

  async getAllProperties(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/properties`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching all properties:', error);
      throw error;
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
      const response = await fetch(`${this.baseUrl}/api/properties/type-summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching property types summary:', error);
      throw error;
    }
  }

  async getFeaturedProperties(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/properties/featured`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      throw error;
    }
  }

  /**
   * Obtiene SOLO el resumen de la propiedad (ligero, ~800 bytes)
   * Para carga inicial rápida
   */
  async getPropertySummaryBySlug(slug: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/public/properties/slug/${slug}/summary`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching property summary:', error);
      throw error;
    }
  }

  /**
   * Obtiene la galería de imágenes por separado
   */
  async getPropertyGallery(slug: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/public/properties/slug/${slug}/gallery`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return { galleryImages: [] }; // Si falla, retornar vacío
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Error fetching gallery:', error);
      return { galleryImages: [] };
    }
  }

  /**
   * Obtiene amenities por separado
   */
  async getPropertyAmenities(slug: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/public/properties/slug/${slug}/amenities`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return { amenityIds: [], amenities: [] };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Error fetching amenities:', error);
      return { amenityIds: [], amenities: [] };
    }
  }

  /**
   * Obtiene propiedad completa (pesada, para compatibilidad)
   * DEPRECATED: Usar getPropertySummaryBySlug + progressive loading
   */
  async getPropertyBySlug(slug: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/public/properties/slug/${slug}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching property by slug:', error);
      throw error;
    }
  }
  
  /**
   * Progressive Loading: Obtiene propiedad en partes
   * 1. Summary rápido primero
   * 2. Gallery y amenities en background
   */
  async getPropertyBySlugProgressive(slug: string): Promise<any> {
    try {
      // 1. Cargar summary primero (RÁPIDO)
      const summary = await this.getPropertySummaryBySlug(slug);
      
      // 2. Cargar detalles en paralelo (en background)
      const [gallery, amenities] = await Promise.allSettled([
        this.getPropertyGallery(slug),
        this.getPropertyAmenities(slug)
      ]);
      
      // 3. Combinar resultados
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
      const url = `${this.baseUrl}/api/public/properties/${id}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching property by ID:', error);
      throw error;
    }
  }

  async getCategorySummary(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/properties/category-summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching category summary:', error);
      throw error;
    }
  }
}

export const publicPropertyService = new PublicPropertyService(); 