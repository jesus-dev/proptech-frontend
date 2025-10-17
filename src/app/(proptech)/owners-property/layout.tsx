'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Home, 
  FileText, 
  BarChart3,
  Settings
} from 'lucide-react';

// Type assertion to resolve JSX compatibility issues
const LinkComponent = Link as any;

const navigation = [
  { name: 'Dashboard', href: '/owners-property', icon: BarChart3 },
  { name: 'Propietarios', href: '/owners-property/owners', icon: Users },
  { name: 'Propiedades', href: '/owners-property/properties', icon: Home },
  { name: 'Reportes', href: '/owners-property/reports', icon: FileText },
];

export default function OwnersPropertyLayout({ children }: any) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header principal modernizado */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg shadow-sm">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg md:text-xl font-semibold text-gray-900">
                Gestión de Propiedades de Propietarios
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de navegación modernos */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <LinkComponent
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`w-4 h-4 mr-2 ${isActive ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline">{item.name}</span>
                  <span className="sm:hidden">{item.name.split(' ')[0]}</span>
                </LinkComponent>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
