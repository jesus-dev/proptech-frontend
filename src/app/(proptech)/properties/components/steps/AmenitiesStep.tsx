"use client";
import React, { useState, useEffect } from "react";
import { PropertyFormData, PropertyFormErrors } from "../../hooks/usePropertyForm";
import { getAllAmenities, Amenity } from "@/app/(proptech)/catalogs/amenities/services/amenityService";
import EnhancedMultiSelect, { MultiSelectOption } from "@/components/form/EnhancedMultiSelect";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface AmenitiesStepProps {
  formData: PropertyFormData;
  toggleAmenity: (amenityId: number) => void;
  errors: PropertyFormErrors;
}

export default function AmenitiesStep({ formData, toggleAmenity, errors }: AmenitiesStepProps) {
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAmenities();
  }, []);

  const loadAmenities = async () => {
    try {
      setLoading(true);
      setError(null);
      const amenities = await getAllAmenities();
      setAllAmenities(amenities);
    } catch (error) {
      setError("Error al cargar las amenidades");
    } finally {
      setLoading(false);
    }
  };

  // Convertir amenidades a formato MultiSelectOption
  const amenityOptions: MultiSelectOption[] = allAmenities.map(amenity => ({
    id: amenity.id,
    name: amenity.name,
    description: amenity.description,
    category: amenity.category,
    icon: amenity.icon
  }));

  // Obtener IDs de amenidades seleccionadas
  const selectedAmenityIds = (formData.amenities || []).map(Number);

  const handleAmenitySelectionChange = (selectedIds: (string | number)[]) => {
    // Convertir a números y actualizar cada amenidad individualmente
    selectedIds.forEach(id => {
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      if (!selectedAmenityIds.includes(numericId)) {
        toggleAmenity(numericId);
      }
    });

    // Remover amenidades que ya no están seleccionadas
    selectedAmenityIds.forEach(id => {
      if (!selectedIds.includes(id)) {
        toggleAmenity(id);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={loadAmenities}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      <EnhancedMultiSelect
        options={amenityOptions}
        selected={selectedAmenityIds}
        onSelectionChange={handleAmenitySelectionChange}
        title="Amenidades"
        description="Selecciona las amenidades disponibles para la propiedad"
        searchPlaceholder="Buscar amenidades..."
        showCategories={true}
        showSearch={true}
        showCount={true}
        maxSelections={50}
        error={errors.amenities}
        loading={loading}
        emptyMessage="No hay amenidades disponibles en el sistema"
        className="max-w-6xl mx-auto"
      />

      {/* Información adicional */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">i</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Consejos para seleccionar amenidades
            </h4>
            <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Selecciona solo las amenidades que realmente están disponibles</li>
              <li>• Usa las categorías para organizar mejor las opciones</li>
              <li>• Puedes buscar por nombre, descripción o categoría</li>
              <li>• Las amenidades ayudan a mejorar la visibilidad de tu propiedad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 