"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Property } from '@/app/(proptech)/properties/components/types';
import { propertyService } from '@/app/(proptech)/properties/services/propertyService';

interface SearchFilters {
  query: string;
  type: string;
  status: string;
  minPrice: number | '';
  maxPrice: number | '';
  minBedrooms: number | '';
  minBathrooms: number | '';
  minArea: number | '';
  maxArea: number | '';
  location: string;
  amenities: string[];
  features: string[];
  yearBuilt: number | '';
  parking: boolean;
  furnished: boolean;
  petFriendly: boolean;
  elevator: boolean;
  pool: boolean;
  gym: boolean;
  security: boolean;
}

interface SearchSuggestion {
  id: string;
  type: 'property' | 'location' | 'amenity' | 'feature';
  text: string;
  description?: string;
  count?: number;
}

interface SearchHistory {
  id: string;
  query: string;
  filters: Partial<SearchFilters>;
  timestamp: number;
  results: number;
}

export default function AdvancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    status: 'all',
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    minBathrooms: '',
    minArea: '',
    maxArea: '',
    location: '',
    amenities: [],
    features: [],
    yearBuilt: '',
    parking: false,
    furnished: false,
    petFriendly: false,
    elevator: false,
    pool: false,
    gym: false,
    security: false,
  });

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cargar historial de búsquedas
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }

    const savedRecent = localStorage.getItem('recentSearches');
    if (savedRecent) {
      setRecentSearches(JSON.parse(savedRecent));
    }
  }, []);

  // Guardar historial de búsquedas
  const saveSearchHistory = useCallback((searchData: SearchHistory) => {
    const newHistory = [searchData, ...searchHistory.slice(0, 9)];
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // Guardar búsquedas recientes
    if (searchData.query && !recentSearches.includes(searchData.query)) {
      const newRecent = [searchData.query, ...recentSearches.slice(0, 4)];
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    }
  }, [searchHistory, recentSearches]);

  // Generar sugerencias de búsqueda
  const generateSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const properties = await propertyService.getAllProperties();
      const queryLower = query.toLowerCase();

      const suggestions: SearchSuggestion[] = [];

      // Sugerencias de propiedades
      const propertyMatches = (properties as any).data?.filter((prop: any) => 
        prop.title.toLowerCase().includes(queryLower) ||
        prop.address.toLowerCase().includes(queryLower) ||
        prop.city.toLowerCase().includes(queryLower)
      )
      .slice(0, 3)
      .map((prop: any) => ({
        id: prop.id,
        type: 'property' as const,
        text: prop.title,
        description: `${prop.address} - ${prop.price}`,
        count: 1
      }));

      suggestions.push(...propertyMatches);

      // Sugerencias de ubicaciones
      const locations = [...new Set((properties as any).data?.map((p: any) => p.city) || [])];
      const locationMatches = locations
        .filter((loc: any) => loc.toLowerCase().includes(queryLower))
        .slice(0, 2)
        .map((loc: any) => ({
          id: `loc-${loc}`,
          type: 'location' as const,
          text: loc,
          description: `${(properties as any).data?.filter((p: any) => p.city === loc).length || 0} propiedades`,
          count: (properties as any).data?.filter((p: any) => p.city === loc).length || 0
        }));

      suggestions.push(...locationMatches);

      // Sugerencias de amenidades
      const allAmenities = (properties as any).data?.flatMap((p: any) => p.amenities || []) || [];
      const uniqueAmenities = [...new Set(allAmenities)];
      const amenityMatches = uniqueAmenities
        .filter((amenity: any) => amenity.toLowerCase().includes(queryLower))
        .slice(0, 2)
        .map((amenity: any) => ({
          id: `amenity-${amenity}`,
          type: 'amenity' as const,
          text: amenity,
          description: `${allAmenities.filter((a: any) => a === amenity).length} propiedades`,
          count: allAmenities.filter((a: any) => a === amenity).length
        }));

      suggestions.push(...amenityMatches);

      // Búsquedas recientes
      const recentMatches = recentSearches
        .filter(search => search.toLowerCase().includes(queryLower))
        .slice(0, 2)
        .map(search => ({
          id: `recent-${search}`,
          type: 'location' as const,
          text: search,
          description: 'Búsqueda reciente',
          count: 0
        }));

      suggestions.push(...recentMatches);

      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [recentSearches]);

  // Manejar cambios en la búsqueda
  const handleQueryChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, query: value }));
    if (value.trim()) {
      generateSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [generateSuggestions]);

  // Realizar búsqueda
  const performSearch = useCallback(() => {
    const searchData: SearchHistory = {
      id: Date.now().toString(),
      query: filters.query,
      filters,
      timestamp: Date.now(),
      results: 0 // Se actualizará después
    };

    saveSearchHistory(searchData);

    // Construir URL de búsqueda
    const params = new URLSearchParams();
    if (filters.query) params.append('q', filters.query);
    if (filters.type !== 'all') params.append('type', filters.type);
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.location) params.append('location', filters.location);
    if (filters.amenities.length > 0) params.append('amenities', filters.amenities.join(','));
    if (filters.features.length > 0) params.append('features', filters.features.join(','));

    const searchUrl = `/public/propiedades?${params.toString()}`;
    router.push(searchUrl);
    setShowSuggestions(false);
  }, [filters, router, saveSearchHistory]);

  // Búsqueda por voz
  const startVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('La búsqueda por voz no está disponible en este navegador');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: React.SyntheticEvent) => {
      const transcript = (event as any).results[0][0].transcript;
      setFilters(prev => ({ ...prev, query: transcript }));
      generateSuggestions(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: React.SyntheticEvent) => {
      console.error('Error en reconocimiento de voz:', (event as any).error);
      setIsListening(false);
    };

    recognition.start();
  }, [generateSuggestions]);

  // Manejar clic fuera de las sugerencias
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar teclas
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      performSearch();
    } else if (event.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [performSearch]);

  // Seleccionar sugerencia
  const selectSuggestion = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === 'property') {
      router.push(`/public/propiedad/${suggestion.id}`);
    } else {
      setFilters(prev => ({ ...prev, query: suggestion.text }));
      if (suggestion.type === 'location') {
        setFilters(prev => ({ ...prev, location: suggestion.text }));
      }
    }
    setShowSuggestions(false);
  }, [router]);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, query: '' }));
    setSuggestions([]);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/20 transition-all duration-300">
          {/* Icono de búsqueda */}
          <div className="pl-4 pr-2">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Input de búsqueda */}
          <input
            ref={searchInputRef}
            type="text"
            value={filters.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar propiedades, ubicaciones, amenidades..."
            className="flex-1 px-4 py-4 text-lg bg-transparent border-none outline-none placeholder-gray-400"
          />

          {/* Botones de acción */}
          <div className="flex items-center pr-4 space-x-2">
            {/* Botón de voz */}
            <button
              onClick={startVoiceSearch}
              disabled={isListening}
              className={`p-2 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'text-gray-400 hover:text-brand-500 hover:bg-gray-100'
              }`}
              title="Búsqueda por voz"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {/* Botón de filtros avanzados */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2 rounded-full transition-colors ${
                showAdvancedFilters 
                  ? 'bg-brand-500 text-white' 
                  : 'text-gray-400 hover:text-brand-500 hover:bg-gray-100'
              }`}
              title="Filtros avanzados"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
            </button>

            {/* Botón de limpiar */}
            {filters.query && (
              <button
                onClick={clearSearch}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Limpiar búsqueda"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Botón de búsqueda */}
            <button
              onClick={performSearch}
              disabled={!filters.query.trim()}
              className="px-6 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Sugerencias de búsqueda */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mx-auto"></div>
                <p className="mt-2">Buscando sugerencias...</p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      suggestion.type === 'property' ? 'bg-blue-100 text-blue-600' :
                      suggestion.type === 'location' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {suggestion.type === 'property' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      )}
                      {suggestion.type === 'location' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                      {suggestion.type === 'amenity' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{suggestion.text}</div>
                      {suggestion.description && (
                        <div className="text-sm text-gray-500">{suggestion.description}</div>
                      )}
                    </div>
                    {suggestion.count && suggestion.count > 0 && (
                      <div className="text-sm text-gray-400">
                        {suggestion.count} resultado{suggestion.count !== 1 ? 's' : ''}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No se encontraron sugerencias
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filtros avanzados */}
      {showAdvancedFilters && (
        <div className="mt-4 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Filtros Avanzados</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tipo de propiedad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="house">Casa</option>
                <option value="apartment">Apartamento</option>
                <option value="duplex">Dúplex</option>
                <option value="office">Oficina</option>
                <option value="commercial">Local Comercial</option>
                <option value="land">Terreno</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Disponible</option>
                <option value="inactive">No disponible</option>
              </select>
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ciudad o barrio"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {/* Precio mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio mínimo</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : '' }))}
                placeholder="Precio mínimo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {/* Precio máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio máximo</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : '' }))}
                placeholder="Precio máximo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {/* Dormitorios mínimos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dormitorios mínimos</label>
              <select
                value={filters.minBedrooms}
                onChange={(e) => setFilters(prev => ({ ...prev, minBedrooms: e.target.value ? Number(e.target.value) : '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="">Cualquier cantidad</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
          </div>

          {/* Características */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Características</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'parking', label: 'Estacionamiento' },
                { key: 'furnished', label: 'Amueblado' },
                { key: 'petFriendly', label: 'Mascotas' },
                { key: 'elevator', label: 'Ascensor' },
                { key: 'pool', label: 'Piscina' },
                { key: 'gym', label: 'Gimnasio' },
                { key: 'security', label: 'Seguridad' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters[key as keyof SearchFilters] as boolean}
                    onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setFilters({
                query: '',
                type: 'all',
                status: 'all',
                minPrice: '',
                maxPrice: '',
                minBedrooms: '',
                minBathrooms: '',
                minArea: '',
                maxArea: '',
                location: '',
                amenities: [],
                features: [],
                yearBuilt: '',
                parking: false,
                furnished: false,
                petFriendly: false,
                elevator: false,
                pool: false,
                gym: false,
                security: false,
              })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpiar filtros
            </button>
            <button
              onClick={performSearch}
              className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}

      {/* Historial de búsquedas */}
      {searchHistory.length > 0 && !showSuggestions && (
        <div className="mt-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-3">Búsquedas recientes</h3>
          <div className="space-y-2">
            {searchHistory.slice(0, 5).map((search) => (
              <button
                key={search.id}
                onClick={() => {
                  setFilters(prev => ({ ...prev, ...search.filters }));
                  if (search.query) {
                    handleQueryChange(search.query);
                  }
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{search.query || 'Búsqueda sin texto'}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(search.timestamp).toLocaleDateString('es-ES')} - {search.results} resultados
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 