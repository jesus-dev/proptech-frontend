"use client";

import React from "react";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";

interface EdificioSpecificStepProps {
  formData: DevelopmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
  setUnits?: (units: any[]) => void;
}

export default function EdificioSpecificStep({ formData, handleChange, errors }: EdificioSpecificStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edificio</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="numberOfFloors" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número de Pisos <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="numberOfFloors"
              name="numberOfFloors"
              min={1}
              value={formData.numberOfFloors ?? ""}
              onChange={handleChange}
              className={`w-full h-11 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.numberOfFloors ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.numberOfFloors && <p className="mt-1 text-sm text-red-500">{errors.numberOfFloors}</p>}
          </div>

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
              className={`w-full h-11 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.numberOfUnits ? "border-red-500" : "border-gray-300"
              }`}
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
              className={`w-full h-11 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.availableUnits ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.availableUnits && <p className="mt-1 text-sm text-red-500">{errors.availableUnits}</p>}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="numberOfElevators" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ascensores <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <input
              type="number"
              id="numberOfElevators"
              name="numberOfElevators"
              min={0}
              value={formData.numberOfElevators ?? ""}
              onChange={handleChange}
              placeholder="Ej: 2"
              className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <label htmlFor="parkingPerUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cocheras por unidad <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              id="parkingPerUnit"
              name="parkingPerUnit"
              value={formData.parkingPerUnit ?? ""}
              onChange={handleChange}
              placeholder="Ej: 1, 1.5, 2"
              className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <label htmlFor="estimatedDeliveryYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Año de entrega <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <input
              type="number"
              id="estimatedDeliveryYear"
              name="estimatedDeliveryYear"
              min={new Date().getFullYear()}
              value={formData.estimatedDeliveryYear ?? ""}
              onChange={handleChange}
              placeholder="Ej: 2026"
              className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="commercialGroundFloor"
                checked={formData.commercialGroundFloor === true}
                onChange={handleChange}
                className="rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500 dark:bg-gray-700"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Planta baja comercial</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
