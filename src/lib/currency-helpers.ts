import { currencyService } from "@/app/(proptech)/catalogs/currencies/services/currencyService";
import { Currency } from "@/app/(proptech)/catalogs/currencies/services/types";

// Cache de monedas para evitar múltiples llamadas
let currenciesCache: Currency[] | null = null;
let currenciesCachePromise: Promise<Currency[]> | null = null;

/**
 * Obtiene todas las monedas activas desde el catálogo
 * Usa cache para evitar múltiples llamadas a la API
 */
export async function getActiveCurrencies(): Promise<Currency[]> {
  if (currenciesCache) {
    return currenciesCache;
  }

  if (currenciesCachePromise) {
    return currenciesCachePromise;
  }

  currenciesCachePromise = currencyService.getActive()
    .then(currencies => {
      currenciesCache = currencies;
      return currencies;
    })
    .catch(error => {
      console.error("Error loading currencies:", error);
      currenciesCachePromise = null;
      return [];
    });

  return currenciesCachePromise;
}

/**
 * Obtiene el símbolo de una moneda por su código
 * Si no se encuentra, retorna el código como fallback
 */
export async function getCurrencySymbol(currencyCode: string): Promise<string> {
  const currencies = await getActiveCurrencies();
  const currency = currencies.find(c => c.code === currencyCode);
  return currency?.symbol || currencyCode;
}

/**
 * Obtiene información completa de una moneda por su código
 */
export async function getCurrencyInfo(currencyCode: string): Promise<Currency | null> {
  const currencies = await getActiveCurrencies();
  return currencies.find(c => c.code === currencyCode) || null;
}

/**
 * Formatea un monto con el símbolo de moneda desde el catálogo
 */
export async function formatAmountWithCurrency(
  amount: number,
  currencyCode: string,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): Promise<string> {
  const currency = await getCurrencyInfo(currencyCode);
  const symbol = currency?.symbol || currencyCode;
  
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options || {};

  const formatted = amount.toLocaleString('es-PY', {
    minimumFractionDigits,
    maximumFractionDigits
  });

  return `${symbol}${formatted}`;
}

/**
 * Hook para usar en componentes React (versión síncrona con cache)
 * Retorna el símbolo de moneda si está en cache, sino retorna el código
 */
export function useCurrencySymbol(currencyCode: string | undefined): string {
  const [symbol, setSymbol] = React.useState<string>(currencyCode || '');

  React.useEffect(() => {
    if (!currencyCode) {
      setSymbol('');
      return;
    }

    getCurrencySymbol(currencyCode).then(setSymbol);
  }, [currencyCode]);

  return symbol;
}

// Importar React para el hook
import React from 'react';

/**
 * Formatea un monto con el símbolo de moneda (versión síncrona usando cache)
 * Si el cache no está disponible, usa el código de moneda como fallback
 */
export function formatAmountWithCurrencySync(
  amount: number,
  currencyCode: string,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options || {};

  const formatted = amount.toLocaleString('es-PY', {
    minimumFractionDigits,
    maximumFractionDigits
  });

  // Intentar obtener el símbolo del cache
  const currency = currenciesCache?.find(c => c.code === currencyCode);
  const symbol = currency?.symbol || currencyCode;

  return `${symbol}${formatted}`;
}

