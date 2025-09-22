"use client";

import React, { useState } from "react";
import { Unit } from "./types";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";
interface UnitsListProps {
  units: Unit[];
  onUnitClick?: (unit: Unit) => void;
}

type FilterStatus = "all" | "available" | "sold" | "reserved" | "rented";
type SortBy = "floor" | "unitNumber" | "area" | "price" | "bedrooms" | "status";
type SortOrder = "asc" | "desc";
type ViewMode = "grid" | "list" | "table";

export default function UnitsList({ units, onUnitClick }: UnitsListProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("floor");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtros avanzados
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [areaRange, setAreaRange] = useState({ min: "", max: "" });
  const [bedroomsFilter, setBedroomsFilter] = useState<number | "">("");

  const filteredAndSortedUnits = units
    .filter((unit) => {
      // Filtro por búsqueda
      const searchMatch = 
        unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.floor.toString().includes(searchTerm.toLowerCase());

      // Filtro por estado
      const statusMatch = filterStatus === "all" || unit.status === filterStatus;

      // Filtro por rango de precio
      const priceMatch = 
        (!priceRange.min || unit.price >= Number(priceRange.min)) &&
        (!priceRange.max || unit.price <= Number(priceRange.max));

      // Filtro por rango de área
      const areaMatch = 
        (!areaRange.min || unit.area >= Number(areaRange.min)) &&
        (!areaRange.max || unit.area <= Number(areaRange.max));

      // Filtro por dormitorios
      const bedroomsMatch = bedroomsFilter === "" || unit.bedrooms === bedroomsFilter;

      return searchMatch && statusMatch && priceMatch && areaMatch && bedroomsMatch;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "floor":
          comparison = a.floor - b.floor;
          break;
        case "unitNumber":
          comparison = a.unitNumber.localeCompare(b.unitNumber);
          break;
        case "area":
          comparison = a.area - b.area;
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "bedrooms":
          comparison = a.bedrooms - b.bedrooms;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "sold":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "reserved":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "rented":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "sold":
        return "Vendido";
      case "reserved":
        return "Reservado";
      case "rented":
        return "Alquilado";
      default:
        return status;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setPriceRange({ min: "", max: "" });
    setAreaRange({ min: "", max: "" });
    setBedroomsFilter("");
  };

  const getStats = () => {
    const total = units.length;
    const available = units.filter(u => u.status === "available").length;
    const sold = units.filter(u => u.status === "sold").length;
    const reserved = units.filter(u => u.status === "reserved").length;
    const rented = units.filter(u => u.status === "rented").length;
    const filtered = filteredAndSortedUnits.length;

    return { total, available, sold, reserved, rented, filtered };
  };

  const stats = getStats();

  if (!units || units.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No hay unidades disponibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Lista de Unidades ({stats.filtered}/{stats.total})
          </h2>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Disponibles: {stats.available}</span>
            <span>Vendidas: {stats.sold}</span>
            <span>Alquiladas: {stats.rented}</span>
            <span>Reservadas: {stats.reserved}</span>
          </div>
        </div>

        {/* Controles de vista */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg ${
              showFilters
                ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
            }`}
            title="Filtros"
          >
            <FunnelIcon className="size-5" />
          </button>
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-l-lg ${
                viewMode === "grid"
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
              }`}
              title="Vista de cuadrícula"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
              }`}
              title="Vista de lista"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-r-lg ${
                viewMode === "table"
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
              }`}
              title="Vista de tabla"
            >
              <ViewColumnsIcon className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Número, descripción, piso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="available">Disponible</option>
                <option value="sold">Vendido</option>
                <option value="rented">Alquilado</option>
                <option value="reserved">Reservado</option>
              </select>
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="floor">Piso</option>
                <option value="unitNumber">Número</option>
                <option value="area">Área</option>
                <option value="price">Precio</option>
                <option value="bedrooms">Dormitorios</option>
                <option value="status">Estado</option>
              </select>
            </div>

            {/* Orden */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Orden
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            </div>
          </div>

          {/* Rangos de precio y área */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rango de Precio ($)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rango de Área (m²)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={areaRange.min}
                  onChange={(e) => setAreaRange(prev => ({ ...prev, min: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={areaRange.max}
                  onChange={(e) => setAreaRange(prev => ({ ...prev, max: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dormitorios
              </label>
              <select
                value={bedroomsFilter}
                onChange={(e) => setBedroomsFilter(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Todos</option>
                <option value="1">1 dormitorio</option>
                <option value="2">2 dormitorios</option>
                <option value="3">3 dormitorios</option>
                <option value="4">4+ dormitorios</option>
              </select>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Contenido según modo de vista */}
      {viewMode === "grid" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6">
            {filteredAndSortedUnits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onUnitClick?.(unit)}
                  >
                    {/* Unit Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <HomeIcon className="h-5 w-5 text-brand-500" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Unidad {unit.unitNumber}
                        </h4>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(unit.status)}`}>
                        {getStatusText(unit.status)}
                      </span>
                    </div>

                    {/* Unit Details */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Piso {unit.floor}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Dormitorios:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            {unit.bedrooms}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Baños:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            {unit.bathrooms}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Área:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            {unit.area} m²
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Precio:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            ${unit.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {unit.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {unit.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnitClick?.(unit);
                        }}
                        className="p-1 text-gray-400 hover:text-brand-500 transition-colors"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement edit functionality
                          console.log("Edit unit:", unit.id);
                        }}
                        className="p-1 text-gray-400 hover:text-brand-500 transition-colors"
                        title="Editar unidad"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No hay unidades disponibles
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No se encontraron unidades que coincidan con los filtros aplicados.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-brand-600 bg-brand-50 rounded-md hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/40"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === "list" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6">
            {filteredAndSortedUnits.length > 0 ? (
              <div className="space-y-3">
                {filteredAndSortedUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onUnitClick?.(unit)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Unidad {unit.unitNumber}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span>Piso {unit.floor}</span>
                            <span>{unit.area} m²</span>
                            <span>${unit.price.toLocaleString()}</span>
                            <span>{unit.bedrooms} dormitorios</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(unit.status)}`}>
                          {getStatusText(unit.status)}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnitClick?.(unit);
                          }}
                          className="p-1 text-gray-400 hover:text-brand-500 transition-colors"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No hay unidades disponibles
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No se encontraron unidades que coincidan con los filtros aplicados.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-brand-600 bg-brand-50 rounded-md hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/40"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === "table" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Unidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Piso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Dormitorios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Precio
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
                {filteredAndSortedUnits.map((unit) => (
                  <tr key={unit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {unit.unitNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {unit.floor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {unit.bedrooms}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {unit.area} m²
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ${unit.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(unit.status)}`}>
                        {getStatusText(unit.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onUnitClick?.(unit)}
                        className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {filteredAndSortedUnits.length === 0 && viewMode !== "grid" && viewMode !== "list" && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No se encontraron unidades que coincidan con los filtros aplicados.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 text-brand-600 bg-brand-50 rounded-md hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/40"
          >
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
} 