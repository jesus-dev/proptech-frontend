"use client";

import { BuildingOfficeIcon, HomeIcon, MapPinIcon, UserIcon, ChartBarIcon, PlusIcon, ArrowRightIcon, ChartBarSquareIcon, StarIcon, BuildingOffice2Icon, MapPinIcon as MapPin, CalendarDaysIcon } from "@heroicons/react/24/outline";

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { GridIcon, ListIcon } from "@/icons";
import { Development } from "./components/types";
import { developmentService } from "./services/developmentService";

const DevelopmentCard: React.FC<{ development: Development }> = ({ development }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "loteamiento": return <MapPin className="w-4 h-4" />;
      case "edificio": return <BuildingOffice2Icon className="w-4 h-4" />;
      case "condominio": return <BuildingOfficeIcon className="w-4 h-4" />;
      default: return <HomeIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-gradient-to-r from-emerald-500 to-green-500";
      case "sold": return "bg-gradient-to-r from-red-500 to-rose-500";
      default: return "bg-gradient-to-r from-yellow-500 to-amber-500";
    }
  };

  return (
    <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Image with overlay */}
      <div className="relative overflow-hidden rounded-t-xl">
        <img
          src={development.images?.[0] || "/images/placeholder.jpg"}
          alt={development.title}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Type Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getStatusColor(development.status)} text-white border-0 shadow-lg backdrop-blur-sm flex items-center gap-1.5`}>
            {getTypeIcon(development.type)}
            {development.type === "loteamiento" ? "Loteamiento" : 
             development.type === "edificio" ? "Edificio" : 
             development.type === "condominio" ? "Condominio" : "Barrio Cerrado"}
          </Badge>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-0 shadow-lg backdrop-blur-sm">
            {development.status === "available" ? "Disponible" : 
             development.status === "sold" ? "Vendido" : "Reservado"}
          </Badge>
        </div>
      </div>

      <div className="p-6 relative">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <Link href={`/developments/${development.id}`} className="hover:underline">
            {development.title}
          </Link>
        </h3>
        
        <div className="flex items-center text-slate-600 dark:text-slate-400 mb-3">
          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
          <span className="text-sm">{development.address}, {development.city}</span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
          {development.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
            <CalendarDaysIcon className="w-4 h-4 mr-1" />
            {new Date(development.createdAt).toLocaleDateString('es-ES')}
          </div>
          
          <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

const DevelopmentListItem: React.FC<{ development: Development }> = ({ development }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "loteamiento": return <MapPin className="w-4 h-4" />;
      case "edificio": return <BuildingOffice2Icon className="w-4 h-4" />;
      case "condominio": return <BuildingOfficeIcon className="w-4 h-4" />;
      default: return <HomeIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-gradient-to-r from-emerald-500 to-green-500";
      case "sold": return "bg-gradient-to-r from-red-500 to-rose-500";
      default: return "bg-gradient-to-r from-yellow-500 to-amber-500";
    }
  };

  return (
    <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center space-x-6 p-6">
        <div className="relative flex-shrink-0">
          <img
            src={development.images?.[0] || "/images/placeholder.jpg"}
            alt={development.title}
            className="w-32 h-32 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
          />
          <div className="absolute -top-2 -right-2">
            <Badge className={`${getStatusColor(development.status)} text-white border-0 shadow-lg backdrop-blur-sm flex items-center gap-1.5 text-xs`}>
              {getTypeIcon(development.type)}
              {development.type === "loteamiento" ? "Loteamiento" : 
               development.type === "edificio" ? "Edificio" : 
               development.type === "condominio" ? "Condominio" : "Barrio Cerrado"}
            </Badge>
          </div>
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <Link href={`/developments/${development.id}`} className="hover:underline">
                {development.title}
              </Link>
            </h3>
            
            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-0">
              {development.status === "available" ? "Disponible" : 
               development.status === "sold" ? "Vendido" : "Reservado"}
            </Badge>
          </div>

          <div className="flex items-center text-slate-600 dark:text-slate-400 mb-3">
            <MapPin className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="text-sm truncate">{development.address}, {development.city}</span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 hidden md:block">
            {development.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
              <CalendarDaysIcon className="w-4 h-4 mr-1" />
              {new Date(development.createdAt).toLocaleDateString('es-ES')}
            </div>
            
            <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function DevelopmentsPage() {
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "loteamiento" | "edificio" | "condominio" | "barrio_cerrado">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "sold" | "reserved">("all");
  const [sortBy, setSortBy] = useState<"date" | "price" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState({
    totalDevelopments: 0,
    availableDevelopments: 0,
    soldDevelopments: 0,
    reservedDevelopments: 0
  });

  useEffect(() => {
    const loadDevelopments = async () => {
      try {
        setIsLoading(true);
        const response = await developmentService.getAllDevelopments();
        const data = response.data || [];
        setDevelopments(data);
        
        // Calculate stats
        const total = data.length;
        const available = data.filter((dev: Development) => dev.status === "available").length;
        const sold = data.filter((dev: Development) => dev.status === "sold").length;
        const reserved = data.filter((dev: Development) => dev.status === "reserved").length;
        
        setStats({
          totalDevelopments: total,
          availableDevelopments: available,
          soldDevelopments: sold,
          reservedDevelopments: reserved
        });
      } catch (error) {
        console.error("Error loading developments:", error);
        setDevelopments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDevelopments();
  }, []);

  const filteredAndSortedDevelopments = developments
    .filter((development) => {
    const matchesSearch = development.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         development.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         development.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         development.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || development.type === filterType;
    const matchesStatus = filterStatus === "all" || development.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case "price":
          comparison = (b.price || 0) - (a.price || 0);
          break;
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
      }
      
      return sortOrder === "asc" ? -comparison : comparison;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full min-w-0">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Modern Header */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md">
                    <BuildingOffice2Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                      Desarrollos
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                      Gestiona tus emprendimientos inmobiliarios
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/developments/dashboard">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/developments/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Nuevo Desarrollo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium">Total Desarrollos</p>
                  <p className="text-xl font-bold mt-1">{stats.totalDevelopments}</p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <BuildingOffice2Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs font-medium">Disponibles</p>
                  <p className="text-xl font-bold mt-1">{stats.availableDevelopments}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <ChartBarSquareIcon className="w-8 h-8" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-xs font-medium">Vendidos</p>
                  <p className="text-xl font-bold mt-1">{stats.soldDevelopments}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <StarIcon className="w-8 h-8" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xs font-medium">Reservados</p>
                  <p className="text-xl font-bold mt-1">{stats.reservedDevelopments}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <CalendarDaysIcon className="w-8 h-8" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Modern Filters */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-md mb-4">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Buscar</label>
                <input
                  type="text"
                  placeholder="Buscar desarrollos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all duration-200 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Tipo</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as "all" | "loteamiento" | "edificio" | "condominio" | "barrio_cerrado")}
                  className="w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all duration-200 text-sm"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="loteamiento">Loteamientos</option>
                  <option value="edificio">Edificios</option>
                  <option value="condominio">Condominios</option>
                  <option value="barrio_cerrado">Barrio Cerrado</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Estado</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as "all" | "available" | "sold" | "reserved")}
                  className="w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all duration-200 text-sm"
                >
                  <option value="all">Todos los estados</option>
                  <option value="available">Disponible</option>
                  <option value="sold">Vendido</option>
                  <option value="reserved">Reservado</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Ordenar</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                  className="w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all duration-200 text-sm"
                >
                  <option value="date-desc">Más recientes</option>
                  <option value="date-asc">Más antiguos</option>
                  <option value="price-desc">Precio mayor</option>
                  <option value="price-asc">Precio menor</option>
                  <option value="name-asc">A-Z</option>
                  <option value="name-desc">Z-A</option>
                </select>
              </div>
            </div>
            
            {/* View Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">{filteredAndSortedDevelopments.length}</span> desarrollo{filteredAndSortedDevelopments.length !== 1 ? 's' : ''} encontrado{filteredAndSortedDevelopments.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    view === "grid"
                      ? "bg-white dark:bg-slate-600 text-blue-600 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <GridIcon className="size-5" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    view === "list"
                      ? "bg-white dark:bg-slate-600 text-blue-600 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <ListIcon className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Content */}
        {filteredAndSortedDevelopments.length > 0 ? (
          <div className={view === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
            : "space-y-6"
          }>
            {filteredAndSortedDevelopments.map((dev: Development) =>
              view === "grid" ? (
                <DevelopmentCard key={dev.id} development={dev} />
              ) : (
                <DevelopmentListItem key={dev.id} development={dev} />
              )
            )}
          </div>
        ) : (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-3xl flex items-center justify-center">
                <BuildingOffice2Icon className="w-12 h-12 text-slate-500 dark:text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No se encontraron desarrollos
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                No hay emprendimientos que coincidan con los criterios de búsqueda actuales. Intenta ajustar los filtros o crear un nuevo desarrollo.
              </p>
              <Link href="/developments/new">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Crear Nuevo Desarrollo
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 