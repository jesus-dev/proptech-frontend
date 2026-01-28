/**
 * Utilidad para construir el payload de Development según el tipo
 * Esta función organiza los datos según la nueva estructura de composición
 * pero mantiene compatibilidad con el backend actual
 */

import { DevelopmentFormData } from "../hooks/useDevelopmentForm";

export interface DevelopmentPayload {
  // Campos principales de Development
  type: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  price?: number; // Precio solo en DevelopmentUnit, no en Development
  originalPrice?: number; // Precio solo en DevelopmentUnit, no en Development
  discountPrice?: number; // Precio solo en DevelopmentUnit, no en Development
  images: string[];
  status: string;
  privateFiles: string[];
  featured?: boolean;
  premium?: boolean;
  active?: boolean;
  published?: boolean;
  
  // Campos que irán a DevelopmentUnits (cuando backend esté refactorizado)
  totalUnits?: number;
  availableUnits?: number;
  soldUnits?: number;
  reservedUnits?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  areaUnit?: string;
  
  // Campos que irán a DevelopmentConstruction (cuando backend esté refactorizado)
  developer?: string;
  constructionCompany?: string;
  constructionStartDate?: string;
  constructionEndDate?: string;
  deliveryDate?: string;
  constructionStatus?: string;
  progressPercentage?: number;
  
  // Campos que irán a DevelopmentStatistics (cuando backend esté refactorizado)
  views?: number;
  favoritesCount?: number;
  sharesCount?: number;
  inquiriesCount?: number;
  rating?: number;
  totalReviews?: number;
  
  // Campos que irán a DevelopmentFinancing (cuando backend esté refactorizado)
  financingOptions?: string;
  paymentPlans?: string;
  
  // Campos que irán a DevelopmentLegal (cuando backend esté refactorizado)
  legalStatus?: string;
  permits?: string;
  
  // Campos que irán a DevelopmentInfrastructure (cuando backend esté refactorizado)
  utilities?: string;
  infrastructure?: string;
  environmentalImpact?: string;
  sustainabilityFeatures?: string;
  securityFeatures?: string;
  
  // Campos que irán a DevelopmentPolicies (cuando backend esté refactorizado)
  petPolicy?: string;
  rentalPolicy?: string;
  hoaRules?: string;
  hoaContact?: string;
  hoaFees?: string;
  
  // Campos que irán a DevelopmentContact (cuando backend esté refactorizado)
  propertyManager?: string;
  managerContact?: string;
  emergencyContact?: string;
  
  // Campos que irán a DevelopmentMultimedia (cuando backend esté refactorizado)
  virtualTourUrl?: string;
  videoUrl?: string;
  brochureUrl?: string;
  floorPlanUrl?: string;
  sitePlanUrl?: string;
  masterPlanUrl?: string;
  specificationsUrl?: string;
  
  // Campos que irán a DevelopmentWarranty (cuando backend esté refactorizado)
  warrantyInfo?: string;
  warrantyPeriod?: string;
  warrantyCoverage?: string;
  warrantyContact?: string;
  
  // Campos que irán a DevelopmentMetadata (cuando backend esté refactorizado)
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  metaTags?: string;
  tags?: string;
  
  // Campos que irán a DevelopmentNotes (cuando backend esté refactorizado)
  notes?: string;
  internalNotes?: string;
  
  // Campos específicos por tipo (irán a tablas Details)
  // Loteamiento
  numberOfLots?: number;
  totalArea?: number;
  availableLots?: number;
  lotSizes?: string;
  services?: string[];
  
  // Edificio
  numberOfFloors?: number;
  numberOfUnits?: number;
  unitTypes?: string;
  buildingFeatures?: string;
  amenities?: string[];
  additionalAmenities?: string[];
  
  // Condominio
  commonAreas?: string[];
  maintenanceFee?: number;
  
  // Barrio Cerrado
  buildingRegulations?: string;
}

/**
 * Construye el payload para crear/actualizar un desarrollo
 * Organiza los datos según el tipo de desarrollo
 */
export function buildDevelopmentPayload(
  formData: DevelopmentFormData,
  coordinates: { lat: number; lng: number } = { lat: -31.4167, lng: -64.1833 }
): DevelopmentPayload {
  const basePayload: DevelopmentPayload = {
    type: formData.type,
    title: formData.title,
    description: formData.description,
    address: formData.address,
    city: formData.city,
    state: "", // Se puede agregar después si es necesario
    zip: "", // Se puede agregar después si es necesario
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    // Price y currency se manejan solo en DevelopmentUnit, no en Development
    images: [], // Las imágenes se manejarán por separado después de crear
    status: formData.status,
    privateFiles: formData.privateFiles || [],
    featured: false,
    premium: false,
    active: true,
    published: false,
  };

  // Agregar campos específicos según el tipo
  if (formData.type === "loteamiento") {
    return {
      ...basePayload,
      numberOfLots: formData.numberOfLots,
      totalArea: formData.totalArea,
      availableLots: formData.availableLots,
      lotSizes: formData.lotSizes,
      services: formData.services,
    };
  } else if (formData.type === "edificio") {
    return {
      ...basePayload,
      numberOfFloors: formData.numberOfFloors,
      numberOfUnits: formData.numberOfUnits,
      availableUnits: formData.availableUnits,
      unitTypes: formData.unitTypes,
      amenities: formData.amenities,
      buildingFeatures: formData.buildingFeatures || "",
      additionalAmenities: formData.additionalAmenities,
    };
  } else if (formData.type === "condominio") {
    return {
      ...basePayload,
      numberOfUnits: formData.numberOfUnits,
      availableUnits: formData.availableUnits,
      unitTypes: formData.unitTypes,
      lotSizes: formData.lotSizes,
      totalArea: formData.totalArea,
      commonAreas: formData.commonAreas,
      securityFeatures: formData.securityFeatures,
      maintenanceFee: formData.maintenanceFee,
      amenities: formData.amenities,
    };
  } else if (formData.type === "barrio_cerrado") {
    return {
      ...basePayload,
      numberOfLots: formData.numberOfLots,
      availableLots: formData.availableLots,
      totalArea: formData.totalArea,
      lotSizes: formData.lotSizes,
      services: formData.services,
      securityFeatures: formData.securityFeatures,
      commonAreas: formData.commonAreas,
      maintenanceFee: formData.maintenanceFee,
      buildingRegulations: formData.buildingRegulations,
      amenities: formData.amenities,
    };
  }

  return basePayload;
}
