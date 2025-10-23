"use client";

import { ArrowLeftIcon, CalendarIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, EyeIcon, PencilIcon, PlayIcon, TrashIcon } from "@heroicons/react/24/outline";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { partnerPaymentService, PartnerPayment } from "../../services/partnerPaymentService";
import { partnerService, Partner } from "../../services/partnerService";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import Link from "next/link";

export default function PartnerSubscriptionsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [payments, setPayments] = useState<PartnerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

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
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (payment: PartnerPayment) => {
    try {
      const updatedPayment = await partnerPaymentService.markAsPaid(
        payment.id,
        "TRANSFER",
        `REF-${Date.now()}`,
        "Admin"
      );
      
      setPayments(payments.map(p => p.id === payment.id ? updatedPayment : p));
      
      // Generar automáticamente el siguiente pago de suscripción
      if (payment.paymentType === 'QUOTA' && partner) {
        await generateNextSubscriptionPayment(payment.amount, payment.currency);
      }
      
      toast({
        title: "Éxito",
        description: "Pago marcado como pagado y generado el siguiente pago de suscripción",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo marcar el pago como pagado",
        variant: "destructive",
      });
    }
  };

  const generateNextSubscriptionPayment = async (amount: number, currency: string) => {
    if (!partner) return;

    try {
      const lastPayment = payments
        .filter(p => p.paymentType === 'QUOTA')
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];

      let nextDueDate = new Date();
      if (lastPayment) {
        nextDueDate = new Date(lastPayment.dueDate);
      }

      // Calcular la siguiente fecha según la frecuencia
      switch (partner.paymentFrequency) {
        case 'MONTHLY':
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          break;
        case 'QUARTERLY':
          nextDueDate.setMonth(nextDueDate.getMonth() + 3);
          break;
        case 'YEARLY':
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          break;
        default:
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }

      const newPayment = await partnerPaymentService.createPayment({
        partnerId: partner.id,
        amount: amount,
        currency: currency,
        paymentType: 'QUOTA',
        dueDate: nextDueDate.toISOString(),
        description: `Suscripción ${partner.paymentFrequency?.toLowerCase()} - ${partner.firstName} ${partner.lastName}`,
        status: 'PENDING'
      });

      setPayments(prev => [...prev, newPayment]);
    } catch (error) {
      console.error('Error generating next subscription payment:', error);
    }
  };

  const handleCreateSubscription = async (amount: number, currency: string) => {
    if (!partner) return;

    try {
      const nextDueDate = new Date();
      nextDueDate.setDate(nextDueDate.getDate() + 1); // Primer pago para mañana

      const newPayment = await partnerPaymentService.createPayment({
        partnerId: partner.id,
        amount: amount,
        currency: currency,
        paymentType: 'QUOTA',
        dueDate: nextDueDate.toISOString(),
        description: `Suscripción ${partner.paymentFrequency?.toLowerCase()} - ${partner.firstName} ${partner.lastName}`,
        status: 'PENDING'
      });

      setPayments(prev => [...prev, newPayment]);
      
      toast({
        title: "Éxito",
        description: "Suscripción creada correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la suscripción",
        variant: "destructive",
      });
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (activeTab === 'pending') return payment.status === 'PENDING';
    if (activeTab === 'paid') return payment.status === 'PAID';
    if (activeTab === 'overdue') return payment.status === 'PENDING' && new Date(payment.dueDate) < new Date();
    if (activeTab === 'cancelled') return payment.status === 'CANCELLED';
    return true;
  });

  const subscriptionPayments = payments.filter(p => p.paymentType === 'QUOTA');
  const stats = {
    total: subscriptionPayments.length,
    paid: subscriptionPayments.filter(p => p.status === 'PAID').length,
    pending: subscriptionPayments.filter(p => p.status === 'PENDING').length,
    overdue: subscriptionPayments.filter(p => p.status === 'PENDING' && new Date(p.dueDate) < new Date()).length,
    totalAmount: subscriptionPayments.reduce((sum, p) => sum + p.amount, 0),
    paidAmount: subscriptionPayments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: subscriptionPayments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Socio no encontrado</p>
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
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Volver
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Historial de Suscripciones
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {partner.firstName} {partner.lastName} - {partner.email}
              </p>
            </div>
            <button
              onClick={() => {
                const amount = prompt("Ingrese el monto de la suscripción:");
                const currency = prompt("Ingrese la moneda (USD/PYG):", "USD");
                if (amount && currency) {
                  handleCreateSubscription(parseFloat(amount), currency);
                }
              }}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlayIcon className="w-5 h-5" />
              Nueva Suscripción
            </button>
          </div>
        </div>

        {/* Partner Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Información de Suscripción
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Frecuencia de Pago
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {partner.paymentFrequency === 'MONTHLY' ? 'Mensual' : 
                     partner.paymentFrequency === 'QUARTERLY' ? 'Trimestral' : 
                     partner.paymentFrequency === 'YEARLY' ? 'Anual' : 'No configurada'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Moneda
                  </label>
                  <p className="text-gray-900 dark:text-white">{partner.currency || 'USD'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Tasa de Comisión
                  </label>
                  <p className="text-gray-900 dark:text-white">{partner.commissionRate || 0}%</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Estadísticas
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Suscripciones
                  </label>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Pagadas
                  </label>
                  <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Pendientes
                  </label>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Montos
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Generado
                  </label>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {partnerPaymentService.formatCurrency(stats.totalAmount, partner.currency || 'USD')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Pagado
                  </label>
                  <p className="text-2xl font-bold text-green-600">
                    {partnerPaymentService.formatCurrency(stats.paidAmount, partner.currency || 'USD')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Pendiente
                  </label>
                  <p className="text-2xl font-bold text-yellow-600">
                    {partnerPaymentService.formatCurrency(stats.pendingAmount, partner.currency || 'USD')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'all', name: 'Todos', count: stats.total, icon: CalendarIcon },
                { id: 'pending', name: 'Pendientes', count: stats.pending, icon: ClockIcon },
                { id: 'paid', name: 'Pagados', count: stats.paid, icon: CheckCircleIcon },
                { id: 'overdue', name: 'Vencidos', count: stats.overdue, icon: ExclamationTriangleIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      isActive
                        ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isActive
                        ? 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200'
                        : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Payments Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Historial de Suscripciones
            </h3>
            
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No hay suscripciones
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {activeTab !== 'all' 
                    ? "No se encontraron suscripciones con el filtro aplicado."
                    : "Comienza creando una nueva suscripción."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPayments
                  .filter(p => p.paymentType === 'QUOTA')
                  .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                  .map((payment, index) => (
                    <div key={payment.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          payment.status === 'PAID' 
                            ? 'bg-green-100 text-green-600' 
                            : payment.status === 'PENDING' && new Date(payment.dueDate) < new Date()
                            ? 'bg-red-100 text-red-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {payment.status === 'PAID' ? (
                            <CheckCircleIcon className="w-5 h-5" />
                          ) : payment.status === 'PENDING' && new Date(payment.dueDate) < new Date() ? (
                            <ExclamationTriangleIcon className="w-5 h-5" />
                          ) : (
                            <ClockIcon className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Suscripción #{payment.paymentNumber}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Vencimiento: {partnerPaymentService.formatDate(payment.dueDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {partnerPaymentService.formatCurrency(payment.amount, payment.currency)}
                            </p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${partnerPaymentService.getStatusColor(payment.status)}`}>
                              {partnerPaymentService.getStatusLabel(payment.status)}
                            </span>
                          </div>
                        </div>
                        
                        {payment.paymentDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Pagado el: {partnerPaymentService.formatDate(payment.paymentDate)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0">
                        <div className="flex space-x-2">
                          {payment.status === 'PENDING' && (
                            <button
                              onClick={() => handleMarkAsPaid(payment)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Marcar como pagado y generar siguiente suscripción"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            href={`/partners/payments/${payment.id}`}
                            className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 