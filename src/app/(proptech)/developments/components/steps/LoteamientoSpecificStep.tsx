"use client";

import React from "react";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";

interface LoteamientoSpecificStepProps {
  formData: DevelopmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
}

export default function LoteamientoSpecificStep({ formData, handleChange, errors }: LoteamientoSpecificStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="numberOfLots" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Número de Lotes
          </label>
          <input
            type="number"
            id="numberOfLots"
            name="numberOfLots"
            value={formData.numberOfLots}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.numberOfLots ? "border-red-500" : ""
            }`}
          />
          {errors.numberOfLots && <p className="mt-1 text-sm text-red-500">{errors.numberOfLots}</p>}
        </div>

        <div>
          <label htmlFor="totalArea" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Área Total (m²)
          </label>
          <input
            type="number"
            id="totalArea"
            name="totalArea"
            value={formData.totalArea}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.totalArea ? "border-red-500" : ""
            }`}
          />
          {errors.totalArea && <p className="mt-1 text-sm text-red-500">{errors.totalArea}</p>}
        </div>

        <div>
          <label htmlFor="availableLots" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Lotes Disponibles
          </label>
          <input
            type="number"
            id="availableLots"
            name="availableLots"
            value={formData.availableLots}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.availableLots ? "border-red-500" : ""
            }`}
          />
          {errors.availableLots && <p className="mt-1 text-sm text-red-500">{errors.availableLots}</p>}
        </div>

        <div>
          <label htmlFor="lotSizes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tamaños de Lotes (m²)
          </label>
          <input
            type="text"
            id="lotSizes"
            name="lotSizes"
            value={formData.lotSizes}
            onChange={handleChange}
            placeholder="Ej: 200-300, 300-400, 400-500"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.lotSizes ? "border-red-500" : ""
            }`}
          />
          {errors.lotSizes && <p className="mt-1 text-sm text-red-500">{errors.lotSizes}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="services" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Servicios
        </label>
        <textarea
          id="services"
          name="services"
          rows={4}
          value={formData.services}
          onChange={handleChange}
          placeholder="Lista de servicios disponibles (agua, luz, drenaje, etc.)"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.services ? "border-red-500" : ""
          }`}
        />
        {errors.services && <p className="mt-1 text-sm text-red-500">{errors.services}</p>}
      </div>
    </div>
  );
} 