/**
 * Helpers para compatibilidad con modelo multi-tenant
 */

import { Agent, User } from '@/types/auth';

/**
 * Normaliza campos de Agent para compatibilidad con código legacy
 */
export function normalizeAgent(agent: any): any {
  return {
    ...agent,
    // Mapeo bidireccional para compatibilidad
    nombre: agent.nombre || agent.firstName,
    apellido: agent.apellido || agent.lastName,
    nombreCompleto: agent.nombreCompleto || `${agent.nombre || agent.firstName || ''} ${agent.apellido || agent.lastName || ''}`.trim(),
    telefono: agent.telefono || agent.phone,
    fotoPerfilUrl: agent.fotoPerfilUrl || agent.photo || agent.avatar,
    // Legacy
    firstName: agent.nombre || agent.firstName,
    lastName: agent.apellido || agent.lastName,
    phone: agent.telefono || agent.phone,
    photo: agent.fotoPerfilUrl || agent.photo,
    name: agent.nombreCompleto || `${agent.nombre || agent.firstName || ''} ${agent.apellido || agent.lastName || ''}`.trim(),
    avatar: agent.fotoPerfilUrl || agent.photo || agent.avatar,
  };
}

/**
 * Normaliza User para mostrar nombre según si es agente o no
 */
export function getUserDisplayName(user: User): string {
  if (user.agent?.nombreCompleto) {
    return user.agent.nombreCompleto;
  }
  if (user.fullName) {
    return user.fullName;
  }
  if (user.username) {
    return user.username;
  }
  return user.email.split('@')[0];
}

/**
 * Obtiene el nombre completo del usuario (legacy)
 */
export function getUserFullName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return getUserDisplayName(user);
}

/**
 * Obtiene las iniciales para avatar
 */
export function getUserInitials(user: User): string {
  if (user.agent) {
    const nombre = user.agent.nombre || '';
    const apellido = user.agent.apellido || '';
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }
  
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
  
  if (user.username) {
    return user.username.slice(0, 2).toUpperCase();
  }
  
  return user.email.slice(0, 2).toUpperCase();
}

/**
 * Obtiene el teléfono del usuario
 */
export function getUserPhone(user: User): string | undefined {
  return user.agent?.telefono || user.phone;
}

/**
 * Verifica si el usuario es un agente
 */
export function isUserAgent(user: User): boolean {
  return !!user.agent;
}

/**
 * Verifica si el agente es independiente
 */
export function isIndependentAgent(agent: Agent): boolean {
  return agent.isIndependent || !agent.agencyId;
}

/**
 * Formatea el nombre del agente para display
 */
export function getAgentDisplayName(agent: any): string {
  if (agent.nombreCompleto) {
    return agent.nombreCompleto;
  }
  const nombre = agent.nombre || agent.firstName || '';
  const apellido = agent.apellido || agent.lastName || '';
  if (nombre || apellido) {
    return `${nombre} ${apellido}`.trim();
  }
  return agent.email || 'Sin nombre';
}

/**
 * Obtiene la foto/avatar del agente
 */
export function getAgentPhoto(agent: any): string | undefined {
  return agent.fotoPerfilUrl || agent.photo || agent.avatar;
}

/**
 * Obtiene el teléfono del agente
 */
export function getAgentPhone(agent: any): string | undefined {
  return agent.telefono || agent.phone;
}

