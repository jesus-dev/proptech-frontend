"use client";

import React, { useState, useEffect } from "react";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";
import { getAllCities, City } from "@/app/(proptech)/catalogs/cities/services/cityService";
import ValidatedInput from "@/components/form/input/ValidatedInput";

interface GeneralInfoStepProps {
  formData: DevelopmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
}

export default function GeneralInfoStep({ formData, handleChange, errors }: GeneralInfoStepProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const citiesData = await getAllCities();
        setCities(citiesData.filter(city => city.active !== false));
      } catch (error) {
        console.error('Error loading cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, []);

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <ValidatedInput
          type="text"
          id="title"
          name="title"
          label="Título"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required={true}
        />
      </div>

      {/* Estado */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Estado
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.status ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="available">Disponible</option>
          <option value="sold">Vendido</option>
          <option value="reserved">Reservado</option>
        </select>
        {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

      {/* Dirección y Ciudad */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <ValidatedInput
            type="text"
            id="address"
            name="address"
            label="Dirección"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            required={true}
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ciudad <span className="text-red-500">*</span>
          </label>
          <select
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={loadingCities}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.city ? "border-red-500" : "border-gray-300"
            } ${loadingCities ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <option value="">Seleccione una ciudad</option>
            {cities.map((city) => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
          {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
        </div>
      </div>
    </div>
  );
} 