import { useState, useEffect } from 'react';
import { PropertyType, PropertyTypeFormData, getAllPropertyTypes, createPropertyType, updatePropertyType, deletePropertyType, getParentPropertyTypes } from '../services/propertyTypeService';

export const usePropertyTypes = () => {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [parentTypes, setParentTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPropertyTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allTypes, parentTypesData] = await Promise.all([
        getAllPropertyTypes(),
        getParentPropertyTypes()
      ]);
      setPropertyTypes(allTypes);
      setParentTypes(parentTypesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tipos de propiedad');
    } finally {
      setLoading(false);
    }
  };

  const createNewPropertyType = async (data: PropertyTypeFormData): Promise<boolean> => {
    try {
      setError(null);
      const newPropertyType = await createPropertyType(data);
      setPropertyTypes(prev => [...prev, newPropertyType]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear tipo de propiedad');
      return false;
    }
  };

  const updateExistingPropertyType = async (id: number, data: Partial<PropertyTypeFormData>): Promise<boolean> => {
    try {
      setError(null);
      const updatedPropertyType = await updatePropertyType(id, data);
      setPropertyTypes(prev => prev.map(pt => pt.id === id ? updatedPropertyType : pt));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar tipo de propiedad');
      return false;
    }
  };

  const deletePropertyTypeById = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await deletePropertyType(id);
      setPropertyTypes(prev => prev.filter(pt => pt.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar tipo de propiedad');
      return false;
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    loadPropertyTypes();
  }, []);

  return {
    propertyTypes,
    parentTypes,
    loading,
    error,
    createPropertyType: createNewPropertyType,
    updatePropertyType: updateExistingPropertyType,
    deletePropertyType: deletePropertyTypeById,
    reloadPropertyTypes: loadPropertyTypes,
    clearError,
  };
}; 