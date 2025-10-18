export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  pricePerSquareMeter?: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  area: number;
  address: string;
  latitude: number;
  longitude: number;
  videoUrl?: string;
  amenities: string;
  services: string;
  privateFiles: string;
  galleryImages: string;
  
  // Multi-tenant
  tenantId: number;
  tenantName?: string;
  
  // Relational fields
  propertyTypeId: number;
  propertyStatusId: number;
  cityId: number;
  agencyId?: number;
  agentId: number;
  
  // Agent information
  agent?: Agent;
  agentName?: string;
  agencyName?: string;
  
  // Display fields from API
  propertyTypeName?: string;
  propertyStatus?: string;
  cityName?: string;
  countryName?: string;
  neighborhoodName?: string;
  state?: string;
  postalCode?: string;
  zone?: string;
  
  // Sync fields
  wordpressId?: number;
  syncStatus?: string;
  syncError?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface PropertyType {
  id: number;
  name: string;
}

export interface PropertyStatus {
  id: number;
  name: string;
}

export interface Tenant {
  id: number;
  name: string;
  businessName?: string;
  ruc?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  active: boolean;
  isIndependentAgentsPool?: boolean;
  customDomain?: string;
}

export interface City {
  id: number;
  name: string;
}

export interface Agency {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
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
  // Estadísticas
  activeAgentsCount?: number;
  propertiesCount?: number;
  // Legacy
  logo?: string;
}

export interface Agent {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  fotoPerfilUrl?: string;
  licenciaInmobiliaria?: string;
  zonaOperacion?: string;
  position?: string;
  bio?: string;
  isActive: boolean;
  // Relaciones
  agencyId?: number;
  agencyName?: string;
  tenantId?: number;
  // Campos legacy para compatibilidad
  firstName?: string;
  lastName?: string;
  phone?: string;
  photo?: string;
  name?: string;
  avatar?: string;
}

export interface PropertyFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  operation?: string;
  agencyId?: string;
  agentId?: string;
  propertyTypeId?: number;
  propertyStatusId?: number;
  cityId?: number;
  sortBy?: 'price' | 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  area: number;
  address: string;
  latitude: number;
  longitude: number;
  videoUrl?: string;
  amenities: string;
  services: string;
  privateFiles: string;
  galleryImages: string;
  propertyTypeId: number;
  propertyStatusId: number;
  cityId: number;
  agencyId: number;
} 