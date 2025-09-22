/**
 * Utilidades para formatear fechas en formato latino paraguayo
 */

/**
 * Formatea una fecha en formato latino paraguayo completo
 * Ejemplo: "15 de enero de 2024"
 */
export function formatDateLatino(dateString?: string | Date): string {
  if (!dateString) return "Por completar";
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleDateString('es-PY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formatea una fecha en formato latino paraguayo corto
 * Ejemplo: "15/01/2024"
 */
export function formatDateLatinoCorto(dateString?: string | Date): string {
  if (!dateString) return "Por completar";
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleDateString('es-PY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Formatea una fecha y hora en formato latino paraguayo
 * Ejemplo: "15 de enero de 2024, 14:30"
 */
export function formatDateTimeLatino(dateString?: string | Date): string {
  if (!dateString) return "Por completar";
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleString('es-PY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea una fecha para documentos legales
 * Ejemplo: "quince de enero del año dos mil veinticuatro"
 */
export function formatDateLegal(dateString?: string | Date): string {
  if (!dateString) return "Por completar";
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  
  const dayNames = [
    'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
    'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
    'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve', 'treinta', 'treinta y uno'
  ];
  
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  const yearText = year.toString().split('').map(digit => {
    const digitNames = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    return digitNames[parseInt(digit)];
  }).join(' ');
  
  return `${dayNames[day - 1]} de ${monthNames[month]} del año ${yearText}`;
}

/**
 * Obtiene el nombre del día de la semana en español
 */
export function getDayName(dateString?: string | Date): string {
  if (!dateString) return "";
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleDateString('es-PY', { weekday: 'long' });
}

/**
 * Formatea una fecha para mostrar en listas de contratos
 * Ejemplo: "15 Ene 2024"
 */
export function formatDateLista(dateString?: string | Date): string {
  if (!dateString) return "Por completar";
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleDateString('es-PY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
} 