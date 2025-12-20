"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, StarIcon, SparklesIcon, PlayIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api';

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar planes dinámicamente del backend
  useEffect(() => {
    const loadPlans = async () => {
      try {
        // ETAPA 1: Traer datos de la API
        let backendPlans: any[] = [];
        const [respAll, respNetwork] = await Promise.allSettled([
          apiClient.get('/api/subscriptions/plans/proptech/all'),
          apiClient.get('/api/subscriptions/plans/network')
        ]);
        
        if (respAll.status === 'fulfilled') {
          backendPlans = Array.isArray(respAll.value.data) ? respAll.value.data : [];
          console.log('🔵 ETAPA 1 - API PropTech/all:', backendPlans.map(p => ({ id: p.id, name: p.name, tier: p.tier, type: p.type, billingDays: p.billingCycleDays })));
        } else {
          console.error('❌ Error en API PropTech/all:', respAll.reason);
        }
        
        if (respNetwork.status === 'fulfilled' && respNetwork.value?.data) {
          const networkPlan = respNetwork.value.data;
          console.log('🔵 ETAPA 1 - API Network:', { id: networkPlan.id, name: networkPlan.name, tier: networkPlan.tier, type: networkPlan.type });
          // Solo agregar si no existe ya un plan con el mismo ID o nombre
          const exists = backendPlans.some((p: any) => p.id === networkPlan.id || p.name === networkPlan.name);
          if (!exists) {
            backendPlans.push(networkPlan);
          } else {
            console.log('⚠️ Network plan ya existe, no se agrega');
          }
        }
        
        console.log('🟢 ETAPA 1 - Total backendPlans después de combinar:', backendPlans.length, backendPlans.map(p => ({ id: p.id, name: p.name, tier: p.tier })));
        
        // ETAPA 2: Eliminar duplicados por tier (PROPTECH)
        const seenTiers = new Set<string>();
        const uniquePlans = backendPlans.filter((plan: any) => {
          // Si es PROPTECH, solo mostrar un plan por tier
          if (plan.type === 'PROPTECH') {
            const tierKey = `PROPTECH-${plan.tier}`;
            if (seenTiers.has(tierKey)) {
              console.log('❌ Duplicado filtrado por tier:', { id: plan.id, name: plan.name, tier: plan.tier });
              return false; // Ya hay un plan con este tier
            }
            seenTiers.add(tierKey);
            return true;
          }
          // NETWORK siempre se muestra (ya se filtró arriba por ID/name)
          return true;
        });
        
        console.log('🟢 ETAPA 2 - Después de filtrar por tier:', uniquePlans.length, uniquePlans.map(p => ({ id: p.id, name: p.name, tier: p.tier, type: p.type })));
        
        // ETAPA 3: Mapear a formato del componente
        const mappedPlans = uniquePlans.map((plan: any) => {
          const tier = plan.tier;
          const price = Number(plan.price) || 0;
          const billingCycleDays = Number(plan.billingCycleDays) || 30;
          const monthlyPrice = billingCycleDays === 30 ? price : Math.round(price / 12);
          const annualPrice = billingCycleDays === 365 ? price : price * 12;
          return {
            id: plan.id, // Incluir ID para identificar duplicados
            name: plan.name,
            type: tier,
            sourceType: plan.type, // PROPTECH o NETWORK
            icon: getIconForTier(tier),
            // Descripción visible en la card tomada del backend
            description: (plan.description || '').trim(),
            // También la usamos como subtítulo si existe; si no, fallback por tier
            subtitle: (plan.description || '').trim() || getSubtitleForTier(tier),
            monthlyPrice,
            annualPrice,
            popular: tier === 'INTERMEDIO',
            features: Array.isArray(plan.features) ? plan.features : [],
            cta: tier === 'FREE' ? 'Comenzar gratis' : (tier === 'PREMIUM' || tier === 'ENTERPRISE' ? 'Contactar ventas' : 'Comenzar ahora')
          };
        });

        console.log('🟢 ETAPA 3 - Después de mapear:', mappedPlans.length, mappedPlans.map(p => ({ id: p.id, name: p.name, type: p.type, sourceType: p.sourceType })));

        // ETAPA 4: Eliminar duplicados finales por ID y por combinación de tier+sourceType
        const seenIds = new Set<number>();
        const seenTierType = new Set<string>();
        const finalPlans = mappedPlans.filter((plan: any) => {
          // Filtrar por ID primero
          if (plan.id && seenIds.has(plan.id)) {
            console.log('❌ Duplicado final filtrado por ID:', { id: plan.id, name: plan.name, type: plan.type });
            return false;
          }
          if (plan.id) {
            seenIds.add(plan.id);
          }
          
          // Filtrar por combinación tier+sourceType (para PROPTECH, solo uno por tier)
          if (plan.sourceType === 'PROPTECH') {
            const key = `${plan.type}-${plan.sourceType}`;
            if (seenTierType.has(key)) {
              console.log('❌ Duplicado final filtrado por tier+type:', { id: plan.id, name: plan.name, type: plan.type, key });
              return false;
            }
            seenTierType.add(key);
          }
          
          return true;
        });

        console.log('🟢 ETAPA 4 - Final después de filtrar duplicados:', finalPlans.length, finalPlans.map(p => ({ id: p.id, name: p.name, type: p.type, sourceType: p.sourceType })));

        // ETAPA 5: Ordenar
        const order: Record<string, number> = { INICIAL: 0, INTERMEDIO: 1, PREMIUM: 2, FREE: 3 };
        finalPlans.sort((a: any, b: any) => {
          if (a.sourceType === 'NETWORK' && b.sourceType !== 'NETWORK') return -1;
          if (b.sourceType === 'NETWORK' && a.sourceType !== 'NETWORK') return 1;
          return (order[a.type] ?? 99) - (order[b.type] ?? 99);
        });

        console.log('🟢 ETAPA 5 - Final ordenado:', finalPlans.length, finalPlans.map(p => ({ id: p.id, name: p.name, type: p.type })));

        // Mostrar todos los planes sin duplicados
        setPlans(finalPlans);
      } catch (error) {
        console.error('Error cargando planes:', error);
        // Fallback a array vacío si hay error
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  // Funciones helper para mapear datos del backend
  const getIconForTier = (tier: string) => {
    switch (tier) {
      case 'FREE': return '🆓';
      case 'INICIAL': return '🪵';
      case 'INTERMEDIO': return '🏠';
      case 'PREMIUM': return '🏢';
      case 'ENTERPRISE': return '🌇';
      default: return '📋';
    }
  };

  const getSubtitleForTier = (tier: string) => {
    switch (tier) {
      case 'FREE': return 'Ideal para probar la plataforma';
      case 'INICIAL': return 'Ideal para empezar tu carrera inmobiliaria';
      case 'INTERMEDIO': return 'Todo lo que necesitas para crecer tu negocio';
      case 'PREMIUM': return 'Potencia tu equipo y escala tu negocio';
      case 'ENTERPRISE': return 'La solución completa para empresas grandes';
      default: return '';
    }
  };

  const getFeaturesForTier = (plan: any) => {
    const features = [];
    
    if (plan.maxProperties > 0) {
      features.push(plan.maxProperties === -1 ? 'Propiedades ilimitadas' : `Hasta ${plan.maxProperties} propiedades`);
    }
    if (plan.maxAgents > 0) {
      features.push(plan.maxAgents === -1 ? 'Agentes ilimitados' : `Hasta ${plan.maxAgents} agentes`);
    }
    if (plan.hasCrm) features.push('CRM completo');
    if (plan.hasAnalytics) features.push('Reportes avanzados');
    if (plan.hasNetworkAccess) features.push('Acceso a network');
    if (plan.hasPrioritySupport) features.push('Soporte prioritario');
    
    return features.length > 0 ? features : ['Características básicas incluidas'];
  };

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

  // Loading state
  if (loading) {
    return (
      <section id="pricing" className="py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900">
              Planes de precios
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-200 animate-pulse">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-8"></div>
                  <div className="h-12 bg-gray-300 rounded-2xl w-2/3 mx-auto"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 h-12 bg-gray-300 rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
        {plans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No hay planes disponibles en este momento.</p>
          </div>
        ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {plans.map((plan, index) => {
            return (
            <motion.div
              key={`plan-${plan.id || plan.name}-${index}`}
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
                
                {/* Descripción superior removida por solicitud */}
                
                {/* Price Box */}
                <div className={`flex flex-col items-center justify-center rounded-2xl p-3 mb-4 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-300' 
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200'
                }`}>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-gray-600">₲</span>
                    <span className={`text-3xl font-bold ${
                      plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' : 'text-gray-900'
                    }`}>
                      {(isAnnual ? plan.annualPrice : plan.monthlyPrice).toLocaleString('es-PY')}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-600 mt-1">
                    /{isAnnual ? 'año' : 'mes'}
                  </span>
                  {isAnnual && (
                    <p className="text-xs text-gray-500 mt-1">
                      ₲{Math.round(plan.annualPrice / 12).toLocaleString('es-PY')}/mes
                    </p>
                  )}
                </div>
              </div>

              {/* Subtitle debajo del título */}
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
                {plan.features.map((feature: string, featureIndex: number) => (
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
            );
          })}
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