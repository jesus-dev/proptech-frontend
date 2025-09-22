"use client";
import React, { useState, useEffect } from "react";
import { PropertyFormData, PropertyFormErrors } from "../../hooks/usePropertyForm";
import { getAllServices, Service } from "@/app/(proptech)/catalogs/services/servicesService";
import EnhancedMultiSelect, { MultiSelectOption } from "@/components/form/EnhancedMultiSelect";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface ServicesStepProps {
  formData: PropertyFormData;
  toggleService: (serviceId: number) => void;
  errors: PropertyFormErrors;
}

export default function ServicesStep({ formData, toggleService, errors }: ServicesStepProps) {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const services = await getAllServices();
      setAllServices(services);
    } catch (error) {
      setError("Error al cargar los servicios");
    } finally {
      setLoading(false);
    }
  };

  // Convertir servicios a formato MultiSelectOption
  const serviceOptions: MultiSelectOption[] = allServices.map(service => ({
    id: service.id,
    name: service.name,
    description: service.description,
    category: "Servicios",
    icon: service.icon
  }));

  // Obtener IDs de servicios seleccionados
  const selectedServiceIds = (formData.services || []).map(Number);

  const handleServiceSelectionChange = (selectedIds: (string | number)[]) => {
    // Convertir a números y actualizar cada servicio individualmente
    selectedIds.forEach(id => {
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      if (!selectedServiceIds.includes(numericId)) {
        toggleService(numericId);
      }
    });

    // Remover servicios que ya no están seleccionados
    selectedServiceIds.forEach(id => {
      if (!selectedIds.includes(id)) {
        toggleService(id);
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
            onClick={loadServices}
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
        options={serviceOptions}
        selected={selectedServiceIds}
        onSelectionChange={handleServiceSelectionChange}
        title="Servicios"
        description="Selecciona los servicios disponibles para la propiedad"
        searchPlaceholder="Buscar servicios..."
        showCategories={true}
        showSearch={true}
        showCount={true}
        maxSelections={30}
        error={errors.services}
        loading={loading}
        emptyMessage="No hay servicios disponibles en el sistema"
        className="max-w-6xl mx-auto"
      />

      {/* Información adicional */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">i</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
              Información sobre servicios
            </h4>
            <ul className="mt-2 text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• <strong>Incluido en alquiler:</strong> El servicio está cubierto en el precio del alquiler</li>
              <li>• <strong>Incluido en venta:</strong> El servicio está incluido en el precio de venta</li>
              <li>• <strong>Adicional:</strong> El servicio tiene un costo extra</li>
              <li>• Usa las categorías para organizar mejor los tipos de servicios</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 