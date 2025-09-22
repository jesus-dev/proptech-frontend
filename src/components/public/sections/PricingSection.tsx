"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      description: 'Solo CRM para agentes independientes',
      monthlyPrice: 29,
      annualPrice: 290,
      features: [
        'Hasta 50 propiedades',
        'Hasta 100 clientes',
        'Agenda básica',
        'Reportes básicos',
        'Soporte por email',
        'App móvil',
        'Respaldos diarios',
        'Integración con tu sitio web'
      ],
      limitations: [
        'Sin portal público',
        'Sin automatización',
        'Sin integraciones avanzadas'
      ],
      popular: false,
      cta: 'Comenzar Prueba Gratis',
      type: 'CRM Only'
    },
    {
      name: 'Professional',
      description: 'CRM + Portal para agentes profesionales',
      monthlyPrice: 59,
      annualPrice: 590,
      features: [
        'Hasta 200 propiedades',
        'Hasta 500 clientes',
        'Agenda avanzada',
        'Reportes completos',
        'Portal público básico',
        'SEO optimizado',
        'Automatización básica',
        'Integraciones básicas',
        'Soporte prioritario',
        'App móvil completa',
        'Respaldos automáticos',
        'Plantillas de documentos'
      ],
      limitations: [
        'Portal con diseño estándar',
        'Sin dominio personalizado'
      ],
      popular: true,
      cta: 'Comenzar Prueba Gratis',
      type: 'CRM + Portal'
    },
    {
      name: 'Enterprise',
      description: 'CRM + Portal completo para empresas',
      monthlyPrice: 99,
      annualPrice: 990,
      features: [
        'Propiedades ilimitadas',
        'Clientes ilimitados',
        'Agenda completa',
        'Reportes avanzados',
        'Portal público personalizado',
        'Dominio personalizado',
        'SEO avanzado',
        'Automatización completa',
        'Todas las integraciones',
        'Soporte 24/7',
        'App móvil + web',
        'Respaldos en tiempo real',
        'Plantillas personalizadas',
        'API completa',
        'Soporte dedicado'
      ],
      limitations: [],
      popular: false,
      cta: 'Contactar Ventas',
      type: 'CRM + Portal Pro'
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
    <section id="pricing" className="py-20 bg-white">
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
            Planes de precios
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Precios{' '}
            <span className="bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
              transparentes
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
            Elige el plan que mejor se adapte a tu negocio. Sin costos ocultos, 
            sin sorpresas. Cancela cuando quieras. Todos los planes incluyen soporte en español.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center space-x-6">
            <span className={`text-lg font-semibold transition-colors ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Mensual
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 hover:bg-gray-300"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  isAnnual ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg font-semibold transition-colors ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Anual
            </span>
            {isAnnual && (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
                Ahorra 20%
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
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
            {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              className={`relative rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 ${
                plan.popular
                  ? 'bg-gradient-to-br from-brand-50 to-white border-2 border-brand-500 shadow-2xl scale-105'
                  : 'bg-white border border-gray-200 shadow-lg hover:shadow-2xl hover:border-brand-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-brand-600 to-brand-700 text-white">
                    Más Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    plan.type === 'CRM Only' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {plan.type}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-500 ml-1">
                    /{isAnnual ? 'año' : 'mes'}
                  </span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-gray-500 mt-1">
                    ${Math.round(plan.annualPrice / 12)}/mes facturado anualmente
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                <h4 className="font-semibold text-gray-900 mb-3">Incluye:</h4>
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, limitationIndex) => (
                  <div key={limitationIndex} className="flex items-start">
                    <XMarkIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-500">{limitation}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800 shadow-xl hover:shadow-2xl hover:scale-105'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-brand-100 hover:to-brand-200 hover:text-brand-700 border border-gray-300 hover:border-brand-300'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Necesitas algo personalizado?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Tenemos planes especiales para empresas grandes y necesidades específicas. 
              Habla con nuestro equipo para encontrar la solución perfecta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all duration-300 font-semibold"
              >
                Contactar Ventas
              </a>
              <a
                href="#demo"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-brand-600 text-brand-600 rounded-lg hover:bg-brand-600 hover:text-white transition-all duration-300 font-semibold"
              >
                Ver Demo Personalizada
              </a>
            </div>
          </div>
        </motion.div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <CheckIcon className="w-5 h-5 text-green-500" />
            <span className="font-medium">Garantía de 30 días o tu dinero de vuelta</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;


