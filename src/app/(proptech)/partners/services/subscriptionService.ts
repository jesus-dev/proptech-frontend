import { 
  SubscriptionPlan, 
  PartnerSubscription, 
  SubscriptionInvoice, 
  SubscriptionUsage,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest 
} from '../types/subscription';
import { apiClient } from '@/lib/api';

export const subscriptionService = {
  // Planes de suscripción
  async getAllProducts(): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiClient.get('/api/subscription-plans');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  },

  async getProductById(id: number): Promise<SubscriptionPlan | null> {
    try {
      try {
        const response = await apiClient.get(`/api/subscription-plans/${id}`);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    } catch (error) {
      console.error('Error fetching subscription plan:', error);
      return null;
    }
  },

  async createProduct(data: any): Promise<SubscriptionPlan> {
    try {
      const response = await apiClient.post('/api/subscription-plans', data);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      throw error;
    }
  },

  async updateProduct(id: number, data: any): Promise<SubscriptionPlan> {
    try {
      const response = await apiClient.put(`/api/subscription-plans/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      throw error;
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/subscription-plans/${id}`);
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      throw error;
    }
  },

  // Suscripciones de socios
  async getAllSubscriptions(): Promise<PartnerSubscription[]> {
    try {
      const response = await apiClient.get('/api/subscriptions');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  },

  async getPartnerSubscriptions(partnerId: number): Promise<PartnerSubscription[]> {
    try {
      const response = await apiClient.get(`/api/partners/${partnerId}/subscriptions`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching partner subscriptions:', error);
      return [];
    }
  },

  async getSubscriptionById(id: number): Promise<PartnerSubscription | null> {
    try {
      try {
        const response = await apiClient.get(`/api/subscriptions/${id}`);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  },

  async createSubscription(data: CreateSubscriptionRequest): Promise<PartnerSubscription> {
    try {
      console.log('Creating subscription with data:', data);
      const response = await apiClient.post('/api/subscriptions', data);
      const result = response.data;
      console.log('Subscription created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  async updateSubscription(id: number, data: UpdateSubscriptionRequest): Promise<PartnerSubscription> {
    try {
      const response = await apiClient.put(`/api/subscriptions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  async cancelSubscription(id: number, reason?: string): Promise<PartnerSubscription> {
    try {
      const response = await apiClient.post(`/api/subscriptions/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  async reactivateSubscription(id: number): Promise<PartnerSubscription> {
    try {
      const response = await apiClient.post(`/api/subscriptions/${id}/reactivate`);
      return response.data;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  },

  // Facturas de suscripción
  async getSubscriptionInvoices(subscriptionId: number): Promise<SubscriptionInvoice[]> {
    try {
      const response = await apiClient.get(`/api/subscriptions/${subscriptionId}/invoices`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching subscription invoices:', error);
      return [];
    }
  },

  async getInvoiceById(id: number): Promise<SubscriptionInvoice | null> {
    try {
      try {
        const response = await apiClient.get(`/api/subscription-invoices/${id}`);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  },

  // Uso de suscripción
  async getSubscriptionUsage(subscriptionId: number): Promise<SubscriptionUsage[]> {
    try {
      const response = await apiClient.get(`/api/subscriptions/${subscriptionId}/usage`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching subscription usage:', error);
      return [];
    }
  },

  async getCurrentUsage(partnerId: number): Promise<SubscriptionUsage[]> {
    try {
      const response = await apiClient.get(`/api/partners/${partnerId}/usage`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching current usage:', error);
      return [];
    }
  },

  // Utilidades
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  getBillingCycleLabel(cycle: string): string {
    switch (cycle) {
      case 'MONTHLY': return 'Mensual';
      case 'QUARTERLY': return 'Trimestral';
      case 'YEARLY': return 'Anual';
      default: return cycle;
    }
  },

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Activa';
      case 'INACTIVE': return 'Inactiva';
      case 'SUSPENDED': return 'Suspendida';
      case 'CANCELLED': return 'Cancelada';
      case 'PENDING': return 'Pendiente';
      default: return status;
    }
  },

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
}; 