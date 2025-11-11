'use client';

import { useEffect, useMemo, useState } from 'react';
import { financialService } from '@/services/financialService';
import { currencyService } from '@/app/(proptech)/catalogs/currencies/services/currencyService';
import type { Currency } from '@/app/(proptech)/catalogs/currencies/services/types';
import type {
  FinancialCategory,
  FinancialExpense,
  FinancialExpenseFilters,
  FinancialExpenseStatus,
  FinancialProvider,
} from '@/types/financial';
import ModernPopup from '@/components/ui/ModernPopup';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, Wallet, PiggyBank, Banknote, Layers } from 'lucide-react';
import StatsCard, { StatsGrid } from '@/components/ui/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  providerStatusOptions,
  providerDocumentTypes,
  expenseStatusOptions,
  getExpenseStatusLabel,
} from './constants';

type ExpenseFormState = {
  title: string;
  description: string;
  amount: string;
  taxAmount: string;
  currency: string;
  status: FinancialExpenseStatus;
  type: string;
  providerId?: number;
  categoryId?: number;
  incurredAt: string;
  dueDate: string;
  tags: string;
};

type PaymentFormState = {
  amount: string;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
  notes: string;
};

type ProviderFormState = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  documentNumber: string;
  documentType: string;
  bankName: string;
  bankAccount: string;
  status: string;
  notes: string;
};

type CategoryFormState = {
  name: string;
  description: string;
  type: string;
};

const defaultExpenseForm: ExpenseFormState = {
  title: '',
  description: '',
  amount: '',
  taxAmount: '',
  currency: '',
  status: 'PLANNED',
  type: '',
  providerId: undefined,
  categoryId: undefined,
  incurredAt: '',
  dueDate: '',
  tags: '',
};

const defaultPaymentForm: PaymentFormState = {
  amount: '',
  currency: '',
  paymentDate: '',
  paymentMethod: '',
  reference: '',
  notes: '',
};

const defaultProviderForm: ProviderFormState = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  documentNumber: '',
  documentType: '',
  bankName: '',
  bankAccount: '',
  status: '',
  notes: '',
};

const defaultCategoryForm: CategoryFormState = {
  name: '',
  description: '',
  type: '',
};

