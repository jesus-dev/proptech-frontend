"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { propertyService } from "../services/propertyService";
import { Property } from "../components/types";
import { 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  DollarSign, 
  Search, 
  CheckCircle, 
  Mail, 
  BuildingIcon, 
  Eye,
  BookMarked, 
  Edit, 
  Trash2,
  ChevronDown
} from "lucide-react";
import { Dialog } from '@headlessui/react';
import { toast } from 'sonner';
import ModernPopup from '@/components/ui/ModernPopup';



// Types and Interfaces
interface PropertyWithAgencyUrl extends Property {
  agencyPublicUrl?: string;
}

interface SearchFilters {
  search: string;
  type: string;
  operation: string;
  minPrice: string;
  maxPrice: string;
  city: string;
  bedrooms: string;
  bathrooms: string;
}

interface SavedQuery {
  name: string;
  date: string;
  filters: SearchFilters;
  selected: string[];
  results: Array<{
    id: number;
    title: string;
    city: string;
    price: number;
    type: string;
    operacion: string;
  }>;
}

interface PropertyTypeOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface OperationOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

// Constants
const PROPERTY_TYPES: PropertyTypeOption[] = [
  { value: "Casa", label: "Casa", icon: <Home className="w-4 h-4 text-brand-500 inline" /> },
  { value: "Departamento", label: "Departamento", icon: <BuildingIcon className="w-4 h-4 text-green-500 inline" /> },
  { value: "Terreno", label: "Terreno", icon: <MapPin className="w-4 h-4 text-brand-500 inline" /> },
  { value: "Oficina", label: "Oficina", icon: <BuildingIcon className="w-4 h-4 text-green-500 inline" /> },
];

const OPERATIONS: OperationOption[] = [
  { value: "VENTA", label: "Venta", icon: <DollarSign className="w-4 h-4 text-green-500 inline" /> },
  { value: "ALQUILER", label: "Alquiler", icon: <DollarSign className="w-4 h-4 text-brand-500 inline" /> },
];

const CITIES: string[] = [
  "Asunción", "Ciudad del Este", "San Lorenzo", "Lambaré", 
  "Fernando de la Mora", "Luque", "Encarnación", 
  "Mariano Roque Alonso", "Capiatá", "Villa Elisa", 
  "Areguá", "San Bernardino"
];

const STORAGE_KEYS = {
  SAVED_QUERIES: 'quickSearchQueries'
} as const;

// Utility Functions
const mapOperationToBackend = (operation: string): string => {
  const operationMap: Record<string, string> = {
    'VENTA': 'SALE',
    'ALQUILER': 'RENT',
    'venta': 'SALE',
    'alquiler': 'RENT'
  };
  return operationMap[operation] || operation;
};

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

const getPrimaryImageUrl = (property: PropertyWithAgencyUrl): string | null => {
  if (property.galleryImages && property.galleryImages.length > 0) {
    const firstGalleryImage = property.galleryImages[0];
    if (!firstGalleryImage) {
      return null;
    }
    if (typeof (firstGalleryImage as any) === 'string') {
      return getImageUrl(firstGalleryImage as unknown as string);
    }
    return getImageUrl((firstGalleryImage as { url: string }).url);
  }

  if (property.featuredImage) {
    return getImageUrl(property.featuredImage);
  }

  if (property.images && property.images.length > 0) {
    const firstImage = property.images[0];
    if (typeof firstImage === 'string') {
      return getImageUrl(firstImage);
    }
    if (firstImage && typeof (firstImage as any).url === 'string') {
      return getImageUrl((firstImage as { url: string }).url);
    }
  }

  return null;
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

// Custom Hooks for Business Logic
const usePropertySearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    type: "",
    operation: "",
    minPrice: "",
    maxPrice: "",
    city: "",
    bedrooms: "",
    bathrooms: "",
  });
  
  const [results, setResults] = useState<PropertyWithAgencyUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedSearch = useDebounce(filters.search, 500);
  
  const fetchResults = useCallback(async (customFilters?: SearchFilters) => {
    setLoading(true);
    setError(null);
    
    // Timeout de seguridad: forzar fin después de 12 segundos
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Timeout en búsqueda de propiedades');
      setLoading(false);
      setError('La búsqueda tomó demasiado tiempo. Intenta con otros filtros.');
    }, 12000);
    
    try {
      const filtersToSend = { 
        ...(customFilters || filters), 
        operation: mapOperationToBackend((customFilters || filters).operation) 
      };
      
      const response = await propertyService.advancedSearch(filtersToSend);
      clearTimeout(timeoutId);
      setResults(response || []);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('❌ Error fetching properties:', err);
      setError('Error al buscar propiedades. Por favor, intente nuevamente.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  useEffect(() => {
    // Evitar memory leaks - la función fetchResults ya maneja el abort
    let isCancelled = false;
    
    if (!isCancelled) {
      fetchResults();
    }
    
    return () => {
      isCancelled = true;
    };
  }, [debouncedSearch]);
  
  useEffect(() => {
    // Cargar todas las propiedades al inicio
    // Solo ejecutar una vez al montar
    let isCancelled = false;
    
    if (!isCancelled) {
      fetchResults();
    }
    
    return () => {
      isCancelled = true;
    };
  }, []);
  
  return {
    filters,
    setFilters,
    results,
    loading,
    error,
    fetchResults
  };
};

