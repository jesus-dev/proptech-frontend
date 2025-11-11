'use client';

import { useEffect, useMemo, useState } from 'react';
import { financialService } from '@/services/financialService';
import type { FinancialProvider } from '@/types/financial';
import ModernPopup from '@/components/ui/ModernPopup';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, Edit, Trash2, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  providerDocumentTypes,
  providerStatusOptions,
} from '../constants';

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

const defaultForm: ProviderFormState = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  documentNumber: '',
  documentType: '',
  bankName: '',
  bankAccount: '',
  status: 'activo',
  notes: '',
};

const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60';
const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60';
const labelClass = 'text-sm font-medium text-gray-700';
const inputClass =
  'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500';
const textareaClass =
  'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500';

export default function FinancialProvidersPage() {
  const [providers, setProviders] = useState<FinancialProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [formState, setFormState] = useState<ProviderFormState>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProvider, setEditingProvider] = useState<FinancialProvider | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const data = await financialService.getProviders();
      setProviders(data);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProvider(null);
    setFormState(defaultForm);
    setModalOpen(true);
  };

  const openEditModal = (provider: FinancialProvider) => {
    setEditingProvider(provider);
    setFormState({
      companyName: provider.companyName ?? '',
      contactName: provider.contactName ?? '',
      email: provider.email ?? '',
      phone: provider.phone ?? '',
      documentNumber: provider.documentNumber ?? '',
      documentType: provider.documentType ?? '',
      bankName: provider.bankName ?? '',
      bankAccount: provider.bankAccount ?? '',
      status: provider.status ?? 'activo',
      notes: provider.notes ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formState.companyName.trim()) {
      alert('El nombre comercial es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProvider) {
        await financialService.updateProvider(editingProvider.id!, formState);
      } else {
        await financialService.createProvider(formState);
      }
      setModalOpen(false);
      setFormState(defaultForm);
      await loadProviders();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (provider: FinancialProvider) => {
    const confirmDelete = window.confirm(
      `¿Eliminar al proveedor ${provider.companyName}? Esta acción no se puede deshacer.`
    );
    if (!confirmDelete) return;

    try {
      await financialService.deleteProvider(provider.id!);
      await loadProviders();
    } catch (error) {
      console.error('Error deleting provider:', error);
      alert('No se pudo eliminar el proveedor.');
    }
  };

  const filteredProviders = useMemo(() => {
    if (!search.trim()) return providers;
    const normalized = search.trim().toLowerCase();
    return providers.filter((provider) =>
      [
        provider.companyName,
        provider.contactName,
        provider.email,
        provider.phone,
        provider.documentNumber,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized))
    );
  }, [providers, search]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                <Shield className="h-3.5 w-3.5" />
                Gestión de proveedores
              </span>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Proveedores financieros</CardTitle>
                <p className="text-sm text-gray-600">
                  Administra los terceros que participan en tus pagos e inversiones.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 md:w-64"
                placeholder="Buscar proveedor..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button type="button" className={primaryButtonClass} onClick={openCreateModal}>
                <PlusCircle className="h-4 w-4" />
                Nuevo proveedor
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">Proveedor</th>
                    <th className="px-6 py-3">Contacto</th>
                    <th className="px-6 py-3">Documento</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Banco</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-500" />
                        <p className="mt-2 text-sm text-gray-500">Cargando proveedores…</p>
                      </td>
                    </tr>
                  ) : filteredProviders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No se encontraron proveedores. Crea uno nuevo para comenzar.
                      </td>
                    </tr>
                  ) : (
                    filteredProviders.map((provider) => (
                      <tr key={provider.id} className="text-sm text-gray-700 transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{provider.companyName}</div>
                          {provider.email && (
                            <p className="text-xs text-gray-500">{provider.email}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {provider.contactName ? (
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">{provider.contactName}</div>
                              {provider.phone && <p className="text-xs text-gray-500">{provider.phone}</p>}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Sin contacto</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {provider.documentNumber ? (
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">{provider.documentNumber}</p>
                              {provider.documentType && (
                                <p className="text-xs text-gray-500">
                                  {providerDocumentTypes.find((option) => option.value === provider.documentType)?.label ??
                                    provider.documentType}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No especificado</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="border border-brand-200 bg-brand-50 text-brand-600 uppercase text-[11px]">
                            {providerStatusOptions.find((option) => option.value === provider.status)?.label ??
                              provider.status ??
                              'Activo'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {provider.bankName ? (
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">{provider.bankName}</div>
                              {provider.bankAccount && (
                                <p className="text-xs text-gray-500">Cuenta: {provider.bankAccount}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No informado</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className={`${secondaryButtonClass} px-3 py-2 text-xs`}
                              onClick={() => openEditModal(provider)}
                            >
                              <Edit className="h-4 w-4" />
                              Editar
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              onClick={() => handleDelete(provider)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
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
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setTimeout(() => setFormState(defaultForm), 200);
        }}
        title={editingProvider ? 'Editar proveedor' : 'Nuevo proveedor'}
        subtitle="Administra la información de tus aliados financieros"
        icon={<Shield className="h-8 w-8 text-white" />}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Nombre comercial</label>
              <input
                className={inputClass}
                value={formState.companyName}
                onChange={(event) => setFormState((prev) => ({ ...prev, companyName: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Contacto</label>
              <input
                className={inputClass}
                value={formState.contactName}
                onChange={(event) => setFormState((prev) => ({ ...prev, contactName: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={inputClass}
                value={formState.email}
                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Teléfono</label>
              <input
                className={inputClass}
                value={formState.phone}
                onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Documento</label>
              <input
                className={inputClass}
                value={formState.documentNumber}
                onChange={(event) => setFormState((prev) => ({ ...prev, documentNumber: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Tipo de documento</label>
              <select
                className={inputClass}
                value={formState.documentType}
                onChange={(event) => setFormState((prev) => ({ ...prev, documentType: event.target.value }))}
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
                value={formState.bankName}
                onChange={(event) => setFormState((prev) => ({ ...prev, bankName: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Cuenta</label>
              <input
                className={inputClass}
                value={formState.bankAccount}
                onChange={(event) => setFormState((prev) => ({ ...prev, bankAccount: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Estado</label>
              <select
                className={inputClass}
                value={formState.status}
                onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}
              >
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
              value={formState.notes}
              onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => {
                setModalOpen(false);
                setTimeout(() => setFormState(defaultForm), 200);
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={primaryButtonClass}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando…' : editingProvider ? 'Actualizar' : 'Crear proveedor'}
            </button>
          </div>
        </div>
      </ModernPopup>
    </div>
  );
}

