import { UserRole, PermissionEnum, UserPermissions } from '@/types/auth';

class PermissionService {
  private rolePermissions: Record<UserRole, UserPermissions> = {
    [UserRole.ADMIN]: {
      [PermissionEnum.VIEW_SUBSCRIPTIONS]: true,
      [PermissionEnum.MANAGE_SUBSCRIPTIONS]: true,
      [PermissionEnum.VIEW_SUBSCRIPTION_PLANS]: true,
      [PermissionEnum.MANAGE_SUBSCRIPTION_PLANS]: true,
      [PermissionEnum.VIEW_SALES_AGENTS]: true,
      [PermissionEnum.MANAGE_SALES_AGENTS]: true,
      [PermissionEnum.VIEW_AGENT_PERFORMANCE]: true,
      [PermissionEnum.VIEW_COMMISSIONS]: true,
      [PermissionEnum.MANAGE_COMMISSIONS]: true,
      [PermissionEnum.VIEW_COMMISSION_REPORTS]: true,
      [PermissionEnum.VIEW_PROPERTIES]: true,
      [PermissionEnum.MANAGE_PROPERTIES]: true,
      [PermissionEnum.PUBLISH_PROPERTIES]: true,
      [PermissionEnum.VIEW_USERS]: true,
      [PermissionEnum.MANAGE_USERS]: true,
      [PermissionEnum.VIEW_ANALYTICS]: true,
      [PermissionEnum.VIEW_REPORTS]: true,
      [PermissionEnum.VIEW_SETTINGS]: true,
      [PermissionEnum.MANAGE_SETTINGS]: true,
    },
    [UserRole.MANAGER]: {
      [PermissionEnum.VIEW_SUBSCRIPTIONS]: true,
      [PermissionEnum.MANAGE_SUBSCRIPTIONS]: true,
      [PermissionEnum.VIEW_SUBSCRIPTION_PLANS]: true,
      [PermissionEnum.VIEW_SALES_AGENTS]: true,
      [PermissionEnum.MANAGE_SALES_AGENTS]: true,
      [PermissionEnum.VIEW_AGENT_PERFORMANCE]: true,
      [PermissionEnum.VIEW_COMMISSIONS]: true,
      [PermissionEnum.MANAGE_COMMISSIONS]: true,
      [PermissionEnum.VIEW_COMMISSION_REPORTS]: true,
      [PermissionEnum.VIEW_PROPERTIES]: true,
      [PermissionEnum.MANAGE_PROPERTIES]: true,
      [PermissionEnum.PUBLISH_PROPERTIES]: true,
      [PermissionEnum.VIEW_USERS]: true,
      [PermissionEnum.VIEW_ANALYTICS]: true,
      [PermissionEnum.VIEW_REPORTS]: true,
      [PermissionEnum.VIEW_SETTINGS]: true,
    },
    [UserRole.AGENT]: {
      [PermissionEnum.VIEW_SUBSCRIPTIONS]: true,
      [PermissionEnum.VIEW_SUBSCRIPTION_PLANS]: true,
      [PermissionEnum.VIEW_PROPERTIES]: true,
      [PermissionEnum.PUBLISH_PROPERTIES]: true,
      [PermissionEnum.VIEW_COMMISSIONS]: true,
      [PermissionEnum.VIEW_ANALYTICS]: true,
    },
    [UserRole.VIEWER]: {
      [PermissionEnum.VIEW_SUBSCRIPTIONS]: true,
      [PermissionEnum.VIEW_SUBSCRIPTION_PLANS]: true,
      [PermissionEnum.VIEW_PROPERTIES]: true,
      [PermissionEnum.VIEW_ANALYTICS]: true,
    },
    [UserRole.CUSTOMER]: {
      [PermissionEnum.VIEW_SUBSCRIPTIONS]: true,
      [PermissionEnum.VIEW_SUBSCRIPTION_PLANS]: true,
      [PermissionEnum.VIEW_PROPERTIES]: true,
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
  hasPermission(userPermissions: UserPermissions, permission: PermissionEnum): boolean {
    return userPermissions[permission] === true;
  }

  /**
   * Verifica si un usuario tiene al menos uno de los permisos especificados
   */
  hasAnyPermission(userPermissions: UserPermissions, permissions: PermissionEnum[]): boolean {
    return permissions.some(permission => this.hasPermission(userPermissions, permission));
  }

  /**
   * Verifica si un usuario tiene todos los permisos especificados
   */
  hasAllPermissions(userPermissions: UserPermissions, permissions: PermissionEnum[]): boolean {
    return permissions.every(permission => this.hasPermission(userPermissions, permission));
  }

  /**
   * Obtiene los permisos requeridos para una ruta específica
   */
  getRequiredPermissionsForRoute(route: string): PermissionEnum[] {
    const routePermissions: Record<string, PermissionEnum[]> = {
      '/subscriptions': [PermissionEnum.VIEW_SUBSCRIPTIONS],
      '/subscriptions/admin': [PermissionEnum.MANAGE_SUBSCRIPTIONS],
      '/subscriptions/admin/plans': [PermissionEnum.MANAGE_SUBSCRIPTION_PLANS],
      '/subscriptions/admin/subscriptions': [PermissionEnum.MANAGE_SUBSCRIPTIONS],
      '/subscriptions/admin/sales-agents': [PermissionEnum.MANAGE_SALES_AGENTS],
      '/subscriptions/admin/commissions': [PermissionEnum.MANAGE_COMMISSIONS],
      '/properties': [PermissionEnum.VIEW_PROPERTIES],
      '/properties/admin': [PermissionEnum.MANAGE_PROPERTIES],
      '/users': [PermissionEnum.VIEW_USERS],
      '/users/admin': [PermissionEnum.MANAGE_USERS],
      '/analytics': [PermissionEnum.VIEW_ANALYTICS],
      '/reports': [PermissionEnum.VIEW_REPORTS],
      '/settings': [PermissionEnum.VIEW_SETTINGS],
      '/settings/admin': [PermissionEnum.MANAGE_SETTINGS],
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
  getHighestRoleForPermission(permission: PermissionEnum): UserRole {
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
    const roleHierarchy: Record<UserRole, UserRole[]> = {
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
