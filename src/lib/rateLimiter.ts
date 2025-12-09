/**
 * Rate Limiter simple para prevenir spam en formularios
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Verifica si se puede realizar una acción
   * @param key Identificador único (ej: email, IP, etc.)
   * @returns true si se puede realizar, false si se excedió el límite
   */
  canProceed(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      // Primera vez, permitir
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    // Si el tiempo de ventana expiró, resetear
    if (now > entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    // Si ya alcanzó el límite, denegar
    if (entry.count >= this.maxRequests) {
      return false;
    }

    // Incrementar contador
    entry.count++;
    this.limits.set(key, entry);
    return true;
  }

  /**
   * Obtiene el tiempo restante hasta que se pueda intentar de nuevo
   * @param key Identificador único
   * @returns Tiempo en milisegundos, o 0 si se puede intentar ahora
   */
  getTimeUntilReset(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) {
      return 0;
    }

    const now = Date.now();
    const remaining = entry.resetTime - now;
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Limpia entradas expiradas (para evitar memory leak)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Resetea el contador para una clave específica
   */
  reset(key: string): void {
    this.limits.delete(key);
  }
}

// Instancia global para el formulario de registro
export const registerRateLimiter = new RateLimiter(3, 60000); // 3 intentos por minuto

// Instancia para búsquedas
export const searchRateLimiter = new RateLimiter(10, 10000); // 10 búsquedas por 10 segundos

// Limpiar entradas expiradas cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    registerRateLimiter.cleanup();
    searchRateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

