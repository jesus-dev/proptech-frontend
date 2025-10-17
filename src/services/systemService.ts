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
      const response = await apiClient.get('/api/user/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
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
      const response = await apiClient.get('/api/user/saved-properties');
      return response.data;
    } catch (error) {
      console.error('Error fetching saved properties:', error);
      return [];
    }
  },

  getUserRecentViews: async (): Promise<SystemProperty[]> => {
    try {
      const response = await apiClient.get('/api/user/recent-views');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent views:', error);
      return [];
    }
  },

  getUserRecommendedProperties: async (): Promise<SystemProperty[]> => {
    try {
      const response = await apiClient.get('/api/user/recommended-properties');
      return response.data;
    } catch (error) {
      console.error('Error fetching recommended properties:', error);
      return [];
    }
  },

  getUserScheduledVisits: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/user/scheduled-visits');
      return response.data;
    } catch (error) {
      console.error('Error fetching scheduled visits:', error);
      return [];
    }
  },

  getUserActivities: async (): Promise<SystemActivity[]> => {
    try {
      const response = await apiClient.get('/api/user/activities');
      return response.data;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  },

  getUserNotifications: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/user/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  },

  // User Actions
  saveProperty: async (propertyId: number): Promise<void> => {
    try {
      await apiClient.post(`/api/user/save-property/${propertyId}`);
    } catch (error) {
      console.error('Error saving property:', error);
      throw error;
    }
  },

  unsaveProperty: async (propertyId: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/user/save-property/${propertyId}`);
    } catch (error) {
      console.error('Error unsaving property:', error);
      throw error;
    }
  },

  scheduleVisit: async (propertyId: number, visitData: any): Promise<void> => {
    try {
      await apiClient.post(`/api/user/schedule-visit/${propertyId}`, visitData);
    } catch (error) {
      console.error('Error scheduling visit:', error);
      throw error;
    }
  },

  sendInquiry: async (propertyId: number, inquiryData: any): Promise<void> => {
    try {
      await apiClient.post(`/api/user/inquiry/${propertyId}`, inquiryData);
    } catch (error) {
      console.error('Error sending inquiry:', error);
      throw error;
    }
  },

  markNotificationAsRead: async (notificationId: number): Promise<void> => {
    try {
      await apiClient.patch(`/api/user/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  updateUserPreferences: async (preferences: any): Promise<void> => {
    try {
      await apiClient.put('/api/user/preferences', preferences);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
}; 