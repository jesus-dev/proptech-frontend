import { apiClient } from '@/lib/api';

export interface Owner {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  propertiesCount: number;
  totalValue: number;
  lastContact: string;
  status: 'active' | 'inactive' | 'pending';
  address?: string;
  documentNumber?: string;
  bankAccount?: string;
  notes?: string;
}

export interface PropertyMetrics {
  id: number;
  title: string;
  address: string;
  price: number;
  currency: string;
  views: number;
  favorites: number;
  comments: number;
  shares: number;
  lastActivity: string;
  status: 'active' | 'sold' | 'rented' | 'inactive';
  ownerId: number;
}

export interface OwnerReport {
  id: number;
  ownerId: number;
  period: string;
  generatedAt: string;
  propertiesCount: number;
  totalViews: number;
  totalFavorites: number;
  totalComments: number;
  totalShares: number;
  recommendations: string[];
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  emailSent?: boolean;
  pdfGenerated?: boolean;
}

export interface OwnerNotification {
  id: number;
  ownerId: number;
  type: 'report' | 'comment' | 'view' | 'favorite' | 'price_change' | 'system';
  title: string;
  message: string;
  sentAt: string;
  readAt?: string;
  status: 'pending' | 'sent' | 'failed';
}

export interface CreateOwnerRequest {
  name: string;
  email: string;
  phone: string;
  address?: string;
  documentNumber?: string;
  bankAccount?: string;
  notes?: string;
}

export interface UpdateOwnerRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  documentNumber?: string;
  bankAccount?: string;
  notes?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface GenerateReportRequest {
  ownerId: number;
  period: string;
  includeRecommendations?: boolean;
  sendEmail?: boolean;
  generatePDF?: boolean;
}

class OwnerService {
  // ===== PROPIETARIOS =====
  
  // Obtener todos los propietarios
  async getAllOwners(): Promise<Owner[]> {
    try {
      const response = await apiClient.get('/api/owners');
      return response.data;
    } catch (error) {
      console.error('Error fetching owners:', error);
      return [];
    }
  }

  // Obtener propietario por ID
  async getOwnerById(ownerId: number): Promise<Owner | null> {
    try {
      const response = await apiClient.get(`/api/owners/${ownerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching owner:', error);
      return null;
    }
  }

  // Crear nuevo propietario
  async createOwner(ownerData: CreateOwnerRequest): Promise<Owner | null> {
    try {
      const response = await apiClient.post('/api/owners', ownerData);
      return response.data;
    } catch (error) {
      console.error('Error creating owner:', error);
      return null;
    }
  }

  // Actualizar propietario
  async updateOwner(ownerId: number, ownerData: UpdateOwnerRequest): Promise<Owner | null> {
    try {
      const response = await apiClient.put(`/api/owners/${ownerId}`, ownerData);
      return response.data;
    } catch (error) {
      console.error('Error updating owner:', error);
      return null;
    }
  }

  // Eliminar propietario (soft delete)
  async deleteOwner(ownerId: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/owners/${ownerId}`);
      return true;
    } catch (error) {
      console.error('Error deleting owner:', error);
      return false;
    }
  }

  // ===== PROPIEDADES DEL PROPIETARIO =====
  
  // Obtener propiedades de un propietario
  async getOwnerProperties(ownerId: number): Promise<PropertyMetrics[]> {
    try {
      const response = await apiClient.get(`/api/owners/${ownerId}/properties`);
      return response.data;
    } catch (error) {
      console.error('Error fetching owner properties:', error);
      return [];
    }
  }

