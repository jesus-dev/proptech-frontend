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
    <section id="demo" className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100">
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
            Demostración en vivo
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Ve Proptech CRM{' '}
            <span className="bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
              en acción
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Descubre cómo funciona nuestro CRM con una demostración interactiva 
            y ve por qué más de 500 agentes confían en nosotros. Configuración en menos de 5 minutos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Video Demo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Video Container */}
            <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              {!isVideoPlaying ? (
                <div className="aspect-video bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center relative">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-50" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}></div>
                  
                  <button
                    onClick={() => setIsVideoPlaying(true)}
                    className="group relative flex items-center justify-center w-24 h-24 bg-gradient-to-r from-brand-600 to-brand-700 rounded-full hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-brand-500/50"
                  >
                    {React.createElement(PlayIcon, { className: "w-10 h-10 text-white ml-1 group-hover:text-white" })}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </button>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-gradient-to-r from-brand-600 to-brand-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <PlayIcon className="w-10 h-10" />
                    </div>
                    <p className="text-2xl font-bold mb-2">Demo Interactiva</p>
                    <p className="text-brand-300 text-lg">Próximamente disponible</p>
                  </div>
                </div>
              )}

              {/* Video Overlay Info */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2 text-white text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>En vivo</span>
                  </div>
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                  <span className="text-white text-sm">5:30</span>
                </div>
              </div>
            </div>

            {/* Demo Features */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{feature}</span>
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
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Configuración paso a paso
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Te guiamos a través de la configuración inicial para que tengas 
                tu CRM funcionando en menos de 10 minutos. Diseñado para ser intuitivo y rápido.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              {demoSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.step}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xl font-bold text-gray-900">
                        {step.title}
                      </h4>
                      <span className="text-sm font-semibold text-brand-600 bg-brand-100 px-3 py-1 rounded-full">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed">
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
              <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 rounded-3xl p-8 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
                
                <div className="relative">
                  <h4 className="text-2xl font-bold mb-3">
                    ¿Listo para comenzar?
                  </h4>
                  <p className="text-brand-100 mb-6 text-lg">
                    Prueba Proptech CRM gratis por 14 días. Sin tarjeta de crédito requerida.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-700 rounded-xl hover:bg-gray-100 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105">
                      Comenzar Prueba Gratis
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </button>
                    <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-brand-700 transition-all duration-300 font-bold text-lg">
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
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl font-bold text-brand-600 mb-3">98%</div>
            <div className="text-gray-600 text-lg font-medium">Satisfacción del cliente</div>
          </div>
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl font-bold text-brand-600 mb-3">5 min</div>
            <div className="text-gray-600 text-lg font-medium">Tiempo promedio de configuración</div>
          </div>
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl font-bold text-brand-600 mb-3">24/7</div>
            <div className="text-gray-600 text-lg font-medium">Soporte disponible</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;


