import { useState, useCallback, useEffect } from 'react';
import { Amenity, getAllAmenities, createAmenity, updateAmenity, deleteAmenity } from '../services/amenityService';

export function useAmenities() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAmenities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAmenities();
      setAmenities(data);
    } catch (e) {
      setError('Error al cargar amenidades');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar amenidades automáticamente al montar el componente
  useEffect(() => {
    loadAmenities();
  }, []); // Solo se ejecuta al montar

  const createNewAmenity = useCallback(async (data: { name: string; description?: string; icon?: string }) => {
    setError(null);
    try {
      await createAmenity(data);
      // Recargar amenidades después de crear
      const updatedData = await getAllAmenities();
      setAmenities(updatedData);
      return true;
    } catch (e) {
      setError('Error al crear amenidad');
      return false;
    }
  }, []);

  const updateExistingAmenity = useCallback(async (id: number, data: { name: string; description?: string; icon?: string }) => {
    setError(null);
    try {
      await updateAmenity(id, data);
      // Recargar amenidades después de actualizar
      const updatedData = await getAllAmenities();
      setAmenities(updatedData);
      return true;
    } catch (e) {
      setError('Error al actualizar amenidad');
      return false;
    }
  }, []);

  const deleteExistingAmenity = useCallback(async (id: number) => {
    setError(null);
    try {
      await deleteAmenity(id);
      // Recargar amenidades después de eliminar
      const updatedData = await getAllAmenities();
      setAmenities(updatedData);
      return true;
    } catch (e: any) {
      const errorMessage = e?.message || 'Error al eliminar amenidad';
      setError(errorMessage);
      return false;
    }
  }, []);

  return {
    amenities,
    loading,
    error,
    loadAmenities,
    createNewAmenity,
    updateExistingAmenity,
    deleteExistingAmenity,
    setError,
  };
} 