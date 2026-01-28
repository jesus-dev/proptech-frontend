"use client";
import Image from 'next/image';
import React, { useEffect, useState } from "react";
import { 
  Square3Stack3DIcon,
  HomeIcon,
  TrashIcon,
  CurrencyDollarIcon,
  PlusIcon,
  PhotoIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { getFloorPlans, uploadFloorPlanImage, saveFloorPlans, FloorPlan } from '../../services/floorPlanService';
import { PropertyFormData } from '../../hooks/usePropertyForm';

export type FloorPlanForm = {
  title: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  priceSuffix: string;
  size: number;
  image?: string;
  description: string;
  [key: string]: unknown; // Allow dynamic property assignment
};

interface FloorPlansStepProps {
  formData?: PropertyFormData;
  floorPlans: FloorPlanForm[];
  setFloorPlans: (plans: FloorPlanForm[]) => void;
  errors?: unknown;
  handleFloorPlanImageUpload?: (planIndex: number, file: File) => Promise<string>;
}

export default function FloorPlansStep({ formData, floorPlans, setFloorPlans, errors, handleFloorPlanImageUpload }: FloorPlansStepProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});
  const propertyId = formData ? ((formData as any).id || formData.propertyId) : undefined;

  // Cargar planos desde el backend cuando hay propertyId
  useEffect(() => {
    if (propertyId) {
      setLoading(true);
      getFloorPlans(propertyId)
        .then((plans) => {
          // Convertir FloorPlan a FloorPlanForm
          const formPlans: FloorPlanForm[] = plans.map(plan => ({
            title: plan.title || '',
            bedrooms: plan.bedrooms || 0,
            bathrooms: plan.bathrooms || 0,
            price: plan.price || 0,
            priceSuffix: plan.priceSuffix || '',
            size: plan.size || 0,
            image: plan.image,
            description: plan.description || ''
          }));
          setFloorPlans(formPlans);
        })
        .catch(() => {
          // Si no hay planos o hay error, mantener los planos del formData
          console.error('Error loading floor plans');
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  // Guardar planos en el backend cuando cambian y hay propertyId
  useEffect(() => {
    if (propertyId && floorPlans.length >= 0) {
      // Debounce: esperar 1 segundo después del último cambio antes de guardar
      const timeoutId = setTimeout(() => {
        saveFloorPlans(propertyId, floorPlans).catch((error) => {
          console.error('Error auto-saving floor plans:', error);
        });
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, JSON.stringify(floorPlans)]);

  const handleChange = (idx: number, field: keyof FloorPlanForm, value: any) => {
    const updated = [...floorPlans];
    updated[idx][field] = value;
    setFloorPlans(updated);
  };

  const handleImageChange = async (idx: number, file: File | null) => {
    if (!file) return;

    setUploading({ ...uploading, [idx]: true });
    try {
      if (propertyId) {
        // Si hay propertyId, subir directamente al backend
        const imageUrl = await uploadFloorPlanImage(propertyId, file);
        handleChange(idx, "image", imageUrl);
      } else if (handleFloorPlanImageUpload) {
        // Si no hay propertyId pero hay handler, usarlo
        const imageUrl = await handleFloorPlanImageUpload(idx, file);
        handleChange(idx, "image", imageUrl);
      } else {
        // Fallback: crear URL temporal para preview
        const imageUrl = URL.createObjectURL(file);
        handleChange(idx, "image", imageUrl);
      }
    } catch (error) {
      console.error('Error uploading floor plan image:', error);
      alert('Error al subir imagen del plano. Por favor, intenta nuevamente.');
    } finally {
      setUploading({ ...uploading, [idx]: false });
    }
  };

  const handleAdd = () => {
    setFloorPlans([
      ...floorPlans,
      { title: "", bedrooms: 0, bathrooms: 0, price: 0, priceSuffix: "", size: 0, image: undefined, description: "" }
    ]);
  };

  const handleRemove = async (idx: number) => {
    if (propertyId) {
      // Si hay propertyId, actualizar la lista y guardar en el backend
      const updated = floorPlans.filter((_, i) => i !== idx);
      setFloorPlans(updated);
      try {
        await saveFloorPlans(propertyId, updated);
      } catch (error) {
        console.error('Error saving floor plans after removal:', error);
        // Revertir el cambio si falla
        setFloorPlans(floorPlans);
        alert('Error al eliminar plano. Por favor, intenta nuevamente.');
      }
    } else {
      // Si no hay propertyId, solo actualizar el estado local
      setFloorPlans(floorPlans.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Square3Stack3DIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Planos de Planta
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Agrega uno o más planos de planta para mostrar las diferentes opciones de distribución de la propiedad
        </p>
      </div>

      {/* Floor Plans List */}
      <div className="space-y-6">
        {floorPlans.map((plan, idx) => (
          <div key={idx} className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/20 rounded-lg flex items-center justify-center">
                  <HomeIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Plano {idx + 1}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Configuración del plano de planta
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                title="Eliminar plano"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Título */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Título del Plano
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Plano tipo A - 2 dormitorios"
                    value={plan.title}
                    onChange={e => handleChange(idx, "title", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  />
                </div>

                {/* Dormitorios */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dormitorios
                  </label>
                  <div className="relative">
                    <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={plan.bedrooms}
                      onChange={e => handleChange(idx, "bedrooms", Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Baños */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Baños
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 6h8" />
                      </svg>
                    </div>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={plan.bathrooms}
                      onChange={e => handleChange(idx, "bathrooms", Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Precio */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Precio
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={plan.price}
                      onChange={e => handleChange(idx, "price", Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Sufijo de Precio */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sufijo de Precio
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: /mes, /m², etc."
                    value={plan.priceSuffix}
                    onChange={e => handleChange(idx, "priceSuffix", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  />
                </div>

                {/* Tamaño */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tamaño (m²)
                  </label>
                  <div className="relative">
                    <Square3Stack3DIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={plan.size}
                      onChange={e => handleChange(idx, "size", Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Imagen */}
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Imagen del Plano
                  </label>
                  <div className="relative">
                    <PhotoIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleImageChange(idx, e.target.files?.[0] || null)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    />
                  </div>
                  {plan.image && typeof plan.image === 'string' && (
                    <div className="mt-2 relative">
                      <img 
                        src={plan.image} 
                        alt={`Plano ${idx + 1}`} 
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          // Si la imagen falla al cargar, ocultarla
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {uploading[idx] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
                          <div className="text-white text-sm">Subiendo...</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descripción
                  </label>
                  <div className="relative">
                    <DocumentTextIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      placeholder="Describe las características especiales de este plano..."
                      value={plan.description}
                      onChange={e => handleChange(idx, "description", e.target.value)}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="w-5 h-5" />
          Agregar Plano de Planta
        </button>
      </div>

      {/* Empty State */}
      {floorPlans.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Square3Stack3DIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay planos de planta
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Agrega el primer plano de planta para mostrar las opciones de distribución
          </p>
        </div>
      )}
    </div>
  );
} 