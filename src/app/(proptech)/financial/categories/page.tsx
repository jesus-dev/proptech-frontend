'use client';

import { useEffect, useState } from 'react';
import { financialService } from '@/services/financialService';
import type { FinancialCategory } from '@/types/financial';
import ModernPopup from '@/components/ui/ModernPopup';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, Layers, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type CategoryFormState = {
  name: string;
  description: string;
  type: string;
};

const defaultForm: CategoryFormState = {
  name: '',
  description: '',
  type: '',
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

export default function FinancialCategoriesPage() {
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [formState, setFormState] = useState<CategoryFormState>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await financialService.getCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormState(defaultForm);
    setModalOpen(true);
  };

  const openEditModal = (category: FinancialCategory) => {
    setEditingCategory(category);
    setFormState({
      name: category.name ?? '',
      description: category.description ?? '',
      type: category.type ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formState.name.trim()) {
      alert('El nombre es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await financialService.updateCategory(editingCategory.id!, formState);
      } else {
        await financialService.createCategory(formState);
      }
      setModalOpen(false);
      setFormState(defaultForm);
      await loadCategories();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: FinancialCategory) => {
    const confirmDelete = window.confirm(
      `¿Eliminar la categoría ${category.name}? Esta acción no se puede deshacer.`
    );
    if (!confirmDelete) return;

    try {
      await financialService.deleteCategory(category.id!);
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('No se pudo eliminar la categoría.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                <Layers className="h-3.5 w-3.5" />
                Catálogos financieros
              </span>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Categorías de gastos</CardTitle>
                <p className="text-sm text-gray-600">
                  Define los agrupadores que usarás al registrar gastos e inversiones.
                </p>
              </div>
            </div>
            <button type="button" className={primaryButtonClass} onClick={openCreateModal}>
              <PlusCircle className="h-4 w-4" />
              Nueva categoría
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">Nombre</th>
                    <th className="px-6 py-3">Descripción</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-500" />
                        <p className="mt-2 text-sm text-gray-500">Cargando categorías…</p>
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No hay categorías registradas. Crea una nueva para comenzar.
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category.id} className="text-sm text-gray-700 transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{category.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          {category.description ? (
                            <p className="text-sm text-gray-600">{category.description}</p>
                          ) : (
                            <span className="text-xs text-gray-400">Sin descripción</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {category.type ? (
                            <Badge className="border border-gray-200 bg-gray-100 text-gray-700">{category.type}</Badge>
                          ) : (
                            <span className="text-xs text-gray-400">General</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className={`${secondaryButtonClass} px-3 py-2 text-xs`}
                              onClick={() => openEditModal(category)}
                            >
                              <Edit className="h-4 w-4" />
                              Editar
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              onClick={() => handleDelete(category)}
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
        title={editingCategory ? 'Editar categoría' : 'Nueva categoría'}
        subtitle="Organiza tus gastos por tipo, proyecto o estrategia"
        icon={<Layers className="h-8 w-8 text-white" />}
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Nombre</label>
            <input
              className={inputClass}
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Tipo / dimensión</label>
            <input
              className={inputClass}
              value={formState.type}
              onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value }))}
              placeholder="Ej: Producción, Capacitación, Marketing..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Descripción</label>
            <textarea
              rows={4}
              className={textareaClass}
              value={formState.description}
              onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
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
              {isSubmitting ? 'Guardando…' : editingCategory ? 'Actualizar' : 'Crear categoría'}
            </button>
          </div>
        </div>
      </ModernPopup>
    </div>
  );
}

