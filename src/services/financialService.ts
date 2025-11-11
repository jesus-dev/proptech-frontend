import { apiClient } from '@/lib/api';
import type {
  FinancialCategory,
  FinancialExpense,
  FinancialExpenseFilters,
  FinancialPayment,
  FinancialProvider,
} from '@/types/financial';

class FinancialService {
  async getProviders(): Promise<FinancialProvider[]> {
    try {
      const response = await apiClient.get('/api/financial/providers');
      return response.data ?? [];
    } catch (error) {
      console.error('Error fetching financial providers:', error);
      return [];
    }
  }

  async getProvider(id: number): Promise<FinancialProvider | null> {
    try {
      const response = await apiClient.get(`/api/financial/providers/${id}`);
      return response.data ?? null;
    } catch (error) {
      console.error('Error fetching financial provider:', error);
      return null;
    }
  }

  async createProvider(provider: Partial<FinancialProvider>): Promise<FinancialProvider | null> {
    try {
      const response = await apiClient.post('/api/financial/providers', provider);
      return response.data ?? null;
    } catch (error) {
      console.error('Error creating financial provider:', error);
      throw error;
    }
  }

  async updateProvider(id: number, provider: Partial<FinancialProvider>): Promise<FinancialProvider | null> {
    try {
      const response = await apiClient.put(`/api/financial/providers/${id}`, provider);
      return response.data ?? null;
    } catch (error) {
      console.error('Error updating financial provider:', error);
      throw error;
    }
  }

  async deleteProvider(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/financial/providers/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting financial provider:', error);
      return false;
    }
  }

  async getCategories(): Promise<FinancialCategory[]> {
    try {
      const response = await apiClient.get('/api/financial/categories');
      return response.data ?? [];
    } catch (error) {
      console.error('Error fetching financial categories:', error);
      return [];
    }
  }

  async createCategory(category: Partial<FinancialCategory>): Promise<FinancialCategory | null> {
    try {
      const response = await apiClient.post('/api/financial/categories', category);
      return response.data ?? null;
    } catch (error) {
      console.error('Error creating financial category:', error);
      throw error;
    }
  }

  async updateCategory(id: number, category: Partial<FinancialCategory>): Promise<FinancialCategory | null> {
    try {
      const response = await apiClient.put(`/api/financial/categories/${id}`, category);
      return response.data ?? null;
    } catch (error) {
      console.error('Error updating financial category:', error);
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/financial/categories/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting financial category:', error);
      return false;
    }
  }

  private buildExpenseQuery(filters?: FinancialExpenseFilters): string {
    if (!filters) {
      return '';
    }

    const params = new URLSearchParams();
    if (filters.providerId) params.append('providerId', filters.providerId.toString());
    if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    params.append('includePayments', filters.includePayments ? 'true' : 'false');

    const query = params.toString();
    return query ? `?${query}` : '';
  }

  async getExpenses(filters?: FinancialExpenseFilters): Promise<FinancialExpense[]> {
    try {
      const query = this.buildExpenseQuery(filters);
      const response = await apiClient.get(`/api/financial/expenses${query}`);
      return response.data ?? [];
    } catch (error) {
      console.error('Error fetching financial expenses:', error);
      return [];
    }
  }

  async getExpense(id: number, includePayments = true): Promise<FinancialExpense | null> {
    try {
      const response = await apiClient.get(`/api/financial/expenses/${id}?includePayments=${includePayments}`);
      return response.data ?? null;
    } catch (error) {
      console.error('Error fetching financial expense:', error);
      return null;
    }
  }

  async createExpense(expense: Partial<FinancialExpense>): Promise<FinancialExpense | null> {
    try {
      const response = await apiClient.post('/api/financial/expenses', expense);
      return response.data ?? null;
    } catch (error) {
      console.error('Error creating financial expense:', error);
      throw error;
    }
  }

  async updateExpense(id: number, expense: Partial<FinancialExpense>): Promise<FinancialExpense | null> {
    try {
      const response = await apiClient.put(`/api/financial/expenses/${id}`, expense);
      return response.data ?? null;
    } catch (error) {
      console.error('Error updating financial expense:', error);
      throw error;
    }
  }

  async deleteExpense(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/financial/expenses/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting financial expense:', error);
      return false;
    }
  }

  async getPaymentsByExpense(expenseId: number): Promise<FinancialPayment[]> {
    try {
      const response = await apiClient.get(`/api/financial/payments?expenseId=${expenseId}`);
      return response.data ?? [];
    } catch (error) {
      console.error('Error fetching financial payments:', error);
      return [];
    }
  }

  async createPayment(payment: Partial<FinancialPayment>): Promise<FinancialPayment | null> {
    try {
      const response = await apiClient.post('/api/financial/payments', payment);
      return response.data ?? null;
    } catch (error) {
      console.error('Error creating financial payment:', error);
      throw error;
    }
  }

  async updatePayment(id: number, payment: Partial<FinancialPayment>): Promise<FinancialPayment | null> {
    try {
      const response = await apiClient.put(`/api/financial/payments/${id}`, payment);
      return response.data ?? null;
    } catch (error) {
      console.error('Error updating financial payment:', error);
      throw error;
    }
  }

  async deletePayment(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/financial/payments/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting financial payment:', error);
      return false;
    }
  }
}

export const financialService = new FinancialService();

