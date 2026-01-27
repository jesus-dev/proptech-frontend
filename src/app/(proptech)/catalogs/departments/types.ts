export interface Department {
  id: number;
  name: string;
  countryId: number;
  countryName?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentFormData {
  name: string;
  countryId: string;
  active: boolean;
}

export interface DepartmentStats {
  total: number;
  active: number;
  inactive: number;
} 