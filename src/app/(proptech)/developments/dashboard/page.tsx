"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BuildingOfficeIcon, 
  HomeIcon, 
  MapIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CogIcon,
  DocumentTextIcon,
  BoltIcon
} from "@heroicons/react/24/outline";
import { Development } from "../components/types";
import { developmentService } from "../services/developmentService";

interface DevelopmentStats {
  totalDevelopments: number;
  availableDevelopments: number;
  soldDevelopments: number;
  reservedDevelopments: number;
  totalValue: number;
  averagePrice: number;
  totalViews: number;
  totalFavorites: number;
  recentActivity: number;
}

interface DevelopmentTypeStats {
  type: string;
  count: number;
  percentage: number;
  averagePrice: number;
}

export default function DevelopmentsDashboard() {
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [stats, setStats] = useState<DevelopmentStats>({
    totalDevelopments: 0,
    availableDevelopments: 0,
    soldDevelopments: 0,
    reservedDevelopments: 0,
    totalValue: 0,
    averagePrice: 0,
    totalViews: 0,
    totalFavorites: 0,
    recentActivity: 0
  });
  const [typeStats, setTypeStats] = useState<DevelopmentTypeStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentDevelopments, setRecentDevelopments] = useState<Development[]>([]);
  const [topPerformers, setTopPerformers] = useState<Development[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await developmentService.getAllDevelopments();
      const data = response.data;
      setDevelopments(data);
      
      // Calcular estadísticas
      const calculatedStats = calculateStats(data);
      setStats(calculatedStats);
      
      // Calcular estadísticas por tipo
      const calculatedTypeStats = calculateTypeStats(data);
      setTypeStats(calculatedTypeStats);
      
      // Desarrollos recientes (últimos 5)
      const recent = data
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentDevelopments(recent);
      
      // Top performers (por vistas o favoritos)
      const performers = data
        .sort((a, b) => ((b as any).views || 0) - ((a as any).views || 0))
        .slice(0, 3);
      setTopPerformers(performers);
      
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: Development[]): DevelopmentStats => {
    const total = data.length;
    const available = data.filter(d => d.status === "available").length;
    const sold = data.filter(d => d.status === "sold").length;
    const reserved = data.filter(d => d.status === "reserved").length;
    const totalValue = data.reduce((sum, d) => sum + (d.price || 0), 0);
    const averagePrice = total > 0 ? totalValue / total : 0;
    const totalViews = data.reduce((sum, d) => sum + ((d as any).views || 0), 0);
    const totalFavorites = data.reduce((sum, d) => sum + ((d as any).favoritesCount || 0), 0);
    const recentActivity = data.filter(d => {
      const createdAt = new Date(d.createdAt);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return createdAt > oneWeekAgo;
    }).length;

    return {
      totalDevelopments: total,
      availableDevelopments: available,
      soldDevelopments: sold,
      reservedDevelopments: reserved,
      totalValue,
      averagePrice,
      totalViews,
      totalFavorites,
      recentActivity
    };
  };

  const calculateTypeStats = (data: Development[]): DevelopmentTypeStats[] => {
    const typeCounts: { [key: string]: { count: number; totalPrice: number } } = {};
    
    data.forEach(development => {
      const type = development.type;
      if (!typeCounts[type]) {
        typeCounts[type] = { count: 0, totalPrice: 0 };
      }
      typeCounts[type].count++;
      typeCounts[type].totalPrice += development.price || 0;
    });

    const total = data.length;
    
    return Object.entries(typeCounts).map(([type, { count, totalPrice }]) => ({
      type: getTypeLabel(type),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      averagePrice: count > 0 ? totalPrice / count : 0
    }));
  };

  const getTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      loteamiento: "Loteamiento",
      edificio: "Edificio",
      condominio: "Condominio",
      barrio_cerrado: "Barrio Cerrado"
    };
    return labels[type] || type;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "sold":
        return <CurrencyDollarIcon className="w-5 h-5 text-blue-500" />;
      case "reserved":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-PY').format(num);
  };

  if (isLoading) {
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
                Dashboard de Desarrollos
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Administra y monitorea tus emprendimientos inmobiliarios
              </p>
            </div>
            <Link
              href="/developments/new"
              className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nuevo Desarrollo
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BuildingOfficeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Desarrollos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(stats.totalDevelopments)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Disponibles
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(stats.availableDevelopments)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Valor Total
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <EyeIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Vistas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(stats.totalViews)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas - Moved up for better visibility */}
        <div className="mb-8 bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20 rounded-xl shadow-lg p-8 border border-brand-100 dark:border-brand-800">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-brand-600 rounded-lg mr-4">
              <BoltIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Acciones Rápidas
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Accede rápidamente a las funciones más utilizadas
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/developments/new"
              className="group flex items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-600"
            >
              <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-lg mr-4 group-hover:bg-brand-200 dark:group-hover:bg-brand-900/50 transition-colors">
                <PlusIcon className="w-8 h-8 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  Nuevo Desarrollo
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Crear emprendimiento inmobiliario
                </p>
              </div>
            </Link>

            <Link
              href="/developments"
              className="group flex items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
            >
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <BuildingOfficeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Ver Todos
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gestionar desarrollos existentes
                </p>
              </div>
            </Link>

            <Link
              href="/developments/units"
              className="group flex items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600"
            >
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <HomeIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  Gestionar Unidades
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lotes y departamentos
                </p>
              </div>
            </Link>

            <Link
              href="/developments/quotas"
              className="group flex items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
            >
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                <CurrencyDollarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Gestionar Cuotas
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pagos y financiación
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Administración Avanzada - Moved up for better visibility */}
        <div className="mb-8 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gray-600 rounded-lg mr-4">
              <CogIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Administración Avanzada
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Herramientas avanzadas para la gestión integral
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/developments/1/reservations"
              className="group flex items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
            >
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-4 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                <UserGroupIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Reservas
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gestionar reservas de unidades
                </p>
              </div>
            </Link>

            <Link
              href="/developments/analytics"
              className="group flex items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
            >
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                <ChartBarIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  Analytics
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ver estadísticas detalladas
                </p>
              </div>
            </Link>

            <Link
              href="/developments/reports"
              className="group flex items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600"
            >
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg mr-4 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                <DocumentTextIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  Reportes
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generar informes completos
                </p>
              </div>
            </Link>

            <Link
              href="/developments/settings"
              className="group flex items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
            >
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg mr-4 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                <CogIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  Configuración
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ajustes del sistema
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Estadísticas por Tipo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Distribución por Tipo
              </h3>
              <div className="space-y-4">
                {typeStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-brand-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {stat.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.count} ({stat.percentage.toFixed(1)}%)
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(stat.averagePrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resumen de Actividad
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Actividad Reciente</span>
                <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {formatNumber(stats.recentActivity)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Favoritos</span>
                <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {formatNumber(stats.totalFavorites)}
                </span>
              </div>
            </div>
          </div>
        </div>

          {/* Actividad Reciente */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actividad Reciente
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <PlusIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Nuevos Desarrollos
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Esta semana
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {stats.recentActivity}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Vendidos
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Este mes
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {stats.soldDevelopments}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <HeartIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Favoritos
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Total
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {formatNumber(stats.totalFavorites)}
                </span>
              </div>
            </div>
          </div>

        {/* Desarrollos Recientes y Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Desarrollos Recientes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Desarrollos Recientes
              </h3>
              <Link
                href="/developments"
                className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Ver todos
              </Link>
            </div>
            <div className="space-y-4">
              {recentDevelopments.map((development) => (
                <div key={development.id} className="flex items-center space-x-3">
                  <img
                    src={development.images?.[0] || "/images/placeholder.jpg"}
                    alt={development.title}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {development.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {development.city}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(development.status)}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(development.price || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Performers
              </h3>
              <Link
                href="/developments"
                className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Ver todos
              </Link>
            </div>
            <div className="space-y-4">
              {topPerformers.map((development, index) => (
                <div key={development.id} className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-brand-100 dark:bg-brand-900/20 rounded-full">
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                      {index + 1}
                    </span>
                  </div>
                  <img
                    src={development.images?.[0] || "/images/placeholder.jpg"}
                    alt={development.title}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {development.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {(development as any).views || 0} vistas
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(development.price || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 