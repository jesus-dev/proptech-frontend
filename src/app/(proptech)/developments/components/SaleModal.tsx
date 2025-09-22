"use client";

import React, { useState, useEffect } from 'react';
import { Lot } from './types';
import { saleService } from '../services/saleService';
import { useClients } from '../hooks/useClients';
import ModernPopup from '@/components/ui/ModernPopup';
import { DollarSign, User, Calendar, AlertTriangle } from 'lucide-react';

interface SaleModalProps {
  lot: Lot;
  isOpen: boolean;
  onClose: () => void;
  onSaleComplete: () => void;
}

export default function SaleModal({ lot, isOpen, onClose, onSaleComplete }: SaleModalProps) {
  const { clients } = useClients();
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number>(lot.price);
  const [downPayment, setDownPayment] = useState<number>(lot.price * 0.3);
  const [totalPayments, setTotalPayments] = useState<number>(12);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTotalPrice(lot.price);
      setDownPayment(lot.price * 0.3);
      setTotalPayments(12);
      setStartDate(new Date().toISOString().split('T')[0]);
      setError(null);
    }
  }, [isOpen, lot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) {
      setError('Debe seleccionar un cliente');
      return;
    }

    if (downPayment > totalPrice) {
      setError('La cuota inicial no puede ser mayor al precio total');
      return;
    }

    if (totalPayments < 1) {
      setError('Debe tener al menos 1 cuota');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await saleService.createSale({
        lotId: lot.id,
        clientId: selectedClient,
        totalPrice,
        downPayment,
        totalPayments,
        startDate,
      });

      onSaleComplete();
      onClose();
    } catch (err) {
      console.error('Error creating sale:', err);
      setError('Error al crear la venta');
    } finally {
      setIsLoading(false);
    }
  };

  const monthlyPayment = totalPayments > 0 ? (totalPrice - downPayment) / totalPayments : 0;

  return (
    <ModernPopup
      isOpen={isOpen}
      onClose={onClose}
      title={`Vender Lote ${lot.number}`}
      subtitle="Completa los datos de la venta del lote"
      icon={<DollarSign className="w-6 h-6 text-white" />}
      maxWidth="max-w-2xl"
      closeOnBackdropClick={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Información del Lote */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span>🏠</span>
            Información del Lote
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Número:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{lot.number}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Precio Original:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">${lot.price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Cliente */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Cliente *
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
            required
          >
            <option value="">👤 Seleccionar cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.firstName} {client.lastName} - {client.email}
              </option>
            ))}
          </select>
        </div>

        {/* Precio Total */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Precio Total *
          </label>
          <input
            type="number"
            value={totalPrice}
            onChange={(e) => setTotalPrice(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
            placeholder="0"
            required
          />
        </div>

        {/* Cuota Inicial */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Cuota Inicial *
          </label>
          <input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
            placeholder="0"
            required
          />
        </div>

        {/* Número de Cuotas */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Número de Cuotas *
          </label>
          <input
            type="number"
            value={totalPayments}
            onChange={(e) => setTotalPayments(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
            placeholder="12"
            min="1"
            required
          />
        </div>

        {/* Fecha de Inicio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Fecha de Inicio *
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
            required
          />
        </div>

        {/* Resumen de Pagos */}
        {totalPayments > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📊 Resumen de Pagos
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 dark:text-blue-300">Cuota Mensual:</span>
                <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                  ${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Total a Financiar:</span>
                <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                  ${(totalPrice - downPayment).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 border border-transparent rounded-xl hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creando venta...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>✅</span>
                Crear Venta
              </div>
            )}
          </button>
        </div>
      </form>
    </ModernPopup>
  );
} 