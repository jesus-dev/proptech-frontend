"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, PlayIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const DemoSection = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const demoSteps = [
    {
      step: 1,
      title: 'Configuración en 5 minutos',
      description: 'Regístrate y configura tu cuenta con información básica de tu negocio.',
      duration: '2 min'
    },
    {
      step: 2,
      title: 'Importa tus propiedades',
      description: 'Sube fotos, videos y detalles de tus propiedades existentes.',
      duration: '3 min'
    },
    {
      step: 3,
      title: 'Agrega tus clientes',
      description: 'Importa tu lista de clientes o agrégalos uno por uno.',
      duration: '2 min'
    },
    {
      step: 4,
      title: 'Programa tu primera cita',
      description: 'Usa la agenda para programar visitas y seguimientos.',
      duration: '1 min'
    },
    {
      step: 5,
      title: '¡Comienza a vender!',
      description: 'Ya tienes todo listo para gestionar tu negocio eficientemente.',
      duration: 'Ongoing'
    }
  ];

  const features = [
    'Dashboard personalizable',
    'Gestión de propiedades visual',
    'CRM de clientes completo',
    'Agenda inteligente',
    'Reportes en tiempo real',
    'App móvil incluida'
  ];

  return (
    <section id="demo" className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/30 to-slate-600/20"></div>
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-indigo-500/20 to-slate-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border-2 border-blue-400/50 text-white text-base font-bold mb-6 backdrop-blur-sm shadow-2xl"
          >
            <span className="w-3 h-3 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
            Demostración en vivo
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight"
          >
            <span className="block">Ve Proptech CRM</span>
            <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-slate-400 bg-clip-text text-transparent">
              en acción
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed"
          >
            Conoce las funcionalidades clave de nuestro CRM a través de una{' '}
            <span className="text-blue-300 font-bold">demostración interactiva</span>{' '}
            y descubre cómo puede impulsar tu equipo inmobiliario.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left Column - Video Demo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Video Container */}
            <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 group">
              {!isVideoPlaying ? (
                <div className="aspect-video bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center relative">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}></div>
                  
                  <button
                    onClick={() => setIsVideoPlaying(true)}
                    className="group/play relative flex items-center justify-center w-20 h-20 bg-gradient-to-r from-brand-500 to-brand-700 rounded-full hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-brand-500/50"
                  >
                    <PlayIcon className="w-8 h-8 text-white ml-1" />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-600 rounded-full opacity-0 group-hover/play:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  
                  {/* Video Title */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-3">
                      <h4 className="text-white font-bold text-lg mb-1">Demo de Proptech CRM</h4>
                      <p className="text-gray-300 text-sm">Ve todas las características en acción</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <PlayIcon className="w-6 h-6" />
                    </div>
                    <p className="text-xl font-bold mb-2">Demo Interactiva</p>
                    <p className="text-brand-300">Próximamente disponible</p>
                  </div>
                </div>
              )}

              {/* Video Overlay Info */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2 text-white text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">En vivo</span>
                  </div>
                </div>
                <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                  <span className="text-white text-sm font-medium">5:30</span>
                </div>
              </div>
              
              {/* Play Button Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-brand-400/10 to-brand-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Demo Features */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group/feature flex items-center space-x-3 p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-brand-300 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover/feature:scale-110 transition-transform duration-300">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover/feature:text-brand-700 transition-colors">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Demo Steps */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-white mb-4 sm:mb-6">
                Configuración paso a paso
              </h3>
              <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
                Te guiamos a través de la configuración inicial para que tengas 
                tu CRM funcionando en menos de 10 minutos.{' '}
                <span className="text-blue-300 font-bold">Diseñado para ser intuitivo y rápido.</span>
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4 sm:space-y-6">
              {demoSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 sm:space-x-6 p-6 sm:p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-2xl">
                    {step.step}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3">
                      <h4 className="text-xl sm:text-2xl font-black text-white">
                        {step.title}
                      </h4>
                      <span className="text-sm sm:text-base font-bold text-blue-300 bg-blue-500/20 px-4 py-2 rounded-full self-start sm:self-auto border border-blue-400/30">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-white/90 text-lg sm:text-xl leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="pt-6"
            >
              <div className="bg-gradient-to-br from-gray-900 via-brand-900 to-gray-900 rounded-3xl p-8 text-white relative overflow-hidden border border-brand-500/20">
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-400 via-transparent to-brand-600 animate-pulse"></div>
                </div>
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
                
                <div className="relative">
                  <div className="inline-block px-4 py-2 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-sm font-bold mb-4">
                    🚀 Comienza gratis
                  </div>
                  <h4 className="text-2xl font-bold mb-3">
                    ¿Listo para comenzar?
                  </h4>
                  <p className="text-gray-300 mb-6 text-base">
                    Prueba Proptech CRM gratis por 14 días. Sin tarjeta de crédito requerida.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="inline-flex items-center justify-center px-6 py-3 bg-white text-brand-700 rounded-xl hover:bg-gray-100 transition-all duration-300 font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105">
                      Comenzar Prueba Gratis
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </button>
                    <button className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white rounded-xl hover:bg-white hover:text-brand-700 transition-all duration-300 font-bold text-base">
                      Ver Demo Completa
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="group text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
            <div className="text-5xl font-black text-white mb-4 group-hover:scale-110 transition-transform duration-300">98%</div>
            <div className="text-white/90 text-lg font-bold">Satisfacción del cliente</div>
          </div>
          <div className="group text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
            <div className="text-5xl font-black text-white mb-4 group-hover:scale-110 transition-transform duration-300">5 min</div>
            <div className="text-white/90 text-lg font-bold">Tiempo promedio de configuración</div>
          </div>
          <div className="group text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
            <div className="text-5xl font-black text-white mb-4 group-hover:scale-110 transition-transform duration-300">24/7</div>
            <div className="text-white/90 text-lg font-bold">Soporte disponible</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;


