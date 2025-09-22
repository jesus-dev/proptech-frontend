import { apiClient } from '@/lib/api';

export interface Notification {
  id: number;
  userId?: number;
  agentId?: number;
  propertyId?: number;
  title: string;
  message: string;
  type: 'PROPERTY_VIEW' | 'PROPERTY_FAVORITE' | 'PROPERTY_CONTACT' | 'PROPERTY_PRICE_CHANGE' | 'NEW_PROPERTY_SIMILAR' | 'MARKET_UPDATE' | 'SYSTEM_ALERT' | 'LEAD_SCORED' | 'APPOINTMENT_SCHEDULED' | 'APPOINTMENT_REMINDER';
  status: 'PENDING' | 'SENT' | 'UNREAD' | 'READ' | 'FAILED';
  channel: 'EMAIL' | 'PUSH' | 'SMS' | 'WHATSAPP' | 'DASHBOARD';
  readAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilters {
  type?: string[];
  status?: string[];
  channel?: string[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface UserNotifications {
  unreadCount: number;
  totalCount: number;
  notifications: Notification[];
}

class NotificationService {
  // Obtener todas las notificaciones del usuario (optimizado)
  async getUserNotifications(userId: number, filters?: NotificationFilters): Promise<UserNotifications> {
    const limit = filters?.limit || 50;
    try {
      // Usar el endpoint optimizado que devuelve notificaciones y conteo en una sola consulta
      const response = await apiClient.get(`/api/notifications/user/${userId}/optimized?limit=${limit}`);
      
      return {
        unreadCount: response.data.unreadCount || 0,
        totalCount: response.data.totalCount || 0,
        notifications: response.data.notifications || []
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return {
        unreadCount: 0,
        totalCount: 0,
        notifications: []
      };
    }
  }

  // Obtener notificaciones no leídas del usuario
  async getUnreadNotifications(userId: number, limit: number = 10): Promise<Notification[]> {
    try {
      // Usar el endpoint optimizado que ya devuelve solo notificaciones no leídas
      const response = await apiClient.get(`/api/notifications/user/${userId}/optimized?limit=${limit}`);
      
      // El backend ya filtra las notificaciones no leídas
      return response.data.notifications || [];
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      
      // Si es un error de red, verificar si el backend está disponible
      if (error instanceof Error && error.message.includes('Network Error')) {
        console.warn('Backend no disponible. Verifica que el servidor esté ejecutándose en http://localhost:8080');
      }
      
      return [];
    }
  }

  // Marcar notificación como leída
  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    await apiClient.put(`/api/notifications/${notificationId}/read`);
    return true;
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId: number): Promise<boolean> {
    await apiClient.put(`/api/notifications/user/${userId}/read-all`);
    return true;
  }

  // Obtener resumen de notificaciones para el dashboard
  async getNotificationsSummary(userId: number): Promise<{
    unreadCount: number;
    recentNotifications: Notification[];
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const response = await apiClient.get(`/api/notifications/user/${userId}/stats`);
    return response.data;
  }

  // Crear notificaciones de prueba
  async createTestNotifications(userId: number): Promise<boolean> {
    try {
      const response = await apiClient.post(`/api/notifications/user/${userId}/seed`);
      return response.data.success;
    } catch (error) {
      console.error('Error creating test notifications:', error);
      return false;
    }
  }


}

export const notificationService = new NotificationService();
