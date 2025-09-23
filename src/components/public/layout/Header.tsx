"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  const isProptechPage = pathname === '/proptech' || pathname === '/proptech/';
  const isPropiedadesPage = pathname === '/propiedades' || pathname === '/propiedades/';
  const isContactPage = pathname === '/contact' || pathname === '/contact/';
  const isHomePage = pathname === '/';
  const hasBlueHero = isPropiedadesPage || isHomePage || isProptechPage || isContactPage;
  
  
  // Determinar el color del texto basado en si no hay scroll
  const shouldUseWhiteText = !isScrolled;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      
      // COMENTADO TEMPORALMENTE - NO CERRAR MENU AL SCROLL
      // if (isMenuOpen) {
      //   setIsMenuOpen(false);
      //   setActiveSubmenu(null);
      // }
    };
    
    // Verificar estado inicial
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]);

  const navigation = [
    { name: 'Inicio', href: '/' },
    {
      name: 'Propiedades',
      href: '/propiedades',
      submenu: [
        { name: 'Todas las Propiedades', href: '/propiedades' },
        { name: 'Ventas', href: '/propiedades?tipo=venta' },
        { name: 'Alquiler', href: '/propiedades?tipo=alquiler' },
        { name: 'Departamentos', href: '/propiedades?categoria=apartamento' },
        { name: 'Casas', href: '/propiedades?categoria=casa' },
        { name: 'Proyectos/Desarrollos', href: '/proyectos' }
      ]
    },
    { name: 'Asesores', href: '/asesores' },
    { name: 'Contacto', href: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700'
            : 'bg-transparent'
        }`}
        data-scrolled={isScrolled}
      >
        <nav className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between h-14 sm:h-16 py-1">
            <Link href="/" className="flex items-center justify-start" aria-label="Inicio PropTech">
              <img
                src="/proptech.png"
                alt="PropTech"
                className="w-auto transition-transform duration-300 hover:scale-205"
                style={!isScrolled ? {
                  filter: 'brightness(0) invert(1)',
                  WebkitFilter: 'brightness(0) invert(1)',
                  height: '45px',
                  maxHeight: '45px'
                } : {
                  height: '45px',
                  maxHeight: '45px'
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
                href="/register"
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
                className={`px-6 py-2.5 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  isScrolled
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                    : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
                }`}
              >
                Descubrir PropTech
              </Link>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('BOTON CLICKEADO - Estado actual:', isMenuOpen);
                setIsMenuOpen(!isMenuOpen);
                console.log('NUEVO ESTADO DEBERIA SER:', !isMenuOpen);
              }}
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
          
          {/* MENU MOBILE ELEGANTE */}
          {isMenuOpen ? (
            <div 
              className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg shadow-2xl border-t border-white/20"
              style={{ zIndex: 999999999 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-8">
                <nav className="space-y-1">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      {item.submenu ? (
                        <div>
                          <div
                            className="flex items-center justify-between py-4 px-4 text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 cursor-pointer"
                            onClick={() => setActiveSubmenu(activeSubmenu === item.name ? null : item.name)}
                          >
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                                <span className="text-green-600 text-lg">🏘️</span>
                              </div>
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <span className="text-gray-400 text-lg">
                              {activeSubmenu === item.name ? '−' : '+'}
                            </span>
                          </div>
                          {activeSubmenu === item.name && (
                            <div className="ml-6 mt-2 space-y-1">
                              {item.submenu.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className="block py-3 px-4 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link 
                          href={item.href} 
                          className="group flex items-center py-4 px-4 text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300" 
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                            <span className="text-blue-600 text-lg">
                              {item.name === 'Inicio' && '🏠'}
                              {item.name === 'Asesores' && '👥'}
                              {item.name === 'Contacto' && '📞'}
                            </span>
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
                
                <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
                  <Link href="/login" className="flex items-center justify-center py-3 px-6 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300" onClick={() => setIsMenuOpen(false)}>
                    <span className="font-medium">Iniciar Sesión</span>
                  </Link>
                  <Link href="/register" className="flex items-center justify-center py-3 px-6 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300" onClick={() => setIsMenuOpen(false)}>
                    <span className="font-medium">Registrarse</span>
                  </Link>
                  <Link href="/proptech" className="flex items-center justify-center py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg" onClick={() => setIsMenuOpen(false)}>
                    <span className="mr-2">✨</span>
                    <span className="font-semibold">Descubrir PropTech</span>
                  </Link>
                </div>
                
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
                  >
                    Cerrar menú
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </nav>
      </header>
    </>
  );
};

export default Header;


