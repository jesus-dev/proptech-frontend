// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
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
import { apiClient } from '@/lib/api';

const SearchHeroSection = () => {
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  
  // Estados para datos din\u00e1micos
  const [propertyTypes, setPropertyTypes] = useState([{ value: '', label: 'Tipo de Propiedad' }]);
  const [locations, setLocations] = useState([{ value: '', label: 'Ubicación' }]);

  // Cargar datos dinámicamente del backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const [typesRes, citiesRes] = await Promise.all([
          apiClient.get('/api/property-types').catch(() => ({ data: [] })),
          apiClient.get('/api/cities').catch(() => ({ data: [] }))
        ]);

        // Procesar tipos de propiedades
        if (typesRes.data && Array.isArray(typesRes.data)) {
          const types = typesRes.data
            .filter((type: any) => type.active !== false)
            .map((type: any) => ({
              value: type.name.toLowerCase().replace(/ /g, '-'),
              label: type.name
            }));
          setPropertyTypes([{ value: '', label: 'Tipo de Propiedad' }, ...types]);
        }

        // Procesar ciudades
        if (citiesRes.data && Array.isArray(citiesRes.data)) {
          const cities = citiesRes.data
            .filter((city: any) => city.active !== false)
            .map((city: any) => ({
              value: city.name.toLowerCase().replace(/ /g, '-'),
              label: city.name
            }));
          setLocations([{ value: '', label: 'Ubicación' }, ...cities]);
        }
      } catch (error) {
        console.error('Error loading search data:', error);
        // Los valores por defecto ya están establecidos en useState
      }
    };

    loadData();
  }, []);

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

  // stats removed in minimal hero

  return (
    <section className="relative -mt-14 sm:-mt-16 min-h-[50vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
      {/* Patrón de cuadrícula de bienes raíces */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="property-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
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
          <rect width="100%" height="100%" fill="url(#property-grid)" />
        </svg>
      </div>
      
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-300/10 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-emerald-400/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 pt-16 sm:pt-24 pb-4 sm:pb-12 w-full z-10">
        <div className="text-center mb-3 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white mb-1 sm:mb-4 leading-tight">
            Encuentra tu hogar ideal en Paraguay
          </h1>
          <p className="text-sm sm:text-lg text-cyan-100 max-w-2xl mx-auto px-2">
            Búsqueda simple. Resultados claros. Datos verificados.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          {/* Mobile: Compact search - 2 columnas */}
          <div className="block sm:hidden">
            <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl p-3 border border-white/20">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select 
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="px-2 py-2.5 border border-gray-200 rounded-lg appearance-none text-sm bg-white"
                >
                  <option value="">Tipo</option>
                  <option value="casa">Casa</option>
                  <option value="departamento">Departamento</option>
                  <option value="terreno">Terreno</option>
                </select>
                <select 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="px-2 py-2.5 border border-gray-200 rounded-lg appearance-none text-sm bg-white"
                >
                  <option value="">Ubicación</option>
                  <option value="asuncion">Asunción</option>
                  <option value="ciudad-del-este">Ciudad del Este</option>
                  <option value="san-lorenzo">San Lorenzo</option>
                </select>
              </div>
              <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm">
                Buscar
              </button>
            </div>
          </div>

          {/* Desktop: Original layout */}
          <div className="hidden sm:block">
            <div className="bg-white/95 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-6 border border-white/20">

            {/* Filtros desplegables cool */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <span>🎯</span>
                  <span>Filtros avanzados:</span>
                </div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="text-xs text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                >
                  {showAdvancedFilters ? 'Ocultar' : 'Mostrar más'}
                </button>
              </div>
              
              {/* Filtros principales desplegables */}
              <div className="grid grid-cols-1 gap-3">
                {/* Tipo de Propiedad */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowTypeDropdown(!showTypeDropdown);
                      setShowLocationDropdown(false);
                      setShowPriceDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-sm ${
                      showTypeDropdown
                        ? 'border-cyan-500 bg-cyan-50 shadow-lg'
                        : 'border-gray-200 hover:border-cyan-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <HomeIcon className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {propertyType ? propertyTypes.find(t => t.value === propertyType)?.label : 'Tipo'}
                      </span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showTypeDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showTypeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                      {propertyTypes.slice(1).map((type) => (
                        <button
                          key={type.value}
                          onClick={() => {
                            setPropertyType(type.value);
                            setShowTypeDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-700 transition-all duration-200"
                        >
                          <span className="text-base">
                            {type.value === 'casa' ? '🏠' : 
                             type.value === 'departamento' ? '🏢' : 
                             type.value === 'terreno' ? '🏞️' : 
                             type.value === 'local' ? '🏪' : '🏢'}
                          </span>
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ubicación */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowLocationDropdown(!showLocationDropdown);
                      setShowTypeDropdown(false);
                      setShowPriceDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      showLocationDropdown
                        ? 'border-cyan-500 bg-cyan-50 shadow-lg'
                        : 'border-gray-200 hover:border-cyan-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {location ? locations.find(l => l.value === location)?.label : 'Ubicación'}
                      </span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showLocationDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showLocationDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                      {locations.slice(1).map((loc) => (
                        <button
                          key={loc.value}
                          onClick={() => {
                            setLocation(loc.value);
                            setShowLocationDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-700 transition-all duration-200"
                        >
                          <span className="text-base">📍</span>
                          <span>{loc.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Precio */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowPriceDropdown(!showPriceDropdown);
                      setShowTypeDropdown(false);
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      showPriceDropdown
                        ? 'border-cyan-500 bg-cyan-50 shadow-lg'
                        : 'border-gray-200 hover:border-cyan-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {priceRange.min || priceRange.max ? 
                          `$${priceRange.min || '0'} - $${priceRange.max || '∞'}` : 
                          'Precio'}
                      </span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showPriceDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showPriceDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Mín."
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                          <input
                            type="number"
                            placeholder="Máx."
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {[
                            { label: 'Hasta $50k', min: '', max: '50000' },
                            { label: '$50k-$100k', min: '50000', max: '100000' },
                            { label: '$100k+', min: '100000', max: '' }
                          ].map((range) => (
                            <button
                              key={range.label}
                              onClick={() => {
                                setPriceRange({ min: range.min, max: range.max });
                                setShowPriceDropdown(false);
                              }}
                              className="px-3 py-1 text-xs bg-cyan-100 text-cyan-700 rounded-full hover:bg-cyan-200 transition-colors"
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Filtros adicionales */}
              {showAdvancedFilters && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                      <option value="">Dormitorios</option>
                    <option value="1">1 dorm.</option>
                    <option value="2">2 dorm.</option>
                    <option value="3">3 dorm.</option>
                    <option value="4+">4+ dorm.</option>
                    </select>
                  
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                      <option value="">Baños</option>
                      <option value="1">1 baño</option>
                      <option value="2">2 baños</option>
                      <option value="3">3 baños</option>
                      <option value="4+">4+ baños</option>
                    </select>
                  
                  <button
                    onClick={clearFilters}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Limpiar</span>
                  </button>
                  
                  <button className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-cyan-700 hover:to-blue-700 transition-all">
                    Aplicar
                  </button>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Sellos de confianza + CTA publicar - Todo en una línea */}
        <div className="text-center mt-6 sm:mt-10 text-sm text-cyan-100 px-2">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1 sm:gap-2">
              <span>🏠</span>
              <span>500+ propiedades</span>
            </div>
            <div className="w-px h-4 bg-cyan-300/30" />
            <div className="flex items-center gap-1 sm:gap-2">
              <span>✅</span>
              <span>Datos verificados</span>
            </div>
            <div className="w-px h-4 bg-cyan-300/30" />
            <a href="/proptech" className="text-cyan-200 font-semibold hover:text-white transition-colors duration-300 hover:underline">
              Publicar propiedad
            </a>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};

export default SearchHeroSection;


