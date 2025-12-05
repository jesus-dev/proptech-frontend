import { apiClient } from "@/lib/api";

export interface RentalPropertyBasicInfo {
  id: number;
  title: string;
  address?: string;
  city?: string;
  featuredImage?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

export interface RentalProperty {
  id: number;
  propertyId: number;
  property: RentalPropertyBasicInfo;
  isActive: boolean;
  isVisible: boolean;
  pricePerNight: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  cleaningFee?: number;
  serviceFeePercentage?: number;
  securityDeposit?: number;
  currency: string;
  minNights?: number;
  maxNights?: number;
  checkInTime?: string;
  checkOutTime?: string;
  maxGuests?: number;
  petsAllowed?: boolean;
  petFee?: number;
  instantBooking?: boolean;
  cancellationPolicy?: string;
  houseRules?: string;
  rentalType?: string;
  averageRating?: number;
  numberOfReviews?: number;
  smokingAllowed?: boolean;
  eventsAllowed?: boolean;
  wifiAvailable?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const rentalPropertyService = {
  /**
   * Obtener todas las propiedades con configuración de rental activa
   */
  async getActiveRentalProperties(): Promise<RentalProperty[]> {
    try {
      console.log("🌐 Llamando a /api/rental-properties/active");
      const response = await apiClient.get("/api/rental-properties/active");
      console.log("📡 Respuesta del servidor:", response.data);
      console.log("📊 Cantidad de propiedades:", response.data?.length || 0);
      return response.data || [];
    } catch (error: any) {
      console.error("❌ Error fetching active rental properties:", error);
      console.error("   Status:", error.response?.status);
      console.error("   Data:", error.response?.data);
      return [];
    }
  },

  /**
   * Obtener todas las propiedades con configuración de rental
   */
  async getAllRentalProperties(): Promise<RentalProperty[]> {
    try {
      const response = await apiClient.get("/api/rental-properties");
      return response.data;
    } catch (error) {
      console.error("Error fetching rental properties:", error);
      return [];
    }
  },

  /**
   * Obtener configuración de rental por ID
   */
  async getRentalPropertyById(id: number): Promise<RentalProperty | null> {
    try {
      const response = await apiClient.get(`/api/rental-properties/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching rental property ${id}:`, error);
      return null;
    }
  },

  /**
   * Crear configuración de rental para una propiedad
   */
  async createRentalProperty(data: any): Promise<RentalProperty | null> {
    try {
      console.log("📝 Creando configuración de rental:", data);
      const response = await apiClient.post("/api/rental-properties", data);
      console.log("✅ Rental property creada:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error creating rental property:", error);
      console.error("   Status:", error.response?.status);
      console.error("   Data:", error.response?.data);
      throw error;
    }
  },

  /**
   * Actualizar configuración de rental
   */
  async updateRentalProperty(id: number, data: any): Promise<RentalProperty | null> {
    try {
      console.log("📝 Actualizando configuración de rental:", id, data);
      const response = await apiClient.put(`/api/rental-properties/${id}`, data);
      console.log("✅ Rental property actualizada:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error updating rental property:", error);
      console.error("   Status:", error.response?.status);
      console.error("   Data:", error.response?.data);
      throw error;
    }
  },

  /**
   * Obtener configuración de rental por property ID
   */
  async getRentalPropertyByPropertyId(propertyId: number): Promise<RentalProperty | null> {
    try {
      const response = await apiClient.get(`/api/rental-properties/by-property/${propertyId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No existe configuración de rental
      }
      console.error(`Error fetching rental property for property ${propertyId}:`, error);
      return null;
    }
  },
};

