"use client";

import React, { useState, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { currencyService } from "@/app/(proptech)/catalogs/currencies/services/currencyService";
import { Currency } from "@/app/(proptech)/catalogs/currencies/services/types";

interface CurrencyCodeSelectorProps {
  selectedCurrencyCode?: string;
  onCurrencyChange: (currencyCode: string) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function CurrencyCodeSelector({
  selectedCurrencyCode,
  onCurrencyChange,
  className = "",
  disabled = false,
  required = false
}: CurrencyCodeSelectorProps) {
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
    } catch (error) {
      console.error("❌ Error loading currencies:", error);
      setCurrencies([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedCurrency = currencies.find(c => c.code === selectedCurrencyCode);

  const handleCurrencySelect = (currency: Currency) => {
    onCurrencyChange(currency.code);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (currencies.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-12 px-3 py-2 border-2 border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center">
          <span className="text-red-600 dark:text-red-400 text-sm">⚠️ No hay monedas disponibles</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-12 px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500'
        } ${required && !selectedCurrencyCode ? 'border-red-500' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {selectedCurrency ? (
              <>
                <span className="text-lg">{selectedCurrency.symbol}</span>
                <span className="font-medium dark:text-white">{selectedCurrency.code}</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">({selectedCurrency.name})</span>
              </>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">Seleccionar moneda</span>
            )}
          </div>
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </div>
      </button>

      {isOpen && !disabled && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl max-h-60 overflow-auto">
            {currencies.length > 0 ? (
              currencies.map((currency) => (
                <button
                  key={currency.id}
                  type="button"
                  onClick={() => handleCurrencySelect(currency)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none transition-colors ${
                    selectedCurrencyCode === currency.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : ''
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
        </>
      )}
    </div>
  );
}

