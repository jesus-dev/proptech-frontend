"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Home,
  Building2,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  MapPin,
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  MessageSquare,
  FileText,
  Globe,
  Shield,
  UserCheck,
  Clock,
  Target,
  Award,
  Zap,
  Activity,
  PieChart,
  LineChart,
  BarChart,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Bell,
  Mail,
  PhoneCall,
  Map,
  Layers,
  Grid,
  List,
  Download,
  Upload,
  Edit,
  MoreHorizontal,
  ChevronRight,
  Plus,
  Eye,
  Settings,
  Monitor,
  Database,
  Server,
  Network,
  BarChart3,
  TrendingUp as TrendingUpIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  DollarSign as DollarSignIcon,
  Building as BuildingIcon,
  User as UserIcon,
  Zap as ZapIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { systemService, SystemStats, SystemActivity, SystemProperty, PropertyTypeData, RevenueTrendData, PerformanceMetrics } from "@/services/systemService";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Función para obtener indicador de crecimiento
const getGrowthIndicator = (value: number) => {
  if (value > 0) {
    return { 
      icon: <TrendingUp className="h-4 w-4 text-green-600" />, 
      color: "text-green-600",
      bg: "bg-green-50"
    };
  } else if (value < 0) {
    return { 
      icon: <TrendingDown className="h-4 w-4 text-red-600" />, 
      color: "text-red-600",
      bg: "bg-red-50"
    };
  }
  return { 
    icon: <TrendingUp className="h-4 w-4 text-gray-600" />, 
    color: "text-gray-600",
    bg: "bg-gray-50"
  };
};

// Función para obtener estado del sistema
const getSystemHealth = (uptime: number) => {
  if (uptime >= 99.5) return { status: 'Excelente', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle className="h-4 w-4" /> };
  if (uptime >= 99.0) return { status: 'Bueno', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <AlertTriangle className="h-4 w-4" /> };
  return { status: 'Crítico', color: 'text-red-600', bg: 'bg-red-100', icon: <XCircle className="h-4 w-4" /> };
};

