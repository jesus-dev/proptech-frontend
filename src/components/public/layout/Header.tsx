"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XMarkIcon, Bars3Icon, BoltIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  const isProptechPage = pathname === '/proptech' || pathname === '/proptech/';
  const isPropiedadesPage = pathname === '/propiedades' || pathname === '/propiedades/';
  const isContactPage = pathname === '/contact' || pathname === '/contact/';
  const isAsesoresPage = pathname === '/asesores' || pathname?.startsWith('/asesores');
  const isProfesionalesPage = pathname === '/profesionales' || pathname?.startsWith('/profesionales');
  const isHomePage = pathname === '/';
  const isTerminosPage = pathname === '/terminos' || pathname === '/terminos/';
  const isPrivacidadPage = pathname === '/privacidad' || pathname === '/privacidad/';
  const isAyudaPage = pathname === '/ayuda' || pathname === '/ayuda/';
  const isSeguridadPage = pathname === '/seguridad' || pathname === '/seguridad/';
  const isInstructivosPage = pathname === '/instructivos' || pathname?.startsWith('/instructivos');
  const isAgendarPage = pathname?.startsWith('/agendar');
  const hasBlueHero = isPropiedadesPage || isHomePage || isProptechPage || isContactPage || isAsesoresPage || isProfesionalesPage || isTerminosPage || isPrivacidadPage || isAyudaPage || isSeguridadPage || isInstructivosPage || isAgendarPage;
  
  // Determinar el color del texto basado en si no hay scroll y tiene hero
  const shouldUseWhiteText = !isScrolled && hasBlueHero;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Asegurar que empiece transparente
    setIsScrolled(false);
    
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
    };
    
    // Pequeño delay para asegurar que el DOM esté listo
    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]); // Agregar pathname para resetear al cambiar de página

  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, [isMenuOpen]);

  const navigation = [
    {
      name: 'Propiedades',
      href: '/propiedades',
      submenu: [
        { name: 'Todas las Propiedades', href: '/propiedades' },
        { name: 'Casas', href: '/propiedades/casa' },
        { name: 'Departamentos', href: '/propiedades/departamento' },
        { name: 'Terrenos', href: '/propiedades/terreno' },
        { name: 'Locales Comerciales', href: '/propiedades/comercial' },
        { name: 'Quintas y Chalets', href: '/propiedades/quinta' },
        { name: 'Edificios', href: '/propiedades/edificio' }
      ]
    },
    { name: 'Asesores', href: '/asesores' },
    { name: 'Profesionales', href: '/profesionales' },
    { name: 'Contacto', href: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200'
            : 'bg-transparent !important'
        }`}
        data-scrolled={isScrolled}
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          width: '100%', 
          backfaceVisibility: 'hidden', 
          WebkitBackfaceVisibility: 'hidden', 
          transform: 'translateZ(0)',
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent'
        }}
      >
        <nav className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between h-14 sm:h-16 py-1">
            <Link href="/" className="flex items-center justify-start" aria-label="Inicio PropTech">
              <img
                src="/images/logo/proptech.png"
                alt="PropTech"
                className="w-auto transition-transform duration-300 hover:scale-105"
                style={shouldUseWhiteText ? {
                  filter: 'brightness(0) invert(1)',
                  WebkitFilter: 'brightness(0) invert(1)',
                  height: '50px',
                  maxHeight: '50px'
                } : {
                  height: '50px',
                  maxHeight: '50px'
                }}
              />
            </Link>

            <div className="hidden lg:flex items-center space-x-6">
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.submenu ? (
                    <div
                      className="relative"
                      onMouseEnter={() => setActiveSubmenu(item.name)}
                      onMouseLeave={() => setActiveSubmenu(null)}
                    >
                      <Link
                        href={item.href}
                        className={`transition-colors duration-200 font-medium flex items-center px-2.5 py-2 rounded-lg ${
                          shouldUseWhiteText
                            ? 'text-white hover:text-white/90'
                            : 'text-gray-800 hover:text-blue-600'
                        }`}
                      >
                        {item.name}
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Link>
                      <AnimatePresence>
                        {activeSubmenu === item.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/50 py-3 z-50"
                          >
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors duration-200 rounded-md mx-2"
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`transition-colors duration-200 font-medium px-2.5 py-2 rounded-lg ${
                        shouldUseWhiteText
                          ? 'text-white hover:text-white/90'
                          : 'text-gray-800 hover:text-blue-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/login"
                className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                  shouldUseWhiteText
                    ? 'text-white hover:text-white/90 hover:bg-white/10'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/registrarse"
                className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                  shouldUseWhiteText
                    ? 'text-white hover:text-white/90 hover:bg-white/10'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Registrarse
              </Link>
              <Link
                href="/proptech"
                className={`group relative px-6 py-2.5 rounded-xl transition-all duration-300 font-semibold overflow-hidden ${
                  isScrolled
                    ? 'bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105'
                    : 'bg-white/20 backdrop-blur-md text-white border-2 border-white/40 hover:bg-white/30 hover:border-white/60 shadow-lg hover:shadow-xl hover:shadow-white/20'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <BoltIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Descubrir PropTech</span>
                </span>
                {isScrolled && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-3 rounded-lg transition-all duration-300 relative z-[70] ${
                shouldUseWhiteText
                  ? 'text-white hover:text-white/90 hover:bg-white/20'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              type="button"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
          
        </nav>
      </header>
      {/* Spacer para evitar solapamiento con contenido en mobile */}
      <div className="h-14 sm:h-16"></div>
      
      {/* MENU MOBILE */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className="fixed top-0 left-0 w-80 h-full bg-white shadow-xl z-[9999] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Menú</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <a 
                href="/" 
                onClick={() => setIsMenuOpen(false)} 
                className="block p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-gray-50"
              >
                🏠 Inicio
              </a>
              
              {/* Propiedades con submenu */}
              <div className="space-y-2">
                <div className="p-3 text-gray-700 bg-gray-50 rounded-lg font-medium">
                  🏘️ Propiedades
                </div>
                <div className="ml-4 space-y-1">
                  <a 
                    href="/propiedades" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="block p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Todas las Propiedades
                  </a>
                  <a 
                    href="/propiedades?tipo=venta" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="block p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Ventas
                  </a>
                  <a 
                    href="/propiedades?tipo=alquiler" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="block p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Alquiler
                  </a>
                  <a 
                    href="/propiedades?categoria=apartamento" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="block p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Departamentos
                  </a>
                  <a 
                    href="/propiedades?categoria=casa" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="block p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Casas
                  </a>
                  <a 
                    href="/proyectos" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="block p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Proyectos/Desarrollos
                  </a>
                </div>
              </div>
              
              <a 
                href="/asesores" 
                onClick={() => setIsMenuOpen(false)} 
                className="block p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-gray-50"
              >
                👥 Asesores
              </a>
              <a 
                href="/contact" 
                onClick={() => setIsMenuOpen(false)} 
                className="block p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-gray-50"
              >
                📞 Contacto
              </a>
              <a 
                href="/login" 
                onClick={() => setIsMenuOpen(false)} 
                className="block p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-gray-50"
              >
                🔐 Iniciar Sesión
              </a>
              <a 
                href="/registrarse" 
                onClick={() => setIsMenuOpen(false)} 
                className="block p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-gray-50"
              >
                ✨ Registrarse
              </a>
              <a 
                href="/proptech" 
                onClick={() => setIsMenuOpen(false)} 
                className="group relative flex items-center justify-center gap-2 p-4 text-white bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 rounded-xl text-center font-bold shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <BoltIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Descubrir PropTech</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante para ir al inicio */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-[9999] bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        aria-label="Ir al inicio"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </>
  );
};

export default Header;


