'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { Home, PlayCircle, Users, MessageSquare, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MessagingService } from '@/services/messagingService';
import { getEndpoint } from '@/lib/api-config';

export default function SocialLayout({ children }: any) {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const isGalleryRoute = pathname?.startsWith('/yvu/gallery');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [authMenuPosition, setAuthMenuPosition] = useState({ top: 0, left: 0 });
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const authButtonRef = useRef<HTMLButtonElement>(null);
  const authMenuRef = useRef<HTMLDivElement>(null);

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
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      // No cerrar si el clic está dentro del menú de usuario, del menú móvil o del menú de autenticación
      if (
        (userMenuRef.current && userMenuRef.current.contains(target)) ||
        (mobileMenuRef.current && mobileMenuRef.current.contains(target)) ||
        (userButtonRef.current && userButtonRef.current.contains(target)) ||
        (authMenuRef.current && authMenuRef.current.contains(target)) ||
        (authButtonRef.current && authButtonRef.current.contains(target))
      ) {
        return;
      }
      setShowUserMenu(false);
      setShowAuthMenu(false);
    }
    if (showUserMenu || showAuthMenu) {
      // Usar un pequeño delay para permitir que los handlers de los botones se ejecuten primero
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClick);
      }, 0);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClick);
      };
    }
  }, [showUserMenu, showAuthMenu]);

  const getInitials = (name?: string) => {
    if (!name || typeof name !== 'string') return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPhotoUrl = (photoUrl?: string) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('blob:')) {
      return photoUrl;
    }
    return getEndpoint(photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`);
  };

  const getUserPhoto = () => {
    return (user as any)?.photoUrl || user?.agent?.fotoPerfilUrl;
  };

  if (isGalleryRoute) {
    return (
      <div className="min-h-screen bg-black">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black" style={{ overflow: 'hidden' }}>
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[275px] border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <div className="px-4 py-6">
          <button
            onClick={() => window.location.href = '/yvu'}
            className="flex flex-col items-start focus:outline-none hover:opacity-80 transition-opacity w-full"
            aria-label="Áureo - Inicio"
          >
            <img 
              src="/images/logo/yvu.png" 
              alt="Áureo Logo" 
              className="object-contain"
              style={{
                height: '40px',
                width: 'auto'
              }}
            />
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 text-left">
              Donde nacen los negocios de bienes raices
            </p>
          </button>
        </div>

        <nav className="flex-1 px-3 py-2">
          <div className="space-y-1">
            <button 
              onClick={() => window.location.href = '/yvu'}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-200 group ${
                pathname === '/yvu' 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Home className={`w-6 h-6 ${pathname === '/yvu' ? '' : 'group-hover:scale-110'}`} />
              <span className="text-xl">Inicio</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/yvu/propshots'}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-200 group ${
                pathname === '/yvu/propshots' 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
              }`}
            >
              <PlayCircle className={`w-6 h-6 ${pathname === '/yvu/propshots' ? '' : 'group-hover:scale-110'}`} />
              <span className="text-xl">PropShots</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/yvu/asesores'}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-200 group ${
                pathname === '/yvu/asesores' 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Users className={`w-6 h-6 ${pathname === '/yvu/asesores' ? '' : 'group-hover:scale-110'}`} />
              <span className="text-xl">Asesores</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/yvu/messages'}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-200 group relative ${
                pathname === '/yvu/messages' 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
              }`}
            >
              <MessageSquare className={`w-6 h-6 ${pathname === '/yvu/messages' ? '' : 'group-hover:scale-110'}`} />
              <span className="text-xl">Mensajes</span>
              {unreadCount > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          {!isAuthenticated && (
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-blue-100 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">Únete a la red inmobiliaria</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-tight mt-0.5">Explora y comparte propiedades</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { if (typeof window !== 'undefined') window.location.href = '/login'; }}
                    className="w-full px-3 py-2 rounded-lg text-white bg-blue-600 hover:bg-indigo-700 text-sm font-medium transition-colors"
                  >
                    Empezar ahora
                  </button>
                  <button
                    onClick={() => { if (typeof window !== 'undefined') window.location.href = '/registrarse'; }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
                  >
                    Crear cuenta
                  </button>
                </div>
              </div>
            </div>
          )}

          {isAuthenticated && (
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 relative" ref={userMenuRef}>
              <button 
                ref={userButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-all duration-200 group"
              >
                {getUserPhoto() ? (
                  <img 
                    src={getPhotoUrl(getUserPhoto()) || ''}
                    alt={user?.fullName || 'Usuario'}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold';
                        fallback.textContent = getInitials(user?.fullName);
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {getInitials(user?.fullName)}
                  </div>
                )}
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.fullName || 'Usuario'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Ver perfil
                  </div>
                </div>
              </button>

              {showUserMenu && typeof window !== 'undefined' && window.innerWidth >= 1024 && (
                <>
                  <div 
                    className="fixed inset-0 z-[45]" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(false);
                    }}
                  />
                  <div 
                    ref={userMenuRef}
                    className="absolute top-0 left-full ml-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
                    style={{ zIndex: 9999999 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowUserMenu(false);
                          setTimeout(() => {
                            window.location.href = '/profile';
                          }, 100);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span className="text-sm font-medium">Perfil</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowUserMenu(false);
                          setTimeout(() => {
                            logout();
                          }, 100);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </nav>
      </aside>

      <aside 
        className="lg:hidden flex flex-col w-20 sm:w-24 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black fixed left-0 top-0 z-[99999]"
        style={{ 
          height: '100dvh',
          maxHeight: '100dvh',
          paddingTop: 'env(safe-area-inset-top, 0)',
          paddingBottom: 'env(safe-area-inset-bottom, 0)'
        }}
      >
        <div className="px-2 py-4 flex items-center justify-center flex-shrink-0" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0))' }}>
          <button
            onClick={() => window.location.href = '/yvu'}
            className="flex flex-col items-center justify-center focus:outline-none hover:opacity-80 active:opacity-70 transition-opacity w-full touch-manipulation"
            aria-label="Áureo - Inicio"
            style={{ minHeight: '48px', minWidth: '48px' }}
          >
            <img 
              src="/images/logo/yvu.png" 
              alt="Áureo Logo" 
              className="object-contain max-w-full"
              style={{
                height: '36px',
                width: 'auto'
              }}
            />
            <p className="text-[8px] text-gray-500 dark:text-gray-400 mt-0.5 text-center leading-tight">
              Donde nacen los negocios de bienes raices
            </p>
          </button>
        </div>

        <nav className="flex-1 px-2 sm:px-3 py-2 sm:py-3 flex flex-col min-h-0 justify-between">
          <div className="space-y-2 sm:space-y-1.5 flex-shrink-0">
            <button 
              onClick={() => window.location.href = '/yvu'}
              className={`w-full flex items-center justify-center p-3 rounded-full transition-all duration-200 touch-manipulation ${
                pathname === '/yvu' 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-900 active:bg-gray-200 dark:active:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
              title="Inicio"
              style={{ minHeight: '48px', minWidth: '48px' }}
            >
              <Home className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
            
            <button 
              onClick={() => window.location.href = '/yvu/propshots'}
              className={`w-full flex items-center justify-center p-3 rounded-full transition-all duration-200 relative touch-manipulation ${
                pathname === '/yvu/propshots' 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-900 active:bg-gray-200 dark:active:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
              title="PropShots"
              style={{ minHeight: '48px', minWidth: '48px' }}
            >
              <PlayCircle className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
            
            <button 
              onClick={() => window.location.href = '/yvu/asesores'}
              className={`w-full flex items-center justify-center p-3 rounded-full transition-all duration-200 touch-manipulation ${
                pathname === '/yvu/asesores' 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-900 active:bg-gray-200 dark:active:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
              title="Asesores"
              style={{ minHeight: '48px', minWidth: '48px' }}
            >
              <Users className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
            
            <button 
              onClick={() => window.location.href = '/yvu/messages'}
              className={`w-full flex items-center justify-center p-3 rounded-full transition-all duration-200 relative touch-manipulation ${
                pathname === '/yvu/messages' 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-900 active:bg-gray-200 dark:active:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
              title="Mensajes"
              style={{ minHeight: '48px', minWidth: '48px' }}
            >
              <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          {!isAuthenticated && (
            <div 
              className="pt-4 sm:pt-3 md:pt-4 border-t-2 border-gray-300 dark:border-gray-700 flex-shrink-0 mt-auto"
              style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0))' }}
            >
              <button
                ref={authButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  if (authButtonRef.current) {
                    const rect = authButtonRef.current.getBoundingClientRect();
                    // Posicionar el menú arriba del botón en lugar de abajo
                    const menuHeight = 150; // Altura aproximada del menú
                    setAuthMenuPosition({
                      top: Math.max(10, rect.top - menuHeight - 10), // Posicionar arriba con margen mínimo
                      left: rect.left + rect.width + 8
                    });
                  }
                  setShowAuthMenu(!showAuthMenu);
                }}
                className={`w-full flex items-center justify-center p-3 rounded-full transition-all duration-200 group touch-manipulation ${
                  showAuthMenu 
                    ? 'bg-gray-200 dark:bg-gray-700' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-900 active:bg-gray-200 dark:active:bg-gray-800'
                }`}
                title="Únete a la red"
                style={{ minHeight: '48px', minWidth: '48px' }}
              >
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-all duration-200">
                  <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
              </button>

              {showAuthMenu && typeof window !== 'undefined' && window.innerWidth < 1024 && createPortal(
                <>
                  <div 
                    className="fixed inset-0 z-[9999998]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAuthMenu(false);
                    }}
                  />
                  <div 
                    ref={authMenuRef}
                    className="fixed w-56 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[9999999]"
                    style={{ 
                      top: `${authMenuPosition.top}px`,
                      left: `${authMenuPosition.left}px`
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Únete a la red</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">Explora y comparte propiedades</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowAuthMenu(false);
                          setTimeout(() => {
                            window.location.href = '/login';
                          }, 100);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <LogIn className="w-5 h-5" />
                        <span className="text-sm font-medium">Empezar ahora</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowAuthMenu(false);
                          setTimeout(() => {
                            window.location.href = '/register';
                          }, 100);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span className="text-sm font-medium">Crear cuenta</span>
                      </button>
                    </div>
                  </div>
                </>,
                document.body
              )}
            </div>
          )}

          {isAuthenticated && (
            <div 
              className="pt-4 sm:pt-3 md:pt-4 border-t-2 border-gray-300 dark:border-gray-700 relative flex-shrink-0 mt-auto" 
              ref={userMenuRef}
              style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0))' }}
            >
              <button 
                ref={userButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  if (userButtonRef.current) {
                    const rect = userButtonRef.current.getBoundingClientRect();
                    // Posicionar el menú arriba del botón en lugar de abajo
                    const menuHeight = 120; // Altura aproximada del menú
                    setMenuPosition({
                      top: Math.max(10, rect.top - menuHeight - 40), // Posicionar arriba con margen mínimo
                      left: rect.left + rect.width + 8
                    });
                  }
                  setShowUserMenu(!showUserMenu);
                }}
                className="w-full flex items-center justify-center p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 active:bg-gray-200 dark:active:bg-gray-800 transition-all duration-200 touch-manipulation"
                title={user?.fullName || 'Perfil'}
                style={{ minHeight: '48px', minWidth: '48px' }}
              >
                {getUserPhoto() ? (
                  <img 
                    src={getPhotoUrl(getUserPhoto()) || ''}
                    alt={user?.fullName || 'Usuario'}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold';
                        fallback.textContent = getInitials(user?.fullName);
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                    {getInitials(user?.fullName)}
                  </div>
                )}
              </button>

              {showUserMenu && typeof window !== 'undefined' && window.innerWidth < 1024 && createPortal(
                <>
                  <div 
                    className="fixed inset-0 z-[9999998]" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(false);
                    }}
                  />
                  <div 
                    ref={mobileMenuRef}
                    className="fixed w-48 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[9999999]"
                    style={{ 
                      top: `${menuPosition.top}px`,
                      left: `${menuPosition.left}px`
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowUserMenu(false);
                          setTimeout(() => {
                            window.location.href = '/profile';
                          }, 100);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span className="text-sm font-medium">Perfil</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowUserMenu(false);
                          setTimeout(() => {
                            logout();
                          }, 100);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                </>,
                document.body
              )}
            </div>
          )}
        </nav>
      </aside>

      <div 
        className="pl-20 sm:pl-24 lg:pl-0 lg:ml-[275px] min-w-0" 
        style={{ 
          height: '100dvh', 
          maxHeight: '100dvh',
          overflowY: 'auto', 
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <main 
          className="min-h-screen bg-white dark:bg-black w-full px-2 sm:px-3 md:px-6 lg:px-8"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