export default function FinancialDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<FinancialExpense[]>([]);
  const [providers, setProviders] = useState<FinancialProvider[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isProviderModalOpen, setProviderModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>(defaultExpenseForm);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(defaultPaymentForm);
  const [providerForm, setProviderForm] = useState<ProviderFormState>(defaultProviderForm);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(defaultCategoryForm);
  const [selectedExpense, setSelectedExpense] = useState<FinancialExpense | null>(null);

  const [filters, setFilters] = useState<FinancialExpenseFilters>({
    includePayments: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass =
    'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500';
  const textareaClass =
    'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500';
  const labelClass = 'text-sm font-medium text-gray-700';
  const getExpenseStatusLabel = (status: FinancialExpenseStatus) =>
    expenseStatusOptions.find((option) => option.value === status)?.label ?? status;
  const buttonBaseClass =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
  const primaryButtonClass = `${buttonBaseClass} border border-transparent bg-brand-500 text-white hover:bg-brand-600`;
  const secondaryButtonClass = `${buttonBaseClass} border border-gray-200 bg-white text-gray-700 hover:bg-gray-100`;
  const buttonSizeMd = 'px-4 py-2 text-sm';
  const buttonSizeSm = 'px-3 py-2 text-xs';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [providersData, categoriesData, expensesData] = await Promise.all([
          financialService.getProviders(),
          financialService.getCategories(),
          financialService.getExpenses(filters),
        ]);
        setProviders(providersData);
        setCategories(categoriesData);
        setExpenses(expensesData);

        try {
          const activeCurrencies = await currencyService.getActive();
          setCurrencies(activeCurrencies ?? []);
        } catch (error) {
          console.error('Error fetching currencies:', error);
          setCurrencies([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  const summary = useMemo(() => {
    const totalPlanned = expenses.reduce((acc, expense) => acc + (expense.amount ?? 0), 0);
    const totalPaid = expenses.reduce((acc, expense) => acc + (expense.totalPaid ?? 0), 0);
    const outstanding = totalPlanned - totalPaid;
    const activeExpenses = expenses.filter(
      (expense) => expense.status !== 'PAID' && expense.status !== 'CANCELLED'
    ).length;

    return {
      totalPlanned,
      totalPaid,
      outstanding,
      activeExpenses,
    };
  }, [expenses]);

  const handleExpenseSubmit = async () => {
    if (!expenseForm.title || !expenseForm.amount || !expenseForm.currency) {
      alert('Completa al menos el título, monto y moneda.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: expenseForm.title,
        description: expenseForm.description || undefined,
        amount: Number(expenseForm.amount),
        taxAmount: expenseForm.taxAmount ? Number(expenseForm.taxAmount) : undefined,
        currency: expenseForm.currency,
        status: expenseForm.status,
        type: expenseForm.type || undefined,
        providerId: expenseForm.providerId,
        categoryId: expenseForm.categoryId,
        incurredAt: expenseForm.incurredAt || undefined,
        dueDate: expenseForm.dueDate || undefined,
        tags: expenseForm.tags || undefined,
      };

      await financialService.createExpense(payload);
      setExpenseModalOpen(false);
      setExpenseForm(defaultExpenseForm);
      await refreshExpenses();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedExpense) {
      alert('Selecciona un gasto.');
      return;
    }
    if (!paymentForm.amount || !paymentForm.currency || !paymentForm.paymentDate) {
      alert('Completa monto, moneda y fecha de pago.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        expenseId: selectedExpense.id,
        amount: Number(paymentForm.amount),
        currency: paymentForm.currency,
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod || undefined,
        reference: paymentForm.reference || undefined,
        notes: paymentForm.notes || undefined,
        providerId: selectedExpense.providerId,
      };

      await financialService.createPayment(payload);
      setPaymentModalOpen(false);
      setPaymentForm(defaultPaymentForm);
      await refreshExpenses();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderSubmit = async () => {
    if (!providerForm.companyName) {
      alert('El nombre comercial es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    try {
      await financialService.createProvider({
        companyName: providerForm.companyName,
        contactName: providerForm.contactName || undefined,
        email: providerForm.email || undefined,
        phone: providerForm.phone || undefined,
        documentNumber: providerForm.documentNumber || undefined,
        documentType: providerForm.documentType || undefined,
        bankName: providerForm.bankName || undefined,
        bankAccount: providerForm.bankAccount || undefined,
        status: providerForm.status || undefined,
        notes: providerForm.notes || undefined,
      });
      setProviderModalOpen(false);
      setProviderForm(defaultProviderForm);
      await refreshProviders();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySubmit = async () => {
    if (!categoryForm.name) {
      alert('El nombre de la categoría es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    try {
      await financialService.createCategory({
        name: categoryForm.name,
        description: categoryForm.description || undefined,
        type: categoryForm.type || undefined,
      });
      setCategoryModalOpen(false);
      setCategoryForm(defaultCategoryForm);
      await refreshCategories();
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshExpenses = async () => {
    const data = await financialService.getExpenses(filters);
    setExpenses(data);
  };

  const refreshProviders = async () => {
    const data = await financialService.getProviders();
    setProviders(data);
  };

  const refreshCategories = async () => {
    const data = await financialService.getCategories();
    setCategories(data);
  };

  const formatCurrency = (value: number | undefined, currency?: string) => {
    if (!value) return `${currency ?? ''} 0`;
    try {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: currency ?? 'USD',
      }).format(value);
    } catch {
      return `${currency ?? ''} ${value.toFixed(2)}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                <Wallet className="h-3.5 w-3.5" />
                Finanzas internas
              </span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Finanzas & Pagos</h1>
                <p className="text-gray-600">
                  Controla tus inversiones, gastos operativos y pagos a proveedores.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className={`${primaryButtonClass} ${buttonSizeMd}`}
                onClick={() => setProviderModalOpen(true)}
              >
                <PlusCircle className="h-4 w-4" />
                Nuevo proveedor
              </button>
              <button
                type="button"
                className={`${primaryButtonClass} ${buttonSizeMd}`}
                onClick={() => setCategoryModalOpen(true)}
              >
                <Layers className="h-4 w-4" />
                Nueva categoría
              </button>
              <button
                type="button"
                className={`${primaryButtonClass} ${buttonSizeMd}`}
                onClick={() => setExpenseModalOpen(true)}
              >
                <Banknote className="h-4 w-4" />
                Registrar gasto
              </button>
            </div>
          </div>
        </div>

        <StatsGrid columns={4} gap="lg">
          <StatsCard
            title="Total comprometido"
            value={formatCurrency(summary.totalPlanned)}
            subtitle="Monto acordado con terceros"
            icon={<Banknote className="h-10 w-10 text-brand-500" />}
            color="primary"
            className="bg-white border border-gray-200 text-gray-900"
          />
          <StatsCard
            title="Pagado"
            value={formatCurrency(summary.totalPaid)}
            subtitle="Desembolsos ejecutados"
            icon={<PiggyBank className="h-10 w-10 text-emerald-500" />}
            color="success"
            className="bg-white border border-gray-200 text-gray-900"
          />
          <StatsCard
            title="Saldo pendiente"
            value={formatCurrency(summary.outstanding)}
            subtitle="Compromisos por pagar"
            icon={<Wallet className="h-10 w-10 text-amber-500" />}
            color="warning"
            className="bg-white border border-gray-200 text-gray-900"
          />
          <StatsCard
            title="Gastos activos"
            value={summary.activeExpenses}
            subtitle="Registros abiertos"
            icon={<PlusCircle className="h-10 w-10 text-brand-500" />}
            color="info"
            className="bg-white border border-gray-200 text-gray-900"
          />
        </StatsGrid>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Historial financiero</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={filters.status ?? ''}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: event.target.value ? (event.target.value as FinancialExpenseStatus) : undefined,
                  }))
                }
              >
                <option value="">Todos los estados</option>
                {expenseStatusOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={`${secondaryButtonClass} ${buttonSizeMd}`}
                onClick={refreshExpenses}
              >
                Actualizar
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">Concepto</th>
                    <th className="px-6 py-3">Proveedor</th>
                    <th className="px-6 py-3">Categoría</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3 text-right">Monto</th>
                    <th className="px-6 py-3 text-right">Pagado</th>
                    <th className="px-6 py-3 text-right">Saldo</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-500" />
                        <p className="mt-2 text-sm text-gray-500">Cargando información financiera…</p>
                      </td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        No hay gastos registrados. ¡Empieza creando tu primer gasto!
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense.id} className="text-sm text-gray-700 transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{expense.title}</div>
                          {expense.description && (
                            <p className="mt-1 text-xs text-gray-500">{expense.description}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-400">
                            {expense.incurredAt ? `Registrado: ${expense.incurredAt}` : 'Sin fecha'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {expense.provider ? (
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">{expense.provider.companyName}</div>
                              {expense.provider.contactName && (
                                <p className="text-xs text-gray-500">{expense.provider.contactName}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Sin proveedor asignado</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {expense.category ? (
                            <Badge className="border border-gray-200 bg-gray-100 text-gray-700">
                              {expense.category.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">General</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="border border-brand-200 bg-brand-50 text-brand-600 uppercase text-[11px]">
                            {getExpenseStatusLabel(expense.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          {formatCurrency(expense.amount, expense.currency)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                          {formatCurrency(expense.totalPaid, expense.currency)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-amber-600">
                          {formatCurrency(expense.balance, expense.currency)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className={`${primaryButtonClass} ${buttonSizeSm}`}
                              onClick={() => {
                                setSelectedExpense(expense);
                                setPaymentForm(defaultPaymentForm);
                                setPaymentModalOpen(true);
                              }}
                            >
                              Registrar pago
                            </button>
                            <button
                              type="button"
                              className={`${secondaryButtonClass} ${buttonSizeSm}`}
                              onClick={async () => {
                                const detailed = await financialService.getExpense(expense.id, true);
                                if (detailed) {
                                  setSelectedExpense(detailed);
                                  setPaymentModalOpen(true);
                                }
                              }}
                            >
                              Ver detalle
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ModernPopup
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setExpenseModalOpen(false);
          setExpenseForm(defaultExpenseForm);
        }}
        title="Registrar nuevo gasto"
        subtitle="Controla tus inversiones y compromisos financieros"
        icon={<Wallet className="h-8 w-8 text-white" />}
      >
        <div className="space-y-5">
          {selectedExpense?.payments && selectedExpense.payments.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Pagos realizados</h3>
              <div className="max-h-48 space-y-3 overflow-y-auto pr-2">
                {selectedExpense.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700"
                  >
                    <div>
                      <p className="font-semibold">
                        {formatCurrency(payment.amount, payment.currency || selectedExpense.currency)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {payment.paymentDate} {payment.paymentMethod ? `• ${payment.paymentMethod}` : ''}
                      </p>
                    </div>
                    {payment.reference && (
                      <span className="text-xs text-gray-500">{payment.reference}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Título</label>
              <input
                className={inputClass}
                value={expenseForm.title}
                onChange={(event) => setExpenseForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Monto</label>
              <input
                type="number"
                className={inputClass}
                value={expenseForm.amount}
                onChange={(event) => setExpenseForm((prev) => ({ ...prev, amount: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Moneda</label>
              <select
                className={inputClass}
                value={expenseForm.currency}
                onChange={(event) => setExpenseForm((prev) => ({ ...prev, currency: event.target.value }))}
              >
                <option value="">Selecciona una moneda</option>
                {currencies.length === 0 ? (
                  <option value="" disabled>
                    No hay monedas activas
                  </option>
                ) : (
                  currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {`${currency.code} - ${currency.name}`}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Estado</label>
              <select
                className={inputClass}
                value={expenseForm.status}
                onChange={(event) =>
                  setExpenseForm((prev) => ({ ...prev, status: event.target.value as FinancialExpenseStatus }))
                }
              >
                {expenseStatusOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Proveedor</label>
              <select
                className={inputClass}
                value={expenseForm.providerId ?? ''}
                onChange={(event) =>
                  setExpenseForm((prev) => ({
                    ...prev,
                    providerId: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
              >
                <option value="">Sin proveedor</option>
                {providers.map((provider) => (
                  <option value={provider.id} key={provider.id}>
                    {provider.companyName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Categoría</label>
              <select
                className={inputClass}
                value={expenseForm.categoryId ?? ''}
                onChange={(event) =>
                  setExpenseForm((prev) => ({
                    ...prev,
                    categoryId: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
              >
                <option value="">General</option>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Fecha incurrido</label>
              <input
                type="date"
                className={inputClass}
                value={expenseForm.incurredAt}
                onChange={(event) => setExpenseForm((prev) => ({ ...prev, incurredAt: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Fecha límite</label>
              <input
                type="date"
                className={inputClass}
                value={expenseForm.dueDate}
                onChange={(event) => setExpenseForm((prev) => ({ ...prev, dueDate: event.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Descripción</label>
            <textarea
              rows={3}
              className={textareaClass}
              value={expenseForm.description}
              onChange={(event) => setExpenseForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Etiquetas (separadas por coma)</label>
            <input
              className={inputClass}
              value={expenseForm.tags}
              onChange={(event) => setExpenseForm((prev) => ({ ...prev, tags: event.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className={`${secondaryButtonClass} ${buttonSizeMd}`}
              onClick={() => {
                setExpenseModalOpen(false);
                setExpenseForm(defaultExpenseForm);
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleExpenseSubmit}
              disabled={isSubmitting}
              className={`${primaryButtonClass} ${buttonSizeMd}`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar gasto'}
            </button>
          </div>
        </div>
      </ModernPopup>

      <ModernPopup
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setPaymentForm(defaultPaymentForm);
          setSelectedExpense(null);
        }}
        title={selectedExpense ? `Registrar pago - ${selectedExpense.title}` : 'Registrar pago'}
        subtitle="Aplica un pago parcial o total a tu gasto"
        icon={<Banknote className="h-8 w-8 text-white" />}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Monto pagado</label>
              <input
                type="number"
                className={inputClass}
                value={paymentForm.amount}
                onChange={(event) => setPaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Moneda</label>
              <select
                className={inputClass}
                value={paymentForm.currency}
                onChange={(event) =>
                  setPaymentForm((prev) => ({ ...prev, currency: event.target.value }))
                }
              >
                <option value="">
                  Selecciona una moneda {selectedExpense?.currency ? `(sugerida ${selectedExpense.currency})` : ''}
                </option>
                {currencies.length === 0 ? (
                  <option value="" disabled>
                    No hay monedas activas
                  </option>
                ) : (
                  currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {`${currency.code} - ${currency.name}`}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Fecha de pago</label>
              <input
                type="date"
                className={inputClass}
                value={paymentForm.paymentDate}
                onChange={(event) => setPaymentForm((prev) => ({ ...prev, paymentDate: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Método</label>
              <input
                className={inputClass}
                value={paymentForm.paymentMethod}
                onChange={(event) => setPaymentForm((prev) => ({ ...prev, paymentMethod: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className={labelClass}>Referencia / Comprobante</label>
              <input
                className={inputClass}
                value={paymentForm.reference}
                onChange={(event) => setPaymentForm((prev) => ({ ...prev, reference: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className={labelClass}>Notas</label>
              <textarea
                rows={3}
                className={textareaClass}
                value={paymentForm.notes}
                onChange={(event) => setPaymentForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className={`${secondaryButtonClass} ${buttonSizeMd}`}
              onClick={() => {
                setPaymentModalOpen(false);
                setPaymentForm(defaultPaymentForm);
                setSelectedExpense(null);
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handlePaymentSubmit}
              disabled={isSubmitting}
              className={`${primaryButtonClass} ${buttonSizeMd}`}
            >
              {isSubmitting ? 'Guardando...' : 'Registrar pago'}
            </button>
          </div>
        </div>
      </ModernPopup>

      <ModernPopup
        isOpen={isProviderModalOpen}
        onClose={() => {
          setProviderModalOpen(false);
          setProviderForm(defaultProviderForm);
        }}
        title="Nuevo proveedor / aliado"
        subtitle="Guarda la información clave de tus terceros"
        icon={<PlusCircle className="h-8 w-8 text-white" />}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Nombre comercial</label>
              <input
                className={inputClass}
                value={providerForm.companyName}
                onChange={(event) => setProviderForm((prev) => ({ ...prev, companyName: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Contacto</label>
              <input
                className={inputClass}
                value={providerForm.contactName}
                onChange={(event) => setProviderForm((prev) => ({ ...prev, contactName: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={inputClass}
                value={providerForm.email}
                onChange={(event) => setProviderForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Teléfono</label>
              <input
                className={inputClass}
                value={providerForm.phone}
                onChange={(event) => setProviderForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Documento</label>
              <input
                className={inputClass}
                value={providerForm.documentNumber}
                onChange={(event) => setProviderForm((prev) => ({ ...prev, documentNumber: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Tipo documento</label>
              <select
                className={inputClass}
                value={providerForm.documentType}
                onChange={(event) => setProviderForm((prev) => ({ ...prev, documentType: event.target.value }))}
              >
                <option value="">Selecciona una opción</option>
                {providerDocumentTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Banco</label>
              <input
                className={inputClass}
                value={providerForm.bankName}
                onChange={(event) => setProviderForm((prev) => ({ ...prev, bankName: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Cuenta</label>
              <input
                className={inputClass}
                value={providerForm.bankAccount}
                onChange={(event) => setProviderForm((prev) => ({ ...prev, bankAccount: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Estado</label>
              <select
                className={inputClass}
                value={providerForm.status}
                onChange={(event) => setProviderForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="">Selecciona un estado</option>
                {providerStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Notas</label>
            <textarea
              rows={3}
              className={textareaClass}
              value={providerForm.notes}
              onChange={(event) => setProviderForm((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className={`${secondaryButtonClass} ${buttonSizeMd}`}
              onClick={() => {
                setProviderModalOpen(false);
                setProviderForm(defaultProviderForm);
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleProviderSubmit}
              disabled={isSubmitting}
              className={`${primaryButtonClass} ${buttonSizeMd}`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar proveedor'}
            </button>
          </div>
        </div>
      </ModernPopup>

      <ModernPopup
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setCategoryForm(defaultCategoryForm);
        }}
        title="Nueva categoría financiera"
        subtitle="Organiza tus gastos por tipo, proyecto o estrategia"
        icon={<Layers className="h-8 w-8 text-white" />}
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Nombre</label>
            <input
              className={inputClass}
              value={categoryForm.name}
              onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Tipo / dimensión</label>
            <input
              className={inputClass}
              value={categoryForm.type}
              onChange={(event) => setCategoryForm((prev) => ({ ...prev, type: event.target.value }))}
              placeholder="Marketing, Producción, Capacitación..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Descripción</label>
            <textarea
              rows={3}
              className={textareaClass}
              value={categoryForm.description}
              onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className={`${secondaryButtonClass} ${buttonSizeMd}`}
              onClick={() => {
                setCategoryModalOpen(false);
                setCategoryForm(defaultCategoryForm);
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCategorySubmit}
              disabled={isSubmitting}
              className={`${primaryButtonClass} ${buttonSizeMd}`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar categoría'}
            </button>
          </div>
        </div>
      </ModernPopup>
    </div>
  );
}

