// Utilidades para manejar peticiones HTTP
import { config } from '@/config/environment';

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

/**
 * Función mejorada para hacer peticiones HTTP con retry automático
 */
export async function fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
  const { retries = 5, retryDelay = 500, ...fetchOptions } = options; // 5 retries, más rápido
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });
      
      
      // Si la petición fue exitosa, retornar la respuesta
      if (response.ok) {
        return response;
      }
      
      // Si no es un error de servidor (4xx, 5xx), no reintentar
      if (response.status >= 400 && response.status < 500) {
        return response;
      }
      
      // Si es el último intento, retornar la respuesta aunque haya fallado
      if (attempt === retries) {
        return response;
      }
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
    } catch (error) {
      console.error(`❌ DEBUG: Network error on attempt ${attempt}:`, error);
      
      // Si es el último intento, lanzar el error
      if (attempt === retries) {
        throw new Error(`Failed to fetch after ${retries} attempts: ${error}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw new Error(`Failed to fetch after ${retries} attempts`);
}

/**
 * Función para construir URLs de la API
 */
export function buildApiUrl(endpoint: string): string {
  let baseUrl = config.API_BASE_URL;
  
  // Clean up malformed URLs that might have double concatenation
  if (baseUrl.includes('https://proptech.com.py/https/api.proptech.com.py')) {
    baseUrl = 'https://api.proptech.com.py';
  } else if (baseUrl.includes('http://proptech.com.py/http/api.proptech.com.py')) {
    baseUrl = 'http://api.proptech.com.py';
  }
  
  // Asegurar que la URL base termine con / y el endpoint no empiece con /
  const cleanBaseUrl = baseUrl.endsWith('/') 
    ? baseUrl.slice(0, -1) 
    : baseUrl;
  
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${cleanBaseUrl}${cleanEndpoint}`;
}

/**
 * Función para manejar errores de API de forma consistente
 */
export function handleApiError(error: unknown, context: string): never {
  console.error(`❌ ERROR in ${context}:`, error);
  
  if (error instanceof Error) {
    throw new Error(`${context}: ${error.message}`);
  }
  
  throw new Error(`${context}: Unknown error occurred`);
}
