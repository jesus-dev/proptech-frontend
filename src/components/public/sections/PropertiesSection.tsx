"use client";

import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { publicPropertyService } from '@/services/publicPropertyService';
import { getImageBaseUrl } from '@/config/environment';
import { apiClient } from '@/lib/api';

// Estado para datos reales
type PublicProperty = any;

// Función helper para construir URLs completas de imágenes
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '/images/placeholder.jpg';
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si es una ruta relativa, construir la URL completa usando la configuración
  const baseUrl = getImageBaseUrl();
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

// Función helper para limpiar HTML y extraer texto plano
const stripHtml = (html: string | null | undefined): string => {
  if (!html) return '';
  
  // Crear un elemento temporal para parsear el HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Extraer solo el texto
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Componente de imagen optimizada con lazy loading
const OptimizedImage = ({ src, alt, className, onLoad, onError }: {
  src: string | null;
  alt: string;
  className: string;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}) => {
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    onError?.(e);
  }, [onError]);

  // Si no hay src, mostrar placeholder directamente
  if (!src) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={hasError ? '/images/placeholder.jpg' : getImageUrl(src)}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={handleError}
    />
  );
};

const propertyTypes = [
  { value: '', label: 'Todos los Tipos' },
  { value: 'venta', label: 'Venta' },
  { value: 'alquiler', label: 'Alquiler' }
];

