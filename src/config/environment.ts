// Helper function to clean up malformed API URLs
function resolveApiUrl(): string {
  // Priorizar variables de entorno
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Fallback para producción
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.proptech.com.py';
  }
  
  // Fallback para desarrollo
  return 'http://localhost:8080';
}

// Configuración del entorno de la aplicación
export const environment = {
  // API Configuration
  apiUrl: resolveApiUrl(),
  API_BASE_URL: resolveApiUrl(),
  UPLOADS_BASE_URL: process.env.NEXT_PUBLIC_UPLOADS_URL || (process.env.NODE_ENV === 'production' ? 'https://181.1.154.85:9091/uploads' : 'http://localhost:8080/uploads'),
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Feature Flags
  enableMockData: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  
  // App Configuration
  appName: 'Proptech Owners Property',
  appVersion: '1.0.0',
  
  // Default Settings
  defaultPageSize: 20,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  
  // Timeouts
  apiTimeout: 30000,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  
  // Pagination
  pagination: {
    defaultPage: 0,
    defaultSize: 20,
    maxSize: 100
  }
};

// Configuración específica para desarrollo
export const devConfig = {
  ...environment,
  enableMockData: true,
  enableAnalytics: false,
  logLevel: 'debug'
};

// Configuración específica para producción
export const prodConfig = {
  ...environment,
  enableMockData: false,
  enableAnalytics: true,
  logLevel: 'error'
};

// Exportar configuración según el entorno
export const config = environment.isDevelopment ? devConfig : prodConfig;

// Función para obtener la URL base de imágenes
export const getImageBaseUrl = (): string => {
  // Priorizar variables de entorno específicas para imágenes
  if (process.env.NEXT_PUBLIC_IMAGE_BASE_URL) {
    return process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  }
  
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Fallback para producción
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.proptech.com.py';
  }
  
  // Fallback para desarrollo
  return 'http://localhost:8080';
};
