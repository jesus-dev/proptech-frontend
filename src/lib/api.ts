import axios, { AxiosError } from 'axios';

// Helper function to resolve API URL - usa localhost en server, URL pública en browser
function resolveApiUrl(): string {
  // En el servidor Next.js (SSR/SSG), usar localhost directo (sin tunnel)
  if (typeof window === 'undefined') {
    return process.env.API_URL_INTERNAL || 'http://localhost:9091';
  }
  
  // En el navegador, usar URL pública a través de Cloudflare
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9091';
  
  // Clean up malformed URLs
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
  timeout: 20000, // 20s (reducido de 30s - sin tunnel es más rápido)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación y tenant seleccionado
apiClient.interceptors.request.use(
  (config) => {
    // Asegurar que headers existe (crítico en producción)
    if (!config.headers) {
      config.headers = {} as any;
    }
    
    // Solo acceder a localStorage si estamos en el navegador
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Si es SUPER_ADMIN y tiene un tenant seleccionado, enviarlo en el header
      // Si tenant.id es 0 o null, significa "Mostrar todo", no enviar header
      const selectedTenant = localStorage.getItem('selectedTenant');
      if (selectedTenant) {
        try {
          const tenant = JSON.parse(selectedTenant);
          // Solo enviar header si el tenant tiene un ID válido (no es "Mostrar todo")
          if (tenant && tenant.id && tenant.id !== 0 && tenant.id !== null) {
            config.headers['X-Selected-Tenant-Id'] = tenant.id.toString();
          }
        } catch (e) {
          // Ignorar si el JSON está corrupto
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag para evitar múltiples refresh simultáneos
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor para manejar respuestas y errores CON RECUPERACIÓN AUTOMÁTICA
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Manejar errores de red (ERR_EMPTY_RESPONSE, ERR_NETWORK, etc.)
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_EMPTY_RESPONSE' || error.message?.includes('ERR_EMPTY_RESPONSE')) {
      // No registrar estos errores en la consola si son esperados (servidor no disponible)
      // El código que llama debe manejar estos casos retornando valores por defecto
      const networkError = new Error('Network error');
      (networkError as any).code = error.code;
      (networkError as any).config = error.config;
      (networkError as any).isAxiosError = true;
      return Promise.reject(networkError);
    }
    
    // Suprimir logs de 404 esperados (agentes por email, rental properties por property ID)
    // Estos son casos normales cuando no hay datos asociados
    if (error.response?.status === 404) {
      const url = error.config?.url || '';
      const isExpected404 = 
        url.includes('/agents/by-email/') ||
        url.includes('/rental-properties/by-property/') ||
        url.includes('/subscriptions/plans/network'); // Plan de Network puede no existir
      
      if (isExpected404) {
        // Crear un error silencioso que no se registre en la consola
        // pero que permita al código manejar el 404 correctamente
        // Marcar el error como "handled" para evitar logs adicionales
        const silentError: any = new Error('Expected 404');
        silentError.response = error.response;
        silentError.config = error.config;
        silentError.isAxiosError = true;
        silentError.__isExpected404 = true; // Marca para identificar errores esperados
        // Suprimir el stack trace para estos errores esperados
        silentError.stack = undefined;
        return Promise.reject(silentError);
      }
    }
    
    // 🚨 PRIORIDAD 1: Errores de autenticación - INTENTAR REFRESCAR TOKEN
    // Manejar 401 siempre, y 403 solo si parece ser un error de token (no un error de permisos real)
    const errorMessage = (error.response?.data?.error || error.response?.data?.message || String(error.response?.data || '')).toLowerCase();
    
    // Errores de permisos REALES (no intentar refresh para estos)
    const isRealPermissionError = errorMessage.includes('no pertenece a tu tenant') ||
                                   errorMessage.includes('not belongs to your tenant') ||
                                   errorMessage.includes('permiso para modificar') ||
                                   errorMessage.includes('permission to modify') ||
                                   errorMessage.includes('plan free') ||
                                   errorMessage.includes('plan free no permite') ||
                                   errorMessage.includes('límite de propiedades') ||
                                   errorMessage.includes('limit of properties') ||
                                   errorMessage.includes('has alcanzado el límite') ||
                                   errorMessage.includes('reached the limit') ||
                                   errorMessage.includes('no tienes permiso') ||
                                   errorMessage.includes('you do not have permission') ||
                                   errorMessage.includes('role') ||
                                   errorMessage.includes('rol') ||
                                   errorMessage.includes('acceso denegado') ||
                                   errorMessage.includes('access denied');
    
    // NO intentar refresh para endpoints públicos (no requieren autenticación)
    const isPublicEndpoint = config.url?.includes('/api/public/') || 
                            config.url?.includes('/api/auth/login') ||
                            config.url?.includes('/api/auth/register');
    
    // Intentar refresh:
    // - Si es 401 (siempre es token) Y NO es endpoint público
    // - Si es 403 pero NO es un error de permisos real Y hay refresh token disponible Y NO es endpoint público
    // - Si es 403 sin mensaje de error claro (puede ser token expirado) Y NO es endpoint público
    const hasRefreshToken = localStorage.getItem('refreshToken') && 
                           localStorage.getItem('refreshToken') !== 'undefined' && 
                           localStorage.getItem('refreshToken') !== 'null';
    
    const shouldTryRefresh = !isPublicEndpoint && 
                             (error.response?.status === 401 || 
                             (error.response?.status === 403 && !isRealPermissionError && hasRefreshToken)) && 
                             !config._retry;
    
    // Log para debug - siempre mostrar para ayudar a diagnosticar
    if (error.response?.status === 403) {
      const logData = {
        url: config.url,
        method: config.method,
        errorMessage: errorMessage || '(sin mensaje)',
        isRealPermissionError,
        hasRefreshToken,
        willTryRefresh: shouldTryRefresh,
        responseData: error.response?.data,
        currentToken: localStorage.getItem('token') ? 'presente' : 'ausente'
      };
      
      if (shouldTryRefresh) {
        console.log('🔄 403 detectado - Intentando refresh de token:', logData);
      } else if (isRealPermissionError) {
        console.warn('⚠️ 403 Forbidden - Error de permisos real:', logData);
      } else {
        console.warn('⚠️ 403 Forbidden - Sin refresh token disponible:', logData);
      }
    }
    
    if (shouldTryRefresh) {
      // Guardar si es error de permisos para usarlo después
      const wasPermissionError = isRealPermissionError;
      
      // Si ya está refrescando, encolar esta petición
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          // Guardar el selectedTenant para preservarlo después del refresh
          const selectedTenant = typeof window !== 'undefined' ? localStorage.getItem('selectedTenant') : null;
          failedQueue.push({ resolve, reject, selectedTenant } as any);
        })
          .then((result: any) => {
            const token = typeof result === 'string' ? result : result?.token;
            if (!config.headers) {
              config.headers = {} as any;
            }
            config.headers.Authorization = `Bearer ${token}`;
            // El interceptor de request agregará automáticamente X-Selected-Tenant-Id desde localStorage
            return apiClient(config);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      config._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Si hay refresh token, intentar renovar
      if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
        isRefreshing = true;
        
        try {
          // Llamar al endpoint de refresh sin usar el interceptor (para evitar loop)
          const refreshUrl = `${resolveApiUrl()}/api/auth/refresh`;
          console.log('🔄 Intentando refresh token en:', refreshUrl, process.env.NODE_ENV === 'production' ? '(PRODUCCIÓN)' : '(DEV)');
          
          const refreshResponse = await axios.post(refreshUrl, {
            refreshToken: refreshToken
          }, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000, // 10 segundos timeout para refresh
            // No usar el interceptor de apiClient para evitar loops
            validateStatus: (status) => status < 500 // Permitir 401, 403, etc para manejarlos
          });
          
          // Verificar si la respuesta es exitosa
          if (refreshResponse.status < 200 || refreshResponse.status >= 300) {
            throw new Error(`Refresh falló con status ${refreshResponse.status}: ${JSON.stringify(refreshResponse.data)}`);
          }

          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;
          
          // Validar que se recibió el token ANTES de guardarlo
          if (!accessToken) {
            throw new Error('No se recibió accessToken en la respuesta de refresh');
          }
          
          // Guardar nuevos tokens
          localStorage.setItem('token', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          // Actualizar header de la petición original - Asegurar que headers existe
          if (!config.headers) {
            config.headers = {} as any;
          }
          config.headers.Authorization = `Bearer ${accessToken}`;
          
          // Preservar X-Selected-Tenant-Id si estaba en la petición original
          if (typeof window !== 'undefined') {
            const selectedTenant = localStorage.getItem('selectedTenant');
            if (selectedTenant) {
              try {
                const tenant = JSON.parse(selectedTenant);
                if (tenant && tenant.id) {
                  config.headers['X-Selected-Tenant-Id'] = tenant.id.toString();
                }
              } catch (e) {
                // Ignorar si el JSON está corrupto
              }
            }
          }
          
          // Procesar cola de peticiones pendientes
          processQueue(null, accessToken);
          isRefreshing = false;
          
          // Reintentar petición original con el nuevo token
          console.log('🔄 Token refrescado exitosamente, reintentando request:', config.method, config.url);
          // NO limpiar el flag _retry:
          // - Así nos aseguramos de que esta misma request no vuelva a disparar otro ciclo de refresh
          // - Evita bucles infinitos cuando el backend sigue devolviendo 403 por falta de permisos
          
          // El interceptor de request también agregará el header automáticamente, pero ya lo tenemos aquí
          return apiClient(config);
        } catch (refreshError: any) {
          // Si falla el refresh, limpiar y redirigir
          processQueue(refreshError, null);
          isRefreshing = false;
          
          const errorDetails = {
            message: refreshError?.message,
            status: refreshError?.response?.status,
            statusText: refreshError?.response?.statusText,
            data: refreshError?.response?.data,
            url: refreshError?.config?.url,
            code: refreshError?.code
          };
          
          console.error('❌ Error al refrescar token en', process.env.NODE_ENV || 'unknown', ':', errorDetails);
          
          // Limpiar tokens inválidos
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            // Solo redirigir si realmente falló la autenticación
            // No redirigir si el error original era de permisos
            if (error.response?.status === 401 || (!wasPermissionError && refreshError?.response?.status === 401)) {
              console.log('🔐 Redirigiendo a login por fallo de autenticación');
              window.location.href = '/login';
            } else if (!wasPermissionError) {
              // Si no era error de permisos pero el refresh falló, puede ser token expirado
              console.warn('⚠️ Refresh falló pero no redirigiendo - puede ser problema de permisos real');
            }
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No hay refresh token, redirigir directamente
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 500 && localStorage.getItem('token')) {
      const errorMessage = error.response?.data?.error || '';
      const isAuthError = 
        errorMessage.includes('Usuario no encontrado') ||
        errorMessage.includes('Usuario sin tenant') ||
        errorMessage.includes('Autenticación requerida') ||
        errorMessage.includes('Tenant ID no establecido');
      
      if (isAuthError) {
        // Token inválido, limpiar y redirigir
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
        // Sin token, redirigir silenciosamente
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // Los errores 500 pueden ser errores de validación o lógica de negocio, no necesariamente temporales
    // Los retries automáticos pueden causar:
    // - Múltiples efectos secundarios (duplicar registros, transacciones, etc.)
    // - Exceder rate limits
    // - Ocultar errores reales que deben ser corregidos
    // Por lo tanto, NO hacemos retries automáticos. Cada componente debe manejar errores según su contexto.
    
    // Si es un error 500, verificar si es auth error
    if (error.response?.status === 500) {
      // Solo cerrar sesión si el mensaje de error indica específicamente un problema de autenticación
      const errorMessage = error.response?.data?.error || '';
      const isAuthError = 
        errorMessage.includes('Usuario no encontrado') ||
        errorMessage.includes('Usuario sin tenant') ||
        errorMessage.includes('Autenticación requerida') ||
        errorMessage.includes('Tenant ID no establecido') ||
        errorMessage.includes('Token inválido') ||
        errorMessage.includes('Sesión expirada');
      
      // Solo cerrar sesión si es específicamente un error de autenticación
      if (isAuthError && typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Los 403 que no son de autenticación se manejan normalmente arriba

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
  changePassword: (data: { oldPassword: string; newPassword: string; confirmPassword: string }) =>
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

 