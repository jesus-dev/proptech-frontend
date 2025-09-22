"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { ContractTemplate } from "../../types";
import { templateService } from "../../services/templateService";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function TemplateViewPage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<ContractTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [previewContent, setPreviewContent] = useState<string>("");

  const templateId = params.id as string;

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const data = await templateService.getTemplateById(templateId);
      if (data) {
        setTemplate(data);
        // Inicializar formData con valores por defecto
        const initialData: Record<string, string> = {};
        data.variables?.forEach(variable => {
          initialData[variable.name] = variable.placeholder || `[${variable.label}]`;
        });
        setFormData(initialData);
        generatePreview(data, initialData);
      } else {
        setError("Plantilla no encontrada");
      }
    } catch (error) {
      console.error("Error fetching template:", error);
      setError("Error al cargar la plantilla");
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = (template: ContractTemplate, data: Record<string, string>) => {
    let content = template.content;
    template.variables?.forEach(variable => {
      const value = data[variable.name] || `[${variable.label}]`;
      const regex = new RegExp(`{{${variable.name}}}`, 'g');
      content = content.replace(regex, value);
    });
    setPreviewContent(content);
  };

  const handleVariableChange = (variableName: string, value: string) => {
    const newFormData = { ...formData, [variableName]: value };
    setFormData(newFormData);
    if (template) {
      generatePreview(template, newFormData);
    }
  };

  const handleBack = () => {
    router.push("/contracts/templates");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "Plantilla no encontrada"}
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Volver a Plantillas
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Vista Previa: {template.name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {template.description}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                template.type === "SALE" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
                template.type === "RENT" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" :
                "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
              }`}>
                {template.type === "SALE" ? "Venta" : 
                 template.type === "RENT" ? "Alquiler" : "Corretaje"}
              </span>
              {template.isDefault && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                  Predeterminada
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Variables */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Variables del Contrato
            </h2>
            {template.variables && template.variables.length > 0 ? (
              <div className="space-y-4">
                {template.variables.map((variable, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {variable.label}
                      {variable.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {variable.type === "textarea" ? (
                      <textarea
                        value={formData[variable.name] || ""}
                        onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder={variable.placeholder || `Ingrese ${variable.label.toLowerCase()}`}
                      />
                    ) : variable.type === "select" && variable.options ? (
                      <select
                        value={formData[variable.name] || ""}
                        onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Seleccione una opción</option>
                        {variable.options.map((option, optionIndex) => (
                          <option key={optionIndex} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={variable.type === "date" ? "date" : variable.type === "number" ? "number" : "text"}
                        value={formData[variable.name] || ""}
                        onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder={variable.placeholder || `Ingrese ${variable.label.toLowerCase()}`}
                      />
                    )}
                    {variable.description && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {variable.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Esta plantilla no tiene variables definidas.
              </p>
            )}
          </div>

          {/* Vista previa */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Vista Previa del Contrato
            </h2>
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900 dark:text-gray-100">
                  {previewContent}
                </pre>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  // Aquí podrías implementar la funcionalidad para descargar o imprimir
                  window.print();
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700"
              >
                Imprimir Contrato
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 