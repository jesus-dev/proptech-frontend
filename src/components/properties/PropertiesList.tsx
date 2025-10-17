"use client";

import React, { useState } from 'react';
import { useProperties } from '@/hooks/useProperties';
import { PropertyFilters } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react';

export const PropertiesList: React.FC = () => {
  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 10,
  });
  
  const { 
    properties, 
    loading, 
    error, 
    refresh, 
    loadWithFilters,
    canViewAll,
    isAgent,
    isAgencyAdmin 
  } = useProperties(filters);

  const handleSearch = (search: string) => {
    const newFilters = { ...filters, search, page: 1 };
    setFilters(newFilters);
    loadWithFilters(newFilters);
  };

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    loadWithFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadWithFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando propiedades...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información del contexto del usuario */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Propiedades</h1>
          <p className="text-gray-600">
            {canViewAll && "Viendo todas las propiedades (Admin)"}
            {isAgencyAdmin && "Viendo propiedades de tu agencia"}
            {isAgent && "Viendo propiedades de tu agencia"}
          </p>
        </div>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar propiedades..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filters.type || ''}
              onValueChange={(value) => handleFilterChange('type', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de propiedad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="departamento">Departamento</SelectItem>
                <SelectItem value="terreno">Terreno</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.operation || ''}
              onValueChange={(value) => handleFilterChange('operation', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Operación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las operaciones</SelectItem>
                <SelectItem value="venta">Venta</SelectItem>
                <SelectItem value="alquiler">Alquiler</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de propiedades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.properties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{property.title}</CardTitle>
                <Badge variant={property.propertyStatus === 'active' ? 'default' : 'secondary'}>
                  {property.propertyStatus || 'N/A'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Ubicación:</strong> {property.cityName || property.address}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Precio:</strong> {property.price?.toLocaleString()} {property.currency}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Habitaciones:</strong> {property.bedrooms} | <strong>Baños:</strong> {property.bathrooms}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Área:</strong> {property.area} m²
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginación */}
      {properties && properties.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(properties.page - 1)}
            disabled={properties.page <= 1}
          >
            Anterior
          </Button>
          
          <span className="text-sm text-gray-600">
            Página {properties.page} de {properties.totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(properties.page + 1)}
            disabled={properties.page >= properties.totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Información de resultados */}
      {properties && (
        <div className="text-center text-sm text-gray-600">
          Mostrando {properties.properties.length} de {properties.total} propiedades
        </div>
      )}
    </div>
  );
};
