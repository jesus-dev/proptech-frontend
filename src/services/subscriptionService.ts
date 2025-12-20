import { getEndpoint } from '@/lib/api-config';
import { apiClient } from '@/lib/api';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  type: string;
  tier: string;
  price: number;
  billingCycleDays: number;
  maxProperties: number;
  maxAgents: number;
  hasAnalytics: boolean;
  hasCrm: boolean;
  hasNetworkAccess: boolean;
  hasPrioritySupport: boolean;
  isActive: boolean;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  id: number;
  userId: number;
  userName?: string;
  subscriptionPlanId?: number;
  subscriptionPlan?: SubscriptionPlan;
  planId?: number;
  planName?: string;
  status: string;
  startDate: string;
  endDate: string;
  paymentReference: string;
  salesAgentCode?: string;
  amountPaid?: number;
  autoRenew?: boolean;
  daysRemaining?: number;
  isExpired?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionAccess {
  hasPropTechAccess: boolean;
  hasNetworkAccess: boolean;
  propTechTier: string;
}

export const subscriptionService = {
  // Obtener todos los planes disponibles
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    try {
      console.log('Calling GET /api/subscriptions/admin/plans');
      const response = await apiClient.get('/api/subscriptions/admin/plans');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      // Asegurar que siempre retornemos un array
      if (!response.data) {
        console.warn('Response data is null or undefined');
        return [];
      }
      
      if (!Array.isArray(response.data)) {
        console.warn('Response data is not an array:', response.data);
        return [];
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      throw error;
    }
  },

  // Obtener planes de PropTech
  async getPropTechPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiClient.get('/api/subscriptions/plans/proptech');
      return response.data;
    } catch (error) {
      console.error('Error fetching PropTech plans:', error);
      throw error;
    }
  },

  // Obtener plan de Network
  async getNetworkPlan(): Promise<SubscriptionPlan | null> {
    try {
      const response = await apiClient.get('/api/subscriptions/plans/network');
      return response.data;
    } catch (error) {
      console.error('Error fetching network plan:', error);
      return null;
    }
  },

  // Obtener plan por ID
  async getPlanById(planId: number): Promise<SubscriptionPlan | null> {
    try {
      const response = await apiClient.get(`/api/subscriptions/plans/${planId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plan by ID:', error);
      return null;
    }
  },

  // Obtener suscripciones activas del usuario
  async getUserSubscriptions(userId: number): Promise<UserSubscription[]> {
    try {
      const response = await apiClient.get(`/api/subscriptions/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      throw error;
    }
  },

  // Obtener acceso del usuario
  async getUserAccess(userId: number): Promise<SubscriptionAccess> {
    try {
      const response = await apiClient.get(`/api/subscriptions/user/${userId}/access`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user access:', error);
      throw error;
    }
  },

  // Suscribir usuario a un plan
  async subscribeUser(userId: number, planId: number, paymentReference: string, salesAgentCode?: string): Promise<UserSubscription> {
    try {
      const response = await apiClient.post('/api/subscriptions/subscribe', {
        userId,
        planId,
        paymentReference,
        salesAgentCode
      });
      return response.data;
    } catch (error) {
      console.error('Error subscribing user:', error);
      throw error;
    }
  },

  // Cancelar suscripción
  async cancelSubscription(subscriptionId: number, reason?: string): Promise<UserSubscription> {
    try {
      const response = await apiClient.put(`/api/subscriptions/${subscriptionId}/cancel`, { 
        reason: reason || 'Cancelación solicitada por el usuario' 
      });
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  // Cambiar plan de suscripción
  async changePlan(userId: number, newPlanId: number): Promise<UserSubscription> {
    try {
      const response = await apiClient.put('/api/subscriptions/change-plan', {
        userId,
        newPlanId
      });
      return response.data;
    } catch (error) {
      console.error('Error changing plan:', error);
      throw error;
    }
  },

  // Cambiar plan con pago
  async changePlanWithPayment(userId: number, newPlanId: number, paymentReference: string, salesAgentCode?: string): Promise<UserSubscription> {
    try {
      const response = await apiClient.put('/api/subscriptions/change-plan-with-payment', {
        userId,
        newPlanId,
        paymentReference,
        salesAgentCode
      });
      return response.data;
    } catch (error) {
      console.error('Error changing plan with payment:', error);
      throw error;
    }
  },

  // Renovar suscripción
  async renewSubscription(subscriptionId: number, paymentReference: string): Promise<UserSubscription> {
    try {
      const response = await apiClient.put(`/api/subscriptions/${subscriptionId}/renew`, {
        paymentReference
      });
      return response.data;
    } catch (error) {
      console.error('Error renewing subscription:', error);
      throw error;
    }
  },

  // ===================== ADMIN METHODS =====================

  // Crear plan de suscripción (ADMIN)
  async createPlan(planData: any): Promise<SubscriptionPlan> {
    try {
      const response = await apiClient.post('/api/subscriptions/admin/plans', planData);
      return response.data;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  },

  // Actualizar plan de suscripción (ADMIN)
  async updatePlan(planId: number, planData: any): Promise<SubscriptionPlan> {
    try {
      const response = await apiClient.put(`/api/subscriptions/admin/plans/${planId}`, planData);
      return response.data;
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  },

  // Eliminar plan de suscripción (ADMIN)
  async deletePlan(planId: number): Promise<void> {
    try {
      const response = await apiClient.delete(`/api/subscriptions/admin/plans/${planId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  },

  // Obtener todas las suscripciones (ADMIN)
  async getAllSubscriptions(page: number = 0, size: number = 20, status?: string, planType?: string): Promise<UserSubscription[]> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());
      if (status) params.append('status', status);
      if (planType) params.append('planType', planType);

      const response = await apiClient.get(`/api/subscriptions/admin/all?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all subscriptions:', error);
      throw error;
    }
  },

  // Obtener estadísticas de suscripciones (ADMIN)
  async getSubscriptionStats(): Promise<any> {
    try {
      const response = await apiClient.get('/api/subscriptions/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      throw error;
    }
  },

  // Utilidades
  formatPrice(price: number, currency: string = 'PYG'): string {
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
    }).format(price);
  },

  getBillingCycleText(billingCycleDays: number): string {
    if (billingCycleDays === 30) return 'Mensual';
    if (billingCycleDays === 365) return 'Anual';
    if (billingCycleDays === 90) return 'Trimestral';
    return `${billingCycleDays} días`;
  },

  getTierIcon(tier: string) {
    switch (tier) {
      case 'PREMIUM': return '👑';
      case 'INTERMEDIO': return '⭐';
      case 'INICIAL': return '⚡';
      case 'FREE': return '🆓';
      default: return '📋';
    }
  },

  getTierColor(tier: string): string {
    switch (tier) {
      case 'PREMIUM': return 'text-yellow-600';
      case 'INTERMEDIO': return 'text-blue-600';
      case 'INICIAL': return 'text-green-600';
      case 'FREE': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  }
};
