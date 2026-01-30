import { apiClient } from '@/lib/api';
import { Development } from '../components/types';

export interface DevelopmentFilters {
  page?: number;
  size?: number;
  search?: string;
  type?: string;
  status?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  premium?: boolean;
}

export interface DevelopmentStatistics {
  totalDevelopments: number;
  availableDevelopments: number;
  soldDevelopments: number;
  reservedDevelopments: number;
  totalValue: number;
  averagePrice: number;
  totalViews: number;
  totalFavorites: number;
  recentActivity: number;
}

export interface DevelopmentTypeStats {
  type: string;
  count: number;
  percentage: number;
  averagePrice: number;
}

// Helper function to normalize development type from backend format to frontend format
function normalizeDevelopmentType(type: string): string {
  if (!type) return type;
  // Convert backend enum values (UPPERCASE) to frontend format (lowercase)
  const typeMap: { [key: string]: string } = {
    'LOTEAMIENTO': 'loteamiento',
    'EDIFICIO': 'edificio',
    'CONDOMINIO': 'condominio',
    'BARRIO_CERRADO': 'barrio_cerrado'
  };
  return typeMap[type.toUpperCase()] || type.toLowerCase();
}

// Helper function to normalize development status from backend format to frontend format
function normalizeDevelopmentStatus(status: string): string {
  if (!status) return status;
  const statusMap: { [key: string]: string } = {
    'AVAILABLE': 'available',
    'SOLD': 'sold',
    'RESERVED': 'reserved',
    'RENTED': 'rented',
  };
  return statusMap[status.toUpperCase()] || status.toLowerCase();
}

// Helper function to normalize a development object
function normalizeDevelopment(dev: any): Development {
  if (!dev) return dev;
  
  // Normalizar currency si viene como objeto
  let normalizedCurrency = dev.currency;
  let currencyId = undefined;
  
  if (dev.currency && typeof dev.currency === 'object') {
    normalizedCurrency = dev.currency.code || dev.currency.name || '';
    currencyId = dev.currency.id;
  }
  
  return {
    ...dev,
    type: normalizeDevelopmentType(dev.type),
    status: normalizeDevelopmentStatus(dev.status),
    currency: normalizedCurrency,
    currencyId: currencyId || (dev as any).currencyId
  };
}

// Helper function to normalize an array of developments
function normalizeDevelopments(developments: any[]): Development[] {
  if (!Array.isArray(developments)) return [];
  return developments.map(normalizeDevelopment);
}

export interface GetAllDevelopmentsResult {
  data: Development[];
  total: number;
  page: number;
  size: number;
  error?: boolean;
  statusCode?: number;
  message?: string;
}

