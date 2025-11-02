/**
 * Servicio Premium para Propiedades Públicas
 * - Reintentos automáticos inteligentes
 * - Timeouts configurables
 * - Fallbacks a múltiples endpoints
 * - NUNCA se queda colgado
 * - NUNCA rompe la aplicación
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.proptech.com.py';
const DEFAULT_TIMEOUT = 8000; // 8 segundos
const MAX_RETRIES = 2;

/**
 * Fetch con timeout y reintentos automáticos
 */
async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  retries = MAX_RETRIES,
  timeout = DEFAULT_TIMEOUT
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      // Última oportunidad - lanzar error
      if (attempt === retries) {
        if (error.name === 'AbortError') {
          throw new Error('TIMEOUT');
        }
        throw error;
      }

      // Esperar antes del siguiente intento (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 200 * Math.pow(2, attempt)));
    }
  }

  throw new Error('Max retries reached');
}

class PublicPropertyService {
  /**
   * Obtener propiedades paginadas
   */
  async getPropertiesPaginated({ page = 1, limit = 12 }: { page: number; limit: number }) {
    try {
      const response = await fetchWithRetry(
        `${API_URL}/api/public/properties/paginated?page=${page}&limit=${limit}`
      );
      
      if (response.ok) {
        return await response.json();
      }
      
      return { properties: [], total: 0, page: 1, size: limit };
    } catch (error) {
      console.error('Error fetching properties:', error);
      return { properties: [], total: 0, page: 1, size: limit };
    }
  }

  /**
   * Incrementar vistas (no crítico, no bloquea)
   */
  async incrementViews(propertyId: string): Promise<void> {
    try {
      await fetchWithRetry(
        `${API_URL}/properties/${propertyId}/increment-views`,
        { method: 'PATCH' },
        0, // Sin reintentos
        3000 // Solo 3 segundos
      );
    } catch (error) {
      // Silencioso - no es crítico
    }
  }

