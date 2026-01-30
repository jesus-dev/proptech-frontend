"use client";

import React, { useState, useEffect } from "react";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";
import { getAllServices } from "@/app/(proptech)/catalogs/services/servicesService";
import FeatureSelector from "./FeatureSelector";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const FALLBACK_SERVICES = [
  "Agua potable", "Electricidad", "Cloacas", "Gas natural",
  "Calles pavimentadas", "Alumbrado público", "Fibra óptica", "Desagües pluviales"
];

const colorScheme = {
  bg: "bg-blue-100",
  text: "text-blue-800",
  darkBg: "bg-blue-900/40",
  darkText: "text-blue-300",
  hoverText: "text-blue-200",
};

interface LoteamientoSpecificStepProps {
  formData: DevelopmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
}

export default function LoteamientoSpecificStep({ formData, handleChange, errors }: LoteamientoSpecificStepProps) {
  const [availableServices, setAvailableServices] = useState<string[]>(FALLBACK_SERVICES);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoadingServices(true);
        const list = await getAllServices();
        if (!cancelled && Array.isArray(list) && list.length > 0) {
          setAvailableServices(list.map((s: { name: string }) => s.name));
        }
      } catch {
        if (!cancelled) setAvailableServices(FALLBACK_SERVICES);
      } finally {
        if (!cancelled) setLoadingServices(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

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
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Número de Lotes <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="numberOfLots"
            name="numberOfLots"
            value={formData.numberOfLots || ''}
            onChange={(e) => handleNumberChange('numberOfLots', e.target.value)}
            placeholder="0"
            min="0"
            className={`w-full h-12 px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ${
              errors.numberOfLots ? 'border-red-500 ring-red-500/20' : 'border-gray-300'
            }`}
          />
          {errors.numberOfLots && (
            <p className="text-sm text-red-500 mt-1">{errors.numberOfLots}</p>
          )}
        </div>

        {/* Lotes Disponibles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lotes Disponibles <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="availableLots"
            name="availableLots"
            value={formData.availableLots || ''}
            onChange={(e) => handleNumberChange('availableLots', e.target.value)}
            placeholder="0"
            min="0"
            className={`w-full h-12 px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ${
              errors.availableLots ? 'border-red-500 ring-red-500/20' : 'border-gray-300'
            }`}
          />
          {errors.availableLots && (
            <p className="text-sm text-red-500 mt-1">{errors.availableLots}</p>
          )}
        </div>

        {/* Área Total */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Área Total (m²) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="totalArea"
            name="totalArea"
            value={formData.totalArea || ''}
            onChange={(e) => handleAreaChange('totalArea', e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            className={`w-full h-12 px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ${
              errors.totalArea ? 'border-red-500 ring-red-500/20' : 'border-gray-300'
            }`}
          />
          {errors.totalArea && (
            <p className="text-sm text-red-500 mt-1">{errors.totalArea}</p>
          )}
        </div>

        {/* Tamaños de Lotes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tamaños de Lotes (m²) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lotSizes"
            name="lotSizes"
            value={formData.lotSizes || ''}
            onChange={handleChange}
            placeholder="Ej: 200-300, 300-400, 400-500"
            className={`w-full h-12 px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ${
              errors.lotSizes ? 'border-red-500 ring-red-500/20' : 'border-gray-300'
            }`}
          />
          {errors.lotSizes && (
            <p className="text-sm text-red-500 mt-1">{errors.lotSizes}</p>
          )}
        </div>
      </div>

      {/* Servicios - selector como en propiedades */}
      <div>
        {loadingServices ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <>
            <FeatureSelector
              title="Servicios"
              description="Selecciona los servicios disponibles en el loteamiento (ej: Agua, Luz, Drenaje, Calles pavimentadas)."
              availableItems={availableServices}
              selectedItems={formData.services || []}
              onSelectionChange={(newSelection: string[]) => {
                handleChange({
                  target: { name: "services", value: newSelection },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              itemColors={colorScheme}
            />
            {errors.services && (
              <p className="text-sm text-red-500 mt-1">{errors.services}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
} 