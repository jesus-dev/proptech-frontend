export interface Department {
  id: number;
  name: string;
  code: string;
  countryId: number;
  countryName?: string;
  description?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentFormData {
  name: string;
  code: string;
  countryId: string;
  description: string;
  active: boolean;
}

export interface DepartmentStats {
  total: number;
  active: number;
  inactive: number;
} 