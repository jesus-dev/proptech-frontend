"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Settings, 
  LogOut, 
  HelpCircle, 
  MessageSquare, 
  Bell, 
  Shield, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit3,
  ChevronDown,
  Crown,
  Star,
  TrendingUp
} from 'lucide-react';

interface UserDropdownProps {
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onHelp?: () => void;
  onFeedback?: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  onProfile,
  onSettings,
  onLogout,
  onHelp,
  onFeedback,
}) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

  const getInitials = (name?: string) => {
    if (!name || typeof name !== 'string') return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    
    const roleConfig = {
      'admin': { color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: Crown },
      'administrador': { color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: Crown },
      'agente': { color: 'bg-gradient-to-r from-blue-500 to-cyan-500', icon: Star },
      'agent': { color: 'bg-gradient-to-r from-blue-500 to-cyan-500', icon: Star },
      'supervisor': { color: 'bg-gradient-to-r from-green-500 to-emerald-500', icon: TrendingUp },
      'default': { color: 'bg-gradient-to-r from-gray-500 to-slate-500', icon: User }
    };

    const config = roleConfig[role.toLowerCase() as keyof typeof roleConfig] || roleConfig.default;
    const IconComponent = config.icon;

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        <span>{role}</span>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => window.location.href = '/login'}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors"
        >
          Iniciar Sesión
        </button>
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
          ?
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      {/* Botón del usuario - Estilo Facebook */}
      <button
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-all duration-200 group"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {/* Avatar del usuario */}
        <div className="relative">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg shadow-lg group-hover:shadow-xl transition-all duration-200">
            {getInitials(user.fullName)}
          </div>
          
          {/* Indicador de estado online */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
        </div>

        {/* Información del usuario */}
        <div className="hidden lg:block text-left">
          <div className="text-sm font-semibold text-gray-900">
            {user.fullName || 'Usuario'}
          </div>
          <div className="text-xs text-gray-500">
            {user.role || 'Usuario'}
          </div>
        </div>

        {/* Flecha */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown - Responsive */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Menú de opciones */}
          <div className="p-2">
            <div className="space-y-1">
              {/* Mi Perfil */}
              <button
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all duration-200 group"
                onClick={() => {
                  setOpen(false);
                  onProfile && onProfile();
                }}
              >
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors">
                  <User className="w-4 h-4 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Mi perfil</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Ver y editar mi información</div>
                </div>
              </button>

              {/* Configuración */}
              <button
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all duration-200 group"
                onClick={() => {
                  setOpen(false);
                  onSettings && onSettings();
                }}
              >
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                  <Settings className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Configuración</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Preferencias y privacidad</div>
                </div>
              </button>

              {/* Ayuda */}
              {onHelp && (
                <button
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all duration-200 group"
                  onClick={() => {
                    setOpen(false);
                    onHelp();
                  }}
                >
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                    <HelpCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Ayuda</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Centro de ayuda y soporte</div>
                  </div>
                </button>
              )}

              {/* Feedback */}
              {onFeedback && (
                <button
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all duration-200 group"
                  onClick={() => {
                    setOpen(false);
                    onFeedback();
                  }}
                >
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Feedback</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Enviar comentarios</div>
                  </div>
                </button>
              )}

              {/* Separador */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

              {/* Cerrar sesión */}
              <button
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group"
                onClick={handleLogout}
              >
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors">
                  <LogOut className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Cerrar sesión</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Salir de tu cuenta</div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Verse v1</span>
              </div>
              <span className="text-green-500 font-medium">● Online</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
