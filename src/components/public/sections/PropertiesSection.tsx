"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Datos de ejemplo
const properties = [
  {
    id: 1,
    title: 'Casa Moderna en Asunción Centro',
    type: 'venta',
    price: 850000000,
    currency: 'PYG',
    location: 'Asunción, Paraguay',
    bedrooms: 4,
    bathrooms: 3,
    area: 180,
    parking: 2,
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    description: 'Hermosa casa moderna en el corazón de Asunción.',
    agent: {
      name: 'María González',
      company: 'Propiedades Premium',
      phone: '+595 123 456 789',
      email: 'maria@propiedades.com',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      verified: true
    },
    views: 245
  },
  {
    id: 2,
    title: 'Apartamento de Lujo en Ciudad del Este',
    type: 'alquiler',
    price: 2500000,
    currency: 'PYG',
    pricePeriod: 'mensual',
    location: 'Ciudad del Este, Paraguay',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    parking: 1,
    images: ['https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'],
    description: 'Apartamento moderno y elegante con vista panorámica.',
    agent: {
      name: 'Carlos Ramírez',
      company: 'Luxury Real Estate',
      phone: '+595 987 654 321',
      email: 'carlos@luxury.com',
      avatar: 'https://randomuser.me/api/portraits/men/78.jpg',
      verified: true
    },
    views: 189
  },
  {
    id: 3,
    title: 'Casa Familiar en San Lorenzo',
    type: 'venta',
    price: 650000000,
    currency: 'PYG',
    location: 'San Lorenzo, Paraguay',
    bedrooms: 5,
    bathrooms: 4,
    area: 220,
    parking: 3,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    description: 'Casa espaciosa perfecta para familias grandes.',
    agent: {
      name: 'Ana López',
      company: 'Familias Real Estate',
      phone: '+595 456 789 123',
      email: 'ana@familias.com',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      verified: false
    },
    views: 312
  }
];

const propertyTypes = [
  { value: '', label: 'Todos los Tipos' },
  { value: 'venta', label: 'Venta' },
  { value: 'alquiler', label: 'Alquiler' }
];

const propertyCategories = [
  { value: '', label: 'Todas las Categorías' },
  { value: 'casa', label: 'Casas' },
  { value: 'apartamento', label: 'Departamentos' },
  { value: 'oficina', label: 'Oficinas' },
  { value: 'terreno', label: 'Terrenos' }
];

const cities = [
  { value: '', label: 'Todas las Ciudades' },
  { value: 'Asunción', label: 'Asunción' },
  { value: 'Ciudad del Este', label: 'Ciudad del Este' },
  { value: 'San Lorenzo', label: 'San Lorenzo' }
];

const priceRanges = [
  { value: '', label: 'Cualquier Precio' },
  { value: '0-300000000', label: 'Hasta ₲300M' },
  { value: '300000000-600000000', label: '₲300M - ₲600M' },
  { value: '600000000-1000000000', label: '₲600M - ₲1.000M' },
  { value: '1000000000+', label: 'Más de ₲1.000M' }
];

const bedroomsOptions = [
  { value: '', label: 'Cualquier cantidad' },
  { value: '1', label: '1 dormitorio' },
  { value: '2', label: '2 dormitorios' },
  { value: '3', label: '3 dormitorios' },
  { value: '4', label: '4 dormitorios' },
  { value: '5+', label: '5+ dormitorios' }
];

const bathroomsOptions = [
  { value: '', label: 'Cualquier cantidad' },
  { value: '1', label: '1 baño' },
  { value: '2', label: '2 baños' },
  { value: '3', label: '3 baños' },
  { value: '4+', label: '4+ baños' }
];

const areaRanges = [
  { value: '', label: 'Cualquier tamaño' },
  { value: '0-100', label: 'Hasta 100m²' },
  { value: '100-200', label: '100m² - 200m²' },
  { value: '200-300', label: '200m² - 300m²' },
  { value: '300+', label: 'Más de 300m²' }
];

