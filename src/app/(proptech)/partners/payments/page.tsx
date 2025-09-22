"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";
import { 
  CreditCard,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [showMembershipModal, setShowMembershipModal] = useState(false);
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
      setPartners(partnersResponse.content);
      
      // Calcular estadísticas
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
      
      setPayments(payments.map(p => p.id === payment.id ? updatedPayment : p));
      calculateStats(payments.map(p => p.id === payment.id ? updatedPayment : p));
      
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

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = (payment.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (partners.find(p => p.id === payment.partnerId)?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.paymentType === typeFilter;
    
    let matchesTab = true;
    if (activeTab === 'pending') matchesTab = payment.status === 'PENDING';
    if (activeTab === 'paid') matchesTab = payment.status === 'PAID';
    if (activeTab === 'overdue') matchesTab = payment.status === 'PENDING' && new Date(payment.dueDate) < new Date();
    if (activeTab === 'cancelled') matchesTab = payment.status === 'CANCELLED';
    
    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  const getStatusBadge = (status: string, dueDate?: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Pagado</Badge>;
      case 'PENDING':
        if (dueDate && new Date(dueDate) < new Date()) {
          return <Badge className="bg-red-100 text-red-800 border-red-200">Vencido</Badge>;
        }
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'QUOTA':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Cuota</Badge>;
      case 'COMMISSION':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Comisión</Badge>;
      case 'BONUS':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Bono</Badge>;
      case 'ADVANCE':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Adelanto</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestión de Pagos
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Administra los pagos de membresía y comisiones de socios
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/partners/payments/new"
                className="inline-flex items-center justify-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Nuevo Pago
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pagos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pagados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.paid}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatCurrency(stats.paidAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatCurrency(stats.pendingAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vencidos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overdue}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatCurrency(stats.overdueAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar pagos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="PAID">Pagados</option>
              <option value="PENDING">Pendientes</option>
              <option value="CANCELLED">Cancelados</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Todos los tipos</option>
              <option value="QUOTA">Cuotas</option>
              <option value="COMMISSION">Comisiones</option>
              <option value="BONUS">Bonos</option>
              <option value="ADVANCE">Adelantos</option>
            </select>
                           <Button variant="outline" onClick={loadData}>
                 <RefreshCw className="h-4 w-4 mr-2" />
                 Actualizar
               </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'all', label: 'Todos', count: stats.total },
                { id: 'pending', label: 'Pendientes', count: stats.pending },
                { id: 'paid', label: 'Pagados', count: stats.paid },
                { id: 'overdue', label: 'Vencidos', count: stats.overdue },
                { id: 'cancelled', label: 'Cancelados', count: payments.filter(p => p.status === 'CANCELLED').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Pagos ({filteredPayments.length})
              </h3>
                             <Button variant="outline" size="sm">
                 <Download className="h-4 w-4 mr-2" />
                 Exportar
               </Button>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="p-8 text-center">
              <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay pagos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay pagos registrados'
                }
              </p>
              <Link
                href="/partners/payments/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Crear Primer Pago
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayments.map((payment) => {
                const partner = partners.find(p => p.id === payment.partnerId);
                return (
                  <div key={payment.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <BanknotesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                                                     <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                             {payment.description || 'Sin descripción'}
                           </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Socio: {partner ? `${partner.firstName} ${partner.lastName}` : `ID: ${payment.partnerId}`}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(payment.status, payment.dueDate)}
                            {getTypeBadge(payment.paymentType)}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(payment.amount, payment.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {payment.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsPaid(payment)}
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Marcar Pagado
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Fecha de vencimiento:</span>
                        <span className="font-medium">
                          {new Date(payment.dueDate).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Creado por:</span>
                                                 <span className="font-medium">Sistema</span>
                      </div>
                      <div className="flex items-center space-x-2">
                                                 <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Método:</span>
                        <span className="font-medium">{payment.paymentMethod || 'No especificado'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 