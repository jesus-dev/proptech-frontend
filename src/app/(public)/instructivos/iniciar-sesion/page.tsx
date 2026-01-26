"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, CheckCircleIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export default function InstructivoIniciarSesionPage() {
  const steps = [
    {
      number: 1,
      title: "Accede a la página de inicio de sesión",
      description: "Navega a la página principal del sistema y localiza el botón o enlace de 'Iniciar Sesión'.",
      details: [
        "Busca el botón 'Iniciar Sesión' en la esquina superior derecha de la página",
        "O accede directamente a la URL de inicio de sesión si la conoces",
        "Asegúrate de estar en el sitio correcto antes de ingresar tus credenciales"
      ],
      showForm: false
    },
    {
      number: 2,
      title: "Ingresa tus credenciales",
      description: "Introduce tu correo electrónico y contraseña en los campos correspondientes.",
      details: [
        "Escribe tu correo electrónico en el campo 'Email' o 'Correo electrónico'",
        "Ingresa tu contraseña en el campo 'Contraseña' (los caracteres estarán ocultos por seguridad)",
        "Verifica que no haya errores de escritura antes de continuar"
      ],
      showForm: true
    },
    {
      number: 3,
      title: "Haz clic en 'Iniciar Sesión'",
      description: "Una vez que hayas ingresado tus credenciales correctamente, presiona el botón para acceder.",
      details: [
        "Revisa que todos los campos estén completos",
        "Haz clic en el botón 'Iniciar Sesión' o presiona Enter",
        "Espera a que el sistema valide tus credenciales"
      ],
      showForm: false
    },
    {
      number: 4,
      title: "Verifica tu acceso",
      description: "Si tus credenciales son correctas, serás redirigido al dashboard principal del sistema.",
      details: [
        "Verás el dashboard con todas las opciones disponibles según tu rol",
        "Si hay un error, revisa que tu correo y contraseña sean correctos",
        "En caso de olvido de contraseña, utiliza la opción '¿Olvidaste tu contraseña?'"
      ],
      showForm: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 min-h-[35vh] sm:min-h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        {/* Patrón de cuadrícula */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="property-grid-instructivo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="none" stroke="cyan" strokeWidth="0.5" opacity="0.3"/>
                <rect x="10" y="10" width="60" height="45" fill="none" stroke="cyan" strokeWidth="0.3" opacity="0.4" rx="2"/>
                <circle cx="20" cy="25" r="3" fill="cyan" opacity="0.3"/>
                <circle cx="35" cy="30" r="2" fill="cyan" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#property-grid-instructivo)" />
          </svg>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-300/20 rounded-full blur-xl animate-bounce"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-12 sm:pt-16 pb-6 sm:pb-8 w-full z-10">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Cómo Iniciar Sesión
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg sm:text-xl text-cyan-100 max-w-3xl mx-auto mb-8 px-4"
            >
              Guía paso a paso para acceder a tu cuenta en el sistema de manera rápida y sencilla.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white">
        {/* Back Button */}
        <Link
          href="/instructivos"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Volver a Instructivos</span>
        </Link>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Step Number and Content */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Step Number */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                        {step.number}
                      </div>
                    </div>

                    {/* Step Title and Description */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Details List */}
                  <ul className="space-y-2 ml-16">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Form Preview or Screenshot */}
                {step.showForm ? (
                  <div className="lg:w-96 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6">
                      <div className="text-center space-y-2 mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h3>
                        <p className="text-sm text-gray-500">Accede a tu panel de control</p>
                      </div>
                      <form className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 14a4 4 0 10-8 0m8 0v1a4 4 0 01-4 4H8a4 4 0 01-4-4v-1m12 0a4 4 0 00-8 0" />
                                <circle cx="12" cy="8" r="4" />
                              </svg>
                            </span>
                            <input
                              type="email"
                              disabled
                              className="w-full pl-10 pr-4 h-12 rounded-xl border-2 border-gray-300 text-gray-600 bg-gray-50 cursor-not-allowed"
                              placeholder="tu@email.com"
                              value="ejemplo@email.com"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Contraseña <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 1110 0v4" />
                              </svg>
                            </span>
                            <input
                              type="password"
                              disabled
                              className="w-full pl-10 pr-12 h-12 rounded-xl border-2 border-gray-300 text-gray-600 bg-gray-50 cursor-not-allowed"
                              placeholder="Ingresa tu contraseña"
                              value="••••••••"
                            />
                            <button
                              type="button"
                              disabled
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-not-allowed"
                              aria-label="Mostrar contraseña"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <label className="flex items-center gap-2 text-gray-700 cursor-not-allowed">
                            <input
                              type="checkbox"
                              disabled
                              className="rounded border-gray-300"
                            />
                            <span>Mantener sesión iniciada</span>
                          </label>
                          <button
                            type="button"
                            disabled
                            className="text-gray-500 cursor-not-allowed"
                          >
                            ¿Olvidaste tu contraseña?
                          </button>
                        </div>
                        <button
                          type="button"
                          disabled
                          className="w-full h-12 px-4 text-white font-semibold rounded-xl bg-gradient-to-r from-gray-800 to-gray-600 opacity-75 cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          <span>Iniciar Sesión</span>
                        </button>
                      </form>
                      <p className="text-xs text-gray-500 mt-4 text-center italic">
                        Vista previa del formulario
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Help */}
        <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
            💡 Consejos Adicionales
          </h3>
          <ul className="space-y-2 text-indigo-800 dark:text-indigo-200">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Si olvidaste tu contraseña, utiliza la opción de recuperación de contraseña disponible en la página de inicio de sesión.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Asegúrate de que tu navegador tenga las cookies habilitadas para mantener tu sesión activa.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Si experimentas problemas al iniciar sesión, verifica que tu cuenta esté activa y contacta al administrador si es necesario.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
