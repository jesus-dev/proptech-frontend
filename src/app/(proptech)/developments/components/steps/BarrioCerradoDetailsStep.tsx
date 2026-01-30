"use client";

import React from "react";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";

interface BarrioCerradoDetailsStepProps {
  formData: DevelopmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
}

export default function BarrioCerradoDetailsStep({ formData, handleChange, errors }: BarrioCerradoDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Detalles del Barrio Cerrado
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="numberOfLots" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número Total de Lotes <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="numberOfLots"
              name="numberOfLots"
              value={formData.numberOfLots || ""}
              onChange={handleChange}
              className={`w-full h-12 px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ${
                errors.numberOfLots ? "border-red-500 ring-red-500/20" : "border-gray-300"
              }`}
            />
            {errors.numberOfLots && <p className="mt-1 text-sm text-red-500">{errors.numberOfLots}</p>}
          </div>
          <div>
            <label htmlFor="availableLots" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lotes Disponibles <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="availableLots"
              name="availableLots"
              value={formData.availableLots || ""}
              onChange={handleChange}
              className={`w-full h-12 px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ${
                errors.availableLots ? "border-red-500 ring-red-500/20" : "border-gray-300"
              }`}
            />
            {errors.availableLots && <p className="mt-1 text-sm text-red-500">{errors.availableLots}</p>}
          </div>
          <div>
            <label htmlFor="totalArea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Área Total (m²) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="totalArea"
              name="totalArea"
              value={formData.totalArea || ""}
              onChange={handleChange}
              className={`w-full h-12 px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ${
                errors.totalArea ? "border-red-500 ring-red-500/20" : "border-gray-300"
              }`}
            />
            {errors.totalArea && <p className="mt-1 text-sm text-red-500">{errors.totalArea}</p>}
          </div>
          <div>
            <label htmlFor="maintenanceFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cuota de Mantenimiento ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="maintenanceFee"
              name="maintenanceFee"
              value={formData.maintenanceFee || ""}
              onChange={handleChange}
              className={`w-full h-12 px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ${
                errors.maintenanceFee ? "border-red-500 ring-red-500/20" : "border-gray-300"
              }`}
            />
            {errors.maintenanceFee && <p className="mt-1 text-sm text-red-500">{errors.maintenanceFee}</p>}
          </div>
        </div>
        <div className="mt-6">
          <label htmlFor="lotSizes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción de Tamaños de Lotes <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lotSizes"
            name="lotSizes"
            value={formData.lotSizes || ""}
            onChange={handleChange}
            placeholder="Ej: Desde 800m² hasta 2000m²"
            className={`w-full h-12 px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ${
              errors.lotSizes ? "border-red-500 ring-red-500/20" : "border-gray-300"
            }`}
          />
          {errors.lotSizes && <p className="mt-1 text-sm text-red-500">{errors.lotSizes}</p>}
        </div>
        <div className="mt-6">
          <label htmlFor="buildingRegulations" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reglamento de Construcción <span className="text-red-500">*</span>
          </label>
          <textarea
            id="buildingRegulations"
            name="buildingRegulations"
            rows={4}
            value={formData.buildingRegulations || ""}
            onChange={handleChange}
            placeholder="Describe las restricciones de construcción, estilo arquitectónico, uso de materiales, etc."
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 resize-none ${
              errors.buildingRegulations ? "border-red-500 ring-red-500/20" : "border-gray-300"
            }`}
          />
          {errors.buildingRegulations && <p className="mt-1 text-sm text-red-500">{errors.buildingRegulations}</p>}
        </div>
      </div>
    </div>
  );
} 