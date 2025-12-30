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
  CalendarIcon
} from "@heroicons/react/24/outline";
import { DevelopmentUnit, UnitType, UnitStatus } from "../components/types";
import { developmentUnitService } from "../services/developmentUnitService";

export default function DevelopmentUnitsPage() {
  const [units, setUnits] = useState<DevelopmentUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<UnitStatus | "ALL">("ALL");
  const [filterType, setFilterType] = useState<UnitType | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const data = await developmentUnitService.getAllUnits();
      setUnits(data);
    } catch (error) {
      console.error("Error loading units:", error);
      // Sin datos ficticios: dejar vacío
      setUnits([]);
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
    const matchesSearch = unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.unitName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
                Gestión de Unidades
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Administra lotes, departamentos y unidades del desarrollo
              </p>
            </div>
            <Link
              href={`/developments/units/new`}
              className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nueva Unidad
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
                onChange={(e) => setFilterStatus(e.target.value as UnitStatus | "ALL")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as UnitType | "ALL")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
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
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Unidades */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Unidades ({filteredUnits.length})
            </h3>
          </div>

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
                {filteredUnits.map((unit) => (
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

          {filteredUnits.length === 0 && (
            <div className="text-center py-12">
              <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No se encontraron unidades
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || filterStatus !== "ALL" || filterType !== "ALL" 
                  ? "Intenta ajustar los filtros de búsqueda."
                  : "Comienza agregando la primera unidad al desarrollo."}
              </p>
              {!searchTerm && filterStatus === "ALL" && filterType === "ALL" && (
                <div className="mt-6">
                  <Link
                    href={`/developments/units/new`}
                    className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Nueva Unidad
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