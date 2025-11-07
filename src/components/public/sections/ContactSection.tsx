"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    plan: 'casa'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const scrollToElement = (elementId: string) => {
    if (typeof window === 'undefined') return;
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitStatus('success');
    
    // Reset form after success
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: '',
        plan: 'casa'
      });
      setSubmitStatus('idle');
    }, 3000);
  };

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      title: 'Email',
      details: ['hola@proptech.com.py', 'soporte@proptech.com.py'],
      description: 'Respuesta en menos de 2 horas'
    },
    {
      icon: PhoneIcon,
      title: 'Teléfono',
      details: ['+595 985 940797'],
      description: 'Lunes a Viernes 8:00 - 18:00'
    },
    {
      icon: MapPinIcon,
      title: 'Oficina',
      details: ['Ciudad del Este, Paraguay'],
      description: 'Visitas con cita previa'
    }
  ];

  return (
    <section id="contact" className="py-24 md:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Main Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 via-indigo-700/30 to-slate-800/40"></div>
        
        {/* Animated Mesh Gradient */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-transparent to-indigo-500/20 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-indigo-500/20 via-transparent to-slate-600/20 animate-pulse delay-1000"></div>
        </div>
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
              className="absolute bottom-10 left-1/4 w-20 h-20 bg-gradient-to-r from-indigo-400/20 to-blue-500/20 rounded-full blur-xl"
        ></motion.div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20 relative"
        >
          {/* Glow Effect Behind Content */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-3xl scale-110"></div>
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border-2 border-blue-400/50 text-white text-base font-bold mb-10 backdrop-blur-sm shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 mr-3"
            >
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </motion.div>
            ¡Comienza tu transformación digital ahora!
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative text-5xl md:text-6xl lg:text-7xl font-black text-white mb-10 leading-[0.9] tracking-tight"
          >
            <span className="block">¿Listo para</span>
            <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-slate-400 bg-clip-text text-transparent relative">
              comenzar?
              <motion.div
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-slate-400/20 blur-xl -z-10"
              ></motion.div>
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="relative text-3xl md:text-4xl text-white max-w-6xl mx-auto leading-relaxed mb-16 font-medium"
          >
            Habla con nuestro equipo de{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-bold">
              expertos
            </span>{' '}
            y descubre cómo Proptech CRM puede{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent font-bold">
              transformar
            </span>{' '}
            tu negocio inmobiliario.
          </motion.p>

          {/* Enhanced Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="relative grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-400/30 hover:border-green-400/60 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:shadow-green-500/50 transition-all duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-2xl mb-2">Demo Gratuito</h3>
                <p className="text-white/80 text-lg">14 días sin costo</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-400/30 hover:border-blue-400/60 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:shadow-blue-500/50 transition-all duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-2xl mb-2">Soporte en Español</h3>
                <p className="text-white/80 text-lg">24/7 disponible</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-400/30 hover:border-purple-400/60 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:shadow-purple-500/50 transition-all duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-2xl mb-2">Configuración Guiada</h3>
                <p className="text-white/80 text-lg">Setup en 5 minutos</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="relative flex flex-col sm:flex-row gap-8 justify-center mb-12"
          >
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex items-center justify-center px-16 py-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-600 text-white rounded-3xl font-black text-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 border-2 border-white/20 overflow-hidden"
              type="button"
              onClick={() => scrollToElement('contact-form')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Solicitar Demo Gratis</span>
              <motion.svg 
                className="relative z-10 w-7 h-7 ml-4 group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex items-center justify-center px-16 py-8 bg-white/10 backdrop-blur-sm text-white rounded-3xl font-black text-2xl border-2 border-white/40 hover:bg-white/20 transition-all duration-300 shadow-2xl hover:shadow-white/30"
              type="button"
              onClick={() => scrollToElement('pricing')}
            >
              <svg className="w-7 h-7 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Ver Precios
            </motion.button>
          </motion.div>

          {/* Enhanced Bottom Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="inline-flex items-center bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/20">
              <div className="flex items-center space-x-6 text-white font-bold text-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Sin compromiso
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mr-2 animate-pulse delay-500"></div>
                  Respuesta en 2 horas
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-400 rounded-full mr-2 animate-pulse delay-1000"></div>
                  14 días gratis
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            id="contact-form"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-10 shadow-2xl border-2 border-gray-200 relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm0 0c0 5.5 4.5 10 10 10s10-4.5 10-10-4.5-10-10-10-10 4.5-10 10z'/%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>
            <h3 className="relative text-4xl font-black text-gray-900 mb-8 text-center">
              Solicita una demostración
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </h3>

            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
              >
                <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-green-700 font-medium">
                  ¡Mensaje enviado! Te contactaremos pronto.
                </span>
              </motion.div>
            )}

            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
              >
                <XMarkIcon className="w-5 h-5 text-red-500 mr-3" />
                <span className="text-red-700 font-medium">
                  Error al enviar el mensaje. Inténtalo de nuevo.
                </span>
              </motion.div>
            )}

                <form onSubmit={handleSubmit} className="space-y-8 relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                      <label htmlFor="name" className="block text-lg font-bold text-gray-800 mb-3">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 text-lg font-medium bg-gray-50 focus:bg-white"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                      <label htmlFor="email" className="block text-lg font-bold text-gray-800 mb-3">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 text-lg font-medium bg-gray-50 focus:bg-white"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                      <label htmlFor="company" className="block text-lg font-bold text-gray-800 mb-3">
                    Empresa
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 text-lg font-medium bg-gray-50 focus:bg-white"
                    placeholder="Nombre de tu empresa"
                  />
                </div>
                <div>
                      <label htmlFor="phone" className="block text-lg font-bold text-gray-800 mb-3">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 text-lg font-medium bg-gray-50 focus:bg-white"
                    placeholder="+595 981 123-456"
                  />
                </div>
              </div>

              <div>
                    <label htmlFor="plan" className="block text-lg font-bold text-gray-800 mb-3">
                  Plan de interés
                </label>
                <select
                  id="plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handleInputChange}
                      className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 text-lg font-medium bg-gray-50 focus:bg-white"
                    >
                      <option value="terreno">🪵 Plan Terreno - ₲120.000/mes</option>
                      <option value="casa">🏠 Plan Casa - ₲325.000/mes</option>
                      <option value="edificio">🏢 Plan Edificio - ₲650.000/mes</option>
                      <option value="torre">🌇 Plan Torre - ₲1.250.000/mes</option>
                  <option value="custom">Plan personalizado</option>
                </select>
              </div>

              <div>
                    <label htmlFor="message" className="block text-lg font-bold text-gray-800 mb-3">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                      rows={5}
                      className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 text-lg font-medium bg-gray-50 focus:bg-white resize-none"
                  placeholder="Cuéntanos sobre tu negocio y cómo podemos ayudarte..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                    className="w-full py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 transition-all duration-300 font-black text-xl shadow-2xl hover:shadow-blue-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden"
              >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">
                {isSubmitting ? 'Enviando...' : 'Solicitar Demo Gratis'}
                    </span>
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-3xl font-black text-white mb-6 text-center">
                Otras formas de contactarnos
              </h3>
              <p className="text-white text-lg font-medium mb-8 text-center">
                Nuestro equipo está aquí para ayudarte. Elige la forma que prefieras 
                para comunicarte con nosotros.
              </p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 p-8 hover:shadow-3xl hover:border-blue-300 transition-all duration-300"
                >
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <info.icon className="w-8 h-8 text-white" />
                  </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-black text-gray-900 mb-4">
                      {info.title}
                    </h4>
                      <div className="space-y-2 mb-4">
                      {info.details.map((detail, detailIndex) => (
                          <p key={detailIndex} className="text-gray-800 font-bold text-lg">
                          {detail}
                        </p>
                      ))}
                    </div>
                      <p className="text-lg text-gray-600 font-semibold bg-gray-50 rounded-lg p-3">
                      {info.description}
                    </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-200 shadow-xl"
            >
              <h4 className="text-2xl font-black text-gray-900 mb-6 text-center">
                ¿Por qué elegir Proptech CRM?
              </h4>
              <ul className="space-y-4">
                <li className="flex items-center bg-white rounded-xl p-4 shadow-sm">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <CheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-bold text-lg">Configuración en menos de 5 minutos</span>
                </li>
                <li className="flex items-center bg-white rounded-xl p-4 shadow-sm">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <CheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-bold text-lg">Soporte en español 24/7</span>
                </li>
                <li className="flex items-center bg-white rounded-xl p-4 shadow-sm">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <CheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-bold text-lg">Garantía de 30 días</span>
                </li>
                <li className="flex items-center bg-white rounded-xl p-4 shadow-sm">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <CheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-bold text-lg">Sin costos ocultos</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