const useSavedQueries = () => {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_QUERIES);
    if (saved) {
      try {
        setSavedQueries(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing saved queries:', error);
        setSavedQueries([]);
      }
    }
  }, []);
  
  const saveQuery = useCallback((query: Omit<SavedQuery, 'date'>) => {
    const newQuery: SavedQuery = {
      ...query,
      date: new Date().toISOString()
    };
    
    const updated = [newQuery, ...savedQueries];
    setSavedQueries(updated);
    localStorage.setItem(STORAGE_KEYS.SAVED_QUERIES, JSON.stringify(updated));
    return newQuery;
  }, [savedQueries]);
  
  const deleteQuery = useCallback((index: number) => {
    const updated = savedQueries.filter((_, i) => i !== index);
    setSavedQueries(updated);
    localStorage.setItem(STORAGE_KEYS.SAVED_QUERIES, JSON.stringify(updated));
  }, [savedQueries]);
  
  const updateQuery = useCallback((index: number, updates: Partial<SavedQuery>) => {
    const updated = savedQueries.map((q, i) => 
      i === index ? { ...q, ...updates } : q
    );
    setSavedQueries(updated);
    localStorage.setItem(STORAGE_KEYS.SAVED_QUERIES, JSON.stringify(updated));
  }, [savedQueries]);
  
  return {
    savedQueries,
    saveQuery,
    deleteQuery,
    updateQuery
  };
};

