"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  NewspaperIcon, 
  CalendarIcon, 
  DocumentTextIcon, 
  PhotoIcon,
  Squares2X2Icon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Panel CMS',
      href: '/cms',
      icon: Squares2X2Icon,
      description: 'Vista general'
    },
    {
      name: 'Blog',
      href: '/cms/blog',
      icon: NewspaperIcon,
      description: 'Artículos'
    },
    {
      name: 'Gestor de Contenido',
      href: '/cms/content',
      icon: CalendarIcon,
      description: 'Eventos, Actividades y Galerías'
    },
    {
      name: 'Páginas',
      href: '/cms/pages',
      icon: DocumentTextIcon,
      description: 'Contenido'
    },
    {
      name: 'Medios',
      href: '/cms/media',
      icon: PhotoIcon,
      description: 'Galería de Archivos'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/cms') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* CMS Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dash"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Volver al CRM</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">CMS - Gestor de Contenido</h1>
                <p className="text-indigo-100 text-sm">Sistema de gestión de contenido web</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CMS Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex items-center gap-2 px-4 py-4 border-b-2 transition-all whitespace-nowrap
                    ${active 
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold' 
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    {!active && (
                      <div className="text-xs text-gray-500 dark:text-gray-500">{item.description}</div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

