// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

const SearchHeroSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Estados para datos dinámicos
  const [cityOptions, setCityOptions] = useState([{ value: '', label: 'Ubicación' }]);


  // Cargar ciudades dinámicamente del backend
  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesRes = await apiClient.get('/api/cities').catch(() => ({ data: [] }));
        
        if (citiesRes.data && Array.isArray(citiesRes.data)) {
          const cities = citiesRes.data
            .filter((city: any) => city.active !== false)
            .map((city: any) => ({
              value: city.name,
              label: city.name
            }));
          setCityOptions([{ value: '', label: 'Ubicación' }, ...cities]);
        }
      } catch (error) {
        console.error('Error loading cities:', error);
      }
    };

    loadCities();
  }, []);

  // stats removed in minimal hero

  return (
    <section className="relative -mt-14 sm:-mt-16 min-h-[18vh] sm:min-h-[20vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
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
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-3 sm:pb-4 w-full z-10">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador principal */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-900 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por ubicación, tipo o características..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 border-2 border-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white hover:border-blue-500 transition-all duration-200 placeholder:text-gray-700 text-gray-950 font-semibold shadow-sm"
            />
          </div>

          {/* Filtro de ubicación */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <svg className="h-5 w-5 text-gray-900 group-focus-within:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="pl-10 pr-8 py-2 sm:py-2.5 border-2 border-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white hover:border-indigo-500 transition-all duration-200 min-w-[140px] font-bold text-gray-950 shadow-sm"
            >
              <option value="">Ubicación</option>
              {cityOptions.map(city => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Botón más filtros */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-4 sm:px-5 py-2 sm:py-2.5 border-2 border-gray-700 bg-white rounded-xl hover:bg-gray-100 hover:border-gray-900 transition-all duration-200 text-sm font-bold flex items-center text-gray-950 hover:text-black group shadow-sm"
          >
            <svg className="h-5 w-5 mr-2 text-gray-900 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-base">Filtros</span>
            <svg className={`h-5 w-5 ml-2 transition-transform duration-300 text-gray-900 group-hover:text-black ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Botón de búsqueda */}
          <button
            onClick={() => {
              // Navegar a propiedades con filtros
              const params = new URLSearchParams();
              if (searchTerm) params.set('search', searchTerm);
              if (selectedCity) params.set('city', selectedCity);
              window.location.href = `/propiedades?${params.toString()}`;
            }}
            className="px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg flex items-center justify-center group"
          >
            <svg className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchHeroSection;


