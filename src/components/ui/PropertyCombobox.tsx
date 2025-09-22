"use client";
import React, { useEffect, useState } from "react";
import { Combobox } from '@headlessui/react';
import type { Property } from '@/app/(proptech)/properties/components/types';
import { propertyService } from '@/app/(proptech)/properties/services/propertyService';
import { BuildingIcon } from "@/icons";
interface PropertyComboboxProps {
  value: Property | null;
  onChange: (property: Property | null) => void;
  required?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
}

export default function PropertyCombobox({ 
  value, 
  onChange, 
  required = false, 
  className = "",
  label = "Propiedad",
  placeholder = "Buscar y seleccionar propiedad..."
}: PropertyComboboxProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    propertyService.getAllProperties().then((response) => {
      // Manejar tanto arrays directos como objetos con estructura paginada
      if (Array.isArray(response)) {
        setProperties(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setProperties(response.data);
      } else {
        setProperties([]);
      }
    }).catch((error) => {
      console.error('Error loading properties:', error);
      setProperties([]);
    });
  }, []);

  const filteredProperties = query === ""
    ? (Array.isArray(properties) ? properties : [])
    : (Array.isArray(properties) ? properties.filter(p =>
        `${p.title} ${p.address} ${p.city}`.toLowerCase().includes(query.toLowerCase())
      ) : []);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Combobox value={value} onChange={onChange} nullable>
        <div className="relative">
          <Combobox.Input
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            displayValue={(p: Property|null) => p ? `${p.title} (${p.city})` : ""}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <BuildingIcon className="h-5 w-5 text-gray-400" />
          </Combobox.Button>
          <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            {filteredProperties.length === 0 && (
              <div className="text-gray-500 px-4 py-3 text-center">No se encontraron propiedades disponibles.</div>
            )}
            {filteredProperties.map((p) => (
              <Combobox.Option key={p.id} value={p} className={({ active }) => `cursor-pointer select-none px-4 py-3 ${active ? 'bg-brand-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{p.title}</h3>
                    <p className="text-sm text-gray-600">{p.address}, {p.city}</p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      {p.bedrooms && <span>🛏️ {p.bedrooms} dorm.</span>}
                      {p.bathrooms && <span>🚿 {p.bathrooms} baños</span>}
                      {p.area && <span>📐 {p.area}m²</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-brand-600">{p.price?.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{p.type}</div>
                  </div>
                </div>
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
} 