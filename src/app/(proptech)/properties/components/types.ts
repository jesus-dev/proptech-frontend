import { CurrencyCode } from '@/lib/utils';

export interface Property {
  id: string;
  slug?: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  pricePerSquareMeter?: number;
  currency: CurrencyCode;
  currencyId?: number; // ID de la moneda en la base de datos
  type: string;
  status: string;
  description: string;
  images: string[];
  galleryImages?: Array<{
    id: number;
    propertyId: number;
    url: string;
    altText?: string;
    orderIndex: number;
  }>;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  amenities?: number[];
  services?: number[];
  privateFiles: { url: string; name: string }[];
  featured?: boolean;
  premium?: boolean;
  favorite?: boolean;
  agent?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    photo?: string;
  };
  yearBuilt?: number;
  parking?: number;
  createdAt?: string;
  updatedAt?: string;
  // Campo de operación (SALE, RENT, BOTH)
  operacion?: 'SALE' | 'RENT' | 'BOTH';
  // Campos de ubicación para el mapa
  latitude?: number;
  longitude?: number;
  // Campos adicionales de Houzez
  lotSize?: number;
  rooms?: number;
  kitchens?: number;
  floors?: number;
  availableFrom?: string;
  additionalDetails?: string;
  country?: string;
  neighborhood?: string;
  locationDescription?: string;
  videoUrl?: string;
  virtualTourUrl?: string;
  featuredImage?: string;
  propertyId?: string;
  propertyStatus?: string;
  propertyLabel?: string;
  propertyType?: string;
  propertyTypeLabel?: string;
  propertyStatusLabel?: string;
  propertyPrice?: number;
  propertyPriceLabel?: string;
  propertyBedrooms?: number;
  propertyBathrooms?: number;
  propertyGarage?: number;
  propertySize?: number;
  propertyLotSize?: number;
  propertyRooms?: number;
  propertyKitchens?: number;
  propertyFloors?: number;
  propertyYearBuilt?: number;
  propertyAvailableFrom?: string;
  propertyAdditionalDetails?: string;
  propertyAddress?: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
  propertyCountry?: string;
  propertyNeighborhood?: string;
  propertyLocationDescription?: string;
  propertyVideoUrl?: string;
  propertyVirtualTourUrl?: string;
  propertyFeaturedImage?: string;
  propertyGalleryImages?: string[];
  propertyPrivateFiles?: { url: string; name: string }[];
  propertyAmenities?: number[];
  propertyServices?: number[];
  propertyAgent?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    photo?: string;
  };
  department?: string;
  propertyStatusId?: number;
  propertyTypeId?: number;
  cityId?: number;
  agentId?: number;
  agencyId?: number;
  additionalPropertyTypes?: string[];
  floorPlans?: Array<{
    id?: number;
    title: string;
    bedrooms: number;
    bathrooms: number;
    price: number;
    priceSuffix: string;
    size: number;
    image?: string;
    description: string;
  }>;
  // Campos de detalles de amenities y servicios
  amenitiesDetails?: Array<{
    id: number;
    name: string;
    description: string;
    category: string;
    icon: string;
    active: boolean;
  }>;
  servicesDetails?: Array<{
    id: number;
    name: string;
    description: string;
    type: string;
    includedInRent: boolean;
    includedInSale: boolean;
    active: boolean;
  }>;
  // ...otros campos de Houzez que tu backend pueda enviar
  views?: number;
  favoritesCount?: number;
  shares?: number;
  
  // Información del Propietario (Solo CRM)
  propietarioId?: number;
  
  // Campos de referencia
  houzezId?: string;
  agencyPropertyNumber?: string;
} 