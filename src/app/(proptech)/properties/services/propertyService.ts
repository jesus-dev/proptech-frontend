import { apiClient } from '@/lib/api';
import { Property } from '../components/types';

export interface PropertyFilters {
  page?: number;
  size?: number;
  limit?: number;
  search?: string;
  propertyType?: string;
  propertyStatus?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  operacion?: 'SALE' | 'RENT' | 'BOTH';
  featured?: boolean;
  premium?: boolean;
}

export interface PropertyStatistics {
  totalProperties: number;
  availableProperties: number;
  soldProperties: number;
  rentedProperties: number;
  totalValue: number;
  averagePrice: number;
  featuredProperties: number;
  premiumProperties: number;
}

export interface PropertyCategorySummary {
  propertyType: string;
  count: number;
  averagePrice: number;
}

export interface PaginatedPropertiesResponse {
  properties: Property[];
  total: number;
  page: number;
  size: number;
}

// Función para transformar la respuesta del backend al formato del frontend
function transformPropertyResponse(backendProperty: any): Property {
  // Mapear galleryImages a images
  const mappedImages = backendProperty.images || 
    (backendProperty.galleryImages && Array.isArray(backendProperty.galleryImages) 
      ? backendProperty.galleryImages.map((img: any) => img.url) 
      : []) || [];

  // Si no hay featuredImage pero hay galleryImages, usar la primera como featuredImage
  let featuredImage = backendProperty.featuredImage;
  if (!featuredImage && mappedImages.length > 0) {
    featuredImage = mappedImages[0];
  }



  return {
    ...backendProperty,
    // Convertir el objeto currency a string (código de moneda) y guardar el ID
    currency: backendProperty.currency?.code || backendProperty.currency || "USD",
    currencyId: backendProperty.currency?.id || null,
    // Asegurar que los arrays estén definidos
    amenities: backendProperty.amenities || [],
    services: backendProperty.services || [],
    images: mappedImages,
    featuredImage: featuredImage, // Usar el featuredImage procesado
    privateFiles: backendProperty.privateFiles || [],
    // Mantener el valor original de operacion (SALE, RENT, BOTH)
    operacion: backendProperty.operacion,
    // Asegurar que los campos numéricos sean números
    price: Number(backendProperty.price) || 0,
    bedrooms: Number(backendProperty.bedrooms) || 0,
    bathrooms: Number(backendProperty.bathrooms) || 0,
    area: Number(backendProperty.area) || 0,
    parking: Number(backendProperty.parking) || Number(backendProperty.parkingSpaces) || 0,
    yearBuilt: Number(backendProperty.yearBuilt) || 0,
    // Mapear campos del backend a campos del frontend
    city: backendProperty.city || backendProperty.cityName || "",
    zip: backendProperty.zip || backendProperty.postalCode || "",
    // Asegurar que el tipo sea string
    type: backendProperty.type || backendProperty.propertyTypeName || "",
    status: backendProperty.status || backendProperty.propertyStatus || "active"
  };
}

