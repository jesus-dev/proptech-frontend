export interface NearbyFacility {
  id: number;
  name: string;
  description?: string;
  type: FacilityType;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  email?: string;
  openingHours?: string;
  distanceKm?: number;
  walkingTimeMinutes?: number;
  drivingTimeMinutes?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum FacilityType {
  HOSPITAL = 'HOSPITAL',
  SCHOOL = 'SCHOOL',
  UNIVERSITY = 'UNIVERSITY',
  SHOPPING_CENTER = 'SHOPPING_CENTER',
  SUPERMARKET = 'SUPERMARKET',
  RESTAURANT = 'RESTAURANT',
  BANK = 'BANK',
  PHARMACY = 'PHARMACY',
  GYM = 'GYM',
  PARK = 'PARK',
  TRANSPORT_STATION = 'TRANSPORT_STATION',
  GAS_STATION = 'GAS_STATION',
  POLICE_STATION = 'POLICE_STATION',
  FIRE_STATION = 'FIRE_STATION',
  POST_OFFICE = 'POST_OFFICE',
  LIBRARY = 'LIBRARY',
  CINEMA = 'CINEMA',
  THEATER = 'THEATER',
  MUSEUM = 'MUSEUM',
  SPORTS_CENTER = 'SPORTS_CENTER',
  CHURCH = 'CHURCH',
  EMBASSY = 'EMBASSY',
  GOVERNMENT_OFFICE = 'GOVERNMENT_OFFICE',
  OTHER = 'OTHER'
}

export const FacilityTypeLabels: Record<FacilityType, string> = {
  [FacilityType.HOSPITAL]: 'Hospital',
  [FacilityType.SCHOOL]: 'Escuela',
  [FacilityType.UNIVERSITY]: 'Universidad',
  [FacilityType.SHOPPING_CENTER]: 'Centro Comercial',
  [FacilityType.SUPERMARKET]: 'Supermercado',
  [FacilityType.RESTAURANT]: 'Restaurante',
  [FacilityType.BANK]: 'Banco',
  [FacilityType.PHARMACY]: 'Farmacia',
  [FacilityType.GYM]: 'Gimnasio',
  [FacilityType.PARK]: 'Parque',
  [FacilityType.TRANSPORT_STATION]: 'Estación de Transporte',
  [FacilityType.GAS_STATION]: 'Gasolinera',
  [FacilityType.POLICE_STATION]: 'Comisaría',
  [FacilityType.FIRE_STATION]: 'Bomberos',
  [FacilityType.POST_OFFICE]: 'Oficina de Correos',
  [FacilityType.LIBRARY]: 'Biblioteca',
  [FacilityType.CINEMA]: 'Cine',
  [FacilityType.THEATER]: 'Teatro',
  [FacilityType.MUSEUM]: 'Museo',
  [FacilityType.SPORTS_CENTER]: 'Centro Deportivo',
  [FacilityType.CHURCH]: 'Iglesia',
  [FacilityType.EMBASSY]: 'Embajada',
  [FacilityType.GOVERNMENT_OFFICE]: 'Oficina Gubernamental',
  [FacilityType.OTHER]: 'Otro'
};

export interface NearbyFacilityFormData {
  name: string;
  description?: string;
  type: FacilityType;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  email?: string;
  openingHours?: string;
  distanceKm?: number;
  walkingTimeMinutes?: number;
  drivingTimeMinutes?: number;
  active: boolean;
}

export interface NearbyFacilityFilters {
  searchTerm: string;
  type?: FacilityType;
  active?: boolean;
}
