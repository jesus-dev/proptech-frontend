export type ContactType = "client" | "prospect" | "buyer" | "seller" | "owner";
export type ContactStatus = "active" | "inactive" | "lead" | "qualified" | "converted";

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: ContactType;
  status: ContactStatus;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
  source?: string; // How they found us
  budget?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  preferences?: {
    propertyType?: string[];
    location?: string[];
    bedrooms?: number;
    bathrooms?: number;
    area?: {
      min?: number;
      max?: number;
    };
  };
  tags?: string[];
  assignedTo?: string; // User ID
  lastContact?: string; // Last contact date
  nextFollowUp?: string; // Next follow-up date
  createdAt: string;
  updatedAt: string;
}

export type ContactFormData = Omit<Contact, "id" | "createdAt" | "updatedAt">; 