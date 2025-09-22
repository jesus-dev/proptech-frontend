"use client";

import React, { useState, useEffect } from "react";
import { 
  PlusIcon, 
  DocumentDuplicateIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { ContractTemplate, TemplateFormData } from "./types";
import { templateService } from "./services/templateService";
import TemplateForm from "./components/TemplateForm";
import TemplatePreview from "./components/TemplatePreview";
import DeleteConfirmationDialog from "./components/DeleteConfirmationDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useRouter } from "next/navigation";

export default function ContractTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    templateId: string;
    templateName: string;
  }>({
    isOpen: false,
    templateId: "",
    templateName: "",
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const fetchedTemplates = await templateService.getAllTemplates();
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error('❌ ContractTemplatesPage: Error fetching templates:', error);
      setError('Error al cargar las plantillas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplate = () => {
    router.push("/contracts/templates/create");
  };

  const handleDeleteTemplate = async () => {
    try {
      await templateService.deleteTemplate(deleteDialog.templateId);
      setTemplates(prev => prev.filter(t => t.id !== deleteDialog.templateId));
      setDeleteDialog({ isOpen: false, templateId: "", templateName: "" });
    } catch (error) {
      console.error('❌ ContractTemplatesPage: Error deleting template:', error);
      alert('Error al eliminar la plantilla');
    }
  };

  const handleDuplicateTemplate = async (template: ContractTemplate) => {
    const newName = `${template.name} (Copia)`;
    try {
      const duplicatedTemplate = await templateService.duplicateTemplate(template.id, newName);
      setTemplates(prev => [...prev, duplicatedTemplate]);
    } catch (error) {
      console.error('❌ ContractTemplatesPage: Error duplicating template:', error);
      alert('Error al duplicar la plantilla');
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SALE":
        return "bg-green-100 text-green-800";
      case "RENT":
        return "bg-blue-100 text-blue-800";
      case "BROKERAGE":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <LoadingSpinner size="md" />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar plantillas
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Plantillas de Contratos
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Gestiona las plantillas para diferentes tipos de contratos
              </p>
            </div>
            <button
              onClick={handleCreateTemplate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nueva Plantilla
            </button>
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-12">
            <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay plantillas</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comienza creando tu primera plantilla de contrato.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateTemplate}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nueva Plantilla
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {template.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                          template.type
                        )}`}
                      >
                        {getTypeLabel(template.type)}
                      </span>
                    </div>
                    {template.isDefault && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Predeterminada
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span>
                      {template.variables?.length || 0} variables
                    </span>
                    <span>
                      {template.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log('🔍 Click en botón Ver:', template);
                          router.push(`/contracts/templates/view/${template.id}`);
                        }}
                        className="inline-flex items-center p-2 text-gray-600 hover:text-brand-700 hover:bg-brand-50 dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-300"
                        title="Vista previa"
                        style={{ minWidth: 40, minHeight: 40, justifyContent: 'center', alignItems: 'center', display: 'flex' }}
                      >
                        <EyeIcon className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => {
                          console.log('🔍 Click en botón Editar:', template);
                          router.push(`/contracts/templates/edit/${template.id}`);
                        }}
                        className="inline-flex items-center p-2 text-gray-600 hover:text-brand-700 hover:bg-brand-50 dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-300"
                        title="Editar"
                        style={{ minWidth: 40, minHeight: 40, justifyContent: 'center', alignItems: 'center', display: 'flex' }}
                      >
                        <PencilIcon className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleDuplicateTemplate(template)}
                        className="inline-flex items-center p-2 text-gray-600 hover:text-brand-700 hover:bg-brand-50 dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-300"
                        title="Duplicar"
                        style={{ minWidth: 40, minHeight: 40, justifyContent: 'center', alignItems: 'center', display: 'flex' }}
                      >
                        <DocumentDuplicateIcon className="w-6 h-6" />
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        setDeleteDialog({
                          isOpen: true,
                          templateId: template.id,
                          templateName: template.name,
                        })
                      }
                      className="inline-flex items-center p-2 text-red-600 hover:text-white hover:bg-red-500 dark:text-red-400 dark:hover:bg-red-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                      title="Eliminar"
                      style={{ minWidth: 40, minHeight: 40, justifyContent: 'center', alignItems: 'center', display: 'flex' }}
                    >
                      <TrashIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, templateId: "", templateName: "" })}
        onConfirm={handleDeleteTemplate}
        title="Eliminar Plantilla"
        message={`¿Estás seguro de que deseas eliminar la plantilla "${deleteDialog.templateName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
} 