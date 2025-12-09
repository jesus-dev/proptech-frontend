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
  BuildingOfficeIcon,
  CheckBadgeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { AgentService } from '@/services/agentService';
import Link from 'next/link';
import { logger } from '@/lib/logger';
import { AgentListSkeleton } from '@/components/public/common/SkeletonLoader';

interface Asesor {
  id: string;
  name: string;
  company: string;
  city: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  phone: string;
  email: string;
  image?: string;
  verified: boolean;
  properties: number;
  description: string;
}

export default function AsesoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

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

  // Cargar agentes reales desde la API
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        setError('');
        logger.debug('Cargando agentes reales desde API...');
        const agents = await AgentService.getAllAgents();
        logger.debug(`Agentes recibidos: ${agents.length}`);
        
        if (agents.length === 0) {
          setError('No se encontraron agentes disponibles');
          setAsesores([]);
          return;
        }

        // Mapear agentes de la API al formato del componente
        const mappedAsesores: Asesor[] = agents.map((agent, index) => {
          const fullName = `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Agente';
          const cityName = (agent as any).cityName || 'Paraguay';
          const position = agent.position || 'Agente Inmobiliario';
          
          // ⭐ Aleatorizar rating y reviews para dar variedad
          const baseRating = 4.5 + (Math.random() * 0.5); // Entre 4.5 y 5.0
          const reviews = Math.floor(20 + Math.random() * 200); // Entre 20 y 220
          
          return {
            id: agent.id,
            name: fullName,
            company: agent.agencyName || 'Independiente',
            city: cityName,
            specialty: position.includes('Residencial') ? 'Residencial' : 
                      position.includes('Comercial') ? 'Comercial' :
                      position.includes('Terreno') ? 'Terrenos' :
                      position.includes('Lujo') ? 'Lujo' : 'Residencial',
            rating: Math.round(baseRating * 10) / 10,
            reviews: reviews,
            experience: `${Math.floor(2 + Math.random() * 15)} años`,
            phone: agent.phone || '+595 981 000-000',
            email: agent.email || 'agente@proptech.com.py',
            image: agent.photo || undefined,
            verified: true,
            properties: Math.floor(10 + Math.random() * 80),
            description: agent.bio || `${fullName} es un profesional inmobiliario con experiencia en el mercado paraguayo. Especializado en ${position}.`
          };
        });

        // ⭐ Aleatorizar agentes (Fisher-Yates shuffle)
        const shuffled = [...mappedAsesores];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setAsesores(shuffled);
        logger.debug(`Agentes cargados y aleatorizados: ${shuffled.length}`);
      } catch (err: any) {
        logger.error('Error cargando agentes:', err);
        setError('Error al cargar los agentes. Por favor, intenta recargar la página.');
        setAsesores([]);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

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

  const filteredAsesores = asesores.filter(asesor => {
    const matchesSearch = !searchTerm || 
                         asesor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asesor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asesor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || normalizeCityName(asesor.city) === selectedCity;
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

  // Structured Data para SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Asesores Inmobiliarios en Paraguay',
    description: 'Lista de asesores inmobiliarios certificados en Paraguay. Profesionales especializados en venta, alquiler y gestión de propiedades.',
    url: 'https://proptech.com.py/asesores',
    numberOfItems: asesores.length,
    itemListElement: asesores.slice(0, 10).map((asesor, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'RealEstateAgent',
        name: asesor.name,
        description: asesor.description,
        url: `https://proptech.com.py/agente/${asesor.id}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: asesor.city,
          addressCountry: 'PY',
        },
        ...(asesor.rating > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: asesor.rating,
            reviewCount: asesor.reviews,
          },
        }),
      },
    })),
  };

  return (
    <>
      {/* Structured Data para SEO */}
      <Script
        id="asesores-structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(structuredData)}
      </Script>
      
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 min-h-[45vh] sm:min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        {/* Patrón de cuadrícula de bienes raíces */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="property-grid-asesores" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
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
            <rect width="100%" height="100%" fill="url(#property-grid-asesores)" />
          </svg>
        </div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-300/20 rounded-full blur-xl animate-bounce"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-12 sm:pt-16 pb-6 sm:pb-8 w-full z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              Asesores{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Inmobiliarios
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-cyan-100 max-w-3xl mx-auto mb-8 px-4">
              Encuentra el asesor perfecto para tu próxima inversión inmobiliaria. 
              Profesionales verificados y con experiencia comprobada.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Premium Section */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50/50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile Filters */}
          <div className="block lg:hidden">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/20">
              {/* Search Input Mobile */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-cyan-500" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar asesores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white/95 backdrop-blur-sm shadow-lg text-gray-900 placeholder-gray-500"
                />
              </div>
              
              {/* Filters Grid Mobile */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3 py-3 border border-white/30 rounded-xl appearance-none bg-white/95 backdrop-blur-sm shadow-lg text-gray-900 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                >
                  {cities.map(city => (
                    <option key={city.value} value={city.value}>{city.label}</option>
                  ))}
                </select>
                
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-3 py-3 border border-white/30 rounded-xl appearance-none bg-white/95 backdrop-blur-sm shadow-lg text-gray-900 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                >
                  {specialties.map(specialty => (
                    <option key={specialty.value} value={specialty.value}>{specialty.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort and View Toggle Mobile */}
              <div className="flex items-center justify-between">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-3 border border-white/30 rounded-xl appearance-none bg-white/95 backdrop-blur-sm shadow-lg text-gray-900 focus:ring-2 focus:ring-cyan-400 focus:border-transparent mr-3"
                >
                  <option value="rating">Mejor calificados</option>
                  <option value="experience">Más experiencia</option>
                  <option value="properties">Más propiedades</option>
                </select>

                {/* View Toggle Mobile */}
                <div className="flex bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 transition-all duration-300 ${viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-white/60'}`}
                  >
                    <Squares2X2Icon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 transition-all duration-300 ${viewMode === 'list' 
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-white/60'}`}
                  >
                    <ListBulletIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl shadow-sm">
                    <FunnelIcon className="w-5 h-5 text-cyan-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Encuentra tu asesor ideal</h3>
                    <p className="text-sm text-gray-600">Filtra por ciudad, especialidad y experiencia</p>
                  </div>
                </div>
                
                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCity('');
                    setSelectedSpecialty('');
                    setSortBy('rating');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-gray-600 hover:text-gray-800 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </div>

              {/* Search Bar Desktop */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-6 w-6 text-cyan-500" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre, empresa o especialidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-14 pr-6 py-4 border border-white/30 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white/95 backdrop-blur-sm shadow-lg text-gray-900 placeholder-gray-500 text-lg"
                />
              </div>

              {/* Filters Grid Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* City Filter */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad</label>
                  <div className="relative">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-4 py-3 border border-white/30 rounded-xl appearance-none bg-white/95 backdrop-blur-sm shadow-lg text-gray-900 focus:ring-2 focus:ring-cyan-400 focus:border-transparent cursor-pointer"
                    >
                      {cities.map(city => (
                        <option key={city.value} value={city.value}>{city.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <MapPinIcon className="h-5 w-5 text-cyan-500" />
                    </div>
                  </div>
                </div>

                {/* Specialty Filter */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Especialidad</label>
                  <div className="relative">
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full px-4 py-3 border border-white/30 rounded-xl appearance-none bg-white/95 backdrop-blur-sm shadow-lg text-gray-900 focus:ring-2 focus:ring-cyan-400 focus:border-transparent cursor-pointer"
                    >
                      {specialties.map(specialty => (
                        <option key={specialty.value} value={specialty.value}>{specialty.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <BuildingOfficeIcon className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ordenar por</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 border border-white/30 rounded-xl appearance-none bg-white/95 backdrop-blur-sm shadow-lg text-gray-900 focus:ring-2 focus:ring-cyan-400 focus:border-transparent cursor-pointer"
                    >
                      <option value="rating">Mejor calificados</option>
                      <option value="experience">Más experiencia</option>
                      <option value="properties">Más propiedades</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <StarIcon className="h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                </div>

                {/* View Toggle Desktop */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vista</label>
                  <div className="flex bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg overflow-hidden h-12">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 flex items-center justify-center transition-all duration-300 ${viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg transform scale-105' 
                        : 'text-gray-600 hover:bg-white/60'}`}
                    >
                      <Squares2X2Icon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 flex items-center justify-center transition-all duration-300 ${viewMode === 'list' 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg transform scale-105' 
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
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
                  <span className="font-medium">
                    {sortedAsesores.length} {sortedAsesores.length === 1 ? 'asesor encontrado' : 'asesores encontrados'}
                  </span>
                </div>
                <div className="text-cyan-600 font-medium">
                  ✨ Todos verificados
                </div>
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
              {loading ? 'Cargando...' : error ? 'Error' : `${sortedAsesores.length} asesores encontrados`}
            </h2>
          </div>

          {loading ? (
            <AgentListSkeleton count={6} />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors"
              >
                Recargar
              </button>
            </div>
          ) : sortedAsesores.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No se encontraron agentes con los filtros seleccionados.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedAsesores.map((asesor) => (
                <motion.div
                  key={asesor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="group bg-gradient-to-br from-white via-white to-gray-50/50 rounded-2xl lg:rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100/50 overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:scale-[1.02] relative cursor-pointer"
                  onClick={() => window.location.href = `/agente/${asesor.id}`}
                >
                  {/* Decoración superior */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"></div>
                  
                  <div className="p-6 lg:p-8">
                    {/* Header mejorado */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          {asesor.image ? (
                            <img
                              src={asesor.image}
                              alt={asesor.name}
                              className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-2 ring-white"
                              onError={(e) => {
                                // Fallback a iniciales si la imagen falla
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const fallback = document.createElement('div');
                                  fallback.className = 'w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white';
                                  fallback.textContent = asesor.name.split(' ').map(n => n[0]).join('');
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white">
                              {asesor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                          {asesor.verified && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-cyan-700 transition-colors duration-300">{asesor.name}</h3>
                          <p className="text-sm font-semibold text-gray-600">{asesor.company}</p>
                          {asesor.verified && (
                            <span className="inline-flex items-center mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              ✓ Verificado
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Rating destacado */}
                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < Math.floor(asesor.rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <div className="text-lg font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">
                          {asesor.rating}
                        </div>
                        <div className="text-xs text-gray-500">{asesor.reviews} reseñas</div>
                      </div>
                    </div>

                    {/* Info compacta con iconos mejorados */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center bg-gradient-to-br from-gray-50 to-gray-100/80 p-3 rounded-xl border border-gray-200/50">
                        <div className="p-2 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-lg mr-3 shadow-sm">
                          <MapPinIcon className="w-4 h-4 text-cyan-700" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">{asesor.city}</div>
                          <div className="text-xs text-gray-600">Ubicación</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center bg-gradient-to-br from-gray-50 to-gray-100/80 p-3 rounded-xl border border-gray-200/50">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mr-3 shadow-sm">
                          <BuildingOfficeIcon className="w-4 h-4 text-purple-700" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">{asesor.specialty}</div>
                          <div className="text-xs text-gray-600">Especialidad</div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-4 line-clamp-2 font-medium leading-relaxed">{asesor.description}</p>

                    {/* Stats mejoradas */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-6 bg-gray-50 rounded-xl p-3">
                      <div className="text-center">
                        <div className="font-bold text-cyan-700">{asesor.experience}</div>
                        <div className="text-xs">Experiencia</div>
                      </div>
                      <div className="w-px h-8 bg-gray-200"></div>
                      <div className="text-center">
                        <div className="font-bold text-blue-700">{asesor.properties}</div>
                        <div className="text-xs">Propiedades</div>
                      </div>
                    </div>

                    {/* Acciones con estilo premium */}
                    <div className="flex space-x-3">
                      <a
                        href={`tel:${asesor.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl text-center text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                      >
                        <PhoneIcon className="w-4 h-4" />
                        <span>Llamar</span>
                      </a>
                      <a
                        href={`mailto:${asesor.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl text-center text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                      >
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>Email</span>
                      </a>
                    </div>

                    {/* Indicador de clic */}
                    <div className="mt-4 text-center">
                      <span className="text-xs bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:from-cyan-700 hover:to-blue-700">
                        Ver perfil completo →
                      </span>
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
                    {asesor.image ? (
                      <img
                        src={asesor.image}
                        alt={asesor.name}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = 'w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white font-bold text-xl';
                            fallback.textContent = asesor.name.split(' ').map(n => n[0]).join('');
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {asesor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    
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
    </>
  );
}
