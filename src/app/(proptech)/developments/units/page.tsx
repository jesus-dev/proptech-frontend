"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BuildingOfficeIcon, 
  HomeIcon, 
  MapIcon, 
  CurrencyDollarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from "@heroicons/react/24/outline";
import { DevelopmentUnit, UnitType, UnitStatus } from "../components/types";
import { developmentUnitService } from "../services/developmentUnitService";
import { developmentService } from "../services/developmentService";

export default function DevelopmentUnitsPage() {
  const [units, setUnits] = useState<DevelopmentUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<UnitStatus | "ALL">("ALL");
  const [filterType, setFilterType] = useState<UnitType | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [developmentTitleById, setDevelopmentTitleById] = useState<Record<number, string>>({});
  const [expandedDevelopments, setExpandedDevelopments] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const [unitsData, developmentsResponse] = await Promise.all([
        developmentUnitService.getAllUnits(),
        developmentService.getAllDevelopments()
      ]);

      setUnits(unitsData);

      const devMap: Record<number, string> = {};
      (developmentsResponse.data || []).forEach((dev) => {
        const id = Number(dev.id);
        if (Number.isFinite(id)) devMap[id] = dev.title;
      });
      setDevelopmentTitleById(devMap);
    } catch (error) {
      console.error("Error loading units:", error);
      // Sin datos ficticios: dejar vacío
      setUnits([]);
      setDevelopmentTitleById({});
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: UnitStatus) => {
    switch (status) {
      case "AVAILABLE":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "RESERVED":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "SOLD":
        return <CurrencyDollarIcon className="w-5 h-5 text-blue-500" />;
      case "UNDER_CONSTRUCTION":
        return <BuildingOfficeIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: UnitStatus) => {
    const statusConfig = {
      AVAILABLE: { color: "bg-green-100 text-green-800", text: "Disponible" },
      RESERVED: { color: "bg-yellow-100 text-yellow-800", text: "Reservado" },
      SOLD: { color: "bg-blue-100 text-blue-800", text: "Vendido" },
      UNDER_CONSTRUCTION: { color: "bg-orange-100 text-orange-800", text: "En Construcción" },
      DELIVERED: { color: "bg-purple-100 text-purple-800", text: "Entregado" },
      RENTED: { color: "bg-indigo-100 text-indigo-800", text: "Alquilado" },
      MAINTENANCE: { color: "bg-red-100 text-red-800", text: "Mantenimiento" },
      UNAVAILABLE: { color: "bg-gray-100 text-gray-800", text: "No Disponible" }
    };

    const config = statusConfig[status] || statusConfig.UNAVAILABLE;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{config.text}</span>
      </span>
    );
  };

  const getTypeIcon = (type: UnitType) => {
    switch (type) {
      case "LOT":
        return <MapIcon className="w-5 h-5" />;
      case "DEPARTAMENTO":
        return <BuildingOfficeIcon className="w-5 h-5" />;
      case "HOUSE":
        return <HomeIcon className="w-5 h-5" />;
      default:
        return <HomeIcon className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: UnitType) => {
    const labels: Record<UnitType, string> = {
      LOT: "Lote",
      DEPARTAMENTO: "Departamento",
      HOUSE: "Casa",
      TOWNHOUSE: "Casa Adosada",
      DUPLEX: "Dúplex",
      PENTHOUSE: "Penthouse",
      STUDIO: "Estudio",
      OFFICE: "Oficina",
      COMMERCIAL: "Local Comercial",
      WAREHOUSE: "Depósito",
      PARKING: "Estacionamiento",
      STORAGE: "Almacén"
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

  const filteredUnits = units.filter(unit => {
    const matchesStatus = filterStatus === "ALL" || unit.status === filterStatus;
    const matchesType = filterType === "ALL" || unit.type === filterType;
    const devTitle = (developmentTitleById[unit.developmentId] || "").toLowerCase();
    const matchesSearch = unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.unitName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         devTitle.includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const groupedUnits = React.useMemo(() => {
    const groups = new Map<number, { developmentId: number; developmentTitle: string; units: DevelopmentUnit[] }>();
    for (const unit of filteredUnits) {
      const developmentId = unit.developmentId;
      const developmentTitle = developmentTitleById[developmentId] || `Desarrollo #${developmentId}`;
      const existing = groups.get(developmentId);
      if (existing) {
        existing.units.push(unit);
      } else {
        groups.set(developmentId, { developmentId, developmentTitle, units: [unit] });
      }
    }

    const sortedGroups = Array.from(groups.values()).sort((a, b) =>
      a.developmentTitle.localeCompare(b.developmentTitle, "es", { sensitivity: "base" })
    );

    sortedGroups.forEach((g) => {
      g.units.sort((a, b) => a.unitNumber.localeCompare(b.unitNumber, "es", { numeric: true, sensitivity: "base" }));
    });

    return sortedGroups;
  }, [filteredUnits, developmentTitleById]);

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
                      <HomeIcon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      Gestión de Unidades
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm lg:text-base font-medium">
                      Administra lotes, departamentos y unidades del desarrollo
                    </p>
                  </div>
                </div>
              </div>
              
              <Link
                href={`/developments/units/new`}
                className="group relative overflow-hidden inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 rounded-xl font-semibold"
              >
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                <PlusIcon className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">Nueva Unidad</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Filtros */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-5 lg:p-6 mb-6">
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
                onChange={(e) => setFilterStatus(e.target.value as UnitStatus | "ALL")}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all duration-200 text-sm shadow-sm hover:shadow-md focus:shadow-lg cursor-pointer"
              >
                <option value="ALL">Todos los estados</option>
                <option value="AVAILABLE">Disponible</option>
                <option value="RESERVED">Reservado</option>
                <option value="SOLD">Vendido</option>
                <option value="UNDER_CONSTRUCTION">En Construcción</option>
                <option value="DELIVERED">Entregado</option>
                <option value="RENTED">Alquilado</option>
                <option value="MAINTENANCE">Mantenimiento</option>
                <option value="UNAVAILABLE">No Disponible</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as UnitType | "ALL")}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all duration-200 text-sm shadow-sm hover:shadow-md focus:shadow-lg cursor-pointer"
              >
                <option value="ALL">Todos los tipos</option>
                <option value="LOT">Lote</option>
                <option value="DEPARTAMENTO">Departamento</option>
                <option value="HOUSE">Casa</option>
                <option value="TOWNHOUSE">Casa Adosada</option>
                <option value="DUPLEX">Dúplex</option>
                <option value="PENTHOUSE">Penthouse</option>
                <option value="STUDIO">Estudio</option>
                <option value="OFFICE">Oficina</option>
                <option value="COMMERCIAL">Local Comercial</option>
                <option value="WAREHOUSE">Depósito</option>
                <option value="PARKING">Estacionamiento</option>
                <option value="STORAGE">Almacén</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
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

        {/* Enhanced Lista de Unidades */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Unidades ({filteredUnits.length}) • Desarrollos ({groupedUnits.length})
            </h3>
          </div>

          {/* Lista de Unidades Agrupadas por Desarrollo (accordion) */}
          <div className="p-4 space-y-4">
            {groupedUnits.map((group) => {
              const expanded = isExpanded(group.developmentId);

              return (
                <div
                  key={group.developmentId}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleDevelopment(group.developmentId)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                          <BuildingOfficeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {group.developmentTitle}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {group.units.length} {group.units.length === 1 ? "unidad" : "unidades"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <Link
                          href={`/developments/${group.developmentId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          Ver desarrollo
                        </Link>
                        {expanded ? (
                          <ChevronUpIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        )}
                      </div>
                    </div>
                  </button>

                  {expanded && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Unidad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Precio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Características
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {group.units.map((unit) => (
                            <tr key={unit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {unit.unitNumber}
                                  </div>
                                  {unit.unitName && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {unit.unitName}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getTypeIcon(unit.type)}
                                  <span className="ml-2 text-sm text-gray-900 dark:text-white">
                                    {getTypeLabel(unit.type)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(unit.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(unit.price)}
                                </div>
                                {unit.discountPrice && unit.discountPrice < unit.price && (
                                  <div className="text-sm text-red-600 dark:text-red-400">
                                    {formatCurrency(unit.discountPrice)} (Oferta)
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {unit.area && `${unit.area} ${unit.areaUnit}`}
                                  {unit.bedrooms && unit.bathrooms && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {unit.bedrooms} dorm. • {unit.bathrooms} baños
                                    </div>
                                  )}
                                  {unit.floor && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      Piso {unit.floor}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Link
                                    href={`/developments/${unit.developmentId}/units/${unit.id}`}
                                    className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                                  >
                                    <EyeIcon className="w-5 h-5" />
                                  </Link>
                                  <Link
                                    href={`/developments/${unit.developmentId}/units/${unit.id}/edit`}
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    <PencilIcon className="w-5 h-5" />
                                  </Link>
                                  <button
                                    onClick={() => {
                                      // TODO: Implementar eliminación
                                      if (confirm("¿Estás seguro de que quieres eliminar esta unidad?")) {
                                        console.log("Eliminar unidad:", unit.id);
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <TrashIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredUnits.length === 0 && (
            <div className="text-center py-16 px-6">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                  <HomeIcon className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                No se encontraron unidades
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto text-base leading-relaxed">
                {searchTerm || filterStatus !== "ALL" || filterType !== "ALL" 
                  ? "Intenta ajustar los filtros de búsqueda."
                  : "Comienza agregando la primera unidad al desarrollo."}
              </p>
              {!searchTerm && filterStatus === "ALL" && filterType === "ALL" && (
                <Link
                  href={`/developments/units/new`}
                  className="group relative overflow-hidden inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 rounded-xl font-semibold"
                >
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                  <PlusIcon className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10">Nueva Unidad</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 