"use client";
import React from 'react';
import Image from 'next/image';
const ImageComponent = Image as any;

const AcercaDePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">


        {/* Logo Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="mb-6">
              <ImageComponent
                src="/images/logo/proptech.png"
                alt="Proptech CRM"
                width={300}
                height={88}
                style={{ width: 'auto', height: 'auto' }}
                className="mx-auto"
              />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Proptech: fácil, completo y a tu medida
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
            PropTech es un sistema integral de gestión inmobiliaria diseñado para agentes, corredores, desarrolladores y asociaciones que desean automatizar, controlar y escalar su negocio desde una sola plataforma.
            <br/>Desde la carga de propiedades hasta el cierre de ventas, todo en un solo lugar.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Gestión de Propiedades
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Administra propiedades, fotos, detalles y estados de manera eficiente con nuestro sistema integral.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Pipeline de Ventas
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Gestiona leads, oportunidades y cierre de ventas con nuestro pipeline visual y analytics avanzados.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Analytics Avanzados
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Obtén insights valiosos con reportes detallados, métricas de rendimiento y análisis de tendencias.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Gestión de Visitas
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Programa y gestiona visitas a propiedades con calendario integrado y seguimiento de clientes.
            </p>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Información del Sistema
          </h3>
          
          {/* Version Info */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Versión del Sistema</h4>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-1">Versión Actual</h5>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">1.2.0</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Beta Release</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-1">Build</h5>
                <p className="text-lg font-mono text-gray-700 dark:text-gray-300">#2024.12.01</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Diciembre 2024</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-1">Estado</h5>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Activo
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sistema Operativo</p>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Stack Tecnológico</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Frontend
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Next.js</span>
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">14.0.4</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">React</span>
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">18.2.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">TypeScript</span>
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">5.3.3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Tailwind CSS</span>
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">3.4.0</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  Backend
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Quarkus</span>
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">3.6.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Java</span>
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">17.0.9</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">PostgreSQL</span>
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">15.5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Hibernate</span>
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">6.3.1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Features */}
          <div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Características del Sistema</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">Autenticación JWT</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">API RESTful</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">Responsive Design</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">Dark/Light Mode</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">Upload de Archivos</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">Notificaciones en Tiempo Real</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} Proptech. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcercaDePage; 