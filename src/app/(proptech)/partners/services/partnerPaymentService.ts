import { getEndpoint } from '@/lib/api-config';

export interface PartnerPayment {
  id: number;
  partnerId: number;
  partnerName: string;
  paymentNumber: string;
  paymentDate: string | null;
  dueDate: string;
  amount: number;
  currency: string;
  paymentType: 'FEE' | 'QUOTA' | 'COMMISSION' | 'BONUS' | 'ADVANCE' | 'REFUND' | 'PENALTY';
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIAL';
  paymentMethod?: string;
  referenceNumber?: string;
  description?: string;
  notes?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  pendingCount: number;
  overdueCount: number;
}

export interface CreatePaymentData {
  partnerId: number;
  paymentDate?: string;
  dueDate: string;
  amount: number;
  currency: string;
  paymentType: string;
  status: string;
  paymentMethod?: string;
  referenceNumber?: string;
  description?: string;
  notes?: string;
}

class PartnerPaymentService {
  async getAllPayments(): Promise<PartnerPayment[]> {
    try {
      const response = await fetch(getEndpoint('/api/partner-payments'));
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  async getPaymentById(id: number): Promise<PartnerPayment | null> {
    try {
      const response = await fetch(getEndpoint(`/api/partner-payments/${id}`));
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  async getPaymentsByPartner(partnerId: number): Promise<PartnerPayment[]> {
    try {
      const response = await fetch(getEndpoint(`/api/partner-payments/partner/${partnerId}`));
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching partner payments:', error);
      throw error;
    }
  }

  async getPaymentsByStatus(status: string): Promise<PartnerPayment[]> {
    try {
      const response = await fetch(getEndpoint(`/api/partner-payments/status/${status}`));
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching payments by status:', error);
      throw error;
    }
  }

  async getOverduePayments(): Promise<PartnerPayment[]> {
    try {
      const response = await fetch(getEndpoint('/api/partner-payments/overdue'));
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching overdue payments:', error);
      throw error;
    }
  }

  async createPayment(paymentData: CreatePaymentData): Promise<PartnerPayment> {
    try {
      // Formatear las fechas para el backend
      const formattedData = {
        ...paymentData,
        dueDate: paymentData.dueDate ? `${paymentData.dueDate}T00:00:00` : undefined,
        paymentDate: paymentData.paymentDate ? `${paymentData.paymentDate}T00:00:00` : undefined
      };
      
      const response = await fetch(getEndpoint('/api/partner-payments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'Unknown error'}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async updatePayment(id: number, paymentData: Partial<CreatePaymentData>): Promise<PartnerPayment> {
    try {
      const response = await fetch(getEndpoint(`/api/partner-payments/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  async deletePayment(id: number): Promise<boolean> {
    try {
      const response = await fetch(getEndpoint(`/api/partner-payments/${id}`), {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  async markAsPaid(id: number, paymentMethod: string, referenceNumber: string, processedBy: string): Promise<PartnerPayment> {
    try {
      const params = new URLSearchParams({
        paymentMethod,
        referenceNumber,
        processedBy,
      });
      
      const response = await fetch(getEndpoint(`/api/partner-payments/${id}/mark-as-paid?${params}`), {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      throw error;
    }
  }

  async generateQuotaPayments(
    partnerId: number, 
    numberOfQuotas: number, 
    quotaAmount: number, 
    currency: string, 
    frequency: string
  ): Promise<void> {
    try {
      const params = new URLSearchParams({
        numberOfQuotas: numberOfQuotas.toString(),
        quotaAmount: quotaAmount.toString(),
        currency,
        frequency,
      });
      
      const response = await fetch(getEndpoint(`/api/partner-payments/partner/${partnerId}/generate-quotas?${params}`), {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error generating quota payments:', error);
      throw error;
    }
  }

  async getPartnerPaymentSummary(partnerId: number): Promise<PaymentSummary> {
    try {
      const response = await fetch(getEndpoint(`/api/partner-payments/partner/${partnerId}/summary`));
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment summary:', error);
      throw error;
    }
  }

  // Utilidades para formatear datos
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'OVERDUE':
        return 'text-red-600 bg-red-100';
      case 'CANCELLED':
        return 'text-gray-600 bg-gray-100';
      case 'PARTIAL':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getPaymentTypeLabel(type: string): string {
    switch (type) {
      case 'FEE':
        return 'Membresía';
      case 'QUOTA':
        return 'Cuota';
      case 'COMMISSION':
        return 'Comisión';
      case 'BONUS':
        return 'Bono';
      case 'ADVANCE':
        return 'Adelanto';
      case 'REFUND':
        return 'Reembolso';
      case 'PENALTY':
        return 'Penalización';
      default:
        return type;
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PAID':
        return 'Pagado';
      case 'PENDING':
        return 'Pendiente';
      case 'OVERDUE':
        return 'Vencido';
      case 'CANCELLED':
        return 'Cancelado';
      case 'PARTIAL':
        return 'Parcial';
      default:
        return status;
    }
  }
}

export const partnerPaymentService = new PartnerPaymentService(); 