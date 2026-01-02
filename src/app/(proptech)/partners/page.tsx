"use client";

import { BanknotesIcon, BriefcaseIcon, BuildingOfficeIcon, CheckCircleIcon, ClockIcon, CreditCardIcon, CurrencyDollarIcon, ExclamationTriangleIcon, EyeIcon, FunnelIcon, MagnifyingGlassIcon, PencilIcon, PlayIcon, PlusIcon, StarIcon, UserIcon, UsersIcon } from "@heroicons/react/24/outline";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Partner, partnerService, PaginatedPartnersResponse } from "./services/partnerService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { formatPrice } from "@/lib/utils";
import { getEndpoint } from "@/lib/api-config";

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    verified: 0,
    totalEarnings: 0,
    pendingPayments: 0,
    totalMemberships: 0,
    activeMemberships: 0,
    overdueMemberships: 0
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadPartners();
  }, []);

  // Cargar partners cuando cambien los filtros
  useEffect(() => {
    loadPartners();
  }, [currentPage, searchTerm, selectedType, selectedStatus]);

  // Cargar estadísticas cuando cambien los partners
  useEffect(() => {
    if (partners.length > 0 || totalElements === 0) {
      loadStats();
    }
  }, [partners, totalElements]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const response: PaginatedPartnersResponse = await partnerService.getAllPartners({
        page: currentPage,
        size: 20,
        search: searchTerm || undefined,
        type: selectedType || undefined,
        status: selectedStatus || undefined
      });
      
      // Asegurar que content siempre sea un array
      setPartners(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Error loading partners:", error);
      // En caso de error, establecer arrays vacíos
      setPartners([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Usar los datos actuales de partners para calcular estadísticas
      const activePartners = partners.filter(partner => partner.status === 'ACTIVE' || !partner.status);
      const pendingPartners = partners.filter(partner => partner.status === 'PENDING');
      const verifiedPartners = partners.filter(partner => partner.isVerified === true);
      const partnersWithPendingPayments = partners.filter(partner => (partner.pendingEarnings || 0) > 0);

      const totalEarnings = activePartners.reduce((sum, partner) => sum + (partner.totalEarnings || 0), 0);
      const totalPendingPayments = partnersWithPendingPayments.reduce((sum, partner) => sum + (partner.pendingEarnings || 0), 0);

      setStats({
        total: totalElements,
        active: activePartners.length,
        pending: pendingPartners.length,
        verified: verifiedPartners.length,
        totalEarnings,
        pendingPayments: totalPendingPayments,
        totalMemberships: 0,
        activeMemberships: 0,
        overdueMemberships: 0
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const reloadAllData = async () => {
    try {
      setLoading(true);
      await loadPartners();
    } catch (error) {
      console.error("Error reloading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    if (filterType === "type") {
      setSelectedType(value);
      setSelectedStatus("");
    } else if (filterType === "status") {
      setSelectedStatus(value);
      setSelectedType("");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedStatus("");
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-100 text-green-800", icon: CheckCircleIcon },
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: ClockIcon },
      INACTIVE: { color: "bg-gray-100 text-gray-800", icon: UserIcon },
      SUSPENDED: { color: "bg-red-100 text-red-800", icon: ExclamationTriangleIcon },
      TERMINATED: { color: "bg-red-100 text-red-800", icon: ExclamationTriangleIcon }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      INDIVIDUAL: { color: "bg-blue-100 text-blue-800", icon: UserIcon },
      COMPANY: { color: "bg-purple-100 text-purple-800", icon: BuildingOfficeIcon },
      AGENCY: { color: "bg-indigo-100 text-indigo-800", icon: BuildingOfficeIcon },
      BROKER: { color: "bg-orange-100 text-orange-800", icon: BriefcaseIcon },
      INVESTOR: { color: "bg-green-100 text-green-800", icon: BanknotesIcon }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.INDIVIDUAL;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {type}
      </span>
    );
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "$0";
    return formatPrice(amount, "USD");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full min-w-0">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Title Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-red-900 dark:from-white dark:via-orange-200 dark:to-red-200 bg-clip-text text-transparent">
                  Gestión de Socios
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Administra los socios comerciales de la inmobiliaria
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/partners/payments">
                <button className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/30">
                  <CreditCardIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  Gestionar Pagos
                </button>
              </Link>
              <Link href="/partners/new">
                <button className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-orange-500/30">
                  <PlusIcon className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                  Nuevo Socio
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Resumen de Socios
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Socios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                {formatCurrency(stats.totalEarnings)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ganancias Totales</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar socios por nombre, email, teléfono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={selectedType}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="COMPANY">Empresa</option>
                    <option value="AGENCY">Agencia</option>
                    <option value="BROKER">Broker</option>
                    <option value="INVESTOR">Inversor</option>
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Todos los estados</option>
                    <option value="ACTIVE">Activo</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="INACTIVE">Inactivo</option>
                    <option value="SUSPENDED">Suspendido</option>
                    <option value="TERMINATED">Terminado</option>
                  </select>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    <FunnelIcon className="w-5 h-5" />
                  </button>
                  
                  {(searchTerm || selectedType || selectedStatus) && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      title="Limpiar filtros"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Partners Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Foto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Socio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Ganancias
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Propiedades
                      </th>
                      <th className="px-3 py-3 w-20 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {(partners || []).map((partner) => (
                      <tr key={partner.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex-shrink-0 h-10 w-10">
                            {partner.photo ? (
                              <img
                                src={
                                  partner.photo.startsWith('http') 
                                    ? partner.photo 
                                    : partner.photo.startsWith('/uploads/')
                                    ? getEndpoint(partner.photo)
                                    : getEndpoint(`/uploads/partners/${partner.photo}`)
                                }
                                alt={`${partner.firstName} ${partner.lastName}`}
                                className="h-10 w-10 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center';
                                    fallback.innerHTML = '<svg class="h-6 w-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {partner.firstName} {partner.lastName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {partner.email}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {partner.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTypeBadge(partner.type || "")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(partner.status || "")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrency(partner.totalEarnings)}
                          </div>
                          {partner.pendingEarnings && partner.pendingEarnings > 0 && (
                            <div className="text-sm text-yellow-600 dark:text-yellow-400">
                              Pendiente: {formatCurrency(partner.pendingEarnings)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <BuildingOfficeIcon className="w-4 h-4 mr-1 text-gray-400" />
                            {partner.propertiesManaged || 0}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {partner.successfulDeals || 0} ventas
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium w-20">
                          <div className="flex items-center justify-center gap-1">
                            <Link
                              href={`/partners/${partner.id}`}
                              className="inline-flex items-center justify-center w-8 h-8 border border-brand-500 text-brand-700 bg-white rounded-md hover:bg-brand-50 transition-colors shadow-sm"
                              title="Ver detalles"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/partners/${partner.id}/edit`}
                              className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors shadow-sm"
                              title="Editar socio"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Mostrando <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> a{" "}
                        <span className="font-medium">
                          {Math.min(currentPage * 20, totalElements)}
                        </span>{" "}
                        de <span className="font-medium">{totalElements}</span> resultados
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Anterior
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? "z-10 bg-brand-50 border-brand-500 text-brand-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Siguiente
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Empty State */}
        {!loading && partners.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No hay socios
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comienza agregando tu primer socio comercial.
            </p>
            <div className="mt-6">
              <Link
                href="/partners/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Nuevo Socio
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
} 