"use client";

import React, { useState, useEffect } from 'react';
import { Sale, Payment, PaymentStatus, PaymentMethod } from './types';
import { saleService } from '../services/saleService';

interface PaymentHistoryProps {
  sale: Sale;
  onPaymentRecorded: () => void;
}

export default function PaymentHistory({ sale, onPaymentRecorded }: PaymentHistoryProps) {
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const pendingPayments = sale.payments.filter(p => p.status === 'pending');
  const paidPayments = sale.payments.filter(p => p.status === 'paid');
  const overduePayments = sale.payments.filter(p => 
    p.status === 'pending' && new Date(p.dueDate) < new Date()
  );

  // Obtener la próxima cuota pendiente
  const nextPendingPayment = pendingPayments.find(p => new Date(p.dueDate) >= new Date()) || pendingPayments[0];

  // Calcular estadísticas avanzadas
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);
  const nextPayment = pendingPayments.find(p => new Date(p.dueDate) >= new Date());
  const daysUntilNextPayment = nextPayment ? 
    Math.ceil((new Date(nextPayment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Auto-llenar el formulario con la próxima cuota
  useEffect(() => {
    if (nextPendingPayment) {
      setPaymentAmount(nextPendingPayment.amount);
    }
  }, [nextPendingPayment]);

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return 'Efectivo';
      case 'bank_transfer':
        return 'Transferencia';
      case 'check':
        return 'Cheque';
      case 'credit_card':
        return 'Tarjeta de Crédito';
      default:
        return method;
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentAmount <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    if (!paymentDate) {
      setError('Debe seleccionar una fecha');
      return;
    }

    setIsRecordingPayment(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await saleService.recordPayment(sale.id, {
        amount: paymentAmount,
        paymentDate,
        method: paymentMethod,
        reference: paymentReference,
        notes: paymentNotes,
      });

      onPaymentRecorded();
      setIsRecordingPayment(false);
      
      // Mostrar mensaje de éxito
      setSuccessMessage(`Pago de $${paymentAmount.toLocaleString()} registrado exitosamente`);
      
      // Reset form with next payment amount
      if (nextPendingPayment) {
        setPaymentAmount(nextPendingPayment.amount);
      } else {
        setPaymentAmount(0);
      }
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('cash');
      setPaymentReference('');
      setPaymentNotes('');

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error recording payment:', err);
      setError('Error al registrar el pago');
      setIsRecordingPayment(false);
    }
  };

  const handleQuickPayment = async (payment: Payment) => {
    if (payment.status !== 'pending') return;

    setIsRecordingPayment(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await saleService.recordPayment(sale.id, {
        amount: payment.amount,
        paymentDate: new Date().toISOString().split('T')[0],
        method: 'cash',
        reference: '',
        notes: 'Pago rápido registrado',
      });

      onPaymentRecorded();
      setIsRecordingPayment(false);
      
      // Mostrar mensaje de éxito
      setSuccessMessage(`Pago rápido de $${payment.amount.toLocaleString()} registrado exitosamente`);
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error recording quick payment:', err);
      setError('Error al registrar el pago rápido');
      setIsRecordingPayment(false);
    }
  };

  const generateReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };

  const exportPaymentData = () => {
    const data = {
      saleInfo: {
        id: sale.id,
        totalPrice: sale.totalPrice,
        downPayment: sale.downPayment,
        monthlyPayment: sale.monthlyPayment,
        totalPayments: sale.totalPayments,
        status: sale.status,
      },
      payments: sale.payments.map((p, index) => ({
        cuota: index + 1,
        fechaVencimiento: new Date(p.dueDate).toLocaleDateString('es-ES'),
        monto: p.amount,
        estado: p.status,
        fechaPago: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('es-ES') : '-',
        metodo: p.paymentDate ? getMethodLabel(p.method) : '-',
        referencia: p.reference || '-',
        notas: p.notes || '-',
      })),
      summary: {
        totalPagado: totalPaid,
        totalPendiente: sale.remainingAmount,
        cuotasPagadas: paidPayments.length,
        cuotasPendientes: pendingPayments.length,
        cuotasVencidas: overduePayments.length,
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `venta-${sale.id}-pagos.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Alertas y Notificaciones */}
      {overduePayments.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                ¡Atención! Hay {overduePayments.length} cuota(s) vencida(s)
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                Monto total vencido: ${totalOverdue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {nextPayment && daysUntilNextPayment <= 7 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Próxima cuota vence en {daysUntilNextPayment} día(s)
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Fecha: {new Date(nextPayment.dueDate).toLocaleDateString('es-ES')} - Monto: ${nextPayment.amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de la Venta */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Resumen de la Venta
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowReport(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Ver Reporte
            </button>
            <button
              onClick={exportPaymentData}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Exportar
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Precio Total:</span>
            <p className="font-medium text-gray-900 dark:text-white">${sale.totalPrice.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Cuota Inicial:</span>
            <p className="font-medium text-gray-900 dark:text-white">${sale.downPayment.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Monto Restante:</span>
            <p className="font-medium text-gray-900 dark:text-white">${sale.remainingAmount.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Cuota Mensual:</span>
            <p className="font-medium text-gray-900 dark:text-white">${sale.monthlyPayment.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Estado:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
              sale.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
              sale.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {sale.status === 'active' ? 'Activa' : 
               sale.status === 'completed' ? 'Completada' : 'Cancelada'}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Cuotas Pagadas:</span>
            <p className="font-medium text-gray-900 dark:text-white">{paidPayments.length}/{sale.totalPayments}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Cuotas Pendientes:</span>
            <p className="font-medium text-gray-900 dark:text-white">{pendingPayments.length}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Cuotas Vencidas:</span>
            <p className="font-medium text-red-600 dark:text-red-400">{overduePayments.length}</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progreso de Pago</span>
            <span>{Math.round((paidPayments.length / sale.totalPayments) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-brand-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(paidPayments.length / sale.totalPayments) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Registrar Pago */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Registrar Pago
          </h3>
          {nextPendingPayment && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span>Próxima cuota: ${nextPendingPayment.amount.toLocaleString()}</span>
              {nextPendingPayment.dueDate && (
                <span className="ml-2">
                  (Vence: {new Date(nextPendingPayment.dueDate).toLocaleDateString('es-ES')})
                </span>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monto ($) - {nextPendingPayment ? `Cuota ${sale.payments.indexOf(nextPendingPayment) + 1}` : 'Monto personalizado'}
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                min={0}
                step={1000}
                required
              />
              {nextPendingPayment && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Monto sugerido: ${nextPendingPayment.amount.toLocaleString()}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Pago
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Método de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="cash">Efectivo</option>
                <option value="bank_transfer">Transferencia</option>
                <option value="check">Cheque</option>
                <option value="credit_card">Tarjeta de Crédito</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Referencia
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Número de referencia"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas
            </label>
            <textarea
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
              placeholder="Notas adicionales sobre el pago"
            />
          </div>

          <div className="flex justify-end gap-3">
            {nextPendingPayment && (
              <button
                type="button"
                onClick={() => handleQuickPayment(nextPendingPayment)}
                disabled={isRecordingPayment}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRecordingPayment ? 'Registrando...' : `Pago Rápido ($${nextPendingPayment.amount.toLocaleString()})`}
              </button>
            )}
            <button
              type="submit"
              disabled={isRecordingPayment}
              className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRecordingPayment ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>

      {/* Historial de Pagos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Historial de Pagos
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sale.payments.map((payment, index) => (
                <tr key={payment.id} className={payment.status === 'overdue' ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Cuota {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(payment.dueDate).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status === 'paid' ? 'Pagado' : 
                       payment.status === 'pending' ? 'Pendiente' : 
                       payment.status === 'overdue' ? 'Vencido' : 'Cancelado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('es-ES') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {payment.paymentDate ? getMethodLabel(payment.method) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {payment.status === 'paid' ? (
                      <button
                        onClick={() => generateReceipt(payment)}
                        className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                      >
                        Recibo
                      </button>
                    ) : payment.status === 'pending' ? (
                      <button
                        onClick={() => handleQuickPayment(payment)}
                        disabled={isRecordingPayment}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                      >
                        Pagar
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Recibo */}
      {showReceipt && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recibo de Pago
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Venta:</strong> #{sale.id}</p>
                <p><strong>Fecha:</strong> {selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleDateString('es-ES') : '-'}</p>
                <p><strong>Monto:</strong> ${selectedPayment.amount.toLocaleString()}</p>
                <p><strong>Método:</strong> {getMethodLabel(selectedPayment.method)}</p>
                {selectedPayment.reference && <p><strong>Referencia:</strong> {selectedPayment.reference}</p>}
                {selectedPayment.notes && <p><strong>Notas:</strong> {selectedPayment.notes}</p>}
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowReceipt(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reporte */}
      {showReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reporte de Pagos - Venta #{sale.id}
              </h3>
              <button
                onClick={() => setShowReport(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Pagado</p>
                  <p className="text-lg font-bold text-blue-800 dark:text-blue-200">${totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendiente</p>
                  <p className="text-lg font-bold text-yellow-800 dark:text-yellow-200">${sale.remainingAmount.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                  <p className="text-sm text-red-600 dark:text-red-400">Vencido</p>
                  <p className="text-lg font-bold text-red-800 dark:text-red-200">${totalOverdue.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                  <p className="text-sm text-green-600 dark:text-green-400">Progreso</p>
                  <p className="text-lg font-bold text-green-800 dark:text-green-200">{Math.round((paidPayments.length / sale.totalPayments) * 100)}%</p>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Resumen por Estado</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Pagadas:</span>
                    <span className="ml-2 font-medium text-green-600 dark:text-green-400">{paidPayments.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Pendientes:</span>
                    <span className="ml-2 font-medium text-yellow-600 dark:text-yellow-400">{pendingPayments.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Vencidas:</span>
                    <span className="ml-2 font-medium text-red-600 dark:text-red-400">{overduePayments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 