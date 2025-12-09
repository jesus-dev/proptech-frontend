/**
 * Utilidades para retry logic con exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> & { onRetry?: (attempt: number, error: any) => void } = {
  maxRetries: 3,
  initialDelay: 1000, // 1 segundo
  maxDelay: 10000, // 10 segundos
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Timeout, Too Many Requests, Server Errors
};

/**
 * Calcula el delay para el siguiente intento usando exponential backoff
 */
function calculateDelay(attempt: number, options: Required<Omit<RetryOptions, 'onRetry'>>): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt);
  return Math.min(delay, options.maxDelay);
}

/**
 * Verifica si un error es retryable
 */
function isRetryable(error: any, retryableStatuses: number[]): boolean {
  // Errores de red (sin response) siempre son retryable
  if (!error.response) {
    return true;
  }

  const status = error.response?.status;
  return status ? retryableStatuses.includes(status) : false;
}

/**
 * Ejecuta una función con retry logic y exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Si no es retryable o es el último intento, lanzar el error
      if (!isRetryable(error, opts.retryableStatuses) || attempt === opts.maxRetries) {
        throw error;
      }

      // Calcular delay y esperar
      const delay = calculateDelay(attempt, opts);
      
      if (opts.onRetry) {
        opts.onRetry(attempt + 1, error);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Crea una función con retry pre-configurado
 */
export function createRetryableFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: Parameters<T>) => {
    return withRetry(() => fn(...args), options);
  }) as T;
}

