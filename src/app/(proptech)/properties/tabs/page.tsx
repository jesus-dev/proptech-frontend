"use client";
import React, { useState } from "react";
import { Property } from "../components/types";
import PropertyList from "../components/PropertyList";
import { GridIcon, ListIcon, PlusIcon, FilterIcon, TableIcon, PieChartIcon } from "@/icons/index";
import Link from "next/link";

const sampleProperties: Property[] = [
  {
    id: "1",
    title: "Apartamento en Centro",
    address: "Centro Histórico, CDMX",
    city: "Ciudad de México",
    state: "CDMX",
    zip: "06000",
    price: 2500000,
    status: "active",
    type: "apartment",
    currency: "USD",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop"],
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    description: "Apartamento moderno en el corazón de la ciudad.",
    amenities: ["Gimnasio", "Seguridad 24/7"] as any,
    privateFiles: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Casa en Lomas",
    address: "Lomas de Chapultepec, CDMX",
    city: "Ciudad de México",
    state: "CDMX",
    zip: "11000",
    price: 8500000,
    status: "active",
    type: "house",
    currency: "USD",
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop"],
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    description: "Amplia casa con jardín en zona exclusiva.",
    amenities: ["Piscina", "Jardín"] as any,
    privateFiles: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Local Comercial",
    address: "Polanco, CDMX",
    city: "Ciudad de México",
    state: "CDMX",
    zip: "11560",
    price: 12000000,
    status: "inactive",
    type: "commercial",
    currency: "USD",
    images: ["https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&auto=format&fit=crop"],
    area: 150,
    description: "Local comercial ideal para negocio u oficina.",
    amenities: ["Estacionamiento", "Seguridad"] as any,
    privateFiles: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

type Tab = "properties" | "analytics" | "reports";

export default function PropertiesTabsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("properties");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { 
      id: "properties", 
      label: "Propiedades",
      icon: <TableIcon className="size-5" />
    },
    { 
      id: "analytics", 
      label: "Analíticas",
      icon: <PieChartIcon className="size-5" />
    },
    { 
      id: "reports", 
      label: "Reportes",
      icon: <TableIcon className="size-5" />
    },
  ];

  const filteredProperties = sampleProperties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case "properties":
        return (
          <>
            {/* Search and View Toggle */}
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar propiedades..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="size-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-lg ${
                      showFilters
                        ? "bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    <FilterIcon className="size-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg ${
                      viewMode === "grid"
                        ? "bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    <GridIcon className="size-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg ${
                      viewMode === "list"
                        ? "bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    <ListIcon className="size-5" />
                  </button>
                </div>
              </div>

              {/* Filtros */}
              {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rango de Precio
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Mín"
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          placeholder="Máx"
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Habitaciones
                      </label>
                      <select className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="">Cualquier</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Área (m²)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Mín"
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          placeholder="Máx"
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Property List */}
            <div className="p-4">
              {filteredProperties.length > 0 ? (
                <PropertyList properties={filteredProperties} view={viewMode} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No se encontraron propiedades que coincidan con los criterios de búsqueda.
                  </p>
                </div>
              )}
            </div>
          </>
        );

      case "analytics":
        return (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tarjeta de Resumen */}
              <div className="col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Resumen de Propiedades
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Propiedades</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                      {sampleProperties.length}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Activas</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                      {sampleProperties.filter(p => p.status === "active").length}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Inactivas</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                      {sampleProperties.filter(p => p.status === "inactive").length}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Valor Total</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                        minimumFractionDigits: 0,
                      }).format(sampleProperties.reduce((sum, p) => sum + p.price, 0))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Distribución por Tipo */}
              <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Distribución por Tipo
                </h3>
                <div className="space-y-4">
                  {["apartment", "house", "commercial"].map((type) => {
                    const count = sampleProperties.filter(p => p.type === type).length;
                    const percentage = (count / sampleProperties.length) * 100;
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            {type === "apartment" ? "Apartamentos" : type === "house" ? "Casas" : "Comerciales"}
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Estado de Propiedades */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Estado de Propiedades
                </h3>
                <div className="space-y-4">
                  {["active", "inactive"].map((status) => {
                    const count = sampleProperties.filter(p => p.status === status).length;
                    const percentage = (count / sampleProperties.length) * 100;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            {status === "active" ? "Activas" : "Inactivas"}
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              status === "active" ? "bg-green-500" : "bg-gray-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case "reports":
        return (
          <div className="p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Reportes Disponibles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Inventario de Propiedades
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Lista detallada de todas las propiedades con sus características principales.
                  </p>
                  <button className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">
                    Descargar Reporte
                  </button>
                </div>
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Análisis de Precios
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Estadísticas y tendencias de precios por tipo de propiedad.
                  </p>
                  <button className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">
                    Descargar Reporte
                  </button>
                </div>
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Estado de Propiedades
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Resumen del estado actual de todas las propiedades.
                  </p>
                  <button className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">
                    Descargar Reporte
                  </button>
                </div>
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Valoración Total
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Valor total del portafolio y distribución por tipo.
                  </p>
                  <button className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">
                    Descargar Reporte
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Propiedades
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Administre y visualice todas sus propiedades
            </p>
          </div>
          <Link
            href="/properties/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            <PlusIcon className="size-5 mr-2" />
            Nueva Propiedad
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {/* Tabs */}
        <div className="border-b dark:border-gray-700">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
} 