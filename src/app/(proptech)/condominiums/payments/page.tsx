"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  DocumentTextIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import { condominiumPaymentService, CondominiumFeePayment } from "@/services/condominiumPaymentService";
import { condominiumFeeService, CondominiumFee } from "@/services/condominiumFeeService";
import { condominiumUnitService, CondominiumUnit } from "@/services/condominiumUnitService";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Pagination from "@/components/common/Pagination";
import ModernPopup from "@/components/ui/ModernPopup";

export default function CondominiumPaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<CondominiumFeePayment[]>([]);
  const [fees, setFees] = useState<CondominiumFee[]>([]);
  const [units, setUnits] = useState<CondominiumUnit[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedFeeId, setSelectedFeeId] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<CondominiumFeePayment | null>(null);
  const [formData, setFormData] = useState<Partial<CondominiumFeePayment>>({
    feeId: 0,
    unitId: 0,
    amount: 0,
    status: 'PENDING',
    paymentDate: '',
    paymentMethod: '',
    transactionReference: '',
    notes: ''
  });

  useEffect(() => {
    loadFees();
    loadUnits();
    loadPayments();
  }, [page, selectedFeeId, selectedUnitId, statusFilter]);

  const loadFees = async () => {
    try {
      const response = await condominiumFeeService.getFeesPaginated({ limit: 1000 });
      setFees(response.fees || []);
    } catch (error: any) {
      console.error("Error loading fees:", error);
    }
  };

  const loadUnits = async () => {
    try {
      const response = await condominiumUnitService.getUnitsPaginated({ limit: 1000 });
      setUnits(response.units || []);
    } catch (error: any) {
      console.error("Error loading units:", error);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const filters: any = {
        page,
        limit: 12
      };
      
      if (selectedFeeId) {
        filters.feeId = selectedFeeId;
      }
      
      if (selectedUnitId) {
        filters.unitId = selectedUnitId;
      }
      
      if (statusFilter) {
        filters.status = statusFilter;
      }
      
      const response = await condominiumPaymentService.getPaymentsPaginated(filters);
      setPayments(response.payments || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 0);
    } catch (error: any) {
      console.error("Error loading payments:", error);
      toast.error(error?.message || "Error al cargar pagos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este pago?")) return;
    try {
      await condominiumPaymentService.deletePayment(id);
      toast.success("Pago eliminado exitosamente");
      loadPayments();
    } catch (error: any) {
      toast.error(error?.message || "Error al eliminar pago");
    }
  };

  const openModal = (payment?: CondominiumFeePayment) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        feeId: payment.feeId || 0,
        unitId: payment.unitId || 0,
        amount: payment.amount || 0,
        status: payment.status || 'PENDING',
        paymentDate: payment.paymentDate || '',
        paymentMethod: payment.paymentMethod || '',
        transactionReference: payment.transactionReference || '',
        notes: payment.notes || ''
      });
    } else {
      setEditingPayment(null);
      setFormData({
        feeId: selectedFeeId || (fees.length > 0 ? fees[0].id : 0),
        unitId: selectedUnitId || (units.length > 0 ? units[0].id : 0),
        amount: 0,
        status: 'PENDING',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        transactionReference: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPayment) {
        await condominiumPaymentService.updatePayment(editingPayment.id, formData);
        toast.success("Pago actualizado exitosamente");
      } else {
        await condominiumPaymentService.createPayment(formData);
        toast.success("Pago registrado exitosamente");
      }
      setShowModal(false);
      loadPayments();
    } catch (error: any) {
      toast.error(error?.message || "Error al guardar pago");
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
                Gestión de Pagos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Administra los pagos de cuotas de los condominios
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <PlusIcon className="w-5 h-5" />
              Registrar Pago
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cuota
              </label>
              <select
                value={selectedFeeId || ''}
                onChange={(e) => {
                  setSelectedFeeId(e.target.value ? parseInt(e.target.value) : null);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todas las cuotas</option>
                {fees.map((fee) => (
                  <option key={fee.id} value={fee.id}>
                    {fee.period} - {fee.type} - {fee.condominiumName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unidad
              </label>
              <select
                value={selectedUnitId || ''}
                onChange={(e) => {
                  setSelectedUnitId(e.target.value ? parseInt(e.target.value) : null);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todas las unidades</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.unitNumber} - {unit.condominiumName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="PAID">Pagado</option>
                <option value="OVERDUE">Vencido</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : payments.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Período</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Pago</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Método</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{payment.feePeriod || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">{payment.unitNumber || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(payment.amount || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('es-PY') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">{payment.paymentMethod || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                            payment.status === 'PAID'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : payment.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {payment.status === 'PAID' ? 'Pagado' : payment.status === 'PENDING' ? 'Pendiente' : payment.status || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal(payment)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Editar"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(payment.id)}
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
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No hay pagos registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ModernPopup
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPayment ? 'Editar Pago' : 'Registrar Pago'}
        subtitle={editingPayment ? 'Modifica los datos del pago' : 'Registra un nuevo pago de cuota'}
        icon={<DocumentTextIcon className="w-6 h-6 text-white" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Cuota *
              </label>
              <select
                value={formData.feeId || 0}
                onChange={(e) => setFormData({ ...formData, feeId: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value={0}>Seleccionar cuota...</option>
                {fees.map((fee) => (
                  <option key={fee.id} value={fee.id}>
                    {fee.period} - {fee.type} - {fee.condominiumName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Unidad *
              </label>
              <select
                value={formData.unitId || 0}
                onChange={(e) => setFormData({ ...formData, unitId: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value={0}>Seleccionar unidad...</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.unitNumber} - {unit.condominiumName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Monto *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || 0}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Estado *
              </label>
              <select
                value={formData.status || 'PENDING'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="PENDING">Pendiente</option>
                <option value="PAID">Pagado</option>
                <option value="OVERDUE">Vencido</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Pago
              </label>
              <input
                type="date"
                value={formData.paymentDate || ''}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Método de Pago
              </label>
              <select
                value={formData.paymentMethod || ''}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Seleccionar método...</option>
                <option value="CASH">Efectivo</option>
                <option value="TRANSFER">Transferencia</option>
                <option value="CHECK">Cheque</option>
                <option value="CARD">Tarjeta</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Referencia de Transacción
              </label>
              <input
                type="text"
                value={formData.transactionReference || ''}
                onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Número de comprobante..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Notas
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Notas adicionales..."
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
              {editingPayment ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </ModernPopup>
    </div>
  );
}
