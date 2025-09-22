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
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔍 DEBUG: Fetch attempt ${attempt}/${retries} for URL: ${url}`);
      
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });
      
      console.log(`🔍 DEBUG: Response status: ${response.status} for attempt ${attempt}`);
      
      // Si la petición fue exitosa, retornar la respuesta
      if (response.ok) {
        console.log(`✅ DEBUG: Successful fetch on attempt ${attempt}`);
        return response;
      }
      
      // Si no es un error de servidor (4xx, 5xx), no reintentar
      if (response.status >= 400 && response.status < 500) {
        console.log(`❌ DEBUG: Client error ${response.status}, not retrying`);
        return response;
      }
      
      // Si es el último intento, retornar la respuesta aunque haya fallado
      if (attempt === retries) {
        console.log(`❌ DEBUG: Max retries reached, returning failed response`);
        return response;
      }
      
      console.log(`⚠️ DEBUG: Retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
    } catch (error) {
      console.error(`❌ DEBUG: Network error on attempt ${attempt}:`, error);
      
      // Si es el último intento, lanzar el error
      if (attempt === retries) {
        throw new Error(`Failed to fetch after ${retries} attempts: ${error}`);
      }
      
      console.log(`⚠️ DEBUG: Retrying in ${retryDelay}ms...`);
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
