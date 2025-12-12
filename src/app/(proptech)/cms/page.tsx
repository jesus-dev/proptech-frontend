"use client";

import React from 'react';
import Link from 'next/link';
import { 
  NewspaperIcon, 
  CalendarIcon, 
  DocumentTextIcon, 
  PhotoIcon,
  ChartBarIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

export default function CMSPage() {
  const modules = [
    {
      title: 'Blog',
      description: 'Gestiona artículos y contenido del blog',
      icon: NewspaperIcon,
      href: '/cms/blog',
      color: 'from-blue-500 to-blue-600',
      stats: { label: 'Posts', value: '--' }
    },
    {
      title: 'Gestor de Contenido',
      description: 'Administra eventos, actividades y galerías de fotos',
      icon: CalendarIcon,
      href: '/cms/content',
      color: 'from-purple-500 to-purple-600',
      stats: { label: 'Eventos & Álbumes', value: '--' }
    },
    {
      title: 'Páginas Web',
      description: 'Crea y edita páginas personalizadas',
      icon: DocumentTextIcon,
      href: '/cms/pages',
      color: 'from-green-500 to-green-600',
      stats: { label: 'Páginas', value: '--' }
    },
    {
      title: 'Galería de Medios',
      description: 'Administra imágenes y archivos multimedia',
      icon: PhotoIcon,
      href: '/cms/media',
      color: 'from-orange-500 to-orange-600',
      stats: { label: 'Archivos', value: '--' }
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestor de Contenido Web
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra el contenido de tu sitio web público como WordPress
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Publicado</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">--</p>
            </div>
            <ChartBarIcon className="w-10 h-10 text-brand-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Borradores</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">--</p>
            </div>
            <PencilSquareIcon className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Próximos Eventos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">--</p>
            </div>
            <CalendarIcon className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Archivos Multimedia</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">--</p>
            </div>
            <PhotoIcon className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.href}
              href={module.href}
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-105"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative p-6">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {module.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {module.stats.label}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {module.stats.value}
                  </span>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-6 right-6 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <svg className={`w-6 h-6 text-transparent bg-gradient-to-br ${module.color} bg-clip-text`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-100 mb-2">
          💡 Gestor de Contenido Integrado
        </h3>
        <p className="text-brand-800 dark:text-brand-200">
          Este módulo te permite administrar todo el contenido de tu sitio web público sin necesidad de herramientas externas. 
          Similar a WordPress pero integrado directamente en tu CRM inmobiliario.
        </p>
      </div>
    </div>
  );
}

