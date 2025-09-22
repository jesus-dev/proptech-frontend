"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyCode, SUPPORTED_CURRENCIES, getAvailableCurrencies } from '@/lib/utils';

interface CurrencyContextType {
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (currency: CurrencyCode) => void;
  availableCurrencies: Array<{
    code: CurrencyCode;
    symbol: string;
    name: string;
  }>;
  isCurrencyLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
  defaultCurrency?: CurrencyCode;
}

export function CurrencyProvider({ 
  children, 
  defaultCurrency = 'USD' 
}: CurrencyProviderProps) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<CurrencyCode>(defaultCurrency);
  const [isCurrencyLoading, setIsCurrencyLoading] = useState(true);

  // Cargar moneda guardada en localStorage al inicializar
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && savedCurrency in SUPPORTED_CURRENCIES) {
      setSelectedCurrencyState(savedCurrency as CurrencyCode);
    }
    setIsCurrencyLoading(false);
  }, []);

  // Guardar moneda en localStorage cuando cambie
  const setSelectedCurrency = (currency: CurrencyCode) => {
    setSelectedCurrencyState(currency);
    localStorage.setItem('selectedCurrency', currency);
  };

  const availableCurrencies = getAvailableCurrencies();

  const value: CurrencyContextType = {
    selectedCurrency,
    setSelectedCurrency,
    availableCurrencies,
    isCurrencyLoading
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

// Hook para formatear precios con la moneda seleccionada
export function useFormattedPrice() {
  const { selectedCurrency } = useCurrency();
  
  return {
    formatPrice: (price: number, options?: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      showSymbol?: boolean;
    }) => {
      const { formatPrice } = require('@/lib/utils');
      return formatPrice(price, selectedCurrency, options);
    },
    formatPriceRange: (min: number, max: number, options?: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      showSymbol?: boolean;
    }) => {
      const { formatPriceRange } = require('@/lib/utils');
      return formatPriceRange(min, max, selectedCurrency, options);
    },
    formatPriceWithSuffix: (price: number, suffix: string = '', options?: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      showSymbol?: boolean;
    }) => {
      const { formatPriceWithSuffix } = require('@/lib/utils');
      return formatPriceWithSuffix(price, selectedCurrency, suffix, options);
    }
  };
} 