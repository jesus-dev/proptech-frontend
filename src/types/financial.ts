export interface FinancialCategory {
  id: number;
  name: string;
  description?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialProvider {
  id: number;
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  documentNumber?: string;
  documentType?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  bankName?: string;
  bankAccount?: string;
  status?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type FinancialExpenseStatus =
  | 'PLANNED'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'CANCELLED';

export interface FinancialPayment {
  id: number;
  expenseId: number;
  providerId?: number;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
  attachmentUrl?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialExpense {
  id: number;
  providerId?: number;
  categoryId?: number;
  title: string;
  description?: string;
  amount: number;
  taxAmount?: number;
  currency: string;
  status: FinancialExpenseStatus;
  type?: string;
  projectId?: number;
  incurredAt?: string;
  dueDate?: string;
  attachments?: string;
  tags?: string;
  createdBy?: number;
  approvedBy?: number;
  createdAt?: string;
  updatedAt?: string;
  provider?: FinancialProvider;
  category?: FinancialCategory;
  payments?: FinancialPayment[];
  totalPaid?: number;
  balance?: number;
}

export interface FinancialExpenseFilters {
  providerId?: number;
  categoryId?: number;
  status?: FinancialExpenseStatus;
  fromDate?: string;
  toDate?: string;
  includePayments?: boolean;
}

