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
  ClockIcon
} from '@heroicons/react/24/outline';

const FeaturesSection = () => {
  const features = [
    {
      icon: HomeIcon,
      title: 'Gestión de Propiedades',
      description: 'Carga, edita y organiza todas tus propiedades con fotos, videos y detalles completos.',
      benefits: ['Catálogo visual', 'Filtros avanzados', 'Estados personalizados', 'Exportación de datos']
    },
    {
      icon: UserGroupIcon,
      title: 'CRM de Clientes',
      description: 'Mantén un registro completo de tus clientes con historial de interacciones y preferencias.',
      benefits: ['Perfiles detallados', 'Historial de contacto', 'Segmentación', 'Automatización']
    },
    {
      icon: CalendarDaysIcon,
      title: 'Agenda Inteligente',
      description: 'Programa y gestiona citas con recordatorios automáticos y sincronización de calendarios.',
      benefits: ['Recordatorios SMS', 'Sincronización', 'Disponibilidad', 'Notificaciones']
    },
    {
      icon: ChartBarIcon,
      title: 'Reportes y Analytics',
      description: 'Analiza el rendimiento de tu negocio con reportes detallados y métricas en tiempo real.',
      benefits: ['Dashboard personalizable', 'Métricas de ventas', 'Análisis de clientes', 'Exportación']
    },
    {
      icon: DocumentTextIcon,
      title: 'Documentos Digitales',
      description: 'Genera contratos, propuestas y documentos automáticamente con plantillas personalizables.',
      benefits: ['Plantillas editables', 'Firma digital', 'Almacenamiento seguro', 'Versionado']
    },
    {
      icon: CogIcon,
      title: 'Automatización',
      description: 'Automatiza tareas repetitivas y flujos de trabajo para maximizar tu productividad.',
      benefits: ['Flujos personalizados', 'Triggers automáticos', 'Integraciones', 'Notificaciones']
    },
    {
      icon: ShieldCheckIcon,
      title: 'Seguridad Avanzada',
      description: 'Tus datos están protegidos con encriptación de grado bancario y respaldos automáticos.',
      benefits: ['Encriptación SSL', 'Respaldos diarios', 'Acceso controlado', 'Cumplimiento GDPR']
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'App Móvil',
      description: 'Accede a tu CRM desde cualquier lugar con nuestra aplicación móvil nativa.',
      benefits: ['Sincronización offline', 'Notificaciones push', 'Cámara integrada', 'GPS']
    },
    {
      icon: CloudIcon,
      title: 'En la Nube',
      description: 'Sin instalaciones complicadas. Accede desde cualquier dispositivo con conexión a internet.',
      benefits: ['Acceso universal', 'Actualizaciones automáticas', 'Escalabilidad', 'Disponibilidad 99.9%']
    },
    {
      icon: ClockIcon,
      title: 'Soporte 24/7',
      description: 'Nuestro equipo de soporte está disponible las 24 horas para ayudarte cuando lo necesites.',
      benefits: ['Chat en vivo', 'Email prioritario', 'Videollamadas', 'Base de conocimiento']
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-brand-500 rounded-full mr-2"></span>
            Características principales
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Todo lo que necesitas para{' '}
            <span className="bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
              triunfar
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Una plataforma completa que integra todas las herramientas necesarias 
            para gestionar tu negocio inmobiliario de manera eficiente y profesional.
            Diseñada específicamente para el mercado paraguayo.
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
              className="group relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-brand-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-50/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Icon */}
              <div className="relative w-16 h-16 bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                <feature.icon className="w-8 h-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-brand-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                  {feature.description}
                </p>

                {/* Benefits */}
                <ul className="space-y-3">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      <div className="w-2 h-2 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Decorative Element */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-brand-100 to-brand-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="relative bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 rounded-3xl p-12 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            
            <div className="relative">
              <h3 className="text-4xl font-bold text-white mb-6">
                ¿Listo para revolucionar tu negocio?
              </h3>
              <p className="text-xl text-brand-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                Únete a más de 500 agentes inmobiliarios que ya están aumentando 
                sus ventas con Proptech CRM. Comienza tu prueba gratuita hoy mismo.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">500+</div>
                  <div className="text-brand-200">Agentes activos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">10K+</div>
                  <div className="text-brand-200">Propiedades gestionadas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">98%</div>
                  <div className="text-brand-200">Satisfacción del cliente</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center px-10 py-4 bg-white text-brand-700 rounded-xl hover:bg-gray-100 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  Ver Demo Gratis
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center px-10 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-brand-700 transition-all duration-300 font-bold text-lg"
                >
                  Hablar con un Experto
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;


