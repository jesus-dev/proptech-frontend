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
            <label htmlFor="numberOfLots" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Número Total de Lotes
            </label>
            <input
              type="number"
              id="numberOfLots"
              name="numberOfLots"
              value={formData.numberOfLots || ""}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
                errors.numberOfLots ? "border-red-500" : ""
              }`}
            />
            {errors.numberOfLots && <p className="mt-1 text-sm text-red-500">{errors.numberOfLots}</p>}
          </div>
          <div>
            <label htmlFor="availableLots" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Lotes Disponibles
            </label>
            <input
              type="number"
              id="availableLots"
              name="availableLots"
              value={formData.availableLots || ""}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
                errors.availableLots ? "border-red-500" : ""
              }`}
            />
            {errors.availableLots && <p className="mt-1 text-sm text-red-500">{errors.availableLots}</p>}
          </div>
          <div>
            <label htmlFor="totalArea" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Área Total (m²)
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
              Cuota de Mantenimiento ($)
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
        <div className="mt-6">
          <label htmlFor="lotSizes" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            Descripción de Tamaños de Lotes
          </label>
          <input
            type="text"
            id="lotSizes"
            name="lotSizes"
            value={formData.lotSizes || ""}
            onChange={handleChange}
            placeholder="Ej: Desde 800m² hasta 2000m²"
            className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
              errors.lotSizes ? "border-red-500" : ""
            }`}
          />
          {errors.lotSizes && <p className="mt-1 text-sm text-red-500">{errors.lotSizes}</p>}
        </div>
        <div className="mt-6">
          <label htmlFor="buildingRegulations" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            Reglamento de Construcción
          </label>
          <textarea
            id="buildingRegulations"
            name="buildingRegulations"
            rows={4}
            value={formData.buildingRegulations || ""}
            onChange={handleChange}
            placeholder="Describe las restricciones de construcción, estilo arquitectónico, uso de materiales, etc."
            className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
              errors.buildingRegulations ? "border-red-500" : ""
            }`}
          />
          {errors.buildingRegulations && <p className="mt-1 text-sm text-red-500">{errors.buildingRegulations}</p>}
        </div>
      </div>
    </div>
  );
} 