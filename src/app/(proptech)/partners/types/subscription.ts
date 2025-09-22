export interface SubscriptionProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  features: string[];
  isActive: boolean;
  category: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM' | 'TECHNOLOGY' | 'SERVICES' | 'TRAINING' | 'NETWORKING' | 'OTHER';
  maxUsers?: number;
  maxProperties?: number;
  maxContacts?: number;
  isPopular?: boolean;
  isRecommended?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerSubscription {
  id: number;
  partnerId: number;
  productId: number;
  product: SubscriptionProduct;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'PENDING';
  startDate: string;
  endDate?: string;
  nextBillingDate: string;
  lastBillingDate?: string;
  amount: number;
  currency: string;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  autoRenew: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionInvoice {
  id: number;
  subscriptionId: number;
  partnerId: number;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  paidDate?: string;
  description: string;
  items: SubscriptionInvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionInvoiceItem {
  id: number;
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  currency: string;
}

export interface SubscriptionUsage {
  id: number;
  subscriptionId: number;
  partnerId: number;
  metric: 'USERS' | 'PROPERTIES' | 'CONTACTS' | 'STORAGE' | 'API_CALLS';
  currentUsage: number;
  limit: number;
  period: string; // YYYY-MM
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionRequest {
  partnerId: number;
  productId: number;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  autoRenew: boolean;
  startDate?: string;
  notes?: string;
}

export interface UpdateSubscriptionRequest {
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CANCELLED';
  autoRenew?: boolean;
  endDate?: string;
  notes?: string;
} 