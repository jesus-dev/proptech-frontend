"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PlusIcon, BuildingOfficeIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon, MapPinIcon, UserCircleIcon, CurrencyDollarIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { condominiumService, Condominium } from "@/services/condominiumService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import Pagination from "@/components/common/Pagination";

export default function CondominiumsPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "";
  const tabLabels: Record<string, string> = {
    documents: "Documentos",
    assemblies: "Asambleas",
    commonSpaces: "Espacios comunes",
    announcements: "Comunicados",
    emergencyContacts: "Contactos de emergencia",
  };
  const sectionLabel = tabFromUrl ? tabLabels[tabFromUrl] : null;
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Load cities for filter
  useEffect(() => {
    condominiumService.getCities().then(setCities).catch(() => setCities([]));
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load condominiums
  useEffect(() => {
    loadCondominiums();
  }, [currentPage, pageSize, debouncedSearchQuery, cityFilter]);

  const loadCondominiums = async () => {
    try {
      setLoading(true);
      
      const filters = {
        page: currentPage,
        limit: pageSize,
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
        ...(cityFilter && { city: cityFilter }),
      };

      const response = await condominiumService.getCondominiumsPaginated(filters);
      
      console.log("📋 Condominiums response:", response);
      console.log("📋 Condominiums array:", response.condominiums);
      
      setCondominiums(response.condominiums || []);
      setTotalElements(response.total || 0);
      setTotalPages(response.totalPages || 0);
    } catch (error: any) {
      console.error("Error loading condominiums:", error);
      toast.error(error?.message || "Error al cargar condominios");
      setCondominiums([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este condominio?")) return;

    try {
      await condominiumService.deleteCondominium(id);
      toast.success("Condominio eliminado exitosamente");
      loadCondominiums();
    } catch (error: any) {
      console.error("Error deleting condominium:", error);
      toast.error(error?.message || "Error al eliminar condominio");
    }
  };

  if (loading && condominiums.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full min-w-0">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Title Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Administración de Condominio
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {sectionLabel
                  ? `Seleccione un condominio para gestionar: ${sectionLabel}`
                  : "Administra condominios y sus unidades de manera eficiente"}
              </p>
              {sectionLabel && (
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Al hacer clic en un condominio se abrirá directamente la pestaña «{sectionLabel}».
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/condominiums/new">
                <button className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30">
                  <PlusIcon className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                  Nuevo Condominio
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar condominios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm transition-all duration-200"
                />
              </div>

              {/* City Filter */}
              <div className="relative sm:w-56">
                <select
                  value={cityFilter}
                  onChange={(e) => {
                    setCityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Todas las ciudades</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {condominiums.length} de {totalElements} condominios
          </p>
        </div>

        {/* Condominiums Display */}
        {condominiums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {condominiums.map((condominium) => (
              <div
                key={condominium.id}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden shadow-lg hover:shadow-xl hover:border-blue-300/50 dark:hover:border-blue-500/30 transition-all duration-300"
              >
                {/* Top accent bar */}
                <div className={`h-1.5 ${condominium.isActive ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-gray-300 dark:bg-gray-600"}`} />

                <div className="p-5">
                  {/* Header: icon + name + status */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <BuildingOfficeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={tabFromUrl ? `/condominiums/${condominium.id}?tab=${tabFromUrl}` : `/condominiums/${condominium.id}`}
                          className="font-bold text-lg text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
                        >
                          {condominium.name}
                        </Link>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            condominium.isActive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {condominium.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      {condominium.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                          {condominium.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Meta: city, address, development, admin, currency */}
                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPinIcon className="w-4 h-4 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{condominium.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPinIcon className="w-4 h-4 flex-shrink-0 text-gray-400 opacity-70" />
                      <span>{condominium.city}{condominium.state ? `, ${condominium.state}` : ""}</span>
                    </div>
                    {condominium.developmentName && (
                      <div className="flex items-center gap-2 text-sm">
                        <BuildingOfficeIcon className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <Link
                          href={condominium.developmentId ? `/developments/${condominium.developmentId}` : "#"}
                          className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                        >
                          {condominium.developmentName}
                        </Link>
                      </div>
                    )}
                    {condominium.administratorName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <UserCircleIcon className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{condominium.administratorName}</span>
                      </div>
                    )}
                    {condominium.currencyCode && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CurrencyDollarIcon className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span>{condominium.currencyCode}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link
                      href={tabFromUrl ? `/condominiums/${condominium.id}?tab=${tabFromUrl}` : `/condominiums/${condominium.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Ver detalles
                      <ChevronRightIcon className="w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-1">
                      <Link
                        href={tabFromUrl ? `/condominiums/${condominium.id}?tab=${tabFromUrl}` : `/condominiums/${condominium.id}`}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/condominiums/${condominium.id}/edit`}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(condominium.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-12">
            <div className="text-center">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery || cityFilter
                  ? "No se encontraron condominios"
                  : "No hay condominios registrados"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || cityFilter
                  ? "No se encontraron condominios que coincidan con los filtros aplicados."
                  : "Comienza creando tu primer condominio para gestionar tu base de datos."}
              </p>
              {!searchQuery && !cityFilter && (
                <Link href="/condominiums/new">
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                    <PlusIcon className="w-5 h-5 mr-2 inline" />
                    Crear Primer Condominio
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

