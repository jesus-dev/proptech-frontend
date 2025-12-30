"use client";

import React from 'react';
import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeSubmenu: string | null;
  setActiveSubmenu: (submenu: string | null) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, activeSubmenu, setActiveSubmenu }) => {
  const navigation = [
    { name: 'Inicio', href: '/' },
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

  if (!isOpen) return null;

  return (
    <div 
      className="lg:hidden fixed inset-0 z-50 bg-black/50" 
      onClick={onClose}
    >
      <div 
        className="fixed top-0 right-0 w-80 h-full bg-white shadow-xl overflow-y-auto overscroll-contain mobile-menu-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: '#3b82f6 #f1f5f9'
        }}
      >
        <div className="px-6 py-8">
          {/* Header con botón cerrar */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Menú</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-2xl text-gray-500 hover:text-gray-700">✕</span>
            </button>
          </div>
          
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
                            onClick={onClose}
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
                    onClick={onClose}
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
            <Link href="/login" className="flex items-center justify-center py-3 px-6 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300" onClick={onClose}>
              <span className="font-medium">Iniciar Sesión</span>
            </Link>
            <Link href="/register" className="flex items-center justify-center py-3 px-6 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300" onClick={onClose}>
              <span className="font-medium">Registrarse</span>
            </Link>
            <Link href="/proptech" className="flex items-center justify-center py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg" onClick={onClose}>
              <span className="mr-2">✨</span>
              <span className="font-semibold">Descubrir PropTech</span>
            </Link>
          </div>
          
          <div className="mt-6 text-center">
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
            >
              Cerrar menú
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