class DevelopmentService {
  // Obtener todos los desarrollos con filtros
  async getAllDevelopments(filters?: DevelopmentFilters): Promise<GetAllDevelopmentsResult> {
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
      const response = await apiClient.get(`/api/developments${query ? `?${query}` : ''}`);
      
      // Backend devuelve array directo (Response.ok(developments).build())
      if (Array.isArray(response.data)) {
        return {
          data: normalizeDevelopments(response.data),
          total: response.data.length,
          page: 1,
          size: response.data.length
        };
      }
      
      // Si viene con formato { data: [] }, normalizar
      const normalizedData = {
        ...response.data,
        data: normalizeDevelopments(response.data?.data || [])
      };
      return normalizedData as GetAllDevelopmentsResult;
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      const code = error?.code;
      console.error('[developmentService] Error fetching developments:', { status, data, code, message: error?.message }, error);
      return {
        data: [],
        total: 0,
        page: 1,
        size: 0,
        error: true,
        statusCode: status,
        message: error?.message
      };
    }
  }

  // Obtener desarrollo por ID
  async getDevelopmentById(id: string): Promise<Development> {
    try {
      const response = await apiClient.get(`/api/developments/${id}`);
      return normalizeDevelopment(response.data) as Development;
    } catch (error) {
      console.error('Error fetching development:', error);
      throw new Error('Error al obtener el desarrollo');
    }
  }

  // Crear nuevo desarrollo
  async createDevelopment(development: Omit<Development, 'id'>): Promise<Development> {
    try {
      console.log('📤 [developmentService] Enviando desarrollo:', {
        type: development.type,
        status: development.status,
        title: development.title,
        city: development.city,
        address: development.address,
        price: development.price,
        currency: (development as any).currency
      });
      
      const response = await apiClient.post('/api/developments', development);
      console.log('✅ [developmentService] Desarrollo creado exitosamente:', response.data);
      return normalizeDevelopment(response.data) as Development;
    } catch (error: any) {
      console.error('❌ [developmentService] Error creating development:', error);
      console.error('   - Status:', error.response?.status);
      console.error('   - Status Text:', error.response?.statusText);
      console.error('   - Data:', error.response?.data);
      console.error('   - Message:', error.message);
      
      // Extraer mensaje de error del backend si está disponible
      let errorMessage = 'Error al crear el desarrollo';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Actualizar desarrollo
  async updateDevelopment(id: string, development: Partial<Development>): Promise<Development> {
    try {
      const response = await apiClient.put(`/api/developments/${id}`, development);
      return normalizeDevelopment(response.data) as Development;
    } catch (error) {
      console.error('Error updating development:', error);
      throw new Error('Error al actualizar el desarrollo');
    }
  }

  // Eliminar desarrollo
  async deleteDevelopment(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/developments/${id}`);
    } catch (error) {
      console.error('Error deleting development:', error);
      throw new Error('Error al eliminar el desarrollo');
    }
  }

  // Obtener desarrollos por tipo
  async getDevelopmentsByType(propertyTypeId: string): Promise<Development[]> {
    try {
      const response = await apiClient.get(`/api/developments/type/${propertyTypeId}`);
      return normalizeDevelopments(response.data || []);
    } catch (error) {
      console.error('Error fetching developments by type:', error);
      throw new Error('Error al obtener desarrollos por tipo');
    }
  }

  // Obtener desarrollos por ciudad
  async getDevelopmentsByCity(cityId: string): Promise<Development[]> {
    try {
      const response = await apiClient.get(`/api/developments/city/${cityId}`);
      return normalizeDevelopments(response.data || []);
    } catch (error) {
      console.error('Error fetching developments by city:', error);
      throw new Error('Error al obtener desarrollos por ciudad');
    }
  }

  // Buscar desarrollos por rango de precio
  async searchDevelopmentsByPriceRange(minPrice: number, maxPrice: number): Promise<Development[]> {
    try {
      const response = await apiClient.get(`/api/developments/search?minPrice=${minPrice}&maxPrice=${maxPrice}`);
      return normalizeDevelopments(response.data || []);
    } catch (error) {
      console.error('Error searching developments by price range:', error);
      throw new Error('Error al buscar desarrollos por rango de precio');
    }
  }

  // Obtener favoritos de un usuario
  async getFavoritesByUserId(userId: string): Promise<Development[]> {
    try {
      const response = await apiClient.get(`/api/developments/favorites/${userId}`);
      return normalizeDevelopments(response.data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw new Error('Error al obtener favoritos');
    }
  }

  // Agregar a favoritos
  async addToFavorites(developmentId: string, userId: string): Promise<void> {
    try {
      await apiClient.post(`/api/developments/${developmentId}/favorites/${userId}`);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw new Error('Error al agregar a favoritos');
    }
  }

  // Remover de favoritos
  async removeFromFavorites(developmentId: string, userId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/developments/${developmentId}/favorites/${userId}`);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw new Error('Error al remover de favoritos');
    }
  }

  // Obtener estadísticas resumidas
  async getStatisticsSummary(): Promise<DevelopmentStatistics> {
    try {
      const response = await apiClient.get('/api/developments/statistics/summary');
      return response.data as DevelopmentStatistics;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw new Error('Error al obtener estadísticas');
    }
  }

  // Obtener estadísticas de un desarrollo específico
  async getDevelopmentStats(developmentId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/developments/${developmentId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching development stats:', error);
      throw new Error('Error al obtener estadísticas del desarrollo');
    }
  }

  // Obtener resumen por categorías
  async getCategorySummary(): Promise<DevelopmentTypeStats[]> {
    try {
      const response = await apiClient.get('/api/developments/category-summary');
      return response.data as DevelopmentTypeStats[];
    } catch (error) {
      console.error('Error fetching category summary:', error);
      throw new Error('Error al obtener resumen por categorías');
    }
  }

  // Marcar como destacado
  async toggleFeatured(developmentId: string, featured: boolean): Promise<Development> {
    try {
      const response = await apiClient.put(`/api/developments/${developmentId}`, { featured });
      return normalizeDevelopment(response.data) as Development;
    } catch (error) {
      console.error('Error toggling featured:', error);
      throw new Error('Error al cambiar estado destacado');
    }
  }

  // Marcar como premium
  async togglePremium(developmentId: string, premium: boolean): Promise<Development> {
    try {
      const response = await apiClient.put(`/api/developments/${developmentId}`, { premium });
      return normalizeDevelopment(response.data) as Development;
    } catch (error) {
      console.error('Error toggling premium:', error);
      throw new Error('Error al cambiar estado premium');
    }
  }

  // Incrementar vistas
  async incrementViews(developmentId: string): Promise<void> {
    try {
      await apiClient.post(`/api/developments/${developmentId}/views`);
    } catch (error) {
      console.error('Error incrementing views:', error);
      // No lanzar error para no interrumpir la experiencia del usuario
    }
  }

  // Incrementar favoritos
  async incrementFavorites(developmentId: string): Promise<void> {
    try {
      await apiClient.post(`/api/developments/${developmentId}/favorites-count`);
    } catch (error) {
      console.error('Error incrementing favorites count:', error);
      // No lanzar error para no interrumpir la experiencia del usuario
    }
  }

  // Incrementar compartidos
  async incrementShares(developmentId: string): Promise<void> {
    try {
      await apiClient.post(`/api/developments/${developmentId}/shares`);
    } catch (error) {
      console.error('Error incrementing shares:', error);
      // No lanzar error para no interrumpir la experiencia del usuario
    }
  }

  // Métodos específicos para desarrollos
  async getLoteamientos(): Promise<Development[]> {
    return this.getDevelopmentsByType('loteamiento');
  }

  async getEdificios(): Promise<Development[]> {
    return this.getDevelopmentsByType('edificio');
  }

  async getCondominios(): Promise<Development[]> {
    return this.getDevelopmentsByType('condominio');
  }

  async getBarriosCerrados(): Promise<Development[]> {
    return this.getDevelopmentsByType('barrio_cerrado');
  }

  // Obtener desarrollos disponibles
  async getAvailableDevelopments(): Promise<Development[]> {
    try {
      const response = await apiClient.get('/api/developments?status=available');
      return normalizeDevelopments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching available developments:', error);
      throw new Error('Error al obtener desarrollos disponibles');
    }
  }

  // Obtener desarrollos vendidos
  async getSoldDevelopments(): Promise<Development[]> {
    try {
      const response = await apiClient.get('/api/developments?status=sold');
      return normalizeDevelopments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching sold developments:', error);
      throw new Error('Error al obtener desarrollos vendidos');
    }
  }

  // Obtener desarrollos reservados
  async getReservedDevelopments(): Promise<Development[]> {
    try {
      const response = await apiClient.get('/api/developments?status=reserved');
      return normalizeDevelopments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching reserved developments:', error);
      throw new Error('Error al obtener desarrollos reservados');
    }
  }

  // Obtener desarrollos destacados
  async getFeaturedDevelopments(): Promise<Development[]> {
    try {
      const response = await apiClient.get('/api/developments?featured=true');
      return normalizeDevelopments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching featured developments:', error);
      throw new Error('Error al obtener desarrollos destacados');
    }
  }

  // Obtener desarrollos premium
  async getPremiumDevelopments(): Promise<Development[]> {
    try {
      const response = await apiClient.get('/api/developments?premium=true');
      return normalizeDevelopments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching premium developments:', error);
      throw new Error('Error al obtener desarrollos premium');
    }
  }
}

export const developmentService = new DevelopmentService(); 