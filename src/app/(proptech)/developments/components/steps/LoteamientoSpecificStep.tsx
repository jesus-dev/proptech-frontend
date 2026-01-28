"use client";

import React from "react";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";
import ValidatedInput from "@/components/form/input/ValidatedInput";
import { HomeIcon, Square3Stack3DIcon, MapIcon } from "@heroicons/react/24/outline";

interface LoteamientoSpecificStepProps {
  formData: DevelopmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
}

export default function LoteamientoSpecificStep({ formData, handleChange, errors }: LoteamientoSpecificStepProps) {
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

  return (
    <div className="space-y-6">
      {/* Información General del Loteamiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Número de Lotes */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Número de Lotes <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              id="numberOfLots"
              name="numberOfLots"
              value={formData.numberOfLots || ''}
              onChange={(e) => handleNumberChange('numberOfLots', e.target.value)}
              placeholder="0"
              min="0"
              className={`w-full h-12 pl-10 pr-4 border-2 rounded-lg focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                errors.numberOfLots ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 dark:text-white`}
            />
          </div>
          {errors.numberOfLots && (
            <p className="text-sm text-red-500 mt-1">{errors.numberOfLots}</p>
          )}
        </div>

        {/* Lotes Disponibles */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lotes Disponibles <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              id="availableLots"
              name="availableLots"
              value={formData.availableLots || ''}
              onChange={(e) => handleNumberChange('availableLots', e.target.value)}
              placeholder="0"
              min="0"
              className={`w-full h-12 pl-10 pr-4 border-2 rounded-lg focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                errors.availableLots ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 dark:text-white`}
            />
          </div>
          {errors.availableLots && (
            <p className="text-sm text-red-500 mt-1">{errors.availableLots}</p>
          )}
        </div>

        {/* Área Total */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Área Total (m²) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Square3Stack3DIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              id="totalArea"
              name="totalArea"
              value={formData.totalArea || ''}
              onChange={(e) => handleAreaChange('totalArea', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className={`w-full h-12 pl-10 pr-4 border-2 rounded-lg focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                errors.totalArea ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 dark:text-white`}
            />
          </div>
          {errors.totalArea && (
            <p className="text-sm text-red-500 mt-1">{errors.totalArea}</p>
          )}
        </div>

        {/* Tamaños de Lotes */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tamaños de Lotes (m²) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="lotSizes"
              name="lotSizes"
              value={formData.lotSizes || ''}
              onChange={handleChange}
              placeholder="Ej: 200-300, 300-400, 400-500"
              className={`w-full h-12 pl-10 pr-4 border-2 rounded-lg focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
                errors.lotSizes ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 dark:text-white`}
            />
          </div>
          {errors.lotSizes && (
            <p className="text-sm text-red-500 mt-1">{errors.lotSizes}</p>
          )}
        </div>
      </div>

      {/* Servicios */}
      <div>
        <label htmlFor="services" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Servicios <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Ingrese los servicios disponibles separados por comas (ej: Agua, Luz, Drenaje, Calles pavimentadas)
        </p>
        <textarea
          id="services"
          name="services"
          rows={4}
          value={Array.isArray(formData.services) ? formData.services.join(', ') : formData.services || ''}
          onChange={(e) => {
            // El hook handleChange ya convierte automáticamente el string a array para 'services'
            handleChange(e);
          }}
          placeholder="Agua, Luz, Drenaje, Calles pavimentadas, Alumbrado público..."
          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 ${
            errors.services ? 'border-red-500 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 dark:text-white resize-none`}
        />
        {errors.services && (
          <p className="text-sm text-red-500 mt-1">{errors.services}</p>
        )}
      </div>
    </div>
  );
} 