import { apiClient } from '@/lib/api';

export interface SystemStats {
  totalProperties: number;
  activeProperties: number;
  totalUsers: number;
  activeUsers: number;
  totalViews: number;
  totalFavorites: number;
  monthlyRevenue: number;
  pendingTasks: number;
  totalAgents: number;
  totalCustomers: number;
  totalDevelopments: number;
  totalContracts: number;
  systemUptime: number;
  averageResponseTime: number;
}

export interface AgentStats {
  myProperties: number;
  activeLeads: number;
  todayAppointments: number;
  weekAppointments: number;
  monthCommissions: number;
  conversionRate: number;
  avgResponseTime: number; // en minutos
  propertiesNeedingAttention: number;
  newLeadsToday: number;
  closedDealsMonth: number;
  activeClients: number;
  avgDaysToClose: number;
}

export interface AgentLead {
  id: number;
  clientName: string;
  email: string;
  phone?: string;
  propertyId?: number;
  propertyTitle?: string;
  status: 'new' | 'contacted' | 'viewing_scheduled' | 'negotiating' | 'closed' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  createdAt: string;
  lastContactDate?: string;
  notes?: string;
  estimatedValue?: number;
}

export interface AgentAppointment {
  id: number;
  clientName: string;
  propertyId: number;
  propertyTitle: string;
  propertyAddress: string;
  dateTime: string;
  duration: number; // en minutos
  type: 'viewing' | 'signing' | 'meeting' | 'call';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  reminderSent: boolean;
}

export interface PropertyAlert {
  id: number;
  propertyId: number;
  propertyTitle: string;
  alertType: 'no_activity' | 'price_update_needed' | 'photos_missing' | 'description_incomplete' | 'expired_soon';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  daysInactive?: number;
  actionRequired: string;
}

export interface SystemActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  user: string;
}

export interface SystemProperty {
  id: number;
  title: string;
  price: number;
  currency?: string;
  currencyCode?: string;
  status?: string;
  views?: number;
  favorites?: number;
  favoritesCount?: number;
  image?: string;
  featuredImage?: string;
  galleryImages?: Array<{
    id: number;
    url: string;
    altText?: string;
    order?: number;
    isMain?: boolean;
  }>;
  propertyTypeName?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyTypeData {
  name: string;
  value: number;
  color: string;
}

export interface RevenueTrendData {
  date: string;
  value: number;
  category: string;
}

export interface PerformanceMetrics {
  uptime: number;
  responseTime: number;
  activeConnections: number;
  serverLoad: number;
  databaseConnections: number;
  cacheHitRate: number;
  propertiesPerAgent: number;
  viewsPerProperty: number;
  conversionRate: number;
}

export const systemService = {
  // System Statistics
  getSystemStats: async (): Promise<SystemStats> => {
    const response = await apiClient.get<SystemStats>('/api/dashboard/stats');
    return response.data!;
  },

  // System Activities
  getSystemActivities: async (): Promise<SystemActivity[]> => {
    const response = await apiClient.get<SystemActivity[]>('/api/dashboard/activities');
    return response.data!;
  },

  // Recent Properties
  getRecentProperties: async (): Promise<SystemProperty[]> => {
    const response = await apiClient.get<SystemProperty[]>('/api/dashboard/recent-properties');
    return response.data!;
  },

  // Property Type Distribution
  getPropertyTypeDistribution: async (): Promise<PropertyTypeData[]> => {
    const response = await apiClient.get<PropertyTypeData[]>('/api/dashboard/property-types');
    return response.data!;
  },

  // Revenue Trend
  getRevenueTrend: async (): Promise<RevenueTrendData[]> => {
    const response = await apiClient.get<RevenueTrendData[]>('/api/dashboard/revenue-trend');
    return response.data!;
  },

  // Performance Metrics
  getPerformanceMetrics: async (): Promise<PerformanceMetrics> => {
    const response = await apiClient.get<PerformanceMetrics>('/api/dashboard/performance-metrics');
    return response.data!;
  },

  // System Performance (legacy)
  getSystemPerformance: async () => {
    const response = await apiClient.get('/api/system/performance');
    return response.data!;
  },

  // Refresh System Data
  refreshSystemData: async (): Promise<void> => {
    await apiClient.get('/api/dashboard/stats');
  },

  // Export Dashboard Data
  exportDashboardData: async (format: 'csv' | 'xlsx' | 'pdf' = 'csv'): Promise<Blob> => {
    const response = await apiClient.get(`/api/dashboard/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // User Dashboard APIs
  getUserStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/dashboard/user/stats');
      return response.data;
    } catch (error) {
      // Fallback para que el dashboard no se rompa sin backend
      return {
        savedProperties: 0,
        viewedProperties: 0,
        scheduledVisits: 0,
        inquiriesSent: 0,
        favoriteAgents: 0,
        notificationsUnread: 0,
        searchHistoryCount: 0,
        lastLogin: new Date().toISOString()
      };
    }
  },

  getUserSavedProperties: async (): Promise<SystemProperty[]> => {
    try {
      const response = await apiClient.get('/api/dashboard/user/saved-properties');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  getUserRecentViews: async (): Promise<SystemProperty[]> => {
    try {
      const response = await apiClient.get('/api/dashboard/user/recent-views');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  getUserRecommendedProperties: async (): Promise<SystemProperty[]> => {
    try {
      const response = await apiClient.get('/api/dashboard/user/recommended-properties');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  getUserScheduledVisits: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/dashboard/user/scheduled-visits');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  getUserActivities: async (): Promise<SystemActivity[]> => {
    try {
      const response = await apiClient.get('/api/dashboard/user/activities');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  getUserNotifications: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/dashboard/user/notifications');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // User Actions
  saveProperty: async (propertyId: number): Promise<void> => {
    try {
      await apiClient.post(`/api/user/save-property/${propertyId}`);
    } catch (error) {
      throw error;
    }
  },

  unsaveProperty: async (propertyId: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/user/save-property/${propertyId}`);
    } catch (error) {
      throw error;
    }
  },

