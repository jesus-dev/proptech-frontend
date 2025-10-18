export type AgentRole = 'admin' | 'agente' | 'supervisor';

export interface Agent {
  id: string;
  // Relación 1:1 con User
  userId: string;
  // Datos del agente (modelo nuevo)
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  telefono?: string;
  email: string;
  licenciaInmobiliaria?: string;
  zonaOperacion?: string;
  fotoPerfilUrl?: string;
  position?: string;
  bio?: string;
  isActive: boolean;
  // Relaciones
  agencyId?: string;
  agencyName?: string;
  tenantId?: number;
  tenantName?: string;
  // Suscripción (si es independiente)
  isIndependent?: boolean;
  effectivePlan?: string;
  canOperate?: boolean;
  maxProperties?: number;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  // Campos legacy para compatibilidad
  firstName: string;
  lastName: string;
  phone?: string;
  photo?: string;
  dni?: string;
  license?: string;
  active?: boolean;
  username?: string;
  lastLogin?: string;
  lockedUntil?: string;
  loginAttempts?: number;
  role?: AgentRole;
}

export interface AgentFormData {
  // Datos del agente (modelo nuevo)
  nombre?: string;
  apellido?: string;
  telefono?: string;
  email: string;
  licenciaInmobiliaria?: string;
  zonaOperacion?: string;
  fotoPerfilUrl?: string;
  position?: string;
  bio?: string;
  agencyId?: string;
  isActive?: boolean;
  // User (solo para login)
  username?: string;
  password?: string;
  // Campos legacy (compatibilidad)
  firstName?: string;
  lastName?: string;
  phone?: string;
  dni?: string;
  license?: string;
  photo?: string;
  agencyName?: string;
  active?: boolean;
  role?: AgentRole;
}

export interface AgentLoginData {
  username: string;
  password: string;
}

export interface AgentSession {
  agent: Agent;
  token: string;
  expiresAt: string;
}

export interface AgentFilters {
  searchTerm: string;
  active: boolean | null;
  agencyId: string | null;
  isActive: boolean | null;
}

export interface AgentStats {
  total: number;
  active: number;
  inactive: number;
  withAgency: number;
  withoutAgency: number;
  canLogin: number;
  locked: number;
}

export interface Agency {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  // Multi-tenant
  tenantId: number;
  tenantName?: string;
  // Suscripción
  status?: string;
  subscriptionPlan?: string;
  maxAgents?: number;
  maxProperties?: number;
  canOperate?: boolean;
  daysUntilExpiration?: number;
} 