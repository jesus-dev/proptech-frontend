/**
 * Monitoring & Error Tracking Service
 * Configuración centralizada para tracking de errores y performance
 */

import { ErrorType, errorService } from '@/services/errorService';

// Configuración de Sentry (cuando se instale)
export const initMonitoring = () => {
  if (typeof window === 'undefined') return;
  
  // Configurar Sentry si está disponible
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log('✅ Monitoring inicializado');
  }
  
  // Capturar errores no manejados
  window.addEventListener('error', (event) => {
    console.error('❌ Uncaught error:', event.error);
    
    // Enviar a servicio de logging
    if (process.env.NODE_ENV === 'production') {
      logError({
        type: ErrorType.UNKNOWN_ERROR,
        message: event.error?.message || 'Unknown error',
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    }
  });
  
  // Capturar promesas rechazadas
  window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
    
    if (process.env.NODE_ENV === 'production') {
      logError({
        type: ErrorType.UNKNOWN_ERROR,
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    }
  });
};

interface ErrorLog {
  type: ErrorType;
  message: string;
  stack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Función para enviar errores al backend
const logError = async (error: ErrorLog) => {
  try {
    // En producción, enviar al backend
    await fetch('/api/logs/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error),
    });
  } catch (e) {
    // Si falla el logging, al menos mostrar en consola
    console.error('Failed to log error:', e);
  }
};

// Función para capturar errores manualmente
export const captureError = (error: Error | string, context?: Record<string, any>) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;
  
  logError({
    type: ErrorType.UNKNOWN_ERROR,
    message: errorMessage,
    stack: errorStack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    metadata: context,
  });
};

// Función para capturar información adicional
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`[${level.toUpperCase()}] ${message}`);
    // Aquí se puede integrar con servicios externos
  }
};

