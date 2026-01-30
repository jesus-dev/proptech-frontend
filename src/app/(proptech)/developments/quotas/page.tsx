"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from "@heroicons/react/24/outline";
import { DevelopmentQuota, QuotaType, QuotaStatus } from "../components/types";
import { developmentQuotaService } from "../services/developmentQuotaService";
import { developmentService } from "../services/developmentService";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";

interface DevelopmentGroup {
  developmentId: number;
  developmentTitle: string;
  quotas: DevelopmentQuota[];
}

export default function DevelopmentQuotasPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnTo = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;

  const [quotas, setQuotas] = useState<DevelopmentQuota[]>([]);
  const [developments, setDevelopments] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [quickStatus, setQuickStatus] = useState<"ALL" | "PENDING" | "PAID">("ALL");
  const [filterStatus, setFilterStatus] = useState<QuotaStatus | "ALL">("ALL");
  const [filterType, setFilterType] = useState<QuotaType | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDevelopments, setExpandedDevelopments] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quotasData, developmentsData] = await Promise.all([
        developmentQuotaService.getAllQuotas(),
        developmentService.getAllDevelopments()
      ]);
      
      setQuotas(quotasData);
      
      // Crear mapa de developmentId -> developmentTitle
      const devMap: Record<number, string> = {};
      if (developmentsData?.data) {
        developmentsData.data.forEach((dev: any) => {
          devMap[dev.id] = dev.title || `Desarrollo ${dev.id}`;
        });
      }
      setDevelopments(devMap);
    } catch (error) {
      console.error("Error loading data:", error);
      setQuotas([]);
      setDevelopments({});
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
    // Filtro rápido (pestañas): Pendientes = todo lo no pagado (incluye vencidas y parciales)
    const matchesQuickStatus =
      quickStatus === "ALL"
        ? true
        : quickStatus === "PAID"
          ? quota.status === "PAID"
          : quota.status !== "PAID";

    const matchesStatus = filterStatus === "ALL" || quota.status === filterStatus;
    const matchesType = filterType === "ALL" || quota.type === filterType;
    const matchesSearch = quota.quotaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quota.quotaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quota.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesQuickStatus && matchesStatus && matchesType && matchesSearch;
  });

  // Agrupar cuotas por desarrollo
  const groupedQuotas: DevelopmentGroup[] = Object.entries(
    filteredQuotas.reduce((acc, quota) => {
      const devId = quota.developmentId;
      if (!acc[devId]) {
        acc[devId] = [];
      }
      acc[devId].push(quota);
      return acc;
    }, {} as Record<number, DevelopmentQuota[]>)
  ).map(([devId, quotas]) => ({
    developmentId: Number(devId),
    developmentTitle: developments[Number(devId)] || `Desarrollo ${devId}`,
    quotas: quotas.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  })).sort((a, b) => a.developmentTitle.localeCompare(b.developmentTitle));

  const toggleDevelopment = (developmentId: number) => {
    setExpandedDevelopments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(developmentId)) {
        newSet.delete(developmentId);
      } else {
        newSet.add(developmentId);
      }
      return newSet;
    });
  };

  const isExpanded = (developmentId: number) => expandedDevelopments.has(developmentId);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Enhanced Modern Header */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-3xl animate-pulse"></div>
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                    <div className="relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl">
                      <CurrencyDollarIcon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      Gestión de Cuotas
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm lg:text-base font-medium">
                      Administra las cuotas de pago del desarrollo
                    </p>
                  </div>
                </div>
              </div>
              
              <Link
                href={`/developments/quotas/new`}
                className="group relative overflow-hidden inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 rounded-xl font-semibold"
              >
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                <PlusIcon className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">Nueva Cuota</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Filtros */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-5 lg:p-6 mb-6">
          {/* Filtro rápido */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 mb-4 border-b border-gray-200/70 dark:border-gray-700/70">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Ver cuotas
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cambiá rápido entre todas, pendientes o pagadas.
              </p>
            </div>
            <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setQuickStatus("ALL")}
                className={`px-4 py-2 text-sm font-semibold ${
                  quickStatus === "ALL"
                    ? "bg-brand-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setQuickStatus("PENDING")}
                className={`px-4 py-2 text-sm font-semibold border-l border-gray-200 dark:border-gray-700 ${
                  quickStatus === "PENDING"
                    ? "bg-brand-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Pendientes
              </button>
              <button
                type="button"
                onClick={() => setQuickStatus("PAID")}
                className={`px-4 py-2 text-sm font-semibold border-l border-gray-200 dark:border-gray-700 ${
                  quickStatus === "PAID"
                    ? "bg-brand-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Pagadas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                Buscar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Número, nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all duration-200 text-sm shadow-sm hover:shadow-md focus:shadow-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as QuotaStatus | "ALL")}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all duration-200 text-sm shadow-sm hover:shadow-md focus:shadow-lg cursor-pointer"
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
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as QuotaType | "ALL")}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all duration-200 text-sm shadow-sm hover:shadow-md focus:shadow-lg cursor-pointer"
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
                  setQuickStatus("ALL");
                  setFilterStatus("ALL");
                  setFilterType("ALL");
                }}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Lista de Cuotas Agrupadas por Desarrollo */}
        <div className="space-y-4">
          {groupedQuotas.map((group) => {
            const expanded = isExpanded(group.developmentId);
            return (
              <div 
                key={group.developmentId} 
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all duration-200"
              >
                {/* Encabezado del Desarrollo - Clickable */}
                <button
                  onClick={() => toggleDevelopment(group.developmentId)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <BuildingOfficeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {group.developmentTitle}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {group.quotas.length} {group.quotas.length === 1 ? 'cuota' : 'cuotas'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/developments/${group.developmentId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        Ver desarrollo →
                      </Link>
                      {expanded ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Tabla de Cuotas del Desarrollo - Colapsable */}
                {expanded && (
                  <div className="overflow-x-auto animate-in slide-in-from-top-2 duration-200">
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
                    {group.quotas.map((quota) => {
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
                          {quota.status !== "PAID" && (
                            <Link
                              href={`/developments/quotas/${quota.id}/payment?returnTo=${encodeURIComponent(returnTo)}`}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Registrar pago"
                            >
                              <CurrencyDollarIcon className="w-5 h-5" />
                            </Link>
                          )}
                          <Link
                            href={`/developments/${quota.developmentId}/quotas/${quota.id}`}
                            className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                            title="Ver detalles"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/developments/${quota.developmentId}/quotas/${quota.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Editar"
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
            );
          })}

          {groupedQuotas.length === 0 && (
            <div className="text-center py-16 px-6">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                  <CurrencyDollarIcon className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                No se encontraron cuotas
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto text-base leading-relaxed">
                {searchTerm || filterStatus !== "ALL" || filterType !== "ALL" 
                  ? "Intenta ajustar los filtros de búsqueda."
                  : "Comienza agregando la primera cuota al desarrollo."}
              </p>
              {!searchTerm && filterStatus === "ALL" && filterType === "ALL" && (
                <Link
                  href={`/developments/quotas/new`}
                  className="group relative overflow-hidden inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 rounded-xl font-semibold"
                >
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                  <PlusIcon className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10">Nueva Cuota</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 