  scheduleVisit: async (propertyId: number, visitData: any): Promise<void> => {
    try {
      await apiClient.post(`/api/user/schedule-visit/${propertyId}`, visitData);
    } catch (error) {
      throw error;
    }
  },

  sendInquiry: async (propertyId: number, inquiryData: any): Promise<void> => {
    try {
      await apiClient.post(`/api/user/inquiry/${propertyId}`, inquiryData);
    } catch (error) {
      throw error;
    }
  },

  markNotificationAsRead: async (notificationId: number): Promise<void> => {
    try {
      await apiClient.patch(`/api/user/notifications/${notificationId}/read`);
    } catch (error) {
      throw error;
    }
  },

  updateUserPreferences: async (preferences: any): Promise<void> => {
    try {
      await apiClient.put('/api/user/preferences', preferences);
    } catch (error) {
      throw error;
    }
  },

  // ===== AGENT-SPECIFIC APIs =====
  
  // Get agent statistics
  getAgentStats: async (): Promise<AgentStats> => {
    try {
      const response = await apiClient.get('/api/dashboard/agent/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting agent stats:', error);
      // Retornar datos vacíos en lugar de fallback con datos ficticios
      return {
        myProperties: 0,
        activeLeads: 0,
        todayAppointments: 0,
        weekAppointments: 0,
        monthCommissions: 0,
        conversionRate: 0,
        avgResponseTime: 0,
        propertiesNeedingAttention: 0,
        newLeadsToday: 0,
        closedDealsMonth: 0,
        activeClients: 0,
        avgDaysToClose: 0
      };
    }
  },

  // Get agent leads
  getAgentLeads: async (status?: string, priority?: string): Promise<AgentLead[]> => {
    try {
      let url = '/api/dashboard/agent/leads';
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // Get agent appointments
  getAgentAppointments: async (timeframe: 'today' | 'week' | 'month' = 'week'): Promise<AgentAppointment[]> => {
    try {
      const response = await apiClient.get(`/api/dashboard/agent/appointments?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // Get property alerts
  getPropertyAlerts: async (): Promise<PropertyAlert[]> => {
    try {
      const response = await apiClient.get('/api/dashboard/agent/property-alerts');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // Get agent's properties
  getAgentProperties: async (status?: string): Promise<SystemProperty[]> => {
    try {
      let url = '/api/agent/properties';
      if (status) url += `?status=${status}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // Update lead status
  updateLeadStatus: async (leadId: number, status: string, notes?: string): Promise<void> => {
    try {
      await apiClient.patch(`/api/agent/leads/${leadId}/status`, { status, notes });
    } catch (error) {
      throw error;
    }
  },

  // Confirm appointment
  confirmAppointment: async (appointmentId: number): Promise<void> => {
    try {
      await apiClient.patch(`/api/agent/appointments/${appointmentId}/confirm`);
    } catch (error) {
      throw error;
    }
  },

  // Mark alert as resolved
  resolvePropertyAlert: async (alertId: number): Promise<void> => {
    try {
      await apiClient.patch(`/api/agent/property-alerts/${alertId}/resolve`);
    } catch (error) {
      throw error;
    }
  }
}; 