const PropertiesSectionContent = () => {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedBedrooms, setSelectedBedrooms] = useState('');
  const [selectedBathrooms, setSelectedBathrooms] = useState('');
  const [selectedAreaRange, setSelectedAreaRange] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<number[]>([2]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Aplicar filtros desde URL al cargar el componente
  useEffect(() => {
    const tipo = searchParams.get('tipo');
    const categoria = searchParams.get('categoria');
    
    if (tipo) {
      setSelectedType(tipo);
    }
    if (categoria) {
      setSelectedCategory(categoria);
    }
  }, [searchParams]);

  const formatPrice = (price: number, currency: string, period?: string) => {
    const formattedPrice = new Intl.NumberFormat('es-PY').format(price);
    return `$${formattedPrice} ${currency}${period ? `/${period}` : ''}`;
  };

  const getPropertyCategory = (property: any) => {
    if (property.bedrooms === 0 && property.bathrooms === 0) return 'terreno';
    if (property.bedrooms === 0) return 'oficina';
    if (property.area < 100) return 'apartamento';
    return 'casa';
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType ? property.type === selectedType : true;
    const matchesCategory = selectedCategory ? getPropertyCategory(property) === selectedCategory : true;
    const matchesCity = selectedCity ? property.location.includes(selectedCity) : true;
    
    // Filtro de precio
    const matchesPrice = selectedPriceRange ? (() => {
      if (selectedPriceRange === '1000000000+') return property.price >= 1000000000;
      const [min, max] = selectedPriceRange.split('-').map(Number);
      return property.price >= min && property.price <= max;
    })() : true;
    
    // Filtro de dormitorios
    const matchesBedrooms = selectedBedrooms ? (() => {
      if (selectedBedrooms === '5+') return property.bedrooms >= 5;
      return property.bedrooms === parseInt(selectedBedrooms);
    })() : true;
    
    // Filtro de baños
    const matchesBathrooms = selectedBathrooms ? (() => {
      if (selectedBathrooms === '4+') return property.bathrooms >= 4;
      return property.bathrooms === parseInt(selectedBathrooms);
    })() : true;
    
    // Filtro de área
    const matchesArea = selectedAreaRange ? (() => {
      if (selectedAreaRange === '300+') return property.area >= 300;
      const [min, max] = selectedAreaRange.split('-').map(Number);
      return property.area >= min && property.area <= max;
    })() : true;
    
    return matchesSearch && matchesType && matchesCategory && matchesCity && matchesPrice && matchesBedrooms && matchesBathrooms && matchesArea;
  });

  const toggleFavorite = (propertyId: number) => {
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedCategory('');
    setSelectedCity('');
    setSelectedPriceRange('');
    setSelectedBedrooms('');
    setSelectedBathrooms('');
    setSelectedAreaRange('');
    setShowAdvancedFilters(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section con Filtros */}
      <section className="relative -mt-14 sm:-mt-16 min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        {/* Patrón de cuadrícula de bienes raíces */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="property-grid-propiedades" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="none" stroke="cyan" strokeWidth="0.5" opacity="0.3"/>
                <rect x="10" y="10" width="60" height="45" fill="none" stroke="cyan" strokeWidth="0.3" opacity="0.4" rx="2"/>
                <rect x="15" y="45" width="10" height="8" fill="cyan" opacity="0.2"/>
                <rect x="30" y="45" width="8" height="8" fill="cyan" opacity="0.2"/>
                <rect x="45" y="45" width="8" height="8" fill="cyan" opacity="0.2"/>
                <circle cx="20" cy="25" r="3" fill="cyan" opacity="0.3"/>
                <circle cx="35" cy="30" r="2" fill="cyan" opacity="0.3"/>
                <circle cx="55" cy="20" r="1.5" fill="cyan" opacity="0.4"/>
                <rect x="25" y="15" width="4" height="6" fill="none" stroke="cyan" strokeWidth="0.2" opacity="0.3"/>
                <rect x="40" y="18" width="4" height="6" fill="none" stroke="cyan" strokeWidth="0.2" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#property-grid-propiedades)" />
          </svg>
        </div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-4 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-32 sm:top-40 right-4 sm:right-20 w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-16 sm:bottom-20 left-1/4 w-20 h-20 sm:w-24 sm:h-24 bg-cyan-300/20 rounded-full blur-xl animate-bounce"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-12 sm:pt-16 pb-8 sm:pb-12 w-full z-10">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 leading-tight">
              Encuentra{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                propiedades
              </span>
              {' '}en Paraguay
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-cyan-100 max-w-2xl mx-auto mb-6 px-4">
              Descubre las mejores propiedades disponibles en Paraguay
            </p>
          </div>

          {/* Filtros en el Hero - Mejorados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
          {/* Mobile: Sistema de filtros expandible ultra premium */}
          <div className="block sm:hidden">
            <div className="bg-gradient-to-br from-black/40 via-black/25 to-black/15 backdrop-blur-2xl rounded-3xl p-6 border border-white/40 shadow-[0_20px_80px_rgba(0,0,0,0.3)] relative overflow-hidden">
              {/* Efecto de brillos animados */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent"></div>
              
              {/* Header con título y toggle */}
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-cyan-400/30">
                    <svg className="h-5 w-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
              </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Filtrar Propiedades</h3>
                    <p className="text-cyan-200/70 text-xs">Encuentra tu propiedad ideal</p>
                  </div>
            </div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="group p-3 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 rounded-2xl border border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <svg className={`h-5 w-5 text-cyan-300 transition-transform duration-500 ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
            </div>

              {/* Filtros básicos siempre visibles */}
              <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                {/* Tipo de Propiedad */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-20">
                    <svg className="h-4 w-4 text-cyan-400 group-focus-within:text-cyan-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 border border-cyan-400/30 hover:border-cyan-300/50 rounded-2xl focus:ring-2 focus:ring-cyan-300/50 focus:border-cyan-200/70 appearance-none text-sm bg-white/98 backdrop-blur-sm shadow-xl text-gray-900 font-semibold hover:bg-white transition-all duration-300 hover:shadow-2xl group-focus-within:shadow-cyan-500/20"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-20">
                    <svg className="h-4 w-4 text-cyan-500 group-focus-within:text-cyan-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
            </div>

                {/* Ubicación */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-20">
                    <svg className="h-4 w-4 text-cyan-400 group-focus-within:text-cyan-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 border border-cyan-400/30 hover:border-cyan-300/50 rounded-2xl focus:ring-2 focus:ring-cyan-300/50 focus:border-cyan-200/70 appearance-none text-sm bg-white/98 backdrop-blur-sm shadow-xl text-gray-900 font-semibold hover:bg-white transition-all duration-300 hover:shadow-2xl"
                  >
                    {cities.map(city => (
                      <option key={city.value} value={city.value}>{city.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-20">
                    <svg className="h-4 w-4 text-cyan-500 group-focus-within:text-cyan-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Filtros avanzados expandibles */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: showAdvancedFilters ? 'auto' : 0,
                  opacity: showAdvancedFilters ? 1 : 0
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="overflow-hidden relative z-10"
              >
                <div className="pb-4">
                  {/* Separador elegante */}
                  <div className="flex items-center my-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"></div>
                    <div className="px-3 text-cyan-200/80 text-xs font-medium">FILTROS AVANZADOS</div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"></div>
                  </div>

                  {/* Grid de filtros avanzados */}
                  <div className="space-y-4">
                    {/* Fila 1: Precio y Categoría */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-20">
                          <svg className="h-4 w-4 text-cyan-400 group-focus-within:text-cyan-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <select
                          value={selectedPriceRange}
                          onChange={(e) => setSelectedPriceRange(e.target.value)}
                          className="w-full pl-12 pr-10 py-4 border border-cyan-400/30 hover:border-cyan-300/50 rounded-2xl focus:ring-2 focus:ring-cyan-300/50 focus:border-cyan-200/70 appearance-none text-sm bg-white/98 backdrop-blur-sm shadow-xl text-gray-900 font-semibold hover:bg-white transition-all duration-300 hover:shadow-2xl"
                        >
                          {priceRanges.map(range => (
                            <option key={range.value} value={range.value}>{range.label}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-20">
                          <svg className="h-4 w-4 text-cyan-500 group-focus-within:text-cyan-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-20">
                          <svg className="h-4 w-4 text-cyan-400 group-focus-within:text-cyan-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full pl-12 pr-10 py-4 border border-cyan-400/30 hover:border-cyan-300/50 rounded-2xl focus:ring-2 focus:ring-cyan-300/50 focus:border-cyan-200/70 appearance-none text-sm bg-white/98 backdrop-blur-sm shadow-xl text-gray-900 font-semibold hover:bg-white transition-all duration-300 hover:shadow-2xl"
              >
                {propertyCategories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-20">
                          <svg className="h-4 w-4 text-cyan-500 group-focus-within:text-cyan-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Fila 2: Dormitorios y Baños */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-20">
                          <svg className="h-4 w-4 text-cyan-400 group-focus-within:text-cyan-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          </svg>
                        </div>
                        <select
                          value={selectedBedrooms}
                          onChange={(e) => setSelectedBedrooms(e.target.value)}
                          className="w-full pl-12 pr-10 py-4 border border-cyan-400/30 hover:border-cyan-300/50 rounded-2xl focus:ring-2 focus:ring-cyan-300/50 focus:border-cyan-200/70 appearance-none text-sm bg-white/98 backdrop-blur-sm shadow-xl text-gray-900 font-semibold hover:bg-white transition-all duration-300 hover:shadow-2xl"
                        >
                          {bedroomsOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-20">
                          <svg className="h-4 w-4 text-cyan-500 group-focus-within:text-cyan-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-20">
                          <svg className="h-4 w-4 text-cyan-400 group-focus-within:text-cyan-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11" />
                          </svg>
                        </div>
                        <select
                          value={selectedBathrooms}
                          onChange={(e) => setSelectedBathrooms(e.target.value)}
                          className="w-full pl-12 pr-10 py-4 border border-cyan-400/30 hover:border-cyan-300/50 rounded-2xl focus:ring-2 focus:ring-cyan-300/50 focus:border-cyan-200/70 appearance-none text-sm bg-white/98 backdrop-blur-sm shadow-xl text-gray-900 font-semibold hover:bg-white transition-all duration-300 hover:shadow-2xl"
                        >
                          {bathroomsOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-20">
                          <svg className="h-4 w-4 text-cyan-500 group-focus-within:text-cyan-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Fila 3: Área - Full width */}
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-20">
                        <svg className="h-4 w-4 text-cyan-400 group-focus-within:text-cyan-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </div>
                      <select
                        value={selectedAreaRange}
                        onChange={(e) => setSelectedAreaRange(e.target.value)}
                        className="w-full pl-12 pr-10 py-4 border border-cyan-400/30 hover:border-cyan-300/50 rounded-2xl focus:ring-2 focus:ring-cyan-300/50 focus:border-cyan-200/70 appearance-none text-sm bg-white/98 backdrop-blur-sm shadow-xl text-gray-900 font-semibold hover:bg-white transition-all duration-300 hover:shadow-2xl"
                      >
                        {areaRanges.map(range => (
                          <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-20">
                        <svg className="h-4 w-4 text-cyan-500 group-focus-within:text-cyan-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Separador brillante */}
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent mb-5 relative z-10"></div>

              {/* Footer mejorado */}
              <div className="flex items-center justify-between text-sm relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse shadow-lg shadow-cyan-500/50"></div>
                    <span className="text-white font-semibold">
                      {filteredProperties.length}
                    </span>
                    <span className="text-cyan-200/80 font-medium">
                      {filteredProperties.length === 1 ? 'propiedad' : 'propiedades'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={clearFilters}
                  className="group relative overflow-hidden text-cyan-200 hover:text-white font-bold bg-gradient-to-r from-white/15 to-white/10 hover:from-white/25 hover:to-white/15 px-5 py-3 rounded-2xl transition-all duration-300 border border-white/30 hover:border-white/50 flex items-center space-x-2 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <svg className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="relative z-10">Limpiar Filtros</span>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop: Sistema ultra profesional expandible */}
          <div className="hidden sm:block">
            <div className="bg-gradient-to-br from-black/50 via-black/30 to-black/20 backdrop-blur-3xl rounded-3xl p-8 border border-white/50 shadow-[0_25px_100px_rgba(0,0,0,0.4)] relative overflow-hidden">
              {/* Efectos de fondo */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/8 via-transparent to-blue-500/8 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent"></div>
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              {/* Header superior */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/25 to-blue-500/25 rounded-2xl backdrop-blur-sm border border-cyan-400/40 shadow-lg">
                    <svg className="h-6 w-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-2xl mb-1">Búsqueda Avanzada</h3>
                    <p className="text-cyan-200/80 text-sm">Encuentra la propiedad perfecta con filtros inteligentes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-2 rounded-xl border border-cyan-400/30">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-cyan-100 font-semibold text-sm">
                      {filteredProperties.length} resultados
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="group relative px-6 py-3 bg-gradient-to-r from-white/15 to-white/10 hover:from-white/25 hover:to-white/15 rounded-2xl border border-white/40 hover:border-white/60 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-cyan-200 font-semibold text-sm">
                        {showAdvancedFilters ? 'Ocultar' : 'Más'} Filtros
                      </span>
                      <svg className={`h-4 w-4 text-cyan-300 transition-transform duration-500 ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              {/* Filtros básicos */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6 relative z-10">
                <div className="lg:col-span-2 relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-20">
                    <svg className="h-5 w-5 text-cyan-400 group-focus-within:text-cyan-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por ubicación, título, características..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 border border-cyan-400/40 hover:border-cyan-300/60 rounded-2xl focus:ring-2 focus:ring-cyan-300/60 focus:border-cyan-200/80 text-base bg-white/98 backdrop-blur-sm shadow-xl text-gray-900 placeholder-gray-500 font-semibold hover:bg-white transition-all duration-300 hover:shadow-2xl"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-20">
                    <svg className="h-5 w-5 text-cyan-400 group-focus-within:text-cyan-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 border border-cyan-400/40 hover:border-cyan-300/60 rounded-2xl focus:ring-2 focus:ring-cyan-300/60 focus:border-cyan-200/80 appearance-none text-base bg-white/98 backdrop-blur-sm shadow-xl text-gray-900 font-semibold hover:bg-white transition-all duration-300 hover:shadow-2xl"
                  >
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-20">
                    <svg className="h-5 w-5 text-cyan-500 group-focus-within:text-cyan-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-20">
                    <svg className="h-5 w-5 text-cyan-400 group-focus-within:text-cyan-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 border border-cyan-400/40 hover:border-cyan-300/60 rounded-2xl focus:ring-2 focus:ring-cyan-300/60 focus:border-cyan-200/80 appearance-none text-base bg-white/98 backdrop-blur-sm shadow-xl text-gray-900 font-semibold hover:bg-white transition-all duration-300 hover:shadow-2xl"
              >
                {cities.map(city => (
                  <option key={city.value} value={city.value}>{city.label}</option>
                ))}
              </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-20">
                    <svg className="h-5 w-5 text-cyan-500 group-focus-within:text-cyan-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
            </div>

              {/* Filtros avanzados expandibles */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: showAdvancedFilters ? 'auto' : 0,
                  opacity: showAdvancedFilters ? 1 : 0
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="overflow-hidden relative z-10"
              >
                <div className="pb-6">
                  <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-cyan-500/40"></div>
                    <div className="px-6 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-400/30">
                      <span className="text-cyan-200 text-sm font-bold tracking-wider">FILTROS AVANZADOS</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/40 via-cyan-300/60 to-transparent"></div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="relative group">
                        <label className="block text-cyan-200 text-sm font-semibold mb-2">Rango de Precio</label>
                        <div className="absolute inset-y-0 top-6 left-0 pl-4 flex items-center pointer-events-none z-20">
                          <svg className="h-5 w-5 text-cyan-400 group-focus-within:text-cyan-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <select
                          value={selectedPriceRange}
                          onChange={(e) => setSelectedPriceRange(e.target.value)}
                          className="w-full pl-12 pr-10 py-4 mt-6 border border-cyan-400/40 hover:border-cyan-300/60 rounded-2xl focus:ring-2 focus:ring-cyan-300/60 focus:border-cyan-200/80 appearance-none text-base bg-white/98 backdrop-blur-sm shadow-xl text-gray-900 font-semibold hover:bg-white transition-all duration-300 hover:shadow-2xl"
                        >
                          {priceRanges.map(range => (
                            <option key={range.value} value={range.value}>{range.label}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 top-6 right-0 flex items-center pr-4 pointer-events-none z-20">
                          <svg className="h-5 w-5 text-cyan-500 group-focus-within:text-cyan-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      <div className="relative group">
                        <label className="block text-cyan-200 text-sm font-semibold mb-2">Categoría</label>
                        <div className="absolute inset-y-0 top-6 left-0 pl-4 flex items-center pointer-events-none z-20">
                          <svg className="h-5 w-5 text-cyan-400 group-focus-within:text-cyan-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full pl-12 pr-10 py-4 mt-6 border border-cyan-400/40 hover:border-cyan-300/60 rounded-2xl focus:ring-2 focus:ring-cyan-300/60 focus:border-cyan-200/80 appearance-none text-base bg-white/98 backdrop-blur-sm shadow-xl text-gray-900 font-semibold hover:bg-white transition-all duration-300 hover:shadow-2xl"
                        >
                          {propertyCategories.map(category => (
                            <option key={category.value} value={category.value}>{category.label}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 top-6 right-0 flex items-center pr-4 pointer-events-none z-20">
                          <svg className="h-5 w-5 text-cyan-500 group-focus-within:text-cyan-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      <div className="relative group">
                        <label className="block text-cyan-200 text-sm font-semibold mb-2">Dormitorios</label>
                        <div className="absolute inset-y-0 top-6 left-0 pl-4 flex items-center pointer-events-none z-20">
                          <svg className="h-5 w-5 text-cyan-400 group-focus-within:text-cyan-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          </svg>
                        </div>
                        <select
                          value={selectedBedrooms}
                          onChange={(e) => setSelectedBedrooms(e.target.value)}
                          className="w-full pl-12 pr-10 py-4 mt-6 border border-cyan-400/40 hover:border-cyan-300/60 rounded-2xl focus:ring-2 focus:ring-cyan-300/60 focus:border-cyan-200/80 appearance-none text-base bg-white/98 backdrop-blur-sm shadow-xl text-gray-900 font-semibold hover:bg-white transition-all duration-300 hover:shadow-2xl"
                        >
                          {bedroomsOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 top-6 right-0 flex items-center pr-4 pointer-events-none z-20">
                          <svg className="h-5 w-5 text-cyan-500 group-focus-within:text-cyan-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative group">
                        <label className="block text-cyan-200 text-sm font-semibold mb-2">Baños</label>
                        <div className="absolute inset-y-0 top-6 left-0 pl-4 flex items-center pointer-events-none z-20">
                          <svg className="h-5 w-5 text-cyan-400 group-focus-within:text-cyan-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11" />
                </svg>
                        </div>
                        <select
                          value={selectedBathrooms}
                          onChange={(e) => setSelectedBathrooms(e.target.value)}
                          className="w-full pl-12 pr-10 py-4 mt-6 border border-cyan-400/40 hover:border-cyan-300/60 rounded-2xl focus:ring-2 focus:ring-cyan-300/60 focus:border-cyan-200/80 appearance-none text-base bg-white/98 backdrop-blur-sm shadow-xl text-gray-900 font-semibold hover:bg-white transition-all duration-300 hover:shadow-2xl"
                        >
                          {bathroomsOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 top-6 right-0 flex items-center pr-4 pointer-events-none z-20">
                          <svg className="h-5 w-5 text-cyan-500 group-focus-within:text-cyan-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
          </div>

                      <div className="relative group">
                        <label className="block text-cyan-200 text-sm font-semibold mb-2">Área</label>
                        <div className="absolute inset-y-0 top-6 left-0 pl-4 flex items-center pointer-events-none z-20">
                          <svg className="h-5 w-5 text-cyan-400 group-focus-within:text-cyan-300 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        </div>
                        <select
                          value={selectedAreaRange}
                          onChange={(e) => setSelectedAreaRange(e.target.value)}
                          className="w-full pl-12 pr-10 py-4 mt-6 border border-cyan-400/40 hover:border-cyan-300/60 rounded-2xl focus:ring-2 focus:ring-cyan-300/60 focus:border-cyan-200/80 appearance-none text-base bg-white/98 backdrop-blur-sm shadow-xl text-gray-900 font-semibold hover:bg-white transition-all duration-300 hover:shadow-2xl"
                        >
                          {areaRanges.map(range => (
                            <option key={range.value} value={range.value}>{range.label}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 top-6 right-0 flex items-center pr-4 pointer-events-none z-20">
                          <svg className="h-5 w-5 text-cyan-500 group-focus-within:text-cyan-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Footer premium */}
              <div className="flex items-center justify-between pt-6 border-t border-cyan-300/20 relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-3 rounded-xl border border-cyan-400/30">
                    <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse shadow-lg shadow-cyan-500/50"></div>
                    <span className="text-white font-bold text-lg">
                      {filteredProperties.length}
                    </span>
                    <span className="text-cyan-200 font-semibold">
                      {filteredProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
            </span>
                  </div>
                </div>
            <button
              onClick={clearFilters}
                  className="group relative overflow-hidden bg-gradient-to-r from-white/20 to-white/15 hover:from-white/30 hover:to-white/20 text-cyan-200 hover:text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 border border-white/40 hover:border-white/60 flex items-center space-x-3 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-cyan-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <svg className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="relative z-10">Limpiar Filtros</span>
            </button>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </section>

      {/* Sección de Lista de Propiedades */}
      <div className="bg-gradient-to-b from-white via-gray-50 to-cyan-50 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">

        {/* Lista de Propiedades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8' : 'space-y-4 sm:space-y-6'}
        >
          {filteredProperties.length > 0 ? (
            filteredProperties.map(property => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className={`group bg-gradient-to-br from-white via-white to-gray-50/50 rounded-2xl lg:rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100/50 overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:scale-[1.02] relative ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''}`}
              >
              {/* Imagen con overlay premium */}
              <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-full sm:w-80 h-48 sm:h-64' : 'h-52 sm:h-60 lg:h-72'}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10"></div>
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Badge tipo premium */}
                <div className="absolute top-4 left-4 z-20">
                  <div className={`px-4 py-2 rounded-2xl backdrop-blur-md border font-bold text-sm shadow-xl ${
                    property.type === 'venta' 
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white border-emerald-400/50 shadow-emerald-500/30' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/50 shadow-blue-500/30'
                  }`}>
                    {property.type === 'venta' ? '🏠 Venta' : '🏢 Alquiler'}
                  </div>
                </div>
                
                {/* Botones de acción premium */}
                <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(property.id);
                    }}
                    className={`group/btn p-3 rounded-2xl backdrop-blur-md transition-all duration-300 shadow-xl hover:scale-110 active:scale-95 ${
                      favorites.includes(property.id)
                        ? 'bg-red-600 text-white border border-red-500/50 shadow-red-500/30'
                        : 'bg-white/95 text-gray-700 hover:text-red-600 border border-white/70 hover:shadow-red-500/20'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={favorites.includes(property.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="group/btn p-3 bg-white/95 text-gray-700 hover:text-cyan-600 rounded-2xl backdrop-blur-md transition-all duration-300 shadow-xl hover:scale-110 active:scale-95 border border-white/70 hover:shadow-cyan-500/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                </div>
                
                {/* Contador de vistas premium */}
                <div className="absolute bottom-4 left-4 z-20">
                  <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-semibold">{property.views} vistas</span>
                  </div>
                </div>
                
                {/* Indicador de múltiples fotos */}
                {property.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 z-20">
                    <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-white text-sm font-medium">{property.images.length}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Detalles con diseño premium compacto */}
              <div className={`p-4 lg:p-5 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                {/* Header con título y precio compacto */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                  <div className="flex-1 sm:pr-3">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 mb-1">
                    {property.title}
                  </h3>
                  </div>
                  <div className="flex-shrink-0">
                  <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">
                      {formatPrice(property.price, property.currency, property.pricePeriod)}
                    </div>
                    {property.type === 'alquiler' && (
                        <div className="text-xs text-gray-600 font-semibold">por mes</div>
                    )}
                    </div>
                  </div>
                </div>

                {/* Ubicación compacta */}
                <div className="flex items-center text-gray-600 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg mr-2 shadow-sm">
                    <svg className="w-3 h-3 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{property.location}</span>
                </div>

                {/* Características compactas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  <div className="flex items-center bg-gradient-to-br from-gray-50 to-gray-100/80 p-2 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300">
                    <div className="p-1.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mr-2 shadow-sm">
                      <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{property.bedrooms}</div>
                      <div className="text-xs text-gray-700 font-medium">Dorm.</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-gradient-to-br from-gray-50 to-gray-100/80 p-2 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300">
                    <div className="p-1.5 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg mr-2 shadow-sm">
                      <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{property.bathrooms}</div>
                      <div className="text-xs text-gray-700 font-medium">Baños</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-gradient-to-br from-gray-50 to-gray-100/80 p-2 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300">
                    <div className="p-1.5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mr-2 shadow-sm">
                      <svg className="w-3 h-3 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{property.area}</div>
                      <div className="text-xs text-gray-700 font-medium">m²</div>
                    </div>
                  </div>
                  <div className="flex items-center bg-gray-50 px-2 sm:px-3 py-1 rounded-full">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    <span className="font-medium text-xs sm:text-sm">{property.parking}</span>
                  </div>
                </div>

                <p className="text-gray-700 text-xs mb-3 line-clamp-2 font-medium leading-relaxed">
                  {property.description}
                </p>

                {/* Sección del agente con mucho amor 💕 compacta */}
                <div className="relative mt-3 p-3 bg-gradient-to-br from-gray-50 via-white to-gray-50/50 rounded-xl border border-gray-100 shadow-sm">
                  {/* Decoración sutil */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-t-2xl"></div>
                  
                  {/* Header del agente compacto */}
                  <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                      <div className="relative">
                    <img
                      src={property.agent.avatar}
                      alt={property.agent.name}
                          className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-lg ring-2 ring-gray-100"
                    />
                        {property.agent.verified && (
                          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <h4 className="font-bold text-gray-900 text-sm">
                            {property.agent.name}
                          </h4>
                          {property.agent.verified && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 font-medium">
                        {property.agent.company}
                        </p>
                        <div className="flex items-center">
                          <div className="flex space-x-0.5">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-2.5 h-2.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-1">4.9</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Botones de contacto compactos */}
                  <div className="flex space-x-1.5">
                    <a
                      href={`tel:${property.agent.phone}`}
                      className="group p-2 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-110 active:scale-95"
                      title="Llamar ahora"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                    <a
                      href={`https://wa.me/${property.agent.phone}`}
                      className="group p-2 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg hover:shadow-green-600/25 transition-all duration-300 hover:scale-110 active:scale-95"
                      title="WhatsApp"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.786"/>
                      </svg>
                    </a>
                    <a
                      href={`mailto:${property.agent.email}`}
                      className="group p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-110 active:scale-95"
                      title="Enviar email"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </div>
                </div>

                  {/* Separador elegante compacto */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-3"></div>

                  {/* Acciones principales compactas */}
                  <div className="flex items-center justify-between">
                    <button className="flex-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-xl font-bold text-xs transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden mr-3">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <div className="flex items-center justify-center space-x-1 relative z-10">
                        <span>Ver Detalles</span>
                        <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                  </button>
                    
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-px bg-gray-200"></div>
                      <a
                        href={`tel:${property.agent.phone}`}
                        className="group flex items-center space-x-1 text-cyan-600 hover:text-cyan-800 font-bold text-xs transition-all duration-300 hover:scale-105"
                      >
                        <svg className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="group-hover:underline">Contactar</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No se encontraron propiedades
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Intenta ajustar tus filtros de búsqueda para encontrar más resultados o explora otras opciones.
              </p>
              <button
                onClick={clearFilters}
                className="px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </motion.div>
        </div>
      </div>
    </div>
  );
};

const PropertiesSection = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Cargando...</div>}>
      <PropertiesSectionContent />
    </Suspense>
  );
};

export default PropertiesSection;