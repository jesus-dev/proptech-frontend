import { Agent, AgentFormData } from '../types';

/**
 * Hook para normalizar datos entre backend y frontend
 */
export function useAgentNormalizer() {
  
  /**
   * Normaliza un agente del backend para el frontend
   * Mapea los campos nuevos (nombre, apellido) a los legacy (firstName, lastName)
   */
  const normalizeAgent = (backendAgent: any): Agent => {
    return {
      id: backendAgent.id?.toString() || '',
      userId: backendAgent.userId?.toString() || '',
      // Campos nuevos
      nombre: backendAgent.nombre || '',
      apellido: backendAgent.apellido || '',
      nombreCompleto: backendAgent.nombreCompleto || `${backendAgent.nombre || ''} ${backendAgent.apellido || ''}`.trim(),
      telefono: backendAgent.telefono,
      email: backendAgent.email || '',
      licenciaInmobiliaria: backendAgent.licenciaInmobiliaria,
      zonaOperacion: backendAgent.zonaOperacion,
      fotoPerfilUrl: backendAgent.fotoPerfilUrl,
      position: backendAgent.position,
      bio: backendAgent.bio,
      isActive: backendAgent.isActive ?? backendAgent.active ?? true,
      // Relaciones
      agencyId: backendAgent.agencyId?.toString(),
      agencyName: backendAgent.agencyName,
      tenantId: backendAgent.tenantId,
      tenantName: backendAgent.tenantName,
      // Suscripción
      isIndependent: backendAgent.isIndependent,
      effectivePlan: backendAgent.effectivePlan,
      canOperate: backendAgent.canOperate,
      maxProperties: backendAgent.maxProperties,
      // Timestamps
      createdAt: backendAgent.createdAt || new Date().toISOString(),
      updatedAt: backendAgent.updatedAt || new Date().toISOString(),
      // Campos legacy para compatibilidad con componentes existentes
      firstName: backendAgent.nombre || backendAgent.firstName || '',
      lastName: backendAgent.apellido || backendAgent.lastName || '',
      phone: backendAgent.telefono || backendAgent.phone,
      photo: backendAgent.fotoPerfilUrl || backendAgent.photo,
      dni: backendAgent.licenciaInmobiliaria || backendAgent.dni,
      license: backendAgent.licenciaInmobiliaria || backendAgent.license,
      active: backendAgent.isActive ?? backendAgent.active ?? true,
      username: backendAgent.email,
      role: backendAgent.role || 'agente',
    };
  };

  /**
   * Convierte AgentFormData del frontend al formato del backend
   */
  const toBackendFormat = (formData: AgentFormData): any => {
    return {
      // Usar campos nuevos prioritariamente
      nombre: formData.nombre || formData.firstName,
      apellido: formData.apellido || formData.lastName,
      telefono: formData.telefono || formData.phone,
      email: formData.email,
      licenciaInmobiliaria: formData.licenciaInmobiliaria || formData.license,
      zonaOperacion: formData.zonaOperacion,
      fotoPerfilUrl: formData.fotoPerfilUrl || formData.photo,
      position: formData.position,
      bio: formData.bio,
      agencyId: formData.agencyId,
      isActive: formData.isActive ?? formData.active ?? true,
      // User
      username: formData.username,
      password: formData.password,
    };
  };

  return {
    normalizeAgent,
    toBackendFormat,
  };
}