  /**
   * Toggle favorito (requiere auth)
   */
  async toggleFavorite(propertyId: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const userResponse = await fetchWithRetry(
        `${API_URL}/api/auth/me`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!userResponse.ok) return false;
      
      const user = await userResponse.json();
      if (!user?.id) return false;

      // Verificar favoritos
      const favoritesResponse = await fetchWithRetry(
        `${API_URL}/api/properties/favorites/${user.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      let isFavorite = false;
      if (favoritesResponse.ok) {
        const favorites = await favoritesResponse.json();
        isFavorite = favorites.some((fav: any) => fav.id === parseInt(propertyId));
      }

      // Toggle
      const method = isFavorite ? 'DELETE' : 'POST';
      const toggleResponse = await fetchWithRetry(
        `${API_URL}/api/properties/${propertyId}/favorites/${user.id}`,
        { 
          method,
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      return toggleResponse.ok && !isFavorite;
    } catch (error) {
      console.warn('Error toggling favorite:', error);
      return false;
    }
  }

  /**
   * Obtener todas las propiedades
   */
  async getAllProperties(): Promise<any[]> {
    try {
      const response = await fetchWithRetry(`${API_URL}/api/public/properties`);
      
      if (response.ok) {
        return await response.json();
      }
      
      return [];
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
      const response = await fetchWithRetry(`${API_URL}/api/properties/type-summary`, {}, 1, 5000);
      
      if (response.ok) {
        return await response.json();
      }
      
      return [];
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
      const response = await fetchWithRetry(`${API_URL}/api/public/properties/featured`);
      
      if (response.ok) {
        return await response.json();
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      return [];
    }
  }

  /**
   * Obtener propiedad por slug - CON FALLBACK AUTOMÁTICO
   * 1. Intenta /summary (rápido)
   * 2. Si falla, intenta /slug/{slug} (completo)
   * 3. Solo lanza error si AMBOS fallan
   */
  async getPropertySummaryBySlug(slug: string): Promise<any> {
    try {
      // ESTRATEGIA 1: Endpoint optimizado /summary
      try {
        const response = await fetchWithRetry(
          `${API_URL}/api/public/properties/slug/${slug}/summary`,
          {},
          1, // Solo 1 reintento
          6000 // 6 segundos
        );
        
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.log('📍 /summary no disponible, probando endpoint completo...');
      }

      // ESTRATEGIA 2: Endpoint completo (más pesado pero más compatible)
      const response = await fetchWithRetry(
        `${API_URL}/api/public/properties/slug/${slug}`,
        {},
        2, // 2 reintentos
        10000 // 10 segundos
      );

      if (response.ok) {
        return await response.json();
      }

      if (response.status === 404) {
        throw new Error('PROPERTY_NOT_FOUND');
      }

      throw new Error(`HTTP_ERROR_${response.status}`);
    } catch (error: any) {
      if (error.message === 'TIMEOUT') {
        throw new Error('La propiedad está tardando en cargar. Intenta nuevamente.');
      }
      if (error.message === 'PROPERTY_NOT_FOUND') {
        throw new Error('Esta propiedad no está disponible');
      }
      console.error('Error fetching property:', error);
      throw new Error('No pudimos cargar la propiedad. Verifica tu conexión.');
    }
  }

  /**
   * Obtener galería (no crítico - retorna vacío si falla)
   */
  async getPropertyGallery(slug: string): Promise<any> {
    try {
      const response = await fetchWithRetry(
        `${API_URL}/api/public/properties/slug/${slug}/gallery`,
        {},
        1,
        5000
      );
      
      if (response.ok) {
        return await response.json();
      }
      
      return { galleryImages: [] };
    } catch (error) {
      return { galleryImages: [] };
    }
  }

  /**
   * Obtener amenidades (no crítico - retorna vacío si falla)
   */
  async getPropertyAmenities(slug: string): Promise<any> {
    try {
      const response = await fetchWithRetry(
        `${API_URL}/api/public/properties/slug/${slug}/amenities`,
        {},
        1,
        5000
      );
      
      if (response.ok) {
        return await response.json();
      }
      
      return { amenityIds: [], amenities: [] };
    } catch (error) {
      return { amenityIds: [], amenities: [] };
    }
  }

  /**
   * Obtener propiedad por slug (método directo)
   */
  async getPropertyBySlug(slug: string): Promise<any> {
    try {
      const response = await fetchWithRetry(
        `${API_URL}/api/public/properties/slug/${slug}`,
        {},
        2,
        10000
      );

      if (response.ok) {
        return await response.json();
      }

      if (response.status === 404) {
        throw new Error('PROPERTY_NOT_FOUND');
      }

      throw new Error(`HTTP_ERROR_${response.status}`);
    } catch (error: any) {
      if (error.message === 'TIMEOUT') {
        throw new Error('La propiedad está tardando en cargar. Intenta nuevamente.');
      }
      if (error.message === 'PROPERTY_NOT_FOUND') {
        throw new Error('Esta propiedad no está disponible');
      }
      throw new Error('No pudimos cargar la propiedad. Verifica tu conexión.');
    }
  }
  
  /**
   * Carga progresiva (mejor UX - muestra datos mientras carga el resto)
   */
  async getPropertyBySlugProgressive(slug: string): Promise<any> {
    try {
      // Cargar datos básicos primero
      const summary = await this.getPropertySummaryBySlug(slug);
      
      // Cargar detalles adicionales en paralelo (no bloquean)
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
      const response = await fetchWithRetry(
        `${API_URL}/api/public/properties/${id}`,
        {},
        2,
        10000
      );

      if (response.ok) {
        return await response.json();
      }

      if (response.status === 404) {
        throw new Error('PROPERTY_NOT_FOUND');
      }

      throw new Error(`HTTP_ERROR_${response.status}`);
    } catch (error: any) {
      if (error.message === 'TIMEOUT') {
        throw new Error('La propiedad está tardando en cargar. Intenta nuevamente.');
      }
      if (error.message === 'PROPERTY_NOT_FOUND') {
        throw new Error('Esta propiedad no está disponible');
      }
      throw new Error('No pudimos cargar la propiedad.');
    }
  }

  /**
   * Obtener resumen de categorías
   */
  async getCategorySummary(): Promise<any[]> {
    try {
      const response = await fetchWithRetry(
        `${API_URL}/api/public/properties/category-summary`,
        {},
        1,
        5000
      );
      
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
