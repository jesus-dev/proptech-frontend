"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  HomeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  CloudIcon,
  ClockIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { PROPTECH_STATS, PROPTECH_STATS_COPY } from './constants/proptechStats';

const FeaturesSection = () => {
  const features = [
    {
      icon: HomeIcon,
      title: 'Gestión de Propiedades',
      description: 'Carga, edita y organiza todas tus propiedades con fotos, videos y detalles completos.',
      benefits: ['Catálogo visual', 'Filtros avanzados', 'Estados personalizados', 'Exportación de datos'],
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: UserGroupIcon,
      title: 'CRM de Clientes',
      description: 'Mantén un registro completo de tus clientes con historial de interacciones y preferencias.',
      benefits: ['Perfiles detallados', 'Historial de contacto', 'Segmentación', 'Automatización'],
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: CalendarDaysIcon,
      title: 'Agenda Inteligente',
      description: 'Programa y gestiona citas con recordatorios automáticos y sincronización de calendarios.',
      benefits: ['Recordatorios SMS', 'Sincronización', 'Disponibilidad', 'Notificaciones'],
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: ChartBarIcon,
      title: 'Reportes y Analytics',
      description: 'Analiza el rendimiento de tu negocio con reportes detallados y métricas en tiempo real.',
      benefits: ['Dashboard personalizable', 'Métricas de ventas', 'Análisis de clientes', 'Exportación'],
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: DocumentTextIcon,
      title: 'Documentos Digitales',
      description: 'Genera contratos, propuestas y documentos automáticamente con plantillas personalizables.',
      benefits: ['Plantillas editables', 'Firma digital', 'Almacenamiento seguro', 'Versionado'],
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: CogIcon,
      title: 'Automatización',
      description: 'Automatiza tareas repetitivas y flujos de trabajo para maximizar tu productividad.',
      benefits: ['Flujos personalizados', 'Triggers automáticos', 'Integraciones', 'Notificaciones'],
      gradient: 'from-teal-500 to-blue-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Seguridad Avanzada',
      description: 'Tus datos están protegidos con encriptación de grado bancario y respaldos automáticos.',
      benefits: ['Encriptación SSL', 'Respaldos diarios', 'Acceso controlado', 'Cumplimiento GDPR'],
      gradient: 'from-emerald-500 to-green-500'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'App Móvil',
      description: 'Accede a tu CRM desde cualquier lugar con nuestra aplicación móvil nativa.',
      benefits: ['Sincronización offline', 'Notificaciones push', 'Cámara integrada', 'GPS'],
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: CloudIcon,
      title: 'En la Nube',
      description: 'Sin instalaciones complicadas. Accede desde cualquier dispositivo con conexión a internet.',
      benefits: ['Acceso universal', 'Actualizaciones automáticas', 'Escalabilidad', 'Disponibilidad 99.9%'],
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      icon: ClockIcon,
      title: 'Soporte 24/7',
      description: 'Nuestro equipo de soporte está disponible las 24 horas para ayudarte cuando lo necesites.',
      benefits: ['Chat en vivo', 'Email prioritario', 'Videollamadas', 'Base de conocimiento'],
      gradient: 'from-violet-500 to-purple-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8
      }
    }
  };

  return (
    <section id="features" className="py-32 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Beautiful Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/5 via-purple-500/5 to-pink-400/5"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-400/5 to-cyan-400/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 text-blue-700 text-sm font-bold mb-8 shadow-sm">
            <SparklesIcon className="w-5 h-5 mr-2" />
            Características principales
          </div>
          
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8">
            <span className="text-gray-900">Todo lo que necesitas para </span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              triunfar
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Una plataforma completa que integra todas las herramientas necesarias 
            para gestionar tu negocio inmobiliario de manera eficiente y profesional.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:border-blue-200/50 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-4 overflow-hidden"
            >
              {/* Beautiful Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-700`}></div>
              
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-700 -z-10`}></div>
              
              {/* Floating Particles */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-ping"></div>
              <div className="absolute top-8 right-8 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 animate-ping"></div>
              
              {/* Icon Container */}
              <div className="relative mb-6">
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 relative overflow-hidden`}>
                  <feature.icon className="w-10 h-10 text-white relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-500">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-base">
                  {feature.description}
                </p>

                {/* Benefits */}
                <ul className="space-y-3">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center group/item">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform duration-300">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 group-hover/item:text-gray-900 transition-colors duration-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hover Arrow */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-x-2 group-hover:translate-y-1">
                <div className={`w-10 h-10 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-24"
        >
          <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-16 text-white relative overflow-hidden border border-blue-500/20">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400 via-transparent to-purple-600 animate-pulse"></div>
            </div>
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            
            <div className="relative">
              <div className="inline-block px-6 py-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-bold mb-8">
                <RocketLaunchIcon className="w-5 h-5 inline mr-2" />
                Empieza hoy
              </div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                ¿Listo para revolucionar tu negocio?
              </h3>
              <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                Únete a {PROPTECH_STATS_COPY.agents.headline} que ya están aumentando
                sus ventas con Proptech CRM. Comienza tu prueba gratuita hoy mismo.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                {PROPTECH_STATS.map((stat) => (
                  <div key={stat.key} className="text-center group/stat">
                    <div className="text-4xl font-bold text-white mb-2 group-hover/stat:scale-110 transition-transform duration-300">
                      {stat.value}
                    </div>
                    <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-2xl hover:bg-gray-100 transition-all duration-300 font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105">
                  Ver Demo Gratis
                  <span className="ml-2">🎬</span>
                </button>
                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-2xl hover:bg-white hover:text-gray-900 transition-all duration-300 font-bold text-base">
                  Hablar con un Experto
                  <span className="ml-2">💬</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;