// Configuración centralizada de monedas
export const SUPPORTED_CURRENCIES = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dólar Estadounidense',
    locale: 'en-US',
    position: 'before' as const
  },
  ARS: {
    code: 'ARS',
    symbol: '$',
    name: 'Peso Argentino',
    locale: 'es-AR',
    position: 'before' as const
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'es-ES',
    position: 'before' as const
  },
  PYG: {
    code: 'PYG',
    symbol: '₲',
    name: 'Guaraní Paraguayo',
    locale: 'es-PY',
    position: 'before' as const
  },
  MXN: {
    code: 'MXN',
    symbol: '$',
    name: 'Peso Mexicano',
    locale: 'es-MX',
    position: 'before' as const
  }
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

// Función unificada para formatear precios en cualquier moneda
export function formatPrice(price: number, currency: CurrencyCode = 'USD', options?: {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSymbol?: boolean;
}): string {
  const currencyConfig = SUPPORTED_CURRENCIES[currency];
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    showSymbol = true
  } = options || {};

  try {
    const formatter = new Intl.NumberFormat(currencyConfig.locale, {
      style: 'currency',
      currency: currencyConfig.code,
      minimumFractionDigits,
      maximumFractionDigits,
    });

    let formatted = formatter.format(price);
    
    // Si no queremos mostrar el símbolo, lo removemos
    if (!showSymbol) {
      formatted = formatted.replace(/[^\d,.-]/g, '').trim();
    }

    return formatted;
  } catch (error) {
    // Fallback si hay error en el formateo
    const symbol = showSymbol && currencyConfig ? currencyConfig.symbol : '';
    const locale = currencyConfig ? currencyConfig.locale : 'en-US';
    return `${symbol}${price.toLocaleString(locale, {
      minimumFractionDigits,
      maximumFractionDigits
    })}`;
  }
}

// Función para obtener solo el símbolo de la moneda
export function getCurrencySymbol(currency: CurrencyCode): string {
  return SUPPORTED_CURRENCIES[currency].symbol;
}

// Función para obtener el nombre de la moneda
export function getCurrencyName(currency: CurrencyCode): string {
  return SUPPORTED_CURRENCIES[currency].name;
}

// Función para obtener todas las monedas disponibles
export function getAvailableCurrencies() {
  return Object.entries(SUPPORTED_CURRENCIES).map(([code, config]) => ({
    code: code as CurrencyCode,
    symbol: config.symbol,
    name: config.name
  }));
}

// Función para validar si una moneda es válida
export function isValidCurrency(currency: string): currency is CurrencyCode {
  return currency in SUPPORTED_CURRENCIES;
}

// Función para formatear rangos de precios
export function formatPriceRange(
  min: number, 
  max: number, 
  currency: CurrencyCode = 'USD',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  }
): string {
  const minFormatted = formatPrice(min, currency, options);
  const maxFormatted = formatPrice(max, currency, options);
  return `${minFormatted} - ${maxFormatted}`;
}

// Función para formatear precios con sufijo (ej: "por mes", "por noche")
export function formatPriceWithSuffix(
  price: number, 
  currency: CurrencyCode = 'USD', 
  suffix: string = '',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  }
): string {
  const formatted = formatPrice(price, currency, options);
  return suffix ? `${formatted} ${suffix}` : formatted;
}

// Formatea el precio con símbolo y código de moneda (ej: $84,618 USD, ₲1.000.000 PYG)
export function formatCurrency(
  price: number,
  currency: CurrencyCode | string = 'USD',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  // Normalizar la moneda a mayúsculas
  const normalizedCurrency = currency?.toString().toUpperCase() as CurrencyCode;
  
  // Validar que sea una moneda soportada
  const validCurrency = isValidCurrency(normalizedCurrency) ? normalizedCurrency : 'USD';
  
  // Log de debug si la moneda no es válida o falta
  if (process.env.NODE_ENV === 'development' && (!currency || !isValidCurrency(normalizedCurrency))) {
    console.warn(`⚠️ formatCurrency: moneda inválida o faltante`, {
      currencyReceived: currency,
      normalized: normalizedCurrency,
      usingFallback: validCurrency
    });
  }
  
  const formatted = formatPrice(price, validCurrency, {
    minimumFractionDigits: options?.minimumFractionDigits,
    maximumFractionDigits: options?.maximumFractionDigits,
    showSymbol: true
  });
  return `${formatted} ${validCurrency}`;
}

// Función para acceder de forma segura a elementos de arrays
export function safeArrayAccess<T>(array: T[], index: number, fallback: T | string = 'N/A'): T | string {
  if (!array || array.length === 0 || index >= array.length) {
    return fallback;
  }
  return array[index];
}

// Función para formatear precio de forma segura desde un array de propiedades
export function safeFormatPrice(
  properties: unknown[], 
  index: number, 
  fallback: string = 'Consultar'
): string {
  const property = safeArrayAccess(properties, index);
  if (typeof property === 'string' || !property || 
      !(property as any).price || !(property as any).currency) {
    return fallback;
  }
  return formatPrice((property as any).price, (property as any).currency, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 