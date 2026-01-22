"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  NewspaperIcon, 
  CalendarIcon, 
  DocumentTextIcon, 
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
    },
    {
      name: 'Blog',
      href: '/cms/blog',
      icon: NewspaperIcon,
    },
    {
      name: 'Contenido',
      href: '/cms/content',
      icon: CalendarIcon,
    },
    {
      name: 'Páginas',
      href: '/cms/pages',
      icon: DocumentTextIcon,
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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dash"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-md transition-colors text-sm"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Volver</span>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">CMS</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CMS Navigation - Simple Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
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
                    flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap text-sm font-medium
                    ${active 
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
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

