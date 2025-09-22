"use client";

import React, { useState, useEffect, useCallback } from "react";
import { partnerPaymentService, PartnerPayment, PaymentSummary } from "../services/partnerPaymentService";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, PlusIcon, BanknotesIcon, EyeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface PartnerPaymentsSectionProps {
  partnerId: number;
}

export default function PartnerPaymentsSection({ partnerId }: PartnerPaymentsSectionProps) {
  const [payments, setPayments] = useState<PartnerPayment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsData, summaryData] = await Promise.all([
        partnerPaymentService.getPaymentsByPartner(partnerId),
        partnerPaymentService.getPartnerPaymentSummary(partnerId)
      ]);
      setPayments(paymentsData);
      setSummary(summaryData);
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los pagos del socio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [partnerId, toast]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleMarkAsPaid = async (payment: PartnerPayment) => {
    try {
      const updatedPayment = await partnerPaymentService.markAsPaid(
        payment.id,
        "TRANSFER",
        `REF-${Date.now()}`,
        "Admin"
      );
      setPayments(payments.map(p => p.id === payment.id ? updatedPayment : p));
      await loadPayments(); // Recargar para actualizar el resumen
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Pagos y Cuotas
          </h3>
          <a
            href={`/partners/payments/new?partnerId=${partnerId}`}
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-3 py-1 rounded-md text-sm hover:bg-brand-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Nuevo Pago
          </a>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {partnerPaymentService.formatCurrency(summary.totalPaid)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Pagado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {partnerPaymentService.formatCurrency(summary.totalPending)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pendiente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {partnerPaymentService.formatCurrency(summary.totalOverdue)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Vencido</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary.pendingCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pagos Pendientes</div>
            </div>
          </div>
        </div>
      )}

      {/* Payments List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {payments.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No hay pagos registrados
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Este socio aún no tiene pagos registrados en el sistema.
            </p>
          </div>
        ) : (
          payments.slice(0, 5).map((payment) => (
            <div key={payment.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${partnerPaymentService.getStatusColor(payment.status)}`}>
                      {partnerPaymentService.getStatusLabel(payment.status)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {partnerPaymentService.getPaymentTypeLabel(payment.paymentType)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {payment.paymentNumber}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Vence: {partnerPaymentService.formatDate(payment.dueDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {partnerPaymentService.formatCurrency(payment.amount, payment.currency)}
                    </div>
                    {payment.paymentDate && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Pagado: {partnerPaymentService.formatDate(payment.paymentDate)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <a
                      href={`/partners/payments/${payment.id}`}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </a>
                    {payment.status === 'PENDING' && (
                      <button
                        onClick={() => handleMarkAsPaid(payment)}
                        className="p-1 text-green-400 hover:text-green-600 dark:hover:text-green-300"
                        title="Marcar como pagado"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {payments.length > 5 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href={`/partners/payments?partnerId=${partnerId}`}
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-medium"
          >
            Ver todos los pagos ({payments.length})
          </a>
        </div>
      )}
    </div>
  );
} 