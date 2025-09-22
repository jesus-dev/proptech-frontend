"use client";

import React, { useState, useEffect, useRef } from "react";
import { PropertyFormData, PropertyFormErrors } from "../../hooks/usePropertyForm";
import { getActivePropertyTypes } from "@/services/publicPropertyTypeService";
import dynamic from "next/dynamic";
import CurrencySelector from "@/components/ui/CurrencySelector";
import { getAllPropertyStatuses, PropertyStatus } from "@/app/(proptech)/catalogs/property-status/services/propertyStatusService";
import ValidatedInput from "@/components/form/input/ValidatedInput";
import ValidatedTextArea from "@/components/form/input/ValidatedTextArea";
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  TagIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  ChevronDownIcon,
  SparklesIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  KeyIcon,
  ArrowsRightLeftIcon
} from "@heroicons/react/24/outline";

interface TypeAndOperationStepProps {
  formData: PropertyFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  errors: PropertyFormErrors;
}

// Importar el editor de forma dinámica para evitar problemas con SSR
const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando editor...</span>
    </div>
  ),
});

// Utilidad para formatear y limpiar el precio
function formatPriceWithDots(value: string | number) {
  const num = typeof value === 'number' ? value : value.replace(/\D/g, '');
  if (!num) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function cleanPrice(value: string) {
  return value.replace(/\D/g, '');
}

// Hook para obtener operaciones
function usePropertyOperations() {
  const [operations, setOperations] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    fetch(`${apiBase}/api/properties/operations`)
      .then((res) => res.json())
      .then(setOperations)
      .catch(() => setOperations([]));
  }, []);
  return operations;
}

