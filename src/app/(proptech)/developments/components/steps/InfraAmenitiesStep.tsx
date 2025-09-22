"use client";

import React from "react";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";
import FeatureSelector from "./FeatureSelector";

const ALL_SERVICES = [
  "Agua potable", "Electricidad subterránea", "Cloacas", "Gas natural", 
  "Calles pavimentadas", "Alumbrado público", "Fibra óptica", "Desagües pluviales"
];
const ALL_SECURITY_FEATURES = [
  "Seguridad 24/7", "Cámaras de vigilancia", "Control de acceso", 
  "Cercado perimetral", "Guardia de seguridad", "Rondas de vigilancia", "Alarma comunitaria"
];
const ALL_COMMON_AREAS = [
  "Club House", "Piscina", "Canchas de tenis", "Cancha de fútbol", "Parque", 
  "Sala de eventos", "Gimnasio", "Área de juegos infantiles", "Senda para bicicletas"
];
const ALL_AMENITIES = [
  "Jardines", "Estacionamiento de cortesía", "Sistema de riego automático", 
  "Recolección de residuos", "Mantenimiento de áreas verdes"
];

const colorSchemes = {
  services: { bg: 'bg-blue-100', text: 'text-blue-800', darkBg: 'bg-blue-900/40', darkText: 'text-blue-300', hoverText: 'text-blue-200' },
  security: { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'bg-green-900/40', darkText: 'text-green-300', hoverText: 'text-green-200' },
  areas: { bg: 'bg-purple-100', text: 'text-purple-800', darkBg: 'bg-purple-900/40', darkText: 'text-purple-300', hoverText: 'text-purple-200' },
  amenities: { bg: 'bg-gray-100', text: 'text-gray-800', darkBg: 'bg-gray-700/60', darkText: 'text-gray-300', hoverText: 'text-gray-200' },
};

interface InfraAmenitiesStepProps {
  formData: DevelopmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
}

export default function InfraAmenitiesStep({ formData, handleChange, errors }: InfraAmenitiesStepProps) {
  
  const handleSelectionChange = (fieldName: 'services' | 'securityFeatures' | 'commonAreas' | 'amenities') => (newSelection: string[]) => {
    const event = {
      target: { name: fieldName, value: newSelection }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleChange(event);
  };

  return (
    <div className="space-y-8">
      <FeatureSelector 
        title="Servicios"
        description="Selecciona los servicios que ofrece el desarrollo."
        availableItems={ALL_SERVICES}
        selectedItems={formData.services || []}
        onSelectionChange={handleSelectionChange('services')}
        itemColors={colorSchemes.services}
      />
      {errors.services && <p className="-mt-6 text-sm text-red-500">{errors.services}</p>}

      <FeatureSelector 
        title="Características de Seguridad"
        description="Define las medidas de seguridad implementadas."
        availableItems={ALL_SECURITY_FEATURES}
        selectedItems={formData.securityFeatures || []}
        onSelectionChange={handleSelectionChange('securityFeatures')}
        itemColors={colorSchemes.security}
      />
      {errors.securityFeatures && <p className="-mt-6 text-sm text-red-500">{errors.securityFeatures}</p>}
      
      <FeatureSelector 
        title="Áreas Comunes"
        description="Especifica las áreas comunes disponibles para los residentes."
        availableItems={ALL_COMMON_AREAS}
        selectedItems={formData.commonAreas || []}
        onSelectionChange={handleSelectionChange('commonAreas')}
        itemColors={colorSchemes.areas}
      />
      {errors.commonAreas && <p className="-mt-6 text-sm text-red-500">{errors.commonAreas}</p>}

      <FeatureSelector 
        title="Amenidades Adicionales"
        description="Añade otras amenidades que mejoren la calidad de vida."
        availableItems={ALL_AMENITIES}
        selectedItems={formData.amenities || []}
        onSelectionChange={handleSelectionChange('amenities')}
        itemColors={colorSchemes.amenities}
      />
      {errors.amenities && <p className="-mt-6 text-sm text-red-500">{errors.amenities}</p>}
    </div>
  );
} 