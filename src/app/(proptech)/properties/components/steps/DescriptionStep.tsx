"use client";
import React from "react";
import { PropertyFormData, PropertyFormErrors } from "../../hooks/usePropertyForm";
import dynamic from "next/dynamic";

// Importar el editor de forma dinámica para evitar problemas con SSR
const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => <p>Cargando editor...</p>,
});

interface DescriptionStepProps {
  formData: PropertyFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  errors: PropertyFormErrors;
}

export default function DescriptionStep({ formData, handleChange, errors }: DescriptionStepProps) {
  const handleEditorChange = (content: string) => {
    // Crear un evento sintético para mantener la consistencia con handleChange
    const event = {
      target: {
        name: "description",
        value: content,
      },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    handleChange(event);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Título
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Descripción <span className="text-gray-500 text-xs">(opcional)</span>
        </label>
        <div className={`border rounded-lg ${
          errors.description ? "border-red-500" : "border-gray-300"
        }`}>
          <Editor
            value={formData.description}
            onChange={handleEditorChange}
          />
        </div>
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>
    </div>
  );
} 