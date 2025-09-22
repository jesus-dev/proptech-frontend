"use client";
import React from "react";
import { SalesAgent } from "@/services/salesAgentService";

interface AgentDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agent: SalesAgent | null;
}

export default function AgentDetailsDialog({
  isOpen,
  onClose,
  agent,
}: AgentDetailsDialogProps) {
  if (!isOpen || !agent) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activo';
      case 'INACTIVE': return 'Inactivo';
      case 'SUSPENDED': return 'Suspendido';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Detalles del Agente
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Agent Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {agent.fullName}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Código:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{agent.agentCode}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Estado:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(agent.status)}`}>
                    {getStatusLabel(agent.status)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{agent.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Teléfono:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{agent.phone}</span>
                </div>
              </div>
            </div>

            {/* Commission Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Comisión</h5>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {agent.commissionPercentage}%
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Porcentaje por venta
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">Fecha de Contratación</h5>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {formatDate(agent.hireDate)}
                </p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Ventas Totales</h5>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(agent.totalSales)}
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                <h5 className="font-medium text-orange-900 dark:text-orange-100 mb-2">Comisiones Totales</h5>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(agent.totalCommissions)}
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                <h5 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Pendientes</h5>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {formatCurrency(agent.pendingCommissions)}
                </p>
              </div>
            </div>

            {/* Notes */}
            {agent.notes && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Notas</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {agent.notes}
                </p>
              </div>
            )}

            {/* Performance Summary */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
              <h5 className="font-medium text-indigo-900 dark:text-indigo-100 mb-3">Resumen de Rendimiento</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-indigo-700 dark:text-indigo-300">Promedio de ventas por mes:</span>
                  <span className="ml-2 font-medium text-indigo-900 dark:text-indigo-100">
                    {(() => {
                      const monthsSinceHire = Math.ceil((Date.now() - new Date(agent.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
                      const monthlyAverage = agent.totalSales / Math.max(1, monthsSinceHire);
                      return formatCurrency(monthlyAverage);
                    })()}
                  </span>
                </div>
                <div>
                  <span className="text-indigo-700 dark:text-indigo-300">Eficiencia de comisiones:</span>
                  <span className="ml-2 font-medium text-indigo-900 dark:text-indigo-100">
                    {agent.totalSales > 0 ? ((agent.totalCommissions / agent.totalSales) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
