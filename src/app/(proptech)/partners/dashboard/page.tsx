"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Partner, partnerService } from "../services/partnerService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { formatPrice } from "@/lib/utils";
import { 
  PlusIcon, 
  UserIcon, 
  BuildingOfficeIcon, 
  BriefcaseIcon, 
  BanknotesIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon, 
  ArrowRightIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon
} from "@heroicons/react/24/outline";

export default function PartnersDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    verified: 0,
    totalEarnings: 0,
    pendingPayments: 0,
    monthlyGrowth: 0,
    averageCommission: 0,
    topPerformers: [] as Partner[],
    recentPartners: [] as Partner[],
    partnersByType: {
      INDIVIDUAL: 0,
      COMPANY: 0,
      AGENCY: 0,
      BROKER: 0,
      INVESTOR: 0
    },
    partnersByStatus: {
      ACTIVE: 0,
      PENDING: 0,
      INACTIVE: 0,
      SUSPENDED: 0,
      TERMINATED: 0
    },
    recentActivity: [] as any[]
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        allPartners,
        activePartners,
        pendingPartners,
        verifiedPartners,
        pendingPayments,
        topPerformers
      ] = await Promise.all([
        partnerService.getAllPartners({ size: 1000 }),
        partnerService.getActivePartners(),
        partnerService.getPartnersByStatus("PENDING"),
        partnerService.getVerifiedPartners(),
        partnerService.getPartnersWithPendingPayments(),
        partnerService.getTopPerformers(5)
      ]);

      // Calcular estadísticas por tipo
      const typeStats = {
        INDIVIDUAL: 0,
        COMPANY: 0,
        AGENCY: 0,
        BROKER: 0,
        INVESTOR: 0
      };

      // Calcular estadísticas por estado
      const statusStats = {
        ACTIVE: 0,
        PENDING: 0,
        INACTIVE: 0,
        SUSPENDED: 0,
        TERMINATED: 0
      };

      allPartners.content.forEach(partner => {
        if (partner.type) {
          typeStats[partner.type as keyof typeof typeStats]++;
        }
        if (partner.status) {
          statusStats[partner.status as keyof typeof statusStats]++;
        }
      });

      const totalEarnings = activePartners.reduce((sum, partner) => sum + (partner.totalEarnings || 0), 0);
      const totalPendingPayments = pendingPayments.reduce((sum, partner) => sum + (partner.pendingEarnings || 0), 0);
      
      // Calcular comisión promedio
      const totalCommission = allPartners.content.reduce((sum, partner) => sum + (partner.commissionRate || 0), 0);
      const averageCommission = allPartners.content.length > 0 ? totalCommission / allPartners.content.length : 0;

      // Simular crecimiento mensual (en un caso real vendría de datos históricos)
      const monthlyGrowth = 12.5; // Porcentaje de crecimiento

      // Actividad reciente simulada
      const recentActivity = [
        { type: 'new_partner', message: 'Nuevo socio registrado: María García', time: '2 horas atrás' },
        { type: 'payment', message: 'Pago recibido: Juan Pérez - $150', time: '4 horas atrás' },
        { type: 'verification', message: 'Socio verificado: Carlos López', time: '1 día atrás' },
        { type: 'commission', message: 'Comisión generada: Ana Rodríguez - $75', time: '2 días atrás' }
      ];

      setStats({
        total: allPartners.totalElements,
        active: activePartners.length,
        pending: pendingPartners.length,
        verified: verifiedPartners.length,
        totalEarnings,
        pendingPayments: totalPendingPayments,
        monthlyGrowth,
        averageCommission,
        topPerformers,
        recentPartners: allPartners.content.slice(0, 5),
        partnersByType: typeStats,
        partnersByStatus: statusStats,
        recentActivity
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      INDIVIDUAL: UserIcon,
      COMPANY: BuildingOfficeIcon,
      AGENCY: BuildingOfficeIcon,
      BROKER: BriefcaseIcon,
      INVESTOR: BanknotesIcon
    };
    return icons[type as keyof typeof icons] || UserIcon;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: "text-green-600",
      PENDING: "text-yellow-600",
      INACTIVE: "text-gray-600",
      SUSPENDED: "text-red-600",
      TERMINATED: "text-red-600"
    };
    return colors[status as keyof typeof colors] || "text-gray-600";
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "$0";
    return formatPrice(amount, "USD");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
                Dashboard de Socios
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Resumen completo de la gestión de socios comerciales
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/partners"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <UserGroupIcon className="w-5 h-5 mr-2" />
                Ver Todos
              </Link>
            <Link
              href="/partners/new"
              className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nuevo Socio
            </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Socios</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 dark:text-green-400">+{stats.monthlyGrowth}%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <UserGroupIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Socios Activos</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}% del total
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {stats.verified} verificados
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <ClockIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ganancias Totales</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalEarnings)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {formatCurrency(stats.pendingPayments)} pendientes
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <CurrencyDollarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Comisión Promedio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.averageCommission ? stats.averageCommission.toFixed(1) : '0.0'}%
                </p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                <ChartBarIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagos Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {formatCurrency(stats.pendingPayments)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Socios Verificados</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.verified}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <ShieldCheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Distribución por Tipo */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Distribución por Tipo
              </h2>
                <Link
                  href="/partners"
                  className="text-brand-600 hover:text-brand-700 dark:text-brand-400 text-sm font-medium"
                >
                  Ver todos
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(stats.partnersByType).map(([type, count]) => {
                  const Icon = getTypeIcon(type);
                  const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0";
                  
                  return (
                    <div key={type} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="p-3 bg-brand-100 dark:bg-brand-900/20 rounded-lg">
                        <Icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {type === "INDIVIDUAL" && "Individual"}
                          {type === "COMPANY" && "Empresa"}
                          {type === "AGENCY" && "Agencia"}
                          {type === "BROKER" && "Broker"}
                          {type === "INVESTOR" && "Inversor"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {count} socios ({percentage}%)
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{count}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Actividad Reciente
            </h2>
            
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'new_partner' && (
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    {activity.type === 'payment' && (
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <CurrencyDollarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    {activity.type === 'verification' && (
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <ShieldCheckIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                    {activity.type === 'commission' && (
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                        <ChartBarIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.message}
                </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                </p>
              </div>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/partners"
                  className="flex items-center justify-center w-full p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
                >
                  <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                    Ver toda la actividad
                    </span>
                  <ArrowRightIcon className="w-4 h-4 ml-2 text-brand-600 dark:text-brand-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Mejores Socios
              </h2>
              <Link
                href="/partners"
                className="text-brand-600 hover:text-brand-700 dark:text-brand-400 text-sm font-medium"
              >
                Ver todos
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.topPerformers.map((partner, index) => (
                <div key={partner.id} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        index === 1 ? 'bg-gray-100 dark:bg-gray-900/20' :
                        index === 2 ? 'bg-orange-100 dark:bg-orange-900/20' :
                        'bg-brand-100 dark:bg-brand-900/20'
                      }`}>
                        <span className={`text-sm font-bold ${
                          index === 0 ? 'text-yellow-600 dark:text-yellow-400' :
                          index === 1 ? 'text-gray-600 dark:text-gray-400' :
                          index === 2 ? 'text-orange-600 dark:text-orange-400' :
                          'text-brand-600 dark:text-brand-400'
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {partner.firstName} {partner.lastName}
                        </p>
                        <div className="flex items-center mt-1">
                          {React.createElement(getTypeIcon(partner.type || ""), {
                            className: "w-3 h-3 text-gray-400 mr-1"
                          })}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                          {partner.type}
                          </span>
                          {partner.isVerified && (
                            <ShieldCheckIcon className="w-3 h-3 text-green-500 ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Ganancias:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(partner.totalEarnings)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Propiedades:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {partner.propertiesManaged || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Ventas:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {partner.successfulDeals || 0}
                      </span>
                    </div>
                    {partner.averageRating && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Calificación:</span>
                        <div className="flex items-center">
                          <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {partner.averageRating ? partner.averageRating.toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                  <Link
                    href={`/partners/${partner.id}`}
                      className="flex-1 text-center py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    Ver Detalles
                  </Link>
                    <Link
                      href={`/partners/${partner.id}/payments`}
                      className="flex-1 text-center py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Pagos
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Socios Recientes */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Socios Recientes
              </h2>
              <Link
                href="/partners"
                className="text-brand-600 hover:text-brand-700 dark:text-brand-400 text-sm font-medium"
              >
                Ver todos
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
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
                      Comisión
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ganancias
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.recentPartners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {partner.photo ? (
                              <img 
                                src={partner.photo} 
                                alt="Foto socio" 
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                            <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                            </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {partner.firstName} {partner.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {partner.email}
                            </div>
                            <div className="flex items-center mt-1">
                              {partner.isVerified && (
                                <ShieldCheckIcon className="w-3 h-3 text-green-500 mr-1" />
                              )}
                              <span className="text-xs text-gray-400">
                                {partner.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {React.createElement(getTypeIcon(partner.type || ""), {
                            className: "w-4 h-4 mr-1 text-gray-400"
                          })}
                          <span className="text-sm text-gray-900 dark:text-white">
                            {partner.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          partner.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          partner.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          partner.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                          partner.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {partner.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{partner.commissionRate}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(partner.totalEarnings)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                        <Link
                          href={`/partners/${partner.id}`}
                            className="text-brand-600 hover:text-brand-900 dark:text-brand-400 p-1 rounded hover:bg-brand-50 dark:hover:bg-brand-900/20"
                            title="Ver detalles"
                        >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/partners/${partner.id}/edit`}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                            title="Editar"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/partners/${partner.id}/payments`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Ver pagos"
                          >
                            <DocumentTextIcon className="w-4 h-4" />
                        </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 