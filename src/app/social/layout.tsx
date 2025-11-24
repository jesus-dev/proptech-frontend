'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import UserDropdown from '@/components/social/UserDropdown';
import { Home, PlayCircle, Users, MessageSquare, Key } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MessagingService } from '@/services/messagingService';

export default function SocialLayout({ children }: any) {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isGalleryRoute = pathname?.startsWith('/social/gallery');
  const [unreadCount, setUnreadCount] = useState(0);

  // Obtener contador de mensajes no leídos desde BD
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!isAuthenticated) {
        setUnreadCount(0);
        return;
      }

      try {
        const conversations = await MessagingService.getConversations();
        const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error loading unread count:', error);
        setUnreadCount(0);
      }
    };

    loadUnreadCount();
    
    // Refrescar cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, pathname]); // Recargar cuando cambia la ruta

  // En rutas de galería mostramos el contenido en fullscreen sin header/sidebar
  if (isGalleryRoute) {
    return (
      <div className="min-h-screen bg-black">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Estilo Facebook */}
      <div className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo - Visible en todas las pantallas */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => window.location.href = '/social'}
                className="flex items-center focus:outline-none hover:opacity-80 transition-opacity"
                aria-label="PropTech Social - Inicio"
              >
                <img 
                  src="/images/logo/ProptechSocial.png" 
                  alt="PropTech Social Logo" 
                  className="object-contain"
                  style={{
                    height: '42px',
                    width: 'auto'
                  }}
                />
              </button>
              
              {/* Buscador - Oculto en mobile */}
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 bg-gray-100 rounded-full w-48 lg:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-gray-50"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </div>
            </div>

            {/* Navigation - Estilo Facebook Mejorado */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              <button 
                onClick={() => window.location.href = '/social'}
                className={`group relative p-3 sm:p-4 hover:bg-gray-100 rounded-full transition-all duration-300 ${
                  pathname === '/social' ? 'bg-gradient-to-r from-blue-100 to-indigo-50 shadow-sm' : ''
                }`}
                title="Feed Inmobiliario"
                aria-label="Feed Inmobiliario"
              >
                <div className="relative">
                  <Home className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 ${
                    pathname === '/social' ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-500'
                  }`} />
                  {pathname === '/social' && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </button>
              
              <button 
                onClick={() => window.location.href = '/social/propshots'}
                className={`group relative p-3 sm:p-4 hover:bg-gray-100 rounded-full transition-all duration-300 ${
                  pathname === '/social/propshots' ? 'bg-gradient-to-r from-blue-100 to-indigo-50 shadow-sm' : ''
                }`}
                title="PropShots"
                aria-label="PropShots"
              >
                <div className="relative">
                  <PlayCircle className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 ${
                    pathname === '/social/propshots' ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-500'
                  }`} />
                  {pathname === '/social/propshots' && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </button>
              
              <button 
                onClick={() => window.location.href = '/social/asesores'}
                className={`group relative p-3 sm:p-4 hover:bg-gray-100 rounded-full transition-all duration-300 ${
                  pathname === '/social/asesores' ? 'bg-gradient-to-r from-blue-100 to-indigo-50 shadow-sm' : ''
                }`}
                title="Agentes Inmobiliarios"
                aria-label="Agentes Inmobiliarios"
              >
                <div className="relative">
                  <Users className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 ${
                    pathname === '/social/asesores' ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-500'
                  }`} />
                  {pathname === '/social/asesores' && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </button>
              
              <button 
                onClick={() => window.location.href = '/social/messages'}
                className={`group relative p-3 sm:p-4 hover:bg-gray-100 rounded-full transition-all duration-300 ${
                  pathname === '/social/messages' ? 'bg-gradient-to-r from-blue-100 to-indigo-50 shadow-sm' : ''
                }`}
                title="Consultas Inmobiliarias"
                aria-label="Consultas Inmobiliarias"
              >
                <div className="relative">
                  <MessageSquare className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 ${
                    pathname === '/social/messages' ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-500'
                  }`} />
                  {pathname === '/social/messages' && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                {/* Indicador de consultas no leídas - Dinámico desde BD */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[11px] sm:text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <UserDropdown />
              ) : (
                <div className="flex items-center">
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:bg-gray-50 flex items-center space-x-1.5 border border-gray-200 hover:border-blue-300"
                  >
                    <Key className="w-4 h-4" />
                    <span>Acceso</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal - Mejorado Responsive */}
      <div className="max-w-7xl mx-auto py-2 sm:py-3 md:py-4 lg:py-6 px-2 sm:px-3 md:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
          {/* Sidebar Izquierda - Oculta en mobile */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <div className="space-y-4">
                {/* Navegación Principal */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Navegación</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => window.location.href = '/social'}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        pathname === '/social' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                      </svg>
                      <span className="text-sm font-medium">Red Social</span>
                    </button>
                    
                    <button 
                      onClick={() => window.location.href = '/social/propshots'}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        pathname === '/social/propshots' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zM12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        <path d="M20 4h-3.17l-1.24-1.35A2 2 0 0 0 14.12 2H9.88c-.56 0-1.1.24-1.48.65L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                      </svg>
                      <span className="text-sm font-medium">PropShots</span>
                    </button>
                    
                    <button 
                      onClick={() => window.location.href = '/social/asesores'}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        pathname === '/social/asesores' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                      <span className="text-sm font-medium">Asesores</span>
                    </button>
                    
                    <button 
                      onClick={() => window.location.href = '/social/messages'}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        pathname === '/social/messages' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                      </svg>
                      <span className="text-sm font-medium">Mensajes</span>
                    </button>
                  </div>
                </div>

                {/* Sección "Tú" */}
                {isAuthenticated && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Tú</h3>
                    <div className="space-y-2">
                      <button 
                        onClick={() => window.location.href = '/profile'}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
                      >
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm font-medium">Perfil</span>
                      </button>
                      
                      <button 
                        onClick={() => window.location.href = '/settings'}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                        </svg>
                        <span className="text-sm font-medium">Configuración</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contenido de la Página - Full width en mobile */}
          <div className="col-span-1 lg:col-span-9">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
