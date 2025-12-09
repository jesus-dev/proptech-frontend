/**
 * Logger utility para producción
 * En desarrollo: muestra todos los logs
 * En producción: solo muestra errores y warnings
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (isDevelopment) {
      return true; // En desarrollo, mostrar todo
    }
    
    if (isProduction) {
      // En producción, solo errores y warnings
      return level === 'error' || level === 'warn';
    }
    
    return true; // Por defecto, mostrar todo
  }

  log(...args: any[]): void {
    if (this.shouldLog('log')) {
      console.log(...args);
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(...args);
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...args);
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(...args);
    }
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(...args);
    }
  }
}

export const logger = new Logger();

// Exportar funciones individuales para uso directo
export const log = (...args: any[]) => logger.log(...args);
export const info = (...args: any[]) => logger.info(...args);
export const warn = (...args: any[]) => logger.warn(...args);
export const error = (...args: any[]) => logger.error(...args);
export const debug = (...args: any[]) => logger.debug(...args);

