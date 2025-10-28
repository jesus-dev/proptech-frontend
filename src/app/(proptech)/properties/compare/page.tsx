"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { propertyService } from "../services/propertyService";
import { Property } from "../components/types";
import { 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Ruler, 
  DollarSign, 
  Search, 
  X, 
  Plus,
  Star,
  Eye,
  Calendar,
  Building,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from 'sonner';
import ModernPopup from '@/components/ui/ModernPopup';

// Types and Interfaces
interface ComparisonProperty extends Property {
  comparisonId: string;
}

interface ComparisonFeature {
  label: string;
  key: keyof Property;
  icon: React.ReactNode;
  formatter?: (value: any) => string;
}

// Constants
const MAX_COMPARISON_PROPERTIES = 4;

const COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    label: "Título",
    key: "title",
    icon: <Home className="w-4 h-4" />
  },
  {
    label: "Precio",
    key: "price",
    icon: <DollarSign className="w-4 h-4" />,
    formatter: (value: number) => value?.toLocaleString('es-PY', { 
      style: 'currency', 
      currency: 'PYG' 
    }) || 'No especificado'
  },
  {
    label: "Tipo",
    key: "type",
    icon: <Building className="w-4 h-4" />
  },
  {
    label: "Operación",
    key: "operacion",
    icon: <DollarSign className="w-4 h-4" />,
    formatter: (value: string) => {
      const operationMap: Record<string, string> = {
        'SALE': 'Venta',
        'RENT': 'Alquiler',
        'BOTH': 'Venta y Alquiler'
      };
      return operationMap[value] || value || 'No especificado';
    }
  },
  {
    label: "Ciudad",
    key: "city",
    icon: <MapPin className="w-4 h-4" />
  },
  {
    label: "Dirección",
    key: "address",
    icon: <MapPin className="w-4 h-4" />
  },
  {
    label: "Dormitorios",
    key: "bedrooms",
    icon: <Bed className="w-4 h-4" />,
    formatter: (value: number) => value?.toString() || 'No especificado'
  },
  {
    label: "Baños",
    key: "bathrooms",
    icon: <Bath className="w-4 h-4" />,
    formatter: (value: number) => value?.toString() || 'No especificado'
  },
  {
    label: "Estacionamientos",
    key: "parking",
    icon: <Car className="w-4 h-4" />,
    formatter: (value: number) => value?.toString() || 'No especificado'
  },
  {
    label: "Área (m²)",
    key: "area",
    icon: <Ruler className="w-4 h-4" />,
    formatter: (value: number) => value ? `${value} m²` : 'No especificado'
  },
  {
    label: "Año de construcción",
    key: "yearBuilt",
    icon: <Calendar className="w-4 h-4" />,
    formatter: (value: number) => value?.toString() || 'No especificado'
  },
  {
    label: "Estado",
    key: "status",
    icon: <CheckCircle className="w-4 h-4" />,
    formatter: (value: string) => {
      const statusMap: Record<string, string> = {
        'active': 'Disponible',
        'sold': 'Vendida',
        'pending': 'En Proceso'
      };
      return statusMap[value] || value || 'No especificado';
    }
  },
  {
    label: "Destacada",
    key: "featured",
    icon: <Star className="w-4 h-4" />,
    formatter: (value: boolean) => value ? 'Sí' : 'No'
  }
];

// Utility Functions
const getImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://api.proptech.com.py' : 'http://localhost:8080');
  // Ensure we don't double-concatenate URLs
  if (imageUrl.startsWith('/') && apiBaseUrl.endsWith('/')) {
    return `${apiBaseUrl.slice(0, -1)}${imageUrl}`;
  }
  return `${apiBaseUrl}${imageUrl}`;
};

// Custom Hooks
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

const usePropertySearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const searchProperties = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      // Usar advancedSearch con el filtro de búsqueda
      const filters = { search: query.trim() };
      const results = await propertyService.advancedSearch(filters);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Error searching properties:', error);
      setSearchError('Error al buscar propiedades');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Auto-search cuando cambia el query con debounce
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchProperties(debouncedSearchQuery);
    } else {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
    }
  }, [debouncedSearchQuery, searchProperties]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    searchError,
    searchProperties,
    clearSearch
  };
};

