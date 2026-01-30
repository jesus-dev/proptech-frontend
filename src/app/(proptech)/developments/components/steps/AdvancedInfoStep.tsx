"use client";

import React from "react";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";

interface AdvancedInfoStepProps {
  formData: DevelopmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
}

export default function AdvancedInfoStep({ formData, handleChange }: AdvancedInfoStepProps) {
  const developmentType = formData.type;

  // Determinar qué campos mostrar según el tipo
  const showParkingStorage = developmentType === "edificio" || developmentType === "condominio";
  const showInfrastructure = developmentType === "loteamiento"; // Solo para loteamiento que no tiene step de infraestructura detallado

  return (
    <div className="space-y-8">
      {/* Financiamiento y Legal */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Financiamiento y Estado Legal
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Información sobre financiación disponible y estado legal del proyecto.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Financiación disponible
            </label>
            <input
              type="text"
              name="financingOptions"
              placeholder="Contado, financiación propia, bancaria, etc."
              value={formData.financingOptions || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado legal
            </label>
            <input
              type="text"
              name="legalStatus"
              placeholder="Loteamiento aprobado, PH, en gestión, etc."
              value={formData.legalStatus || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </section>

      {/* Infraestructura - Solo para loteamiento (otros tipos ya lo tienen en sus steps) */}
      {showInfrastructure && (
        <section>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Infraestructura Adicional
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Información adicional sobre infraestructura y accesos (los servicios básicos ya están en el paso anterior).
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Infraestructura y Accesos
            </label>
            <textarea
              name="infrastructure"
              rows={3}
              placeholder="Calles, accesos principales, conectividad, etc."
              value={formData.infrastructure || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </section>
      )}

      {/* Cocheras y Depósitos - Solo para edificios y condominios */}
      {showParkingStorage && (
        <section>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Estacionamiento y Almacenamiento
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Información sobre espacios de estacionamiento y almacenamiento.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cocheras
              </label>
              <input
                type="text"
                name="parkingSpaces"
                placeholder="Ej: 1 cochera por unidad, cocheras adicionales disponibles"
                value={formData.parkingSpaces || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Depósitos / Bauleras
              </label>
              <input
                type="text"
                name="storageSpaces"
                placeholder="Ej: Baulera por unidad, depósitos adicionales"
                value={formData.storageSpaces || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </section>
      )}

      {/* Multimedia clave */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Documentos y Multimedia
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Links a documentos importantes del proyecto (opcional).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Brochure (URL)
            </label>
            <input
              type="text"
              name="brochureUrl"
              placeholder="https://..."
              value={formData.brochureUrl || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plano del Sitio / Master Plan (URL)
            </label>
            <input
              type="text"
              name="sitePlanUrl"
              placeholder="https://..."
              value={formData.sitePlanUrl || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </section>

      {/* Garantía y Notas */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Garantía y Notas
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Información de garantía y notas sobre el desarrollo.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Información de Garantía
            </label>
            <textarea
              name="warrantyInfo"
              rows={3}
              placeholder="Garantías del proyecto, escrituración, etc."
              value={formData.warrantyInfo || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas Públicas
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Información adicional visible para clientes"
              value={formData.notes || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas Internas
            </label>
            <textarea
              name="internalNotes"
              rows={2}
              placeholder="Notas internas (solo visibles para el equipo)"
              value={formData.internalNotes || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

