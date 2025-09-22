export type DevelopmentStatus = "available" | "sold" | "reserved" | "rented";
export type DevelopmentType = "loteamiento" | "edificio" | "condominio" | "barrio_cerrado";
export type PaymentStatus = "pending" | "paid" | "overdue" | "cancelled";
export type PaymentMethod = "cash" | "bank_transfer" | "check" | "credit_card";

// Nuevos tipos para el sistema de administración
export type UnitType = "LOT" | "DEPARTAMENTO" | "HOUSE" | "TOWNHOUSE" | "DUPLEX" | "PENTHOUSE" | "STUDIO" | "OFFICE" | "COMMERCIAL" | "WAREHOUSE" | "PARKING" | "STORAGE";
export type UnitStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "UNDER_CONSTRUCTION" | "DELIVERED" | "RENTED" | "MAINTENANCE" | "UNAVAILABLE";
export type QuotaType = "INITIAL" | "MONTHLY" | "QUARTERLY" | "ANNUAL" | "FINAL" | "SPECIAL" | "MAINTENANCE" | "INSURANCE" | "TAXES";
export type QuotaStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" | "PARTIAL" | "REFUNDED";
export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "CONVERTED" | "REFUNDED";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string; // Documento Nacional de Identidad
  address: string;
  city: string;
  state: string;
  zip: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  saleId: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: PaymentStatus;
  method: PaymentMethod;
  reference?: string; // Número de referencia del pago
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  lotId?: string; // Optional
  unitId?: string; // Optional
  clientId: string;
  totalPrice: number;
  downPayment: number; // Cuota inicial
  remainingAmount: number;
  monthlyPayment: number;
  totalPayments: number; // Número total de cuotas
  startDate: string;
  endDate?: string;
  status: "active" | "completed" | "cancelled" | "defaulted";
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

// Nueva entidad DevelopmentUnit
export interface DevelopmentUnit {
  id: number;
  developmentId: number;
  unitNumber: string;
  unitName?: string;
  type: UnitType;
  status: UnitStatus;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  currencyId?: number;
  currency?: {
    id: number;
    code: string;
    name: string;
    symbol: string;
  };
  area?: number;
  areaUnit?: string;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  floor?: string;
  block?: string;
  orientation?: string;
  view?: string;
  featured?: boolean;
  premium?: boolean;
  description?: string;
  specifications?: string;
  amenities?: string;
  availableFrom?: string;
  deliveryDate?: string;
  constructionStatus?: string;
  progressPercentage?: number;
  images?: string;
  floorPlanUrl?: string;
  virtualTourUrl?: string;
  videoUrl?: string;
  views?: number;
  favoritesCount?: number;
  inquiriesCount?: number;
  notes?: string;
  internalNotes?: string;
  active?: boolean;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

// Nueva entidad DevelopmentQuota
export interface DevelopmentQuota {
  id: number;
  developmentId: number;
  unitId?: number;
  quotaNumber: string;
  quotaName: string;
  type: QuotaType;
  status: QuotaStatus;
  amount: number;
  paidAmount?: number;
  discountAmount?: number;
  currencyId?: number;
  currency?: {
    id: number;
    code: string;
    name: string;
    symbol: string;
  };
  dueDate: string;
  paidDate?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  description?: string;
  notes?: string;
  paymentMethod?: string;
  paymentReference?: string;
  processedBy?: string;
  processedAt?: string;
  active?: boolean;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

// Nueva entidad DevelopmentReservation
export interface DevelopmentReservation {
  id: number;
  developmentId: number;
  unitId: number;
  reservationNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientDocument?: string;
  status: ReservationStatus;
  reservationAmount?: number;
  totalPrice?: number;
  currencyId?: number;
  currency?: {
    id: number;
    code: string;
    name: string;
    symbol: string;
  };
  reservationDate: string;
  expirationDate: string;
  confirmationDate?: string;
  cancellationDate?: string;
  cancellationReason?: string;
  notes?: string;
  agentName?: string;
  agentId?: string;
  paymentMethod?: string;
  paymentReference?: string;
  active?: boolean;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface Lot {
  id: string;
  number: string;
  area: number; // en metros cuadrados
  price: number;
  status: DevelopmentStatus;
  coordinates: Coordinates[]; // Array de coordenadas para dibujar el polígono
  description?: string;
  sale?: Sale; // Venta asociada al lote
}

export interface Unit {
  id: string;
  floor: number;
  unitNumber: string; // "A", "B", "101", "102"
  bedrooms: number;
  bathrooms: number;
  area: number; // en metros cuadrados
  price: number;
  status: DevelopmentStatus;
  description?: string;
  sale?: Sale; // Venta o alquiler asociado a la unidad
}

export interface BaseDevelopment {
  id: string;
  type: DevelopmentType;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: DevelopmentStatus;
  currency: string; // Campo de moneda
  price?: number; // Precio general del desarrollo
  images: string[];
  privateFiles: string[];
  createdAt: string;
  updatedAt: string;
  coordinates?: Coordinates;
}

export interface Loteamiento extends BaseDevelopment {
  type: "loteamiento";
  numberOfLots: number;
  totalArea: number;
  availableLots: number;
  lotSizes: string;
  services: string[];
  lots: Lot[]; // Array de lotes/fracciones
}

export interface Edificio extends BaseDevelopment {
  type: "edificio";
  numberOfFloors: number;
  numberOfUnits: number;
  availableUnits: number;
  unitTypes: string;
  buildingFeatures?: string;
  amenities: string[];
  additionalAmenities?: string[];
  units: Unit[]; // Array de unidades/departamentos
}

export interface Condominio extends BaseDevelopment {
  type: "condominio";
  numberOfUnits: number;
  availableUnits: number;
  unitTypes: string; // e.g., "Casas de 2, 3, 4 dormitorios"
  lotSizes: string; // e.g., "Desde 200m² hasta 500m²"
  totalArea: number; // Área total del condominio
  commonAreas: string[]; // e.g., "Piscina", "Club House", "Canchas de tenis"
  securityFeatures: string[]; // e.g., "Seguridad 24/7", "Cámaras de vigilancia"
  maintenanceFee: number; // Cuota de mantenimiento mensual
  buildingFeatures?: string;
  amenities: string[];
  additionalAmenities?: string[];
  lots: Lot[]; // Array de lotes/casas del condominio
}

export interface BarrioCerrado extends BaseDevelopment {
  type: "barrio_cerrado";
  numberOfLots: number;
  availableLots: number;
  totalArea: number; // Área total del barrio cerrado
  lotSizes: string; // e.g., "Desde 800m² hasta 2000m²"
  services: string[]; // e.g., "Agua potable", "Electricidad", "Cloacas", "Gas natural"
  securityFeatures: string[]; // e.g., "Seguridad 24/7", "Cámaras de vigilancia", "Control de acceso"
  commonAreas: string[]; // e.g., "Club House", "Piscina", "Canchas de tenis", "Parque"
  maintenanceFee: number; // Cuota de mantenimiento mensual
  buildingRegulations: string; // Reglamento de construcción
  amenities: string[];
  lots: Lot[]; // Array de lotes del barrio cerrado
}

export type Development = Loteamiento | Edificio | Condominio | BarrioCerrado; 