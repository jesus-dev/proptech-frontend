"use client";
import React, { useState } from "react";
import CurrencySelector from "@/components/ui/CurrencySelector";
import CurrencySymbol from "@/components/ui/CurrencySymbol";
import { CurrencyCode } from "@/lib/utils";
import FloorPlansStep, { FloorPlanForm } from "./steps/FloorPlansStep";

export default function PropertyFormDemo() {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    currency: "USD" as CurrencyCode,
    type: "",
    status: "",
    floorPlans: [] as FloorPlanForm[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCurrencyChange = (currencyId: number, currencyCode: string) => {
    setFormData(prev => ({
      ...prev,
      currency: currencyCode as CurrencyCode
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Demo: Formulario de Propiedad con Selector de Moneda</h2>
      <div className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título de la Propiedad
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="Ej: Casa moderna en Villa Morra"
          />
        </div>
        {/* Precio y Moneda */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">
                <CurrencySymbol currencyCode={formData.currency} />
              </span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <CurrencySelector
              selectedCurrencyId={1}
              onCurrencyChange={handleCurrencyChange}
              className="w-full"
            />
          </div>
        </div>
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Propiedad
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">Seleccionar tipo</option>
            <option value="casa">Casa</option>
            <option value="departamento">Departamento</option>
            <option value="ph">PH</option>
            <option value="loft">Loft</option>
            <option value="casa-quinta">Casa Quinta</option>
          </select>
        </div>
        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">Seleccionar estado</option>
            <option value="active">Activa</option>
            <option value="inactive">Inactiva</option>
            <option value="for-sale">En Venta</option>
            <option value="for-rent">En Alquiler</option>
          </select>
        </div>
        {/* Step: Planos de planta */}
        <FloorPlansStep
          floorPlans={formData.floorPlans}
          setFloorPlans={plans => setFormData(prev => ({ ...prev, floorPlans: plans }))}
        />
        {/* Resumen */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Resumen de la Propiedad</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Título:</strong> {formData.title || 'No especificado'}</p>
            <p><strong>Precio:</strong> {formData.price ? `${formData.price} ${formData.currency}` : 'No especificado'}</p>
            <p><strong>Tipo:</strong> {formData.type || 'No especificado'}</p>
            <p><strong>Estado:</strong> {formData.status || 'No especificado'}</p>
            <p><strong>Planos de planta:</strong> {formData.floorPlans.length} plano(s)</p>
          </div>
        </div>
      </div>
    </div>
  );
} 