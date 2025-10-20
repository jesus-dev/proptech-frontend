"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';
import { User, LoginRequest, LoginResponse } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
  hasPermission: (permission: any) => boolean;
  hasAnyPermission: (permissions: any[]) => boolean;
  hasAllPermissions: (permissions: any[]) => boolean;
  canAccessRoute: (route: string) => boolean;
  hasRole: (role: any) => boolean;
  hasAnyRole: (roles: any[]) => boolean;
  getUserRole: () => any;
  getUserPermissions: () => any;
  getAvailableRoutes: () => string[];
  getUserContext: () => {
    canViewAll: boolean;
    agentId: number | string | null;
    agencyId: number | string | null;
    isAdmin: boolean;
    isAgent: boolean;
    isAgencyAdmin: boolean;
  };
  getFilterParams: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar desde localStorage - solo una vez
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        // Verificar si estamos en el cliente
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        // Verificar si hay token válido
        if (!token || token === 'undefined' || token === 'null') {
          // No hay token válido, limpiar todo
          if (isMounted) {
            localStorage.clear();
            setIsLoading(false);
          }
          return;
        }

        // Si hay token pero no hay datos de usuario, limpiar
        if (!userData) {
          if (isMounted) {
            localStorage.clear();
            setIsLoading(false);
          }
          return;
        }

        try {
          const user = JSON.parse(userData);
          
          // Validar que el usuario tenga los campos mínimos
          if (!user.id || !user.email) {
            throw new Error('Datos de usuario inválidos');
          }

          if (isMounted) {
            setUser(user);
            setIsAuthenticated(true);
            setIsLoading(false);
          }
        } catch (parseError) {
          // Datos corruptos, limpiar
          if (isMounted) {
            localStorage.clear();
            setIsLoading(false);
            console.error('Error parsing user data:', parseError);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error initializing auth:', error);
          localStorage.clear();
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Login
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      // Guardar en localStorage
      localStorage.setItem('token', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(response.user));

      setUser(response.user);
      setIsAuthenticated(true);
      
      return response.user;
    } catch (error: any) {
      const errorMessage = error.message || 'Error en el inicio de sesión';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      // Llamar al backend para invalidar el token
      await authService.logout();
    } catch (error) {
      console.error('Error durante logout:', error);
      // Continuar con la limpieza local aunque falle el backend
    } finally {
      // Limpiar el estado local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Update user
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get user context for API filtering
  const getUserContext = useCallback(() => {
    if (!user) {
      return { 
        canViewAll: false, 
        agentId: null, 
        agencyId: null,
        isAdmin: false,
        isAgent: false,
        isAgencyAdmin: false
      };
    }
    
    const isAdmin = user.userType === 'ADMIN' || 
                   user.roles?.includes('ADMIN') || 
                   (user.email && (user.email.includes('admin') || user.email.includes('@idear.com')));
    
    return {
      canViewAll: Boolean(isAdmin),
      agentId: user.agentId || null,
      agencyId: user.agencyId || null,
      isAdmin: Boolean(isAdmin),
      isAgent: Boolean(user.userType === 'AGENT' || user.roles?.includes('AGENT')),
      isAgencyAdmin: Boolean(user.userType === 'AGENCY_ADMIN' || user.roles?.includes('AGENCY_ADMIN')),
    };
  }, [user]);

  // Get filter parameters for API calls
  const getFilterParams = useCallback(() => {
    const context = getUserContext();
    const params: Record<string, string> = {};

    if (context.canViewAll) {
      return params; // Admin can see everything
    }

    // Agency admin can see all agents in their agency
    if (context.isAgencyAdmin && context.agencyId) {
      params.agencyId = String(context.agencyId);
      return params;
    }

    // Agent can see all properties from their agency (not just their own)
    if (context.isAgent && context.agencyId) {
      params.agencyId = String(context.agencyId);
      return params;
    }

    // If agent doesn't have agencyId but has agentId, they can only see their own
    if (context.isAgent && context.agentId && !context.agencyId) {
      params.agentId = String(context.agentId);
      return params;
    }

    return { access: 'denied' };
  }, [getUserContext]);

  // Permission checks
  const hasPermission = useCallback((permission: any) => {
    if (!user) return false;
    
    // Si el usuario es ADMIN (por userType, rol o email), tiene todos los permisos
    const isAdmin = user.userType === 'ADMIN' || 
                   user.roles?.includes('ADMIN') || 
                   (user.email && (user.email.includes('admin') || user.email.includes('@idear.com')));
    
    if (isAdmin) {
      return true;
    }
    
    if (!user.permissions) return false;
    if (Array.isArray(user.permissions)) {
      return (user.permissions as string[]).includes(permission);
    }
    return false;
  }, [user]);

  const hasAnyPermission = useCallback((permissions: any[]) => {
    if (!user) return false;
    
    // Si el usuario es ADMIN, tiene todos los permisos
    const isAdmin = user.userType === 'ADMIN' || 
                   user.roles?.includes('ADMIN') || 
                   (user.email && (user.email.includes('admin') || user.email.includes('@idear.com')));
    
    if (isAdmin) return true;
    
    if (!user.permissions) return false;
    if (Array.isArray(user.permissions)) {
      return permissions.some(permission => (user.permissions as string[]).includes(permission));
    }
    return false;
  }, [user]);

  const hasAllPermissions = useCallback((permissions: any[]) => {
    if (!user) return false;
    
    // Si el usuario es ADMIN, tiene todos los permisos
    const isAdmin = user.userType === 'ADMIN' || 
                   user.roles?.includes('ADMIN') || 
                   (user.email && (user.email.includes('admin') || user.email.includes('@idear.com')));
    
    if (isAdmin) return true;
    
    if (!user.permissions) return false;
    if (Array.isArray(user.permissions)) {
      return permissions.every(permission => (user.permissions as string[]).includes(permission));
    }
    return false;
  }, [user]);

  // Role checks
  const hasRole = useCallback((role: any) => {
    if (!user || !user.roles) return false;
    return user.roles?.includes(role) || false;
  }, [user]);

  const hasAnyRole = useCallback((roles: any[]) => {
    if (!user || !user.roles) return false;
    return roles.some(role => user.roles?.includes(role));
  }, [user]);

  // Route access
  const canAccessRoute = useCallback((route: string) => {
    if (!user) return false;
    
    // Si el usuario es ADMIN, puede acceder a todas las rutas
    if (user.userType === 'ADMIN' || user.roles?.includes('ADMIN')) {
      return true;
    }
    
    // Implementar lógica de verificación de rutas según permisos
    // Por ahora, permitir acceso a todas las rutas para usuarios autenticados
    return true;
  }, [user]);

  // Getters
  const getUserRole = useCallback(() => {
    return user?.roles?.[0] || null;
  }, [user]);

  const getUserPermissions = useCallback(() => {
    return user?.permissions || [];
  }, [user]);

  const getAvailableRoutes = useCallback(() => {
    // Implementar lógica para obtener rutas disponibles según permisos
    return ['/dash', '/profile', '/properties'];
  }, []);

  const authValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    clearError,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    hasRole,
    hasAnyRole,
    getUserRole,
    getUserPermissions,
    getAvailableRoutes,
    getUserContext,
    getFilterParams,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};