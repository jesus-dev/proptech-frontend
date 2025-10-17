export interface SalesAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  agencyId?: string;
  agency?: {
    id: string;
    name: string;
  };
  isActive: boolean;
  experience?: number;
  propertiesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SalesAgentFilters {
  page?: number;
  limit?: number;
  search?: string;
  agencyId?: string;
  agentId?: string;
  isActive?: boolean;
  experience?: number;
  minExperience?: number;
  maxExperience?: number;
  propertiesCount?: number;
  minPropertiesCount?: number;
  maxPropertiesCount?: number;
  sortBy?: 'name' | 'experience' | 'propertiesCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
