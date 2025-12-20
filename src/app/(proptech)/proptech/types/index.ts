export interface PublicRegistration {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  source: string;
  createdAt: string;
}

export interface PublicAppointment {
  id: number;
  title: string;
  description?: string;
  appointmentDate: string;
  durationMinutes: number;
  appointmentType: string;
  status: string;
  location?: string;
  locationType?: string;
  clientId: number;
  clientName?: string;
  agentId: number;
  agentName?: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ParsedRegistrationNotes {
  userType: string;
  planId: string;
  meetingDateTime: string;
}

