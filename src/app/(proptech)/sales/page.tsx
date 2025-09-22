"use client";
import React, { useEffect, useState } from "react";
import { propertyService } from "../properties/services/propertyService";
import type { Property } from "../properties/components/types";
import { useRouter } from "next/navigation";
import { 
  HomeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  StarIcon
} from "@heroicons/react/24/outline";

export default function PropertySalesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const router = useRouter();

  useEffect(() => {
    propertyService.getAllProperties().then((response) => {
      const soldProperties = response.data.filter((p: Property) => p.status === "sold");
      setProperties(soldProperties);
      setLoading(false);
    });
  }, []);

  // Filtros
  const filtered = properties.filter(p => {
    const matchesTitle = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCity = city ? p.city === city : true;
    const matchesMin = minPrice ? p.price >= Number(minPrice) : true;
    const matchesMax = maxPrice ? p.price <= Number(maxPrice) : true;
    return matchesTitle && matchesCity && matchesMin && matchesMax;
  });

  // Ciudades únicas para el filtro
  const cities = Array.from(new Set(properties.map(p => p.city)));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalSales = filtered.reduce((sum, p) => sum + (p.price || 0), 0);
  const avgPrice = filtered.length > 0 ? totalSales / filtered.length : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando operaciones de propiedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full min-w-0">
            {/* Title Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <HomeIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-900 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                  Operaciones de Propiedades
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Gestión de propiedades vendidas y transacciones
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/sales/new")}
                className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/30"
              >
                <PlusIcon className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                Nueva Operación
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full min-w-0 overflow-x-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Total Ventas
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {filtered.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                <HomeIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Valor Total
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatCurrency(totalSales)}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <CurrencyDollarIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Precio Promedio
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatCurrency(avgPrice)}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por título..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm transition-all duration-200"
              />
            </div>
            
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="px-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm transition-all duration-200"
            >
              <option value="">Todas las ciudades</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <input
              type="number"
              placeholder="Precio mínimo"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="px-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm transition-all duration-200"
              min={0}
            />
            
            <input
              type="number"
              placeholder="Precio máximo"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="px-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm transition-all duration-200"
              min={0}
            />
            
            <button
              onClick={() => {
                setSearch("");
                setCity("");
                setMinPrice("");
                setMaxPrice("");
              }}
              className="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100/50 dark:divide-gray-700/50">
              <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/80 dark:to-gray-800/80 border-b border-gray-200/50 dark:border-gray-600/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <HomeIcon className="h-4 w-4 text-teal-500" />
                      Propiedad
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-blue-500" />
                      Ciudad
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
                      Precio
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>Estado</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <span>Acciones</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-100/50 dark:divide-gray-700/50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <div className="text-center">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <HomeIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {search || city || minPrice || maxPrice ? "No se encontraron propiedades" : "No hay propiedades vendidas"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          {search || city || minPrice || maxPrice 
                            ? "No se encontraron propiedades que coincidan con los filtros aplicados."
                            : "Comienza registrando las primeras ventas de propiedades."}
                        </p>
                        {!search && !city && !minPrice && !maxPrice && (
                          <button
                            onClick={() => router.push("/sales/new")}
                            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                          >
                            <PlusIcon className="w-5 h-5 mr-2 inline" />
                            Registrar Primera Venta
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-cyan-50/50 dark:hover:from-teal-900/10 dark:hover:to-cyan-900/10 transition-all duration-200 group">
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                            <HomeIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200">
                              {p.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {p.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg shadow-sm">
                            <MapPinIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {p.city}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg shadow-sm">
                            <CurrencyDollarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(p.price || 0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                          <span className="inline-flex px-3 py-1 text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-400 border border-green-200 dark:border-green-700 shadow-sm">
                            Vendida
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/properties/${p.id}`)}
                            className="inline-flex items-center justify-center p-2 text-teal-600 hover:text-teal-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:text-teal-400 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Ver propiedad"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => router.push(`/properties/${p.id}/edit`)}
                            className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:from-gray-700 dark:hover:to-gray-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Editar"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 