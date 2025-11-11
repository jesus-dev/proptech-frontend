"use client";

import type { FinancialExpenseStatus } from '@/types/financial';

export const providerStatusOptions = [
  { value: 'activo', label: 'Activo' },
  { value: 'incorporacion', label: 'En incorporación' },
  { value: 'suspendido', label: 'Suspendido' },
  { value: 'inactivo', label: 'Inactivo' },
];

export const providerDocumentTypes = [
  { value: 'cedula', label: 'Cédula de Identidad' },
  { value: 'ruc', label: 'RUC' },
  { value: 'pasaporte', label: 'Pasaporte' },
];

export const expenseStatusOptions: { value: FinancialExpenseStatus; label: string }[] = [
  { value: 'PLANNED', label: 'Planeado' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'IN_PROGRESS', label: 'En proceso' },
  { value: 'PARTIALLY_PAID', label: 'Pagado parcialmente' },
  { value: 'PAID', label: 'Pagado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export const getExpenseStatusLabel = (status: FinancialExpenseStatus) =>
  expenseStatusOptions.find((option) => option.value === status)?.label ?? status;

