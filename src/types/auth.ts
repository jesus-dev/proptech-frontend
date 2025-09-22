export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  MANAGER = 'MANAGER',
  VIEWER = 'VIEWER',
  CUSTOMER = 'CUSTOMER'
}

export enum PermissionEnum {
  // Subscription Management
  VIEW_SUBSCRIPTIONS = 'VIEW_SUBSCRIPTIONS',
  MANAGE_SUBSCRIPTIONS = 'MANAGE_SUBSCRIPTIONS',
  VIEW_SUBSCRIPTION_PLANS = 'VIEW_SUBSCRIPTION_PLANS',
  MANAGE_SUBSCRIPTION_PLANS = 'MANAGE_SUBSCRIPTION_PLANS',
  
  // Sales Agents Management
  VIEW_SALES_AGENTS = 'VIEW_SALES_AGENTS',
  MANAGE_SALES_AGENTS = 'MANAGE_SALES_AGENTS',
  VIEW_AGENT_PERFORMANCE = 'VIEW_AGENT_PERFORMANCE',
  
  // Commissions
  VIEW_COMMISSIONS = 'VIEW_COMMISSIONS',
  MANAGE_COMMISSIONS = 'MANAGE_COMMISSIONS',
  VIEW_COMMISSION_REPORTS = 'VIEW_COMMISSION_REPORTS',
  
  // Properties
  VIEW_PROPERTIES = 'VIEW_PROPERTIES',
  MANAGE_PROPERTIES = 'MANAGE_PROPERTIES',
  PUBLISH_PROPERTIES = 'PUBLISH_PROPERTIES',
  
  // Users
  VIEW_USERS = 'VIEW_USERS',
  MANAGE_USERS = 'MANAGE_USERS',
  
  // Analytics
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  VIEW_REPORTS = 'VIEW_REPORTS',
  
  // Settings
  VIEW_SETTINGS = 'VIEW_SETTINGS',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS'
}

export interface UserPermissions {
  [PermissionEnum.VIEW_SUBSCRIPTIONS]?: boolean;
  [PermissionEnum.MANAGE_SUBSCRIPTIONS]?: boolean;
  [PermissionEnum.VIEW_SUBSCRIPTION_PLANS]?: boolean;
  [PermissionEnum.MANAGE_SUBSCRIPTION_PLANS]?: boolean;
  [PermissionEnum.VIEW_SALES_AGENTS]?: boolean;
  [PermissionEnum.MANAGE_SALES_AGENTS]?: boolean;
  [PermissionEnum.VIEW_AGENT_PERFORMANCE]?: boolean;
  [PermissionEnum.VIEW_COMMISSIONS]?: boolean;
  [PermissionEnum.MANAGE_COMMISSIONS]?: boolean;
  [PermissionEnum.VIEW_COMMISSION_REPORTS]?: boolean;
  [PermissionEnum.VIEW_PROPERTIES]?: boolean;
  [PermissionEnum.MANAGE_PROPERTIES]?: boolean;
  [PermissionEnum.PUBLISH_PROPERTIES]?: boolean;
  [PermissionEnum.VIEW_USERS]?: boolean;
  [PermissionEnum.MANAGE_USERS]?: boolean;
  [PermissionEnum.VIEW_ANALYTICS]?: boolean;
  [PermissionEnum.VIEW_REPORTS]?: boolean;
  [PermissionEnum.VIEW_SETTINGS]?: boolean;
  [PermissionEnum.MANAGE_SETTINGS]?: boolean;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  roles?: string[];
  userType?: string;
  permissions: UserPermissions | string[];
  isActive?: boolean;
  status?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  expiresAt?: string;
  permissions?: string[];
  roles?: string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// Interfaces para gestión de roles y permisos
export interface Permission {
  id: number;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
  category?: string;
  active?: boolean;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
  active: boolean;
} 