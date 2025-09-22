import { 
  SubscriptionProduct, 
  PartnerSubscription, 
  SubscriptionInvoice, 
  SubscriptionUsage,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest 
} from '../types/subscription';
import { getEndpoint } from '@/lib/api-config';

export const subscriptionService = {
  // Productos de suscripción
  async getAllProducts(): Promise<SubscriptionProduct[]> {
    try {
      const response = await fetch(getEndpoint('/api/subscription-products'));
      if (!response.ok) {
        // Fallback a datos de prueba si la API no está disponible
        console.warn('API no disponible, usando datos de prueba');
        return this.getMockProducts();
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription products:', error);
      // Fallback a datos de prueba
      return this.getMockProducts();
    }
  },

  getMockProducts(): SubscriptionProduct[] {
    return [
      {
        id: 1,
        name: 'Plan Básico',
        description: 'Ideal para agentes inmobiliarios que están comenzando',
        price: 29.99,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        features: ['unlimited_properties', 'basic_analytics'],
        isActive: true,
        category: 'BASIC',
        maxUsers: 1,
        maxProperties: 50,
        maxContacts: 100,
        isPopular: false,
        isRecommended: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Plan Profesional',
        description: 'Para agencias en crecimiento con múltiples agentes',
        price: 79.99,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        features: ['unlimited_properties', 'advanced_analytics', 'priority_support', 'multi_user'],
        isActive: true,
        category: 'PROFESSIONAL',
        maxUsers: 5,
        maxProperties: 200,
        maxContacts: 500,
        isPopular: true,
        isRecommended: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        name: 'Plan Empresarial',
        description: 'Solución completa para grandes agencias inmobiliarias',
        price: 199.99,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        features: ['unlimited_properties', 'advanced_analytics', 'priority_support', 'multi_user', 'custom_branding', 'api_access'],
        isActive: true,
        category: 'ENTERPRISE',
        maxUsers: 20,
        maxProperties: 1000,
        maxContacts: 2000,
        isPopular: false,
        isRecommended: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  },

  async getProductById(id: number): Promise<SubscriptionProduct | null> {
    try {
      const response = await fetch(getEndpoint(`/api/subscription-products/${id}`));
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription product:', error);
      return null;
    }
  },

  async createProduct(data: any): Promise<SubscriptionProduct> {
    try {
      const response = await fetch(getEndpoint('/api/subscription-products'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        // Simular creación exitosa para desarrollo
        console.warn('API no disponible, simulando creación');
        const newProduct: SubscriptionProduct = {
          id: Date.now(),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return newProduct;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating subscription product:', error);
      // Simular creación exitosa para desarrollo
      const newProduct: SubscriptionProduct = {
        id: Date.now(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return newProduct;
    }
  },

  async updateProduct(id: number, data: any): Promise<SubscriptionProduct> {
    try {
      const response = await fetch(getEndpoint(`/api/subscription-products/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        // Simular actualización exitosa para desarrollo
        console.warn('API no disponible, simulando actualización');
        const updatedProduct: SubscriptionProduct = {
          id,
          ...data,
          updatedAt: new Date().toISOString()
        };
        return updatedProduct;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating subscription product:', error);
      // Simular actualización exitosa para desarrollo
      const updatedProduct: SubscriptionProduct = {
        id,
        ...data,
        updatedAt: new Date().toISOString()
      };
      return updatedProduct;
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      const response = await fetch(getEndpoint(`/api/subscription-products/${id}`), {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        // Simular eliminación exitosa para desarrollo
        console.warn('API no disponible, simulando eliminación');
        return;
      }
    } catch (error) {
      console.error('Error deleting subscription product:', error);
      // Simular eliminación exitosa para desarrollo
      console.warn('API no disponible, simulando eliminación');
    }
  },

  // Suscripciones de socios
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
      const response = await fetch(getEndpoint('/api/subscriptions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear suscripción');
      }
      
      return await response.json();
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