  // Obtener métricas de una propiedad específica
  async getPropertyMetrics(propertyId: number): Promise<PropertyMetrics | null> {
    try {
      const response = await apiClient.get(`/api/properties/${propertyId}/metrics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching property metrics:', error);
      return null;
    }
  }

  // ===== REPORTES =====
  
  // Obtener reportes de un propietario
  async getOwnerReports(ownerId: number): Promise<OwnerReport[]> {
    try {
      const response = await apiClient.get(`/api/owners/${ownerId}/reports`);
      return response.data;
    } catch (error) {
      console.error('Error fetching owner reports:', error);
      return [];
    }
  }

  // Generar reporte para un propietario
  async generateOwnerReport(reportData: GenerateReportRequest): Promise<OwnerReport | null> {
    try {
      const response = await apiClient.post('/api/owners/reports', reportData);
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      return null;
    }
  }

  // Enviar reporte por email
  async sendReportByEmail(reportId: number): Promise<boolean> {
    try {
      await apiClient.post(`/api/owners/reports/${reportId}/send`);
      return true;
    } catch (error) {
      console.error('Error sending report:', error);
      return false;
    }
  }

  // Descargar reporte en PDF
  async downloadReportPDF(reportId: number): Promise<Blob | null> {
    try {
      const response = await apiClient.get(`/api/owners/reports/${reportId}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading report PDF:', error);
      return null;
    }
  }

  // ===== NOTIFICACIONES =====
  
  // Obtener notificaciones de un propietario
  async getOwnerNotifications(ownerId: number): Promise<OwnerNotification[]> {
    try {
      const response = await apiClient.get(`/api/owners/${ownerId}/notifications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching owner notifications:', error);
      return [];
    }
  }

  // Enviar notificación personalizada
  async sendCustomNotification(ownerId: number, notification: Omit<OwnerNotification, 'id' | 'ownerId' | 'sentAt' | 'status'>): Promise<boolean> {
    try {
      await apiClient.post(`/api/owners/${ownerId}/notifications`, notification);
      return true;
    } catch (error) {
      console.error('Error sending custom notification:', error);
      return false;
    }
  }

  // Marcar notificación como leída
  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    try {
      await apiClient.put(`/api/owners/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // ===== MÉTRICAS Y ESTADÍSTICAS =====
  
  // Obtener métricas generales de propietarios
  async getOwnersMetrics(): Promise<{
    totalOwners: number;
    activeOwners: number;
    totalProperties: number;
    totalValue: number;
    averageViewsPerProperty: number;
    averageCommentsPerProperty: number;
  }> {
    try {
      const response = await apiClient.get('/api/owners/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching owners metrics:', error);
      return {
        totalOwners: 0,
        activeOwners: 0,
        totalProperties: 0,
        totalValue: 0,
        averageViewsPerProperty: 0,
        averageCommentsPerProperty: 0
      };
    }
  }

  // Obtener métricas de un propietario específico
  async getOwnerMetrics(ownerId: number): Promise<{
    propertiesCount: number;
    totalViews: number;
    totalFavorites: number;
    totalComments: number;
    totalShares: number;
    averagePrice: number;
    performanceScore: number;
  }> {
    try {
      const response = await apiClient.get(`/api/owners/${ownerId}/metrics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching owner metrics:', error);
      return {
        propertiesCount: 0,
        totalViews: 0,
        totalFavorites: 0,
        totalComments: 0,
        totalShares: 0,
        averagePrice: 0,
        performanceScore: 0
      };
    }
  }

  // ===== PROGRAMACIÓN AUTOMÁTICA =====
  
  // Configurar reportes automáticos
  async configureAutoReports(ownerId: number, config: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    sendEmail: boolean;
    generatePDF: boolean;
    includeRecommendations: boolean;
  }): Promise<boolean> {
    try {
      await apiClient.post(`/api/owners/${ownerId}/auto-reports`, config);
      return true;
    } catch (error) {
      console.error('Error configuring auto reports:', error);
      return false;
    }
  }

  // Obtener configuración de reportes automáticos
  async getAutoReportsConfig(ownerId: number): Promise<{
    frequency: 'weekly' | 'biweekly' | 'monthly';
    sendEmail: boolean;
    generatePDF: boolean;
    includeRecommendations: boolean;
    nextReportDate: string;
  } | null> {
    try {
      const response = await apiClient.get(`/api/owners/${ownerId}/auto-reports`);
      return response.data;
    } catch (error) {
      console.error('Error fetching auto reports config:', error);
      return null;
    }
  }

  // ===== RECOMENDACIONES =====
  
  // Obtener recomendaciones para un propietario
  async getOwnerRecommendations(ownerId: number): Promise<string[]> {
    try {
      const response = await apiClient.get(`/api/owners/${ownerId}/recommendations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching owner recommendations:', error);
      return [];
    }
  }

  // Generar recomendaciones automáticas
  async generateRecommendations(ownerId: number): Promise<string[]> {
    try {
      const response = await apiClient.post(`/api/owners/${ownerId}/recommendations`);
      return response.data;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }
}

export const ownerService = new OwnerService();
