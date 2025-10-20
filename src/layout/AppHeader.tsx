"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/hooks/useAuth";
import React, { useRef, useEffect } from "react";
import Logo from "@/components/common/Logo";
import Image from "next/image";
import { useRouter } from "next/navigation";

const AppHeaderCRM: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (window.innerWidth >= 768) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleSettings = () => {
    // TODO: Implementar navegación a configuración
    console.log('Navegar a configuración');
  };

  const handleLogout = async () => {
    try {
      await logout();
      // La redirección se maneja automáticamente en el contexto
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleHelp = () => {
    // Implementar navegación a la página de ayuda
    window.open('/help', '_blank');
  };

  const handleFeedback = () => {
    // Implementar modal o navegación a feedback
    window.open('/feedback', '_blank');
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 left-0 right-0 z-40 w-full border-b border-gray-200 bg-white text-gray-900 dark:bg-gray-900 dark:text-white dark:border-gray-800">
      <div className="flex h-16 items-center justify-between w-full px-3 sm:px-4">
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={handleToggle}
            className="block md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-300"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Logo visible en móvil */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => router.push('/dash')}
              className="flex items-center hover:opacity-80 transition-opacity"
              aria-label="Ir al dashboard"
            >
              <Image
                src="/images/logo/proptech.png"
                alt="PropTech CRM"
                width={200}
                height={55}
                style={{ width: 'auto', height: '48px' }}
                className="object-contain"
              />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <form>
              <div className="relative">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                  <svg
                    className="fill-gray-500 dark:fill-gray-400"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                      fill=""
                    />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar o escribir comando..."
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
                />
                <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                  <span> ⌘ </span>
                  <span> K </span>
                </button>
              </div>
            </form>
          </div>
          <div className="flex items-center gap-2 2xsm:gap-3">
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>
          <UserDropdown 
            name={user?.fullName || 'Usuario'}
            email={user?.email || 'usuario@proptech.com'}
            role={user?.roles?.[0] || 'Administrador'}
            lastLogin={user?.lastLogin}
            onProfile={handleProfile}
            onSettings={handleSettings}
            onLogout={handleLogout}
            onHelp={handleHelp}
            onFeedback={handleFeedback}
          />
        </div>
      </div>
    </header>
  );
};

export default AppHeaderCRM; 