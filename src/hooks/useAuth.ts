import { useCallback } from 'react';
import { User, UserRole, Permission, UserPermissions, PermissionEnum } from '@/types/auth';
import { permissionService } from '@/services/permissionService';
import { useAuthContext } from '@/context/AuthContext';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, login, logout, updateUser, clearError } = useAuthContext();

  // Mapear permisos del backend a permisos del frontend
  const mapBackendPermissionsToFrontend = useCallback((backendPermissions: string[]) => {
    const permissionMap: Record<string, PermissionEnum> = {
      // Mapeo de permisos del backend a permisos del frontend
      'PROPERTIES_READ': PermissionEnum.VIEW_PROPERTIES,
      'PROPERTIES_CREATE': PermissionEnum.MANAGE_PROPERTIES,
      'PROPERTIES_UPDATE': PermissionEnum.MANAGE_PROPERTIES,
      'PROPERTIES_DELETE': PermissionEnum.MANAGE_PROPERTIES,
      'USERS_READ': PermissionEnum.VIEW_USERS,
      'USERS_CREATE': PermissionEnum.MANAGE_USERS,
      'USERS_UPDATE': PermissionEnum.MANAGE_USERS,
      'USERS_DELETE': PermissionEnum.MANAGE_USERS,
      'ROLES_READ': PermissionEnum.VIEW_SETTINGS,
      'ROLES_CREATE': PermissionEnum.MANAGE_SETTINGS,
      'ROLES_UPDATE': PermissionEnum.MANAGE_SETTINGS,
      'ROLES_DELETE': PermissionEnum.MANAGE_SETTINGS,
      'SUBSCRIPTIONS_READ': PermissionEnum.VIEW_SUBSCRIPTIONS,
      'SUBSCRIPTIONS_CREATE': PermissionEnum.MANAGE_SUBSCRIPTIONS,
      'SUBSCRIPTIONS_UPDATE': PermissionEnum.MANAGE_SUBSCRIPTIONS,
      'SUBSCRIPTIONS_DELETE': PermissionEnum.MANAGE_SUBSCRIPTIONS,
      'PLANS_READ': PermissionEnum.VIEW_SUBSCRIPTION_PLANS,
      'PLANS_CREATE': PermissionEnum.MANAGE_SUBSCRIPTION_PLANS,
      'PLANS_UPDATE': PermissionEnum.MANAGE_SUBSCRIPTION_PLANS,
      'PLANS_DELETE': PermissionEnum.MANAGE_SUBSCRIPTION_PLANS,
      'PRICE_HISTORY_READ': PermissionEnum.VIEW_ANALYTICS,
      'PRICE_HISTORY_CREATE': PermissionEnum.MANAGE_SETTINGS,
      'PRICE_HISTORY_UPDATE': PermissionEnum.MANAGE_SETTINGS,
      'PRICE_HISTORY_DELETE': PermissionEnum.MANAGE_SETTINGS,
    };

    const mappedPermissions: Record<PermissionEnum, boolean> = {} as Record<PermissionEnum, boolean>;
    Object.values(PermissionEnum).forEach(p => mappedPermissions[p] = false); // Initialize all to false

    backendPermissions.forEach(bp => {
      const fePermission = permissionMap[bp];
      if (fePermission) {
        mappedPermissions[fePermission] = true;
      }
    });

    return mappedPermissions;
  }, []);

  // Verificar permisos
  const hasPermission = useCallback((permission: PermissionEnum) => {
    if (!user) return false;
    
    // Si el usuario es ADMIN (por rol), tiene todos los permisos
    if (user.roles?.includes('ADMIN') || user.roles?.includes('SUPER_ADMIN')) {
      return true;
    }
    
    // Si los permisos son un array de strings (formato del backend), mapearlos
    if (Array.isArray(user.permissions)) {
      const mappedPermissions = mapBackendPermissionsToFrontend(user.permissions);
      return mappedPermissions[permission] === true;
    }
    
    // Si los permisos son un objeto (formato del frontend), usarlos directamente
    if (typeof user.permissions === 'object' && user.permissions !== null) {
      return (user.permissions as UserPermissions)[permission] === true;
    }
    
    return false;
  }, [user, mapBackendPermissionsToFrontend]);

  // Verificar si tiene alguno de los permisos
  const hasAnyPermission = useCallback((permissions: PermissionEnum[]) => {
    if (!user) return false;

    // Si el usuario es ADMIN, tiene todos los permisos
    if (user.roles?.includes('ADMIN') || user.roles?.includes('SUPER_ADMIN')) {
      return true;
    }

    return permissions.some(permission => hasPermission(permission));
  }, [user, hasPermission]);

  // Verificar si tiene todos los permisos
  const hasAllPermissions = useCallback((permissions: PermissionEnum[]) => {
    if (!user) return false;

    // Si el usuario es ADMIN, tiene todos los permisos
    if (user.roles?.includes('ADMIN') || user.roles?.includes('SUPER_ADMIN')) {
      return true;
    }

    return permissions.every(permission => hasPermission(permission));
  }, [user, hasPermission]);

  // Verificar roles
  const hasRole = useCallback((role: UserRole) => {
    if (!user || !user.role) return false;
    return user.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles: UserRole[]) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  }, [user]);

  const hasAllRoles = useCallback((roles: UserRole[]) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  }, [user]);

  // Obtener rol del usuario
  const getUserRole = useCallback((): UserRole | null => {
    if (!user || !user.role) return null;
    return user.role;
  }, [user]);

  // Obtener permisos del usuario
  const getUserPermissions = useCallback((): UserPermissions => {
    if (!user) return {} as UserPermissions;
    
    // Si los permisos son un array de strings (formato del backend), mapearlos
    if (Array.isArray(user.permissions)) {
      return mapBackendPermissionsToFrontend(user.permissions);
    }
    
    // Si los permisos son un objeto (formato del frontend), devolverlos
    if (typeof user.permissions === 'object' && user.permissions !== null) {
      return user.permissions as UserPermissions;
    }
    
    return {} as UserPermissions;
  }, [user, mapBackendPermissionsToFrontend]);

  // Obtener permisos disponibles
  const getAvailablePermissions = useCallback((): PermissionEnum[] => {
    return Object.values(PermissionEnum);
  }, []);

  // Obtener roles disponibles
  const getAvailableRoles = useCallback((): UserRole[] => {
    return Object.values(UserRole);
  }, []);

  return {
    // Estado de autenticación (del AuthContext)
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Métodos de autenticación (del AuthContext)
    login,
    logout,
    updateUser,
    clearError,
    
    // Métodos de permisos (específicos de useAuth)
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getUserRole,
    getUserPermissions,
    getAvailablePermissions,
    getAvailableRoles,
  };
};