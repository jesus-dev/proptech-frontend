import { Property } from '@/types/property';
import { getEndpoint } from '@/lib/api-config';

export interface SyncResult {
  success: boolean;
  message: string;
  wordpressId?: number;
  error?: string;
}

export class HouzezSyncService {
  /**
   * Sincroniza una propiedad con Houzez
   */
  async syncPropertyToHouzez(propertyId: string): Promise<SyncResult> {
    try {
      const response = await fetch(getEndpoint(`/api/properties/${propertyId}/sync`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          message: 'Error al sincronizar',
          error: errorText,
        };
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Propiedad sincronizada exitosamente',
        wordpressId: result.wordpressId,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Sincroniza todas las propiedades pendientes
   */
  async syncAllPendingProperties(): Promise<SyncResult[]> {
    try {
      const response = await fetch(getEndpoint('/api/properties/sync/all'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return [{
          success: false,
          message: 'Error al sincronizar todas las propiedades',
          error: errorText,
        }];
      }

      const results = await response.json();
      return results;
    } catch (error) {
      return [{
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Error desconocido',
      }];
    }
  }

  /**
   * Elimina una propiedad de Houzez
   */
  async deletePropertyFromHouzez(propertyId: string): Promise<SyncResult> {
    try {
      const response = await fetch(getEndpoint(`/api/properties/${propertyId}/sync`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          message: 'Error al eliminar de Houzez',
          error: errorText,
        };
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Propiedad eliminada de Houzez exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene el estado de sincronización de una propiedad
   */
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

  /**
   * Obtiene el texto descriptivo del estado de sincronización
   */
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

  /**
   * Obtiene el color del estado de sincronización
   */
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