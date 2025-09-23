// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { CheckIcon } from "@heroicons/react/24/outline";

const SearchHeroSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState('');

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

  const quickFilters = [
    { icon: BuildingOfficeIcon, label: '1-2 dorm.', value: '1-2', type: 'bedrooms' },
    { icon: BuildingOfficeIcon, label: '3+ dorm.', value: '3+', type: 'bedrooms' },
    { icon: WrenchScrewdriverIcon, label: '2+ baños', value: '2+', type: 'bathrooms' },
    { icon: CurrencyDollarIcon, label: 'Hasta $50k', value: '50k', type: 'price' },
    { icon: CurrencyDollarIcon, label: '$50k-$100k', value: '50k-100k', type: 'price' },
    { icon: CurrencyDollarIcon, label: '$100k+', value: '100k+', type: 'price' }
  ];

  const handleQuickFilter = (filter: any) => {
    setActiveQuickFilter(filter.value);
    if (filter.type === 'price') {
      if (filter.value === '50k') {
        setPriceRange({ min: '', max: '50000' });
      } else if (filter.value === '50k-100k') {
        setPriceRange({ min: '50000', max: '100000' });
      } else if (filter.value === '100k+') {
        setPriceRange({ min: '100000', max: '' });
      }
    } else if (filter.type === 'bedrooms') {
      setBedrooms(filter.value);
    } else if (filter.type === 'bathrooms') {
      setBathrooms(filter.value);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPropertyType('');
    setLocation('');
    setPriceRange({ min: '', max: '' });
    setBedrooms('');
    setBathrooms('');
    setActiveQuickFilter('');
  };

  const stats = [
    { label: 'Propiedades Activas', value: '500+' },
    { label: 'Ciudades Cubiertas', value: '15+' },
    { label: 'Agentes Certificados', value: '150+' },
    { label: 'Satisfacción', value: '98%' },
  ];

  return (
    <section className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/40 via-brand-700/30 to-brand-800/40"></div>
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-500/20 via-transparent to-emerald-500/20 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-purple-500/20 via-transparent to-brand-600/20 animate-pulse delay-1000"></div>
        </div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-5 w-16 h-16 bg-gradient-to-r from-brand-400/30 to-brand-600/30 rounded-full blur-xl"
        ></motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -15, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-20 right-10 w-24 h-24 bg-gradient-to-r from-emerald-400/25 to-brand-500/25 rounded-full blur-2xl"
        ></motion.div>
        <motion.div
          animate={{ y: [0, -10, 0], x: [0, 20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-10 left-1/4 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-brand-500/20 rounded-full blur-xl"
        ></motion.div>
      </div>

      <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-20 sm:pt-24 pb-16 sm:pb-20">
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white text-xs sm:text-sm font-semibold mb-4 sm:mb-6 shadow-xl border border-green-400/30 backdrop-blur-sm"
          >
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>
              <StarSolidIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            </motion.div>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="hidden sm:inline">
              Propiedades siempre actualizadas en tiempo real
            </motion.span>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="sm:hidden">
              Propiedades siempre actualizadas en tiempo real
            </motion.span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight"
          >
            <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="inline-block">
              Encuentra tu{' '}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 bg-clip-text text-transparent inline-block relative"
            >
              <motion.span
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 bg-clip-text text-transparent bg-[length:200%_100%]"
              >
                &nbsp;hogar ideal&nbsp;
              </motion.span>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} className="absolute inset-0 bg-gradient-to-r from-brand-400/20 to-brand-600/20 blur-lg -z-10"></motion.div>
            </motion.span>
            <motion.span initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9, duration: 0.6 }} className="inline-block">
              {' '}en Paraguay
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4"
          >
            <span className="hidden sm:inline">Explora más de <span className="text-brand-300 font-semibold">500 propiedades verificadas</span> en Asunción, Ciudad del Este, Encarnación y todo el país.</span>
            <span className="sm:hidden">Más de <span className="text-brand-300 font-semibold">500 propiedades</span> verificadas en todo Paraguay.</span>
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }} whileHover={{ scale: 1.02 }} className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7, duration: 0.6 }} className="bg-gradient-to-br from-white/90 via-white/80 to-brand-50/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/30 relative overflow-hidden">
              <motion.div
                animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-5"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v20h20z'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '40px 40px' }}
              ></motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 0.6 }} className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
                <motion.div whileHover={{ scale: 1.01 }} whileFocus={{ scale: 1.01 }} className="flex-1 relative group">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors duration-300" />
                  <input
                    type="text"
                    placeholder="Buscar propiedades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border-2 border-brand-200/50 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm transition-all duration-300 hover:border-brand-400 bg-gradient-to-r from-white/90 to-brand-50/30 backdrop-blur-sm group-hover:shadow-md"
                  />
                  {searchTerm && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-brand-200/50 z-20 overflow-hidden">
                      {["Casa en Asunción","Departamento en Ciudad del Este","Terreno en Encarnación","Local comercial en San Lorenzo"].filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).map((suggestion, index) => (
                        <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="px-3 py-2 hover:bg-brand-50 cursor-pointer flex items-center group text-sm">
                          <MagnifyingGlassIcon className="w-3 h-3 text-gray-400 mr-2 group-hover:text-brand-500" />
                          <span className="text-gray-700 group-hover:text-brand-700 truncate">{suggestion}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-brand-600 to-brand-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl flex items-center justify-center relative overflow-hidden group">
                  <MagnifyingGlassIcon className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Buscar</span>
                  <span className="sm:hidden">Buscar</span>
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 border-2 border-brand-200/50 rounded-lg hover:bg-gradient-to-r hover:from-brand-50 hover:to-brand-100 hover:border-brand-500 transition-all duration-300 font-medium text-sm group relative overflow-hidden bg-gradient-to-r from-white/90 to-brand-50/30">
                  <motion.div animate={{ rotate: showAdvancedFilters ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <FunnelIcon className="w-4 h-4 mr-1 sm:mr-2 group-hover:text-brand-600 transition-colors duration-300" />
                  </motion.div>
                  <span className="group-hover:text-brand-700 transition-colors duration-300 hidden sm:inline">Filtros</span>
                  <span className="sm:hidden">Filtros</span>
                </motion.button>
              </motion.div>

              {showAdvancedFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }} whileHover={{ scale: 1.02 }} className="relative group">
                    <HomeIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-brand-500 transition-colors duration-300" />
                    <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full pl-8 sm:pl-10 pr-5 sm:pr-6 py-2 sm:py-3 border-2 border-brand-200/50 rounded-md sm:rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 appearance-none bg-gradient-to-r from-white/90 to-brand-50/30 transition-all duration-300 hover:border-brand-400 hover:from-white hover:to-brand-100/50 text-sm cursor-pointer group-hover:shadow-md">
                      {propertyTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none group-hover:text-brand-500 transition-colors duration-300" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }} whileHover={{ scale: 1.02 }} className="relative group">
                    <MapPinIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-brand-500 transition-colors duration-300" />
                    <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full pl-8 sm:pl-10 pr-5 sm:pr-6 py-2 sm:py-3 border-2 border-brand-200/50 rounded-md sm:rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 appearance-none bg-gradient-to-r from-white/90 to-brand-50/30 transition-all duration-300 hover:border-brand-400 hover:from-white hover:to-brand-100/50 text-sm cursor-pointer group-hover:shadow-md">
                      {locations.map((loc) => (
                        <option key={loc.value} value={loc.value}>{loc.label}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none group-hover:text-brand-500 transition-colors duration-300" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }} whileHover={{ scale: 1.02 }} className="relative group">
                    <CurrencyDollarIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-brand-500 transition-colors duration-300" />
                    <input type="number" placeholder="Precio min" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border-2 border-brand-200/50 rounded-md sm:rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 hover:border-brand-400 bg-gradient-to-r from-white/90 to-brand-50/30 hover:from-white hover:to-brand-100/50 text-sm group-hover:shadow-md" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }} whileHover={{ scale: 1.02 }} className="relative group">
                    <CurrencyDollarIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-brand-500 transition-colors duration-300" />
                    <input type="number" placeholder="Precio max" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border-2 border-brand-200/50 rounded-md sm:rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 hover:border-brand-400 bg-gradient-to-r from-white/90 to-brand-50/30 hover:from-white hover:to-brand-100/50 text-sm group-hover:shadow-md" />
                  </motion.div>
                </motion.div>
              )}

              {showAdvancedFilters && (
                <motion.div initial={{ opacity: 0, height: 0, y: -20 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -20 }} transition={{ duration: 0.4, ease: "easeInOut" }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-6 bg-gradient-to-r from-gray-50 to-brand-50 rounded-xl border border-brand-100 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '20px 20px' }}></div>
                  </div>

                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="relative group">
                    <BuildingOfficeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-brand-500 transition-colors duration-300" />
                    <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="w-full pl-12 pr-8 py-3 border-2 border-brand-200/50 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 appearance-none bg-gradient-to-r from-white/90 to-brand-50/30 hover:border-brand-400 hover:from-white hover:to-brand-100/50 transition-all duration-300 cursor-pointer group-hover:shadow-md">
                      <option value="">Dormitorios</option>
                      <option value="1">1 dormitorio</option>
                      <option value="2">2 dormitorios</option>
                      <option value="3">3 dormitorios</option>
                      <option value="4+">4+ dormitorios</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-hover:text-brand-500 transition-colors duration-300" />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="relative group">
                    <WrenchScrewdriverIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-brand-500 transition-colors duration-300" />
                    <select value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="w-full pl-12 pr-8 py-3 border-2 border-brand-200/50 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 appearance-none bg-gradient-to-r from-white/90 to-brand-50/30 hover:border-brand-400 hover:from-white hover:to-brand-100/50 transition-all duration-300 cursor-pointer group-hover:shadow-md">
                      <option value="">Baños</option>
                      <option value="1">1 baño</option>
                      <option value="2">2 baños</option>
                      <option value="3">3 baños</option>
                      <option value="4+">4+ baños</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-hover:text-brand-500 transition-colors duration-300" />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="flex items-center justify-between">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={clearFilters} className="flex items-center px-4 py-3 text-gray-600 hover:text-brand-600 transition-all duration-300 hover:bg-white/50 rounded-lg group relative overflow-hidden">
                      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 3 }}>
                        <XMarkIcon className="w-5 h-5 mr-2 group-hover:text-brand-600 transition-colors duration-300" />
                      </motion.div>
                      <span className="group-hover:text-brand-700 transition-colors duration-300 font-medium">Limpiar Filtros</span>
                      <motion.div initial={{ x: "-100%" }} whileHover={{ x: "100%" }} transition={{ duration: 0.6 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-200/30 to-transparent"></motion.div>
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}

              {showAdvancedFilters && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ delay: 0.5, duration: 0.6 }} className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }} className="text-center mb-2">
                    <h3 className="text-xs font-semibold text-gray-700 mb-1 flex items-center justify-center">
                      <FunnelIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-brand-500" />
                      Filtros Rápidos
                    </h3>
                  </motion.div>
                  <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                    {quickFilters.map((filter, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickFilter(filter)}
                        className={`flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-all duration-300 font-medium text-xs relative overflow-hidden group ${
                          activeQuickFilter === filter.value
                            ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg transform scale-105'
                            : 'bg-gray-100 hover:bg-gradient-to-r hover:from-brand-100 hover:to-brand-200 text-gray-700 hover:text-brand-700 hover:shadow-md'
                        }`}
                      >
                        <motion.div initial={{ x: "-100%" }} whileHover={{ x: "100%" }} transition={{ duration: 0.6 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></motion.div>
                        <motion.div animate={{ rotate: activeQuickFilter === filter.value ? [0, 10, -10, 0] : 0, scale: activeQuickFilter === filter.value ? [1, 1.1, 1] : 1 }} transition={{ duration: 0.5 }}>
                          <filter.icon className={`w-3 h-3 mr-1 relative z-10 ${activeQuickFilter === filter.value ? 'text-white' : 'text-gray-500 group-hover:text-brand-600'}`} />
                        </motion.div>
                        <span className="hidden sm:inline relative z-10">{filter.label}</span>
                        <span className="sm:hidden relative z-10">{filter.label.split(' ')[0]}</span>
                        {activeQuickFilter === filter.value && (
                          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                            <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 relative z-10" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-8 mt-6 sm:mt-8 lg:mt-16">
            {stats.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.8 + index * 0.2, duration: 0.8, ease: "easeOut" }} whileHover={{ scale: 1.05, y: -5 }} className="text-center group relative">
                <motion.div whileHover={{ rotateY: 5, rotateX: 5 }} className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/30 hover:bg-white/25 transition-all duration-500 group-hover:shadow-2xl relative overflow-hidden">
                  <motion.div initial={{ scale: 0, opacity: 0 }} whileHover={{ scale: 1, opacity: 0.1 }} transition={{ duration: 0.6 }} className="absolute inset-0 bg-gradient-to-r from-brand-400/20 to-brand-600/20 rounded-lg sm:rounded-xl lg:rounded-2xl"></motion.div>
                  <motion.div animate={{ boxShadow: ["0 0 0px rgba(99, 102, 241, 0)", "0 0 20px rgba(99, 102, 241, 0.3)", "0 0 0px rgba(99, 102, 241, 0)"] }} transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }} className="absolute inset-0 rounded-lg sm:rounded-xl lg:rounded-2xl"></motion.div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + index * 0.2, duration: 0.6, ease: "easeOut" }} className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-1 sm:mb-2 group-hover:text-brand-300 transition-colors relative z-10">
                    {stat.value}
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 + index * 0.2, duration: 0.6 }} className="text-xs sm:text-sm text-gray-200 group-hover:text-white transition-colors font-medium relative z-10 leading-tight">
                    {stat.label}
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SearchHeroSection;


