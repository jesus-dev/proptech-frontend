"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CurrencyDollarIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { condominiumFeeService, CondominiumFee } from "@/services/condominiumFeeService";
import { condominiumService, Condominium } from "@/services/condominiumService";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Pagination from "@/components/common/Pagination";
import ModernPopup from "@/components/ui/ModernPopup";

export default function CondominiumFeesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState<CondominiumFee[]>([]);
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCondominiumId, setSelectedCondominiumId] = useState<number | null>(null);
  const [periodFilter, setPeriodFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState<CondominiumFee | null>(null);
  const [formData, setFormData] = useState<Partial<CondominiumFee>>({
    condominiumId: 0,
    period: '',
    totalAmount: 0,
    type: 'COMMON',
    description: '',
    dueDate: '',
    isActive: true
  });

  useEffect(() => {
    loadCondominiums();
    loadFees();
  }, [page, selectedCondominiumId, periodFilter, typeFilter]);

  const loadCondominiums = async () => {
    try {
      const response = await condominiumService.getCondominiumsPaginated({ limit: 1000 });
      setCondominiums(response.condominiums || []);
    } catch (error: any) {
      console.error("Error loading condominiums:", error);
    }
  };

  const loadFees = async () => {
    try {
      setLoading(true);
      const filters: any = {
        page,
        limit: 12
      };
      
      if (selectedCondominiumId) {
        filters.condominiumId = selectedCondominiumId;
      }
      
      if (periodFilter) {
        filters.period = periodFilter;
      }
      
      if (typeFilter) {
        filters.type = typeFilter;
      }
      
      const response = await condominiumFeeService.getFeesPaginated(filters);
      setFees(response.fees || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 0);
    } catch (error: any) {
      console.error("Error loading fees:", error);
      toast.error(error?.message || "Error al cargar cuotas");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta cuota?")) return;
    try {
      await condominiumFeeService.deleteFee(id);
      toast.success("Cuota eliminada exitosamente");
      loadFees();
    } catch (error: any) {
      toast.error(error?.message || "Error al eliminar cuota");
    }
  };

  const openModal = (fee?: CondominiumFee) => {
    if (fee) {
      setEditingFee(fee);
      setFormData({
        condominiumId: fee.condominiumId,
        period: fee.period || '',
        totalAmount: fee.totalAmount || 0,
        type: fee.type || 'COMMON',
        description: fee.description || '',
        dueDate: fee.dueDate || '',
        isActive: fee.isActive
      });
    } else {
      setEditingFee(null);
      const now = new Date();
      const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setFormData({
        condominiumId: selectedCondominiumId || 0,
        period: currentPeriod,
        totalAmount: 0,
        type: 'COMMON',
        description: '',
        dueDate: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFee) {
        await condominiumFeeService.updateFee(editingFee.id, formData);
        toast.success("Cuota actualizada exitosamente");
      } else {
        await condominiumFeeService.createFee(formData);
        toast.success("Cuota creada exitosamente");
      }
      setShowModal(false);
      loadFees();
    } catch (error: any) {
      toast.error(error?.message || "Error al guardar cuota");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/condominiums"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver a Administración de Condominio
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Gestión de Cuotas
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Administra las cuotas de mantenimiento de los condominios
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <PlusIcon className="w-5 h-5" />
              Nueva Cuota
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Condominio
              </label>
              <select
                value={selectedCondominiumId || ''}
                onChange={(e) => {
                  setSelectedCondominiumId(e.target.value ? parseInt(e.target.value) : null);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todos los condominios</option>
                {condominiums.map((condo) => (
                  <option key={condo.id} value={condo.id}>
                    {condo.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Período (YYYY-MM)
              </label>
              <input
                type="text"
                pattern="[0-9]{4}-[0-9]{2}"
                value={periodFilter}
                onChange={(e) => {
                  setPeriodFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="2024-01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todos los tipos</option>
                <option value="COMMON">Ordinaria</option>
                <option value="EXTRAORDINARY">Extraordinaria</option>
                <option value="SPECIAL">Especial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fees Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : fees.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Período</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Condominio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vencimiento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {fees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{fee.period}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/condominiums/${fee.condominiumId}`}
                            className="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {fee.condominiumName || `Condominio ${fee.condominiumId}`}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">{fee.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(fee.totalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('es-PY') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                            fee.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {fee.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal(fee)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Editar"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(fee.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Eliminar"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalElements={total}
                    pageSize={12}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No hay cuotas registradas</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ModernPopup
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingFee ? 'Editar Cuota' : 'Nueva Cuota'}
        subtitle={editingFee ? 'Modifica los datos de la cuota' : 'Genera una nueva cuota de mantenimiento'}
        icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Condominio *
              </label>
              <select
                value={formData.condominiumId || 0}
                onChange={(e) => setFormData({ ...formData, condominiumId: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value={0}>Seleccionar condominio...</option>
                {condominiums.map((condo) => (
                  <option key={condo.id} value={condo.id}>
                    {condo.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Período * (YYYY-MM)
              </label>
              <input
                type="text"
                pattern="[0-9]{4}-[0-9]{2}"
                value={formData.period || ''}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="2024-01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tipo *
              </label>
              <select
                value={formData.type || 'COMMON'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="COMMON">Ordinaria</option>
                <option value="EXTRAORDINARY">Extraordinaria</option>
                <option value="SPECIAL">Especial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Monto Total *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.totalAmount || 0}
                onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Descripción de la cuota..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingFee ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </ModernPopup>
    </div>
  );
}
