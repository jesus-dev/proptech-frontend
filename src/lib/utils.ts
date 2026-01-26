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

// Función para generar slug a partir de texto (para URLs)
export function createSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD') // Normalizar caracteres unicode (separar acentos)
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .replace(/^-|-$/g, '') // Remover guiones al inicio y final
    .trim();
}

// Función para generar slug de profesional (nombre + apellido + ID para unicidad)
export function createProfessionalSlug(professional: { firstName: string; lastName: string; id: number }): string {
  const nameSlug = createSlug(`${professional.firstName} ${professional.lastName}`);
  return `${nameSlug}-${professional.id}`;
}

// Función para generar slug de agente (nombre + apellido + ID para unicidad)
export function createAgentSlug(agent: { nombre?: string; apellido?: string; firstName?: string; lastName?: string; name?: string; id: number | string }): string {
  const firstName = agent.nombre || agent.firstName || '';
  const lastName = agent.apellido || agent.lastName || '';
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : (agent.name || '');
  const nameSlug = createSlug(fullName);
  const id = typeof agent.id === 'string' ? parseInt(agent.id, 10) : agent.id;
  return `${nameSlug}-${id}`;
}

// Función para extraer ID de un slug (para compatibilidad con backend)
export function extractIdFromSlug(slugOrId: string): number | null {
  // Si es solo un número, es un ID directo (compatibilidad)
  if (/^\d+$/.test(slugOrId)) {
    return Number(slugOrId);
  }
  
  // Si tiene formato slug-id, extraer el ID del final
  const parts = slugOrId.split('-');
  const lastPart = parts[parts.length - 1];
  
  if (/^\d+$/.test(lastPart)) {
    return Number(lastPart);
  }
  
  return null;
}

/**
 * Obtiene la URL COMPLETA de la imagen de perfil del usuario/agente de forma centralizada.
 * Prioriza photoUrl del usuario porque el backend sincroniza automáticamente con el agente.
 * Esta función construye la URL completa usando getProfilePhotoUrl internamente.
 * 
 * @param user - Objeto usuario que puede tener photoUrl y/o agent
 * @param agent - Objeto agente (opcional, para compatibilidad con código legacy)
 * @returns URL completa de la imagen o null si no existe
 */
// Función auxiliar para construir URL de imagen (evita dependencia circular)
function buildImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  
  // Si ya es una URL completa, retornarla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si es un blob URL, retornarlo tal cual
  if (imagePath.startsWith('blob:')) {
    return imagePath;
  }
  
  // Construir URL completa
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 
    (process.env.NODE_ENV === 'production' ? 'https://api.proptech.com.py' : 'http://localhost:8080');
  
  // Asegurar que no haya doble concatenación
  if (imagePath.startsWith('/') && apiBaseUrl.endsWith('/')) {
    return `${apiBaseUrl.slice(0, -1)}${imagePath}`;
  }
  
  return `${apiBaseUrl}${imagePath}`;
}

export function getUserProfileImage(
  user?: { photoUrl?: string | null; agent?: { fotoPerfilUrl?: string | null } } | null,
  agent?: { fotoPerfilUrl?: string | null; photo?: string | null; avatar?: string | null } | null
): string | null {
  // Prioridad 1: photoUrl del usuario (fuente de verdad - el backend sincroniza con agente)
  if (user?.photoUrl && user.photoUrl.trim()) {
    const url = buildImageUrl(user.photoUrl.trim());
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 getUserProfileImage - Prioridad 1 (user.photoUrl):', { input: user.photoUrl, output: url });
    }
    return url;
  }
  
  // Prioridad 2: fotoPerfilUrl del agente asociado al usuario
  if (user?.agent?.fotoPerfilUrl && user.agent.fotoPerfilUrl.trim()) {
    const url = buildImageUrl(user.agent.fotoPerfilUrl.trim());
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 getUserProfileImage - Prioridad 2 (user.agent.fotoPerfilUrl):', { input: user.agent.fotoPerfilUrl, output: url });
    }
    return url;
  }
  
  // Prioridad 3: fotoPerfilUrl del agente pasado como parámetro
  if (agent?.fotoPerfilUrl && agent.fotoPerfilUrl.trim()) {
    const url = buildImageUrl(agent.fotoPerfilUrl.trim());
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 getUserProfileImage - Prioridad 3 (agent.fotoPerfilUrl):', { input: agent.fotoPerfilUrl, output: url });
    }
    return url;
  }
  
  // Prioridad 4: Campos legacy del agente (photo)
  if (agent?.photo && agent.photo.trim()) {
    const url = buildImageUrl(agent.photo.trim());
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 getUserProfileImage - Prioridad 4 (agent.photo):', { input: agent.photo, output: url });
    }
    return url;
  }
  
  // Prioridad 5: avatar del agente
  if (agent?.avatar && agent.avatar.trim()) {
    const url = buildImageUrl(agent.avatar.trim());
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 getUserProfileImage - Prioridad 5 (agent.avatar):', { input: agent.avatar, output: url });
    }
    return url;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️ getUserProfileImage - No se encontró foto:', { user, agent });
  }
  
  return null;
} 