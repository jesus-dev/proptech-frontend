'use client';

import { useEffect } from 'react';
import { checkAndUpdateVersion } from '@/lib/version-check';

/**
 * Componente que verifica la versión de la app y fuerza actualización si es necesaria
 * Se ejecuta automáticamente en cada carga
 */
export default function VersionChecker() {
  useEffect(() => {
    // Verificar versión inmediatamente
    checkAndUpdateVersion();
    
    // Verificar periódicamente mientras la app está abierta
    const interval = setInterval(() => {
      checkAndUpdateVersion();
    }, 60000); // Cada minuto
    
    return () => clearInterval(interval);
  }, []);
  
  return null; // Este componente no renderiza nada
}

