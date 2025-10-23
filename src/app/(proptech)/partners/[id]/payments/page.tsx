"use client";

import { ArrowLeftIcon, CalendarIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, ClockIcon, CurrencyDollarIcon, DocumentArrowDownIcon, ExclamationTriangleIcon, EyeIcon, FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Partner, partnerService } from "../../services/partnerService";
import { PartnerPayment, partnerPaymentService } from "../../services/partnerPaymentService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";

import { format, isAfter, isBefore, startOfDay } from 'date-fns';

interface PaymentFilters {
  status: string;
  paymentType: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

export default function PartnerPaymentsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [payments, setPayments] = useState<PartnerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PaymentFilters>({
    status: "all",
    paymentType: "all",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: ""
  });

  const partnerId = Number(params?.id);

  useEffect(() => {
    if (partnerId) {
      loadData();
    }
  }, [partnerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [partnerData, paymentsData] = await Promise.all([
        partnerService.getPartnerById(partnerId),
        partnerPaymentService.getPaymentsByPartner(partnerId)
      ]);
      
      setPartner(partnerData);
      setPayments(paymentsData);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar los datos",
        variant: "destructive",
      });
      router.push("/partners");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado y búsqueda avanzada
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      // Búsqueda por texto
      const matchesSearch = searchTerm === "" || 
        payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.partnerName?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtros
      const matchesStatus = filters.status === "all" || payment.status === filters.status;
      const matchesType = filters.paymentType === "all" || payment.paymentType === filters.paymentType;
      
      const matchesDateFrom = !filters.dateFrom || 
        isAfter(new Date(payment.dueDate), startOfDay(new Date(filters.dateFrom)));
      const matchesDateTo = !filters.dateTo || 
        isBefore(new Date(payment.dueDate), startOfDay(new Date(filters.dateTo)));
      
      const matchesAmountMin = !filters.amountMin || payment.amount >= parseFloat(filters.amountMin);
      const matchesAmountMax = !filters.amountMax || payment.amount <= parseFloat(filters.amountMax);

      return matchesSearch && matchesStatus && matchesType && 
             matchesDateFrom && matchesDateTo && matchesAmountMin && matchesAmountMax;
    });
  }, [payments, searchTerm, filters]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = filteredPayments.length;
    const paid = filteredPayments.filter(p => p.status === 'PAID').length;
    const pending = filteredPayments.filter(p => p.status === 'PENDING').length;
    const overdue = filteredPayments.filter(p => 
      p.status === 'PENDING' && isBefore(new Date(p.dueDate), new Date())
    ).length;
    
    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = filteredPayments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = filteredPayments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      total,
      paid,
      pending,
      overdue,
      totalAmount,
      paidAmount,
      pendingAmount
    };
  }, [filteredPayments]);

  const handleMarkAsPaid = async (payment: PartnerPayment) => {
    try {
      const updatedPayment = await partnerPaymentService.markAsPaid(
        payment.id,
        "TRANSFER",
        `REF-${Date.now()}`,
        "Admin"
      );
      setPayments(payments.map(p => p.id === payment.id ? updatedPayment : p));
      toast({
        title: "Éxito",
        description: "Pago marcado como pagado",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo marcar el pago como pagado",
        variant: "destructive",
      });
    }
  };

  const handleDeletePayment = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este pago?")) {
      return;
    }

    try {
      await partnerPaymentService.deletePayment(id);
      setPayments(payments.filter(p => p.id !== id));
      toast({
        title: "Éxito",
        description: "Pago eliminado correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el pago",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Descripción', 'Monto', 'Moneda', 'Estado', 'Fecha Vencimiento', 'Fecha Pago', 'Tipo'];
    const csvContent = [
      headers.join(','),
      ...filteredPayments.map(p => [
        p.id,
        `"${p.description || ''}"`,
        p.amount,
        p.currency,
        p.status,
        p.dueDate,
        p.paymentDate || '',
        p.paymentType
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pagos_${partner?.firstName}_${partner?.lastName}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (payment: PartnerPayment) => {
    if (payment.status === 'PAID') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Pagado
        </span>
      );
    }
    
    if (isBefore(new Date(payment.dueDate), new Date())) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          Vencido
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
        <ClockIcon className="w-3 h-3 mr-1" />
        Pendiente
      </span>
    );
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels = {
      'FEE': 'Membresía',
      'QUOTA': 'Cuota',
      'COMMISSION': 'Comisión',
      'BONUS': 'Bono',
      'ADVANCE': 'Adelanto',
      'REFUND': 'Reembolso',
      'PENALTY': 'Penalización'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return formatPrice(amount, currency as "USD" | "PYG");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Socio no encontrado
          </h2>
          <Link href="/partners" className="text-brand-600 hover:text-brand-700">
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/partners/${partner.id}`}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Historial de Pagos - {partner.firstName} {partner.lastName}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Gestión completa de suscripciones y transacciones
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Exportar CSV
              </button>
              <Link
                href={`/partners/${partner.id}/dashboard`}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                Ver Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pagos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.paid}</p>
                <p className="text-sm text-green-600">{formatCurrency(stats.paidAmount, 'USD')}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                <p className="text-sm text-yellow-600">{formatCurrency(stats.pendingAmount, 'USD')}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vencidos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overdue}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar pagos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filtros
              {showFilters ? (
                <ChevronUpIcon className="w-4 h-4 ml-2" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 ml-2" />
              )}
            </button>

            {/* Limpiar filtros */}
            {(filters.status !== "all" || filters.paymentType !== "all" || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax) && (
              <button
                onClick={() => setFilters({
                  status: "all",
                  paymentType: "all",
                  dateFrom: "",
                  dateTo: "",
                  amountMin: "",
                  amountMax: ""
                })}
                className="flex items-center px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Limpiar
              </button>
            )}
          </div>

          {/* Panel de filtros expandible */}
          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Todos</option>
                  <option value="PAID">Pagado</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="OVERDUE">Vencido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Pago
                </label>
                <select
                  value={filters.paymentType}
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Todos</option>
                  <option value="FEE">Membresía</option>
                  <option value="QUOTA">Cuota</option>
                  <option value="COMMISSION">Comisión</option>
                  <option value="BONUS">Bono</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto Mínimo
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.amountMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, amountMin: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto Máximo
                </label>
                <input
                  type="number"
                  placeholder="999999"
                  value={filters.amountMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, amountMax: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tabla de Pagos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Historial de Transacciones ({filteredPayments.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.description}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            #{payment.paymentNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getPaymentTypeLabel(payment.paymentType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {format(new Date(payment.dueDate), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {payment.paymentDate ? format(new Date(payment.paymentDate), 'dd/MM/yyyy') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {payment.status === 'PENDING' && (
                            <button
                              onClick={() => handleMarkAsPaid(payment)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Marcar como pagado"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Eliminar"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center">
                        <CurrencyDollarIcon className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No se encontraron pagos</p>
                        <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 