export default function QuickSearchPage() {
  // Business Logic Hooks
  const { filters, setFilters, results, loading, error, fetchResults } = usePropertySearch();
  const { savedQueries, saveQuery, deleteQuery, updateQuery } = useSavedQueries();
  
  // UI State
  const [selected, setSelected] = useState<string[]>([]);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [sendWhatsapp, setSendWhatsapp] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendMethod, setSendMethod] = useState<'email' | 'whatsapp'>('email');
  const [whatsappNumber, setWhatsappNumber] = useState("");
  
  // Modal States
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [queryName, setQueryName] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editQueryIndex, setEditQueryIndex] = useState<number | null>(null);
  const [editQueryName, setEditQueryName] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteQueryIndex, setDeleteQueryIndex] = useState<number | null>(null);

  // Event Handlers
  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePropertySelect = useCallback((id: string) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  }, []);

  const handlePreviewQuery = useCallback((query: SavedQuery) => {
    const filtersMapped = { 
      ...query.filters, 
      operation: mapOperationToBackend(query.filters.operation) 
    };
    setFilters(query.filters);
    fetchResults(filtersMapped);
    setLoadModalOpen(false);
    toast.success('Mostrando resultados actuales de la consulta');
  }, [fetchResults]);

  // Eliminar cualquier botón, menú o función relacionada con exportar resultados, exportar consulta, exportar a CSV/JSON, etc.
  // Busca y elimina cualquier referencia a 'export', 'exportar', 'CSV', 'JSON' en la UI y lógica de la página.

  // Utility Functions
  const generateWhatsappMessage = useCallback((): string => {
    if (selected.length === 0) return '';
    
    const selectedProperties = results.filter(p => selected.includes(String(p.id)));
    let message = '¡Hola! Te comparto estas propiedades recomendadas:\n\n';
    
    selectedProperties.forEach((property, index) => {
      message += `${index + 1}. ${property.title}\n`;
      
      const baseUrl = property.agencyPublicUrl || window.location.origin;
      const url = property.slug 
        ? `${baseUrl}/public/properties/${property.slug}` 
        : `${baseUrl}/public/properties/${property.id}`;
      
      message += `Ver detalle: ${url}\n`;
      if (property.city) message += `Ciudad: ${property.city}\n`;
      if (property.price) {
        message += `Precio: ${property.price.toLocaleString('es-PY', { 
          style: 'currency', 
          currency: 'PYG' 
        })}\n`;
      }
      message += '\n';
    });
    
    message += '¿Te gustaría agendar una visita o recibir más información?';
    return encodeURIComponent(message);
  }, [selected, results]);

  // Query Management Functions
  const handleSaveQuery = useCallback(() => {
    if (!queryName.trim()) {
      toast.error('Por favor, ingresa un nombre para la consulta');
      return;
    }

    const queryData = {
      name: queryName.trim(),
      filters,
      selected,
      results: results.map(p => ({ 
        id: Number(p.id), 
        title: p.title, 
        city: p.city, 
        price: p.price, 
        type: p.type, 
        operacion: p.operacion || 'SALE'
      })),
    };

    saveQuery(queryData);
    setSaveModalOpen(false);
    setQueryName("");
    toast.success('Consulta guardada exitosamente');
  }, [queryName, filters, selected, results, saveQuery]);

  const handleLoadQuery = useCallback((query: SavedQuery) => {
    setFilters(query.filters);
    setSelected(query.selected);
    setLoadModalOpen(false);
    toast.success('Consulta cargada exitosamente');
    fetchResults();
  }, [fetchResults]);

  const handleDeleteQuery = useCallback((index: number) => {
    setDeleteQueryIndex(index);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDeleteQuery = useCallback(() => {
    if (deleteQueryIndex !== null) {
      deleteQuery(deleteQueryIndex);
      setDeleteConfirmOpen(false);
      setDeleteQueryIndex(null);
      toast.success('Consulta eliminada exitosamente');
    }
  }, [deleteQueryIndex, deleteQuery]);

  const handleEditQuery = useCallback((index: number) => {
    const query = savedQueries[index];
    setEditQueryIndex(index);
    setEditQueryName(query.name);
    setEditModalOpen(true);
  }, [savedQueries]);

  const confirmEditQuery = useCallback(() => {
    if (editQueryIndex !== null && editQueryName.trim()) {
      updateQuery(editQueryIndex, { name: editQueryName.trim() });
      setEditModalOpen(false);
      setEditQueryIndex(null);
      setEditQueryName("");
      toast.success('Nombre de consulta actualizado exitosamente');
    }
  }, [editQueryIndex, editQueryName, updateQuery]);

  return (
    <div className="max-w-7xl mx-auto pt-4 md:pt-6 pb-8 px-3 md:px-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-6 md:mb-8">
        <div className="bg-gradient-to-r from-brand-500 to-green-400 rounded-full p-4 mb-4 shadow-lg">
          <Search className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Búsqueda Rápida de Propiedades</h1>
        <p className="text-lg text-gray-500 text-center max-w-2xl">
          Encuentra y recomienda propiedades en segundos. Busca por texto libre, filtra por tipo, operación, precio, ciudad y más.
        </p>
      </div>

      {/* Formulario Simplificado */}
      <div className="mb-6 md:mb-8 bg-white/90 p-5 md:p-6 rounded-2xl shadow-xl border border-gray-100">
        {/* Campo de búsqueda principal */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              type="text"
              placeholder="🔍 Buscar propiedades... (ej: 'casa villa morra', 'departamento centro')"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <Button 
            type="button" 
            onClick={() => fetchResults()}
            className="bg-brand-500 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-brand-600"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>

        {/* Filtros desplegables */}
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-brand-600 flex items-center gap-2">
            <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
            Filtros avanzados
          </summary>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {/* Tipo */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="">Todos los tipos</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            {/* Operación */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Operación</label>
              <select
                name="operation"
                value={filters.operation}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="">Todas las operaciones</option>
                {OPERATIONS.map((operation) => (
                  <option key={operation.value} value={operation.value}>{operation.label}</option>
                ))}
              </select>
            </div>
            
            {/* Ciudad */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Ciudad</label>
              <select
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="">Todas las ciudades</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </details>
      </div>

      {/* Resultados */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">Resultados</h2>
          {error && (
            <div className="text-red-600 text-sm bg-red-50 px-3 py-1 rounded-full">
              {error}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {results.length > 0 && (
            <Button variant="outline" onClick={() => setSaveModalOpen(true)}>
              Guardar consulta
            </Button>
          )}
          {savedQueries.length > 0 && (
            <Button variant="outline" onClick={() => setLoadModalOpen(true)}>
              Ver consultas guardadas
            </Button>
          )}
          {results.length > 0 && selected.length > 0 && (
            <Button variant="outline" className="bg-green-500 text-white hover:bg-green-600" asChild>
              <a
                href={`https://wa.me/?text=${generateWhatsappMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Enviar por WhatsApp
              </a>
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="quick-search-results">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow p-6 animate-pulse flex flex-col gap-4 min-h-[220px] border border-gray-100">
              <div className="h-32 bg-gray-200 rounded-xl" />
              <div className="h-6 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
          ))
        ) : results.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
            <p className="text-gray-500 text-lg">No se encontraron propiedades con los filtros seleccionados.</p>
          </div>
        ) : results.map((property) => (
          <div key={property.id} className={`relative group bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col gap-3 transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl ${selected.includes(String(property.id)) ? 'ring-2 ring-brand-500' : ''}`}>
            <input 
              type="checkbox" 
              checked={selected.includes(String(property.id))} 
              onChange={() => handlePropertySelect(String(property.id))} 
              className="absolute top-4 right-4 w-6 h-6 accent-brand-500 rounded-lg border-2 border-gray-300 shadow" 
            />
            <div className="h-32 w-full bg-gray-100 rounded-xl mb-2 flex items-center justify-center overflow-hidden">
              {(() => {
                const primaryImageUrl = getPrimaryImageUrl(property);
                if (primaryImageUrl) {
                  return (
                    <img 
                      src={primaryImageUrl} 
                      alt={property.title} 
                      className="object-cover w-full h-32 rounded-xl"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/placeholder.jpg';
                      }}
                    />
                  );
                }

                return (
                  <div className="flex items-center justify-center w-full h-full">
                    <Home className="w-12 h-12 text-gray-300" strokeWidth={1} />
                  </div>
                );
              })()}
            </div>
            <div className="font-bold text-lg text-gray-900 line-clamp-2">{property.title}</div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Home className="w-4 h-4" /> {property.type}
              <span className="mx-1">•</span>
              <DollarSign className="w-4 h-4" /> {property.operacion}
              <span className="mx-1">•</span>
              <MapPin className="w-4 h-4" /> {property.city}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-gray-700">
                <Bed className="w-4 h-4" /> {property.bedrooms ?? '-'} <span className="text-xs">Dorm</span>
              </div>
              <div className="flex items-center gap-1 text-gray-700">
                <Bath className="w-4 h-4" /> {property.bathrooms ?? '-'} <span className="text-xs">Baños</span>
              </div>
              <div className="flex items-center gap-1 text-gray-700">
                <DollarSign className="w-4 h-4" /> {property.price?.toLocaleString?.('es-PY', { style: 'currency', currency: 'PYG' })}
              </div>
            </div>
            <div className="mt-auto flex justify-end">
              <Button asChild size="sm" variant="outline" className="border-brand-500 text-brand-600">
                <a href={`/properties/${property.id}`}>Ver detalle</a>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de envío de recomendación */}
      <Dialog open={sendModalOpen} onClose={() => setSendModalOpen(false)} className="fixed z-[100] inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-[80%] max-w-2xl mx-auto p-8 z-10">
            <Dialog.Title className="text-2xl font-bold mb-4 flex items-center gap-2"><Mail className="w-6 h-6 text-brand-500" />Enviar recomendación</Dialog.Title>
            <div className="flex gap-4 mb-6">
              <button type="button" className={`px-4 py-2 rounded-lg font-medium border ${sendMethod === 'email' ? 'bg-brand-500 text-white border-brand-500' : 'bg-gray-100 text-gray-700 border-gray-200'}`} onClick={() => setSendMethod('email')}>Correo</button>
              <button type="button" className={`px-4 py-2 rounded-lg font-medium border ${sendMethod === 'whatsapp' ? 'bg-green-500 text-white border-green-500' : 'bg-gray-100 text-gray-700 border-gray-200'}`} onClick={() => setSendMethod('whatsapp')}>WhatsApp</button>
            </div>
            {sendMethod === 'email' && (
              <form onSubmit={e => { e.preventDefault(); setSending(true); setTimeout(() => { setSending(false); setSendModalOpen(false); toast.success('¡Recomendación enviada!'); setSendEmail(""); setSendWhatsapp(""); setSendMessage(""); }, 1200); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email del cliente</label>
                  <Input type="email" value={sendEmail} onChange={e => setSendEmail(e.target.value)} placeholder="cliente@email.com" required={!sendWhatsapp} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">WhatsApp</label>
                  <Input type="tel" value={sendWhatsapp} onChange={e => setSendWhatsapp(e.target.value)} placeholder="Ej: +595981123456" required={!sendEmail} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mensaje personalizado</label>
                  <textarea className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500" rows={3} value={sendMessage} onChange={e => setSendMessage(e.target.value)} placeholder="Hola, te comparto estas propiedades que pueden interesarte..." />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setSendModalOpen(false)} disabled={sending}>Cancelar</Button>
                  <Button type="submit" className="bg-brand-500 text-white" disabled={sending}>{sending ? 'Enviando...' : 'Enviar'}</Button>
                </div>
              </form>
            )}
            {sendMethod === 'whatsapp' && (
              <form onSubmit={e => { e.preventDefault(); window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${generateWhatsappMessage()}`, '_blank'); setSendModalOpen(false); setWhatsappNumber(""); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Número de WhatsApp</label>
                  <Input type="tel" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="Ej: 595981123456" required />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setSendModalOpen(false)} disabled={sending}>Cancelar</Button>
                  <Button type="submit" className="bg-green-500 text-white">Enviar por WhatsApp</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Dialog>
      {/* Modal Guardar consulta */}
      <ModernPopup
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Guardar consulta"
        subtitle="Guarda los filtros y resultados para reutilizarlos luego"
        icon={<BookMarked className="w-6 h-6 text-white" />}
      >
        <div>
          <input
            className="w-full border px-3 py-2 rounded-lg mb-4"
            value={queryName}
            onChange={e => setQueryName(e.target.value)}
            placeholder="Nombre de la consulta"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setSaveModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
            <button onClick={handleSaveQuery} className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">Guardar</button>
          </div>
        </div>
      </ModernPopup>

      {/* Modal Ver consultas guardadas */}
      <ModernPopup
        isOpen={loadModalOpen}
        onClose={() => setLoadModalOpen(false)}
        title="Consultas guardadas"
        subtitle="Revisa, edita o carga tus consultas previas"
        icon={<BookMarked className="w-6 h-6 text-white" />}
        maxWidth="max-w-2xl"
      >
        <div>
          {savedQueries.length === 0 ? (
            <div className="text-gray-500 text-center">No hay consultas guardadas.</div>
          ) : (
            <ul className="space-y-4 max-h-96 overflow-y-auto">
              {savedQueries.map((query, i) => (
                <li key={i} className="border rounded-lg p-4 flex flex-col gap-2 bg-gray-50 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-brand-700 text-base">{query.name}</div>
                      <div className="text-xs text-gray-400">{new Date(query.date).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditQuery(i)} className="text-blue-500 hover:text-blue-700 text-xs flex items-center gap-1"><Edit className="w-4 h-4" />Editar</button>
                      <button onClick={() => handleDeleteQuery(i)} className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"><Trash2 className="w-4 h-4" />Eliminar</button>
                      <button onClick={() => handlePreviewQuery(query)} className="ml-2 px-3 py-1 bg-brand-500 text-white rounded-lg text-xs hover:bg-brand-600 flex items-center gap-1"><Eye className="w-4 h-4" />Ver resultados actuales</button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 flex flex-wrap gap-2">
                    {Object.entries(query.filters)
                      .filter(([_, v]) => Boolean(v))
                      .map(([k, v]) => (
                        <span key={k} className="bg-gray-200 rounded px-2 py-0.5">{k}: {String(v)}</span>
                      ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{query.results.length} resultados guardados</div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-end mt-6">
            <button onClick={() => setLoadModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cerrar</button>
          </div>
        </div>
      </ModernPopup>

      {/* Modal Editar nombre */}
      <ModernPopup
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar nombre de consulta"
        icon={<Edit className="w-6 h-6 text-white" />}
      >
        <div>
          <input
            className="w-full border px-3 py-2 rounded-lg mb-4"
            value={editQueryName}
            onChange={e => setEditQueryName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
            <button onClick={confirmEditQuery} className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">Guardar</button>
          </div>
        </div>
      </ModernPopup>

      {/* Modal Confirmar eliminación */}
      <ModernPopup
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="¿Eliminar consulta?"
        subtitle="Esta acción no se puede deshacer."
        icon={<Trash2 className="w-6 h-6 text-white" />}
      >
        <div>
          <div className="mb-4 text-gray-700">¿Estás seguro de que deseas eliminar esta consulta guardada?</div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleteConfirmOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
            <button onClick={confirmDeleteQuery} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Eliminar</button>
          </div>
        </div>
      </ModernPopup>
    </div>
  );
} 