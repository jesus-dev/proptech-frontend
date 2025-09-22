export interface Agency {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  active?: boolean;
}

export interface AgencyFormData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  active?: boolean;
}

export interface AgencyFilters {
  searchTerm: string;
  active: boolean | null;
}

export interface AgencyStats {
  total: number;
  active: number;
  inactive: number;
} 