export default function UserDashboardPage() {
  // User-specific data states
  const [userStats, setUserStats] = useState({
    savedProperties: 0,
    viewedProperties: 0,
    scheduledVisits: 0,
    inquiriesSent: 0,
    favoriteAgents: 0,
    notificationsUnread: 0,
    searchHistoryCount: 0,
    lastLogin: new Date().toISOString()
  });
  
  const [savedProperties, setSavedProperties] = useState<SystemProperty[]>([]);
  const [recentViews, setRecentViews] = useState<SystemProperty[]>([]);
  const [recommendedProperties, setRecommendedProperties] = useState<SystemProperty[]>([]);
  const [scheduledVisits, setScheduledVisits] = useState<any[]>([]);
  const [userActivities, setUserActivities] = useState<SystemActivity[]>([]);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);
  const [userPreferences, setUserPreferences] = useState({
    preferredPropertyTypes: [],
    budgetRange: { min: 0, max: 0 },
    preferredLocations: [],
    notificationSettings: {
      newProperties: true,
      priceChanges: true,
      visitReminders: true,
      marketUpdates: false
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Cargando datos del usuario...');
      
      const [
        userStatsData,
        savedPropsData,
        recentViewsData,
        recommendedPropsData,
        visitsData,
        activitiesData,
        notificationsData
      ] = await Promise.all([
        systemService.getUserStats(),
        systemService.getUserSavedProperties(),
        systemService.getUserRecentViews(),
        systemService.getUserRecommendedProperties(),
        systemService.getUserScheduledVisits(),
        systemService.getUserActivities(),
        systemService.getUserNotifications()
      ]);

      setUserStats(userStatsData);
      setSavedProperties(savedPropsData);
      setRecentViews(recentViewsData);
      setRecommendedProperties(recommendedPropsData);
      setScheduledVisits(visitsData);
      setUserActivities(activitiesData);
      setUserNotifications(notificationsData);
      
      console.log('✅ Datos del usuario cargados exitosamente');
    } catch (error: any) {
      console.error('❌ Error loading user dashboard data:', error);
      setError(error?.message || 'Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, loadDashboardData]);

  // Export functionality
  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf' = 'csv') => {
    setIsExporting(true);
    try {
      const blob = await systemService.exportDashboardData(format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + R: Refresh data
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        loadDashboardData();
      }
      
      // Ctrl/Cmd + E: Export data
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        handleExport('csv');
      }
      
      // Ctrl/Cmd + Shift + A: Toggle auto refresh
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setAutoRefresh(!autoRefresh);
      }
      
      // Escape: Close any open modals or reset view
      if (event.key === 'Escape') {
        // Reset any temporary states if needed
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loadDashboardData, autoRefresh]);

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-6 mb-6">
              <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Error al cargar el dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
              {error}
            </p>
            <Button 
              onClick={loadDashboardData}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar nuevamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Removed systemHealth since we're now using user data

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      role="main"
      aria-label="Dashboard del sistema inmobiliario"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Header Moderno con Efectos Avanzados - Optimizado para móvil */}
        <div className="mb-6 sm:mb-8">
          <div className="relative bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 backdrop-blur-sm border border-white/20 shadow-2xl overflow-hidden">
            {/* Efectos de fondo */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    Mi Dashboard
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
                    Gestiona tus propiedades favoritas, visitas y búsquedas
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center mt-3 text-xs sm:text-sm text-gray-500 gap-2 sm:gap-4">
                    <div className="flex items-center px-2 sm:px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm" role="status" aria-label="Estado del sistema">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" aria-hidden="true"></div>
                      <span>Sistema operativo</span>
                    </div>
                    <div className="flex items-center px-2 sm:px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm" role="status" aria-label="Última actualización">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" aria-hidden="true" />
                      <span className="hidden sm:inline">Última actualización: {new Date().toLocaleTimeString('es-PY')}</span>
                      <span className="sm:hidden">Actualizado: {new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                
                {/* Controles del Dashboard - Optimizados para móvil */}
                <div className="flex flex-col gap-3">
                  {/* Primera fila: Time Range y View Mode */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Time Range Selector */}
                    <div className="flex items-center bg-white/20 rounded-lg backdrop-blur-sm p-1" role="tablist" aria-label="Selector de rango de tiempo">
                      {['24h', '7d', '30d', '90d'].map((range) => (
                        <button
                          key={range}
                          onClick={() => setSelectedTimeRange(range)}
                          role="tab"
                          aria-selected={selectedTimeRange === range}
                          aria-label={`Ver datos de los últimos ${range}`}
                          className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                            selectedTimeRange === range
                              ? 'bg-white/80 text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:bg-white/40 hover:text-gray-900'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-white/20 rounded-lg backdrop-blur-sm p-1" role="group" aria-label="Modo de visualización">
                      <button
                        onClick={() => setViewMode('grid')}
                        aria-label="Vista de cuadrícula"
                        className={`p-1.5 sm:p-2 rounded-md transition-all duration-200 ${
                          viewMode === 'grid'
                            ? 'bg-white/80 text-blue-600'
                            : 'text-gray-600 hover:bg-white/40'
                        }`}
                      >
                        <Grid className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        aria-label="Vista de lista"
                        className={`p-1.5 sm:p-2 rounded-md transition-all duration-200 ${
                          viewMode === 'list'
                            ? 'bg-white/80 text-blue-600'
                            : 'text-gray-600 hover:bg-white/40'
                        }`}
                      >
                        <List className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Segunda fila: Action Buttons - Optimizados para móvil */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button 
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      variant="outline" 
                      size="sm"
                      aria-label={autoRefresh ? 'Desactivar actualización automática' : 'Activar actualización automática'}
                      className={`bg-white/80 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm ${
                        autoRefresh ? 'text-green-600 border-green-200' : 'text-gray-600'
                      }`}
                    >
                      <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${autoRefresh ? 'animate-spin' : ''}`} aria-hidden="true" />
                      <span className="hidden sm:inline">Auto</span>
                    </Button>
                    <Button 
                      onClick={loadDashboardData}
                      variant="outline" 
                      size="sm"
                      aria-label="Actualizar datos del dashboard"
                      className="bg-white/80 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
                    >
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" aria-hidden="true" />
                      <span className="hidden sm:inline">Actualizar</span>
                    </Button>
                    <Button 
                      onClick={() => handleExport('csv')}
                      variant="outline" 
                      size="sm"
                      disabled={isExporting}
                      aria-label={isExporting ? 'Exportando datos...' : 'Exportar datos del dashboard'}
                      className="bg-white/80 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
                    >
                      <Download className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isExporting ? 'animate-spin' : ''}`} aria-hidden="true" />
                      <span className="hidden sm:inline">{isExporting ? 'Exportando...' : 'Exportar'}</span>
                      <span className="sm:hidden">{isExporting ? '...' : 'Exp'}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      aria-label="Configurar dashboard"
                      className="bg-white/80 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
                    >
                      <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" aria-hidden="true" />
                      <span className="hidden sm:inline">Configurar</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid con Efectos Avanzados - Optimizado para móvil */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          
          {/* Propiedades Guardadas */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] bg-white/80 backdrop-blur-sm border-0 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Propiedades Guardadas</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{userStats.savedProperties}</p>
                  <div className="flex items-center mt-1 sm:mt-2">
                    <div className="flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                      <Star className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Favoritas</span>
                      <span className="sm:hidden">Fav</span>
                    </div>
                  </div>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visitas Agendadas */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] bg-white/80 backdrop-blur-sm border-0 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Visitas Agendadas</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{userStats.scheduledVisits}</p>
                  <div className="flex items-center mt-1 sm:mt-2">
                    <div className="flex items-center px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Pendientes</span>
                      <span className="sm:hidden">Pend</span>
                    </div>
                  </div>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consultas Enviadas */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] bg-white/80 backdrop-blur-sm border-0 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Consultas Enviadas</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {userStats.inquiriesSent}
                  </p>
                  <div className="flex items-center mt-1 sm:mt-2">
                    <div className="flex items-center px-2 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-medium">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Este mes</span>
                      <span className="sm:hidden">Mes</span>
                    </div>
                  </div>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0">
                  <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notificaciones */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] bg-white/80 backdrop-blur-sm border-0 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Notificaciones</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{userStats.notificationsUnread}</p>
                  <div className="flex items-center mt-1 sm:mt-2">
                    <div className={`flex items-center px-2 py-1 rounded-full ${
                      userStats.notificationsUnread > 0 
                        ? 'bg-orange-50 text-orange-600' 
                        : 'bg-green-50 text-green-600'
                    } text-xs font-medium`}>
                      <Bell className="h-3 w-3 mr-1" />
                      <span className="ml-1">
                        {userStats.notificationsUnread > 0 ? 'Nuevas' : 'Al día'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Grid Principal - Optimizado para móvil */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Mi Actividad */}
          <div className="lg:col-span-2">
            <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                      Mi Actividad
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Tus últimas acciones en la plataforma
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="hover:shadow-lg transition-all duration-300 text-xs sm:text-sm self-start sm:self-auto">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Ver Todo</span>
                    <span className="sm:hidden">Ver</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivities.slice(0, 6).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-200">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(activity.timestamp).toLocaleString('es-PY')}
                        </p>
                      </div>
                      <Badge variant={activity.type === 'success' ? 'default' : 'secondary'} className="group-hover:scale-105 transition-transform duration-200">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mis Propiedades Guardadas */}
          <div>
            <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      Mis Favoritas
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Propiedades que has guardado
                    </p>
                  </div>
                  <Link href="/favorites">
                    <Button variant="outline" size="sm" className="hover:shadow-lg transition-all duration-300">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedProperties.slice(0, 5).map((property, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group">
                      <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-200">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {property.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {property.address || 'Sin dirección'}
                        </p>
                        <p className="text-xs font-semibold text-blue-600">
                          {formatCurrency(property.price)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs group-hover:scale-105 transition-transform duration-200">
                        Guardada
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Mis Estadísticas */}
        <div className="mt-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Mis Estadísticas
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tu actividad en la plataforma
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-lg transition-all duration-300">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg hover:scale-110 transition-transform duration-300">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStats.viewedProperties}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Propiedades Vistas</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:shadow-lg transition-all duration-300">
                  <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg hover:scale-110 transition-transform duration-300">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStats.searchHistoryCount}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Búsquedas Realizadas</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-lg transition-all duration-300">
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg hover:scale-110 transition-transform duration-300">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStats.favoriteAgents}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Agentes Favoritos</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:shadow-lg transition-all duration-300">
                  <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg hover:scale-110 transition-transform duration-300">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Date(userStats.lastLogin).toLocaleDateString('es-PY')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Último Acceso</p>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recomendaciones y Propiedades Vistas */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Propiedades Recomendadas */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recomendadas para Ti
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Basado en tus preferencias
                  </p>
                </div>
                <Button variant="outline" size="sm" className="hover:shadow-lg transition-all duration-300">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Ver Todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedProperties.map((property, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {property.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {property.address}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(property.price)}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="mt-1 text-xs"
                        onClick={() => systemService.saveProperty(property.id)}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Guardar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visitas Recientes */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    Visitas Recientes
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Propiedades que has visto
                  </p>
                </div>
                <Button variant="outline" size="sm" className="hover:shadow-lg transition-all duration-300">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Historial
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentViews.map((property, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {property.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Visto hace {Math.floor(Math.random() * 7 + 1)} días
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(property.price)}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="mt-1 text-xs"
                        onClick={() => systemService.saveProperty(property.id)}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Guardar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights y Alertas */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Insights del Sistema */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Insights del Sistema
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Análisis automático de rendimiento
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Crecimiento Positivo
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Las propiedades activas han aumentado un 12.5% este mes. El rendimiento del sistema está por encima del promedio.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">
                        Sistema Estable
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        El tiempo de respuesta promedio está en 245ms, dentro de los parámetros óptimos. Cache hit rate del 87.5%.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                        Atención Requerida
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Tienes 23 tareas pendientes. Considera revisar la agenda para optimizar el flujo de trabajo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mis Notificaciones */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Mis Notificaciones
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-600">
                  {userStats.notificationsUnread} nuevas
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userNotifications.map((notification, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    notification.type === 'PRICE_DROP' 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : notification.type === 'NEW_PROPERTY'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {notification.type === 'PRICE_DROP' ? (
                        <TrendingDown className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : notification.type === 'NEW_PROPERTY' ? (
                        <Bell className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className={`text-xs font-medium ${
                          notification.type === 'PRICE_DROP' 
                            ? 'text-green-900 dark:text-green-100'
                            : notification.type === 'NEW_PROPERTY'
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-yellow-900 dark:text-yellow-100'
                        }`}>
                          {notification.title}
                        </p>
                        <p className={`text-xs mt-1 ${
                          notification.type === 'PRICE_DROP' 
                            ? 'text-green-700 dark:text-green-300'
                            : notification.type === 'NEW_PROPERTY'
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {notification.message}
                        </p>
                        <p className={`text-xs mt-1 ${
                          notification.type === 'PRICE_DROP' 
                            ? 'text-green-600 dark:text-green-400'
                            : notification.type === 'NEW_PROPERTY'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {new Date(notification.timestamp).toLocaleString('es-PY')}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-4 hover:shadow-lg transition-all duration-300">
                <Eye className="h-4 w-4 mr-2" />
                Ver Todas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Acciones Rápidas */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Acciones Rápidas
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Acceso directo a las funciones principales
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <Link href="/search">
                  <Button className="w-full h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Search className="h-5 w-5 mr-2" />
                    Buscar Propiedades
                  </Button>
                </Link>

                <Link href="/favorites">
                  <Button variant="outline" className="w-full h-16 bg-white/80 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Star className="h-5 w-5 mr-2" />
                    Mis Favoritas
                  </Button>
                </Link>

                <Link href="/visits">
                  <Button variant="outline" className="w-full h-16 bg-white/80 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Calendar className="h-5 w-5 mr-2" />
                    Mis Visitas
                  </Button>
                </Link>

                <Link href="/profile">
                  <Button variant="outline" className="w-full h-16 bg-white/80 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Mi Perfil
                  </Button>
                </Link>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Atajos de Teclado
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Atajos disponibles para mejorar la productividad
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                    Ctrl + R
                  </kbd>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Actualizar datos
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                    Ctrl + E
                  </kbd>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Exportar datos
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                    Ctrl + Shift + A
                  </kbd>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Alternar auto-actualización
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                    Esc
                  </kbd>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Cerrar modales
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}