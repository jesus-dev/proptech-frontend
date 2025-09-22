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

class DevelopmentService {
  // Obtener todos los desarrollos con filtros
  async getAllDevelopments(filters?: DevelopmentFilters): Promise<{ data: Development[]; total: number; page: number; size: number }> {
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
      
      // Si la respuesta es un array directo, convertirlo al formato esperado
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          total: response.data.length,
          page: 1,
          size: response.data.length
        };
      }
      
      // Si ya tiene el formato correcto, devolverlo
      return response.data as { data: Development[]; total: number; page: number; size: number };
    } catch (error) {
      console.error('Error fetching developments:', error);
      // Devolver un objeto vacío en lugar de lanzar error
      return {
        data: [],
        total: 0,
        page: 1,
        size: 0
      };
    }
  }

  // Obtener desarrollo por ID
  async getDevelopmentById(id: string): Promise<Development> {
    try {
      const response = await apiClient.get(`/api/developments/${id}`);
      return response.data as Development;
    } catch (error) {
      console.error('Error fetching development:', error);
      throw new Error('Error al obtener el desarrollo');
    }
  }

  // Crear nuevo desarrollo
  async createDevelopment(development: Omit<Development, 'id'>): Promise<Development> {
    try {
      const response = await apiClient.post('/api/developments', development);
      return response.data as Development;
    } catch (error) {
      console.error('Error creating development:', error);
      throw new Error('Error al crear el desarrollo');
    }
  }

  // Actualizar desarrollo
  async updateDevelopment(id: string, development: Partial<Development>): Promise<Development> {
    try {
      const response = await apiClient.put(`/api/developments/${id}`, development);
      return response.data as Development;
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
      return response.data as Development[];
    } catch (error) {
      console.error('Error fetching developments by type:', error);
      throw new Error('Error al obtener desarrollos por tipo');
    }
  }

  // Obtener desarrollos por ciudad
  async getDevelopmentsByCity(cityId: string): Promise<Development[]> {
    try {
      const response = await apiClient.get(`/api/developments/city/${cityId}`);
      return response.data as Development[];
    } catch (error) {
      console.error('Error fetching developments by city:', error);
      throw new Error('Error al obtener desarrollos por ciudad');
    }
  }

  // Buscar desarrollos por rango de precio
  async searchDevelopmentsByPriceRange(minPrice: number, maxPrice: number): Promise<Development[]> {
    try {
      const response = await apiClient.get(`/api/developments/search?minPrice=${minPrice}&maxPrice=${maxPrice}`);
      return response.data as Development[];
    } catch (error) {
      console.error('Error searching developments by price range:', error);
      throw new Error('Error al buscar desarrollos por rango de precio');
    }
  }

  // Obtener favoritos de un usuario
  async getFavoritesByUserId(userId: string): Promise<Development[]> {
    try {
      const response = await apiClient.get(`/api/developments/favorites/${userId}`);
      return response.data as Development[];
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
      return response.data as Development;
    } catch (error) {
      console.error('Error toggling featured:', error);
      throw new Error('Error al cambiar estado destacado');
    }
  }

  // Marcar como premium
  async togglePremium(developmentId: string, premium: boolean): Promise<Development> {
    try {
      const response = await apiClient.put(`/api/developments/${developmentId}`, { premium });
      return response.data as Development;
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
      return response.data as Development[];
    } catch (error) {
      console.error('Error fetching available developments:', error);
      throw new Error('Error al obtener desarrollos disponibles');
    }
  }

  // Obtener desarrollos vendidos
  async getSoldDevelopments(): Promise<Development[]> {
    try {
      const response = await apiClient.get('/api/developments?status=sold');
      return response.data as Development[];
    } catch (error) {
      console.error('Error fetching sold developments:', error);
      throw new Error('Error al obtener desarrollos vendidos');
    }
  }

  // Obtener desarrollos reservados
  async getReservedDevelopments(): Promise<Development[]> {
    try {
      const response = await apiClient.get('/api/developments?status=reserved');
      return response.data as Development[];
    } catch (error) {
      console.error('Error fetching reserved developments:', error);
      throw new Error('Error al obtener desarrollos reservados');
    }
  }

  // Obtener desarrollos destacados
  async getFeaturedDevelopments(): Promise<Development[]> {
    try {
      const response = await apiClient.get('/api/developments?featured=true');
      return response.data as Development[];
    } catch (error) {
      console.error('Error fetching featured developments:', error);
      throw new Error('Error al obtener desarrollos destacados');
    }
  }

  // Obtener desarrollos premium
  async getPremiumDevelopments(): Promise<Development[]> {
    try {
      const response = await apiClient.get('/api/developments?premium=true');
      return response.data as Development[];
    } catch (error) {
      console.error('Error fetching premium developments:', error);
      throw new Error('Error al obtener desarrollos premium');
    }
  }
}

export const developmentService = new DevelopmentService(); 