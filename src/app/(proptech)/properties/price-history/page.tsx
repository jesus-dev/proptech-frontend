"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Search,
  BarChart3,
  LineChart,
  Filter,
  Download
} from "lucide-react";
import { toast } from 'sonner';
import { priceHistoryService, PriceHistory, Property, PriceHistoryFilters } from '@/services/priceHistoryService';

// Interfaces importadas desde el servicio

export default function PriceHistoryPage() {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar propiedades y historial de precios desde el backend
      const [propertiesData, historyData] = await Promise.all([
        priceHistoryService.getProperties(),
        priceHistoryService.getPriceHistory()
      ]);
      
      setProperties(propertiesData);
      setPriceHistory(historyData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos. Por favor, intenta nuevamente.');
      
      // En producción, no usar fallback a datos ficticios
      setPriceHistory([]);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros con el API
  const applyFilters = async () => {
    setLoading(true);
    try {
      const filters: PriceHistoryFilters = {
        propertyId: selectedProperty || undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
        search: searchTerm || undefined
      };
      
      const filteredData = await priceHistoryService.getPriceHistory(filters);
      setPriceHistory(filteredData);
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error('Error al aplicar filtros');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar localmente para búsqueda rápida
  const filteredHistory = priceHistory.filter(record => {
    const matchesSearch = record.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-PY');
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Propiedad', 'Fecha', 'Precio', 'Cambio', 'Cambio %', 'Operación', 'Fuente'],
      ...filteredHistory.map(record => [
        record.propertyTitle,
        record.date,
        record.price.toString(),
        record.change.toString(),
        record.changePercent.toString(),
        record.operation,
        record.source
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial_precios.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Archivo CSV descargado exitosamente');
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <div className="bg-gradient-to-r from-brand-500 to-green-400 rounded-full p-4 mb-4 shadow-lg">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Historial de Precios</h1>
        <p className="text-lg text-gray-500 text-center max-w-2xl">
          Analiza la evolución de precios de propiedades y detecta tendencias del mercado inmobiliario.
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-8 bg-white/90 p-6 rounded-2xl shadow-xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Buscar propiedad</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Nombre de la propiedad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Propiedad específica</label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">Todas las propiedades</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Fecha desde</label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Fecha hasta</label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              onClick={() => setViewMode('table')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Tabla
            </Button>
            <Button
              variant={viewMode === 'chart' ? 'default' : 'outline'}
              onClick={() => setViewMode('chart')}
              className="flex items-center gap-2"
            >
              <LineChart className="w-4 h-4" />
              Gráfico
            </Button>
            <Button
              onClick={applyFilters}
              disabled={loading}
              className="flex items-center gap-2 bg-brand-500 text-white hover:bg-brand-600"
            >
              <Filter className="w-4 h-4" />
              {loading ? 'Aplicando...' : 'Aplicar Filtros'}
            </Button>
          </div>
          
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Historial de Precios ({filteredHistory.length} registros)
        </h2>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Propiedad</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Precio</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Cambio</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Operación</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Fuente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{record.propertyTitle}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(record.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{formatPrice(record.price)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 ${getChangeColor(record.change)}`}>
                        {getChangeIcon(record.change)}
                        <span className="font-medium">
                          {record.change >= 0 ? '+' : ''}{formatPrice(record.change)}
                        </span>
                        <span className="text-sm">
                          ({record.changePercent >= 0 ? '+' : ''}{record.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.operation === 'SALE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {record.operation === 'SALE' ? 'Venta' : 'Alquiler'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {record.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center text-gray-500">
            <LineChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Gráfico de Tendencias</h3>
            <p>La funcionalidad de gráficos estará disponible próximamente.</p>
          </div>
        </div>
      )}

      {filteredHistory.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-16">
          <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron registros de historial de precios.</p>
        </div>
      )}
    </div>
  );
}
