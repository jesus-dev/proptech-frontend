"use client";

import React from "react";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";
import CurrencySelector from "@/components/ui/CurrencySelector";
import CurrencySymbol from "@/components/ui/CurrencySymbol";

interface GeneralInfoStepProps {
  formData: DevelopmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
}

export default function GeneralInfoStep({ formData, handleChange, errors }: GeneralInfoStepProps) {
  return (
    <div className="space-y-6 GeneralInfoStep w-full col-span-full min-w-0">
      {/* Agrupar Título y fila de Precio/Moneda/Estado */}
      <div className="flex flex-col gap-0 w-full">
        {/* Título en una sola línea */}
        <div className="mb-2 w-full">
          <label htmlFor="title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
            Título
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`block w-full h-12 rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold px-3 ${
              errors.title ? "border-red-500" : ""
            }`}
            style={{ minWidth: 0 }}
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>
        {/* Fila de Precio, Moneda y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
              Precio
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
                <CurrencySymbol currencyCode={formData.currency} />
              </span>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price as any}
                onChange={handleChange}
                className={`w-full h-12 pl-12 pr-3 rounded-md border shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold ${
                  errors.price ? "border-red-500" : "border-gray-400"
                }`}
              />
            </div>
            {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
          </div>
          {/* Currency Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">
              Moneda <span className="text-red-500">*</span>
            </label>
            <CurrencySelector
              selectedCurrencyId={formData.currencyId}
              onCurrencyChange={(currencyId, currencyCode) => {
                handleChange({ target: { name: 'currencyId', value: currencyId } } as any);
                handleChange({ target: { name: 'currency', value: currencyCode } } as any);
              }}
              className="w-full h-12"
            />
            {errors.currency && <p className="mt-1 text-sm text-red-500">{errors.currency}</p>}
          </div>
          {/* Estado (select) */}
          <div>
            <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">
              Estado
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full h-12 rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold ${
                errors.status ? "border-red-500" : ""
              }`}
            >
              <option value="available">Disponible</option>
              <option value="sold">Vendido</option>
              <option value="reserved">Reservado</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
          </div>
        </div>
      </div>
      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
            errors.description ? "border-red-500" : ""
          }`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>
      {/* Dirección, Ciudad, Provincia, Código Postal */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="address" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            Dirección
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
              errors.address ? "border-red-500" : ""
            }`}
          />
          {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            Ciudad
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
              errors.city ? "border-red-500" : ""
            }`}
          />
          {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            Provincia
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
              errors.state ? "border-red-500" : ""
            }`}
          />
          {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
        </div>
        <div>
          <label htmlFor="zip" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            Código Postal
          </label>
          <input
            type="text"
            id="zip"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white font-bold py-2 ${
              errors.zip ? "border-red-500" : ""
            }`}
          />
          {errors.zip && <p className="mt-1 text-sm text-red-500">{errors.zip}</p>}
        </div>
      </div>
    </div>
  );
} 