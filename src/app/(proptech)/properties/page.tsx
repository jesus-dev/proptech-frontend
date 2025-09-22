"use client";
import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import Link from "next/link";


import { PlusIcon, GridIcon, ListIcon } from "@/icons";
import { BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";
import PropertyList from "./components/PropertyList";
import { Property } from "./components/types";
import { propertyService } from "./services/propertyService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Pagination from "@/components/common/Pagination";
import { apiClient } from '@/lib/api';
import { usePropertyTypes } from "../catalogs/property-types/hooks/usePropertyTypes";
import { getAllCities, City } from "../catalogs/cities/services/cityService";

// Función para calcular similitud entre strings (algoritmo de Levenshtein simplificado)
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  
  // Calcular distancia de Levenshtein
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  const maxLength = Math.max(s1.length, s2.length);
  const distance = matrix[s2.length][s1.length];
  return 1 - (distance / maxLength);
};

// Función para normalizar texto (remover acentos, caracteres especiales)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Solo letras, números y espacios
    .replace(/\s+/g, ' ') // Múltiples espacios a uno
    .trim();
};

// Función para extraer palabras clave del texto de búsqueda
const extractKeywords = (searchText: string): string[] => {
  const normalized = normalizeText(searchText);
  const words = normalized.split(' ').filter(word => word.length > 2);
  
  // Palabras comunes a ignorar
  const stopWords = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero', 'si', 'no',
    'en', 'de', 'del', 'con', 'por', 'para', 'sin', 'sobre', 'entre', 'detras', 'despues',
    'ante', 'bajo', 'cabe', 'con', 'contra', 'desde', 'durante', 'hacia', 'hasta', 'mediante',
    'según', 'tras', 'que', 'cual', 'quien', 'cuyo', 'donde', 'cuando', 'como', 'porque',
    'pues', 'ya', 'aun', 'tambien', 'tampoco', 'solo', 'solamente', 'incluso', 'ademas',
    'mientras', 'aunque', 'si', 'como', 'cuando', 'donde', 'porque', 'pues', 'ya', 'aun',
    'tambien', 'tampoco', 'solo', 'solamente', 'incluso', 'ademas', 'mientras', 'aunque'
  ]);
  
  return words.filter(word => !stopWords.has(word));
};

// Función para calcular score de relevancia de una propiedad
const calculatePropertyScore = (property: Property, keywords: string[]): number => {
  if (keywords.length === 0) return 0;
  
  const propertyText = [
    property.title || '',
    property.address || '',
    property.city || '',
    property.state || '',
    property.type || '',
    property.description || '',
    property.amenities?.join(' ') || '',
    property.agent?.name || '',
    property.agent?.phone || '',
    property.agent?.email || ''
  ].join(' ').toLowerCase();
  
  const normalizedPropertyText = normalizeText(propertyText);
  let totalScore = 0;
  
  for (const keyword of keywords) {
    let bestScore = 0;
    
    // Buscar coincidencias exactas primero
    if (normalizedPropertyText.includes(keyword)) {
      bestScore = Math.max(bestScore, 1.0);
    }
    
    // Buscar coincidencias parciales
    const propertyWords = normalizedPropertyText.split(' ');
    for (const word of propertyWords) {
      if (word.length > 2) {
        const similarity = calculateSimilarity(keyword, word);
        if (similarity > 0.7) { // Umbral de similitud
          bestScore = Math.max(bestScore, similarity);
        }
      }
    }
    
    // Bonus por coincidencias en campos importantes
    if (property.title && normalizeText(property.title).includes(keyword)) {
      bestScore += 0.3;
    }
    if (property.address && normalizeText(property.address).includes(keyword)) {
      bestScore += 0.2;
    }
    if (property.city && normalizeText(property.city).includes(keyword)) {
      bestScore += 0.2;
    }
    if (property.type && normalizeText(property.type).includes(keyword)) {
      bestScore += 0.1;
    }
    
    totalScore += bestScore;
  }
  
  return totalScore / keywords.length;
};

