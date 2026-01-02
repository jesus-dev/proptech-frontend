import { 
  SubscriptionPlan, 
  PartnerSubscription, 
  SubscriptionInvoice, 
  SubscriptionUsage,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest 
} from '../types/subscription';
import { getEndpoint } from '@/lib/api-config';

export const subscriptionService = {
  // Planes de suscripción
  async getAllProducts(): Promise<SubscriptionPlan[]> {
    try {
      const response = await fetch(getEndpoint('/api/subscription-plans'));
      if (!response.ok) {
        console.warn('No se pudieron obtener planes de suscripción (response not ok)');
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  },

  async getProductById(id: number): Promise<SubscriptionPlan | null> {
    try {
      const response = await fetch(getEndpoint(`/api/subscription-plans/${id}`));
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription plan:', error);
      return null;
    }
  },

  async createProduct(data: any): Promise<SubscriptionPlan> {
    try {
      const response = await fetch(getEndpoint('/api/subscription-plans'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear plan de suscripción');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      throw error;
    }
  },

  async updateProduct(id: number, data: any): Promise<SubscriptionPlan> {
    try {
      const response = await fetch(getEndpoint(`/api/subscription-plans/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar plan de suscripción');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      throw error;
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      const response = await fetch(getEndpoint(`/api/subscription-plans/${id}`), {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar plan de suscripción');
      }
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      throw error;
    }
  },

  // Suscripciones de socios
  async getAllSubscriptions(): Promise<PartnerSubscription[]> {
    try {
      const response = await fetch(getEndpoint('/api/subscriptions'));
      if (!response.ok) {
        console.warn('No se pudieron obtener suscripciones (response not ok)');
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  },

  async getPartnerSubscriptions(partnerId: number): Promise<PartnerSubscription[]> {
    try {
      const response = await fetch(getEndpoint(`/api/partners/${partnerId}/subscriptions`));
      if (!response.ok) {
        throw new Error('Error al obtener suscripciones del socio');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching partner subscriptions:', error);
      return [];
    }
  },

  async getSubscriptionById(id: number): Promise<PartnerSubscription | null> {
    try {
      const response = await fetch(getEndpoint(`/api/subscriptions/${id}`));
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  },

  async createSubscription(data: CreateSubscriptionRequest): Promise<PartnerSubscription> {
    try {
      console.log('Creating subscription with data:', data);
      const response = await fetch(getEndpoint('/api/subscriptions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', response.status, errorText);
        let errorMessage = 'Error al crear suscripción';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('Subscription created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  async updateSubscription(id: number, data: UpdateSubscriptionRequest): Promise<PartnerSubscription> {
    try {
      const response = await fetch(getEndpoint(`/api/subscriptions/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar suscripción');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  async cancelSubscription(id: number, reason?: string): Promise<PartnerSubscription> {
    try {
      const response = await fetch(getEndpoint(`/api/subscriptions/${id}/cancel`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        throw new Error('Error al cancelar suscripción');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  async reactivateSubscription(id: number): Promise<PartnerSubscription> {
    try {
      const response = await fetch(getEndpoint(`/api/subscriptions/${id}/reactivate`), {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Error al reactivar suscripción');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  },

  // Facturas de suscripción
  async getSubscriptionInvoices(subscriptionId: number): Promise<SubscriptionInvoice[]> {
    try {
      const response = await fetch(getEndpoint(`/api/subscriptions/${subscriptionId}/invoices`));
      if (!response.ok) {
        throw new Error('Error al obtener facturas de suscripción');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription invoices:', error);
      return [];
    }
  },

  async getInvoiceById(id: number): Promise<SubscriptionInvoice | null> {
    try {
      const response = await fetch(getEndpoint(`/api/subscription-invoices/${id}`));
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  },

  // Uso de suscripción
  async getSubscriptionUsage(subscriptionId: number): Promise<SubscriptionUsage[]> {
    try {
      const response = await fetch(getEndpoint(`/api/subscriptions/${subscriptionId}/usage`));
      if (!response.ok) {
        throw new Error('Error al obtener uso de suscripción');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription usage:', error);
      return [];
    }
  },

  async getCurrentUsage(partnerId: number): Promise<SubscriptionUsage[]> {
    try {
      const response = await fetch(getEndpoint(`/api/partners/${partnerId}/usage`));
      if (!response.ok) {
        throw new Error('Error al obtener uso actual');
      }
      return await response.json();
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