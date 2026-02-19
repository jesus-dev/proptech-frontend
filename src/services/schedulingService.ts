import { apiClient } from '@/lib/api';

// ========== Types ==========

export interface AvailabilitySlot {
  id?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BlockedDate {
  id?: number;
  blockedDate: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface Agenda {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  defaultDuration: number;
  timezone: string;
  location?: string;
  locationType?: string;
  maxAdvanceDays: number;
  minNoticeHours: number;
  maxBookingsPerSlot: number;
  isActive: boolean;
  whatsappPhone?: string;
  whatsappMessage?: string;
  availabilities?: AvailabilitySlot[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicAgenda {
  name: string;
  slug: string;
  description?: string;
  defaultDuration: number;
  timezone: string;
  location?: string;
  locationType?: string;
  maxAdvanceDays: number;
  minNoticeHours: number;
  maxBookingsPerSlot?: number;
  whatsappPhone?: string;
  /** Días de la semana (0=Dom..6=Sáb) con disponibilidad activa */
  availableDays?: number[];
}

export interface AvailableSlot {
  time: string;
  available: boolean;
}

export interface BookingRequest {
  date: string;
  time: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  notes?: string;
}

export interface Booking {
  id: number;
  agendaId: number;
  agendaName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  notes?: string;
  status: string;
  confirmationCode: string;
  whatsappSent: boolean;
  createdAt: string;
  whatsappPhone?: string;
  whatsappLink?: string;
}

// ========== Public API (no auth) ==========

export const publicSchedulingService = {
  async getAgenda(slug: string): Promise<PublicAgenda> {
    const response = await apiClient.get(`/api/public/scheduling/${slug}`);
    return response.data;
  },

  async getAvailableSlots(slug: string, date: string): Promise<AvailableSlot[]> {
    const response = await apiClient.get(`/api/public/scheduling/${slug}/available-slots`, {
      params: { date }
    });
    return response.data;
  },

  async getAvailableDates(slug: string, from: string, to: string): Promise<string[]> {
    const response = await apiClient.get(`/api/public/scheduling/${slug}/available-dates`, {
      params: { from, to }
    });
    return response.data;
  },

  async createBooking(slug: string, data: BookingRequest): Promise<Booking> {
    const response = await apiClient.post(`/api/public/scheduling/${slug}/book`, data);
    return response.data;
  },

  async getBookingByCode(confirmationCode: string): Promise<Booking> {
    const response = await apiClient.get(`/api/public/scheduling/booking/${confirmationCode}`);
    return response.data;
  }
};

// ========== Admin API (requires auth) ==========

export const schedulingService = {
  // Agendas
  async listAgendas(): Promise<Agenda[]> {
    const response = await apiClient.get('/api/scheduling/agendas');
    return Array.isArray(response.data) ? response.data : [];
  },

  async getAgenda(id: number): Promise<Agenda> {
    const response = await apiClient.get(`/api/scheduling/agendas/${id}`);
    return response.data;
  },

  async createAgenda(data: Partial<Agenda>): Promise<Agenda> {
    const response = await apiClient.post('/api/scheduling/agendas', data);
    return response.data;
  },

  async updateAgenda(id: number, data: Partial<Agenda>): Promise<Agenda> {
    const response = await apiClient.put(`/api/scheduling/agendas/${id}`, data);
    return response.data;
  },

  async deleteAgenda(id: number): Promise<void> {
    await apiClient.delete(`/api/scheduling/agendas/${id}`);
  },

  // Availability
  async getAvailability(agendaId: number): Promise<AvailabilitySlot[]> {
    const response = await apiClient.get(`/api/scheduling/agendas/${agendaId}/availability`);
    return response.data;
  },

  async updateAvailability(agendaId: number, slots: AvailabilitySlot[]): Promise<AvailabilitySlot[]> {
    const response = await apiClient.put(`/api/scheduling/agendas/${agendaId}/availability`, slots);
    return response.data;
  },

  // Blocked Dates
  async getBlockedDates(agendaId: number): Promise<BlockedDate[]> {
    const response = await apiClient.get(`/api/scheduling/agendas/${agendaId}/blocked-dates`);
    return response.data;
  },

  async addBlockedDate(agendaId: number, data: Partial<BlockedDate>): Promise<BlockedDate> {
    const response = await apiClient.post(`/api/scheduling/agendas/${agendaId}/blocked-dates`, data);
    return response.data;
  },

  async removeBlockedDate(agendaId: number, blockedDateId: number): Promise<void> {
    await apiClient.delete(`/api/scheduling/agendas/${agendaId}/blocked-dates/${blockedDateId}`);
  },

  // Bookings
  async getBookings(agendaId: number): Promise<Booking[]> {
    const response = await apiClient.get(`/api/scheduling/agendas/${agendaId}/bookings`);
    return Array.isArray(response.data) ? response.data : [];
  },

  async updateBookingStatus(bookingId: number, status: string): Promise<Booking> {
    const response = await apiClient.put(`/api/scheduling/bookings/${bookingId}/status`, { status });
    return response.data;
  }
};
