"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { PROPTECH_STATS } from './constants/proptechStats';

const HeroSection = () => {
  const stats = [
    ...PROPTECH_STATS,
    { key: 'support' as const, value: '24/7', label: 'Soporte disponible' },
  ];
  const agentsStat = PROPTECH_STATS.find((stat) => stat.key === 'agents');

  const features = [
    'Gestión completa de propiedades',
    'CRM integrado para agentes',
    'Reportes en tiempo real',
    'App móvil incluida'
  ];

  const handleScrollTo = (id: string) => {
    if (typeof document === 'undefined') return;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 overflow-hidden w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-8 sm:-mt-10 md:-mt-12 lg:-mt-16">
      {/* Patrón de cuadrícula de bienes raíces */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="property-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect width="80" height="80" fill="none" stroke="cyan" strokeWidth="0.5" opacity="0.3"/>
              <rect x="10" y="10" width="60" height="45" fill="none" stroke="cyan" strokeWidth="0.3" opacity="0.4" rx="2"/>
              <rect x="15" y="45" width="10" height="8" fill="cyan" opacity="0.2"/>
              <rect x="30" y="45" width="8" height="8" fill="cyan" opacity="0.2"/>
              <rect x="45" y="45" width="8" height="8" fill="cyan" opacity="0.2"/>
              <rect x="20" y="20" width="15" height="10" fill="none" stroke="cyan" strokeWidth="0.2" opacity="0.3"/>
              <rect x="45" y="20" width="15" height="10" fill="none" stroke="cyan" strokeWidth="0.2" opacity="0.3"/>
              <circle cx="25" cy="65" r="1.5" fill="cyan" opacity="0.3"/>
              <circle cx="55" cy="65" r="1.5" fill="cyan" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#property-grid)" />
        </svg>
      </div>
      
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-4 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-32 sm:top-40 right-4 sm:right-20 w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-16 sm:bottom-20 left-1/4 w-20 h-20 sm:w-24 sm:h-24 bg-cyan-300/20 rounded-full blur-xl animate-bounce"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10 lg:pt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 text-white text-sm font-semibold mb-8 backdrop-blur-sm"
            >
              <RocketLaunchIcon className="w-5 h-5 mr-2" />
              El CRM más avanzado para asesores inmobiliarios
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-tight"
            >
              Gestiona tu negocio{' '}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-slate-400 bg-clip-text text-transparent">
                inmobiliario
              </span>{' '}
              como un profesional
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-white mb-12 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              La plataforma más completa para agentes inmobiliarios. 
              Gestiona propiedades, clientes y ventas desde un solo lugar.
            </motion.p>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-center lg:justify-start">
                  <CheckCircleIcon className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-white font-medium">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button
                type="button"
                onClick={() => handleScrollTo('contact-form')}
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
              >
                Comenzar Gratis
                <ArrowRightIcon className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <button
                type="button"
                onClick={() => handleScrollTo('demo')}
                className="group inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <PlayIcon className="w-6 h-6 mr-2" />
                Ver Demo
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
            >
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarIcon key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="ml-3 text-white font-medium">
                4.9/5 de {agentsStat?.value ?? '50+'} agentes
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            {/* Main Dashboard Mockup */}
            <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
                  <span className="text-white font-bold text-lg">Proptech CRM</span>
                </div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-400/30">
                    <div className="text-2xl font-bold text-white mb-1">24</div>
                    <div className="text-white text-sm">Propiedades Activas</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 border border-purple-400/30">
                    <div className="text-2xl font-bold text-white mb-1">156</div>
                    <div className="text-white text-sm">Clientes</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-white font-bold mb-4">Actividad Reciente</h3>
                  <div className="space-y-3">
                    {[
                      { icon: '🏠', text: 'Nueva propiedad agregada', time: '2 min' },
                      { icon: '📞', text: 'Llamada programada', time: '15 min' },
                      { icon: '📧', text: 'Email enviado a cliente', time: '1 hora' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{activity.icon}</span>
                          <span className="text-white text-sm">{activity.text}</span>
                        </div>
                        <span className="text-white text-xs">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <span className="text-white text-2xl">📈</span>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <span className="text-white text-xl">💰</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-white font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;