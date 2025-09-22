import { UserRole, Permission, UserPermissions } from '@/types/auth';

class PermissionService {
  private rolePermissions: Record<UserRole, UserPermissions> = {
    [UserRole.ADMIN]: {
      [Permission.VIEW_SUBSCRIPTIONS]: true,
      [Permission.MANAGE_SUBSCRIPTIONS]: true,
      [Permission.VIEW_SUBSCRIPTION_PLANS]: true,
      [Permission.MANAGE_SUBSCRIPTION_PLANS]: true,
      [Permission.VIEW_SALES_AGENTS]: true,
      [Permission.MANAGE_SALES_AGENTS]: true,
      [Permission.VIEW_AGENT_PERFORMANCE]: true,
      [Permission.VIEW_COMMISSIONS]: true,
      [Permission.MANAGE_COMMISSIONS]: true,
      [Permission.VIEW_COMMISSION_REPORTS]: true,
      [Permission.VIEW_PROPERTIES]: true,
      [Permission.MANAGE_PROPERTIES]: true,
      [Permission.PUBLISH_PROPERTIES]: true,
      [Permission.VIEW_USERS]: true,
      [Permission.MANAGE_USERS]: true,
      [Permission.VIEW_ANALYTICS]: true,
      [Permission.VIEW_REPORTS]: true,
      [Permission.VIEW_SETTINGS]: true,
      [Permission.MANAGE_SETTINGS]: true,
    },
    [UserRole.MANAGER]: {
      [Permission.VIEW_SUBSCRIPTIONS]: true,
      [Permission.MANAGE_SUBSCRIPTIONS]: true,
      [Permission.VIEW_SUBSCRIPTION_PLANS]: true,
      [Permission.VIEW_SALES_AGENTS]: true,
      [Permission.MANAGE_SALES_AGENTS]: true,
      [Permission.VIEW_AGENT_PERFORMANCE]: true,
      [Permission.VIEW_COMMISSIONS]: true,
      [Permission.MANAGE_COMMISSIONS]: true,
      [Permission.VIEW_COMMISSION_REPORTS]: true,
      [Permission.VIEW_PROPERTIES]: true,
      [Permission.MANAGE_PROPERTIES]: true,
      [Permission.PUBLISH_PROPERTIES]: true,
      [Permission.VIEW_USERS]: true,
      [Permission.VIEW_ANALYTICS]: true,
      [Permission.VIEW_REPORTS]: true,
      [Permission.VIEW_SETTINGS]: true,
    },
    [UserRole.AGENT]: {
      [Permission.VIEW_SUBSCRIPTIONS]: true,
      [Permission.VIEW_SUBSCRIPTION_PLANS]: true,
      [Permission.VIEW_PROPERTIES]: true,
      [Permission.PUBLISH_PROPERTIES]: true,
      [Permission.VIEW_COMMISSIONS]: true,
      [Permission.VIEW_ANALYTICS]: true,
    },
    [UserRole.VIEWER]: {
      [Permission.VIEW_SUBSCRIPTIONS]: true,
      [Permission.VIEW_SUBSCRIPTION_PLANS]: true,
      [Permission.VIEW_PROPERTIES]: true,
      [Permission.VIEW_ANALYTICS]: true,
    },
    [UserRole.CUSTOMER]: {
      [Permission.VIEW_SUBSCRIPTIONS]: true,
      [Permission.VIEW_SUBSCRIPTION_PLANS]: true,
      [Permission.VIEW_PROPERTIES]: true,
    },
  };

  /**
   * Obtiene los permisos para un rol específico
   */
  getPermissionsForRole(role: UserRole): UserPermissions {
    return this.rolePermissions[role] || {};
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  hasPermission(userPermissions: UserPermissions, permission: Permission): boolean {
    return userPermissions[permission] === true;
  }

  /**
   * Verifica si un usuario tiene al menos uno de los permisos especificados
   */
  hasAnyPermission(userPermissions: UserPermissions, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userPermissions, permission));
  }

  /**
   * Verifica si un usuario tiene todos los permisos especificados
   */
  hasAllPermissions(userPermissions: UserPermissions, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userPermissions, permission));
  }

  /**
   * Obtiene los permisos requeridos para una ruta específica
   */
  getRequiredPermissionsForRoute(route: string): Permission[] {
    const routePermissions: Record<string, Permission[]> = {
      '/subscriptions': [Permission.VIEW_SUBSCRIPTIONS],
      '/subscriptions/admin': [Permission.MANAGE_SUBSCRIPTIONS],
      '/subscriptions/admin/plans': [Permission.MANAGE_SUBSCRIPTION_PLANS],
      '/subscriptions/admin/subscriptions': [Permission.MANAGE_SUBSCRIPTIONS],
      '/subscriptions/admin/sales-agents': [Permission.MANAGE_SALES_AGENTS],
      '/subscriptions/admin/commissions': [Permission.MANAGE_COMMISSIONS],
      '/properties': [Permission.VIEW_PROPERTIES],
      '/properties/admin': [Permission.MANAGE_PROPERTIES],
      '/users': [Permission.VIEW_USERS],
      '/users/admin': [Permission.MANAGE_USERS],
      '/analytics': [Permission.VIEW_ANALYTICS],
      '/reports': [Permission.VIEW_REPORTS],
      '/settings': [Permission.VIEW_SETTINGS],
      '/settings/admin': [Permission.MANAGE_SETTINGS],
    };

    return routePermissions[route] || [];
  }

  /**
   * Verifica si un usuario puede acceder a una ruta específica
   */
  canAccessRoute(userPermissions: UserPermissions, route: string): boolean {
    const requiredPermissions = this.getRequiredPermissionsForRoute(route);
    
    if (requiredPermissions.length === 0) {
      return true; // Ruta pública
    }

    return this.hasAllPermissions(userPermissions, requiredPermissions);
  }

  /**
   * Obtiene las rutas disponibles para un usuario según sus permisos
   */
  getAvailableRoutes(userPermissions: UserPermissions): string[] {
    const allRoutes = [
      '/subscriptions',
      '/subscriptions/admin',
      '/subscriptions/admin/plans',
      '/subscriptions/admin/subscriptions',
      '/subscriptions/admin/sales-agents',
      '/subscriptions/admin/commissions',
      '/properties',
      '/properties/admin',
      '/users',
      '/users/admin',
      '/analytics',
      '/reports',
      '/settings',
      '/settings/admin',
    ];

    return allRoutes.filter(route => this.canAccessRoute(userPermissions, route));
  }

  /**
   * Obtiene el rol más alto que tiene un permiso específico
   */
  getHighestRoleForPermission(permission: Permission): UserRole {
    const roleHierarchy = [UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT, UserRole.VIEWER, UserRole.CUSTOMER];
    
    for (const role of roleHierarchy) {
      if (this.hasPermission(this.getPermissionsForRole(role), permission)) {
        return role;
      }
    }
    
    return UserRole.CUSTOMER;
  }

  /**
   * Verifica si un rol puede ser asignado por otro rol
   */
  canAssignRole(assignerRole: UserRole, targetRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.ADMIN]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT, UserRole.VIEWER, UserRole.CUSTOMER],
      [UserRole.MANAGER]: [UserRole.AGENT, UserRole.VIEWER, UserRole.CUSTOMER],
      [UserRole.AGENT]: [UserRole.VIEWER, UserRole.CUSTOMER],
      [UserRole.VIEWER]: [UserRole.CUSTOMER],
      [UserRole.CUSTOMER]: [],
    };

    return roleHierarchy[assignerRole]?.includes(targetRole) || false;
  }
}

export const permissionService = new PermissionService();
