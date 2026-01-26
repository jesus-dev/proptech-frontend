"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { notificationService, Notification } from "@/services/notificationService";
import { useAuth } from "@/hooks/useAuth";
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
  DollarSign
} from 'lucide-react';

export default function NotificationDropdown() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifying, setNotifying] = useState(false);

  // Cargar notificaciones reales
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  // Mantener notificaciones actualizadas cada 30 segundos
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [user?.id]);

  // Recargar notificaciones cuando la ventana gana foco (usuario regresa a la pestaña)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        loadNotifications();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) {
      return;
    }
    
    setLoading(true);
    try {
      const data = await notificationService.getUnreadNotifications(user.id, 5);
      
      // Solo actualizar si hay datos válidos
      if (Array.isArray(data)) {
        setNotifications(data);
        setNotifying(data.length > 0);
      } else {
        // Si no hay datos válidos, mantener estado vacío
        setNotifications([]);
        setNotifying(false);
      }
    } catch (error: any) {
      // El servicio ya maneja los errores y retorna array vacío
      // Solo loguear si es un error inesperado (no de red)
      if (error?.code !== 'ERR_NETWORK' && 
          error?.code !== 'ERR_CONNECTION_REFUSED' &&
          !error?.message?.includes('Network error')) {
        console.warn('🔔 Error loading notifications:', error?.message || error);
      }
      // Mantener estado vacío en caso de error
      setNotifications([]);
      setNotifying(false);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.length;

  const toggleDropdown = async () => {
    setIsOpen(!isOpen);
    
    // Solo recargar notificaciones si se está abriendo el dropdown
    if (!isOpen && user?.id) {
      loadNotifications();
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como leída si no lo está
    if (notification.status !== 'READ' && user?.id) {
      try {
        await notificationService.markAsRead(notification.id, user.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, status: 'READ' } : n)
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    closeDropdown();
    
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
        router.push('/notifications');
        break;
      default:
        router.push('/notifications');
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
        return <DollarSign className="h-4 w-4" />;
      case 'LEAD_SCORED':
        return <User className="h-4 w-4" />;
      case 'APPOINTMENT_SCHEDULED':
      case 'APPOINTMENT_REMINDER':
        return <Clock className="h-4 w-4" />;
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
        return 'bg-emerald-100 text-emerald-600';
      case 'APPOINTMENT_SCHEDULED':
      case 'APPOINTMENT_REMINDER':
        return 'bg-indigo-100 text-indigo-600';
      case 'SYSTEM_ALERT':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return 'Reciente';
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Reciente';
    
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${Math.floor(diffInMinutes)} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    if (diffInMinutes < 10080) return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

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

  const translateType = (type: string) => {
    const typeMap: Record<string, string> = {
      'PROPERTY_VIEW': 'Vista en Propiedad',
      'PROPERTY_FAVORITE': 'Propiedad Favorita',
      'PROPERTY_CONTACT': 'Contacto en Propiedad',
      'PROPERTY_PRICE_CHANGE': 'Cambio de Precio',
      'NEW_PROPERTY_SIMILAR': 'Propiedad Similar',
      'MARKET_UPDATE': 'Actualización de Mercado',
      'LEAD_SCORED': 'Lead Calificado',
      'APPOINTMENT_SCHEDULED': 'Cita Programada',
      'APPOINTMENT_REMINDER': 'Recordatorio de Cita',
      'SYSTEM_ALERT': 'Alerta del Sistema'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle relative p-2 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-lg transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <Bell className="h-6 w-6" />
        {notifying && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 dark:bg-orange-400 text-white text-xs rounded-full flex items-center justify-center shadow-lg animate-pulse">
            {unreadCount > 5 ? '5+' : unreadCount}
          </span>
        )}
      </button>

      <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-96">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <span className="text-sm text-orange-600 dark:text-orange-400">
                {unreadCount} sin leer
              </span>
            )}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 dark:border-orange-400 mx-auto mb-2"></div>
              <p className="text-sm">Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-medium">No hay notificaciones</p>
              <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">Las nuevas notificaciones aparecerán aquí</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatTime(notification.createdAt)}</span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span>{translateType(notification.type)}</span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="font-medium">{translateStatus(notification.status)}</span>
                        </div>
                      </div>
                      {notification.status !== 'READ' && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              closeDropdown();
              router.push('/notifications');
            }}
            className="w-full px-4 py-2 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Ver todas las notificaciones
          </button>
        </div>
      </Dropdown>
    </div>
  );
}