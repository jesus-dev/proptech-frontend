import { apiClient } from '@/lib/api';

export interface PriceHistory {
  id: string;
  propertyId: string;
  propertyTitle: string;
  date: string;
  price: number;
  change: number;
  changePercent: number;
  operation: 'SALE' | 'RENT';
  source: string;
}

export interface PriceHistoryFilters {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  operation?: 'SALE' | 'RENT';
  search?: string;
  reason?: string;
  source?: string;
}

export interface Property {
  id: string;
  title: string;
  type: string;
  city: string;
  currentPrice: number;
  operation: string;
}

class PriceHistoryService {
  // Obtener historial de precios con filtros
  async getPriceHistory(filters: PriceHistoryFilters = {}): Promise<PriceHistory[]> {
    try {
      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();
      
      if (filters.propertyId) {
        queryParams.append('propertyId', filters.propertyId);
      }
      if (filters.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        queryParams.append('endDate', filters.endDate);
      }
      if (filters.reason) {
        queryParams.append('reason', filters.reason);
      }
      if (filters.source) {
        queryParams.append('source', filters.source);
      }
      
      const url = `/api/properties/price-history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get(url);
      
      // Convertir datos del backend al formato del frontend
      const backendData = response.data || [];
      const frontendData: PriceHistory[] = backendData.map((item: any) => ({
        id: item.id.toString(),
        propertyId: item.propertyId.toString(),
        propertyTitle: item.propertyTitle || 'Propiedad sin título',
        date: item.date,
        price: parseFloat(item.price) || 0,
        change: parseFloat(item.changeAmount) || 0,
        changePercent: parseFloat(item.changePercent) || 0,
        operation: this.mapReasonToOperation(item.reason),
        source: item.source || 'Sistema'
      }));
      
      // Aplicar filtros adicionales en el frontend
      let filteredHistory = frontendData;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredHistory = filteredHistory.filter(h => 
          h.propertyTitle.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.operation) {
        filteredHistory = filteredHistory.filter(h => h.operation === filters.operation);
      }
      
      return filteredHistory;
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw error;
    }
  }
  
  // Método auxiliar para mapear razones del backend a operaciones del frontend
  private mapReasonToOperation(reason: string): 'SALE' | 'RENT' {
    if (!reason) return 'SALE';
    
    const reasonLower = reason.toLowerCase();
    if (reasonLower.includes('rent') || reasonLower.includes('alquiler')) {
      return 'RENT';
    }
    return 'SALE';
  }

  // Obtener propiedades para el filtro
  async getProperties(): Promise<Property[]> {
    try {
      // Obtener propiedades reales del backend
      const response = await apiClient.get('/api/properties');
      const backendProperties = response.data || [];
      
      // Convertir datos del backend al formato del frontend
      const frontendProperties: Property[] = backendProperties.map((property: any) => ({
        id: property.id.toString(),
        title: property.title || 'Propiedad sin título',
        type: property.propertyTypeName || property.type || 'Propiedad',
        city: property.cityName || property.city || 'Ciudad no especificada',
        currentPrice: parseFloat(property.price) || 0,
        operation: property.operacion || property.operation || 'SALE'
      }));
      
      return frontendProperties;
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Sin datos ficticios: retornar vacío
      return [];
    }
  }

  // Crear nuevo registro de historial de precios
  async createPriceHistory(data: Omit<PriceHistory, 'id'>): Promise<PriceHistory> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('propertyId', data.propertyId);
      searchParams.append('price', data.price.toString());
      searchParams.append('reason', data.operation);
      searchParams.append('source', data.source);
      searchParams.append('createdBy', 'user'); // TODO: Obtener del contexto de usuario
      
      const url = `/api/properties/price-history?${searchParams.toString()}`;
      const response = await apiClient.post(url);
      
      const newRecord = response.data;
      return {
        id: newRecord.id.toString(),
        propertyId: newRecord.propertyId.toString(),
        propertyTitle: newRecord.propertyTitle,
        date: newRecord.date,
        price: newRecord.price,
        change: newRecord.changeAmount || 0,
        changePercent: newRecord.changePercent || 0,
        operation: newRecord.reason || 'OTHER',
        source: newRecord.source || 'Sistema'
      };
    } catch (error) {
      console.error('Error creating price history:', error);
      throw new Error('Error al crear el registro de historial');
    }
  }

  // Actualizar registro de historial de precios
  async updatePriceHistory(id: string, data: Partial<PriceHistory>): Promise<PriceHistory> {
    try {
      // Sin simulación: si no existe endpoint backend, fallar explícitamente
      throw new Error('UPDATE_NOT_IMPLEMENTED');
    } catch (error) {
      console.error('Error updating price history:', error);
      throw new Error('Error al actualizar el registro de historial');
    }
  }

  // Eliminar registro de historial de precios
  async deletePriceHistory(id: string): Promise<void> {
    try {
      // Sin simulación: si no existe endpoint backend, fallar explícitamente
      throw new Error('DELETE_NOT_IMPLEMENTED');
    } catch (error) {
      console.error('Error deleting price history:', error);
      throw new Error('Error al eliminar el registro de historial');
    }
  }

  // Obtener estadísticas de precios
  async getPriceStatistics(propertyId?: string): Promise<{
    averagePrice: number;
    maxPrice: number;
    minPrice: number;
    totalRecords: number;
    priceTrend: 'up' | 'down' | 'stable';
  }> {
    try {
      // TEMPORAL: Calcular estadísticas desde el historial simulado
      const history = await this.getPriceHistory({ propertyId });
      
      if (history.length === 0) {
        return {
          averagePrice: 0,
          maxPrice: 0,
          minPrice: 0,
          totalRecords: 0,
          priceTrend: 'stable'
        };
      }
      
      const prices = history.map(h => h.price);
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      
      // Calcular tendencia basada en los últimos cambios
      const recentChanges = history.slice(-3).map(h => h.change);
      const avgChange = recentChanges.reduce((sum, change) => sum + change, 0) / recentChanges.length;
      
      let priceTrend: 'up' | 'down' | 'stable' = 'stable';
      if (avgChange > 1000000) priceTrend = 'up';
      else if (avgChange < -1000000) priceTrend = 'down';
      
      return {
        averagePrice,
        maxPrice,
        minPrice,
        totalRecords: history.length,
        priceTrend
      };
    } catch (error) {
      console.error('Error fetching price statistics:', error);
      throw new Error('Error al obtener las estadísticas de precios');
    }
  }
}

export const priceHistoryService = new PriceHistoryService();
