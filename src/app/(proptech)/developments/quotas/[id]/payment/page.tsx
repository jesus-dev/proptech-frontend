"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { developmentQuotaService } from "../../../services/developmentQuotaService";
import { DevelopmentQuota } from "../../../components/types";
import PriceInput from "@/components/ui/PriceInput";

export default function QuotaPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotaId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quota, setQuota] = useState<DevelopmentQuota | null>(null);
  const [paymentData, setPaymentData] = useState({
    paidAmount: 0,
    paymentMethod: "",
    paymentReference: "",
    notes: "",
    paymentDate: new Date().toISOString().split('T')[0]
  });
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>("");

  const returnToParam = searchParams?.get("returnTo");
  let returnTo = "/developments/quotas";
  try {
    if (returnToParam) returnTo = decodeURIComponent(returnToParam);
  } catch {
    // ignore decode errors and keep default
  }

  useEffect(() => {
    loadQuota();
  }, [quotaId]);

  const loadQuota = async () => {
    try {
      const data = await developmentQuotaService.getQuotaById(quotaId);
      setQuota(data);
      if (data.currency?.code) {
        setSelectedCurrencyCode(data.currency.code);
      }
      // Prellenar con el monto pendiente
      const pendingAmount = (data.amount || 0) - (data.paidAmount || 0);
      setPaymentData(prev => ({
        ...prev,
        paidAmount: pendingAmount > 0 ? pendingAmount : 0
      }));
    } catch (error) {
      console.error("Error loading quota:", error);
      alert("Error al cargar la cuota");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentData.paidAmount || paymentData.paidAmount <= 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    if (!paymentData.paymentMethod) {
      alert("Por favor selecciona un método de pago");
      return;
    }

    if (!quota) {
      alert("Error: No se encontró la cuota");
      return;
    }

    const pendingAmount = (quota.amount || 0) - (quota.paidAmount || 0);
    if (paymentData.paidAmount > pendingAmount) {
      if (!confirm(`El monto ingresado (${paymentData.paidAmount.toLocaleString()}) es mayor al pendiente (${pendingAmount.toLocaleString()}). ¿Deseas continuar?`)) {
        return;
      }
    }

    try {
      setLoading(true);
      const updatedQuota = await developmentQuotaService.recordPayment(quotaId, {
        paidAmount: paymentData.paidAmount,
        paymentMethod: paymentData.paymentMethod,
        paymentReference: paymentData.paymentReference || undefined,
        notes: paymentData.notes || undefined
      });
      setQuota(updatedQuota);
      
      // Mostrar mensaje según el estado actualizado
      if (updatedQuota.status === 'PAID') {
        alert("✅ Pago registrado exitosamente. La cuota ha sido marcada como PAGADA.");
      } else if (updatedQuota.status === 'PARTIAL') {
        alert("✅ Pago parcial registrado exitosamente. La cuota ahora tiene estado PAGO PARCIAL.");
      } else {
        alert("✅ Pago registrado exitosamente.");
      }

      // Dejar al usuario en la pantalla con acciones claras (no redirigir automáticamente)
      setSuccess(true);
    } catch (error: any) {
      console.error("Error recording payment:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Error al registrar el pago";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!quota) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const pendingAmount = (quota.amount || 0) - (quota.paidAmount || 0);
  const paidPercentage = quota.amount ? ((quota.paidAmount || 0) / quota.amount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <Link
              href={returnTo}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Volver
            </Link>

            <button
              type="button"
              onClick={() => router.push("/developments/quotas")}
              className="inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              title="Ir a pagar otra cuota"
            >
              <CurrencyDollarIcon className="w-4 h-4 mr-2" />
              Ir a pagar Cuota
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Registrar Pago de Cuota
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {quota.quotaNumber} - {quota.quotaName}
          </p>
        </div>

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 p-4">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Pago registrado. ¿Qué querés hacer ahora?
            </p>
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => router.push("/developments/quotas")}
                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                Ir a pagar Cuota
              </button>
              <button
                type="button"
                onClick={() => router.push(returnTo)}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Volver a la pantalla anterior
              </button>
            </div>
          </div>
        )}

        {/* Información de la Cuota */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información de la Cuota
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monto Total</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {quota.amount?.toLocaleString('es-PY')} {quota.currency?.symbol || ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monto Pagado</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {quota.paidAmount?.toLocaleString('es-PY') || 0} {quota.currency?.symbol || ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monto Pendiente</p>
              <p className={`text-lg font-semibold ${pendingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {pendingAmount.toLocaleString('es-PY')} {quota.currency?.symbol || ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                quota.status === 'PAID' ? 'bg-green-100 text-green-800' :
                quota.status === 'PARTIAL' ? 'bg-orange-100 text-orange-800' :
                quota.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {quota.status === 'PAID' ? 'Pagada' :
                 quota.status === 'PARTIAL' ? 'Pago Parcial' :
                 quota.status === 'OVERDUE' ? 'Vencida' :
                 'Pendiente'}
              </span>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progreso de pago</span>
              <span>{paidPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(paidPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Formulario de Pago */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detalles del Pago
            </h2>

            {/* Monto a Pagar */}
            <div>
              <PriceInput
                value={paymentData.paidAmount}
                onChange={(value) => setPaymentData(prev => ({ ...prev, paidAmount: value }))}
                currencyCode={selectedCurrencyCode}
                label="Monto a Pagar"
                placeholder="0"
                required
                className="w-full"
              />
              {pendingAmount > 0 && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Monto pendiente: {pendingAmount.toLocaleString('es-PY')} {quota.currency?.symbol || ''}
                </p>
              )}
              {paymentData.paidAmount > pendingAmount && pendingAmount > 0 && (
                <div className="mt-2 flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <InformationCircleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    El monto ingresado es mayor al pendiente. El excedente se registrará como pago adicional.
                  </p>
                </div>
              )}
            </div>

            {/* Fecha de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Pago
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, paymentDate: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Método de Pago <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccionar método</option>
                <option value="CASH">Efectivo</option>
                <option value="BANK_TRANSFER">Transferencia Bancaria</option>
                <option value="CHECK">Cheque</option>
                <option value="CREDIT_CARD">Tarjeta de Crédito</option>
                <option value="DEBIT_CARD">Tarjeta de Débito</option>
                <option value="MOBILE_PAYMENT">Pago Móvil</option>
              </select>
            </div>

            {/* Referencia de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Referencia de Pago
              </label>
              <input
                type="text"
                value={paymentData.paymentReference}
                onChange={(e) => setPaymentData(prev => ({ ...prev, paymentReference: e.target.value }))}
                placeholder="Número de comprobante, transferencia, cheque, etc."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notas
              </label>
              <textarea
                value={paymentData.notes}
                onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Notas adicionales sobre el pago..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={returnTo}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                )}
                Registrar Pago
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
