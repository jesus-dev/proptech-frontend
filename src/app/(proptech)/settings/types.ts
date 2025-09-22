export interface Country {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  countryId: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  cityId: string;
}

// Existing types from settingsService, moved here for better organization
export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl?: string;
}

export interface ContactSettings {
  id: string;
  name: string;
  phone: string;
  email: string;
  position: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  whatsapp?: string;
  website?: string;
}

export interface AppSettings {
  companyInfo: CompanyInfo;
  contacts: ContactSettings[];
  propertySettings: PropertySettings;
}

export interface PropertySettings {
  featured: FeaturedSettings;
  premium: PremiumSettings;
}

export interface FeaturedSettings {
  enabled: boolean;
  criteria: {
    minAmenities: number;
    minRating: number;
    minViews: number;
    allowedCities: string[];
    minYearBuilt: number;
    allowedTypes: string[];
  };
  autoSelection: boolean;
  manualSelection: string[]; // IDs de propiedades seleccionadas manualmente
}

export interface PremiumSettings {
  enabled: boolean;
  criteria: {
    minPrice: number;
    minArea: number;
    minBedrooms: number;
    luxuryAmenities: string[];
    premiumLocations: string[];
    minPriceForQuinta: number;
  };
  autoSelection: boolean;
  manualSelection: string[]; // IDs de propiedades seleccionadas manualmente
} 