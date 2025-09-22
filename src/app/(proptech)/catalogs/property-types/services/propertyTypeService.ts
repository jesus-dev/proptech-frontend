import { getEndpoint } from '../../../../../lib/api-config';

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
  const res = await fetch(getEndpoint('/api/property-types'));
  if (!res.ok) throw new Error('Error al obtener tipos de propiedad');
  return res.json();
};

// Get property type by ID
export const getPropertyTypeById = async (id: number): Promise<PropertyType | null> => {
  const res = await fetch(getEndpoint(`/api/property-types/${id}`));
  if (!res.ok) return null;
  return res.json();
};

// Create new property type
export const createPropertyType = async (data: PropertyTypeFormData): Promise<PropertyType> => {
  const res = await fetch(getEndpoint('/api/property-types'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear tipo de propiedad');
  return res.json();
};

// Update property type
export const updatePropertyType = async (id: number, data: Partial<PropertyTypeFormData>): Promise<PropertyType> => {
  const res = await fetch(getEndpoint(`/api/property-types/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar tipo de propiedad');
  return res.json();
};

// Delete property type
export const deletePropertyType = async (id: number): Promise<void> => {
  const res = await fetch(getEndpoint(`/api/property-types/${id}`), { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar tipo de propiedad');
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
  const res = await fetch(getEndpoint('/api/property-types/parents'));
  if (!res.ok) throw new Error('Error al obtener tipos padre de propiedad');
  return res.json();
};

// Get child property types of a parent
export const getChildPropertyTypes = async (parentId: number): Promise<PropertyType[]> => {
  const res = await fetch(getEndpoint(`/api/property-types/${parentId}/children`));
  if (!res.ok) throw new Error('Error al obtener tipos hijo de propiedad');
  return res.json();
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