// Iconos mejorados
const SearchIcon = ({ className = "size-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FilterIcon = ({ className = "size-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4C3 3.44772 3.44772 3 4 3H20C20.5523 3 21 3.44772 21 4V6.58579C21 6.851 20.8946 7.10536 20.7071 7.29289L14 14V21C14 21.5523 13.5523 22 13 22H11C10.4477 22 10 21.5523 10 21V14L3.29289 7.29289C3.10536 7.10536 3 6.851 3 6.58579V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HomeIcon = ({ className = "size-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 21V7L12 3L19 7V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21V13H15V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 9H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 13H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 13H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Componente memoizado para el input de búsqueda
const SearchInput = memo(({ 
  value, 
  onChange, 
  placeholder,
  showRelevance = false,
  relevanceCount = 0
}: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  placeholder: string;
  showRelevance?: boolean;
  relevanceCount?: number;
}) => (
  <div className="relative flex-1 max-w-md">
    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors"
    />
    {showRelevance && value.trim() && relevanceCount > 0 && (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full">
          {relevanceCount} resultados
        </span>
      </div>
    )}
  </div>
));

SearchInput.displayName = 'SearchInput';

export default function PropertiesPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [priceRangeFilter, setPriceRangeFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState(false);
  const [premiumFilter, setPremiumFilter] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]); // Todas las propiedades
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusOptions, setStatusOptions] = useState<{id: number, name: string}[]>([]);
  const { propertyTypes } = usePropertyTypes();
  const [cities, setCities] = useState<City[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Estado para scroll infinito
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Cargar propiedades con scroll infinito
  const loadProperties = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const response = await propertyService.getPropertiesPaginated({ 
        page, 
        limit: 16 // Cargar 16 propiedades por página
      });

      if (append) {
        setAllProperties(prev => {
          // Evitar duplicados usando un Map
          const existingIds = new Set(prev.map(p => p.id));
          const newProperties = response.properties.filter(p => !existingIds.has(p.id));
          return [...prev, ...newProperties];
        });
      } else {
        setAllProperties(response.properties);
      }
      
      setTotalElements(response.total);
      const totalPages = Math.ceil(response.total / 16); // 16 es el size que estamos usando
      setHasMore(page < totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error loading properties:", err);
      setError("Error al cargar las propiedades.");
    } finally {
      if (page === 1) {
        setLoading(false);
        setIsInitialized(true);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  // Cargar primera página al inicio
  useEffect(() => {
    loadProperties(1, false);
  }, []);

  // Función para cargar más propiedades
  const loadMoreProperties = () => {
    if (!isLoadingMore && hasMore) {
      loadProperties(currentPage + 1, true);
    }
  };

  // Removemos el scroll automático - usaremos botón manual

  // Cargar opciones de estado al inicio
  useEffect(() => {
    apiClient.get('/api/property-status').then((res: any) => {
      setStatusOptions(res.data);
    });
  }, []);

  // Cargar ciudades al inicio
  useEffect(() => {
    getAllCities().then(setCities).catch(() => setCities([]));
  }, []);

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // Reducir a 300ms para mejor respuesta

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filtrar propiedades localmente sin recargar
  const filteredProperties = useMemo(() => {
    let filtered = allProperties;
    
    // Filtros básicos (exactos)
    if (statusFilter.trim()) {
      filtered = filtered.filter(property => property.status === statusFilter.trim());
    }
    
    if (typeFilter.trim()) {
      filtered = filtered.filter(property => property.type === typeFilter.trim());
    }
    
    if (cityFilter.trim()) {
      filtered = filtered.filter(property => 
        property.city && normalizeText(property.city).includes(normalizeText(cityFilter.trim()))
      );
    }
    
    if (priceRangeFilter) {
      const [min, max] = priceRangeFilter.split('-');
      if (min) {
        filtered = filtered.filter(property => property.price >= parseInt(min));
      }
      if (max && max !== '+') {
        filtered = filtered.filter(property => property.price <= parseInt(max));
      }
    }
    
    if (featuredFilter) {
      filtered = filtered.filter(property => property.featured);
    }
    
    if (premiumFilter) {
      filtered = filtered.filter(property => property.premium);
    }
    
    // Búsqueda inteligente con scores de relevancia
    if (debouncedSearchQuery.trim()) {
      const keywords = extractKeywords(debouncedSearchQuery);
      
      if (keywords.length > 0) {
        // Calcular scores para todas las propiedades
        const propertiesWithScores = filtered.map(property => ({
          property,
          score: calculatePropertyScore(property, keywords)
        }));
        
        // Filtrar por score mínimo y ordenar por relevancia
        filtered = propertiesWithScores
          .filter(item => item.score > 0.1) // Umbral mínimo de relevancia
          .sort((a, b) => b.score - a.score) // Ordenar por score descendente
          .map(item => item.property);
      }
    }
    
    return filtered;
  }, [allProperties, debouncedSearchQuery, statusFilter, typeFilter, cityFilter, priceRangeFilter, featuredFilter, premiumFilter]);

  // Para scroll infinito, mostramos todas las propiedades filtradas
  const paginatedProperties = filteredProperties;

  // Handlers optimizados para evitar re-renderizados
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  }, []);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  }, []);

  const handleCityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCityFilter(e.target.value);
  }, []);

  const handlePriceRangeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriceRangeFilter(e.target.value);
  }, []);

  const handleFeaturedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFeaturedFilter(e.target.checked);
  }, []);

  const handlePremiumChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPremiumFilter(e.target.checked);
  }, []);

  const toggleAdvancedFilters = useCallback(() => {
    setShowAdvancedFilters(prev => !prev);
  }, []);

  const toggleView = useCallback((newView: "grid" | "list") => {
    setView(newView);
  }, []);



  const handlePropertyDeleted = (id: string) => {
    // Refresh current page after deletion
    setAllProperties(prev => prev.filter(p => p.id !== id));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setStatusFilter("");
    setTypeFilter("");
    setCityFilter("");
    setPriceRangeFilter("");
    setFeaturedFilter(false);
    setPremiumFilter(false);
    setShowAdvancedFilters(false);
  };

  if (loading && !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <LoadingSpinner size="lg" message="Cargando propiedades del sistema" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar propiedades
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full min-w-0">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-600 rounded-2xl p-3 shadow-sm">
                <HomeIcon className="h-10 w-10" />
              </span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Propiedades
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                  Administra tu portafolio de propiedades inmobiliarias
                </p>
                {debouncedSearchQuery.trim() && (
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="text-brand-600 dark:text-brand-400 font-medium">
                      🔍 Búsqueda inteligente activa
                    </span>
                  </div>
                )}
              </div>
            </div>
            <a
              href="/properties/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200 shadow-lg hover:shadow-xl
                w-full sm:w-auto sm:ml-4 sm:gap-3 sm:px-6 sm:py-3 sm:text-base"
            >
              <HomeIcon className="size-5" />
              Nueva Propiedad
            </a>
            <a
              href="/properties/statistics"
              className="inline-flex items-center gap-3 px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Ver Estadísticas
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Filters and Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex flex-col gap-4">
            {/* Main Search and Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Search */}
              <SearchInput 
                value={searchQuery} 
                onChange={handleSearchChange} 
                placeholder="Buscar por título, dirección, ciudad, tipo, agente... (búsqueda inteligente)" 
                showRelevance={true}
                relevanceCount={filteredProperties.length}
              />

              {/* Filter Toggle Button */}
              <button
                onClick={toggleAdvancedFilters}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  showAdvancedFilters
                    ? "bg-brand-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <FilterIcon className="size-5" />
                {showAdvancedFilters ? "Ocultar filtros" : "Mostrar filtros"}
              </button>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => toggleView("grid")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    view === "grid"
                      ? "bg-white dark:bg-gray-600 text-brand-600 dark:text-brand-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Vista de cuadrícula"
                >
                  <GridIcon className="size-5" />
                </button>
                <button
                  onClick={() => toggleView("list")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    view === "list"
                      ? "bg-white dark:bg-gray-600 text-brand-600 dark:text-brand-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Vista de lista"
                >
                  <ListIcon className="size-5" />
                </button>
              </div>
            </div>

            {/* Advanced Filters - Collapsible */}
            {showAdvancedFilters && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex flex-col gap-4">
                  {/* First Row: Basic Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estado
                      </label>
                      <select
                        value={statusFilter}
                        onChange={handleStatusChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors"
                      >
                        <option value="">Todos los estados</option>
                        {statusOptions.map(opt => (
                          <option key={opt.id} value={opt.name}>{opt.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo
                      </label>
                      <select
                        value={typeFilter}
                        onChange={handleTypeChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors"
                      >
                        <option value="">Todos los tipos</option>
                        {propertyTypes.map((type) => (
                          <option key={type.id} value={type.name}>{type.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* City Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ciudad
                      </label>
                      <select
                        value={cityFilter}
                        onChange={handleCityChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors"
                      >
                        <option value="">Todas las ciudades</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.name}>{city.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rango de precio
                      </label>
                      <select
                        value={priceRangeFilter}
                        onChange={handlePriceRangeChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors"
                      >
                        <option value="">Todos los precios</option>
                        <option value="0-50000">Hasta $50,000</option>
                        <option value="50000-100000">$50,000 - $100,000</option>
                        <option value="100000-200000">$100,000 - $200,000</option>
                        <option value="200000+">Más de $200,000</option>
                      </select>
                    </div>
                  </div>

                  {/* Second Row: Checkboxes and Clear Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Advanced Filters Checkboxes */}
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={featuredFilter}
                          onChange={handleFeaturedChange}
                          className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded transition-colors"
                        />
                        Solo Destacadas
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={premiumFilter}
                          onChange={handlePremiumChange}
                          className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded transition-colors"
                        />
                        Solo Premium
                      </label>
                    </div>

                    {/* Clear Filters Button */}
                    {(searchQuery || statusFilter || typeFilter || cityFilter || priceRangeFilter || featuredFilter || premiumFilter) && (
                      <button
                        onClick={clearAllFilters}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Limpiar todos los filtros
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Properties Content */}
        {filteredProperties.length > 0 ? (
          <PropertyList 
            properties={paginatedProperties} 
            view={view} 
            onPropertyDeleted={handlePropertyDeleted}
            isFavoritesPage={false}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <HomeIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No se encontraron propiedades
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter || typeFilter || cityFilter || priceRangeFilter || featuredFilter || premiumFilter
                ? "No hay propiedades que coincidan con los criterios de búsqueda seleccionados."
                : "Aún no tienes propiedades registradas. Comienza agregando tu primera propiedad."}
            </p>
            {!searchQuery && !statusFilter && !typeFilter && !cityFilter && !priceRangeFilter && !featuredFilter && !premiumFilter && (
              <a
                href="/properties/new"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
              >
                <HomeIcon className="size-5" />
                Nueva Propiedad
              </a>
            )}
          </div>
        )}

        {/* Botón Cargar Más Propiedades */}
        {hasMore && !isLoadingMore && (
          <div className="flex justify-center py-8">
            <button
              onClick={loadMoreProperties}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <span>Cargar más propiedades</span>
              <span className="text-sm opacity-75">({allProperties.length} de {totalElements})</span>
            </button>
          </div>
        )}
        
        {/* Indicador de carga */}
        {isLoadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-gray-600">Cargando más propiedades...</span>
          </div>
        )}
        
        {/* Indicador de fin de resultados */}
        {!hasMore && allProperties.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>✅ Has visto todas las propiedades disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
} 