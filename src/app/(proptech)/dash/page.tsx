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
import { systemService, SystemStats, SystemActivity, SystemProperty, PropertyTypeData, RevenueTrendData, PerformanceMetrics, AgentStats, AgentLead, AgentAppointment, PropertyAlert } from "@/services/systemService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { PropShot, PropShotService } from "@/services/propShotService";
import { Play, Camera } from "lucide-react";
import PropShotGrid from "@/components/social/PropShotGrid";

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
  
  // Agent-specific data states
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null);
  const [agentLeads, setAgentLeads] = useState<AgentLead[]>([]);
  const [agentAppointments, setAgentAppointments] = useState<AgentAppointment[]>([]);
  const [propertyAlerts, setPropertyAlerts] = useState<PropertyAlert[]>([]);
  
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
  
  // PropShots states
  const [propShots, setPropShots] = useState<PropShot[]>([]);
  const [propShotsLoading, setPropShotsLoading] = useState(true);
  const [selectedPropShot, setSelectedPropShot] = useState<PropShot | null>(null);
  
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
      const [
        userStatsData,
        agentStatsData,
        agentLeadsData,
        agentAppointmentsData,
        propertyAlertsData,
        savedPropsData,
        recentViewsData,
        recommendedPropsData,
        visitsData,
        activitiesData,
        notificationsData,
        propShotsData
      ] = await Promise.all([
        systemService.getUserStats(),
        systemService.getAgentStats(),
        systemService.getAgentLeads('new', 'high'),
        systemService.getAgentAppointments('today'),
        systemService.getPropertyAlerts(),
        systemService.getUserSavedProperties(),
        systemService.getUserRecentViews(),
        systemService.getUserRecommendedProperties(),
        systemService.getUserScheduledVisits(),
        systemService.getUserActivities(),
        systemService.getUserNotifications(),
        PropShotService.getPropShots()
      ]);

      setUserStats(userStatsData);
      setAgentStats(agentStatsData);
      setAgentLeads(agentLeadsData);
      setAgentAppointments(agentAppointmentsData);
      setPropertyAlerts(propertyAlertsData);
      setSavedProperties(savedPropsData);
      setRecentViews(recentViewsData);
      setRecommendedProperties(recommendedPropsData);
      setScheduledVisits(visitsData);
      setUserActivities(activitiesData);
      setUserNotifications(notificationsData);
      setPropShots(propShotsData);
      
    } catch (error: any) {
      console.error('❌ Error loading dashboard data:', error);
      setError(error?.message || 'Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
      setPropShotsLoading(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        <div className="mb-6 sm:mb-8">
          <div className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            
            <div className="relative z-10">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-12 lg:w-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                      <Home className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-200" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
                        Mi Dashboard
                      </h1>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        Bienvenido de vuelta! 👋
                      </p>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3">
                    Gestiona tus propiedades favoritas, visitas y búsquedas de manera inteligente
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center mt-2 text-xs sm:text-sm text-gray-500 gap-2 sm:gap-3">
                    <div className="flex items-center px-2 sm:px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700" role="status" aria-label="Estado del sistema">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" aria-hidden="true"></div>
                      <span>Sistema operativo</span>
                    </div>
                    <div className="flex items-center px-2 sm:px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700" role="status" aria-label="Última actualización">
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
                    <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 p-1" role="tablist" aria-label="Selector de rango de tiempo">
                      {['24h', '7d', '30d', '90d'].map((range) => (
                        <button
                          key={range}
                          onClick={() => setSelectedTimeRange(range)}
                          role="tab"
                          aria-selected={selectedTimeRange === range}
                          aria-label={`Ver datos de los últimos ${range}`}
                          className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${selectedTimeRange === range ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 p-1" role="group" aria-label="Modo de visualización">
                      <button
                        onClick={() => setViewMode('grid')}
                        aria-label="Vista de cuadrícula"
                        className={`p-1.5 sm:p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      >
                        <Grid className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        aria-label="Vista de lista"
                        className={`p-1.5 sm:p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
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
                      className={`text-xs sm:text-sm ${autoRefresh ? 'text-green-600' : 'text-gray-600'}`}
                    >
                      <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2`} aria-hidden="true" />
                      <span className="hidden sm:inline">Auto</span>
                    </Button>
                    <Button 
                      onClick={loadDashboardData}
                      variant="outline" 
                      size="sm"
                      aria-label="Actualizar datos del dashboard"
                      className="text-xs sm:text-sm"
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
                      className="text-xs sm:text-sm"
                    >
                      <Download className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2`} aria-hidden="true" />
                      <span className="hidden sm:inline">{isExporting ? 'Exportando...' : 'Exportar'}</span>
                      <span className="sm:hidden">{isExporting ? '...' : 'Exp'}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      aria-label="Configurar dashboard"
                      className="text-xs sm:text-sm"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10">
          
          {/* Propiedades Guardadas */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.03] bg-white/90 backdrop-blur-sm border border-blue-100/50 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 to-blue-600/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Propiedades Guardadas</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-blue-600 transition-colors duration-300">{userStats.savedProperties}</p>
                  <div className="flex items-center mt-2 sm:mt-3">
                    <div className="flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs font-semibold shadow-sm">
                      <Star className="h-3 w-3 mr-1.5" />
                      <span className="hidden sm:inline">Favoritas</span>
                      <span className="sm:hidden">Fav</span>
                    </div>
                  </div>
                </div>
                <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
                  <Star className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visitas Agendadas */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.03] bg-white/90 backdrop-blur-sm border border-green-100/50 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/8 to-green-600/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Visitas Agendadas</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-green-600 transition-colors duration-300">{userStats.scheduledVisits}</p>
                  <div className="flex items-center mt-2 sm:mt-3">
                    <div className="flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-green-100 text-green-700 text-xs font-semibold shadow-sm">
                      <Calendar className="h-3 w-3 mr-1.5" />
                      <span className="hidden sm:inline">Pendientes</span>
                      <span className="sm:hidden">Pend</span>
                    </div>
                  </div>
                </div>
                <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
                  <Calendar className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consultas Enviadas */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.03] bg-white/90 backdrop-blur-sm border border-purple-100/50 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 to-purple-600/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Consultas Enviadas</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-purple-600 transition-colors duration-300">
                    {userStats.inquiriesSent}
                  </p>
                  <div className="flex items-center mt-2 sm:mt-3">
                    <div className="flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 text-xs font-semibold shadow-sm">
                      <MessageSquare className="h-3 w-3 mr-1.5" />
                      <span className="hidden sm:inline">Este mes</span>
                      <span className="sm:hidden">Mes</span>
                    </div>
                  </div>
                </div>
                <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
                  <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notificaciones */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.03] bg-white/90 backdrop-blur-sm border border-orange-100/50 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 to-orange-600/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Notificaciones</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-orange-600 transition-colors duration-300">{userStats.notificationsUnread}</p>
                  <div className="flex items-center mt-2 sm:mt-3">
                    <div className={`flex items-center px-3 py-1.5 rounded-full ${
                      userStats.notificationsUnread > 0 
                        ? 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700' 
                        : 'bg-gradient-to-r from-green-50 to-green-100 text-green-700'
                    } text-xs font-semibold shadow-sm`}>
                      <Bell className="h-3 w-3 mr-1.5" />
                      <span>
                        {userStats.notificationsUnread > 0 ? 'Nuevas' : 'Al día'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
                  <Bell className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Agent Stats Cards - Métricas clave para agentes */}
        {agentStats && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Panel del Agente
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              {/* Mis Propiedades Activas */}
              <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white border-blue-100">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">Mis Propiedades</p>
                      <p className="text-3xl font-bold text-gray-900">{agentStats.myProperties}</p>
                      <p className="text-xs text-green-600 mt-2 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Activas
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leads Activos */}
              <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-white border-green-100">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">Leads Activos</p>
                      <p className="text-3xl font-bold text-gray-900">{agentStats.activeLeads}</p>
                      <p className="text-xs text-orange-600 mt-2 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {agentStats.newLeadsToday} nuevos hoy
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Citas de Hoy */}
              <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-white border-purple-100">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">Citas Hoy</p>
                      <p className="text-3xl font-bold text-gray-900">{agentStats.todayAppointments}</p>
                      <p className="text-xs text-purple-600 mt-2 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {agentStats.weekAppointments} esta semana
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CalendarIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comisiones del Mes */}
              <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-yellow-50 to-white border-yellow-100">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">Comisiones</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(agentStats.monthCommissions, 'PYG')}</p>
                      <p className="text-xs text-green-600 mt-2 flex items-center">
                        <Award className="h-3 w-3 mr-1" />
                        {agentStats.closedDealsMonth} cerrados
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Alertas y Acciones Rápidas para Agentes */}
        {agentStats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Leads de Alta Prioridad */}
            <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm border border-red-100/50 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">
                        Leads de Alta Prioridad
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Requieren atención inmediata
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {agentLeads.length} urgentes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agentLeads.slice(0, 3).map((lead) => (
                    <div 
                      key={lead.id} 
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50/50 transition-all cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{lead.clientName}</p>
                          <Badge 
                            variant={lead.priority === 'urgent' ? 'destructive' : 'default'} 
                            className="text-xs"
                          >
                            {lead.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{lead.propertyTitle || 'Consulta general'}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(lead.createdAt).toLocaleDateString('es-PY')}
                          </span>
                          <span className="flex items-center gap-1">
                            <PhoneCall className="h-3 w-3" />
                            {lead.phone}
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="ml-4 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-colors"
                      >
                        <PhoneCall className="h-4 w-4 mr-1" />
                        Contactar
                      </Button>
                    </div>
                  ))}
                  {agentLeads.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <p>¡Excelente! No tienes leads urgentes pendientes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Citas de Hoy */}
            <Card className="bg-white/90 backdrop-blur-sm border border-purple-100/50 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      Agenda de Hoy
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {agentAppointments.length} citas programadas
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agentAppointments.map((appointment) => (
                    <div 
                      key={appointment.id}
                      className="p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-900 text-sm">{appointment.clientName}</p>
                        <Badge variant="secondary" className="text-xs">
                          {appointment.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{appointment.propertyTitle}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-purple-600">
                          <Clock className="h-3 w-3" />
                          {new Date(appointment.dateTime).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                  {agentAppointments.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No tienes citas programadas para hoy</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alertas de Propiedades que Necesitan Atención */}
        {propertyAlerts.length > 0 && (
          <Card className="mb-8 bg-white/90 backdrop-blur-sm border border-orange-100/50 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      Propiedades que Necesitan Atención
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {propertyAlerts.length} alertas activas
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {propertyAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-4 rounded-lg border-2 ${
                      alert.severity === 'critical' ? 'border-red-300 bg-red-50' :
                      alert.severity === 'warning' ? 'border-orange-300 bg-orange-50' :
                      'border-blue-300 bg-blue-50'
                    } hover:shadow-md transition-all`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge 
                        variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                        className="text-xs"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">{alert.propertyTitle}</p>
                    <p className="text-xs text-gray-600 mb-3">{alert.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{alert.actionRequired}</span>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                        Resolver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* PropShots Section */}
        <div className="mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-100/50 shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      PropShots
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Videos inmobiliarios en formato reels
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/social/propshots'}
                    className="hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Ver todos
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PropShotGrid
                propShots={propShots}
                loading={propShotsLoading}
                limit={4}
                onLike={async (propShotId) => {
                  try {
                    await PropShotService.likePropShot(propShotId);
                    setPropShots(prev => prev.map(shot =>
                      shot.id === propShotId
                        ? { ...shot, likes: shot.likes + 1 }
                        : shot
                    ));
                  } catch (error) {
                    console.error('Error liking PropShot:', error);
                  }
                }}
                onView={async (propShotId) => {
                  try {
                    await PropShotService.incrementViews(propShotId);
                  } catch (error) {
                    console.error('Error incrementing views:', error);
                  }
                }}
                gridCols={{
                  default: 2,
                  sm: 3,
                  lg: 4
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Grid Principal - Optimizado para móvil */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          
          {/* Mi Actividad */}
          <div className="lg:col-span-2">
            <Card className="h-full bg-white/90 backdrop-blur-sm border border-gray-100/50 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        Mi Actividad
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Tus últimas acciones en la plataforma
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="hover:shadow-lg hover:scale-105 transition-all duration-300 text-xs sm:text-sm self-start sm:self-auto bg-white/80 border-gray-200">
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                
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

                <Link href="/social/propshots">
                  <Button variant="outline" className="w-full h-16 bg-white/80 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Camera className="h-5 w-5 mr-2" />
                    PropShots
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