import { apiClient } from '@/lib/api';
import {
  User,
  UserRole,
  PermissionEnum,
  Permission,
  Role,
  LoginRequest,
  LoginResponse,
} from '@/types/auth';

export const authService = {
  // Authentication
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('🔐 Intentando login con:', { email: credentials.email, passwordLength: credentials.password?.length });
      console.log('🌐 URL del API:', apiClient.defaults.baseURL);
      
      const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
      
      console.log('✅ Login exitoso');
      return response.data!;
    } catch (error: any) {
      console.error('❌ Error en login:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    const token = localStorage.getItem('token');
    
    // Si no hay token válido, limpiar localStorage y salir
    if (!token || token === 'undefined' || token === 'null') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      return;
    }
    
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      // No lanzar el error, continuar con la limpieza local
      // El logout debe funcionar incluso si el backend no responde
    }
  },

  validateToken: async (): Promise<any> => {
    const response = await apiClient.get('/api/auth/validate');
    return response.data!;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data!;
  },

  // Users Management
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/api/auth/users');
    return response.data!;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/api/auth/users/${id}`);
    return response.data!;
  },

  createUser: async (userData: any): Promise<User> => {
    try {
      console.log('📤 authService.createUser - Enviando datos:', JSON.stringify({
        ...userData,
        password: userData.password ? '***' : 'no proporcionada'
      }, null, 2));
      const response = await apiClient.post<User>('/api/auth/users', userData);
      console.log('✅ authService.createUser - Respuesta exitosa:', response.data);
      return response.data!;
    } catch (error: any) {
      // Log detallado del error
      const errorDetails = {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        responseData: error?.response?.data,
        responseHeaders: error?.response?.headers,
        requestData: userData,
        requestUrl: error?.config?.url,
        requestMethod: error?.config?.method
      };
      
      console.error('❌ authService.createUser - Error completo:', errorDetails);
      console.error('❌ authService.createUser - Response data (raw):', error?.response?.data);
      console.error('❌ authService.createUser - Response data (stringified):', JSON.stringify(error?.response?.data, null, 2));
      
      // Si hay un mensaje de error en la respuesta, lanzarlo con más contexto
      if (error?.response?.data) {
        const errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.error || error.response.data.message || JSON.stringify(error.response.data);
        const enhancedError = new Error(errorMessage);
        (enhancedError as any).response = error.response;
        (enhancedError as any).status = error.response?.status;
        throw enhancedError;
      }
      
      throw error;
    }
  },

  updateUser: async (id: number, userData: any): Promise<User> => {
    try {
      console.log('📤 authService.updateUser - Enviando datos:', JSON.stringify({
        ...userData,
        password: userData.password ? '***' : 'no proporcionada'
      }, null, 2));
      const response = await apiClient.put<User>(`/api/auth/users/${id}`, userData);
      console.log('✅ authService.updateUser - Respuesta exitosa:', response.data);
      return response.data!;
    } catch (error: any) {
      // Log detallado del error
      const errorDetails = {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        responseData: error?.response?.data,
        responseHeaders: error?.response?.headers,
        requestData: userData,
        requestUrl: error?.config?.url,
        requestMethod: error?.config?.method
      };
      
      console.error('❌ authService.updateUser - Error completo:', errorDetails);
      console.error('❌ authService.updateUser - Response data (raw):', error?.response?.data);
      console.error('❌ authService.updateUser - Response data (stringified):', JSON.stringify(error?.response?.data, null, 2));
      
      // Si hay un mensaje de error en la respuesta, lanzarlo con más contexto
      if (error?.response?.data) {
        const errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.error || error.response.data.message || JSON.stringify(error.response.data);
        const enhancedError = new Error(errorMessage);
        (enhancedError as any).response = error.response;
        (enhancedError as any).status = error.response?.status;
        throw enhancedError;
      }
      
      throw error;
    }
  },

  deleteUser: async (id: number): Promise<void> => {
    console.log('authService.deleteUser llamado con ID:', id);
    try {
      const response = await apiClient.delete(`/api/auth/users/${id}`);
      console.log('authService.deleteUser respuesta:', response);
      return response.data;
    } catch (error: any) {
      console.error('authService.deleteUser error completo:', {
        error,
        message: error?.message,
        response: error?.response,
        responseData: error?.response?.data,
        status: error?.response?.status
      });
      
      // Si hay un mensaje de error en la respuesta, lanzarlo con más contexto
      if (error?.response?.data) {
        const errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.error || error.response.data.message || JSON.stringify(error.response.data);
        const enhancedError = new Error(errorMessage);
        (enhancedError as any).response = error.response;
        (enhancedError as any).status = error.response?.status;
        throw enhancedError;
      }
      
      throw error;
    }
  },

  activateUser: async (id: number): Promise<User> => {
    const response = await apiClient.put<User>(`/api/auth/users/${id}/activate`, {});
    return response.data!;
  },

  deactivateUser: async (id: number): Promise<User> => {
    const response = await apiClient.put<User>(`/api/auth/users/${id}/deactivate`, {});
    return response.data!;
  },

  // Roles Management
  getRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get('/api/auth/roles');
    return response.data!;
  },

  getRoleById: async (id: number): Promise<Role> => {
    const response = await apiClient.get(`/api/auth/roles/${id}`);
    return response.data!;
  },

  createRole: async (roleData: any): Promise<Role> => {
    const response = await apiClient.post('/api/auth/roles', roleData);
    return response.data!;
  },

  updateRole: async (id: number, roleData: any): Promise<Role> => {
    const response = await apiClient.put(`/api/auth/roles/${id}`, roleData);
    return response.data!;
  },

  deleteRole: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/auth/roles/${id}`);
  },

  // Permissions Management
  getPermissions: async (): Promise<Permission[]> => {
    const response = await apiClient.get('/api/auth/permissions');
    return response.data!;
  },

  getPermissionById: async (id: number): Promise<Permission> => {
    const response = await apiClient.get(`/api/auth/permissions/${id}`);
    return response.data!;
  },

  createPermission: async (permissionData: any): Promise<Permission> => {
    const response = await apiClient.post('/api/auth/permissions', permissionData);
    return response.data!;
  },

  updatePermission: async (id: number, permissionData: any): Promise<Permission> => {
    const response = await apiClient.put(`/api/auth/permissions/${id}`, permissionData);
    return response.data!;
  },

  deletePermission: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/auth/permissions/${id}`);
  },

  // Statistics
  getAuthStats: async () => {
    const response = await apiClient.get('/api/auth/stats');
    return response.data!;
  },

  getUserStats: async (userId: number): Promise<{properties: number, views: number, favorites: number}> => {
    const response = await apiClient.get(`/api/auth/users/${userId}/stats`);
    return response.data;
  },

  // Menu Permissions Management
  scanPermissions: async (): Promise<void> => {
    await apiClient.post('/api/auth/scan-permissions');
  },

  addMenuPermission: async (menuData: {
    path: string;
    resource: string;
    description: string;
    actions: string[];
  }): Promise<void> => {
    await apiClient.post('/api/auth/menu-permissions', menuData);
  },

  updateMenuPermission: async (id: number, menuData: {
    path: string;
    resource: string;
    description: string;
    actions: string[];
  }): Promise<void> => {
    await apiClient.put(`/api/auth/menu-permissions/${id}`, menuData);
  },

  deleteMenuPermission: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/auth/menu-permissions/${id}`);
  },

  // Tenants Management
  getTenants: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenants');
      return response.data!;
    } catch (error) {
      console.error('Error fetching tenants:', error);
      return [];
    }
  },
}; 