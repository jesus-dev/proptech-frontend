"use client";

import React, { useState } from "react";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";
import { Unit } from "../../components/types";

interface EdificioSpecificStepProps {
  formData: DevelopmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
  setUnits: (units: Unit[]) => void;
}

export default function EdificioSpecificStep({ formData, handleChange, errors, setUnits }: EdificioSpecificStepProps) {
  const [unitConfig, setUnitConfig] = useState({
    unitsPerFloor: 4,
    unitPrefix: "A",
    basePrice: 50000,
    baseArea: 80,
    bedrooms: 2,
    bathrooms: 1,
  });

  const generateUnits = () => {
    if (!formData.numberOfFloors || !formData.numberOfUnits) return;

    const units: Unit[] = [];
    let unitCounter = 1;

    for (let floor = 1; floor <= formData.numberOfFloors; floor++) {
      const unitsOnThisFloor = Math.min(unitConfig.unitsPerFloor, formData.numberOfUnits - units.length);
      
      for (let i = 0; i < unitsOnThisFloor && units.length < formData.numberOfUnits; i++) {
        const unitNumber = `${floor}${unitConfig.unitPrefix}${i + 1}`;
        const bedrooms = unitConfig.bedrooms;
        const bathrooms = unitConfig.bathrooms;
        const area = unitConfig.baseArea;
        const price = unitConfig.basePrice + (floor * 5000) + (bedrooms * 10000); // Price increases with floor and bedrooms

        units.push({
          id: `unit-${unitCounter}`,
          floor,
          unitNumber,
          bedrooms,
          bathrooms,
          area,
          price,
          status: "available",
          description: `Departamento ${unitNumber} - ${bedrooms} dormitorios, ${bathrooms} baños, ${area}m²`,
        });

        unitCounter++;
      }
    }

    setUnits(units);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Características Principales</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="numberOfFloors" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número de Pisos
            </label>
            <input
              type="number"
              id="numberOfFloors"
              name="numberOfFloors"
              value={formData.numberOfFloors}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white h-12 px-4 ${
                errors.numberOfFloors ? "border-red-500" : ""
              }`}
            />
            {errors.numberOfFloors && <p className="mt-1 text-sm text-red-500">{errors.numberOfFloors}</p>}
          </div>

          <div>
            <label htmlFor="numberOfUnits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número de Unidades
            </label>
            <input
              type="number"
              id="numberOfUnits"
              name="numberOfUnits"
              value={formData.numberOfUnits}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white h-12 px-4 ${
                errors.numberOfUnits ? "border-red-500" : ""
              }`}
            />
            {errors.numberOfUnits && <p className="mt-1 text-sm text-red-500">{errors.numberOfUnits}</p>}
          </div>

          <div>
            <label htmlFor="availableUnits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unidades Disponibles
            </label>
            <input
              type="number"
              id="availableUnits"
              name="availableUnits"
              value={formData.availableUnits}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white h-12 px-4 ${
                errors.availableUnits ? "border-red-500" : ""
              }`}
            />
            {errors.availableUnits && <p className="mt-1 text-sm text-red-500">{errors.availableUnits}</p>}
          </div>

          <div>
            <label htmlFor="unitTypes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipos de Unidades
            </label>
            <input
              type="text"
              id="unitTypes"
              name="unitTypes"
              value={formData.unitTypes}
              onChange={handleChange}
              placeholder="Ej: 1 recámara, 2 recámaras, 3 recámaras"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white h-12 px-4 ${
                errors.unitTypes ? "border-red-500" : ""
              }`}
            />
            {errors.unitTypes && <p className="mt-1 text-sm text-red-500">{errors.unitTypes}</p>}
          </div>
        </div>
      </div>

      {/* Unit Generation Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Configuración de Unidades</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unidades por Piso
            </label>
            <input
              type="number"
              value={unitConfig.unitsPerFloor}
              onChange={(e) => setUnitConfig(prev => ({ ...prev, unitsPerFloor: parseInt(e.target.value) || 1 }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white h-12 px-4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prefijo de Unidad
            </label>
            <input
              type="text"
              value={unitConfig.unitPrefix}
              onChange={(e) => setUnitConfig(prev => ({ ...prev, unitPrefix: e.target.value }))}
              placeholder="A, B, C..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white h-12 px-4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Precio Base (USD)
            </label>
            <input
              type="number"
              value={unitConfig.basePrice}
              onChange={(e) => setUnitConfig(prev => ({ ...prev, basePrice: parseInt(e.target.value) || 0 }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white h-12 px-4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Área Base (m²)
            </label>
            <input
              type="number"
              value={unitConfig.baseArea}
              onChange={(e) => setUnitConfig(prev => ({ ...prev, baseArea: parseInt(e.target.value) || 0 }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white h-12 px-4"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={generateUnits}
            disabled={!formData.numberOfFloors || !formData.numberOfUnits}
            className="w-full sm:w-auto px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Generar Unidades
          </button>
        </div>
      </div>

      {/* Units Preview */}
      {formData.units && formData.units.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Vista Previa de Unidades ({formData.units.length} unidades)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Unidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Piso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Dormitorios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Baños
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Área (m²)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Precio (USD)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {formData.units.slice(0, 10).map((unit) => (
                  <tr key={unit.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {unit.unitNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {unit.floor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {unit.bedrooms}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {unit.bathrooms}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {unit.area}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ${unit.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        unit.status === "available" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : unit.status === "sold"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      }`}>
                        {unit.status === "available" ? "Disponible" : 
                         unit.status === "sold" ? "Vendido" : "Reservado"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {formData.units.length > 10 && (
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Mostrando las primeras 10 unidades de {formData.units.length} totales
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Características del Edificio</h3>
        <div>
          <label htmlFor="buildingFeatures" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción Detallada
          </label>
          <textarea
            id="buildingFeatures"
            name="buildingFeatures"
            rows={6}
            value={formData.buildingFeatures}
            onChange={handleChange}
            placeholder="Lista de características del edificio (estacionamiento, seguridad, etc.)"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-4 ${
              errors.buildingFeatures ? "border-red-500" : ""
            }`}
          />
          {errors.buildingFeatures && <p className="mt-1 text-sm text-red-500">{errors.buildingFeatures}</p>}
        </div>
      </div>
    </div>
  );
} 