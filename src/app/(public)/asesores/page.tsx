"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  CheckBadgeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

export default function AsesoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  const cities = [
    { value: '', label: 'Todas las ciudades' },
    { value: 'asuncion', label: 'Asunción' },
    { value: 'ciudad-del-este', label: 'Ciudad del Este' },
    { value: 'encarnacion', label: 'Encarnación' },
    { value: 'san-lorenzo', label: 'San Lorenzo' },
    { value: 'fernando-de-la-mora', label: 'Fernando de la Mora' }
  ];

  const specialties = [
    { value: '', label: 'Todas las especialidades' },
    { value: 'residencial', label: 'Residencial' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'terrenos', label: 'Terrenos' },
    { value: 'lujo', label: 'Propiedades de lujo' },
    { value: 'inversion', label: 'Inversión' }
  ];

  const asesores = [
    {
      id: 1,
      name: 'María González',
      company: 'Inmobiliaria del Sol',
      city: 'Asunción',
      specialty: 'Residencial',
      rating: 4.9,
      reviews: 127,
      experience: '8 años',
      phone: '+595 981 123-456',
      email: 'maria@inmobiliariadelsol.com',
      image: '/images/asesor1.jpg',
      verified: true,
      properties: 45,
      description: 'Especialista en propiedades residenciales de alto valor en Asunción. Con más de 8 años de experiencia ayudando a familias a encontrar su hogar ideal.'
    },
    {
      id: 2,
      name: 'Carlos Mendoza',
      company: 'Propiedades Premium',
      city: 'Ciudad del Este',
      specialty: 'Comercial',
      rating: 4.8,
      reviews: 89,
      experience: '12 años',
      phone: '+595 981 234-567',
      email: 'carlos@propiedadespremium.com',
      image: '/images/asesor2.jpg',
      verified: true,
      properties: 67,
      description: 'Experto en propiedades comerciales e inversiones inmobiliarias. Conocimiento profundo del mercado de Ciudad del Este.'
    },
    {
      id: 3,
      name: 'Ana Rodríguez',
      company: 'Inmobiliaria Central',
      city: 'Encarnación',
      specialty: 'Terrenos',
      rating: 4.7,
      reviews: 156,
      experience: '6 años',
      phone: '+595 981 345-678',
      email: 'ana@inmobiliariacentral.com',
      image: '/images/asesor3.jpg',
      verified: true,
      properties: 32,
      description: 'Especialista en terrenos y desarrollo inmobiliario. Ayuda a inversores y desarrolladores a encontrar las mejores oportunidades.'
    },
    {
      id: 4,
      name: 'Roberto Silva',
      company: 'Luxury Properties',
      city: 'Asunción',
      specialty: 'Lujo',
      rating: 4.9,
      reviews: 203,
      experience: '15 años',
      phone: '+595 981 456-789',
      email: 'roberto@luxuryproperties.com',
      image: '/images/asesor4.jpg',
      verified: true,
      properties: 89,
      description: 'Especialista en propiedades de lujo y alta gama. Atiende clientes exigentes que buscan exclusividad y calidad.'
    },
    {
      id: 5,
      name: 'Laura Fernández',
      company: 'Inversiones Inmobiliarias',
      city: 'San Lorenzo',
      specialty: 'Inversión',
      rating: 4.6,
      reviews: 78,
      experience: '10 años',
      phone: '+595 981 567-890',
      email: 'laura@inversionesinmobiliarias.com',
      image: '/images/asesor5.jpg',
      verified: true,
      properties: 54,
      description: 'Experta en inversiones inmobiliarias y análisis de mercado. Ayuda a clientes a maximizar sus retornos de inversión.'
    },
    {
      id: 6,
      name: 'Diego Martínez',
      company: 'Propiedades del Este',
      city: 'Ciudad del Este',
      specialty: 'Residencial',
      rating: 4.8,
      reviews: 134,
      experience: '7 años',
      phone: '+595 981 678-901',
      email: 'diego@propiedadesdeleste.com',
      image: '/images/asesor6.jpg',
      verified: true,
      properties: 41,
      description: 'Especialista en propiedades residenciales en Ciudad del Este. Conocimiento profundo del mercado local y sus tendencias.'
    }
  ];

  const filteredAsesores = asesores.filter(asesor => {
    const matchesSearch = asesor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asesor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asesor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || asesor.city.toLowerCase() === selectedCity;
    const matchesSpecialty = !selectedSpecialty || asesor.specialty.toLowerCase() === selectedSpecialty;
    
    return matchesSearch && matchesCity && matchesSpecialty;
  });

  const sortedAsesores = [...filteredAsesores].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'experience':
        return parseInt(b.experience) - parseInt(a.experience);
      case 'properties':
        return b.properties - a.properties;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[30vh] sm:min-h-[35vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/40 via-brand-700/30 to-brand-800/40"></div>
          <div className="absolute inset-0 opacity-60">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-500/20 via-transparent to-emerald-500/20 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-purple-500/20 via-transparent to-brand-600/20 animate-pulse delay-1000"></div>
          </div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">Asesores Inmobiliarios</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">Encuentra el asesor perfecto para tu próxima inversión inmobiliaria</p>
        </div>
      </section>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar asesores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {cities.map(city => (
                  <option key={city.value} value={city.value}>{city.label}</option>
                ))}
              </select>

              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {specialties.map(specialty => (
                  <option key={specialty.value} value={specialty.value}>{specialty.label}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="rating">Mejor calificados</option>
                <option value="experience">Más experiencia</option>
                <option value="properties">Más propiedades</option>
              </select>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {sortedAsesores.length} asesores encontrados
            </h2>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedAsesores.map((asesor) => (
                <motion.div
                  key={asesor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {asesor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{asesor.name}</h3>
                          <p className="text-sm text-gray-600">{asesor.company}</p>
                        </div>
                      </div>
                      {asesor.verified && (
                        <CheckBadgeIcon className="w-6 h-6 text-green-500" />
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        {asesor.city}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                        {asesor.specialty}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <StarSolidIcon className="w-4 h-4 mr-2 text-yellow-400" />
                        {asesor.rating} ({asesor.reviews} reseñas)
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{asesor.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{asesor.experience} de experiencia</span>
                      <span>{asesor.properties} propiedades</span>
                    </div>

                    <div className="flex space-x-2">
                      <a
                        href={`tel:${asesor.phone}`}
                        className="flex-1 bg-brand-600 text-white py-2 px-4 rounded-lg text-center text-sm font-medium hover:bg-brand-700 transition-colors"
                      >
                        Llamar
                      </a>
                      <a
                        href={`mailto:${asesor.email}`}
                        className="flex-1 border border-brand-600 text-brand-600 py-2 px-4 rounded-lg text-center text-sm font-medium hover:bg-brand-50 transition-colors"
                      >
                        Email
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAsesores.map((asesor) => (
                <motion.div
                  key={asesor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6"
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {asesor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{asesor.name}</h3>
                          <p className="text-gray-600">{asesor.company}</p>
                        </div>
                        {asesor.verified && (
                          <CheckBadgeIcon className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="w-4 h-4 mr-2" />
                          {asesor.city}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                          {asesor.specialty}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <StarSolidIcon className="w-4 h-4 mr-2 text-yellow-400" />
                          {asesor.rating} ({asesor.reviews})
                        </div>
                        <div className="text-sm text-gray-600">
                          {asesor.experience} • {asesor.properties} propiedades
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mt-3">{asesor.description}</p>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <a
                        href={`tel:${asesor.phone}`}
                        className="bg-brand-600 text-white py-2 px-4 rounded-lg text-center text-sm font-medium hover:bg-brand-700 transition-colors"
                      >
                        Llamar
                      </a>
                      <a
                        href={`mailto:${asesor.email}`}
                        className="border border-brand-600 text-brand-600 py-2 px-4 rounded-lg text-center text-sm font-medium hover:bg-brand-50 transition-colors"
                      >
                        Email
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
