import { apiClient } from "@/lib/api";

export interface TemporalRental {
  id: number;
  confirmationCode: string;
  property: {
    id: number;
    title: string;
    address: string;
    featuredImage?: string;
    city?: string;
  };
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestDocument?: string;
  numberOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  checkInTime: string;
  checkOutTime: string;
  pricePerNight: number;
  totalPrice: number;
  cleaningFee?: number;
  serviceFee?: number;
  taxes?: number;
  discount?: number;
  finalPrice: number;
  currency: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentReference?: string;
  paidAmount?: number;
  status: string;
  specialRequests?: string;
  notes?: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRentalDTO {
  propertyId: number;
  guestId?: number;
  guestName: string;
  guestEmail?: string;
  guestPhone: string;
  guestDocument?: string;
  numberOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
  pricePerNight?: number;
  cleaningFee?: number;
  discount?: number;
  currency?: string;
  specialRequests?: string;
  notes?: string;
}

export const temporalRentalService = {
  /**
   * Obtener todas las reservas
   */
  async getAll(): Promise<TemporalRental[]> {
    try {
      const response = await apiClient.get("/api/rentals");
      return response.data;
    } catch (error) {
      console.error("Error fetching rentals:", error);
      throw error;
    }
  },

  /**
   * Obtener reserva por ID
   */
  async getById(id: number): Promise<TemporalRental> {
    try {
      const response = await apiClient.get(`/api/rentals/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching rental ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener reserva por código de confirmación
   */
  async getByConfirmationCode(code: string): Promise<TemporalRental> {
    try {
      const response = await apiClient.get(`/api/rentals/confirmation/${code}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching rental with code ${code}:`, error);
      throw error;
    }
  },

  /**
   * Crear nueva reserva
   */
  async create(data: CreateRentalDTO): Promise<TemporalRental> {
    try {
      const response = await apiClient.post("/api/rentals", data);
      return response.data;
    } catch (error) {
      console.error("Error creating rental:", error);
      throw error;
    }
  },

  /**
   * Actualizar estado de reserva
   */
  async updateStatus(id: number, status: string): Promise<TemporalRental> {
    try {
      const response = await apiClient.patch(`/api/rentals/${id}/status?status=${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error updating rental ${id} status:`, error);
      throw error;
    }
  },

  /**
   * Hacer check-in
   */
  async checkIn(id: number): Promise<TemporalRental> {
    try {
      const response = await apiClient.post(`/api/rentals/${id}/check-in`);
      return response.data;
    } catch (error) {
      console.error(`Error checking in rental ${id}:`, error);
      throw error;
    }
  },

  /**
   * Hacer check-out
   */
  async checkOut(id: number): Promise<TemporalRental> {
    try {
      const response = await apiClient.post(`/api/rentals/${id}/check-out`);
      return response.data;
    } catch (error) {
      console.error(`Error checking out rental ${id}:`, error);
      throw error;
    }
  },

  /**
   * Verificar disponibilidad de una propiedad
   */
  async checkAvailability(propertyId: number, checkIn: string, checkOut: string): Promise<boolean> {
    try {
      const response = await apiClient.get(
        `/api/rentals/availability?propertyId=${propertyId}&checkIn=${checkIn}&checkOut=${checkOut}`
      );
      return response.data.available;
    } catch (error) {
      console.error("Error checking availability:", error);
      throw error;
    }
  },
};

