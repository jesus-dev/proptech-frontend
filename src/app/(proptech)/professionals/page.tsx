"use client";

import {
  WrenchScrewdriverIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon, 
  EyeIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  PlusIcon, 
  UserIcon,
  StarIcon,
  MapPinIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Professional, professionalService } from "./services/professionalService";
import { ServiceType, serviceTypeService } from "./service-types/services/serviceTypeService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { formatPrice } from "@/lib/utils";
import { SERVICE_STATUS } from "./types";

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    verified: 0,
    available: 0
  });

  useEffect(() => {
    loadServiceTypes();
    loadProfessionals();
  }, []);

  useEffect(() => {
    loadProfessionals();
  }, [selectedServiceType, selectedStatus]);

  const loadServiceTypes = async () => {
    try {
      const data = await serviceTypeService.getActiveServiceTypes();
      setServiceTypes(data);
    } catch (error) {
      console.error("Error loading service types:", error);
    }
  };

  useEffect(() => {
    if (professionals.length > 0) {
      loadStats();
    }
  }, [professionals]);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const data = await professionalService.getAllProfessionals();
      
      // Aplicar filtros
      let filtered = data;
      if (selectedServiceType) {
        filtered = filtered.filter(p => p.serviceTypeId?.toString() === selectedServiceType);
      }
      if (selectedStatus) {
        filtered = filtered.filter(p => p.status === selectedStatus);
      }
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(search) ||
          p.email?.toLowerCase().includes(search) ||
          p.phone?.toLowerCase().includes(search)
        );
      }
      
      setProfessionals(filtered);
    } catch (error) {
      console.error("Error loading professionals:", error);
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const allProfessionals = await professionalService.getAllProfessionals();
      const activeProfessionals = allProfessionals.filter(p => p.status === 'ACTIVE');
      const pendingProfessionals = allProfessionals.filter(p => p.status === 'PENDING');
      const verifiedProfessionals = allProfessionals.filter(p => p.isVerified === true);
      const availableProfessionals = allProfessionals.filter(p => p.isAvailable === true && p.status === 'ACTIVE');

      setStats({
        total: allProfessionals.length,
        active: activeProfessionals.length,
        pending: pendingProfessionals.length,
        verified: verifiedProfessionals.length,
        available: availableProfessionals.length
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProfessionals();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedServiceType("");
    setSelectedStatus("");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-100 text-green-800", icon: CheckCircleIcon },
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: ClockIcon },
      INACTIVE: { color: "bg-gray-100 text-gray-800", icon: UserIcon },
      SUSPENDED: { color: "bg-red-100 text-red-800", icon: ExclamationTriangleIcon }
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

  const getServiceTypeLabel = (professional: Professional) => {
    if (professional.serviceTypeName) {
      return professional.serviceTypeName;
    }
    if (professional.serviceTypeId) {
      const type = serviceTypes.find(t => t.id === professional.serviceTypeId);
      return type?.name || "Desconocido";
    }
    return "Desconocido";
  };

  const getServiceTypeIcon = (professional: Professional) => {
    if (professional.serviceTypeId) {
      const type = serviceTypes.find(t => t.id === professional.serviceTypeId);
      return type?.icon || "🔧";
    }
    return "🔧";
  };

  const formatCurrency = (amount: number | undefined, currency: string = "USD") => {
    if (!amount) return "$0";
    return formatPrice(amount, currency as 'USD' | 'ARS' | 'EUR' | 'PYG' | 'MXN');
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
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Profesionales
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Administra profesionales de servicios del hogar
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/professionals/new">
                <button className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30">
                  <PlusIcon className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                  Nuevo Profesional
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
              Resumen
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
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
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.verified}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Verificados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.available}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Disponibles</div>
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
                      placeholder="Buscar profesionales por nombre, email, teléfono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={selectedServiceType}
                    onChange={(e) => setSelectedServiceType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Todos los servicios</option>
                    {serviceTypes.map(type => (
                      <option key={type.id} value={type.id.toString()}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Todos los estados</option>
                    {SERVICE_STATUS.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FunnelIcon className="w-5 h-5" />
                  </button>
                  
                  {(searchTerm || selectedServiceType || selectedStatus) && (
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

        {/* Professionals Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map((professional) => (
                  <div key={professional.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {professional.firstName} {professional.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getServiceTypeLabel(professional)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(professional.status)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium mr-2">Email:</span>
                        {professional.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium mr-2">Teléfono:</span>
                        {professional.phone}
                      </div>
                      {professional.city && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPinIcon className="w-4 h-4 mr-2" />
                          {professional.city}{professional.state && `, ${professional.state}`}
                        </div>
                      )}
                      {professional.averageRating && (
                        <div className="flex items-center text-sm bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                          <StarIcon className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {professional.averageRating.toFixed(1)}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 ml-1">
                            ({professional.totalReviews})
                          </span>
                        </div>
                      )}
                      {professional.hourlyRate && (
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(professional.hourlyRate, (professional.currencyCode || 'USD') as 'USD' | 'ARS' | 'EUR')}/hora
                        </div>
                      )}
                      {professional.completedJobs !== undefined && professional.completedJobs > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <BriefcaseIcon className="w-4 h-4 inline mr-1" />
                          {professional.completedJobs} trabajos
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                      <Link
                        href={`/professionals/${professional.id}`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium shadow-md hover:shadow-lg"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Ver Perfil
                      </Link>
                      <Link
                        href={`/professionals/${professional.id}/edit`}
                        className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {professionals.length === 0 && (
                <div className="text-center py-12">
                  <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No hay profesionales
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Comienza agregando tu primer profesional.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/professionals/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Nuevo Profesional
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

