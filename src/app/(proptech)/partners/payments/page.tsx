"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { partnerPaymentService, PartnerPayment } from "../services/partnerPaymentService";
import { partnerService, Partner } from "../services/partnerService";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { 
  PlusIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from "@heroicons/react/24/outline";
import { format } from 'date-fns';
import { formatPrice } from "@/lib/utils";

interface PaymentStats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

export default function PartnerPaymentsPage() {
  const [payments, setPayments] = useState<PartnerPayment[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState<PaymentStats>({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0
  });
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsData, partnersResponse] = await Promise.all([
        partnerPaymentService.getAllPayments(),
        partnerService.getAllPartners()
      ]);
      
      setPayments(paymentsData);
      setPartners(partnersResponse.content || []);
      calculateStats(paymentsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const calculateStats = (paymentsData: PartnerPayment[]) => {
    const total = paymentsData.length;
    const paid = paymentsData.filter(p => p.status === 'PAID').length;
    const pending = paymentsData.filter(p => p.status === 'PENDING').length;
    const overdue = paymentsData.filter(p => 
      p.status === 'PENDING' && new Date(p.dueDate) < new Date()
    ).length;
    
    const totalAmount = paymentsData.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = paymentsData.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = paymentsData.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);
    const overdueAmount = paymentsData.filter(p => 
      p.status === 'PENDING' && new Date(p.dueDate) < new Date()
    ).reduce((sum, p) => sum + p.amount, 0);

    setStats({
      total,
      paid,
      pending,
      overdue,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount
    });
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkAsPaid = async (payment: PartnerPayment) => {
    try {
      const updatedPayment = await partnerPaymentService.markAsPaid(
        payment.id,
        "TRANSFER",
        `REF-${Date.now()}`,
        "Admin"
      );
      
      const updatedPayments = payments.map(p => p.id === payment.id ? updatedPayment : p);
      setPayments(updatedPayments);
      calculateStats(updatedPayments);
      
      toast({
        title: "Éxito",
        description: "Pago marcado como pagado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar el pago como pagado",
        variant: "destructive",
      });
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este pago?')) {
      return;
    }

    try {
      await partnerPaymentService.deletePayment(paymentId);
      const updatedPayments = payments.filter(p => p.id !== paymentId);
      setPayments(updatedPayments);
      calculateStats(updatedPayments);
      
      toast({
        title: "Éxito",
        description: "Pago eliminado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el pago",
        variant: "destructive",
      });
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const partner = partners.find(p => p.id === payment.partnerId);
      const partnerName = partner ? `${partner.firstName} ${partner.lastName}` : '';
      
      const matchesSearch = 
        (payment.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesType = typeFilter === 'all' || payment.paymentType === typeFilter;
      
      let matchesTab = true;
      if (activeTab === 'pending') matchesTab = payment.status === 'PENDING';
      if (activeTab === 'paid') matchesTab = payment.status === 'PAID';
      if (activeTab === 'overdue') matchesTab = payment.status === 'PENDING' && new Date(payment.dueDate) < new Date();
      if (activeTab === 'cancelled') matchesTab = payment.status === 'CANCELLED';
      
      return matchesSearch && matchesStatus && matchesType && matchesTab;
    });
  }, [payments, partners, searchTerm, statusFilter, typeFilter, activeTab]);

  const getStatusBadge = (status: string, dueDate?: string) => {
    const isOverdue = status === 'PENDING' && dueDate && new Date(dueDate) < new Date();
    
    if (isOverdue) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          Vencido
        </span>
      );
    }
    
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Pagado
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pendiente
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
            Cancelado
          </span>
        );
      default:
        return <span className="text-xs text-gray-500">{status}</span>;
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    return partnerPaymentService.getPaymentTypeLabel(type);
  };

  const handleToggleSelection = (paymentId: number) => {
    setSelectedPayments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPayments.size === filteredPayments.length) {
      setSelectedPayments(new Set());
    } else {
      setSelectedPayments(new Set(filteredPayments.map(p => p.id)));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Premium */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Gestión de Pagos
                </h1>
                <p className="text-brand-100 text-lg">
                  Administra y controla todos los pagos de socios comerciales
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadData}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm"
                  title="Actualizar"
                >
                  <ArrowPathIcon className="w-6 h-6" />
                </button>
                <Link
                  href="/partners/payments/new"
                  className="inline-flex items-center px-6 py-3 bg-white text-brand-600 rounded-xl hover:bg-brand-50 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Nuevo Pago
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Pagos</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                  {formatPrice(stats.totalAmount, 'USD')}
                </p>
              </div>
              <div className="p-4 bg-blue-500 rounded-xl">
                <BanknotesIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 rounded-xl shadow-lg p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Pagados</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.paid}</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  {formatPrice(stats.paidAmount, 'USD')}
                </p>
              </div>
              <div className="p-4 bg-green-500 rounded-xl">
                <CheckCircleIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-800/30 rounded-xl shadow-lg p-6 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pending}</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                  {formatPrice(stats.pendingAmount, 'USD')}
                </p>
              </div>
              <div className="p-4 bg-yellow-500 rounded-xl">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/30 dark:to-rose-800/30 rounded-xl shadow-lg p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Vencidos</p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100">{stats.overdue}</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  {formatPrice(stats.overdueAmount, 'USD')}
                </p>
              </div>
              <div className="p-4 bg-red-500 rounded-xl">
                <ExclamationTriangleIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Premium */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por socio, descripción o número de pago..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all font-medium"
              >
                <option value="all">Todos los estados</option>
                <option value="PAID">Pagados</option>
                <option value="PENDING">Pendientes</option>
                <option value="CANCELLED">Cancelados</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all font-medium"
              >
                <option value="all">Todos los tipos</option>
                <option value="SOCIAL_DUES">Cuota Social</option>
                <option value="PROPTECH">Proptech</option>
                <option value="QUOTA">Cuotas</option>
                <option value="COMMISSION">Comisiones</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs Premium */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-1 px-4">
              {[
                { id: 'all', label: 'Todos', count: stats.total, icon: BanknotesIcon },
                { id: 'pending', label: 'Pendientes', count: stats.pending, icon: ClockIcon },
                { id: 'paid', label: 'Pagados', count: stats.paid, icon: CheckCircleIcon },
                { id: 'overdue', label: 'Vencidos', count: stats.overdue, icon: ExclamationTriangleIcon },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 border-b-2 font-semibold text-sm transition-all ${
                      activeTab === tab.id
                        ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-2 ${activeTab === tab.id ? 'text-brand-600 dark:text-brand-400' : ''}`} />
                    {tab.label}
                    <span className={`ml-2 py-1 px-2.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Payments Table Premium */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Pagos ({filteredPayments.length})
              </h3>
              {selectedPayments.size > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPayments.size} seleccionados
                  </span>
                  <button className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium">
                    Procesar Seleccionados
                  </button>
                </div>
              )}
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <BanknotesIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No hay pagos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza creando tu primer pago'
                }
              </p>
              <Link
                href="/partners/payments/new"
                className="inline-flex items-center px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Crear Primer Pago
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedPayments.size === filteredPayments.length && filteredPayments.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Socio / Descripción
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                      Vencimiento
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPayments.map((payment) => {
                    const partner = partners.find(p => p.id === payment.partnerId);
                    const isOverdue = payment.status === 'PENDING' && new Date(payment.dueDate) < new Date();
                    
                    return (
                      <tr 
                        key={payment.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedPayments.has(payment.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        } ${isOverdue ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedPayments.has(payment.id)}
                            onChange={() => handleToggleSelection(payment.id)}
                            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {payment.description || 'Sin descripción'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                              <UserIcon className="w-4 h-4 mr-1" />
                              {partner ? `${partner.firstName} ${partner.lastName}` : `ID: ${payment.partnerId}`}
                            </div>
                            {payment.paymentNumber && (
                              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                #{payment.paymentNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {getPaymentTypeLabel(payment.paymentType)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {formatPrice(payment.amount, payment.currency as "USD" | "PYG")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(payment.status, payment.dueDate)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-900 dark:text-white'}>
                              {format(new Date(payment.dueDate), 'dd/MM/yyyy')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {payment.status === 'PENDING' && (
                              <button
                                onClick={() => handleMarkAsPaid(payment)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Marcar como pagado"
                              >
                                <CheckCircleIcon className="w-5 h-5" />
                              </button>
                            )}
                            <Link
                              href={`/partners/${payment.partnerId}/payments`}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Ver detalles"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
