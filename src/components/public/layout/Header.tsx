"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
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
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
    };
    
    // Verificar estado inicial
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass shadow-modern-lg border-b border-white/20 dark:border-gray-600/20' : 'bg-transparent'
      }`}
      data-scrolled={isScrolled}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center group">
            <img
              src="/proptech.png"
              alt="Proptech Logo"
              className="h-10 w-auto transition-all duration-300 group-hover:scale-105"
              style={!isScrolled ? {
                filter: 'brightness(0) invert(1)',
                WebkitFilter: 'brightness(0) invert(1)'
              } : {}}
            />
            <span className={`ml-3 text-xl font-bold transition-colors duration-300 ${
              shouldUseWhiteText ? 'text-white' : 'text-gray-900'
            }`}>
              PropTech
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
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
                      className={`transition-all duration-300 font-medium flex items-center px-3 py-2 rounded-lg hover:bg-opacity-10 ${
                        shouldUseWhiteText
                          ? 'text-white hover:text-white hover:bg-white'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
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
                              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-lg mx-2"
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
                    className={`transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-opacity-10 ${
                      shouldUseWhiteText
                        ? 'text-white hover:text-white hover:bg-white'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
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
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${
              shouldUseWhiteText
                ? 'text-white hover:text-white/90 hover:bg-white/10'
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`lg:hidden border-t ${
                isScrolled
                  ? 'bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl'
                  : 'bg-black/90 backdrop-blur-md border-white/20'
              }`}
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.submenu ? (
                      <div>
                        <div
                          className={`block px-4 py-3 rounded-lg transition-all duration-300 font-medium cursor-pointer ${
                            isScrolled
                              ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                              : 'text-white hover:text-white hover:bg-white/10'
                          }`}
                          onClick={() => setActiveSubmenu(activeSubmenu === item.name ? null : item.name)}
                        >
                          {item.name}
                          <span className="float-right">
                            {activeSubmenu === item.name ? '−' : '+'}
                          </span>
                        </div>
                        {activeSubmenu === item.name && (
                          <div className="ml-4 space-y-1">
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`block px-6 py-2.5 rounded-lg transition-all duration-300 text-sm ${
                                  isScrolled
                                    ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
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
                        className={`block px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                          isScrolled
                            ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                            : 'text-white hover:text-white hover:bg-white/10'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
                <div className="pt-4 px-2">
                  <Link
                    href="/login"
                    className={`w-full inline-flex justify-center px-4 py-3 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                      isScrolled
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                        : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ingresar al CRM
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;


