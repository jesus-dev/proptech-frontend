"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CurrencyDollarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { DevelopmentQuota, QuotaType, QuotaStatus } from "../components/types";
import { developmentQuotaService } from "../services/developmentQuotaService";

export default function DevelopmentQuotasPage() {
  const [quotas, setQuotas] = useState<DevelopmentQuota[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<QuotaStatus | "ALL">("ALL");
  const [filterType, setFilterType] = useState<QuotaType | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadQuotas();
  }, []);

  const loadQuotas = async () => {
    try {
      setLoading(true);
      const data = await developmentQuotaService.getAllQuotas();
      setQuotas(data);
    } catch (error) {
      console.error("Error loading quotas:", error);
      // Fallback a datos mock si la API no está disponible
      setQuotas([
        {
          id: 1,
          developmentId: 1,
          quotaNumber: "Q-001",
          quotaName: "Cuota Inicial",
          type: "INITIAL",
          status: "PAID",
          amount: 10000,
          paidAmount: 10000,
          dueDate: "2024-01-15",
          paidDate: "2024-01-10",
          installmentNumber: 1,
          totalInstallments: 12,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          developmentId: 1,
          quotaNumber: "Q-002",
          quotaName: "Cuota Mensual 1",
          type: "MONTHLY",
          status: "PENDING",
          amount: 5000,
          dueDate: "2024-02-15",
          installmentNumber: 2,
          totalInstallments: 12,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 3,
          developmentId: 1,
          quotaNumber: "Q-003",
          quotaName: "Cuota Mensual 2",
          type: "MONTHLY",
          status: "OVERDUE",
          amount: 5000,
          dueDate: "2024-03-15",
          installmentNumber: 3,
          totalInstallments: 12,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 4,
          developmentId: 2,
          quotaNumber: "Q-101",
          quotaName: "Cuota Inicial Desarrollo 2",
          type: "INITIAL",
          status: "PENDING",
          amount: 15000,
          dueDate: "2024-04-15",
          installmentNumber: 1,
          totalInstallments: 24,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: QuotaStatus) => {
    switch (status) {
      case "PAID":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "PENDING":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "OVERDUE":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case "PARTIAL":
        return <CurrencyDollarIcon className="w-5 h-5 text-orange-500" />;
      case "CANCELLED":
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: QuotaStatus) => {
    const statusConfig = {
      PAID: { color: "bg-green-100 text-green-800", text: "Pagado" },
      PENDING: { color: "bg-yellow-100 text-yellow-800", text: "Pendiente" },
      OVERDUE: { color: "bg-red-100 text-red-800", text: "Vencido" },
      PARTIAL: { color: "bg-orange-100 text-orange-800", text: "Pago Parcial" },
      CANCELLED: { color: "bg-gray-100 text-gray-800", text: "Cancelado" },
      REFUNDED: { color: "bg-purple-100 text-purple-800", text: "Reembolsado" }
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{config.text}</span>
      </span>
    );
  };

  const getTypeLabel = (type: QuotaType) => {
    const labels: Record<QuotaType, string> = {
      INITIAL: "Cuota Inicial",
      MONTHLY: "Cuota Mensual",
      QUARTERLY: "Cuota Trimestral",
      ANNUAL: "Cuota Anual",
      FINAL: "Cuota Final",
      SPECIAL: "Cuota Especial",
      MAINTENANCE: "Mantenimiento",
      INSURANCE: "Seguro",
      TAXES: "Impuestos"
    };
    return labels[type] || type;
  };

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredQuotas = quotas.filter(quota => {
    const matchesStatus = filterStatus === "ALL" || quota.status === filterStatus;
    const matchesType = filterType === "ALL" || quota.type === filterType;
    const matchesSearch = quota.quotaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quota.quotaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quota.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestión de Cuotas
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Administra las cuotas de pago del desarrollo
              </p>
            </div>
            <Link
              href={`/developments/quotas/new`}
              className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nueva Cuota
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Número, nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as QuotaStatus | "ALL")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="PAID">Pagado</option>
                <option value="OVERDUE">Vencido</option>
                <option value="PARTIAL">Pago Parcial</option>
                <option value="CANCELLED">Cancelado</option>
                <option value="REFUNDED">Reembolsado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as QuotaType | "ALL")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">Todos los tipos</option>
                <option value="INITIAL">Cuota Inicial</option>
                <option value="MONTHLY">Cuota Mensual</option>
                <option value="QUARTERLY">Cuota Trimestral</option>
                <option value="ANNUAL">Cuota Anual</option>
                <option value="FINAL">Cuota Final</option>
                <option value="SPECIAL">Cuota Especial</option>
                <option value="MAINTENANCE">Mantenimiento</option>
                <option value="INSURANCE">Seguro</option>
                <option value="TAXES">Impuestos</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("ALL");
                  setFilterType("ALL");
                }}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Cuotas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Cuotas ({filteredQuotas.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cuota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredQuotas.map((quota) => {
                  const daysUntilDue = getDaysUntilDue(quota.dueDate);
                  const isOverdue = daysUntilDue < 0;
                  const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;
                  
                  return (
                    <tr key={quota.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {quota.quotaNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {quota.quotaName}
                          </div>
                          {quota.installmentNumber && quota.totalInstallments && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {quota.installmentNumber} de {quota.totalInstallments}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {getTypeLabel(quota.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(quota.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(quota.amount)}
                        </div>
                        {quota.paidAmount && quota.paidAmount > 0 && (
                          <div className="text-sm text-green-600 dark:text-green-400">
                            Pagado: {formatCurrency(quota.paidAmount)}
                          </div>
                        )}
                        {quota.discountAmount && quota.discountAmount > 0 && (
                          <div className="text-sm text-blue-600 dark:text-blue-400">
                            Descuento: {formatCurrency(quota.discountAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(quota.dueDate)}
                        </div>
                        {isOverdue && (
                          <div className="text-sm text-red-600 dark:text-red-400">
                            Vencido hace {Math.abs(daysUntilDue)} días
                          </div>
                        )}
                        {isDueSoon && (
                          <div className="text-sm text-yellow-600 dark:text-yellow-400">
                            Vence en {daysUntilDue} días
                          </div>
                        )}
                        {quota.paidDate && (
                          <div className="text-sm text-green-600 dark:text-green-400">
                            Pagado: {formatDate(quota.paidDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/developments/${quota.developmentId}/quotas/${quota.id}`}
                            className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/developments/${quota.developmentId}/quotas/${quota.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => {
                              // TODO: Implementar eliminación
                              if (confirm("¿Estás seguro de que quieres eliminar esta cuota?")) {
                                console.log("Eliminar cuota:", quota.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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

          {filteredQuotas.length === 0 && (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No se encontraron cuotas
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || filterStatus !== "ALL" || filterType !== "ALL" 
                  ? "Intenta ajustar los filtros de búsqueda."
                  : "Comienza agregando la primera cuota al desarrollo."}
              </p>
              {!searchTerm && filterStatus === "ALL" && filterType === "ALL" && (
                <div className="mt-6">
                  <Link
                    href={`/developments/quotas/new`}
                    className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Nueva Cuota
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 