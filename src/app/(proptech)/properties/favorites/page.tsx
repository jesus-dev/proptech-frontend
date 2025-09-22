"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Property } from "../components/types";
import { propertyService } from "../services/propertyService";
import PropertyList from "../components/PropertyList";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { 
  Heart, 
  ArrowLeft, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid3X3, 
  List, 
  Search,
  Download,
  Share2,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  Home,
  Star,
  CheckSquare,
  Square,
  MoreHorizontal,
  SlidersHorizontal,
  X,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { systemService } from "@/services/systemService";

export default function FavoritesPage() {
  const { user, isAuthenticated } = useAuth();
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "date" | "location" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({min: 0, max: 1000000});
  const [propertyType, setPropertyType] = useState<string>("all");
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavoriteProperties();
    } else if (!isAuthenticated) {
      setLoading(false);
      setError("Debes iniciar sesión para ver tus propiedades favoritas");
    }
  }, [isAuthenticated, user]);

  const loadFavoriteProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Use the new user dashboard API for saved properties
      const savedProperties = await systemService.getUserSavedProperties();
      setFavoriteProperties(savedProperties);
    } catch (err) {
      console.error("Error loading favorite properties:", err);
      setError("Error al cargar las propiedades favoritas. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort properties
  useEffect(() => {
    let filtered = [...favoriteProperties];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(property => 
        property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(property => 
      property.price >= priceRange.min && property.price <= priceRange.max
    );

    // Property type filter
    if (propertyType !== "all") {
      filtered = filtered.filter(property => property.type === propertyType);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "date":
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case "location":
          aValue = a.location || "";
          bValue = b.location || "";
          break;
        case "size":
          aValue = a.area || 0;
          bValue = b.area || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProperties(filtered);
  }, [favoriteProperties, searchQuery, priceRange, propertyType, sortBy, sortOrder]);

  const handlePropertyRemovedFromFavorites = (removedId: string) => {
    setFavoriteProperties(prev => prev.filter(property => property.id !== removedId));
    setSelectedProperties(prev => prev.filter(id => id !== removedId));
  };

  const handleSelectProperty = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filteredProperties.map(p => p.id));
    }
  };

  const handleBulkRemove = async () => {
    try {
      for (const propertyId of selectedProperties) {
        await systemService.unsaveProperty(propertyId);
      }
      setFavoriteProperties(prev => 
        prev.filter(property => !selectedProperties.includes(property.id))
      );
      setSelectedProperties([]);
    } catch (error) {
      console.error("Error removing properties from favorites:", error);
      setError("Error al remover propiedades de favoritos");
    }
  };

  const handleExportFavorites = () => {
    const dataStr = JSON.stringify(filteredProperties, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mis-favoritos.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShareFavorites = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mis Propiedades Favoritas',
          text: `Tengo ${filteredProperties.length} propiedades favoritas en Proptech`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getStats = () => {
    const totalPrice = filteredProperties.reduce((sum, p) => sum + (p.price || 0), 0);
    const avgPrice = filteredProperties.length > 0 ? totalPrice / filteredProperties.length : 0;
    const totalArea = filteredProperties.reduce((sum, p) => sum + (p.area || 0), 0);
    const avgArea = filteredProperties.length > 0 ? totalArea / filteredProperties.length : 0;
    
    return {
      totalPrice,
      avgPrice,
      totalArea,
      avgArea,
      count: filteredProperties.length
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-6 mb-6">
              <X className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Error al cargar favoritos
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
              {error}
            </p>
            <Button onClick={loadFavoriteProperties} className="bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar nuevamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/dash"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-white dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Mis Favoritas
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {stats.count} {stats.count === 1 ? 'propiedad' : 'propiedades'} guardada{stats.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareFavorites}
                className="hidden sm:flex"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportFavorites}
                className="hidden sm:flex"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <div className="flex items-center space-x-1 bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm">
                <Button
                  variant={view === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {stats.count > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Precio Promedio</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ${stats.avgPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Área Promedio</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {Math.round(stats.avgArea)} m²
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Star className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ${stats.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en mis favoritas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Sort and Filter */}
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Más recientes</option>
                <option value="price">Precio</option>
                <option value="location">Ubicación</option>
                <option value="size">Tamaño</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="h-10 w-10 p-0"
              >
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-blue-50 text-blue-600 border-blue-200" : ""}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rango de Precio
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min || ""}
                      onChange={(e) => setPriceRange(prev => ({...prev, min: Number(e.target.value) || 0}))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max || ""}
                      onChange={(e) => setPriceRange(prev => ({...prev, max: Number(e.target.value) || 1000000}))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Propiedad
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="all">Todos</option>
                    <option value="apartment">Departamento</option>
                    <option value="house">Casa</option>
                    <option value="commercial">Comercial</option>
                    <option value="land">Terreno</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setPriceRange({min: 0, max: 1000000});
                      setPropertyType("all");
                    }}
                    className="w-full"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedProperties.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {selectedProperties.length} propiedades seleccionadas
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  {selectedProperties.length === filteredProperties.length ? "Deseleccionar todo" : "Seleccionar todo"}
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkRemove}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover de Favoritos
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredProperties.length === 0 && favoriteProperties.length > 0 && (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No se encontraron propiedades
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Intenta ajustar tus filtros de búsqueda para encontrar lo que buscas.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setPriceRange({min: 0, max: 1000000});
                  setPropertyType("all");
                }}
              >
                Limpiar Filtros
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State - No Favorites */}
        {favoriteProperties.length === 0 && (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No tienes propiedades favoritas
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Marca las propiedades que te gusten como favoritas para encontrarlas fácilmente aquí.
              </p>
              <Link href="/properties">
                <Button className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white">
                  <Heart className="h-4 w-4 mr-2" />
                  Explorar Propiedades
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Properties List */}
        {filteredProperties.length > 0 && (
          <div className="space-y-6">
            <PropertyList
              properties={filteredProperties}
              view={view}
              onPropertyRemovedFromFavorites={handlePropertyRemovedFromFavorites}
              isFavoritesPage={true}
              selectedProperties={selectedProperties}
              onSelectProperty={handleSelectProperty}
              onSelectAll={handleSelectAll}
              showSelection={true}
            />
          </div>
        )}
      </div>
    </div>
  );
} 