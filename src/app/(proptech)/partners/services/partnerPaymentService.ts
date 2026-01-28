import { apiClient } from '@/lib/api';

export interface PartnerPayment {
  id: number;
  partnerId: number;
  partnerName: string;
  paymentNumber: string;
  paymentDate: string | null;
  dueDate: string;
  amount: number;
  currency: string;
  paymentType: 'SOCIAL_DUES' | 'PROPTECH' | 'FEE' | 'QUOTA' | 'COMMISSION' | 'BONUS' | 'ADVANCE' | 'REFUND' | 'PENALTY';
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
  partnerName?: string;
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
      const response = await apiClient.get('/api/partner-payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  }

  async getPaymentById(id: number): Promise<PartnerPayment | null> {
    try {
      const response = await apiClient.get(`/api/partner-payments/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  async getPaymentsByPartner(partnerId: number): Promise<PartnerPayment[]> {
    try {
      const response = await apiClient.get(`/api/partner-payments/partner/${partnerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching partner payments:', error);
      return [];
    }
  }

  async getPendingQuotasByPartner(partnerId: number): Promise<PartnerPayment[]> {
    try {
      const response = await apiClient.get(`/api/partner-payments/partner/${partnerId}/pending-quotas`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending quotas:', error);
      return [];
    }
  }

  async getPaymentsByStatus(status: string): Promise<PartnerPayment[]> {
    try {
      const response = await apiClient.get(`/api/partner-payments/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payments by status:', error);
      return [];
    }
  }

  async getOverduePayments(): Promise<PartnerPayment[]> {
    try {
      const response = await apiClient.get('/api/partner-payments/overdue');
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue payments:', error);
      return [];
    }
  }

  async createPayment(paymentData: CreatePaymentData): Promise<PartnerPayment> {
    try {
      // Backend usa LocalDate (yyyy-MM-dd). No enviar "T00:00:00" porque rompe el parseo.
      const formattedData = {
        ...paymentData,
        dueDate: paymentData.dueDate || undefined,
        paymentDate: paymentData.paymentDate || undefined
      };
      
      const response = await apiClient.post('/api/partner-payments', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async updatePayment(id: number, paymentData: Partial<CreatePaymentData>): Promise<PartnerPayment> {
    try {
      const response = await apiClient.put(`/api/partner-payments/${id}`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  async deletePayment(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/partner-payments/${id}`);
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
      
      const response = await apiClient.post(`/api/partner-payments/${id}/mark-as-paid?${params}`);
      return response.data;
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
      
      await apiClient.post(`/api/partner-payments/partner/${partnerId}/generate-quotas?${params}`);
    } catch (error) {
      console.error('Error generating quota payments:', error);
      throw error;
    }
  }

  async getPartnerPaymentSummary(partnerId: number): Promise<PaymentSummary> {
    try {
      const response = await apiClient.get(`/api/partner-payments/partner/${partnerId}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment summary:', error);
      return {
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        pendingCount: 0,
        overdueCount: 0,
      };
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
      case 'SOCIAL_DUES':
        return 'Cuota Social';
      case 'PROPTECH':
        return 'Proptech';
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