class PropertyService {
  // Obtener todas las propiedades con filtros
  async getAllProperties(filters?: PropertyFilters): Promise<{ data: Property[]; total: number; page: number; size: number }> {
    try {
      const searchParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
      }
      
      const query = searchParams.toString();
      const response = await apiClient.get(`/api/properties${query ? `?${query}` : ''}`);
      const data = response.data as any;
      
      // Transformar las propiedades
      const transformedData = Array.isArray(data) ? data : (data.content || data.data || data.properties || []);
      const transformedProperties = transformedData.map(transformPropertyResponse);
      
      return {
        data: transformedProperties,
        total: data.totalElements || data.total || transformedProperties.length,
        page: data.number || data.page || 1,
        size: data.size || 20
      };
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw new Error('Error al obtener las propiedades');
    }
  }

  // Obtener propiedades paginadas
  async getPropertiesPaginated(filters?: PropertyFilters): Promise<PaginatedPropertiesResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
      }
      
      const query = searchParams.toString();
      const response = await apiClient.get(`/api/properties${query ? `?${query}` : ''}`);
      
      // Adaptar la respuesta del backend a nuestro formato
      const data = response.data as any;
      const transformedData = data.content || data.data || data.properties || data || [];
      const transformedProperties = transformedData.map(transformPropertyResponse);
      
      return {
        properties: transformedProperties,
        total: data.totalElements || data.total || 0,
        page: data.number || data.page || 1,
        size: data.size || 20
      };
    } catch (error) {
      console.error('Error fetching paginated properties:', error);
      throw new Error('Error al obtener las propiedades');
    }
  }

  // Obtener propiedad por ID
  async getPropertyById(id: string): Promise<Property> {
    try {
      const response = await apiClient.get(`/api/properties/${id}`);
      const backendProperty = response.data as any;
      return transformPropertyResponse(backendProperty);
    } catch (error: any) {
      console.error('Error fetching property:', error);
      if (error.response?.status === 404) {
        throw new Error(`La propiedad con ID ${id} no fue encontrada`);
      }
      throw new Error('Error al obtener la propiedad');
    }
  }

  // Crear nueva propiedad
  async createProperty(property: Omit<Property, 'id'>): Promise<Property> {
    try {
      const response = await apiClient.post('/api/properties', property);
      const backendProperty = response.data as any;
      return transformPropertyResponse(backendProperty);
    } catch (error) {
      console.error('Error creating property:', error);
      throw new Error('Error al crear la propiedad');
    }
  }

  // Actualizar propiedad
  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    try {
      const response = await apiClient.put(`/api/properties/${id}`, property);
      const backendProperty = response.data as any;
      return transformPropertyResponse(backendProperty);
    } catch (error) {
      console.error('Error updating property:', error);
      throw new Error('Error al actualizar la propiedad');
    }
  }

  // Eliminar propiedad
  async deleteProperty(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/properties/${id}`);
    } catch (error) {
      console.error('Error deleting property:', error);
      throw new Error('Error al eliminar la propiedad');
    }
  }

  // Obtener propiedades por tipo
  async getPropertiesByType(propertyTypeId: string): Promise<Property[]> {
    try {
      const response = await apiClient.get(`/api/properties/type/${propertyTypeId}`);
      const data = response.data as any[];
      return data.map(transformPropertyResponse);
    } catch (error) {
      console.error('Error fetching properties by type:', error);
      throw new Error('Error al obtener propiedades por tipo');
    }
  }

  // Obtener propiedades por ciudad
  async getPropertiesByCity(cityId: string): Promise<Property[]> {
    try {
      const response = await apiClient.get(`/api/properties/city/${cityId}`);
      const data = response.data as any[];
      return data.map(transformPropertyResponse);
    } catch (error) {
      console.error('Error fetching properties by city:', error);
      throw new Error('Error al obtener propiedades por ciudad');
    }
  }

  // Buscar propiedades por rango de precio
  async searchPropertiesByPriceRange(minPrice: number, maxPrice: number): Promise<Property[]> {
    try {
      const response = await apiClient.get(`/api/properties/search?minPrice=${minPrice}&maxPrice=${maxPrice}`);
      const data = response.data as any[];
      return data.map(transformPropertyResponse);
    } catch (error) {
      console.error('Error searching properties by price range:', error);
      throw new Error('Error al buscar propiedades por rango de precio');
    }
  }

  // Obtener favoritos de un usuario
  async getFavoritesByUserId(userId: string): Promise<Property[]> {
    try {
      const response = await apiClient.get(`/api/properties/favorites/${userId}`);
      const data = response.data as any[];
      return data.map(transformPropertyResponse);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw new Error('Error al obtener favoritos');
    }
  }

  // Obtener propiedades favoritas del usuario actual
  async getFavoriteProperties(): Promise<Property[]> {
    try {
      // Obtener el token de autenticación
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('No hay token de autenticación disponible');
        return [];
      }

      // Obtener información del usuario actual desde el token o hacer una llamada para obtener el usuario
      const userResponse = await apiClient.get('/api/auth/me');
      const user = userResponse.data;
      
      if (!user || !user.id) {
        console.warn('No se pudo obtener información del usuario');
        return [];
      }

      const response = await apiClient.get(`/api/properties/favorites/${user.id}`);
      const data = response.data as any[];
      return data.map(transformPropertyResponse);
    } catch (error: any) {
      console.error('Error fetching favorite properties:', error);
      
      // Si es un error de autenticación, devolver array vacío
      if (error.response?.status === 401) {
        console.warn('Usuario no autenticado');
        return [];
      }
      
      // Si es un error 404, significa que no hay favoritos o el endpoint no existe
      if (error.response?.status === 404) {
        console.warn('No se encontraron favoritos o el endpoint no existe');
        return [];
      }
      
      // Si es un error 500, probablemente es el problema de schema de la base de datos
      if (error.response?.status === 500) {
        console.warn('Error del servidor - posible problema de schema en property_favorites. Retornando array vacío.');
        return [];
      }
      
      // Para otros errores, devolver array vacío para evitar errores en la UI
      return [];
    }
  }

  // Agregar a favoritos
  async addToFavorites(propertyId: string, userId?: string): Promise<void> {
    try {
      let currentUserId = userId;
      
      if (!currentUserId) {
        // Obtener el usuario actual si no se proporciona userId
        const userResponse = await apiClient.get('/api/auth/me');
        const user = userResponse.data;
        currentUserId = user?.id;
        
        if (!currentUserId) {
          throw new Error('No se pudo obtener información del usuario');
        }
      }
      
      await apiClient.post(`/api/properties/${propertyId}/favorites/${currentUserId}`);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw new Error('Error al agregar a favoritos');
    }
  }
      
  // Remover de favoritos
  async removeFromFavorites(propertyId: string, userId?: string): Promise<void> {
    try {
      let currentUserId = userId;
      
      if (!currentUserId) {
        // Obtener el usuario actual si no se proporciona userId
        const userResponse = await apiClient.get('/api/auth/me');
        const user = userResponse.data;
        currentUserId = user?.id;
        
        if (!currentUserId) {
          throw new Error('No se pudo obtener información del usuario');
        }
      }
      
      await apiClient.delete(`/api/properties/${propertyId}/favorites/${currentUserId}`);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw new Error('Error al remover de favoritos');
    }
  }

  // Obtener estadísticas resumidas
  async getStatisticsSummary(): Promise<PropertyStatistics> {
    try {
      const response = await apiClient.get('/api/properties/statistics/summary');
      return response.data as PropertyStatistics;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw new Error('Error al obtener estadísticas');
    }
  }

  // Obtener estadísticas de una propiedad específica
  async getPropertyStats(propertyId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/properties/${propertyId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching property stats:', error);
      throw new Error('Error al obtener estadísticas de la propiedad');
    }
  }

  // Obtener resumen por categorías
  async getCategorySummary(): Promise<PropertyCategorySummary[]> {
    try {
      const response = await apiClient.get('/api/properties/category-summary');
      return response.data as PropertyCategorySummary[];
    } catch (error) {
      console.error('Error fetching category summary:', error);
      throw new Error('Error al obtener resumen por categorías');
    }
  }

  // Marcar como destacada
  async toggleFeatured(propertyId: string, featured: boolean): Promise<Property> {
    try {
      const response = await apiClient.put(`/api/properties/${propertyId}`, { featured });
      const backendProperty = response.data as any;
      return transformPropertyResponse(backendProperty);
    } catch (error) {
      console.error('Error toggling featured:', error);
      throw new Error('Error al cambiar estado destacado');
    }
  }

  // Marcar como premium
  async togglePremium(propertyId: string, premium: boolean): Promise<Property> {
    try {
      const response = await apiClient.put(`/api/properties/${propertyId}`, { premium });
      const backendProperty = response.data as any;
      return transformPropertyResponse(backendProperty);
    } catch (error) {
      console.error('Error toggling premium:', error);
      throw new Error('Error al cambiar estado premium');
    }
  }

  // Incrementar vistas
  async incrementViews(propertyId: string): Promise<void> {
    try {
      await apiClient.post(`/api/properties/${propertyId}/views`);
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw new Error('Error al incrementar vistas');
    }
  }

  // Método de prueba para verificar conectividad
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Probando conexión con el backend...');
      const response = await apiClient.get('/api/propiedades?limit=1');
      console.log('✅ Conexión exitosa:', response.status);
      return true;
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
  }



  // Búsqueda simple de propiedades
  async advancedSearch(filters: any): Promise<Property[]> {
    try {
      console.log('🔍 Búsqueda simple con filtros:', filters);
      
      // Siempre usar paginación para habilitar búsqueda de texto
      const searchParams = new URLSearchParams();
      searchParams.append('page', '1');
      searchParams.append('limit', '100'); // Límite alto para obtener todos los resultados
      
      if (filters.search) {
        searchParams.append('search', filters.search);
        console.log('📝 Agregando search:', filters.search);
      }
      if (filters.type) {
        searchParams.append('type', filters.type);
        console.log('📝 Agregando type:', filters.type);
      }
      if (filters.operation) {
        let operacionValue = filters.operation;
        if (filters.operation === 'venta') operacionValue = 'SALE';
        else if (filters.operation === 'alquiler') operacionValue = 'RENT';
        searchParams.append('operacion', operacionValue);
        console.log('📝 Agregando operacion:', operacionValue);
      }
      if (filters.city) {
        searchParams.append('city', filters.city);
        console.log('📝 Agregando city:', filters.city);
      }
      
      const url = `/api/properties?${searchParams.toString()}`;
      console.log('🌐 URL de búsqueda:', url);
      
      const response = await apiClient.get(url);
      console.log('📡 Respuesta del servidor:', response.data);
      
      // El backend devuelve un objeto con 'properties' array cuando usa paginación
      const properties = response.data.properties || [];
      console.log('✅ Propiedades encontradas:', properties.length);
      
      return properties;
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      throw new Error('Error al realizar la búsqueda');
    }
  }


}

export const propertyService = new PropertyService();