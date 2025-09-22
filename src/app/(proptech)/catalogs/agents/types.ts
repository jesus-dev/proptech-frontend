export type AgentRole = 'admin' | 'agente' | 'supervisor';

export interface Agent {
  id: string;
  // Datos del usuario (vienen de la relación con User)
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username?: string;
  // Datos específicos del agente
  dni?: string;
  license?: string;
  position?: string;
  bio?: string;
  photo?: string;
  agencyId?: string;
  agencyName?: string;
  isActive: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  lockedUntil?: string;
  loginAttempts?: number;
  role: AgentRole;
}

export interface AgentFormData {
  // Datos del usuario
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username?: string;
  password?: string;
  // Datos específicos del agente
  dni?: string;
  license?: string;
  position?: string;
  bio?: string;
  photo?: string;
  agencyId?: string;
  agencyName?: string;
  isActive?: boolean;
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
  active: boolean;
} 