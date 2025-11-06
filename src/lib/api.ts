import axios from 'axios';

// Helper function to clean up malformed API URLs
function resolveApiUrl(): string {
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
  // Clean up malformed URLs that might have double concatenation
  if (apiUrl.includes('https://proptech.com.py/https/api.proptech.com.py')) {
    apiUrl = 'https://api.proptech.com.py';
  } else if (apiUrl.includes('http://proptech.com.py/http/api.proptech.com.py')) {
    apiUrl = 'http://api.proptech.com.py';
  }
  
  return apiUrl;
}

// Configuración base del cliente API
const apiClient = axios.create({
  baseURL: resolveApiUrl(),
  timeout: 30000, // 30s para manejar intermitencias del backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores CON RECUPERACIÓN AUTOMÁTICA
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // 🚨 PRIORIDAD 1: Errores de autenticación - IR DIRECTO AL LOGIN
    if (error.response?.status === 401) {
      console.warn('🔒 Sesión expirada - redirigiendo al login');
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // 🚨 PRIORIDAD 2: Error 500 con token (posible token inválido)
    // Si es el primer intento Y hay token, verificar si es problema de autenticación
    if (error.response?.status === 500 && localStorage.getItem('token')) {
      const errorMessage = error.response?.data?.error || '';
      const isAuthError = 
        errorMessage.includes('Usuario no encontrado') ||
        errorMessage.includes('Usuario sin tenant') ||
        errorMessage.includes('Autenticación requerida') ||
        errorMessage.includes('Tenant ID no establecido');
      
      if (isAuthError) {
        console.warn('🔒 Token inválido detectado - limpiando sesión y redirigiendo');
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    // 🚨 PRIORIDAD 3: Sin token válido - IR AL LOGIN
    if (!error.response && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        console.warn('🔒 Sin token - redirigiendo al login');
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // ♻️ RECUPERACIÓN AUTOMÁTICA SILENCIOSA para errores temporales
    // Inicializar configuración de retry si no existe
    if (!config.retry) {
      config.retry = { count: 0, maxRetries: 5, delay: 300 }; // 5 reintentos más rápidos
    }

    // Determinar si debe reintentar
    const shouldRetry = 
      error.response?.status === 500 || // Error del servidor
      error.response?.status === 502 || // Bad Gateway
      error.response?.status === 503 || // Service Unavailable
      error.response?.status === 504 || // Gateway Timeout
      error.code === 'ECONNABORTED' || // Timeout
      !error.response; // Error de red

    // Solo NO reintentar para 403 (sin permisos) y 404 (no encontrado)
    const shouldNotRetry = 
      error.response?.status === 403 || 
      error.response?.status === 404;

    if (!shouldNotRetry && shouldRetry && config.retry.count < config.retry.maxRetries) {
      config.retry.count += 1;
      
      // Log silencioso SOLO en dev (NO en producción)
      if (config.retry.count === 1 && process.env.NODE_ENV === 'development') {
        console.debug(`♻️ Recuperando automáticamente... (intento ${config.retry.count}/${config.retry.maxRetries})`);
      }
      
      // Espera progresiva más rápida: 300ms, 600ms, 900ms, 1200ms, 1500ms
      const delay = config.retry.delay * config.retry.count;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Reintentar el request silenciosamente
      return apiClient(config);
    }

    // Si agotó todos los reintentos Y sigue siendo 500, verificar si es auth error
    if (config.retry.count >= config.retry.maxRetries && error.response?.status === 500) {
      console.error(`❌ Error persistente después de ${config.retry.maxRetries} intentos - limpiando sesión`);
      // Si después de 3 intentos sigue fallando con 500, probablemente es el token
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Para 403, mostrar mensaje pero no es crítico
    if (error.response?.status === 403) {
      console.warn('⚠️ Acceso denegado: permisos insuficientes');
    }

    return Promise.reject(error);
  }
);

export { apiClient };

// Tipos para las respuestas de la API
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

// Funciones helper para hacer requests tipados
export const api = {
  get: <T = any>(url: string, config?: any): Promise<ApiResponse<T>> =>
    apiClient.get(url, config).then((response: any) => ({
      data: response.data,
      success: true,
    })),

  post: <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> =>
    apiClient.post(url, data, config).then((response: any) => ({
      data: response.data,
      success: true,
    })),

  put: <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> =>
    apiClient.put(url, data, config).then((response: any) => ({
      data: response.data,
      success: true,
    })),

  patch: <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> =>
    apiClient.patch(url, data, config).then((response: any) => ({
      data: response.data,
      success: true,
    })),

  delete: <T = any>(url: string, config?: any): Promise<ApiResponse<T>> =>
    apiClient.delete(url, config).then((response: any) => ({
      data: response.data,
      success: true,
    })),
};

export const propertyApi = {
  // Obtener todas las propiedades
  getAll: (params?: {
    page?: number;
    size?: number;
    sort?: string;
    search?: string;
    type?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return api.get<any>(`/api/propiedades${query ? `?${query}` : ''}`);
  },

  // Obtener propiedades con información detallada
  getDetailed: () => api.get<any[]>('/api/propiedades/detalladas'),

  // Obtener propiedad por ID
  getById: (id: string) => api.get<any>(`/api/propiedades/${id}`),

  // Obtener propiedad detallada por ID
  getDetailedById: (id: string) => api.get<any>(`/api/propiedades/${id}/detallada`),

  // Obtener propiedad por slug
  getBySlug: (slug: string) => api.get<any>(`/api/propiedades/slug/${slug}`),

  // Crear nueva propiedad
  create: (property: unknown) => api.post<any>('/api/propiedades', property),

  // Actualizar propiedad
  update: (id: string, property: unknown) => api.put<any>(`/api/propiedades/${id}`, property),

  // Eliminar propiedad
  delete: (id: string) => api.delete<any>(`/api/propiedades/${id}`),

  // Subir imágenes
  uploadImages: (id: string, images: File[]) => {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`images`, image);
    });
    return api.post<any>(`/api/propiedades/${id}/images`, formData);
  },

  // Obtener propiedades destacadas
  getFeatured: () => api.get<any[]>('/api/propiedades/destacadas'),

  // Obtener propiedades premium
  getPremium: () => api.get<any[]>('/api/propiedades/premium'),
};

export const agentApi = {
  // Obtener todos los agentes
  getAll: (params?: {
    page?: number;
    size?: number;
    search?: string;
    agencyId?: string;
    active?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return api.get<any>(`/api/agents${query ? `?${query}` : ''}`);
  },

  // Obtener agente por ID
  getById: (id: string) => api.get<any>(`/api/agents/${id}`),

  // Crear nuevo agente
  create: (agent: unknown) => api.post<any>('/api/agents', agent),

  // Actualizar agente
  update: (id: string, agent: unknown) => api.put<any>(`/api/agents/${id}`, agent),

  // Eliminar agente
  delete: (id: string) => api.delete<any>(`/api/agents/${id}`),

  // Autenticar agente
  authenticate: (credentials: { username: string; password: string }) =>
    api.post<any>('/api/agents/auth', credentials),

  // Obtener estadísticas de agentes
  getStats: () => api.get<any>('/api/agents/stats'),
};

export const agencyApi = {
  // Obtener todas las agencias
  getAll: (params?: {
    page?: number;
    size?: number;
    search?: string;
    active?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return api.get<any>(`/api/agencies${query ? `?${query}` : ''}`);
  },

  // Obtener agencia por ID
  getById: (id: string) => api.get<any>(`/api/agencies/${id}`),

  // Crear nueva agencia
  create: (agency: unknown) => api.post<any>('/api/agencies', agency),

  // Actualizar agencia
  update: (id: string, agency: unknown) => api.put<any>(`/api/agencies/${id}`, agency),

  // Eliminar agencia
  delete: (id: string) => api.delete<any>(`/api/agencies/${id}`),
};

export const contactApi = {
  // Obtener todos los contactos
  getAll: (params?: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    type?: string;
    assignedTo?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return api.get<any>(`/api/contacts${query ? `?${query}` : ''}`);
  },

  // Obtener contacto por ID
  getById: (id: string) => api.get<any>(`/api/contacts/${id}`),

  // Crear nuevo contacto
  create: (contact: unknown) => api.post<any>('/api/contacts', contact),

  // Actualizar contacto
  update: (id: string, contact: unknown) => api.put<any>(`/api/contacts/${id}`, contact),

  // Eliminar contacto
  delete: (id: string) => api.delete<any>(`/api/contacts/${id}`),
};

export const visitApi = {
  // Obtener todas las visitas
  getAll: (params?: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    agentId?: string;
    propertyId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return api.get<any>(`/api/visits${query ? `?${query}` : ''}`);
  },

  // Obtener visita por ID
  getById: (id: string) => api.get<any>(`/api/visits/${id}`),

  // Crear nueva visita
  create: (visit: unknown) => api.post<any>('/api/visits', visit),

  // Actualizar visita
  update: (id: string, visit: unknown) => api.put<any>(`/api/visits/${id}`, visit),

  // Eliminar visita
  delete: (id: string) => api.delete<any>(`/api/visits/${id}`),

  // Cambiar estado de visita
  updateStatus: (id: string, status: string) =>
    api.patch<any>(`/api/visits/${id}/status`, { status }),
};

export const saleApi = {
  // Obtener todas las ventas
  getAll: (params?: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    agentId?: string;
    propertyId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return api.get<any>(`/api/sales${query ? `?${query}` : ''}`);
  },

  // Obtener venta por ID
  getById: (id: string) => api.get<any>(`/api/sales/${id}`),

  // Crear nueva venta
  create: (sale: React.SyntheticEvent) => api.post<any>('/api/sales', sale),

  // Actualizar venta
  update: (id: string, sale: React.SyntheticEvent) => api.put<any>(`/api/sales/${id}`, sale),

  // Eliminar venta
  delete: (id: string) => api.delete<any>(`/api/sales/${id}`),
};

export const contractApi = {
  // Obtener todos los contratos
  getAll: (params?: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    type?: string;
    propertyId?: string;
    clientId?: string;
    agentId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return api.get<any>(`/api/contracts${query ? `?${query}` : ''}`);
  },

  // Obtener contrato por ID
  getById: (id: string) => api.get<any>(`/api/contracts/${id}`),

  // Crear nuevo contrato
  create: (contract: unknown) => api.post<any>('/api/contracts', contract),

  // Actualizar contrato
  update: (id: string, contract: unknown) => api.put<any>(`/api/contracts/${id}`, contract),

  // Eliminar contrato
  delete: (id: string) => api.delete<any>(`/api/contracts/${id}`),

  // Cambiar estado del contrato
  updateStatus: (id: string, status: string) =>
    api.patch<any>(`/api/contracts/${id}/status`, { status }),

  // Firmar contrato
  sign: (id: string, signedDate: string) =>
    api.patch<any>(`/api/contracts/${id}/sign`, { signedDate }),

  // Verificar si el contrato puede ser modificado
  canModify: (id: string) => api.get<any>(`/api/contracts/${id}/can-modify`),

  // Guardar firma digital
  saveSignature: (signatureData: {
    contractId: string;
    signerType: 'client' | 'broker';
    signature: string;
    token: string;
    timestamp: string;
    ipAddress?: string;
    deviceInfo?: unknown;
  }) => api.post<any>('/api/contracts/signatures', signatureData),
};

export const developmentApi = {
  // Obtener todos los desarrollos
  getAll: (params?: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return api.get<any>(`/api/developments${query ? `?${query}` : ''}`);
  },

  // Obtener desarrollo por ID
  getById: (id: string) => api.get<any>(`/api/developments/${id}`),

  // Crear nuevo desarrollo
  create: (development: unknown) => api.post<any>('/api/developments', development),

  // Actualizar desarrollo
  update: (id: string, development: unknown) => api.put<any>(`/api/developments/${id}`, development),

  // Eliminar desarrollo
  delete: (id: string) => api.delete<any>(`/api/developments/${id}`),
};

export const authApi = {
  // Login de usuario
  login: (credentials: { username: string; password: string }) =>
    api.post<any>('/api/auth/login', credentials),

  // Logout
  logout: () => api.post<any>('/api/auth/logout', {}),

  // Refresh token
  refreshToken: (refreshToken: string) =>
    api.post<any>('/api/auth/refresh', { refreshToken }),

  // Verificar token
  verifyToken: () => api.get<any>('/api/auth/verify'),

  // Cambiar contraseña
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.post<any>('/api/auth/change-password', data),
};

export const dashboardApi = {
  // Obtener estadísticas del dashboard
  getStats: () => api.get<any>('/api/dashboard/stats'),

  // Obtener actividad reciente
  getRecentActivity: () => api.get<any[]>('/api/dashboard/recent-activity'),

  // Obtener propiedades top
  getTopProperties: () => api.get<any[]>('/api/dashboard/top-properties'),

  // Obtener métricas de ventas
  getSalesMetrics: () => api.get<any>('/api/dashboard/sales-metrics'),
};

// Utilidades para manejo de errores
export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error && 
      error.response && typeof error.response === 'object' && 'data' in error.response &&
      error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
    return (error.response.data as any).message;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as any).message;
  }
  return 'Ha ocurrido un error inesperado';
};

// Hook para manejar estados de carga y error
// API para plantillas de contratos
export const templateApi = {
  // Obtener todas las plantillas
  getAll: (params?: {
    page?: number;
    size?: number;
    sort?: string;
    type?: string;
    isDefault?: boolean;
    isActive?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return api.get<any>(`/api/contract-templates${query ? `?${query}` : ''}`);
  },

  // Obtener plantilla por ID
  getById: (id: string) => api.get<any>(`/api/contract-templates/${id}`),

  // Crear nueva plantilla
  create: (template: any) => api.post<any>('/api/contract-templates', template),

  // Actualizar plantilla
  update: (id: string, template: any) => api.put<any>(`/api/contract-templates/${id}`, template),

  // Eliminar plantilla
  delete: (id: string) => api.delete<any>(`/api/contract-templates/${id}`),

  // Generar contrato desde plantilla
  generateContract: (templateId: string, data: Record<string, any>) => 
    api.post<string>(`/api/contract-templates/${templateId}/generate`, data),

  // Duplicar plantilla
  duplicate: (id: string, newName: string) => 
    api.post<any>(`/api/contract-templates/${id}/duplicate`, { name: newName }),
};

 