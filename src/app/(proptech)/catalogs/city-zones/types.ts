export interface CityZone {
  id: number;
  name: string;
  description?: string;
  cityId: number;
  cityName?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CityZoneFormData {
  name: string;
  description?: string;
  cityId: string;
  active: boolean;
}

export interface CityZoneFilters {
  search?: string;
  cityId?: number;
  active?: boolean;
}
