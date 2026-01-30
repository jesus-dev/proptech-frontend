"use client";

import React, { useState, useEffect } from "react";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { currencyService } from "@/app/(proptech)/catalogs/currencies/services/currencyService";
import { Currency } from "@/app/(proptech)/catalogs/currencies/services/types";

interface CurrencySelectorProps {
  selectedCurrencyId?: number;
  onCurrencyChange: (currencyId: number, currencyCode: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function CurrencySelector({
  selectedCurrencyId,
  onCurrencyChange,
  className = "",
  disabled = false
}: CurrencySelectorProps) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      const activeCurrencies = await currencyService.getActive();
      setCurrencies(activeCurrencies || []);
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      const code = error?.code;
      console.error("❌ [CurrencySelector] Error loading currencies:", { status, data, code, message: error?.message }, error);
      setCurrencies([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedCurrencyData = currencies.find(c => c.id === selectedCurrencyId);

  const handleCurrencySelect = (currency: Currency) => {
    onCurrencyChange(currency.id, currency.code);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 animate-pulse">
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

      if (currencies.length === 0) {
        return (
          <div className={`relative ${className}`}>
            <div className="w-full min-h-12 px-3 py-2 border-2 border-red-300 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-700 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-red-600 dark:text-red-400 text-sm">⚠️ No hay monedas disponibles. Revisar conexión con el backend.</span>
              <button
                type="button"
                onClick={() => loadCurrencies()}
                disabled={loading}
                className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50"
              >
                Reintentar
              </button>
            </div>
          </div>
        );
      }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          console.log("🔽 Click en selector de moneda, isOpen:", !isOpen);
          !disabled && setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={`w-full h-12 px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
          disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {selectedCurrencyData ? (
              <>
                <span className="text-lg">{selectedCurrencyData.symbol}</span>
                <span className="font-medium dark:text-white">{selectedCurrencyData.code}</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">({selectedCurrencyData.name})</span>
              </>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">Seleccionar moneda</span>
            )}
          </div>
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl max-h-60 overflow-auto">
          {currencies.length > 0 ? (
            currencies.map((currency) => (
              <button
                key={currency.id}
                type="button"
                onClick={() => handleCurrencySelect(currency)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none transition-colors ${
                  selectedCurrencyId === currency.id ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{currency.symbol}</span>
                  <span className="font-medium dark:text-white">{currency.code}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">({currency.name})</span>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
              No hay monedas disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente para mostrar solo el símbolo de la moneda
export function CurrencySymbol({ currency }: { currency: string }) {
  return (
    <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium">
      {currency}
    </span>
  );
}

// Componente para mostrar información completa de la moneda
export function CurrencyInfo({ currency }: { currency: string }) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-lg font-semibold">{currency}</span>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <div>{currency}</div>
        <div className="text-xs">{currency}</div>
      </div>
    </div>
  );
} 