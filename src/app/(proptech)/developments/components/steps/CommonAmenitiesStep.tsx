"use client";

import React, { useState } from "react";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";

interface CommonAmenitiesStepProps {
  formData: DevelopmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
  toggleAmenity: (amenity: string) => void;
}

export default function CommonAmenitiesStep({ formData, handleChange, errors, toggleAmenity }: CommonAmenitiesStepProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const allAmenities = [
    "Piscina",
    "Gimnasio",
    "Jardín",
    "Estacionamiento",
    "Aire acondicionado",
    "Calefacción",
    "Balcón",
    "Terraza",
    "Seguridad 24h",
    "Ascensor",
    "Amueblado",
    "Se admiten mascotas",
    "Lavandería",
    "Bodega",
    "Salón de Fiestas",
    "Área de BBQ",
    "Área de Juegos",
    "Spa",
    "Sauna",
    "Cancha de Tenis",
    "Cancha de Squash",
    "Salón de Usos Múltiples",
    "Cine",
    "Biblioteca",
    "Coworking",
  ];

  const filteredAvailableAmenities = allAmenities.filter(
    (amenity) =>
      !formData.amenities?.includes(amenity) &&
      amenity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSelectedAmenities = (formData.amenities || []).filter(
    (amenity) => amenity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Amenidades Comunes</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Seleccione las amenidades disponibles para el edificio.
        </p>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar amenidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white h-12"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Amenidades Disponibles
            </h3>
            <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 h-64 overflow-y-auto">
              {filteredAvailableAmenities.length > 0 ? (
                <ul className="space-y-2">
                  {filteredAvailableAmenities.map((amenity) => (
                    <li
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <span className="text-sm font-medium">{amenity}</span>
                      <svg
                        className="size-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No se encontraron amenidades disponibles.
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Amenidades Seleccionadas
            </h3>
            <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 h-64 overflow-y-auto">
              {filteredSelectedAmenities.length > 0 ? (
                <ul className="space-y-2">
                  {filteredSelectedAmenities.map((amenity) => (
                    <li
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className="flex items-center justify-between p-2 rounded-md cursor-pointer bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/30 transition-colors"
                    >
                      <span className="text-sm font-medium">{amenity}</span>
                      <svg
                        className="size-4 text-brand-600 dark:text-brand-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No se encontraron amenidades seleccionadas.
                </p>
              )}
            </div>
          </div>
        </div>

        {errors.amenities && (
          <p className="mt-1 text-sm text-red-500">{errors.amenities}</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Amenidades Adicionales</h3>
        <div>
          <label htmlFor="additionalAmenities" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción de Amenidades Adicionales
          </label>
          <textarea
            id="additionalAmenities"
            name="additionalAmenities"
            rows={6}
            value={formData.additionalAmenities}
            onChange={handleChange}
            placeholder="Lista de amenidades adicionales no incluidas en la lista anterior"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-4 ${
              errors.additionalAmenities ? "border-red-500" : ""
            }`}
          />
          {errors.additionalAmenities && <p className="mt-1 text-sm text-red-500">{errors.additionalAmenities}</p>}
        </div>
      </div>
    </div>
  );
} 