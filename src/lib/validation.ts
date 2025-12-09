/**
 * Utilidades de validación para formularios
 */

/**
 * Valida formato de email usando regex robusto
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Regex más robusto que el básico
  // Permite: usuario@dominio.com, usuario.nombre@sub.dominio.com, etc.
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Validación adicional: longitud máxima
  if (email.length > 255) {
    return false;
  }
  
  return emailRegex.test(email.trim());
}

/**
 * Valida formato de teléfono (básico)
 * Acepta números, espacios, guiones, paréntesis, +
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Remover espacios y caracteres comunes
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Debe tener al menos 8 dígitos y máximo 15
  return /^\d{8,15}$/.test(cleaned);
}

/**
 * Valida longitud de texto
 */
export function isValidLength(
  text: string,
  min: number = 0,
  max: number = Infinity
): boolean {
  if (typeof text !== 'string') {
    return false;
  }
  
  const length = text.trim().length;
  return length >= min && length <= max;
}

/**
 * Valida contraseña
 * - Mínimo 6 caracteres
 * - Máximo 128 caracteres
 * - Al menos una letra y un número (recomendado)
 */
export function isValidPassword(
  password: string,
  requireComplexity: boolean = false
): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  if (password.length < 6 || password.length > 128) {
    return false;
  }
  
  if (requireComplexity) {
    // Al menos una letra y un número
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
  }
  
  return true;
}

/**
 * Sanitiza texto para prevenir XSS básico
 * Remueve caracteres peligrosos pero mantiene el texto legible
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .trim()
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, ''); // Remover event handlers (onclick=, etc.)
}

/**
 * Valida y sanitiza email
 */
export function validateAndSanitizeEmail(email: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = email.trim().toLowerCase();
  
  if (!sanitized) {
    return {
      isValid: false,
      sanitized: '',
      error: 'El email es requerido'
    };
  }
  
  if (!isValidEmail(sanitized)) {
    return {
      isValid: false,
      sanitized: '',
      error: 'El email no es válido'
    };
  }
  
  return {
    isValid: true,
    sanitized
  };
}

/**
 * Valida y sanitiza teléfono
 */
export function validateAndSanitizePhone(phone: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = phone.trim();
  
  if (!sanitized) {
    return {
      isValid: false,
      sanitized: '',
      error: 'El teléfono es requerido'
    };
  }
  
  if (!isValidPhone(sanitized)) {
    return {
      isValid: false,
      sanitized: '',
      error: 'El teléfono no es válido'
    };
  }
  
  return {
    isValid: true,
    sanitized
  };
}

/**
 * Valida y sanitiza nombre
 */
export function validateAndSanitizeName(name: string, maxLength: number = 100): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = sanitizeText(name.trim());
  
  if (!sanitized) {
    return {
      isValid: false,
      sanitized: '',
      error: 'El nombre es requerido'
    };
  }
  
  if (!isValidLength(sanitized, 2, maxLength)) {
    return {
      isValid: false,
      sanitized: '',
      error: `El nombre debe tener entre 2 y ${maxLength} caracteres`
    };
  }
  
  return {
    isValid: true,
    sanitized
  };
}

/**
 * Valida y sanitiza empresa
 */
export function validateAndSanitizeCompany(company: string, maxLength: number = 200): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = sanitizeText(company.trim());
  
  if (!sanitized) {
    return {
      isValid: false,
      sanitized: '',
      error: 'La empresa es requerida'
    };
  }
  
  if (!isValidLength(sanitized, 2, maxLength)) {
    return {
      isValid: false,
      sanitized: '',
      error: `La empresa debe tener entre 2 y ${maxLength} caracteres`
    };
  }
  
  return {
    isValid: true,
    sanitized
  };
}

