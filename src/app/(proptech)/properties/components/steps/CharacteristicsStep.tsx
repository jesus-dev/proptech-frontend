"use client";

import React, { useState } from "react";
import { PropertyFormData, PropertyFormErrors } from "../../hooks/usePropertyForm";
import ValidatedInput from "@/components/form/input/ValidatedInput";
import ValidatedTextArea from "@/components/form/input/ValidatedTextArea";
import { 
  HomeIcon, 
  WrenchScrewdriverIcon,
  Square3Stack3DIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentTextIcon,
  SparklesIcon,
  MapIcon,
  Square2StackIcon,
  ClockIcon,
  PlusIcon,
  MinusIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

interface CharacteristicsStepProps {
  formData: PropertyFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  errors: PropertyFormErrors;
}

export default function CharacteristicsStep({ formData, handleChange, errors }: CharacteristicsStepProps) {
  const [activeSection, setActiveSection] = useState('basic');

  const handleNumberChange = (name: string, value: string) => {
    const numValue = value === '' ? '' : Math.max(0, parseInt(value) || 0).toString();
    const event = {
      target: { name, value: numValue }
    } as React.ChangeEvent<HTMLInputElement>;
    handleChange(event);
  };

  const handleAreaChange = (name: string, value: string) => {
    const numValue = value === '' ? '' : Math.max(0, parseFloat(value) || 0).toString();
    const event = {
      target: { name, value: numValue }
    } as React.ChangeEvent<HTMLInputElement>;
    handleChange(event);
  };

  const sections = [
    { id: 'basic', name: 'Básicas', icon: HomeIcon, color: 'blue' },
    { id: 'spaces', name: 'Espacios', icon: BuildingOfficeIcon, color: 'green' },
    { id: 'dimensions', name: 'Dimensiones', icon: Square2StackIcon, color: 'purple' },
    { id: 'details', name: 'Detalles', icon: DocumentTextIcon, color: 'orange' }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-8">
     
      {/* Navegación por secciones */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-white' : getColorClasses(section.color).split(' ')[2]}`} />
                {section.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sección: Características Básicas */}
      {activeSection === 'basic' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-6">
            <div className={`p-2 rounded-lg mr-3 ${getColorClasses('blue')}`}>
              <HomeIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Características Básicas</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Habitaciones */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Habitaciones <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                                 <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms || ''}
                  onChange={(e) => handleNumberChange('bedrooms', e.target.value)}
                  placeholder="0"
                  min="0"
                  className={`w-full h-12 pl-10 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                    errors.bedrooms ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 dark:text-white`}
                />
              </div>
              {errors.bedrooms && (
                <p className="text-sm text-red-500 mt-1">{errors.bedrooms}</p>
              )}
            </div>

            {/* Baños */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Baños <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                                 <WrenchScrewdriverIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms || ''}
                  onChange={(e) => handleNumberChange('bathrooms', e.target.value)}
                  placeholder="0"
                  min="0"
                  className={`w-full h-12 pl-10 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                    errors.bathrooms ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 dark:text-white`}
                />
              </div>
              {errors.bathrooms && (
                <p className="text-sm text-red-500 mt-1">{errors.bathrooms}</p>
              )}
            </div>

            {/* Habitaciones Totales */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Habitaciones Totales
              </label>
              <div className="relative">
                <Square3Stack3DIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="rooms"
                  name="rooms"
                  value={formData.rooms || ''}
                  onChange={(e) => handleNumberChange('rooms', e.target.value)}
                  placeholder="0"
                  min="0"
                  className={`w-full h-12 pl-10 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                    errors.rooms ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 dark:text-white`}
                />
              </div>
              {errors.rooms && (
                <p className="text-sm text-red-500 mt-1">{errors.rooms}</p>
              )}
            </div>

            {/* Cocinas */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cocinas
              </label>
              <div className="relative">
                <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="kitchens"
                  name="kitchens"
                  value={formData.kitchens || ''}
                  onChange={(e) => handleNumberChange('kitchens', e.target.value)}
                  placeholder="0"
                  min="0"
                  className={`w-full h-12 pl-10 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                    errors.kitchens ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 dark:text-white`}
                />
              </div>
              {errors.kitchens && (
                <p className="text-sm text-red-500 mt-1">{errors.kitchens}</p>
              )}
            </div>

            {/* Pisos */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pisos
              </label>
              <div className="relative">
                <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="floors"
                  name="floors"
                  value={formData.floors || ''}
                  onChange={(e) => handleNumberChange('floors', e.target.value)}
                  placeholder="0"
                  min="0"
                  className={`w-full h-12 pl-10 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                    errors.floors ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 dark:text-white`}
                />
              </div>
              {errors.floors && (
                <p className="text-sm text-red-500 mt-1">{errors.floors}</p>
              )}
            </div>

            {/* Año de Construcción */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Año de Construcción
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="yearBuilt"
                  name="yearBuilt"
                  value={formData.yearBuilt || ''}
                  onChange={(e) => handleNumberChange('yearBuilt', e.target.value)}
                  placeholder="2024"
                  min="1900"
                  max="2030"
                  className={`w-full h-12 pl-10 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                    errors.yearBuilt ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 dark:text-white`}
                />
              </div>
              {errors.yearBuilt && (
                <p className="text-sm text-red-500 mt-1">{errors.yearBuilt}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sección: Espacios */}
      {activeSection === 'spaces' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-6">
            <div className={`p-2 rounded-lg mr-3 ${getColorClasses('green')}`}>
              <BuildingOfficeIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Espacios y Distribución</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Disponible Desde */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Disponible Desde
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  id="availableFrom"
                  name="availableFrom"
                  value={formData.availableFrom || ''}
                  onChange={handleChange}
                  className={`w-full h-12 pl-10 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                    errors.availableFrom ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 dark:text-white`}
                />
              </div>
              {errors.availableFrom && (
                <p className="text-sm text-red-500 mt-1">{errors.availableFrom}</p>
              )}
            </div>

            {/* Estacionamientos */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estacionamientos
              </label>
              <div className="relative">
                <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="parking"
                  name="parking"
                  value={formData.parking || ''}
                  onChange={(e) => handleNumberChange('parking', e.target.value)}
                  placeholder="0"
                  min="0"
                  className={`w-full h-12 pl-10 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                    errors.parking ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 dark:text-white`}
                />
              </div>
              {errors.parking && (
                <p className="text-sm text-red-500 mt-1">{errors.parking}</p>
              )}
            </div>

            {/* Balcón/Terraza */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Balcón/Terraza (m²)
              </label>
              <div className="relative">
                <Square3Stack3DIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="balconyArea"
                  name="balconyArea"
                  value={(formData as any).balconyArea || ''}
                  onChange={(e) => handleAreaChange('balconyArea', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={`w-full h-12 pl-10 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                    (errors as any).balconyArea ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 dark:text-white`}
                />
              </div>
              {(errors as any).balconyArea && (
                <p className="text-sm text-red-500 mt-1">{(errors as any).balconyArea}</p>
              )}
            </div>

            {/* Patio/Jardín */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Patio/Jardín (m²)
              </label>
              <div className="relative">
                <Square3Stack3DIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="gardenArea"
                  name="gardenArea"
                  value={(formData as any).gardenArea || ''}
                  onChange={(e) => handleAreaChange('gardenArea', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={`w-full h-12 pl-10 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                    (errors as any).gardenArea ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 dark:text-white`}
                />
              </div>
              {(errors as any).gardenArea && (
                <p className="text-sm text-red-500 mt-1">{(errors as any).gardenArea}</p>
              )}
            </div>

            {/* Lavadero */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lavadero
              </label>
              <div className="relative">
                <WrenchScrewdriverIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="laundry"
                  name="laundry"
                  value={(formData as any).laundry || ''}
                  onChange={handleChange}
                  className={`w-full h-12 pl-10 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                    (errors as any).laundry ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 dark:text-white`}
                >
                  <option value="">Seleccionar...</option>
                  <option value="INCLUDED">Incluido</option>
                  <option value="AVAILABLE">Disponible</option>
                  <option value="NONE">No disponible</option>
                </select>
              </div>
              {(errors as any).laundry && (
                <p className="text-sm text-red-500 mt-1">{(errors as any).laundry}</p>
              )}
            </div>

            {/* Bodega/Depósito */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bodega/Depósito
              </label>
              <div className="relative">
                <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="storage"
                  name="storage"
                  value={(formData as any).storage || ''}
                  onChange={handleChange}
                  className={`w-full h-12 pl-10 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                    (errors as any).storage ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 dark:text-white`}
                >
                  <option value="">Seleccionar...</option>
                  <option value="INCLUDED">Incluido</option>
                  <option value="AVAILABLE">Disponible</option>
                  <option value="NONE">No disponible</option>
                </select>
              </div>
              {(errors as any).storage && (
                <p className="text-sm text-red-500 mt-1">{(errors as any).storage}</p>
              )}
            </div>
          </div>

          {/* Información adicional sobre espacios */}
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-start">
              <SparklesIcon className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                  Información sobre espacios
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Los espacios adicionales como balcones, terrazas y patios pueden aumentar significativamente el valor y atractivo de la propiedad.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección: Dimensiones */}
      {activeSection === 'dimensions' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-6">
            <div className={`p-2 rounded-lg mr-3 ${getColorClasses('purple')}`}>
                             <Square2StackIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dimensiones y Áreas</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Área */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Área (m²) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area || ''}
                  onChange={(e) => handleAreaChange('area', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={`w-full h-12 pl-10 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                    errors.area ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 dark:text-white`}
                />
              </div>
              {errors.area && (
                <p className="text-sm text-red-500 mt-1">{errors.area}</p>
              )}
            </div>

            {/* Tamaño del Lote */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tamaño del Lote (m²)
              </label>
              <div className="relative">
                <MapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="lotSize"
                  name="lotSize"
                  value={formData.lotSize || ''}
                  onChange={(e) => handleAreaChange('lotSize', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={`w-full h-12 pl-10 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                    errors.lotSize ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 dark:text-white`}
                />
              </div>
              {errors.lotSize && (
                <p className="text-sm text-red-500 mt-1">{errors.lotSize}</p>
              )}
            </div>
          </div>

          {/* Información adicional sobre dimensiones */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-start">
              <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Consejo sobre dimensiones
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  El área se refiere al espacio habitable de la propiedad, mientras que el tamaño del lote incluye el terreno completo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección: Detalles */}
      {activeSection === 'details' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-6">
            <div className={`p-2 rounded-lg mr-3 ${getColorClasses('orange')}`}>
              <DocumentTextIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalles Adicionales</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detalles Adicionales
            </label>
            <textarea
              id="additionalDetails"
              name="additionalDetails"
              value={formData.additionalDetails || ''}
              onChange={handleChange}
              rows={6}
              placeholder="Describe detalles adicionales como acabados, equipamiento, características especiales, etc."
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 resize-none ${
                errors.additionalDetails ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 dark:text-white`}
            />
            {errors.additionalDetails && (
              <p className="text-sm text-red-500 mt-1">{errors.additionalDetails}</p>
            )}
            
            {/* Contador de caracteres */}
            {formData.additionalDetails && (
              <div className="flex items-center justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{formData.additionalDetails.length} caracteres</span>
                <span className="text-green-600 dark:text-green-400">
                  <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                  Detalles agregados
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Indicador de progreso */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso de características</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {sections.findIndex(s => s.id === activeSection) + 1} de {sections.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((sections.findIndex(s => s.id === activeSection) + 1) / sections.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 