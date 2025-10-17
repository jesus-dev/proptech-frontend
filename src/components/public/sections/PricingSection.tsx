"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, StarIcon, SparklesIcon, PlayIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Plan Terreno',
      type: 'Básico',
      icon: '🪵',
      description: 'Perfecto para agentes independientes que están comenzando',
      subtitle: 'Ideal para empezar tu carrera inmobiliaria',
      monthlyPrice: 120000,
      annualPrice: 1152000, // 20% discount
      popular: false,
      features: [
        'Hasta 50 propiedades',
        'Hasta 100 clientes',
        'Gestión básica de contactos',
        'Reportes mensuales',
        'Soporte por email',
        'App móvil básica'
      ],
      cta: 'Comenzar gratis'
    },
    {
      name: 'Plan Casa',
      type: 'Popular',
      icon: '🏠',
      description: 'La opción más elegida por agentes profesionales',
      subtitle: 'Todo lo que necesitas para crecer tu negocio',
      monthlyPrice: 325000,
      annualPrice: 3120000, // 20% discount
      popular: true,
      features: [
        'Propiedades ilimitadas',
        'Clientes ilimitados',
        'CRM completo',
        'Agenda inteligente',
        'Reportes avanzados',
        'Integraciones',
        'Soporte prioritario',
        'App móvil completa'
      ],
      cta: 'Comenzar ahora'
    },
    {
      name: 'Plan Edificio',
      type: 'Profesional',
      icon: '🏢',
      description: 'Para inmobiliarias en crecimiento',
      subtitle: 'Potencia tu equipo y escala tu negocio',
      monthlyPrice: 650000,
      annualPrice: 6240000, // 20% discount
      popular: false,
      features: [
        'Todo del Plan Casa',
        'Multi-usuario (hasta 10)',
        'Gestión de equipos',
        'Reportes personalizados',
        'API completa',
        'Integración avanzada',
        'Soporte dedicado',
        'Capacitación incluida'
      ],
      cta: 'Contactar ventas'
    },
    {
      name: 'Plan Torre',
      type: 'Empresarial',
      icon: '🌇',
      description: 'Para grandes inmobiliarias y corporaciones',
      subtitle: 'La solución completa para empresas grandes',
      monthlyPrice: 1250000,
      annualPrice: 12000000, // 20% discount
      popular: false,
      features: [
        'Todo del Plan Edificio',
        'Usuarios ilimitados',
        'Multi-sucursal',
        'Reportes empresariales',
        'API premium',
        'Integración personalizada',
        'Gerente de cuenta',
        'Soporte 24/7'
      ],
      cta: 'Contactar ventas'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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
    <section id="pricing" className="py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
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
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-5 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 text-blue-700 text-sm font-bold mb-6 shadow-sm">
            <SparklesIcon className="w-5 h-5 mr-2" />
            Planes de precios
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
            <span className="text-gray-900">Precios </span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              transparentes
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Elige el plan que mejor se adapte a tu negocio. Sin costos ocultos, 
            sin sorpresas. Todos los planes incluyen soporte en español.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center space-x-8 mb-16">
            <span className={`text-xl font-semibold transition-colors ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Mensual
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-12 w-24 items-center rounded-full bg-gradient-to-r from-gray-200 to-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-lg"
            >
              <span
                className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  isAnnual ? 'translate-x-13' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xl font-semibold transition-colors ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Anual
            </span>
            {isAnnual && (
              <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg animate-pulse">
                🎉 Ahorra 20%
              </span>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {plans.filter((p) => p.name !== 'Plan Torre').map((plan) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              className={`relative rounded-3xl p-6 transition-all duration-700 hover:-translate-y-4 flex flex-col group ${
                plan.popular
                  ? 'bg-gradient-to-br from-blue-50 via-white to-purple-50 border-2 border-blue-300 shadow-2xl ring-4 ring-blue-200/50 ring-offset-4 scale-105'
                  : 'bg-white border-2 border-gray-200 shadow-xl hover:shadow-2xl hover:border-blue-300 hover:ring-2 hover:ring-blue-100'
              }`}
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-700 ${
                plan.popular ? 'opacity-20' : 'group-hover:opacity-10'
              } bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 blur-2xl -z-10`}></div>

              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl animate-bounce">
                    <StarIcon className="w-4 h-4 mr-2 fill-current" />
                    Más Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                {/* Icon */}
                <div className="text-4xl mb-4">{plan.icon}</div>
                
                <div className="mb-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${
                    plan.type === 'Básico' 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-200 text-green-700 border border-green-300' 
                      : plan.type === 'Popular'
                      ? 'bg-gradient-to-r from-blue-100 to-purple-200 text-blue-700 border border-blue-300'
                      : plan.type === 'Profesional'
                      ? 'bg-gradient-to-r from-purple-100 to-pink-200 text-purple-700 border border-purple-300'
                      : 'bg-gradient-to-r from-orange-100 to-red-200 text-orange-700 border border-orange-300'
                  }`}>
                    {plan.type}
                  </span>
                </div>
                
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">
                  {plan.name}
                </h3>
                
                <p className="text-gray-600 mb-8 leading-relaxed text-base">
                  {plan.description}
                </p>
                
                {/* Price Box */}
                <div className={`flex flex-col items-center justify-center rounded-3xl p-4 mb-4 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-300' 
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200'
                }`}>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-extrabold ${
                      plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' : 'text-gray-900'
                    }`}>
                      ₲{(isAnnual ? plan.annualPrice : plan.monthlyPrice).toLocaleString('es-PY')}
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-600 mt-2">
                    /{isAnnual ? 'año' : 'mes'}
                  </span>
                  {isAnnual && (
                    <p className="text-sm text-gray-500 mt-2">
                      ₲{Math.round(plan.annualPrice / 12).toLocaleString('es-PY')}/mes
                    </p>
                  )}
                </div>
              </div>

              {/* Subtitle */}
              {plan.subtitle && (
                <div className="mb-8 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-2xl border border-blue-200">
                  <p className="text-sm text-gray-700 text-center font-medium leading-snug">
                    {plan.subtitle}
                  </p>
                </div>
              )}

              {/* Features */}
              <div className="space-y-4 mb-8 flex-grow">
                <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center">
                  <span className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
                  Incluye:
                </h4>
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-4 group/feature">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center mt-0.5 group-hover/feature:scale-110 transition-transform duration-300">
                      <CheckIcon className="w-4 h-4 text-green-600 font-bold" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all duration-500 mt-auto shadow-lg hover:shadow-2xl hover:scale-105 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white hover:from-blue-700 hover:via-purple-700 hover:to-blue-800'
                    : 'bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                {plan.cta}
                <span className="ml-2 text-lg">→</span>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Plan Torre - renderizado abajo */}
        {plans.find((p) => p.name === 'Plan Torre') && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {(() => {
              const plan = plans.find((p) => p.name === 'Plan Torre')!;
              return (
                <div className="md:col-start-2">
                  <motion.div
                    key={plan.name}
                    variants={itemVariants}
                    className={`relative rounded-3xl p-6 transition-all duration-700 hover:-translate-y-4 flex flex-col group ${
                      'bg-white border-2 border-gray-200 shadow-xl hover:shadow-2xl hover:border-blue-300 hover:ring-2 hover:ring-blue-100'
                    }`}
                  >
                  {/* Background Glow */}
                  <div className={`absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-10 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 blur-2xl -z-10`}></div>

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    {/* Icon */}
                    <div className="text-4xl mb-4">{plan.icon}</div>
                    
                    <div className="mb-4">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide bg-gradient-to-r from-orange-100 to-red-200 text-orange-700 border border-orange-300`}>
                        {plan.type}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3">
                      {plan.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-8 leading-relaxed text-base">
                      {plan.description}
                    </p>
                    
                    {/* Price Box */}
                    <div className={`flex flex-col items-center justify-center rounded-3xl p-6 mb-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200`}>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-5xl font-extrabold text-gray-900`}>
                          ₲{(isAnnual ? plan.annualPrice : plan.monthlyPrice).toLocaleString('es-PY')}
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-gray-600 mt-2">
                        /{isAnnual ? 'año' : 'mes'}
                      </span>
                      {isAnnual && (
                        <p className="text-sm text-gray-500 mt-2">
                          ₲{Math.round(plan.annualPrice / 12).toLocaleString('es-PY')}/mes
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subtitle */}
                  {plan.subtitle && (
                    <div className="mb-8 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-2xl border border-blue-200">
                      <p className="text-sm text-gray-700 text-center font-medium leading-snug">
                        {plan.subtitle}
                      </p>
                    </div>
                  )}

                  {/* Features */}
                  <div className="space-y-4 mb-8 flex-grow">
                    <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center">
                      <span className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
                      Incluye:
                    </h4>
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-4 group/feature">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center mt-0.5 group-hover/feature:scale-110 transition-transform duration-300">
                          <CheckIcon className="w-4 h-4 text-green-600 font-bold" />
                        </div>
                        <span className="text-gray-700 text-sm leading-relaxed font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all duration-500 mt-auto shadow-lg hover:shadow-2xl hover:scale-105 bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-blue-600 hover:to-purple-700`}
                  >
                    {plan.cta}
                    <span className="ml-2 text-lg">→</span>
                  </button>
                </motion.div>
                </div>
              );
            })()}
          </motion.div>
        )}

          {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <div className="w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-pink-600/20"></div>
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
                className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
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
                className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
              />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
              <div className="text-center">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold mb-8 backdrop-blur-sm"
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Comienza tu transformación digital
                </motion.div>

                {/* Main Heading */}
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight"
                >
                  ¿Listo para{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    comenzar
                  </span>?
                </motion.h3>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto"
                >
                  Empieza tu prueba gratuita de 14 días y configura tu CRM en minutos. 
                  Sin tarjeta de crédito, sin compromisos.
                </motion.p>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300 font-medium">Sin tarjeta de crédito</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300 font-medium">Soporte en español</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300 font-medium">Cancela cuando quieras</span>
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row gap-6 justify-center mb-8"
                >
                  <button className="group inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105">
                    Comenzar prueba gratis
                    <ArrowRightIcon className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                  
                  <button className="group inline-flex items-center justify-center px-10 py-5 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-bold text-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <PlayIcon className="w-6 h-6 mr-3" />
                    Ver Demo
                  </button>
                </motion.div>

                {/* Bottom Text */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="text-blue-200/80 text-sm font-medium"
                >
                  14 días gratis · Sin compromiso · Configuración guiada
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;