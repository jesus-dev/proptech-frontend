/**
 * Servicio de Sincronización Houzez
 * Usa apiClient que YA TIENE reintentos automáticos
 */

import { Property } from '@/types/property';
import { apiClient } from '@/lib/api';

export interface SyncResult {
  success: boolean;
  message: string;
  wordpressId?: number;
  error?: string;
}

export class HouzezSyncService {
  async syncPropertyToHouzez(propertyId: string): Promise<SyncResult> {
    try {
      const response = await apiClient.post(`/api/properties/${propertyId}/sync`);
      const result = response.data;
      
      return {
        success: true,
        message: result.message || 'Propiedad sincronizada exitosamente',
        wordpressId: result.wordpressId,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al sincronizar',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  async syncAllPendingProperties(): Promise<SyncResult[]> {
    try {
      const response = await apiClient.post('/api/properties/sync/all');
      return response.data;
    } catch (error) {
      return [{
        success: false,
        message: 'Error al sincronizar todas las propiedades',
        error: error instanceof Error ? error.message : 'Error desconocido',
      }];
    }
  }

  async deletePropertyFromHouzez(propertyId: string): Promise<SyncResult> {
    try {
      const response = await apiClient.delete(`/api/properties/${propertyId}/sync`);
      const result = response.data;
      
      return {
        success: true,
        message: result.message || 'Propiedad eliminada de Houzez exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al eliminar de Houzez',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  getSyncStatus(property: Property): {
    status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'MANUAL' | 'DELETED' | 'DELETE_FAILED';
    hasWordPressId: boolean;
    error?: string;
  } {
    return {
      status: (property.syncStatus as any) || 'MANUAL',
      hasWordPressId: !!property.wordpressId,
      error: property.syncError,
    };
  }

  getSyncStatusText(property: Property): string {
    const status = this.getSyncStatus(property);
    
    switch (status.status) {
      case 'SUCCESS':
        return 'Sincronizado con Houzez';
      case 'PENDING':
        return 'Pendiente de sincronización';
      case 'FAILED':
        return 'Error de sincronización';
      case 'MANUAL':
        return 'Sincronización manual';
      case 'DELETED':
        return 'Eliminado de Houzez';
      case 'DELETE_FAILED':
        return 'Error al eliminar de Houzez';
      default:
        return 'Estado desconocido';
    }
  }

  getSyncStatusColor(property: Property): string {
    const status = this.getSyncStatus(property);
    
    switch (status.status) {
      case 'SUCCESS':
        return 'text-green-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'FAILED':
      case 'DELETE_FAILED':
        return 'text-red-600';
      case 'MANUAL':
        return 'text-gray-600';
      case 'DELETED':
        return 'text-gray-500';
      default:
        return 'text-gray-600';
    }
  }
}

export const houzezSyncService = new HouzezSyncService();
