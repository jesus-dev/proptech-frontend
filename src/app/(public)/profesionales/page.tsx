"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Script from 'next/script';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  WrenchScrewdriverIcon,
  CheckBadgeIcon,
  XMarkIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { publicProfessionalService, PublicProfessional } from '@/services/publicProfessionalService';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

interface ServiceType {
  id: number;
  code: string;
  name: string;
  icon?: string;
  description?: string;
}

export default function ProfesionalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'rating' | 'jobs' | 'experience'>('rating');
  const [professionals, setProfessionals] = useState<PublicProfessional[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Función para normalizar nombres de ciudades
  const normalizeCityName = (cityName: string) => {
    return cityName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/ó/g, 'o')
      .replace(/ñ/g, 'n')
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ú/g, 'u');
  };

  // Cargar tipos de servicio
  useEffect(() => {
    const loadServiceTypes = async () => {
      try {
        const response = await apiClient.get('/api/service-types');
        setServiceTypes(response.data || []);
      } catch (error) {
        console.error('Error loading service types:', error);
      }
    };
    loadServiceTypes();
  }, []);

  // Filtros dinámicos basados en datos reales
  const cities = React.useMemo(() => {
    const unique = Array.from(new Set(professionals.map(p => (p.city || '').trim()).filter(Boolean)));
    unique.sort((a, b) => a.localeCompare(b, 'es'));
    return [{ value: '', label: 'Todas las ciudades' }, ...unique.map(c => ({ value: normalizeCityName(c), label: c }))];
  }, [professionals]);

  // Cargar profesionales
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await publicProfessionalService.getAllProfessionals();
        setProfessionals(data);
      } catch (err: any) {
        console.error('Error loading professionals:', err);
        setError('Error al cargar los profesionales. Por favor, intenta recargar la página.');
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfessionals();
  }, []);

  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = !searchTerm || 
                         `${professional.firstName} ${professional.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.serviceType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || (professional.city && normalizeCityName(professional.city) === selectedCity);
    const matchesServiceType = !selectedServiceType || professional.serviceType === selectedServiceType;
    
    return matchesSearch && matchesCity && matchesServiceType;
  });

  const sortedProfessionals = [...filteredProfessionals].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0);
      case 'jobs':
        return (b.completedJobs || 0) - (a.completedJobs || 0);
      case 'experience':
        return (b.experienceYears || 0) - (a.experienceYears || 0);
      default:
        return 0;
    }
  });

  const getServiceTypeInfo = (code: string) => {
    return serviceTypes.find(st => st.code === code);
  };

  // Structured Data para SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Profesionales de Servicios del Hogar en Paraguay',
    description: 'Lista de profesionales certificados para servicios del hogar en Paraguay. Electricistas, plomeros, carpinteros y más.',
    url: 'https://proptech.com.py/profesionales',
    numberOfItems: professionals.length,
    itemListElement: professionals.slice(0, 10).map((professional, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: `${professional.firstName} ${professional.lastName}`,
        description: professional.description,
        provider: {
          '@type': 'Person',
          name: `${professional.firstName} ${professional.lastName}`,
          email: professional.email,
          telephone: professional.phone,
        },
        areaServed: {
          '@type': 'City',
          name: professional.city || 'Paraguay',
        },
      },
    })),
  };

  return (
    <>
      {/* Structured Data para SEO */}
      <Script
        id="profesionales-structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(structuredData)}
      </Script>
      
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 min-h-[45vh] sm:min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="professionals-hero-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="4" fill="white" opacity="0.3"/>
                <circle cx="10" cy="10" r="2" fill="white" opacity="0.2"/>
                <circle cx="50" cy="50" r="2" fill="white" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#professionals-hero-pattern)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-6 sm:pb-8 w-full z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              Encuentra Profesionales de
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent">
                Servicios del Hogar
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto mb-8 px-4">
              Electricistas, plomeros, carpinteros, pintores y más. Profesionales verificados y con experiencia para tu hogar.
            </p>
            <Link
              href="/profesionales/registrarse"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 mt-4"
            >
              <UserPlusIcon className="w-6 h-6 mr-2" />
              Regístrate como Profesional
            </Link>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50/50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl shadow-sm">
                    <FunnelIcon className="w-5 h-5 text-orange-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Encuentra tu profesional ideal</h3>
                    <p className="text-sm text-gray-600">Filtra por ciudad, tipo de servicio y experiencia</p>
                  </div>
                </div>
                
                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCity('');
                    setSelectedServiceType('');
                    setSortBy('rating');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-gray-600 hover:text-gray-800 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-6 w-6 text-orange-500" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre, empresa o servicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-14 pr-6 py-4 border border-white/30 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/95 backdrop-blur-sm shadow-lg text-gray-900 placeholder-gray-500 text-lg"
                />
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* City Filter */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad</label>
                  <div className="relative">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-4 py-3 border border-white/30 rounded-xl appearance-none bg-white/95 backdrop-blur-sm shadow-lg text-gray-900 focus:ring-2 focus:ring-orange-400 focus:border-transparent cursor-pointer"
                    >
                      {cities.map(city => (
                        <option key={city.value} value={city.value}>{city.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <MapPinIcon className="h-5 w-5 text-orange-500" />
                    </div>
                  </div>
                </div>

                {/* Service Type Filter */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Servicio</label>
                  <div className="relative">
                    <select
                      value={selectedServiceType}
                      onChange={(e) => setSelectedServiceType(e.target.value)}
                      className="w-full px-4 py-3 border border-white/30 rounded-xl appearance-none bg-white/95 backdrop-blur-sm shadow-lg text-gray-900 focus:ring-2 focus:ring-orange-400 focus:border-transparent cursor-pointer"
                    >
                      <option value="">Todos los servicios</option>
                      {serviceTypes.map(st => (
                        <option key={st.code} value={st.code}>{st.icon} {st.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <WrenchScrewdriverIcon className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ordenar por</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-4 py-3 border border-white/30 rounded-xl appearance-none bg-white/95 backdrop-blur-sm shadow-lg text-gray-900 focus:ring-2 focus:ring-orange-400 focus:border-transparent cursor-pointer"
                    >
                      <option value="rating">Mejor calificados</option>
                      <option value="jobs">Más trabajos</option>
                      <option value="experience">Más experiencia</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <StarIcon className="h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vista</label>
                  <div className="flex bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg overflow-hidden h-12">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 flex items-center justify-center transition-all duration-300 ${viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg transform scale-105' 
                        : 'text-gray-600 hover:bg-white/60'}`}
                    >
                      <Squares2X2Icon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 flex items-center justify-center transition-all duration-300 ${viewMode === 'list' 
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg transform scale-105' 
                        : 'text-gray-600 hover:bg-white/60'}`}
                    >
                      <ListBulletIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                  <span className="font-medium">
                    {sortedProfessionals.length} {sortedProfessionals.length === 1 ? 'profesional encontrado' : 'profesionales encontrados'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando profesionales...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
              >
                Recargar
              </button>
            </div>
          ) : sortedProfessionals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No se encontraron profesionales con los filtros seleccionados.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProfessionals.map((professional) => {
                const serviceTypeInfo = getServiceTypeInfo(professional.serviceType);
                return (
                  <motion.div
                    key={professional.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="group bg-gradient-to-br from-white via-white to-gray-50/50 rounded-2xl lg:rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100/50 overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:scale-[1.02] relative"
                  >
                    {/* Decoración superior */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500"></div>
                    
                    <div className="p-6 lg:p-8">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            {professional.photo ? (
                              <img
                                src={professional.photo}
                                alt={`${professional.firstName} ${professional.lastName}`}
                                className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-2 ring-white"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white">
                                {professional.firstName?.[0]}{professional.lastName?.[0]}
                              </div>
                            )}
                            {professional.isVerified && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                <CheckBadgeIcon className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">
                              {professional.firstName} {professional.lastName}
                            </h3>
                            {professional.companyName && (
                              <p className="text-sm font-semibold text-gray-600">{professional.companyName}</p>
                            )}
                            {serviceTypeInfo && (
                              <p className="text-sm text-gray-500 mt-1">
                                {serviceTypeInfo.icon} {serviceTypeInfo.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {professional.city && (
                          <div className="flex items-center bg-gradient-to-br from-gray-50 to-gray-100/80 p-3 rounded-xl border border-gray-200/50">
                            <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mr-3 shadow-sm">
                              <MapPinIcon className="w-4 h-4 text-orange-700" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">{professional.city}</div>
                              <div className="text-xs text-gray-600">Ubicación</div>
                            </div>
                          </div>
                        )}
                        
                        {professional.experienceYears && (
                          <div className="flex items-center bg-gradient-to-br from-gray-50 to-gray-100/80 p-3 rounded-xl border border-gray-200/50">
                            <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-lg mr-3 shadow-sm">
                              <StarIcon className="w-4 h-4 text-red-700" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">{professional.experienceYears} años</div>
                              <div className="text-xs text-gray-600">Experiencia</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {professional.description && (
                        <p className="text-sm text-gray-700 mb-4 line-clamp-2 font-medium leading-relaxed">
                          {professional.description}
                        </p>
                      )}

                      {/* Stats */}
                      {(professional.averageRating || professional.completedJobs) && (
                        <div className="flex items-center justify-center text-sm text-gray-600 mb-6 bg-gray-50 rounded-xl p-3 gap-4">
                          {professional.averageRating && (
                            <div className="text-center">
                              <div className="font-bold text-orange-700">{professional.averageRating.toFixed(1)}</div>
                              <div className="text-xs">Calificación</div>
                            </div>
                          )}
                          {professional.completedJobs && (
                            <div className="text-center">
                              <div className="font-bold text-red-700">{professional.completedJobs}</div>
                              <div className="text-xs">Trabajos</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="flex space-x-3">
                        {professional.phone ? (
                          <a
                            href={`tel:${professional.phone}`}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl text-center text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                          >
                            <PhoneIcon className="w-4 h-4" />
                            <span>Llamar</span>
                          </a>
                        ) : null}
                        {professional.email ? (
                          <a
                            href={`mailto:${professional.email}`}
                            className="flex-1 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white py-3 px-4 rounded-xl text-center text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                          >
                            <EnvelopeIcon className="w-4 h-4" />
                            <span>Email</span>
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProfessionals.map((professional) => {
                const serviceTypeInfo = getServiceTypeInfo(professional.serviceType);
                return (
                  <motion.div
                    key={professional.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6"
                  >
                    <div className="flex items-center space-x-6">
                      {professional.photo ? (
                        <img
                          src={professional.photo}
                          alt={`${professional.firstName} ${professional.lastName}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {professional.firstName?.[0]}{professional.lastName?.[0]}
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {professional.firstName} {professional.lastName}
                            </h3>
                            {professional.companyName && (
                              <p className="text-gray-600">{professional.companyName}</p>
                            )}
                            {serviceTypeInfo && (
                              <p className="text-sm text-gray-500 mt-1">
                                {serviceTypeInfo.icon} {serviceTypeInfo.name}
                              </p>
                            )}
                          </div>
                          {professional.isVerified && (
                            <CheckBadgeIcon className="w-6 h-6 text-green-500" />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {professional.city && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPinIcon className="w-4 h-4 mr-2" />
                              {professional.city}
                            </div>
                          )}
                          {professional.experienceYears && (
                            <div className="flex items-center text-sm text-gray-600">
                              <StarSolidIcon className="w-4 h-4 mr-2 text-yellow-400" />
                              {professional.experienceYears} años
                            </div>
                          )}
                          {professional.averageRating && (
                            <div className="flex items-center text-sm text-gray-600">
                              <StarSolidIcon className="w-4 h-4 mr-2 text-yellow-400" />
                              {professional.averageRating.toFixed(1)}
                            </div>
                          )}
                          {professional.completedJobs && (
                            <div className="text-sm text-gray-600">
                              {professional.completedJobs} trabajos
                            </div>
                          )}
                        </div>
                        
                        {professional.description && (
                          <p className="text-gray-600 mt-3">{professional.description}</p>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {professional.phone && (
                          <a
                            href={`tel:${professional.phone}`}
                            className="bg-orange-600 text-white py-2 px-4 rounded-lg text-center text-sm font-medium hover:bg-orange-700 transition-colors"
                          >
                            Llamar
                          </a>
                        )}
                        {professional.email && (
                          <a
                            href={`mailto:${professional.email}`}
                            className="border border-orange-600 text-orange-600 py-2 px-4 rounded-lg text-center text-sm font-medium hover:bg-orange-50 transition-colors"
                          >
                            Email
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
    </>
  );
}

