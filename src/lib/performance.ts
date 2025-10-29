/**
 * Performance Monitoring
 * Métricas de Web Vitals y performance del sitio
 */

import type { Metric } from 'web-vitals';

// Tipos de métricas
export type MetricName = 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP';

interface PerformanceMetric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
}

/**
 * Determinar el rating de una métrica según los umbrales de Web Vitals
 */
function getMetricRating(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<MetricName, { good: number; poor: number }> = {
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    FID: { good: 100, poor: 300 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  };
  
  const threshold = thresholds[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Enviar métricas al backend
 */
async function sendMetric(metric: PerformanceMetric) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('📊 Performance Metric:', metric);
    return;
  }
  
  try {
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
      keepalive: true, // Asegurar que se envíe incluso si la página se cierra
    });
  } catch (error) {
    console.error('Failed to send metric:', error);
  }
}

/**
 * Handler para métricas de Web Vitals
 */
export function reportWebVitals(metric: Metric) {
  const performanceMetric: PerformanceMetric = {
    name: metric.name as MetricName,
    value: metric.value,
    rating: getMetricRating(metric.name as MetricName, metric.value),
    timestamp: Date.now(),
    url: window.location.href,
  };
  
  // Enviar al backend
  sendMetric(performanceMetric);
  
  // También enviar a Google Analytics si está disponible
  if ((window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

/**
 * Medir tiempo de carga de recursos específicos
 */
export function measureResourceTiming(resourceName: string) {
  if (typeof window === 'undefined') return;
  
  const perfEntries = performance.getEntriesByName(resourceName);
  if (perfEntries.length > 0) {
    const entry = perfEntries[0] as PerformanceResourceTiming;
    console.log(`⏱️ ${resourceName}: ${entry.duration.toFixed(2)}ms`);
    
    return {
      duration: entry.duration,
      size: entry.transferSize,
      type: entry.initiatorType,
    };
  }
}

/**
 * Medir tiempo de API calls
 */
export function measureApiCall(endpoint: string, startTime: number) {
  const duration = Date.now() - startTime;
  const rating = duration < 200 ? 'good' : duration < 500 ? 'needs-improvement' : 'poor';
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 API Call [${rating}]: ${endpoint} - ${duration}ms`);
  }
  
  // Enviar métrica
  sendMetric({
    name: 'TTFB',
    value: duration,
    rating,
    timestamp: Date.now(),
    url: endpoint,
  });
  
  return duration;
}

/**
 * Observar Long Tasks (tareas que bloquean el thread principal)
 */
export function observeLongTasks() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;
  
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.warn('⚠️ Long Task detected:', {
          duration: entry.duration,
          startTime: entry.startTime,
        });
        
        // Si la tarea toma más de 100ms, es un problema
        if (entry.duration > 100) {
          sendMetric({
            name: 'FID',
            value: entry.duration,
            rating: 'poor',
            timestamp: Date.now(),
            url: window.location.href,
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    // PerformanceObserver no soportado
  }
}

/**
 * Medir First Input Delay manualmente
 */
export function measureFirstInput() {
  if (typeof window === 'undefined') return;
  
  let firstInputDelay = 0;
  
  const observer = new PerformanceObserver((list) => {
    const firstInput = list.getEntries()[0] as PerformanceEventTiming;
    firstInputDelay = firstInput.processingStart - firstInput.startTime;
    
    console.log('👆 First Input Delay:', firstInputDelay.toFixed(2) + 'ms');
  });
  
  try {
    observer.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    // No soportado
  }
}

/**
 * Inicializar monitoreo de performance
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;
  
  // Observar Long Tasks
  observeLongTasks();
  
  // Medir First Input
  measureFirstInput();
  
  // Log de Navigation Timing
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    console.log('📊 Navigation Timing:', {
      'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
      'TCP Connection': perfData.connectEnd - perfData.connectStart,
      'TLS Negotiation': perfData.requestStart - perfData.secureConnectionStart,
      'Time to First Byte': perfData.responseStart - perfData.requestStart,
      'Download': perfData.responseEnd - perfData.responseStart,
      'DOM Processing': perfData.domComplete - perfData.domInteractive,
      'Total Load Time': perfData.loadEventEnd - perfData.fetchStart,
    });
  });
  
  console.log('✅ Performance monitoring inicializado');
}

