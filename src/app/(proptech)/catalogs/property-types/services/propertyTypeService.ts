import { apiClient } from '@/lib/api';

export interface PropertyType {
  id: number;
  name: string;
  description?: string;
  active?: boolean;
  parentId?: number;
  parentName?: string;
}

export interface PropertyTypeFormData {
  name: string;
  description?: string;
  active?: boolean;
  parentId?: number;
}

// Get all property types
export const getAllPropertyTypes = async (): Promise<PropertyType[]> => {
  const res = await apiClient.get('/api/property-types');
  return res.data;
};

// Get property type by ID
export const getPropertyTypeById = async (id: number): Promise<PropertyType | null> => {
  try {
    const res = await apiClient.get(`/api/property-types/${id}`);
    return res.data;
  } catch (error) {
    return null;
  }
};

// Create new property type
export const createPropertyType = async (data: PropertyTypeFormData): Promise<PropertyType> => {
  const res = await apiClient.post('/api/property-types', data);
  return res.data;
};

// Update property type
export const updatePropertyType = async (id: number, data: Partial<PropertyTypeFormData>): Promise<PropertyType> => {
  const res = await apiClient.put(`/api/property-types/${id}`, data);
  return res.data;
};

// Delete property type
export const deletePropertyType = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/property-types/${id}`);
};

// Get active property types only
export const getActivePropertyTypes = async (): Promise<PropertyType[]> => {
  try {
    const propertyTypes = await getAllPropertyTypes();
    return propertyTypes.filter(type => type.active !== false);
  } catch (error) {
    console.error('Error getting active property types:', error);
    return [];
  }
};

// Get parent property types only
export const getParentPropertyTypes = async (): Promise<PropertyType[]> => {
  const res = await apiClient.get('/api/property-types/parents');
  return res.data;
};

// Get child property types of a parent
export const getChildPropertyTypes = async (parentId: number): Promise<PropertyType[]> => {
  const res = await apiClient.get(`/api/property-types/${parentId}/children`);
  return res.data;
};

// Search property types
export const searchPropertyTypes = async (searchTerm: string): Promise<PropertyType[]> => {
  try {
    const propertyTypes = await getAllPropertyTypes();
    const term = searchTerm.toLowerCase();
    
    return propertyTypes.filter(type => 
      type.name.toLowerCase().includes(term) ||
      (type.description || '').toLowerCase().includes(term) ||
      (type.parentName || '').toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching property types:', error);
    return [];
  }
}; 