export default function PropertyComparePage() {
  // State Management
  const [comparisonProperties, setComparisonProperties] = useState<ComparisonProperty[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  // Search Hook
  const { 
    searchQuery, 
    setSearchQuery, 
    searchResults, 
    searchLoading, 
    searchError, 
    searchProperties,
    clearSearch
  } = usePropertySearch();

  // Event Handlers
  const handleAddProperty = useCallback((property: Property) => {
    if (comparisonProperties.length >= MAX_COMPARISON_PROPERTIES) {
      toast.error(`Solo puedes comparar hasta ${MAX_COMPARISON_PROPERTIES} propiedades`);
      return;
    }

    const comparisonId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const comparisonProperty: ComparisonProperty = {
      ...property,
      comparisonId
    };

    setComparisonProperties(prev => [...prev, comparisonProperty]);
    setShowSearchModal(false);
    clearSearch();
    toast.success('Propiedad agregada a la comparación');
  }, [comparisonProperties.length, clearSearch]);

  const handleRemoveProperty = useCallback((comparisonId: string) => {
    setComparisonProperties(prev => prev.filter(p => p.comparisonId !== comparisonId));
    toast.success('Propiedad removida de la comparación');
  }, []);

  const handleClearAll = useCallback(() => {
    setComparisonProperties([]);
    toast.success('Comparación limpiada');
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // El debounce ya maneja la búsqueda automáticamente
    // Solo prevenimos el submit por defecto
  }, []);

  // Computed Values
  const canAddMore = useMemo(() => 
    comparisonProperties.length < MAX_COMPARISON_PROPERTIES, 
    [comparisonProperties.length]
  );

  const hasProperties = useMemo(() => 
    comparisonProperties.length > 0, 
    [comparisonProperties.length]
  );

  const canCompare = useMemo(() => 
    comparisonProperties.length >= 2, 
    [comparisonProperties.length]
  );

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 mb-4 shadow-lg">
          <Eye className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Comparador de Propiedades
        </h1>
        <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 text-center max-w-2xl">
          Compara hasta {MAX_COMPARISON_PROPERTIES} propiedades lado a lado para tomar la mejor decisión de inversión.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setShowSearchModal(true)}
            disabled={!canAddMore}
            className="!bg-blue-600 !text-white hover:!bg-blue-700 dark:!bg-blue-500 dark:hover:!bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Agregar Propiedad</span>
            <span className="sm:hidden">Agregar</span>
          </Button>
          
          {hasProperties && (
            <Button
              onClick={handleClearAll}
              variant="outline"
              className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-400 dark:hover:border-red-500"
              size="sm"
            >
              <X className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Limpiar Todo</span>
              <span className="sm:hidden">Limpiar</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          {comparisonProperties.length} de {MAX_COMPARISON_PROPERTIES} propiedades
        </div>
      </div>

      {/* Comparison Table */}
      {hasProperties ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white min-w-[200px]">
                    Características
                  </th>
                  {comparisonProperties.map((property) => (
                    <th key={property.comparisonId} className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white min-w-[250px] relative">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2 overflow-hidden">
                          {property.galleryImages && property.galleryImages.length > 0 ? (
                            <img
                              src={getImageUrl(property.galleryImages[0].url) || ''}
                              alt={property.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <Home className="w-8 h-8 text-gray-400 dark:text-gray-500 hidden mx-auto mt-4" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                          {property.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {property.city}
                        </p>
                        <Button
                          onClick={() => handleRemoveProperty(property.comparisonId)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-950 text-xs"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {COMPARISON_FEATURES.map((feature, index) => (
                  <tr key={feature.key} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {feature.icon}
                      {feature.label}
                    </td>
                    {comparisonProperties.map((property) => (
                      <td key={property.comparisonId} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 text-center">
                        {feature.formatter 
                          ? feature.formatter(property[feature.key])
                          : String(property[feature.key] || 'No especificado')
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Eye className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No hay propiedades para comparar
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-md mx-auto">
            Agrega al menos 2 propiedades para comenzar la comparación y tomar la mejor decisión de inversión.
          </p>
          <Button
            onClick={() => setShowSearchModal(true)}
            className="!bg-blue-600 !text-white hover:!bg-blue-700 dark:!bg-blue-500 dark:hover:!bg-blue-600 shadow-md px-6 py-3"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar Primera Propiedad
          </Button>
        </div>
      )}

      {/* Search Modal */}
      <ModernPopup
        isOpen={showSearchModal}
        onClose={() => {
          setShowSearchModal(false);
          clearSearch();
        }}
        title="Buscar Propiedades"
        subtitle="Encuentra propiedades para agregar a la comparación"
        icon={<Search className="w-6 h-6 text-white" />}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, ciudad, tipo..."
                className="pr-10"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <Button type="submit" disabled={!searchQuery.trim()}>
              <Search className="w-4 h-4" />
            </Button>
          </form>

          {/* Search Results */}
          {searchError && (
            <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
              {searchError}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {searchResults.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900"
                >
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {property.galleryImages && property.galleryImages.length > 0 ? (
                      <img
                        src={getImageUrl(property.galleryImages[0].url) || ''}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <Home className="w-6 h-6 text-gray-400 dark:text-gray-500 hidden mx-auto mt-3" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {property.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {property.city} • {property.type}
                    </p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {property.price?.toLocaleString('es-PY', { 
                        style: 'currency', 
                        currency: 'PYG' 
                      })}
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => handleAddProperty(property)}
                    size="sm"
                    className="!bg-blue-600 !text-white hover:!bg-blue-700 dark:!bg-blue-500 dark:hover:!bg-blue-600 shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchQuery && !searchLoading && searchResults.length === 0 && !searchError && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>No se encontraron propiedades con ese criterio de búsqueda</p>
              <p className="text-sm mt-1">Intenta con otros términos como "casa", "departamento", o el nombre de una ciudad</p>
            </div>
          )}

          {!searchQuery && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2" />
              <p>Escribe en el campo de búsqueda para encontrar propiedades</p>
              <p className="text-sm mt-1">Puedes buscar por título, ciudad, tipo de propiedad, etc.</p>
            </div>
          )}
        </div>
      </ModernPopup>
    </div>
  );
}
