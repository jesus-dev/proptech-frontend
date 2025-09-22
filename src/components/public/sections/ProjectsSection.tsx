"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Datos de ejemplo para proyectos
const projects = [
  {
    id: 1,
    name: 'Torres del Este',
    developer: 'Grupo Inmobiliario Premium',
    location: 'Ciudad del Este, Paraguay',
    type: 'Residencial',
    status: 'En Construcción',
    progress: 65,
    units: 120,
    priceFrom: 180000000,
    priceTo: 350000000,
    currency: 'PYG',
    area: '2,500 m²',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    ],
    description: 'Complejo residencial de lujo con 2 torres de 20 pisos cada una. Ubicado en el corazón de Ciudad del Este, ofrece vistas panorámicas y amenidades de primer nivel.',
    features: ['Piscina', 'Gimnasio', 'Concierge 24/7', 'Terraza', 'Estacionamiento', 'Seguridad'],
    deliveryDate: '2024-12-15',
    isFeatured: true,
    views: 450
  },
  {
    id: 2,
    name: 'Villa San Lorenzo',
    developer: 'Constructora del Sur',
    location: 'San Lorenzo, Paraguay',
    type: 'Residencial',
    status: 'Preventa',
    progress: 25,
    units: 80,
    priceFrom: 120000000,
    priceTo: 280000000,
    currency: 'PYG',
    area: '1,800 m²',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
    ],
    description: 'Desarrollo de casas unifamiliares con diseño moderno y espacios verdes. Perfecto para familias que buscan tranquilidad y comodidad.',
    features: ['Jardines', 'Parque infantil', 'Cancha deportiva', 'Club house', 'Seguridad'],
    deliveryDate: '2025-06-30',
    isFeatured: false,
    views: 320
  },
  {
    id: 3,
    name: 'Centro Empresarial Asunción',
    developer: 'Inversiones Capital',
    location: 'Asunción, Paraguay',
    type: 'Comercial',
    status: 'En Construcción',
    progress: 80,
    units: 45,
    priceFrom: 250000000,
    priceTo: 500000000,
    currency: 'PYG',
    area: '3,200 m²',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
    ],
    description: 'Complejo de oficinas clase A en el centro financiero de Asunción. Diseño moderno con tecnología de punta y certificación LEED.',
    features: ['Aire acondicionado central', 'Sistema de seguridad', 'Estacionamiento subterráneo', 'Cafetería', 'Sala de juntas'],
    deliveryDate: '2024-08-20',
    isFeatured: true,
    views: 280
  },
  {
    id: 4,
    name: 'Residencial Encarnación',
    developer: 'Desarrollos del Sur',
    location: 'Encarnación, Paraguay',
    type: 'Residencial',
    status: 'Preventa',
    progress: 10,
    units: 60,
    priceFrom: 95000000,
    priceTo: 220000000,
    currency: 'PYG',
    area: '1,200 m²',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800'
    ],
    description: 'Apartamentos modernos con vista al río Paraná. Ubicación privilegiada cerca del centro histórico de Encarnación.',
    features: ['Vista al río', 'Balcón privado', 'Piscina', 'Gimnasio', 'Seguridad 24/7'],
    deliveryDate: '2025-12-15',
    isFeatured: false,
    views: 190
  },
  {
    id: 5,
    name: 'Plaza Comercial Fernando',
    developer: 'Grupo Retail',
    location: 'Fernando de la Mora, Paraguay',
    type: 'Comercial',
    status: 'En Construcción',
    progress: 45,
    units: 25,
    priceFrom: 180000000,
    priceTo: 400000000,
    currency: 'PYG',
    area: '2,000 m²',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
    ],
    description: 'Centro comercial moderno con locales comerciales y oficinas. Ubicación estratégica con alto flujo vehicular.',
    features: ['Estacionamiento amplio', 'Sistema de seguridad', 'Aire acondicionado', 'Fachada moderna', 'Acceso directo'],
    deliveryDate: '2024-10-30',
    isFeatured: false,
    views: 150
  },
  {
    id: 6,
    name: 'Torres del Sol',
    developer: 'Inmobiliaria del Sol',
    location: 'Asunción, Paraguay',
    type: 'Residencial',
    status: 'Preventa',
    progress: 5,
    units: 200,
    priceFrom: 150000000,
    priceTo: 400000000,
    currency: 'PYG',
    area: '4,500 m²',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    ],
    description: 'Mega proyecto residencial con 3 torres de 30 pisos. El desarrollo más ambicioso de la ciudad con amenidades de lujo.',
    features: ['Piscina olímpica', 'Spa', 'Restaurante', 'Concierge', 'Helipuerto', 'Seguridad 24/7'],
    deliveryDate: '2026-03-15',
    isFeatured: true,
    views: 680
  }
];

