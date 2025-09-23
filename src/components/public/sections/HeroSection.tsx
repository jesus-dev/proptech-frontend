"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');

  const propertyTypes = [
    { value: '', label: 'Tipo de Propiedad' },
    { value: 'casa', label: 'Casa' },
    { value: 'departamento', label: 'Departamento' },
    { value: 'terreno', label: 'Terreno' },
    { value: 'local', label: 'Local Comercial' },
    { value: 'oficina', label: 'Oficina' }
  ];

  const locations = [
    { value: '', label: 'Ubicación' },
    { value: 'asuncion', label: 'Asunción' },
    { value: 'ciudad-del-este', label: 'Ciudad del Este' },
    { value: 'encarnacion', label: 'Encarnación' },
    { value: 'san-lorenzo', label: 'San Lorenzo' },
    { value: 'fernando-de-la-mora', label: 'Fernando de la Mora' }
  ];

  const stats = [
    { label: 'Propiedades Activas', value: '500+' },
    { label: 'Ciudades Cubiertas', value: '15+' },
    { label: 'Agentes Certificados', value: '150+' },
    { label: 'Satisfacción', value: '98%' },
  ];

  return (
    <section className="relative -mt-14 sm:-mt-16 min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
      {/* Patrón de cuadrícula de bienes raíces */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="property-grid-hero" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
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
          <rect width="100%" height="100%" fill="url(#property-grid-hero)" />
        </svg>
      </div>
      
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-300/10 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-emerald-400/10 rounded-full blur-xl animate-pulse delay-500"></div>
        
        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-5 w-16 h-16 bg-gradient-to-r from-cyan-400/30 to-blue-600/30 rounded-full blur-xl"
        ></motion.div>
        
        <motion.div
          animate={{
            y: [0, 15, 0],
            x: [0, -15, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-20 right-10 w-24 h-24 bg-gradient-to-r from-emerald-400/25 to-cyan-500/25 rounded-full blur-2xl"
        ></motion.div>
        
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
          className="absolute bottom-10 left-1/4 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-blue-500/20 rounded-full blur-xl"
        ></motion.div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 pt-16 sm:pt-20 pb-12 sm:pb-16 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
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
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-cyan-100/20 backdrop-blur-sm text-cyan-300 text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-cyan-400/30"
            >
              <StarSolidIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Propiedades siempre actualizadas en tiempo real</span>
              <span className="sm:hidden">Propiedades actualizadas</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight"
            >
              Encuentra tu{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                hogar ideal
              </span>{' '}
              en Paraguay
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg sm:text-xl text-cyan-100 mb-6 sm:mb-8 max-w-2xl"
            >
              <span className="hidden sm:inline">Explora más de 500 propiedades verificadas en Asunción, Ciudad del Este, 
              Encarnación y todo el país. Casas, departamentos, terrenos y locales comerciales.</span>
              <span className="sm:hidden">Explora más de 500 propiedades verificadas en Paraguay. 
              Casas, departamentos, terrenos y locales comerciales.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12"
            >
              <Link
                href="/propiedades"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Explorar Propiedades
                <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
              </Link>
              <Link
                href="/proptech"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/30 text-white rounded-lg hover:bg-white/10 hover:text-white transition-all duration-300 font-semibold text-base sm:text-lg backdrop-blur-sm"
              >
                <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                Descubrir PropTech
              </Link>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="space-y-2 sm:space-y-3 mb-8 sm:mb-12"
            >
              {[
                '✅ Propiedades verificadas y actualizadas',
                '✅ Búsqueda avanzada con filtros',
                '✅ Agentes profesionales certificados',
                '✅ Portal optimizado para móviles',
              ].map((feature, index) => (
                <div key={index} className="flex items-center text-cyan-200 font-medium text-sm sm:text-base">
                  {feature}
                </div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-xl sm:text-2xl font-bold text-cyan-300 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            {/* Main Dashboard Mockup */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-3 sm:p-6 border border-gray-200">
              {/* Browser Header */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1 bg-gray-100 rounded-md h-6 ml-4 flex items-center px-2 sm:px-3">
                  <span className="text-xs text-gray-500 truncate">proptech.com.py/dashboard</span>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-4">
                {/* Header Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-brand-50 rounded-lg p-2 sm:p-3">
                    <div className="text-lg sm:text-2xl font-bold text-brand-600">24</div>
                    <div className="text-xs text-gray-600">Propiedades</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 sm:p-3">
                    <div className="text-lg sm:text-2xl font-bold text-green-600">8</div>
                    <div className="text-xs text-gray-600">Clientes</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2 sm:p-3">
                    <div className="text-lg sm:text-2xl font-bold text-orange-600">5</div>
                    <div className="text-xs text-gray-600">Citas</div>
                  </div>
                </div>

                {/* Property List */}
                <div className="space-y-2">
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Propiedades Recientes</div>
                  {[
                    { name: 'Casa en Asunción', price: '$85,000', status: 'Disponible' },
                    { name: 'Depto. en Ciudad del Este', price: '$45,000', status: 'Vendido' },
                    { name: 'Terreno en Encarnación', price: '$25,000', status: 'Reservado' },
                  ].map((property, index) => (
                    <div key={index} className="flex items-center justify-between p-1.5 sm:p-2 bg-gray-50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{property.name}</div>
                        <div className="text-xs text-gray-500">{property.price}</div>
                      </div>
                      <div className={`px-1.5 sm:px-2 py-1 rounded-full text-xs flex-shrink-0 ${
                        property.status === 'Disponible' ? 'bg-green-100 text-green-700' :
                        property.status === 'Vendido' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {property.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">Nueva venta!</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200"
            >
              <div className="text-xs text-gray-600">
                <div className="font-semibold">+15% ventas</div>
                <div>este mes</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
