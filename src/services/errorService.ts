import { toast } from 'sonner';

export enum ErrorType {
  // Authentication Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Business Logic Errors
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // System Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  route?: string;
}

class ErrorService {
  private errorMessages: Record<ErrorType, string> = {
    [ErrorType.UNAUTHORIZED]: 'No tienes autorización para acceder a este recurso',
    [ErrorType.FORBIDDEN]: 'Acceso denegado. No tienes permisos suficientes',
    [ErrorType.INVALID_CREDENTIALS]: 'Credenciales inválidas. Verifica tu email y contraseña',
    [ErrorType.TOKEN_EXPIRED]: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente',
    [ErrorType.SESSION_EXPIRED]: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente',
    
    [ErrorType.VALIDATION_ERROR]: 'Los datos ingresados no son válidos',
    [ErrorType.REQUIRED_FIELD]: 'Campo requerido no puede estar vacío',
    [ErrorType.INVALID_FORMAT]: 'Formato inválido para el campo',
    [ErrorType.DUPLICATE_ENTRY]: 'El registro ya existe en el sistema',
    
    [ErrorType.NETWORK_ERROR]: 'Error de conexión. Verifica tu internet',
    [ErrorType.TIMEOUT]: 'La operación tardó demasiado. Intenta nuevamente',
    [ErrorType.SERVER_ERROR]: 'Error interno del servidor. Intenta más tarde',
    [ErrorType.SERVICE_UNAVAILABLE]: 'Servicio no disponible. Intenta más tarde',
    
    [ErrorType.INSUFFICIENT_PERMISSIONS]: 'No tienes permisos suficientes para esta acción',
    [ErrorType.RESOURCE_NOT_FOUND]: 'El recurso solicitado no fue encontrado',
    [ErrorType.OPERATION_NOT_ALLOWED]: 'Esta operación no está permitida',
    [ErrorType.QUOTA_EXCEEDED]: 'Has excedido el límite permitido',
    
    [ErrorType.UNKNOWN_ERROR]: 'Ha ocurrido un error inesperado',
    [ErrorType.INTERNAL_ERROR]: 'Error interno del sistema',
    [ErrorType.CONFIGURATION_ERROR]: 'Error de configuración del sistema',
  };

  /**
   * Crea un error de la aplicación
   */
  createError(
    type: ErrorType,
    message?: string,
    details?: any,
    code?: string
  ): AppError {
    return {
      type,
      message: message || this.errorMessages[type],
      code,
      details,
      timestamp: new Date(),
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
    };
  }

  /**
   * Maneja un error HTTP y lo convierte en un AppError
   */
  handleHttpError(response: Response, details?: any): AppError {
    let errorType: ErrorType;
    let message: string;

    switch (response.status) {
      case 400:
        errorType = ErrorType.VALIDATION_ERROR;
        message = 'Solicitud inválida';
        break;
      case 401:
        errorType = ErrorType.UNAUTHORIZED;
        message = 'No autorizado';
        break;
      case 403:
        errorType = ErrorType.FORBIDDEN;
        message = 'Acceso denegado';
        break;
      case 404:
        errorType = ErrorType.RESOURCE_NOT_FOUND;
        message = 'Recurso no encontrado';
        break;
      case 409:
        errorType = ErrorType.DUPLICATE_ENTRY;
        message = 'Conflicto con datos existentes';
        break;
      case 422:
        errorType = ErrorType.VALIDATION_ERROR;
        message = 'Datos de validación incorrectos';
        break;
      case 429:
        errorType = ErrorType.QUOTA_EXCEEDED;
        message = 'Demasiadas solicitudes';
        break;
      case 500:
        errorType = ErrorType.SERVER_ERROR;
        message = 'Error interno del servidor';
        break;
      case 502:
      case 503:
      case 504:
        errorType = ErrorType.SERVICE_UNAVAILABLE;
        message = 'Servicio no disponible';
        break;
      default:
        errorType = ErrorType.UNKNOWN_ERROR;
        message = `Error ${response.status}: ${response.statusText}`;
    }

    return this.createError(errorType, message, details, response.status.toString());
  }

  /**
   * Maneja un error de red
   */
  handleNetworkError(error: any): AppError {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return this.createError(ErrorType.NETWORK_ERROR, 'Error de conexión');
    }
    
    if (error.name === 'AbortError') {
      return this.createError(ErrorType.TIMEOUT, 'Operación cancelada');
    }

    return this.createError(ErrorType.UNKNOWN_ERROR, error.message || 'Error desconocido');
  }

  /**
   * Muestra un error al usuario usando toast
   */
  showError(error: AppError, options?: { duration?: number; action?: any }): void {
    const { duration = 5000, action } = options || {};

    toast.error(error.message, {
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    });

    // Log del error para debugging
    this.logError(error);
  }

  /**
   * Muestra un error de forma silenciosa (solo logging)
   */
  showSilentError(error: AppError): void {
    this.logError(error);
  }

  /**
   * Muestra un mensaje de éxito
   */
  showSuccess(message: string, options?: { duration?: number }): void {
    toast.success(message, {
      duration: options?.duration || 3000,
    });
  }

  /**
   * Muestra un mensaje de información
   */
  showInfo(message: string, options?: { duration?: number }): void {
    toast.info(message, {
      duration: options?.duration || 4000,
    });
  }

  /**
   * Muestra un mensaje de advertencia
   */
  showWarning(message: string, options?: { duration?: number }): void {
    toast.warning(message, {
      duration: options?.duration || 5000,
    });
  }

  /**
   * Log del error para debugging
   */
  private logError(error: AppError): void {
    console.group(`🚨 Error: ${error.type}`);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Timestamp:', error.timestamp);
    console.error('Route:', error.route);
    if (error.details) {
      console.error('Details:', error.details);
    }
    console.groupEnd();

    // En producción, podrías enviar el error a un servicio de logging
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(error);
    }
  }

  /**
   * Envía el error a un servicio de logging externo
   */
  private sendToLoggingService(error: AppError): void {
    // Implementar envío a servicio de logging (Sentry, LogRocket, etc.)
    // fetch('/api/logs/error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(error),
    // }).catch(console.error);
  }

  /**
   * Maneja errores de forma global
   */
  handleGlobalError(error: any, context?: string): AppError {
    let appError: AppError;

    if (error instanceof Response) {
      appError = this.handleHttpError(error);
    } else if (error.name === 'TypeError' || error.name === 'AbortError') {
      appError = this.handleNetworkError(error);
    } else if (error.type && Object.values(ErrorType).includes(error.type)) {
      appError = error;
    } else {
      appError = this.createError(
        ErrorType.UNKNOWN_ERROR,
        error.message || 'Error desconocido',
        { originalError: error, context }
      );
    }

    this.showError(appError);
    return appError;
  }

  /**
   * Limpia errores antiguos
   */
  cleanup(): void {
    // Implementar limpieza de errores si es necesario
  }
}

export const errorService = new ErrorService();

// Hook personalizado para usar el servicio de errores
export const useErrorService = () => {
  return {
    showError: errorService.showError.bind(errorService),
    showSuccess: errorService.showSuccess.bind(errorService),
    showInfo: errorService.showInfo.bind(errorService),
    showWarning: errorService.showWarning.bind(errorService),
    handleGlobalError: errorService.handleGlobalError.bind(errorService),
    createError: errorService.createError.bind(errorService),
  };
};
