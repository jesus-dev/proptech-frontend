"use client";

import React from "react";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";

interface CondominioSpecificStepProps {
  formData: DevelopmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
}

export default function CondominioSpecificStep({ formData, handleChange, errors }: CondominioSpecificStepProps) {
  const handleArrayFieldChange = (fieldName: 'commonAreas' | 'securityFeatures' | 'amenities', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    const event = {
      target: {
        name: fieldName,
        value: items.join(', ')
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleChange(event);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Información Específica del Condominio
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Completa los detalles específicos de tu condominio
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="numberOfUnits" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            Número Total de Unidades
          </label>
          <input
            type="number"
            id="numberOfUnits"
            name="numberOfUnits"
            value={formData.numberOfUnits || ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
              errors.numberOfUnits ? "border-red-500" : ""
            }`}
          />
          {errors.numberOfUnits && <p className="mt-1 text-sm text-red-500">{errors.numberOfUnits}</p>}
        </div>

        <div>
          <label htmlFor="availableUnits" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            Unidades Disponibles
          </label>
          <input
            type="number"
            id="availableUnits"
            name="availableUnits"
            value={formData.availableUnits || ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
              errors.availableUnits ? "border-red-500" : ""
            }`}
          />
          {errors.availableUnits && <p className="mt-1 text-sm text-red-500">{errors.availableUnits}</p>}
        </div>

        <div>
          <label htmlFor="totalArea" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            Área Total del Condominio (m²)
          </label>
          <input
            type="number"
            id="totalArea"
            name="totalArea"
            value={formData.totalArea || ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
              errors.totalArea ? "border-red-500" : ""
            }`}
          />
          {errors.totalArea && <p className="mt-1 text-sm text-red-500">{errors.totalArea}</p>}
        </div>

        <div>
          <label htmlFor="maintenanceFee" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            Cuota de Mantenimiento Mensual ($)
          </label>
          <input
            type="number"
            id="maintenanceFee"
            name="maintenanceFee"
            value={formData.maintenanceFee || ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
              errors.maintenanceFee ? "border-red-500" : ""
            }`}
          />
          {errors.maintenanceFee && <p className="mt-1 text-sm text-red-500">{errors.maintenanceFee}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="unitTypes" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
          Tipos de Unidades
        </label>
        <input
          type="text"
          id="unitTypes"
          name="unitTypes"
          value={formData.unitTypes || ""}
          onChange={handleChange}
          placeholder="Ej: Casas de 2, 3 y 4 dormitorios"
          className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
            errors.unitTypes ? "border-red-500" : ""
          }`}
        />
        {errors.unitTypes && <p className="mt-1 text-sm text-red-500">{errors.unitTypes}</p>}
      </div>

      <div>
        <label htmlFor="lotSizes" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
          Tamaños de Lotes
        </label>
        <input
          type="text"
          id="lotSizes"
          name="lotSizes"
          value={formData.lotSizes || ""}
          onChange={handleChange}
          placeholder="Ej: Desde 250m² hasta 450m²"
          className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
            errors.lotSizes ? "border-red-500" : ""
          }`}
        />
        {errors.lotSizes && <p className="mt-1 text-sm text-red-500">{errors.lotSizes}</p>}
      </div>

      <div>
        <label htmlFor="commonAreas" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
          Áreas Comunes
        </label>
        <textarea
          id="commonAreas"
          name="commonAreas"
          rows={3}
          value={formData.commonAreas?.join(', ') || ""}
          onChange={(e) => handleArrayFieldChange('commonAreas', e.target.value)}
          placeholder="Ej: Piscina, Club House, Canchas de tenis, Parque infantil, Sala de eventos"
          className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
            errors.commonAreas ? "border-red-500" : ""
          }`}
        />
        {errors.commonAreas && <p className="mt-1 text-sm text-red-500">{errors.commonAreas}</p>}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Separa cada área común con comas
        </p>
      </div>

      <div>
        <label htmlFor="securityFeatures" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
          Características de Seguridad
        </label>
        <textarea
          id="securityFeatures"
          name="securityFeatures"
          rows={3}
          value={formData.securityFeatures?.join(', ') || ""}
          onChange={(e) => handleArrayFieldChange('securityFeatures', e.target.value)}
          placeholder="Ej: Seguridad 24/7, Cámaras de vigilancia, Control de acceso, Cercado perimetral"
          className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
            errors.securityFeatures ? "border-red-500" : ""
          }`}
        />
        {errors.securityFeatures && <p className="mt-1 text-sm text-red-500">{errors.securityFeatures}</p>}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Separa cada característica con comas
        </p>
      </div>

      <div>
        <label htmlFor="amenities" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
          Amenidades
        </label>
        <textarea
          id="amenities"
          name="amenities"
          rows={3}
          value={formData.amenities?.join(', ') || ""}
          onChange={(e) => handleArrayFieldChange('amenities', e.target.value)}
          placeholder="Ej: Jardines, Estacionamiento, Sistema de riego automático"
          className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
            errors.amenities ? "border-red-500" : ""
          }`}
        />
        {errors.amenities && <p className="mt-1 text-sm text-red-500">{errors.amenities}</p>}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Separa cada amenidad con comas
        </p>
      </div>
    </div>
  );
} 