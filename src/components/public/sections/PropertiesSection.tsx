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

const PropertiesSectionContent = () => {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<number[]>([2]);

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
    return matchesSearch && matchesType && matchesCategory && matchesCity;
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
  };

  return (
    <div className="bg-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Filtros - Optimizados para móvil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 mb-6 sm:mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar propiedades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none text-sm sm:text-base"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none text-sm sm:text-base"
              >
                {propertyCategories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none text-sm sm:text-base"
              >
                {cities.map(city => (
                  <option key={city.value} value={city.value}>{city.label}</option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base ${viewMode === 'grid' ? 'bg-brand-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="hidden sm:inline">Grilla</span>
                <span className="sm:hidden">📱</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base ${viewMode === 'list' ? 'bg-brand-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Lista</span>
                <span className="sm:hidden">📋</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span className="text-xs sm:text-sm text-gray-600">
              {filteredProperties.length} propiedades encontradas
            </span>
            <button
              onClick={clearFilters}
              className="text-xs sm:text-sm text-brand-600 hover:text-brand-700 font-medium px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-all duration-200"
            >
              Limpiar filtros
            </button>
          </div>
        </motion.div>

        {/* Lista de Propiedades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}
        >
          {filteredProperties.length > 0 ? (
            filteredProperties.map(property => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${viewMode === 'list' ? 'flex' : ''}`}
              >
              {/* Imagen */}
              <div className={`relative ${viewMode === 'list' ? 'w-80 h-64' : 'h-64'}`}>
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    property.type === 'venta' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {property.type === 'venta' ? 'Venta' : 'Alquiler'}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => toggleFavorite(property.id)}
                    className={`p-2 rounded-full transition-all duration-200 shadow-lg ${
                      favorites.includes(property.id)
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={favorites.includes(property.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="p-2 bg-white/90 text-gray-600 rounded-full hover:bg-white hover:text-brand-600 transition-all duration-200 shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-white bg-black/50 px-3 py-1 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-medium">{property.views} vistas</span>
                </div>
              </div>

              {/* Detalles */}
              <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                    {property.title}
                  </h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-brand-600">
                      {formatPrice(property.price, property.currency, property.pricePeriod)}
                    </div>
                    {property.type === 'alquiler' && (
                      <div className="text-sm text-gray-500">por mes</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-gray-600 mb-4">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">{property.location}</span>
                </div>

                <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600">
                  <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    <span className="font-medium">{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span className="font-medium">{property.area} m²</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    <span className="font-medium">{property.parking}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {property.description}
                </p>

                {/* Agente */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <img
                      src={property.agent.avatar}
                      alt={property.agent.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {property.agent.name}
                        </span>
                        {property.agent.verified && (
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {property.agent.company}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={`tel:${property.agent.phone}`}
                      className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                    <a
                      href={`mailto:${property.agent.email}`}
                      className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex space-x-3 mt-4">
                  <button className="flex-1 bg-gradient-to-r from-brand-600 to-brand-700 text-white py-3 px-4 rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all duration-200 text-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    Ver Detalles
                  </button>
                  <button className="px-6 py-3 border-2 border-brand-600 text-brand-600 rounded-lg hover:bg-brand-600 hover:text-white transition-all duration-200 font-medium">
                    Contactar
                  </button>
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