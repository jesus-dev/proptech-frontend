"use client";

import React, { useState } from "react";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ContractTemplate } from "../types";

interface TemplatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  template: ContractTemplate | null;
}

export default function TemplatePreview({ isOpen, onClose, template }: TemplatePreviewProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [previewContent, setPreviewContent] = useState<string>("");

  React.useEffect(() => {
    if (template) {
      // Inicializar formData con valores por defecto
      const initialData: Record<string, string> = {};
      template.variables?.forEach(variable => {
        initialData[variable.name] = variable.placeholder || `[${variable.label}]`;
      });
      setFormData(initialData);
      generatePreview(template, initialData);
    }
  }, [template]);

  const generatePreview = (template: ContractTemplate, data: Record<string, string>) => {
    let content = template.content;
    template.variables?.forEach(variable => {
      const value = data[variable.name] || `[${variable.label}]`;
      const regex = new RegExp(`{{${variable.name}}}`, 'g');
      content = content.replace(regex, value);
    });
    setPreviewContent(content);
  };

  const handleInputChange = (variableName: string, value: string) => {
    const newData = { ...formData, [variableName]: value };
    setFormData(newData);
    if (template) {
      generatePreview(template, newData);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "SALE":
        return "Venta";
      case "RENT":
        return "Alquiler";
      case "BROKERAGE":
        return "Corretaje";
      default:
        return type;
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Vista Previa: {template.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tipo: {getTypeLabel(template.type)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulario de variables */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Variables del Contrato
                </h4>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {template.variables?.map((variable, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {variable.label}
                        {variable.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {variable.type === "text" && (
                        <input
                          type="text"
                          value={formData[variable.name] || ""}
                          onChange={(e) => handleInputChange(variable.name, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder={variable.placeholder}
                        />
                      )}

                      {variable.type === "number" && (
                        <input
                          type="number"
                          value={formData[variable.name] || ""}
                          onChange={(e) => handleInputChange(variable.name, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder={variable.placeholder}
                        />
                      )}

                      {variable.type === "date" && (
                        <input
                          type="date"
                          value={formData[variable.name] || ""}
                          onChange={(e) => handleInputChange(variable.name, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      )}

                      {variable.type === "select" && (
                        <select
                          value={formData[variable.name] || ""}
                          onChange={(e) => handleInputChange(variable.name, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Seleccionar...</option>
                          {variable.options?.map((option, optionIndex) => (
                            <option key={optionIndex} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}

                      {variable.type === "textarea" && (
                        <textarea
                          value={formData[variable.name] || ""}
                          onChange={(e) => handleInputChange(variable.name, e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder={variable.placeholder}
                        />
                      )}

                      {variable.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {variable.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vista previa del contenido */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Vista Previa del Contrato
                </h4>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-sans">
                    {previewContent}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:hover:bg-gray-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 