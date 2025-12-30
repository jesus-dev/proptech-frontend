"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  WrenchScrewdriverIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const ProfessionalsBanner = () => {
  return (
    <section className="relative py-20 bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="professionals-banner-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="4" fill="white" opacity="0.3"/>
              <circle cx="10" cy="10" r="2" fill="white" opacity="0.2"/>
              <circle cx="50" cy="50" r="2" fill="white" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#professionals-banner-pattern)" />
        </svg>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-bounce"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold mb-6 shadow-lg"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Nuevo servicio disponible
          </motion.div>

          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
                <WrenchScrewdriverIcon className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight"
          >
            Encuentra Profesionales de
            <br />
            <span className="bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent">
              Servicios del Hogar
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Electricistas, plomeros, carpinteros, pintores y más. Profesionales verificados y con experiencia para tu hogar.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6 mb-10"
          >
            {[
              'Profesionales verificados',
              'Calificaciones y reseñas',
              'Disponibilidad inmediata',
              'Múltiples servicios'
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30"
              >
                <CheckCircleIcon className="w-5 h-5 text-white mr-2" />
                <span className="text-white font-semibold text-sm sm:text-base">{feature}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex justify-center"
          >
            <Link
              href="/profesionales"
              className="group relative inline-flex items-center justify-center px-10 py-5 bg-white text-orange-600 rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 overflow-hidden"
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-white to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Button Content */}
              <span className="relative z-10 flex items-center">
                <WrenchScrewdriverIcon className="w-6 h-6 mr-3" />
                Buscar Profesionales
                <ArrowRightIcon className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </span>

              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-white/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProfessionalsBanner;

