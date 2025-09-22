"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { templateService } from "../templates/services/templateService";
import { ContractTemplate } from "../templates/types";
import { Contract } from "../components/types";
import { contractService } from "../services/contractService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, ArrowLeftIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { lazy } from "react";

// Error Boundary simple
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ ErrorBoundary: Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error al cargar el formulario
          </h3>
          <p className="text-red-600 mb-4">
            Hubo un problema al cargar el formulario de contrato. Por favor, intente nuevamente.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Importar dinámicamente el ContractForm para evitar problemas de dependencias circulares
const ContractForm = lazy(() => {
  console.log('🔍 NewContractPage: Loading ContractForm component...');
  return import("../components/ContractForm").then(module => {
    console.log('✅ NewContractPage: ContractForm loaded successfully');
    return module;
  }).catch(error => {
    console.error('❌ NewContractPage: Error loading ContractForm:', error);
    throw error;
  });
});

export default function NewContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [showContractForm, setShowContractForm] = useState(false);

  useEffect(() => {
    console.log('🔍 NewContractPage: Component mounted, fetching templates...');
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      console.log('🔍 NewContractPage: Starting to fetch templates...');
      setLoading(true);
      const fetchedTemplates = await templateService.getAllTemplates();
      console.log('✅ NewContractPage: Templates fetched successfully:', fetchedTemplates.length, 'templates');
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error('❌ NewContractPage: Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: ContractTemplate) => {
    console.log('🔍 NewContractPage: Template selected:', template.name, 'with', template.variables?.length || 0, 'variables');
    setSelectedTemplate(template);
    setShowContractForm(true);
  };

  const handleSaveNewContract = async (formData: Omit<Contract, "id" | "generatedDocumentUrl">) => {
    try {
      console.log('🔍 NewContractPage: Saving new contract with data:', formData);
      setLoading(true);
      await contractService.createContract(formData);
      console.log('✅ NewContractPage: Contract created successfully');
      alert("Contrato creado exitosamente!");
      router.push("/contracts");
    } catch (error) {
      console.error("❌ NewContractPage: Error al crear el contrato:", error);
      alert("Error al crear el contrato. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    console.log('🔍 NewContractPage: Back button clicked, showContractForm:', showContractForm);
    if (showContractForm) {
      setShowContractForm(false);
      setSelectedTemplate(null);
    } else {
      router.push("/contracts");
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
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "RENT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "BROKERAGE":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <LoadingSpinner size="md" />;
  }

  if (showContractForm && selectedTemplate) {
    console.log('🔍 NewContractPage: Rendering contract form with template:', selectedTemplate.name);
    console.log('🔍 NewContractPage: Template variables:', selectedTemplate.variables);
    console.log('🔍 NewContractPage: Template content length:', selectedTemplate.content?.length || 0);
    
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="bg-white p-8 max-w-3xl mx-auto rounded-lg shadow">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Volver a seleccionar plantilla
            </button>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedTemplate.type)}`}>
                {getTypeLabel(selectedTemplate.type)}
              </span>
              {selectedTemplate.isDefault && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                  Predeterminada
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              Nuevo Contrato - {selectedTemplate.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {selectedTemplate.description}
            </p>
          </div>
          
          <React.Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Cargando formulario...</span>
            </div>
          }>
            <ErrorBoundary>
              <ContractForm
                onSubmit={handleSaveNewContract}
                onCancel={handleBack}
                templateVariables={selectedTemplate.variables}
                initialData={{
                  title: selectedTemplate.name,
                  type: selectedTemplate.type === "BROKERAGE" ? "MANAGEMENT" : selectedTemplate.type as "SALE" | "RENT" | "MANAGEMENT",
                  templateContent: selectedTemplate.content,
                  status: "DRAFT",
                  clientName: "",
                  clientIdentification: "",
                  brokerName: "",
                  brokerId: "",
                  commissionPercentage: 3.0,
                  propertyAddress: "",
                  propertyDescription: "",
                  startDate: new Date().toISOString().split("T")[0],
                  amount: 0,
                  currency: "USD",
                  clientId: undefined,
                  agentId: undefined,
                  propertyId: undefined,
                }}
              />
            </ErrorBoundary>
          </React.Suspense>
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
            Volver a Contratos
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Crear Nuevo Contrato
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Selecciona una plantilla para comenzar a crear tu contrato
            </p>
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay plantillas disponibles</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Primero necesitas crear plantillas de contratos.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push("/contracts/templates/create")}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                Crear Primera Plantilla
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTemplateSelect(template)}
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
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

                  <div className="flex justify-end">
                    <button
                      className="inline-flex items-center px-3 py-1 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                    >
                      Usar Plantilla
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 