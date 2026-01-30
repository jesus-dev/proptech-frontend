"use client";

import React from "react";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";

interface CondominioSpecificStepProps {
  formData: DevelopmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
}

const inputClass = (hasError: boolean) =>
  `w-full h-11 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
    hasError ? "border-red-500" : "border-gray-300"
  }`;

export default function CondominioSpecificStep({ formData, handleChange, errors }: CondominioSpecificStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Condominio</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="numberOfUnits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número de Unidades <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="numberOfUnits"
              name="numberOfUnits"
              min={1}
              value={formData.numberOfUnits ?? ""}
              onChange={handleChange}
              className={inputClass(!!errors.numberOfUnits)}
            />
            {errors.numberOfUnits && <p className="mt-1 text-sm text-red-500">{errors.numberOfUnits}</p>}
          </div>
          <div>
            <label htmlFor="availableUnits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unidades Disponibles <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="availableUnits"
              name="availableUnits"
              min={0}
              value={formData.availableUnits ?? ""}
              onChange={handleChange}
              className={inputClass(!!errors.availableUnits)}
            />
            {errors.availableUnits && <p className="mt-1 text-sm text-red-500">{errors.availableUnits}</p>}
          </div>
          <div>
            <label htmlFor="totalArea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Área total (m²) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="totalArea"
              name="totalArea"
              min={0}
              value={formData.totalArea ?? ""}
              onChange={handleChange}
              className={inputClass(!!errors.totalArea)}
            />
            {errors.totalArea && <p className="mt-1 text-sm text-red-500">{errors.totalArea}</p>}
          </div>
          <div>
            <label htmlFor="maintenanceFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cuota mantenimiento ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="maintenanceFee"
              name="maintenanceFee"
              min={0}
              value={formData.maintenanceFee ?? ""}
              onChange={handleChange}
              className={inputClass(!!errors.maintenanceFee)}
            />
            {errors.maintenanceFee && <p className="mt-1 text-sm text-red-500">{errors.maintenanceFee}</p>}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="unitTypes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipos de Unidades <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="unitTypes"
              name="unitTypes"
              value={formData.unitTypes ?? ""}
              onChange={handleChange}
              placeholder="Ej: Casas de 2, 3 y 4 dormitorios"
              className={inputClass(!!errors.unitTypes)}
            />
            {errors.unitTypes && <p className="mt-1 text-sm text-red-500">{errors.unitTypes}</p>}
          </div>
          <div>
            <label htmlFor="lotSizes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tamaños de Lotes <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lotSizes"
              name="lotSizes"
              value={formData.lotSizes ?? ""}
              onChange={handleChange}
              placeholder="Ej: Desde 250m² hasta 450m²"
              className={inputClass(!!errors.lotSizes)}
            />
            {errors.lotSizes && <p className="mt-1 text-sm text-red-500">{errors.lotSizes}</p>}
          </div>
        </div>
      </div>
    </div>
  );
} 