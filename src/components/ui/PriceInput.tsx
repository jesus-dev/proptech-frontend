"use client";

import React from "react";
import CurrencySymbol from "./CurrencySymbol";

interface PriceInputProps {
  value: number | string;
  onChange: (value: number) => void;
  currencyCode?: string;
  currencyId?: number;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
}

// Formatea el precio con puntos como separadores de miles
function formatPriceWithDots(value: string | number): string {
  const num = typeof value === 'number' ? value : value.replace(/\D/g, '');
  if (!num || num === '0') return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Limpia el precio dejando solo números
function cleanPrice(value: string): string {
  return value.replace(/\D/g, '');
}

export default function PriceInput({
  value,
  onChange,
  currencyCode,
  currencyId,
  label,
  placeholder = "0",
  required = false,
  error,
  className = "",
  disabled = false
}: PriceInputProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0;
  const displayValue = formatPriceWithDots(numericValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = cleanPrice(e.target.value);
    const numValue = cleaned ? parseFloat(cleaned) : 0;
    onChange(numValue);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {currencyCode && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
            <CurrencySymbol currencyCode={currencyCode} />
          </div>
        )}
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${currencyCode ? 'pl-12' : 'pl-3'} pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
