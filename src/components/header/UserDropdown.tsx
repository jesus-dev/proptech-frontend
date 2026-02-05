"use client";
import React, { useState, useRef, useEffect } from "react";
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
  DollarSign,
  Settings,
  HelpCircle,
  MessageCircle,
  LogOut,
  Crown
} from 'lucide-react';

interface UserHeaderProps {
  name: string;
  email: string;
  avatarUrl?: string;
  notifications?: number;
  role?: string;
  lastLogin?: string;
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onHelp?: () => void;
  onFeedback?: () => void;
}

function getInitials(name?: string) {
  if (!name || typeof name !== 'string') return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const UserDropdown: React.FC<UserHeaderProps> = ({
  name,
  email,
  avatarUrl,
  notifications = 0,
  role = "Administrador",
  lastLogin,
  onProfile,
  onSettings,
  onLogout,
  onHelp,
  onFeedback,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [loadingNovelties, setLoadingNovelties] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cerrar menú al hacer clic fuera o presionar Escape
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleEsc);
      // Cargar novedades cuando se abre el dropdown
      if (user?.id) {
      }
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, user?.id]);

  
  // Función para marcar novedad como leída
  const handleMarkAsRead = async (noveltyId: number) => {
    if (!user?.id) return;
    
    try {
      const success = await notificationService.markAsRead(noveltyId, user.id);
      if (success) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking novelty as read:', err);
    }
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Hace unos minutos";
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 48) return "Ayer";
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const getStatusColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
      case 'administrador':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg';
      case 'agente':
      case 'agent':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg';
      case 'supervisor':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg';
    }
  };

  // Traducir rol a español
  const translateRole = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Administrador';
      case 'agent':
        return 'Agente';
      case 'supervisor':
        return 'Supervisor';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  };

  // Funciones auxiliares para novedades
  const getNoveltyIcon = (type: string) => {
    switch (type) {
      case 'COMMENT':
        return <MessageSquare className="h-3 w-3" />;
      case 'PROPERTY_VIEW':
        return <Eye className="h-3 w-3" />;
      case 'PROPERTY_FAVORITE':
        return <Heart className="h-3 w-3" />;
      case 'PROPERTY_CONTACT':
        return <User className="h-3 w-3" />;
      case 'NEW_PROPERTY':
        return <Building2 className="h-3 w-3" />;
      case 'PRICE_CHANGE':
        return <DollarSign className="h-3 w-3" />;
      case 'SYSTEM_ALERT':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Bell className="h-3 w-3" />;
    }
  };

  const getNoveltyColor = (type: string) => {
    switch (type) {
      case 'COMMENT':
        return 'bg-gradient-to-br from-blue-400 to-blue-600 text-white';
      case 'PROPERTY_VIEW':
        return 'bg-gradient-to-br from-green-400 to-green-600 text-white';
      case 'PROPERTY_FAVORITE':
        return 'bg-gradient-to-br from-pink-400 to-pink-600 text-white';
      case 'PROPERTY_CONTACT':
        return 'bg-gradient-to-br from-purple-400 to-purple-600 text-white';
      case 'NEW_PROPERTY':
        return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
      case 'PRICE_CHANGE':
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
      case 'SYSTEM_ALERT':
        return 'bg-gradient-to-br from-red-400 to-red-600 text-white';
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-600 text-white';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      return date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Botón del usuario moderno */}
      <button
        className="group relative flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 cursor-pointer min-w-[60px] sm:min-w-[120px] hover:scale-[1.02]"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {/* Avatar con gradiente moderno */}
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl overflow-hidden ring-2 ring-white/30 shadow-lg relative">
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  // Si la imagen falla, ocultarla y mostrar iniciales
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg ring-2 ring-white/30">
              {getInitials(name)}
            </div>
          )}
          
          {/* Indicador de notificaciones */}
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-red-400 to-pink-500 border-2 border-white rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse"></span>
          )}
          
          {/* Indicador de estado online */}
          <span className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-white rounded-full shadow-lg"></span>
        </div>
        
        {/* Información del usuario: solo nombre */}
        <div className="hidden sm:flex text-left min-w-0">
          <div className="font-semibold text-gray-800 text-sm truncate">{name}</div>
        </div>

        {/* Sin flecha ni rol para minimalismo */}
      </button>

      {/* Dropdown moderno */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl z-50 overflow-hidden">
          {/* Header del usuario con gradiente */}
          <div className="relative px-6 py-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-b border-white/20">
            {/* Patrón de fondo decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative flex items-center gap-4">
              {/* Avatar grande */}
              {avatarUrl ? (
                <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-white/50 shadow-xl relative">
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      // Si la imagen falla, ocultarla y mostrar iniciales
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-xl ring-4 ring-white/50">
                  {getInitials(name)}
                </div>
              )}
              
              {/* Información del usuario */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg truncate">
                  {name}
                </h3>
                <p className="text-gray-600 text-sm truncate mb-2">
                  {email}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(role)} shadow-lg`}>
                    {(role === 'admin' || role === 'administrador') && <Crown className="w-3 h-3 mr-1" />}
                    {translateRole(role)}
                  </span>
                </div>
              </div>
            </div>
          </div>



          {/* Opciones del menú */}
          <div className="py-2">
            <ul className="space-y-1">
              {/* Mi Perfil */}
              <li>
                <button
                  className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 flex items-center gap-3 transition-all duration-200 group"
                  onClick={() => {
                    setOpen(false);
                    onProfile && onProfile();
                  }}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">Mi perfil</span>
                </button>
              </li>

              {/* Notificaciones */}
              <li>
                <a
                  href="/notifications"
                  className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 flex items-center gap-3 transition-all duration-200 group"
                  onClick={() => setOpen(false)}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-200 relative">
                    <Bell className="h-4 w-4 text-orange-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-400 to-pink-500 border-2 border-white rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        {unreadCount > 5 ? '5+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">Notificaciones</span>
                </a>
              </li>

              {/* TODO: Habilitar cuando estén implementados
              {/* Configuración */}
              {/*
              <li>
                <button
                  className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 flex items-center gap-3 transition-all duration-200 group"
                  onClick={() => {
                    setOpen(false);
                    onSettings && onSettings();
                  }}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-200">
                    <Settings className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium">Configuración</span>
                </button>
              </li>
              */}

              {/* Ayuda */}
              {/*
              {onHelp && (
                <li>
                  <button
                    className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 flex items-center gap-3 transition-all duration-200 group"
                    onClick={() => {
                      setOpen(false);
                      onHelp();
                    }}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-200">
                      <HelpCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium">Ayuda</span>
                  </button>
                </li>
              )}
              */}

              {/* Feedback */}
              {/*
              {onFeedback && (
                <li>
                  <button
                    className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 flex items-center gap-3 transition-all duration-200 group"
                    onClick={() => {
                      setOpen(false);
                      onFeedback();
                    }}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-200">
                      <MessageCircle className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="font-medium">Feedback</span>
                  </button>
                </li>
              )}
              */}

              {/* Separador decorativo */}
              <li className="px-6 py-2">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              </li>

              {/* Cerrar sesión */}
              <li>
                <button
                  className="w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 flex items-center gap-3 transition-all duration-200 group"
                  onClick={() => {
                    setOpen(false);
                    onLogout && onLogout();
                  }}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center group-hover:from-red-200 group-hover:to-red-300 transition-all duration-200">
                    <LogOut className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="font-medium">Cerrar sesión</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Footer moderno */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse"></div>
                <span className="text-gray-600 font-medium">PropTech CRM v2.0</span>
              </div>
              <span className="text-green-600 font-semibold">● Online</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
