/**
 * Sistema de versionado para forzar actualización automática
 * Detecta cuando hay nueva versión y recarga automáticamente
 */

const CURRENT_VERSION = '2.0.0'; // Incrementar cuando haya cambios críticos
const VERSION_KEY = 'app_version';
const LAST_CHECK_KEY = 'last_version_check';
const CHECK_INTERVAL = 60000; // Verificar cada 60 segundos

export function checkAndUpdateVersion(): void {
  if (typeof window === 'undefined') return;

  const storedVersion = localStorage.getItem(VERSION_KEY);
  const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
  const now = Date.now();

  // Si la versión almacenada es diferente, limpiar y recargar
  if (storedVersion && storedVersion !== CURRENT_VERSION) {
    
    // Limpiar solo datos de app, mantener preferencias básicas
    const keysToKeep = ['theme', 'language'];
    const backup: Record<string, string> = {};
    
    keysToKeep.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) backup[key] = value;
    });
    
    localStorage.clear();
    
    // Restaurar preferencias
    Object.entries(backup).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    
    // Forzar recarga completa sin cache
    window.location.reload();
    return;
  }

  // Si no hay versión almacenada, guardarla
  if (!storedVersion) {
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    localStorage.setItem(LAST_CHECK_KEY, now.toString());
    return;
  }

  // Verificación periódica (cada minuto)
  if (lastCheck && (now - parseInt(lastCheck)) < CHECK_INTERVAL) {
    return;
  }

  localStorage.setItem(LAST_CHECK_KEY, now.toString());
}

export function getCurrentVersion(): string {
  return CURRENT_VERSION;
}

export function forceUpdate(): void {
  localStorage.removeItem(VERSION_KEY);
  checkAndUpdateVersion();
}

