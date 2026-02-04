import { apiClient } from '@/lib/api';
import { Property } from '../components/types';
import { normalizePropertyStatus as normalizePropertyStatusValue } from '../utils/status';

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
  minArea?: number;
  maxArea?: number;
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
  const mappedImages = backendProperty.images || 
    (backendProperty.galleryImages && Array.isArray(backendProperty.galleryImages) 
      ? backendProperty.galleryImages.map((img: any) => img.url) 
      : []) || [];

  // Si no hay featuredImage pero hay galleryImages, usar la primera como featuredImage
  let featuredImage = backendProperty.featuredImage;
  if (!featuredImage && mappedImages.length > 0) {
    featuredImage = mappedImages[0];
  }

  // Normalizar código de moneda usando SOLO los datos que vienen del backend
  // Prioridad: currencyCode directo > currency.code > fallback a USD
  let currencyCode = "USD"; // fallback por defecto
  
  // 1. Primero intentar con currencyCode directo del backend
  if (backendProperty.currencyCode && typeof backendProperty.currencyCode === 'string') {
    currencyCode = backendProperty.currencyCode;
  }
  // 2. Si no existe, intentar extraer del objeto currency
  else if (backendProperty.currency) {
    if (typeof backendProperty.currency === 'object' && backendProperty.currency.code) {
      currencyCode = backendProperty.currency.code;
    } else if (typeof backendProperty.currency === 'string') {
      currencyCode = backendProperty.currency;
    }
  }
  
  // Convertir a mayúsculas para asegurar consistencia
  currencyCode = currencyCode.toString().toUpperCase();
  
  // Validar que sea una moneda soportada
  const validCurrencies = ['USD', 'ARS', 'EUR', 'PYG', 'MXN', 'BRL'];
  if (!validCurrencies.includes(currencyCode)) {
    console.warn(`⚠️ Moneda no soportada recibida del backend: "${currencyCode}". Usando USD como fallback.`);
    console.warn(`   Considera agregar esta moneda al array de monedas soportadas en utils.ts`);
    currencyCode = 'USD';
  }
  
  // Log para debugging (solo en desarrollo) - comentado para reducir ruido
  // if (process.env.NODE_ENV === 'development') {
  //     currencyIdFromBackend: backendProperty.currencyId,
  //     currencyCodeFromBackend: backendProperty.currencyCode,
  //     currencyObjectFromBackend: backendProperty.currency,
  //     finalCurrencyCode: currencyCode
  //   });
  // }
  const statusCandidates: Array<string | undefined> = [
    backendProperty.propertyStatusLabel,
    backendProperty.statusLabel,
    backendProperty.propertyStatusName,
    backendProperty.statusName,
    backendProperty.statusText,
    backendProperty.propertyStatusText,
    typeof backendProperty.propertyStatus === 'object' && backendProperty.propertyStatus !== null
      ? (backendProperty.propertyStatus.label ||
         backendProperty.propertyStatus.name ||
         backendProperty.propertyStatus.status ||
         backendProperty.propertyStatus.code)
      : undefined,
    backendProperty.status,
    backendProperty.propertyStatus,
    backendProperty.state
  ];

  const rawStatus = statusCandidates.find((candidate) => typeof candidate === 'string' && candidate.trim().length > 0);
  const normalizedStatus = normalizePropertyStatusValue(rawStatus);

  const resolvedNeighborhoodId: number | undefined = (() => {
    if (backendProperty.neighborhoodId != null) return Number(backendProperty.neighborhoodId);
    if (backendProperty.neighborhood?.id != null) return Number(backendProperty.neighborhood.id);
    if (typeof backendProperty.neighborhood === 'object' && backendProperty.neighborhood !== null && backendProperty.neighborhood.neighborhoodId != null) {
      return Number(backendProperty.neighborhood.neighborhoodId);
    }
    return undefined;
  })();

  const resolvedNeighborhoodName: string = (() => {
    if (typeof backendProperty.neighborhood === 'string') return backendProperty.neighborhood;
    if (backendProperty.neighborhood?.name) return backendProperty.neighborhood.name;
    if (backendProperty.neighborhoodName) return backendProperty.neighborhoodName;
    if (backendProperty.neighborhood?.nombre) return backendProperty.neighborhood.nombre;
    return '';
  })();

  return {
    ...backendProperty,
    id: backendProperty.id != null ? String(backendProperty.id) : '',
    // Convertir el objeto currency a string (código de moneda) y guardar el ID
    currency: currencyCode,
    currencyId: backendProperty.currencyId || backendProperty.currency?.id || null,
    // Asegurar que los arrays estén definidos
    amenities: backendProperty.amenities || [],
    services: backendProperty.services || [],
    images: mappedImages,
    featuredImage: featuredImage, // Usar el featuredImage procesado
    privateFiles: backendProperty.privateFiles || [],
    // Mapear additionalPropertyTypeIds del backend a additionalPropertyTypes del frontend
    additionalPropertyTypes: backendProperty.additionalPropertyTypeIds && Array.isArray(backendProperty.additionalPropertyTypeIds)
      ? backendProperty.additionalPropertyTypeIds.map((id: number) => id.toString())
      : [],
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
    cityId: backendProperty.cityId || undefined,
    neighborhood: resolvedNeighborhoodName,
    neighborhoodId: resolvedNeighborhoodId,
    zip: backendProperty.zip || backendProperty.postalCode || "",
    // Asegurar que el tipo sea string
    type: backendProperty.type || backendProperty.propertyTypeName || "",
    floorPlans: Array.isArray(backendProperty.floorPlans)
      ? backendProperty.floorPlans.map((plan: any) => ({
          id: plan.id,
          title: plan.title ?? '',
          bedrooms: plan.bedrooms != null ? Number(plan.bedrooms) : 0,
          bathrooms: plan.bathrooms != null ? Number(plan.bathrooms) : 0,
          price: plan.price != null ? Number(plan.price) : 0,
          size: plan.size != null ? Number(plan.size) : 0,
          image: plan.image ?? undefined,
          description: plan.description ?? '',
          currencyId: plan.currencyId != null ? Number(plan.currencyId) : undefined,
          currency: plan.currencyCode ?? plan.currency ?? undefined,
        }))
      : [],
    statusRaw: rawStatus || backendProperty.status || backendProperty.propertyStatus || null,
    status: normalizedStatus
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
    } catch (error: any) {
      const data = error?.response?.data;
      const msg = typeof data === 'string' ? data : (data?.error ?? data?.message ?? error?.message);
      console.error('Error creating property:', { status: error?.response?.status, data }, error);
      throw new Error(typeof msg === 'string' ? msg : 'Error al crear la propiedad');
    }
  }

  // Actualizar propiedad
  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    try {
      const response = await apiClient.put(`/api/properties/${id}`, property);
      const backendProperty = response.data as any;
      return transformPropertyResponse(backendProperty);
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      let msg: string = '';
      if (typeof data === 'string') {
        msg = data.length > 200 ? data.slice(0, 200) + '…' : data;
      } else if (data && typeof data === 'object') {
        msg = (data.error ?? data.message ?? data.details ?? data.msg) ?? '';
        if (typeof msg !== 'string') msg = JSON.stringify(msg);
      }
      if (!msg) msg = error?.message ?? '';
      if (!msg) msg = `Error al actualizar la propiedad (${status ?? 'sin respuesta'})`;
      console.error('Error updating property:', { status, data }, error);
      throw new Error(msg);
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
      // Silencioso - el endpoint puede no estar disponible temporalmente
      console.debug('Error incrementing views (silencioso):', error);
    }
  }

  // Publicar propiedad (cambiar de DRAFT a ACTIVE)
  async publishProperty(propertyId: string): Promise<Property> {
    try {
      const response = await apiClient.post(`/api/properties/${propertyId}/publish`);
      const transformedProperty = transformPropertyResponse(response.data);
      return transformedProperty;
    } catch (error) {
      console.error('❌ Error al publicar propiedad:', error);
      throw new Error('Error al publicar la propiedad');
    }
  }

  // Método de prueba para verificar conectividad
  async testConnection(): Promise<boolean> {
    try {
      const response = await apiClient.get('/api/propiedades?limit=1');
      return true;
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
  }



  // Búsqueda simple de propiedades
  async advancedSearch(filters: any): Promise<Property[]> {
    try {
      
      // Siempre usar paginación para habilitar búsqueda de texto
      const searchParams = new URLSearchParams();
      searchParams.append('page', '1');
      searchParams.append('limit', '100'); // Límite alto para obtener todos los resultados
      
      if (filters.search) {
        searchParams.append('search', filters.search);
      }
      if (filters.type) {
        searchParams.append('type', filters.type);
      }
      if (filters.operation) {
        let operacionValue = filters.operation;
        if (filters.operation === 'venta') operacionValue = 'SALE';
        else if (filters.operation === 'alquiler') operacionValue = 'RENT';
        searchParams.append('operacion', operacionValue);
      }
      if (filters.city) {
        searchParams.append('city', filters.city);
      }
      
      const url = `/api/properties?${searchParams.toString()}`;
      
      const response = await apiClient.get(url);
      
      // El backend devuelve un objeto con 'properties' array cuando usa paginación
      const properties = response.data.properties || [];
      
      return properties;
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      throw new Error('Error al realizar la búsqueda');
    }
  }


}

export const propertyService = new PropertyService();