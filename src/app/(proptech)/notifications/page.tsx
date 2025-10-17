"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { notificationService, Notification } from '@/services/notificationService';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  MessageSquare, 
  Eye, 
  Heart, 
  Building2, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  Settings,
  Mail,
  Users,
  Filter,
  RefreshCw,
  Search,
  X,
  TrendingUp,
  Star,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';

type NotificationTab = 'all' | 'novelties' | 'system' | 'messages' | 'users';

const translateStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'READ': 'LEÍDO',
    'UNREAD': 'NO LEÍDO',
    'PENDING': 'PENDIENTE',
    'SENT': 'ENVIADO',
    'FAILED': 'FALLIDO'
  };
  return statusMap[status] || status;
};



export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadAllNotifications();
    }
  }, [user?.id]);

  const loadAllNotifications = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Cargar notificaciones directamente
      const notificationsData = await notificationService.getUserNotifications(user.id, { limit: 50 });
      setNotifications(notificationsData.notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId, user!.id);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, status: 'READ' as const } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como leída si no lo está
    if (notification.status !== 'READ') {
      await handleMarkAsRead(notification.id);
    }
    
    // Intentar usar la URL del metadata si está disponible
    if (notification.metadata && notification.metadata.clickable && notification.metadata.url) {
      router.push(notification.metadata.url);
      return;
    }
    
    // Fallback: Navegar según el tipo de notificación
    switch (notification.type) {
      case 'PROPERTY_VIEW':
      case 'PROPERTY_FAVORITE':
      case 'PROPERTY_CONTACT':
      case 'PROPERTY_PRICE_CHANGE':
      case 'NEW_PROPERTY_SIMILAR':
        if (notification.propertyId) {
          router.push(`/properties/${notification.propertyId}`);
        }
        break;
      case 'APPOINTMENT_SCHEDULED':
      case 'APPOINTMENT_REMINDER':
        router.push('/agenda');
        break;
      case 'LEAD_SCORED':
        router.push('/contacts');
        break;
      case 'MARKET_UPDATE':
      case 'SYSTEM_ALERT':
        // Ya estamos en la página de notificaciones
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' as const })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PROPERTY_VIEW':
        return <Eye className="h-4 w-4" />;
      case 'PROPERTY_FAVORITE':
        return <Heart className="h-4 w-4" />;
      case 'PROPERTY_CONTACT':
        return <User className="h-4 w-4" />;
      case 'PROPERTY_PRICE_CHANGE':
        return <DollarSign className="h-4 w-4" />;
      case 'NEW_PROPERTY_SIMILAR':
        return <Building2 className="h-4 w-4" />;
      case 'MARKET_UPDATE':
        return <TrendingUp className="h-4 w-4" />;
      case 'LEAD_SCORED':
        return <Star className="h-4 w-4" />;
      case 'APPOINTMENT_SCHEDULED':
      case 'APPOINTMENT_REMINDER':
        return <Calendar className="h-4 w-4" />;
      case 'SYSTEM_ALERT':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'PROPERTY_VIEW':
        return 'bg-green-100 text-green-600';
      case 'PROPERTY_FAVORITE':
        return 'bg-pink-100 text-pink-600';
      case 'PROPERTY_CONTACT':
        return 'bg-purple-100 text-purple-600';
      case 'PROPERTY_PRICE_CHANGE':
        return 'bg-yellow-100 text-yellow-600';
      case 'NEW_PROPERTY_SIMILAR':
        return 'bg-orange-100 text-orange-600';
      case 'MARKET_UPDATE':
        return 'bg-blue-100 text-blue-600';
      case 'LEAD_SCORED':
        return 'bg-yellow-100 text-yellow-600';
      case 'APPOINTMENT_SCHEDULED':
      case 'APPOINTMENT_REMINDER':
        return 'bg-indigo-100 text-indigo-600';
      case 'SYSTEM_ALERT':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp || timestamp.trim() === '') {
      return 'Reciente';
    }
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Reciente';
    }
    
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      return date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Función auxiliar para obtener tipos de notificación por categoría
  const getTypesByCategory = (category: string): string[] => {
    const categoryTypeMap: Record<string, string[]> = {
      'novelties': ['PROPERTY_VIEW', 'PROPERTY_FAVORITE', 'PROPERTY_CONTACT', 'PROPERTY_PRICE_CHANGE', 'NEW_PROPERTY_SIMILAR'],
      'system': ['SYSTEM_ALERT', 'MARKET_UPDATE'],
      'messages': ['APPOINTMENT_SCHEDULED', 'APPOINTMENT_REMINDER'],
      'users': ['LEAD_SCORED']
    };
    return categoryTypeMap[category] || [];
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Filtrar por tab
    if (activeTab !== 'all') {
      const types = getTypesByCategory(activeTab);
      filtered = filtered.filter(n => types.includes(n.type));
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchLower) ||
        n.message.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por tiempo
    if (timeFilter) {
      const now = new Date();
      let startDate: Date;
      
      switch (timeFilter) {
        case 'this_week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay() + 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'this_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'last_6_months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'this_year':
          startDate = new Date(now.getFullYear(), 0, 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        default:
          return filtered;
      }
      
      filtered = filtered.filter(n => {
        const notificationDate = new Date(n.createdAt);
        return !isNaN(notificationDate.getTime()) && notificationDate >= startDate;
      });
    }

    return filtered;
  };

  const getUnreadCount = (category?: string) => {
    const unreadNotifications = notifications.filter(n => n.status !== 'READ');
    
    if (!category || category === 'all') {
      return unreadNotifications.length;
    }
    
    const types = getTypesByCategory(category);
    return unreadNotifications.filter(n => types.includes(n.type)).length;
  };

  const filteredNotifications = getFilteredNotifications();

  if (!user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso no autorizado</h2>
          <p className="text-gray-600">Debes iniciar sesión para ver las notificaciones.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Notificaciones</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Gestiona todas tus notificaciones</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadAllNotifications}
                disabled={loading}
                className="text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              
              {getUnreadCount() > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-sm"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 sm:flex sm:space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6 gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Bell className="h-4 w-4" />
            Todas
            {getUnreadCount() > 0 && (
              <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {getUnreadCount()}
              </Badge>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('novelties')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === 'novelties'
                ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Propiedades
            {getUnreadCount('novelties') > 0 && (
              <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {getUnreadCount('novelties')}
              </Badge>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === 'system'
                ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4" />
            Sistema
            {getUnreadCount('system') > 0 && (
              <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {getUnreadCount('system')}
              </Badge>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === 'messages'
                ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Mail className="h-4 w-4" />
            Mensajes
            {getUnreadCount('messages') > 0 && (
              <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {getUnreadCount('messages')}
              </Badge>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            Usuarios
            {getUnreadCount('users') > 0 && (
              <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {getUnreadCount('users')}
              </Badge>
            )}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar notificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Time Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por:</span>
              <button
                onClick={() => setTimeFilter('')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  !timeFilter 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTimeFilter('this_week')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  timeFilter === 'this_week' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                Esta semana
              </button>
              <button
                onClick={() => setTimeFilter('this_month')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  timeFilter === 'this_month' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                Este mes
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner message="Cargando notificaciones..." />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm 
                  ? `No se encontraron notificaciones que coincidan con "${searchTerm}"`
                  : timeFilter
                    ? `No hay notificaciones en el período seleccionado`
                    : activeTab === 'all'
                      ? 'No tienes notificaciones'
                      : `No hay notificaciones de ${activeTab}`
                }
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || timeFilter
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Las nuevas notificaciones aparecerán aquí'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                    notification.status !== 'READ' ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            <Badge className={`text-xs ${getPriorityColor(notification.status === 'PENDING' ? 'HIGH' : 'MEDIUM')}`}>
                              {translateStatus(notification.status)}
                            </Badge>
                            {notification.status !== 'READ' && (
                              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {notification.message}
                          </p>
                          
                          {/* Metadata */}
                          {notification.metadata && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                              {notification.metadata.propertyTitle && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  <span>Propiedad: {notification.metadata.propertyTitle}</span>
                                </div>
                              )}
                              {notification.metadata.userName && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>Por: {notification.metadata.userName}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Timestamp */}
                          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-2">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(notification.createdAt)}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {notification.status !== 'READ' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-green-600"
                              title="Marcar como leída"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
