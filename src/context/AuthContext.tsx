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

  // Inicializar desde localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        // Verificar si hay token válido
        if (!token || token === 'undefined' || token === 'null') {
          // No hay token válido, limpiar todo
          localStorage.clear();
          setIsLoading(false);
          return;
        }

        // Si hay token pero no hay datos de usuario, limpiar
        if (!userData) {
          localStorage.clear();
          setIsLoading(false);
          return;
        }

        try {
          const user = JSON.parse(userData);
          
          // Validar que el usuario tenga los campos mínimos
          if (!user.id || !user.email) {
            throw new Error('Datos de usuario inválidos');
          }

          console.log('🔐 AuthContext: Usuario encontrado en localStorage:', user.email);
          
          // Si el usuario no tiene información completa de roles/permisos, obtenerla del backend
          if (!user.userType && !user.roles && (!user.permissions || (Array.isArray(user.permissions) && user.permissions.length === 0))) {
            console.log('🔐 AuthContext: Obteniendo información completa del usuario desde el backend...');
            try {
              const completeUser = await authService.getCurrentUser();
              console.log('🔐 AuthContext: Usuario completo obtenido:', completeUser);
              setUser(completeUser);
              localStorage.setItem('user', JSON.stringify(completeUser));
            } catch (backendError) {
              console.warn('🔐 AuthContext: Error obteniendo usuario del backend, usando datos locales:', backendError);
              
              // Si falla el backend pero el email sugiere que es admin, establecer como admin
              if (user.email && (user.email.includes('admin') || user.email.includes('@idear.com'))) {
                console.log('🔐 AuthContext: Detectado usuario admin por email, estableciendo permisos de admin');
                const adminUser = {
                  ...user,
                  userType: 'ADMIN',
                  roles: ['ADMIN'],
                  permissions: ['PERMISSION_READ', 'PERMISSION_CREATE', 'PERMISSION_UPDATE', 'PERMISSION_DELETE']
                };
                setUser(adminUser);
                localStorage.setItem('user', JSON.stringify(adminUser));
              } else {
                setUser(user);
              }
            }
          } else {
            setUser(user);
          }
          
          setIsAuthenticated(true);
          console.log('🔐 AuthContext: Estado de autenticación establecido a true');
        } catch (parseError) {
          // Datos corruptos, limpiar
          localStorage.clear();
          console.error('Error parsing user data:', parseError);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
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

      console.log('🔐 AuthContext: Login exitoso, guardando datos:', {
        hasToken: !!response.accessToken,
        hasUser: !!response.user,
        userEmail: response.user?.email
      });

      setUser(response.user);
      setIsAuthenticated(true);
      console.log('🔐 AuthContext: Estado de autenticación actualizado a true');
      
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

  // Permission checks
  const hasPermission = useCallback((permission: any) => {
    if (!user) return false;
    
    // Si el usuario es ADMIN (por userType, rol o email), tiene todos los permisos
    const isAdmin = user.userType === 'ADMIN' || 
                   user.roles?.includes('ADMIN') || 
                   (user.email && (user.email.includes('admin') || user.email.includes('@idear.com')));
    
    if (isAdmin) {
      console.log('🔐 AuthContext: Usuario detectado como admin, otorgando permiso:', permission);
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
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};