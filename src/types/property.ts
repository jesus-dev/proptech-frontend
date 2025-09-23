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