// Las categorías de propiedades ahora se cargarán dinámicamente
const defaultPropertyCategories = [
  { value: '', label: 'Todas las Categorías' }
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

const PropertiesSectionContent = ({ defaultCategory }: { defaultCategory?: string }) => {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory || '');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedBedrooms, setSelectedBedrooms] = useState('');
  const [selectedBathrooms, setSelectedBathrooms] = useState('');
  const [selectedAreaRange, setSelectedAreaRange] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [properties, setProperties] = useState<PublicProperty[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Estado para categorías dinámicas
  const [propertyCategories, setPropertyCategories] = useState(defaultPropertyCategories);

  // Calcular ciudades únicas dinámicamente desde las propiedades cargadas
  const availableCities = React.useMemo(() => {
    const citiesCount = new Map<string, number>();
    
    properties.forEach(property => {
      const city = property.cityName || property.address;
      if (city && city.trim()) {
        // Extraer el nombre de la ciudad del string (puede contener dirección completa)
        const cityName = city.split(',')[0].trim();
        citiesCount.set(cityName, (citiesCount.get(cityName) || 0) + 1);
      }
    });
    
    // Convertir Map a array y ordenar alfabéticamente
    const sortedCities = Array.from(citiesCount.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([city, count]) => ({
        value: city,
        label: `${city} (${count})`
      }));
    
    // Retornar con la opción "Todas las Ciudades" al inicio
    return [
      { value: '', label: `Todas las Ciudades (${properties.length})` },
      ...sortedCities
    ];
  }, [properties]);

  // Verificar si hay filtros activos
  const hasActiveFilters = React.useMemo(() => {
    return (
      searchTerm !== '' ||
      selectedType !== '' ||
      (selectedCategory !== '' && selectedCategory !== defaultCategory) ||
      selectedCity !== '' ||
      selectedPriceRange !== '' ||
      selectedBedrooms !== '' ||
      selectedBathrooms !== '' ||
      selectedAreaRange !== ''
    );
  }, [searchTerm, selectedType, selectedCategory, selectedCity, selectedPriceRange, selectedBedrooms, selectedBathrooms, selectedAreaRange, defaultCategory]);

  // Cargar categorías de propiedades dinámicamente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiClient.get('/api/property-types');
        if (response.data && Array.isArray(response.data)) {
          const categories = response.data
            .filter((type: any) => type.active !== false)
            .map((type: any) => ({
              value: type.name.toLowerCase().replace(/ /g, '-'),
              label: type.name
            }));
          setPropertyCategories([
            { value: '', label: 'Todas las Categorías' },
            ...categories
          ]);
        }
      } catch (error) {
        console.error('Error loading property categories:', error);
        // Mantener las categorías por defecto si hay error
      }
    };

    loadCategories();
  }, []);

  // Función para cargar propiedades iniciales
  const loadInitialProperties = async () => {
    try {
      setLoading(true);
      setError('');
      setCurrentPage(1);
      
      const data = await publicPropertyService.getPropertiesPaginated({ page: 1, limit: 6 });
      
      if (data && data.properties) {
        setProperties(Array.isArray(data.properties) ? data.properties : []);
        setHasMore(data.properties.length === 6);
      } else {
        setProperties([]);
        setHasMore(false);
      }
    } catch (e: any) {
      console.error('Error al cargar propiedades:', e);
      setError('No se pudieron cargar propiedades. Por favor, verifica que el backend esté funcionando.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar propiedades reales y aplicar filtros desde URL
  useEffect(() => {
    loadInitialProperties();

    const tipo = searchParams.get('tipo');
    const categoria = searchParams.get('categoria');
    
    if (tipo) {
      setSelectedType(tipo);
    }
    if (categoria) {
      setSelectedCategory(categoria);
    }
  }, [searchParams]);

  // Función para cargar más propiedades
  const loadMoreProperties = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const data = await publicPropertyService.getPropertiesPaginated({ page: nextPage, limit: 6 });
      
      if (data.properties && data.properties.length > 0) {
        setProperties(prev => [...prev, ...data.properties]);
        setCurrentPage(nextPage);
        setHasMore(data.properties.length === 6);
      } else {
        setHasMore(false);
      }
    } catch (e: any) {
      console.error('Error loading more properties:', e);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore]);

  const formatPrice = (price: number, currency: string, period?: string) => {
    const currencySymbol = currency === 'PYG' ? 'Gs.' : '$';
    const formattedPrice = new Intl.NumberFormat('es-PY').format(price);
    return `${currencySymbol} ${formattedPrice}${period ? `/${period}` : ''}`;
  };

  const getPropertyCategory = (property: any) => {
    if (property.bedrooms === 0 && property.bathrooms === 0) return 'terreno';
    if (property.bedrooms === 0) return 'oficina';
    if (property.area < 100) return 'apartamento';
    return 'casa';
  };

  const filteredProperties = properties.filter((property: any) => {
    const title = property.title || '';
    const loc = property.cityName || property.address || '';
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType ? (() => {
      if (selectedType === 'venta') return property.operacion === 'SALE';
      if (selectedType === 'alquiler') return property.operacion === 'RENT';
      return true;
    })() : true;
    const matchesCategory = selectedCategory ? getPropertyCategory(property) === selectedCategory : true;
    const matchesCity = selectedCity ? loc.includes(selectedCity) : true;
    
    // Filtro de precio
    const matchesPrice = selectedPriceRange ? (() => {
      if (selectedPriceRange === '1000000000+') return (property.price || 0) >= 1000000000;
      const [min, max] = selectedPriceRange.split('-').map(Number);
      const price = property.price || 0;
      return price >= min && price <= max;
    })() : true;
    
    // Filtro de dormitorios
    const matchesBedrooms = selectedBedrooms ? (() => {
      if (selectedBedrooms === '5+') return (property.bedrooms || 0) >= 5;
      return (property.bedrooms || 0) === parseInt(selectedBedrooms);
    })() : true;
    
    // Filtro de baños
    const matchesBathrooms = selectedBathrooms ? (() => {
      if (selectedBathrooms === '4+') return (property.bathrooms || 0) >= 4;
      return (property.bathrooms || 0) === parseInt(selectedBathrooms);
    })() : true;
    
    // Filtro de área
    const matchesArea = selectedAreaRange ? (() => {
      if (selectedAreaRange === '300+') return (property.area || 0) >= 300;
      const [min, max] = selectedAreaRange.split('-').map(Number);
      const area = property.area || 0;
      return area >= min && area <= max;
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
    // Resetear paginación
    setCurrentPage(1);
    setHasMore(true);
    setProperties([]);
    // Recargar propiedades
    loadInitialProperties();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section solo para página principal */}
      {!defaultCategory && (
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
          <div className="max-w-4xl mx-auto">
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
                    {availableCities.map(city => (
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

                      {!defaultCategory && (
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
                      )}
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
              <div className={`flex items-center ${hasActiveFilters ? 'justify-between' : 'justify-start'} text-sm relative z-10`}>
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
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="group relative overflow-hidden text-cyan-200 hover:text-white font-semibold bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 px-5 py-2.5 rounded-xl transition-all duration-300 border border-white/30 hover:border-white/50 flex items-center space-x-2 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <svg className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="relative z-10 text-sm">Limpiar</span>
                  </button>
                )}
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

              {/* Buscador original para página principal */}
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
                    {availableCities.map(city => (
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

                      {!defaultCategory && (
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
                      )}

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
              <div className={`flex items-center ${hasActiveFilters ? 'justify-between' : 'justify-start'} pt-6 border-t border-cyan-300/20 relative z-10`}>
                <div className="flex items-center space-x-4">
                  {/* Categoría activa cuando hay defaultCategory */}
                  {defaultCategory && (
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-3 py-2 rounded-lg border border-blue-400/30">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="text-blue-200 font-semibold text-sm">
                        {propertyCategories.find(cat => cat.value === defaultCategory)?.label || defaultCategory}
                      </span>
                    </div>
                  )}
                  
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
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="group relative overflow-hidden text-cyan-200 hover:text-white font-semibold bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 px-6 py-3 rounded-xl transition-all duration-300 border border-white/30 hover:border-white/50 flex items-center space-x-2 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <svg className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="relative z-10">Limpiar Filtros</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        </section>
      )}

      {/* Buscador avanzado para páginas con categoría */}
      {defaultCategory && (
        <div className="bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 relative overflow-hidden pt-8 pb-8">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/15 via-indigo-900/15 to-blue-950/15"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-700/10 to-indigo-700/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-indigo-700/10 to-blue-800/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white hover:border-blue-500 transition-all duration-200 placeholder:text-gray-700 text-gray-950 font-semibold shadow-sm"
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
                  className="pl-10 pr-8 py-3 border-2 border-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white hover:border-indigo-500 transition-all duration-200 min-w-[140px] font-bold text-gray-950 shadow-sm"
                >
                  <option value="">Ubicación</option>
                  {availableCities.map(city => (
                    <option key={city.value} value={city.value}>{city.label}</option>
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
                className="px-5 py-3 border-2 border-gray-700 bg-white rounded-xl hover:bg-gray-100 hover:border-gray-900 transition-all duration-200 text-sm font-bold flex items-center text-gray-950 hover:text-black group shadow-sm"
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
                  setCurrentPage(1);
                  loadInitialProperties();
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg flex items-center justify-center group"
              >
                <svg className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
            </div>

            {/* Filtros adicionales desplegables */}
            {showAdvancedFilters && (
              <div className="mt-4 pt-4 border-t-2 border-gray-400">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Filtro de tipo */}
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-3 border-2 border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white font-bold text-gray-950 hover:border-blue-500 transition-colors shadow-sm"
                      >
                        <option value="">Tipo de propiedad</option>
                        {propertyTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>

                      {/* Filtro de precio */}
                      <select
                        value={selectedPriceRange}
                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                        className="px-4 py-3 border-2 border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white font-bold text-gray-950 hover:border-blue-500 transition-colors shadow-sm"
                      >
                        <option value="">Rango de precio</option>
                        {priceRanges.map(range => (
                          <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                      </select>

                      {/* Filtro de dormitorios */}
                      <select
                        value={selectedBedrooms}
                        onChange={(e) => setSelectedBedrooms(e.target.value)}
                        className="px-4 py-3 border-2 border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white font-bold text-gray-950 hover:border-blue-500 transition-colors shadow-sm"
                      >
                        <option value="">Dormitorios</option>
                        {bedroomsOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>

                      {/* Filtro de baños */}
                      <select
                        value={selectedBathrooms}
                        onChange={(e) => setSelectedBathrooms(e.target.value)}
                        className="px-4 py-3 border-2 border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white font-bold text-gray-950 hover:border-blue-500 transition-colors shadow-sm"
                      >
                        <option value="">Baños</option>
                        {bathroomsOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Botón limpiar filtros */}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={clearFilters}
                        className="group px-6 py-3 text-sm text-white font-extrabold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 border-2 border-red-700 hover:border-red-800 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center space-x-2"
                      >
                        <svg className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Limpiar filtros</span>
                      </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sección de Lista de Propiedades */}
      <div className="bg-gradient-to-b from-white via-gray-50 to-cyan-50 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">

        {/* Lista de Propiedades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-stretch' : 'space-y-4 sm:space-y-6'}
        >
          {loading ? (
            // Skeleton Loading Cards - Diseño premium con shimmer
            <>
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-white via-white to-gray-50/50 rounded-xl shadow-lg border border-gray-100/50 overflow-hidden relative h-full flex flex-col min-h-[420px]"
                >
                  {/* Shimmer overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" style={{
                    animation: 'shimmer 2s infinite linear',
                  }}></div>
                  
                  {/* Skeleton Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-300 border-t-cyan-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                      </div>
                    </div>
                    {/* Pulsos decorativos */}
                    <div className="absolute top-4 left-4 w-20 h-20 bg-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute bottom-4 right-4 w-24 h-24 bg-blue-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                  
                  {/* Skeleton Content */}
                  <div className="p-4 flex-1 flex flex-col space-y-3">
                    {/* Skeleton Title con animación */}
                    <div className="space-y-2">
                      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-md w-full animate-pulse"></div>
                      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-md w-3/4 animate-pulse"></div>
                    </div>
                    
                    {/* Skeleton Location */}
                    <div className="flex items-center space-x-2 animate-pulse">
                      <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
                    </div>
                    
                    {/* Skeleton Agent Box */}
                    <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-xl p-3 animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Skeleton Features */}
                    <div className="grid grid-cols-4 gap-2 animate-pulse">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="text-center space-y-1">
                          <div className="h-5 bg-gray-300 rounded mx-auto w-10"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Spacer */}
                    <div className="flex-1"></div>
                    
                    {/* Skeleton Price */}
                    <div className="text-center space-y-1 animate-pulse">
                      <div className="h-7 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-lg w-3/4 mx-auto"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
                    </div>
                    
                    {/* Skeleton Description */}
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    
                    {/* Skeleton Button */}
                    <div className="h-12 bg-gradient-to-r from-blue-200 via-blue-300 to-indigo-300 rounded-xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          ) : error ? (
            <div className="col-span-full text-center py-16 text-red-600 font-medium">{error}</div>
          ) : filteredProperties.length > 0 ? (
            filteredProperties.map(property => {
              // Procesar datos del agente para el frontend
              if (property.agent) {
                const firstName = property.agent.firstName || '';
                const lastName = property.agent.lastName || '';
                property.agent.name = `${firstName} ${lastName}`.trim();
                property.agent.avatar = property.agent.photo;
                // Si no hay nombre completo, usar email como fallback
                if (!property.agent.name) {
                  property.agent.name = property.agent.email || 'Agente';
                }
              }
              
              return (
              <Link href={`/propiedad/${property.slug || property.id}`} key={property.id || property.slug || Math.random()} className="block h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className={`group bg-gradient-to-br from-white via-white to-gray-50/50 rounded-xl shadow-lg hover:shadow-xl border border-gray-100/50 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] relative h-full flex flex-col min-h-[420px] backdrop-blur-sm hover:backdrop-blur-md cursor-pointer ${viewMode === 'list' ? 'sm:flex-row sm:min-h-[280px]' : ''}`}
              >
              {/* Imagen con overlay premium y efectos mágicos ✨ */}
              <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-full sm:w-80 h-40 sm:h-48' : 'h-40 sm:h-48'}`}>
                {/* Overlay con gradiente más hermoso */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 group-hover:from-black/50 transition-all duration-500"></div>
                
                {/* Efecto de brillo sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-20"></div>
                
                <OptimizedImage
                  src={property.featuredImage || (property.galleryImages && property.galleryImages.length > 0 ? property.galleryImages[0].url : null)}
                  alt={property.title || 'Propiedad'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 group-hover:brightness-110"
                />
                
                {/* Badge tipo premium con efectos mágicos ✨ */}
                <div className="absolute top-4 left-4 z-20">
                  <div className={`px-4 py-2 rounded-2xl backdrop-blur-md border font-bold text-sm shadow-xl transform group-hover:scale-105 transition-all duration-300 ${
                    property.operacion === 'SALE'
                      ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white border-emerald-300/60 shadow-emerald-400/40 group-hover:shadow-emerald-400/60' 
                      : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white border-blue-300/60 shadow-blue-400/40 group-hover:shadow-blue-400/60'
                  }`}>
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">{property.operacion === 'SALE' ? '🏠' : '🏢'}</span>
                      <span>{property.operacion === 'SALE' ? 'Venta' : property.operacion === 'RENT' ? 'Alquiler' : 'Ambos'}</span>
                    </div>
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
                {property.galleryImages && property.galleryImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 z-20">
                    <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-white text-sm font-medium">{property.galleryImages.length}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Detalles con diseño premium compacto */}
              <div className={`p-3 flex-1 flex flex-col ${viewMode === 'list' ? 'sm:flex-1' : ''}`}>
                {/* Título */}
                <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-tight mb-2">
                  {property.title}
                </h3>

                {/* Ubicación compacta */}
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">
                    {property.cityName || property.address || 'Ubicación no disponible'}
                  </span>
                </div>

                {/* Información del Agente y Agencia - Mejorada */}
                <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-xl p-3 mb-3 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        {property.agent?.name || property.agentName ? (
                          <>
                            {property.agent?.avatar || property.agent?.photo ? (
                              <img 
                                src={getImageUrl(property.agent.avatar || property.agent.photo)} 
                                alt={property.agent?.name || property.agentName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                <span className="text-white text-base font-bold">
                                  {(property.agent?.name || property.agentName || 'A').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm">
                              <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                          </>
                        ) : property.agencyName ? (
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-blue-700 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        {/* Nombre del agente o agencia */}
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {property.agent?.name || property.agentName || property.agencyName || 'Propietario'}
                          </p>
                          {(property.agent?.name || property.agentName) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Agente
                            </span>
                          )}
                        </div>
                        
                        {/* Subtítulo con agencia */}
                        <div className="flex items-center gap-2 mt-0.5">
                          {(property.agent?.name || property.agentName) && property.agencyName && (
                            <>
                              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <p className="text-xs text-slate-600 truncate font-medium">{property.agencyName}</p>
                            </>
                          )}
                          {!(property.agent?.name || property.agentName) && property.agencyName && (
                            <p className="text-xs text-blue-600 font-semibold">Agencia Inmobiliaria</p>
                          )}
                        </div>
                        {/* Rating o badges */}
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="text-xs text-slate-600 ml-1">4.9</span>
                          </div>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-green-600 font-medium">Disponible</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Botones de contacto mejorados */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {property.agent?.phone && (
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110"
                          title="Llamar"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                      )}
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110"
                        title={property.agent?.name ? 'Contactar agente' : 'Contactar agencia'}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Características minimalistas */}
                <div className="grid grid-cols-4 gap-1 mb-2">
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-900">{property.bedrooms}</div>
                    <div className="text-xs text-gray-500">Dorm.</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-xs text-gray-500">Baños</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-900">{property.area}</div>
                    <div className="text-xs text-gray-500">m²</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-900">{property.parking}</div>
                    <div className="text-xs text-gray-500">Estac.</div>
                  </div>
                </div>

                {/* Espaciador */}
                <div className="flex-1"></div>

                {/* Precio */}
                <div className="text-center mb-2">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(property.price || 0, property.currencyCode || 'PYG')}
                  </div>
                  {property.operacion === 'RENT' && (
                    <div className="text-xs text-gray-500">por mes</div>
                  )}
                </div>

                {/* Descripción */}
                <p className="text-gray-600 text-xs line-clamp-2 mb-3 leading-relaxed">
                  {stripHtml(property.description)}
                </p>

                {/* Botón premium mejorado */}
                <div>
                  <button className="group relative w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden">
                    {/* Efecto de brillo animado */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    
                    <div className="relative flex items-center justify-center space-x-2">
                      <span>Ver Detalles</span>
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    
                    {/* Efecto de partículas */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-2 left-2 w-1 h-1 bg-white/60 rounded-full animate-ping"></div>
                      <div className="absolute top-4 right-3 w-1 h-1 bg-white/40 rounded-full animate-ping delay-100"></div>
                      <div className="absolute bottom-3 left-4 w-1 h-1 bg-white/50 rounded-full animate-ping delay-200"></div>
                    </div>
                  </button>
                </div>
              </div>
              </motion.div>
              </Link>
              );
            })
          ) : (
            <div className="col-span-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl shadow-xl border-2 border-blue-100 p-12 text-center relative overflow-hidden"
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
                
                <div className="relative">
                  {/* Icon */}
                  <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <svg className="w-14 h-14 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                    No encontramos propiedades
                  </h3>
                  
                  {/* Description */}
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                    No hay propiedades que coincidan con tus criterios de búsqueda. 
                    <span className="block mt-2 font-semibold text-gray-700">
                      ¿Qué tal si pruebas con otros filtros?
                    </span>
                  </p>
                  
                  {/* Suggestions */}
                  <div className="mb-10 max-w-3xl mx-auto">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Sugerencias:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-xl p-4 shadow-md border border-blue-100 hover:shadow-lg transition-shadow">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">Amplía el rango de precios</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-md border border-purple-100 hover:shadow-lg transition-shadow">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">Prueba otras ubicaciones</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-md border border-pink-100 hover:shadow-lg transition-shadow">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">Cambia el tipo de propiedad</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                      onClick={clearFilters}
                      className="group inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Limpiar Todos los Filtros
                    </button>
                    
                    <a
                      href="/propiedades"
                      className="inline-flex items-center px-10 py-4 bg-white text-blue-600 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl border-2 border-blue-200 hover:border-blue-300 hover:scale-105"
                    >
                      Ver Todas las Propiedades
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Botón Cargar Más - Mejorado */}
          {!loading && !error && filteredProperties.length > 0 && hasMore && (
            <div className="col-span-full flex justify-center mt-8">
              <motion.button
                onClick={loadMoreProperties}
                disabled={loadingMore}
                whileHover={{ scale: loadingMore ? 1 : 1.05 }}
                whileTap={{ scale: loadingMore ? 1 : 0.95 }}
                className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
              >
                {/* Shimmer effect on hover */}
                {!loadingMore && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                )}
                
                {/* Loading spinner effect */}
                {loadingMore && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 animate-pulse"></div>
                )}
                
                {/* Content */}
                <div className="relative z-10 flex items-center justify-center space-x-3">
                  {loadingMore ? (
                    <>
                      <div className="relative">
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                      <span className="font-bold">Cargando propiedades</span>
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="font-bold">Cargar más propiedades</span>
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </div>
                
                {/* Glow effect */}
                {!loadingMore && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                )}
              </motion.button>
            </div>
          )}

          {/* Mensaje cuando no hay más propiedades */}
          {!loading && !error && filteredProperties.length > 0 && !hasMore && (
            <div className="col-span-full text-center mt-8">
              <p className="text-gray-500 text-sm">
                Has visto todas las propiedades disponibles
              </p>
            </div>
          )}
        </motion.div>
        </div>
      </div>
    </div>
  );
};

const PropertiesSection = ({ defaultCategory }: { defaultCategory?: string } = {}) => {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center h-96 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="relative">
          {/* Spinner doble */}
          <div className="w-20 h-20 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="mt-6 text-lg font-semibold text-gray-700">Cargando propiedades</p>
        <div className="flex space-x-2 mt-3">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    }>
      <PropertiesSectionContent defaultCategory={defaultCategory} />
    </Suspense>
  );
};

export default PropertiesSection;