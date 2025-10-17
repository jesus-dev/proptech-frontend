export interface PropertyType {
  value: string;
  label: string;
}

export interface PropertyStatus {
  value: string;
  label: string;
}

export interface PropertyBasicInfo {
  title: string;
  type: string;
  status: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  yearBuilt: number;
  description: string;
}

export interface PropertyDetails {
  size: number;
  lotSize: number;
  rooms: number;
  kitchens: number;
  floors: number;
  availableFrom: Date;
  additionalDetails: string;
}

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  neighborhood: string;
  locationDescription: string;
}

export interface PropertyMedia {
  featuredImage: File | null;
  galleryImages: File[];
  videoUrl: string;
  virtualTourUrl: string;
}

// Property interface moved to property.ts to avoid conflicts 