export default function TypeAndOperationStep({ formData, handleChange, errors }: TypeAndOperationStepProps) {
  
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertyStatuses, setPropertyStatuses] = useState<PropertyStatus[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const typeInputRef = useRef<HTMLDivElement>(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const operations = usePropertyOperations();

  useEffect(() => {
    loadPropertyTypes();
    loadPropertyStatuses();
  }, []);

  // Cierra el dropdown si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (typeInputRef.current && !typeInputRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadPropertyTypes = async () => {
    try {
      setLoading(true);
      const types = await getActivePropertyTypes();
      setPropertyTypes(types);
    } catch (error) {
      console.error("Error loading property types:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPropertyStatuses = async () => {
    try {
      setLoadingStatuses(true);
      const statuses = await getAllPropertyStatuses();
      setPropertyStatuses(statuses);
    } catch (error) {
      console.error("Error loading property statuses:", error);
    } finally {
      setLoadingStatuses(false);
    }
  };

  // Función para manejar el cambio de moneda
  const handleCurrencyChange = (currency: string) => {
    const event = {
      target: {
        name: "currency",
        value: currency,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    handleChange(event);
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'SALE': return <ShoppingBagIcon className="w-5 h-5" />;
      case 'RENT': return <KeyIcon className="w-5 h-5" />;
      case 'BOTH': return <ArrowsRightLeftIcon className="w-5 h-5" />;
      default: return null;
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'SALE': return 'text-green-600 bg-green-50 border-green-200';
      case 'RENT': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'BOTH': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
     

      {/* Título con diseño mejorado */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
            <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Título de la Propiedad</h3>
        </div>
        <ValidatedInput
          type="text"
          id="title"
          name="title"
          label=""
          value={formData.title}
          onChange={handleChange}
          placeholder="Ej: Hermosa casa moderna en barrio cerrado con vista al lago"
          error={errors.title}
          required={true}
          className="text-lg"
        />
      </div>

      {/* Tipo de propiedad con diseño moderno */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
            <TagIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tipo de Propiedad</h3>
        </div>
        
        <div ref={typeInputRef} className="relative">
          <div
            className={`w-full min-h-[52px] flex flex-wrap items-center gap-2 px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer transition-all duration-200 hover:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/20 focus-within:border-brand-500 ${errors.type ? 'border-red-500 ring-red-500/20' : 'border-gray-300'}`}
            tabIndex={0}
            onClick={() => setShowTypeDropdown((v) => !v)}
          >
            {/* Chips de tipos seleccionados */}
            {Number(formData.propertyTypeId) > 0 && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-sm">
                <HomeIcon className="w-4 h-4 mr-1.5" />
                {propertyTypes.find(t => t.id === formData.propertyTypeId)?.name || 'Tipo seleccionado'}
                <span className="ml-1.5 text-brand-100 text-xs">(Principal)</span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    const clearIdEvent = {
                      target: { name: "propertyTypeId", value: "" }
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    const clearNameEvent = {
                      target: { name: "type", value: "" }
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleChange(clearIdEvent);
                    handleChange(clearNameEvent);
                  }}
                  className="ml-2 text-brand-100 hover:text-white hover:bg-brand-400 rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {/* Tipos adicionales */}
            {(formData as any).additionalPropertyTypes?.length > 0 && (formData as any).additionalPropertyTypes.map((typeId: number, index: number) => {
              const typeName = propertyTypes.find(t => t.id === typeId)?.name || 'Tipo';
              return (
                <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-500">
                  <BuildingOfficeIcon className="w-4 h-4 mr-1.5" />
                  {typeName}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      const currentAdditional = (formData as any).additionalPropertyTypes || [];
                      const newAdditional = currentAdditional.filter((_: number, i: number) => i !== index);
                      const additionalIdsEvent = {
                        target: { name: "additionalPropertyTypes", value: newAdditional }
                      } as unknown as React.ChangeEvent<HTMLInputElement>;
                      handleChange(additionalIdsEvent);
                    }}
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            
            {/* Placeholder */}
            {!(formData.propertyTypeId || ((formData as any).additionalPropertyTypes && (formData as any).additionalPropertyTypes.length > 0)) && (
              <span className="text-gray-400 dark:text-gray-500 text-sm">Selecciona uno o más tipos de propiedad...</span>
            )}
            
            <span className="flex-1" />
            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showTypeDropdown ? 'rotate-180' : ''}`} />
          </div>
          
          {/* Dropdown mejorado */}
          {showTypeDropdown && (
            <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
              <div className="p-2">
                {propertyTypes.map((type) => {
                  const isSelected = Boolean(formData.propertyTypeId === type.id || ((formData as any).additionalPropertyTypes || []).includes(type.id));
                  const isPrimary = formData.propertyTypeId === type.id;
                  
                  return (
                    <div
                      key={type.id}
                      className={`px-4 py-3 cursor-pointer rounded-lg transition-all duration-200 flex items-center ${
                        isSelected 
                          ? 'bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={e => {
                        e.stopPropagation();
                        const currentAdditional = (formData as any).additionalPropertyTypes || [];
                        
                        if (!formData.propertyTypeId) {
                          // No hay tipo principal, seleccionar este como principal
                          const typeIdEvent = {
                            target: { name: "propertyTypeId", value: type.id }
                          } as unknown as React.ChangeEvent<HTMLInputElement>;
                          const typeNameEvent = {
                            target: { name: "type", value: type.name }
                          } as unknown as React.ChangeEvent<HTMLInputElement>;
                          handleChange(typeIdEvent);
                          handleChange(typeNameEvent);
                          
                          // Si estaba en adicionales, quitarlo
                          if (currentAdditional.includes(type.id)) {
                            const newAdditional = currentAdditional.filter((n: number) => n !== type.id);
                            const additionalIdsEvent = {
                              target: { name: "additionalPropertyTypes", value: newAdditional }
                            } as unknown as React.ChangeEvent<HTMLInputElement>;
                            handleChange(additionalIdsEvent);
                          }
                        } else if (formData.propertyTypeId === type.id) {
                          // Este es el tipo principal, quitarlo
                          const clearIdEvent = {
                            target: { name: "propertyTypeId", value: "" }
                          } as unknown as React.ChangeEvent<HTMLInputElement>;
                          const clearNameEvent = {
                            target: { name: "type", value: "" }
                          } as unknown as React.ChangeEvent<HTMLInputElement>;
                          handleChange(clearIdEvent);
                          handleChange(clearNameEvent);
                        } else {
                          // Manejar tipos adicionales
                          if (currentAdditional.includes(type.id)) {
                            // Quitar de adicionales
                            const newAdditional = currentAdditional.filter((n: number) => n !== type.id);
                            const additionalIdsEvent = {
                              target: { name: "additionalPropertyTypes", value: newAdditional }
                            } as unknown as React.ChangeEvent<HTMLInputElement>;
                            handleChange(additionalIdsEvent);
                          } else {
                            // Agregar a adicionales
                            const newAdditional = [...currentAdditional, type.id];
                            const additionalIdsEvent = {
                              target: { name: "additionalPropertyTypes", value: newAdditional }
                            } as unknown as React.ChangeEvent<HTMLInputElement>;
                            handleChange(additionalIdsEvent);
                          }
                        }
                      }}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                        isSelected 
                          ? 'bg-brand-500 border-brand-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <CheckCircleIcon className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{type.name}</div>
                        {isPrimary && (
                          <div className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                            Tipo principal
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {errors.type && (
          <div className="flex items-center mt-2 space-x-1">
            <p className="text-sm text-red-500">{errors.type}</p>
          </div>
        )}
        
        {loading && (
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500 mr-2"></div>
            Cargando tipos de propiedad...
          </div>
        )}
      </div>

      {/* Precio y Moneda con diseño mejorado */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
            <CurrencyDollarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información de Precio</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Precio */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Precio <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                {formData.currency === 'USD' ? '$' : formData.currency === 'PYG' ? 'Gs.' : '$'}
              </div>
              <input
                type="text"
                id="price"
                name="price"
                value={formatPriceWithDots(formData.price)}
                onChange={e => {
                  const raw = cleanPrice(e.target.value);
                  handleChange({
                    target: {
                      name: 'price',
                      value: raw,
                    }
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
                placeholder="0"
                className={`w-full h-12 pl-12 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                  errors.price ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 dark:text-white`}
              />
            </div>
            {errors.price && (
              <p className="text-sm text-red-500 mt-1">{errors.price}</p>
            )}
          </div>

          {/* Moneda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Moneda <span className="text-red-500">*</span>
            </label>
            <CurrencySelector
              selectedCurrencyId={formData.currencyId}
              onCurrencyChange={(currencyId, currencyCode) => {
                // Actualizar tanto el ID como el código de la moneda
                handleChange({
                  target: {
                    name: 'currencyId',
                    value: currencyId,
                  }
                } as unknown as React.ChangeEvent<HTMLInputElement>);
                handleChange({
                  target: {
                    name: 'currency',
                    value: currencyCode,
                  }
                } as unknown as React.ChangeEvent<HTMLInputElement>);
              }}
              className="w-full h-12"
            />
            {errors.currency && (
              <p className="text-sm text-red-500 mt-1">{errors.currency}</p>
            )}
          </div>
        </div>
      </div>

      {/* Estado y Operación */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
            <SparklesIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estado y Operación</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estado */}
          <div>
            <label htmlFor="propertyStatusId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              id="propertyStatusId"
              name="propertyStatusId"
              value={formData.propertyStatusId || ""}
              onChange={handleChange}
              className={`w-full h-12 px-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                errors.propertyStatusId ? "border-red-500 ring-red-500/20" : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 dark:text-white`}
              disabled={loadingStatuses}
            >
              <option value="">{loadingStatuses ? "Cargando estados..." : "Seleccionar estado"}</option>
              {propertyStatuses.map((status) => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
            {errors.propertyStatusId && (
              <p className="text-sm text-red-500 mt-1">{errors.propertyStatusId}</p>
            )}
          </div>

          {/* Operación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Operación <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {operations.map((option) => (
                <label key={option.value} className="relative group cursor-pointer">
                  <input
                    type="radio"
                    name="operacion"
                    value={option.value}
                    checked={formData.operacion === option.value}
                    onChange={(e) => handleChange(e as any)}
                    className="sr-only"
                  />
                  <div className={
                    `p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center group-hover:scale-105 ` +
                    (formData.operacion === option.value
                      ? `bg-brand-50 dark:bg-brand-900/30 border-brand-500 shadow-lg scale-105`
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500')
                  }>
                    <div className="flex flex-col items-center space-y-2">
                      <div className={formData.operacion === option.value ? 'text-current' : 'text-gray-400'}>
                        {getOperationIcon(option.value)}
                      </div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.operacion && (
              <p className="text-sm text-red-500 mt-1">{errors.operacion}</p>
            )}
          </div>
        </div>
      </div>

      {/* Descripción con diseño mejorado */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
            <DocumentTextIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Descripción</h3>
        </div>
        
        <div className={`border-2 rounded-xl overflow-hidden transition-all duration-200 ${
          errors.description ? "border-red-500 ring-red-500/20" : "border-gray-300 dark:border-gray-600 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/20"
        }`}>
          <Editor
            value={formData.description}
            onChange={(content: string) => {
              
              const event = {
                target: {
                  name: "description",
                  value: content,
                },
              } as React.ChangeEvent<HTMLInputElement>;
              handleChange(event);
            }}
          />
        </div>
        
        {errors.description && (
          <div className="flex items-start mt-2 space-x-1">
            <p className="text-sm text-red-500">{errors.description}</p>
          </div>
        )}
        
        {!errors.description && formData.description && (
          <div className="flex items-center mt-2 space-x-2">
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
            <p className="text-sm text-green-600 dark:text-green-400">
              Descripción válida ({formData.description.length} caracteres)
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 