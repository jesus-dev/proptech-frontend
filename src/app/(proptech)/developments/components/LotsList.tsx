"use client";

import React, { useState, useEffect } from "react";
import { 
  FunnelIcon, 
  ViewColumnsIcon, 
  MagnifyingGlassIcon,
  HomeIcon,
  UserIcon,
  EyeIcon,
  CurrencyDollarIcon,
  PencilIcon
} from "@heroicons/react/24/outline";
import { Lot, Sale, Client } from "./types";
import { saleService } from "../services/saleService";
import { clientService } from "../services/clientService";
import SaleModal from "./SaleModal";
import PaymentHistory from "./PaymentHistory";
interface LotsListProps {
  lots: Lot[];
  onLotClick?: (lot: Lot) => void;
}

type FilterStatus = "all" | "available" | "sold" | "reserved";
type SortBy = "number" | "price" | "area" | "status";
type SortOrder = "asc" | "desc";
type ViewMode = "grid" | "list" | "table";

export default function LotsList({ lots, onLotClick }: LotsListProps) {
  // Asegurar que lots siempre sea un array
  const safeLots = Array.isArray(lots) ? lots : [];
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  // Filtros y ordenamiento avanzados
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("number");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtros avanzados
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [areaRange, setAreaRange] = useState({ min: "", max: "" });

  useEffect(() => {
    loadSales();
    loadClients();
  }, []);

  const loadSales = async () => {
    try {
      const allSales = await saleService.getAllSales();
      setSales(allSales);
    } catch (error) {
      console.error("Error loading sales:", error);
    }
  };

  const loadClients = async () => {
    try {
      const allClients = await clientService.getAllClients();
      setClients(allClients);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const getSaleForLot = (lotId: string): Sale | undefined => {
    return sales.find(sale => sale.lotId === lotId);
  };

  const getClientForSale = (clientId: string): Client | undefined => {
    return clients.find(client => client.id === clientId);
  };

  const handleSaleClick = (lot: Lot) => {
    setSelectedLot(lot);
    setIsSaleModalOpen(true);
  };

  const handlePaymentClick = (lot: Lot) => {
    const sale = getSaleForLot(lot.id);
    if (sale) {
      setSelectedSale(sale);
      setIsPaymentModalOpen(true);
    }
  };

  const handleSaleComplete = () => {
    loadSales();
    setIsSaleModalOpen(false);
    setSelectedLot(null);
  };

  const handlePaymentRecorded = () => {
    loadSales();
    setIsPaymentModalOpen(false);
    setSelectedSale(null);
  };

  const filteredAndSortedLots = safeLots
    .filter((lot) => {
      // Filtro por búsqueda
      const searchMatch = 
        lot.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por estado
      const statusMatch = filterStatus === "all" || lot.status === filterStatus;

      // Filtro por rango de precio
      const priceMatch = 
        (!priceRange.min || lot.price >= Number(priceRange.min)) &&
        (!priceRange.max || lot.price <= Number(priceRange.max));

      // Filtro por rango de área
      const areaMatch = 
        (!areaRange.min || lot.area >= Number(areaRange.min)) &&
        (!areaRange.max || lot.area <= Number(areaRange.max));

      return searchMatch && statusMatch && priceMatch && areaMatch;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "number":
          comparison = parseInt(a.number) - parseInt(b.number);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "area":
          comparison = a.area - b.area;
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
      default:
        return status;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setPriceRange({ min: "", max: "" });
    setAreaRange({ min: "", max: "" });
  };

  const getStats = () => {
    const total = safeLots.length;
    const available = safeLots.filter(l => l.status === "available").length;
    const sold = safeLots.filter(l => l.status === "sold").length;
    const reserved = safeLots.filter(l => l.status === "reserved").length;
    const filtered = filteredAndSortedLots.length;

    return { total, available, sold, reserved, filtered };
  };

  const stats = getStats();

  if (!safeLots || safeLots.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No hay lotes disponibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Lista de Lotes ({stats.filtered}/{stats.total})
          </h2>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Disponibles: {stats.available}</span>
            <span>Vendidos: {stats.sold}</span>
            <span>Reservados: {stats.reserved}</span>
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
                  placeholder="Número, descripción..."
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
                <option value="number">Número</option>
                <option value="area">Área</option>
                <option value="price">Precio</option>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
            {filteredAndSortedLots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedLots.map((lot) => {
                  const sale = getSaleForLot(lot.id);
                  const client = sale ? getClientForSale(sale.clientId) : null;
                  
                  return (
                    <div
                      key={lot.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onLotClick?.(lot)}
                    >
                      {/* Lot Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <HomeIcon className="h-5 w-5 text-brand-500" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Lote {lot.number}
                          </h4>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lot.status)}`}>
                          {getStatusText(lot.status)}
                        </span>
                      </div>

                      {/* Lot Details */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Área:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                              {lot.area} m²
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Precio:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                              ${lot.price.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {lot.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {lot.description}
                          </p>
                        )}

                        {/* Sale Info */}
                        {sale && client && (
                          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                            <div className="flex items-center space-x-2 text-sm">
                              <UserIcon className="h-4 w-4 text-blue-500" />
                              <span className="text-blue-700 dark:text-blue-300">
                                Vendido a {client.firstName} {client.lastName}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                ${sale.totalPrice.toLocaleString()} - {sale.status}
                              </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLotClick?.(lot);
                          }}
                          className="p-1 text-gray-400 hover:text-brand-500 transition-colors"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {lot.status === "available" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaleClick(lot);
                            }}
                            className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                            title="Registrar venta"
                          >
                            <CurrencyDollarIcon className="h-4 w-4" />
                          </button>
                        )}
                        {sale && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePaymentClick(lot);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Ver pagos"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No hay lotes disponibles
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No se encontraron lotes que coincidan con los filtros aplicados.
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
            {filteredAndSortedLots.length > 0 ? (
              <div className="space-y-3">
                {filteredAndSortedLots.map((lot) => {
                  const sale = getSaleForLot(lot.id);
                  const client = sale ? getClientForSale(sale.clientId) : null;
                  
                  return (
                    <div
                      key={lot.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onLotClick?.(lot)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Lote {lot.number}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span>{lot.area} m²</span>
                              <span>${lot.price.toLocaleString()}</span>
                              {sale && client && (
                                <span className="text-blue-600 dark:text-blue-400">
                                  Vendido a {client.firstName} {client.lastName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lot.status)}`}>
                            {getStatusText(lot.status)}
                          </span>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onLotClick?.(lot);
                            }}
                            className="p-1 text-gray-400 hover:text-brand-500 transition-colors"
                            title="Ver detalles"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No hay lotes disponibles
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No se encontraron lotes que coincidan con los filtros aplicados.
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
                    Lote
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
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedLots.map((lot) => {
                  const sale = getSaleForLot(lot.id);
                  const client = sale ? getClientForSale(sale.clientId) : null;
                  
                  return (
                    <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {lot.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {lot.area} m²
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${lot.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lot.status)}`}>
                          {getStatusText(lot.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {client ? `${client.firstName} ${client.lastName}` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => onLotClick?.(lot)}
                          className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales */}
      {isSaleModalOpen && selectedLot && (
        <SaleModal
          lot={selectedLot}
          isOpen={isSaleModalOpen}
          onClose={() => setIsSaleModalOpen(false)}
          onSaleComplete={handleSaleComplete}
        />
      )}

      {isPaymentModalOpen && selectedSale && (
        <PaymentHistory
          sale={selectedSale}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}
    </div>
  );
} 