const projectTypes = [
  { value: '', label: 'Todos los Tipos' },
  { value: 'Residencial', label: 'Residencial' },
  { value: 'Comercial', label: 'Comercial' },
  { value: 'Mixto', label: 'Mixto' }
];

const projectStatuses = [
  { value: '', label: 'Todos los Estados' },
  { value: 'Preventa', label: 'Preventa' },
  { value: 'En Construcción', label: 'En Construcción' },
  { value: 'Entregado', label: 'Entregado' }
];

const cities = [
  { value: '', label: 'Todas las Ciudades' },
  { value: 'Asunción', label: 'Asunción' },
  { value: 'Ciudad del Este', label: 'Ciudad del Este' },
  { value: 'San Lorenzo', label: 'San Lorenzo' },
  { value: 'Encarnación', label: 'Encarnación' },
  { value: 'Fernando de la Mora', label: 'Fernando de la Mora' }
];

const ProjectsSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<number[]>([1, 3, 6]);

  const formatPrice = (price: number, currency: string) => {
    const formattedPrice = new Intl.NumberFormat('es-PY').format(price);
    return `$${formattedPrice} ${currency}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Preventa':
        return 'bg-blue-100 text-blue-800';
      case 'En Construcción':
        return 'bg-yellow-100 text-yellow-800';
      case 'Entregado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType ? project.type === selectedType : true;
    const matchesStatus = selectedStatus ? project.status === selectedStatus : true;
    const matchesCity = selectedCity ? project.location.includes(selectedCity) : true;
    return matchesSearch && matchesType && matchesStatus && matchesCity;
  });

  const toggleFavorite = (projectId: number) => {
    setFavorites(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedStatus('');
    setSelectedCity('');
  };

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none"
              >
                {projectTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none"
              >
                {projectStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none"
              >
                {cities.map(city => (
                  <option key={city.value} value={city.value}>{city.label}</option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 ${viewMode === 'grid' ? 'bg-brand-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Grilla</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 ${viewMode === 'list' ? 'bg-brand-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span>Lista</span>
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {filteredProjects.length} proyectos encontrados
            </span>
          </div>
        </motion.div>

        {/* Lista de Proyectos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}
        >
          {filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${viewMode === 'list' ? 'flex' : ''} ${project.isFeatured ? 'ring-2 ring-brand-500' : ''}`}
              >
                {/* Imagen */}
                <div className={`relative ${viewMode === 'list' ? 'w-80 h-64' : 'h-64'}`}>
                  <img
                    src={project.images[0]}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    {project.isFeatured && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-brand-100 text-brand-800">
                        Destacado
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={() => toggleFavorite(project.id)}
                      className={`p-2 rounded-full transition-all duration-200 shadow-lg ${
                        favorites.includes(project.id)
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                      }`}
                    >
                      <svg className="w-5 h-5" fill={favorites.includes(project.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
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
                    <span className="text-sm font-medium">{project.views} vistas</span>
                  </div>
                </div>

                {/* Detalles */}
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                      {project.name}
                    </h3>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Desde</div>
                      <div className="text-lg font-bold text-brand-600">
                        {formatPrice(project.priceFrom, project.currency)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 mb-4">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium">{project.location}</span>
                  </div>

                  <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600">
                    <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium">{project.units} unidades</span>
                    </div>
                    <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <span className="font-medium">{project.area}</span>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progreso</span>
                      <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Desarrollador */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {project.developer}
                        </div>
                        <div className="text-xs text-gray-500">
                          Desarrollador
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Entrega</div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(project.deliveryDate).toLocaleDateString('es-PY')}
                      </div>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex space-x-3 mt-4">
                    <button className="flex-1 bg-gradient-to-r from-brand-600 to-brand-700 text-white py-3 px-4 rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all duration-200 text-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      Ver Proyecto
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No se encontraron proyectos
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

export default ProjectsSection;
