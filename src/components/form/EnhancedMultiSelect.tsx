"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  XMarkIcon, 
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TagIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";

export interface MultiSelectOption {
  id: string | number;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
  badge?: string;
}

interface EnhancedMultiSelectProps {
  options: MultiSelectOption[];
  selected: (string | number)[];
  onSelectionChange: (selected: (string | number)[]) => void;
  title?: string;
  description?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  maxSelections?: number;
  showCategories?: boolean;
  showSearch?: boolean;
  showCount?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

export default function EnhancedMultiSelect({
  options,
  selected,
  onSelectionChange,
  title = "Seleccionar opciones",
  description,
  placeholder = "Buscar opciones...",
  searchPlaceholder = "Filtrar opciones...",
  maxSelections,
  showCategories = true,
  showSearch = true,
  showCount = true,
  disabled = false,
  error,
  className = "",
  emptyMessage = "No hay opciones disponibles",
  loading = false
}: EnhancedMultiSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "category">("name");

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const cats = options
      .map(option => option.category)
      .filter(Boolean) as string[];
    return ["all", ...Array.from(new Set(cats))];
  }, [options]);

  // Filtrar opciones
  const filteredOptions = useMemo(() => {
    let filtered = options;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter(option => option.category === selectedCategory);
    }

    // Ordenar
    filtered.sort((a, b) => {
      if (sortBy === "category") {
        const catA = a.category || "";
        const catB = b.category || "";
        if (catA !== catB) return catA.localeCompare(catB);
      }
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [options, searchTerm, selectedCategory, sortBy]);

  // Separar opciones disponibles y seleccionadas
  const availableOptions = filteredOptions.filter(option => !selected.includes(option.id));
  const selectedOptions = filteredOptions.filter(option => selected.includes(option.id));

  const handleToggleOption = (optionId: string | number) => {
    if (disabled) return;

    const newSelected = selected.includes(optionId)
      ? selected.filter(id => id !== optionId)
      : maxSelections && selected.length >= maxSelections
        ? selected
        : [...selected, optionId];

    onSelectionChange(newSelected);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const allIds = filteredOptions.map(option => option.id);
    const newSelected = [...new Set([...selected, ...allIds])];
    if (maxSelections) {
      newSelected.splice(maxSelections);
    }
    onSelectionChange(newSelected);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onSelectionChange([]);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Servicios": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Amenidades": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Seguridad": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "Comodidades": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "Infraestructura": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      "default": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
     
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        {showCount && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selected.length} seleccionado{selected.length !== 1 ? 's' : ''}
            </span>
            {maxSelections && (
              <span className="text-xs text-gray-400">
                / {maxSelections}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex flex-wrap gap-3">
        {showSearch && (
          <div className="relative flex-1 min-w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white text-sm"
              disabled={disabled}
            />
          </div>
        )}

        {showCategories && categories.length > 1 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white text-sm"
            disabled={disabled}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "Todas las categorías" : category}
              </option>
            ))}
          </select>
        )}

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "name" | "category")}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white text-sm"
          disabled={disabled}
        >
          <option value="name">Ordenar por nombre</option>
          <option value="category">Ordenar por categoría</option>
        </select>

        <div className="flex space-x-2">
          <button
            onClick={handleSelectAll}
            disabled={disabled || availableOptions.length === 0}
            className="px-3 py-2 text-xs bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Seleccionar Todo
          </button>
          <button
            onClick={handleClearAll}
            disabled={disabled || selected.length === 0}
            className="px-3 py-2 text-xs bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Limpiar Todo
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opciones disponibles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Opciones Disponibles
            </h4>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {availableOptions.length} disponible{availableOptions.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Cargando opciones...</p>
              </div>
            ) : availableOptions.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {availableOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleToggleOption(option.id)}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center">
                          <PlusIcon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {option.name}
                          </h5>
                          {option.badge && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                              {option.badge}
                            </span>
                          )}
                        </div>
                        {option.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {option.description}
                          </p>
                        )}
                        {option.category && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getCategoryColor(option.category)}`}>
                            <TagIcon className="h-3 w-3 mr-1" />
                            {option.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <AdjustmentsHorizontalIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm || selectedCategory !== "all" 
                    ? "No se encontraron opciones con los filtros aplicados"
                    : emptyMessage}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Opciones seleccionadas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Opciones Seleccionadas
            </h4>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedOptions.length} seleccionado{selectedOptions.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {selectedOptions.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {selectedOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleToggleOption(option.id)}
                    className="flex items-center justify-between p-4 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30 cursor-pointer border-b border-brand-100 dark:border-brand-800 last:border-b-0 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                          <CheckIcon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h5 className="text-sm font-medium text-brand-900 dark:text-brand-100 truncate">
                            {option.name}
                          </h5>
                          {option.badge && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-200 text-brand-900 dark:bg-brand-800 dark:text-brand-100">
                              {option.badge}
                            </span>
                          )}
                        </div>
                        {option.description && (
                          <p className="text-xs text-brand-600 dark:text-brand-300 mt-1 line-clamp-2">
                            {option.description}
                          </p>
                        )}
                        {option.category && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getCategoryColor(option.category)}`}>
                            <TagIcon className="h-3 w-3 mr-1" />
                            {option.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <XMarkIcon className="h-4 w-4 text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <CheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No hay opciones seleccionadas
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Selecciona opciones de la lista de la izquierda
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <XMarkIcon className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Límite de selecciones */}
      {maxSelections && selected.length >= maxSelections && (
        <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
          <SparklesIcon className="h-4 w-4" />
          <p className="text-sm">
            Has alcanzado el límite máximo de {maxSelections} selección{maxSelections !== 1 ? 'es' : ''}
          </p>
        </div>
      )}
    </div>
  );
} 