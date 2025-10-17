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
  
  // Relational fields
  propertyTypeId: number;
  propertyStatusId: number;
  cityId: number;
  agencyId: number;
  agentId?: number;
  
  // Agent information
  agent?: Agent;
  
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

export interface City {
  id: number;
  name: string;
}

export interface Agency {
  id: number;
  name: string;
  logo?: string;
}

export interface Agent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo?: string;
  // Campos computados para el frontend
  name?: string;
  company?: string;
  verified?: boolean;
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