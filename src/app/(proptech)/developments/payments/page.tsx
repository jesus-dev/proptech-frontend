"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  CurrencyDollarIcon,
  CheckCircleIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import { DevelopmentQuota, QuotaStatus } from "../components/types";
import { developmentQuotaService } from "../services/developmentQuotaService";
import { developmentService } from "../services/developmentService";

interface DevelopmentGroup {
  developmentId: number;
  developmentTitle: string;
  quotas: DevelopmentQuota[];
}

export default function DevelopmentPaymentsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnTo = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;

  const [quotas, setQuotas] = useState<DevelopmentQuota[]>([]);
  const [developments, setDevelopments] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
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
      
      // Filtrar solo cuotas con pagos registrados
      const quotasWithPayments = quotasData.filter(q => 
        q.paidAmount && q.paidAmount > 0
      );
      
      setQuotas(quotasWithPayments);
      
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

  const filteredQuotas = quotas.filter(quota => {
    const matchesSearch = quota.quotaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quota.quotaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quota.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
    quotas: quotas.sort((a, b) => {
      // Ordenar por fecha de pago más reciente primero
      const dateA = a.paidDate ? new Date(a.paidDate).getTime() : 0;
      const dateB = b.paidDate ? new Date(b.paidDate).getTime() : 0;
      return dateB - dateA;
    })
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

  const formatCurrency = (amount: number, currency = "PYG") => {
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

  const getPaymentMethodLabel = (method?: string) => {
    const methods: Record<string, string> = {
      "CASH": "Efectivo",
      "BANK_TRANSFER": "Transferencia Bancaria",
      "CHECK": "Cheque",
      "CREDIT_CARD": "Tarjeta de Crédito",
      "DEBIT_CARD": "Tarjeta de Débito",
      "MOBILE_PAYMENT": "Pago Móvil"
    };
    return methods[method || ""] || method || "No especificado";
  };

  // Calcular totales
  const totalPaid = quotas.reduce((sum, q) => sum + (q.paidAmount || 0), 0);
  const totalQuotas = quotas.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 rounded-3xl blur-3xl animate-pulse"></div>
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                    <div className="relative p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl">
                      <CurrencyDollarIcon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-green-600 to-emerald-600 dark:from-white dark:via-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                      Historial de Pagos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm lg:text-base font-medium">
                      Registro de todos los pagos realizados en cuotas de desarrollo
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Pagado</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalPaid)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {totalQuotas} {totalQuotas === 1 ? 'pago' : 'pagos'} registrados
                  </p>
                </div>

                <Link
                  href="/developments/quotas"
                  className="group relative overflow-hidden inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-xl font-semibold"
                  title="Ir a pagar Cuota"
                >
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                  <CurrencyDollarIcon className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10">Ir a pagar Cuota</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-5 lg:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                Buscar
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Número de cuota, nombre, referencia de pago..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:text-white transition-all duration-200 text-sm shadow-sm hover:shadow-md focus:shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Pagos Agrupados por Desarrollo */}
        <div className="space-y-4">
          {groupedQuotas.map((group) => {
            const expanded = isExpanded(group.developmentId);
            const groupTotal = group.quotas.reduce((sum, q) => sum + (q.paidAmount || 0), 0);
            
            return (
              <div 
                key={group.developmentId} 
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all duration-200"
              >
                {/* Encabezado del Desarrollo - Clickable */}
                <button
                  onClick={() => toggleDevelopment(group.developmentId)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-700 hover:from-green-100 hover:to-emerald-100 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <BuildingOfficeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {group.developmentTitle}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {group.quotas.length} {group.quotas.length === 1 ? 'pago' : 'pagos'} - Total: {formatCurrency(groupTotal)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/developments/${group.developmentId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium"
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

                {/* Tabla de Pagos del Desarrollo - Colapsable */}
                {expanded && (
                  <div className="overflow-x-auto animate-in slide-in-from-top-2 duration-200">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Cuota
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Monto Pagado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Fecha de Pago
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Método
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Referencia
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {group.quotas.map((quota) => {
                          const isFullyPaid = quota.status === "PAID";
                          const isPartial = quota.status === "PARTIAL";
                          
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
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                  {formatCurrency(quota.paidAmount || 0, quota.currency?.code)}
                                </div>
                                {quota.amount && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    de {formatCurrency(quota.amount, quota.currency?.code)}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {quota.paidDate ? formatDate(quota.paidDate) : '-'}
                                </div>
                                {quota.processedAt && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Registrado: {formatDate(quota.processedAt)}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {getPaymentMethodLabel(quota.paymentMethod)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {quota.paymentReference || '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  isFullyPaid 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                    : isPartial
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {isFullyPaid ? (
                                    <>
                                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                                      Pagada
                                    </>
                                  ) : isPartial ? (
                                    <>
                                      <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                                      Pago Parcial
                                    </>
                                  ) : (
                                    'Pendiente'
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-3">
                                  {quota.status !== "PAID" && (
                                    <Link
                                      href={`/developments/quotas/${quota.id}/payment?returnTo=${encodeURIComponent(returnTo)}`}
                                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                      title="Completar pago"
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
        </div>

        {groupedQuotas.length === 0 && (
          <div className="text-center py-16 px-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative w-32 h-32 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center shadow-xl">
                <CurrencyDollarIcon className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
              No se encontraron pagos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto text-base leading-relaxed">
              {searchTerm 
                ? "No hay pagos que coincidan con tu búsqueda."
                : "Aún no se han registrado pagos. Los pagos aparecerán aquí una vez que se registren en las cuotas."}
            </p>
            {!searchTerm && (
              <Link
                href="/developments/quotas"
                className="group relative overflow-hidden inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 rounded-xl font-semibold"
              >
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                <CurrencyDollarIcon className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">Ver Cuotas</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
