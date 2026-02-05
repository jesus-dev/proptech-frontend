"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDevelopmentForm, DevelopmentFormData } from "../hooks/useDevelopmentForm";
import TypeStep from "../components/steps/TypeStep";
import GeneralInfoStep from "../components/steps/GeneralInfoStep";
import MultimediaStep from "../components/steps/MultimediaStep";
import AdvancedInfoStep from "../components/steps/AdvancedInfoStep";
import LoteamientoSpecificStep from "../components/steps/LoteamientoSpecificStep";
import EdificioSpecificStep from "../components/steps/EdificioSpecificStep";
import CondominioSpecificStep from "../components/steps/CondominioSpecificStep";
import BarrioCerradoDetailsStep from "../components/steps/BarrioCerradoDetailsStep";
import InfraAmenitiesStep from "../components/steps/InfraAmenitiesStep";
import CommonAmenitiesStep from "../components/steps/CommonAmenitiesStep";
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  CheckCircle,
  Home,
  Settings,
  Image,
  Star,
  Building2
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api";
import { apiConfig } from "@/lib/api-config";

interface StepInfo {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  requiredFields: (keyof DevelopmentFormData)[];
  isCompleted: boolean;
  hasErrors: boolean;
}

export default function NewDevelopmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { formData, errors, handleChange, handleSubmit, resetForm, toggleAmenity, removePrivateFile, validate, addImages, removeImage, setUnits } = useDevelopmentForm();

  useEffect(() => {
    setIsInitializing(false);
  }, []);

  // Diagnóstico API: al montar la página, probar ciudades y monedas y loguear resultado (para depurar "no carga nada")
  useEffect(() => {
    const baseUrl = apiConfig.getApiUrl();
    console.log("[API Diagnóstico] Base URL:", baseUrl, "| NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL ?? "(no definida)");
    const run = async () => {
      try {
        const citiesRes = await apiClient.get("/api/cities").catch((err: any) => {
          console.error("[API Diagnóstico] GET /api/cities falló:", {
            status: err.response?.status,
            data: err.response?.data,
            code: err.code,
            message: err.message,
          });
          return null;
        });
        if (citiesRes) {
          const data = citiesRes.data;
          const isArray = Array.isArray(data);
          const len = isArray ? data.length : (data && typeof data === "object" && "content" in data ? (data as { content: unknown[] }).content?.length : "?");
          console.log("[API Diagnóstico] GET /api/cities → status", citiesRes.status, "| es array:", isArray, "| cantidad:", len);
        }
      } catch (_) {}
      try {
        const currRes = await apiClient.get("/api/currencies/active").catch((err: any) => {
          console.error("[API Diagnóstico] GET /api/currencies/active falló:", {
            status: err.response?.status,
            data: err.response?.data,
            code: err.code,
            message: err.message,
          });
          return null;
        });
        if (currRes) {
          const data = currRes.data;
          const isArray = Array.isArray(data);
          const len = isArray ? data.length : (data && typeof data === "object" && "content" in data ? (data as { content: unknown[] }).content?.length : "?");
          console.log("[API Diagnóstico] GET /api/currencies/active → status", currRes.status, "| es array:", isArray, "| cantidad:", len);
        }
      } catch (_) {}
    };
    run();
  }, []);

  // Step configuration with icons and validation
  const steps: StepInfo[] = useMemo(() => {
    const baseSteps: StepInfo[] = [
      {
        id: 1,
        title: "Tipo de Desarrollo",
        description: "Seleccione el tipo de desarrollo",
        icon: <Building2 className="h-5 w-5" />,
        requiredFields: ['type'],
        isCompleted: false,
        hasErrors: false
      },
      {
        id: 2,
        title: "Información General",
        description: "Información básica del desarrollo",
        icon: <Home className="h-5 w-5" />,
        requiredFields: ['title', 'description', 'address', 'city', 'currency', 'status'],
        isCompleted: false,
        hasErrors: false
      },
      {
        id: 3,
        title: "Multimedia",
        description: "Imágenes del desarrollo",
        icon: <Image className="h-5 w-5" />,
        requiredFields: ['images'],
        isCompleted: false,
        hasErrors: false
      },
    ];

    if (formData.type === "loteamiento") {
      return [
        ...baseSteps,
        {
          id: 4,
          title: "Detalles de Loteamiento",
          description: "Detalles específicos del loteamiento",
          icon: <Settings className="h-5 w-5" />,
          requiredFields: ['numberOfLots', 'totalArea', 'availableLots', 'lotSizes', 'services'],
          isCompleted: false,
          hasErrors: false
        },
        {
          id: 5,
          title: "Info Avanzada",
          description: "Financiamiento, políticas, contactos y multimedia avanzada",
          icon: <Settings className="h-5 w-5" />,
          requiredFields: [],
          isCompleted: false,
          hasErrors: false
        }
      ];
    }
    if (formData.type === "edificio") {
      return [
        ...baseSteps,
        {
          id: 4,
          title: "Detalles de Edificio",
          description: "Detalles específicos del edificio",
          icon: <Settings className="h-5 w-5" />,
          requiredFields: ['numberOfFloors', 'numberOfUnits', 'availableUnits'],
          isCompleted: false,
          hasErrors: false
        },
        {
          id: 5,
          title: "Amenidades Comunes",
          description: "Amenidades del edificio",
          icon: <Star className="h-5 w-5" />,
          requiredFields: ['amenities'],
          isCompleted: false,
          hasErrors: false
        },
        {
          id: 6,
          title: "Info Avanzada",
          description: "Financiamiento, políticas, contactos y multimedia avanzada",
          icon: <Settings className="h-5 w-5" />,
          requiredFields: [],
          isCompleted: false,
          hasErrors: false
        }
      ];
    }
    if (formData.type === "condominio") {
      return [
        ...baseSteps,
        {
          id: 4,
          title: "Detalles de Condominio",
          description: "Detalles específicos del condominio",
          icon: <Settings className="h-5 w-5" />,
          requiredFields: ['numberOfUnits', 'availableUnits', 'unitTypes', 'lotSizes', 'totalArea', 'maintenanceFee'],
          isCompleted: false,
          hasErrors: false
        },
        {
          id: 5,
          title: "Áreas Comunes y Amenidades",
          description: "Áreas comunes, seguridad y amenidades",
          icon: <Star className="h-5 w-5" />,
          requiredFields: ['commonAreas', 'securityFeatures', 'amenities'],
          isCompleted: false,
          hasErrors: false
        },
        {
          id: 6,
          title: "Info Avanzada",
          description: "Financiamiento, políticas, contactos y multimedia avanzada",
          icon: <Settings className="h-5 w-5" />,
          requiredFields: [],
          isCompleted: false,
          hasErrors: false
        }
      ];
    }
    if (formData.type === "barrio_cerrado") {
      return [
        ...baseSteps,
        {
          id: 4,
          title: "Detalles Principales",
          description: "Detalles principales del barrio cerrado",
          icon: <Settings className="h-5 w-5" />,
          requiredFields: ['numberOfLots', 'availableLots', 'totalArea', 'lotSizes', 'buildingRegulations', 'maintenanceFee'],
          isCompleted: false,
          hasErrors: false
        },
        {
          id: 5,
          title: "Infraestructura y Amenidades",
          description: "Infraestructura, seguridad y amenidades",
          icon: <Star className="h-5 w-5" />,
          requiredFields: ['services', 'securityFeatures', 'commonAreas', 'amenities'],
          isCompleted: false,
          hasErrors: false
        },
        {
          id: 6,
          title: "Info Avanzada",
          description: "Financiamiento, políticas, contactos y multimedia avanzada",
          icon: <Settings className="h-5 w-5" />,
          requiredFields: [],
          isCompleted: false,
          hasErrors: false
        }
      ];
    }
    return baseSteps;
  }, [formData.type]);

  // Update step status based on validation
  const updatedSteps = steps.map(step => {
    const stepErrors = step.requiredFields.filter(field => errors[field]);
    const hasRequiredFields = step.requiredFields.length > 0;
    const isCompleted = hasRequiredFields ? step.requiredFields.every(field => {
      const value = formData[field];
      if (field === 'images') {
        return Array.isArray(value) && value.length > 0;
      }
      return value && (typeof value === 'string' ? value.trim() !== '' : true);
    }) : true;
    
    return {
      ...step,
      isCompleted,
      hasErrors: stepErrors.length > 0
    };
  });

  const handleNext = async () => {
    const currentStepInfo = updatedSteps.find(step => step.id === currentStep);
    if (!currentStepInfo) return;

    const isValidCurrentStep = validate(currentStepInfo.requiredFields);

    if (isValidCurrentStep) {
      setCurrentStep(currentStep + 1);
    } else {
      // Scroll to first error
      const firstErrorField = currentStepInfo.requiredFields.find(field => errors[field]);
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleStepClick = async (targetIndex: number) => {
    const targetStep = targetIndex + 1;

    // Allow direct navigation to previous steps without validation
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    // Validate steps sequentially if moving forward
    for (let stepToValidate = currentStep; stepToValidate <= targetStep; stepToValidate++) {
      const stepInfo = updatedSteps.find(step => step.id === stepToValidate);
      if (!stepInfo) continue;

      if (stepInfo.requiredFields.length > 0) {
        const isValidStep = validate(stepInfo.requiredFields);
        
        if (!isValidStep) {
          return;
        }
      }
    }

    setCurrentStep(targetStep);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos los campos obligatorios antes de enviar
    const allRequiredFields = updatedSteps.flatMap(step => step.requiredFields);
    
    const isValidForm = validate(allRequiredFields);
    
    if (!isValidForm) {
      // Construir lista de campos faltantes
      const missingFields = allRequiredFields
        .filter(field => errors[field])
        .map(field => {
          const labels: Record<string, string> = {
            type: 'Tipo de Desarrollo',
            title: 'Título',
            price: 'Precio',
            currency: 'Moneda',
            status: 'Estado',
            address: 'Dirección',
            city: 'Ciudad',
            description: 'Descripción',
            images: 'Imágenes'
          };
          return labels[field] || field;
        });
      
      // Mostrar toast con campos faltantes
      toast({
        title: "Campos obligatorios faltantes",
        description: (
          <div className="mt-2">
            {missingFields.map((field, idx) => (
              <div key={idx}>• {field}</div>
            ))}
          </div>
        ) as any,
        variant: "destructive",
        duration: 5000,
      });
      
      // Mostrar el primer paso con errores
      const firstStepWithErrors = updatedSteps.find(step => 
        step.requiredFields.some(field => errors[field])
      );
      if (firstStepWithErrors) {
        setCurrentStep(firstStepWithErrors.id);
        // Scroll to first error
        const firstErrorField = firstStepWithErrors.requiredFields.find(field => errors[field]);
        if (firstErrorField) {
          setTimeout(() => {
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      }
      return;
    }
    
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      const success = await handleSubmit(e);
      
      if (success) {
        setSaveSuccess(true);
        router.push("/developments");
      }
    } catch (error) {
      console.error('❌ NewDevelopmentPage: Error in onSubmit:', error);
    } finally {
      setSaving(false);
    }
  };

  if (isInitializing) {
    return <LoadingSpinner size="md" />;
  }

  const renderStepContent = () => {
    const currentStepInfo = updatedSteps.find(step => step.id === currentStep);
    if (!currentStepInfo) return null;

    // Map step id to component
    const stepId = currentStepInfo.id;
    const lastStepId = updatedSteps[updatedSteps.length - 1]?.id;
    
    if (stepId === 1) {
      return <TypeStep formData={formData} handleChange={handleChange} errors={errors} />;
    }
    if (stepId === 2) {
      return (
        <div className="col-span-full w-full">
          <GeneralInfoStep formData={formData} handleChange={handleChange} errors={errors} />
        </div>
      );
    }
    if (stepId === 3) {
      return <MultimediaStep formData={formData} errors={errors} addImages={addImages} removeImage={removeImage} />;
    }
    
    // Type-specific steps
    if (formData.type === "loteamiento" && stepId === 4) {
      return <LoteamientoSpecificStep formData={formData} handleChange={handleChange} errors={errors} />;
    }
    if (formData.type === "edificio") {
      if (stepId === 4) {
        return <EdificioSpecificStep formData={formData} handleChange={handleChange} errors={errors} setUnits={setUnits} />;
      }
      if (stepId === 5) {
        return <CommonAmenitiesStep formData={formData} handleChange={handleChange} errors={errors} toggleAmenity={toggleAmenity} />;
      }
    }
    if (formData.type === "condominio") {
      if (stepId === 4) {
        return <CondominioSpecificStep formData={formData} handleChange={handleChange} errors={errors} />;
      }
      if (stepId === 5) {
        return <InfraAmenitiesStep formData={formData} handleChange={handleChange} errors={errors} />;
      }
    }
    if (formData.type === "barrio_cerrado") {
      if (stepId === 4) {
        return <BarrioCerradoDetailsStep formData={formData} handleChange={handleChange} errors={errors} />;
      }
      if (stepId === 5) {
        return <InfraAmenitiesStep formData={formData} handleChange={handleChange} errors={errors} />;
      }
    }

    // Último step siempre es Info Avanzada
    if (stepId === lastStepId) {
      return <AdvancedInfoStep formData={formData} handleChange={handleChange} errors={errors} />;
    }
    
    return null;
  };

  const progressPercentage = (currentStep / updatedSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                onClick={() => router.push('/developments')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex-shrink-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                  Nuevo Desarrollo
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span className="hidden sm:inline">Paso {currentStep} de {updatedSteps.length} • </span>
                  <span>{progressPercentage.toFixed(0)}%</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Save status indicator - hidden on mobile */}
              {saving && (
                <div className="hidden sm:flex items-center text-brand-600 dark:text-brand-400">
                  <LoadingSpinner size="md" />
                  <span className="text-sm ml-2">Guardando...</span>
                </div>
              )}
              
              {saveSuccess && (
                <div className="hidden sm:flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Guardado</span>
                </div>
              )}
              
              {/* Save button */}
              <button
                onClick={onSubmit}
                disabled={saving || isInitializing}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                  saving || isInitializing
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-brand-600 text-white hover:bg-brand-700 shadow-md'
                }`}
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="hidden sm:inline">Guardando...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Guardado</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Guardar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-6">
          {/* Steps navigation (sidebar) */}
          <aside className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 h-fit">
            <nav className="space-y-3">
              {updatedSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center space-x-2 cursor-pointer group"
                  onClick={() => handleStepClick(index)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200 ${
                      currentStep === step.id
                        ? "bg-brand-600 text-white"
                        : step.id < currentStep
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:group-hover:bg-gray-600"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        currentStep === step.id
                          ? "text-brand-600 dark:text-brand-400"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Step header + top buttons */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {updatedSteps.find(s => s.id === currentStep)?.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {updatedSteps.find(s => s.id === currentStep)?.description}
                  </p>
                </div>
                {/* Navigation buttons - hidden on mobile, shown in bottom bar */}
                <div className="hidden sm:flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                    Anterior
                  </button>
                  {currentStep < updatedSteps.length && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                    >
                      Siguiente
                      <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Step content */}
            <div className="p-4 sm:p-6">
              {renderStepContent()}
            </div>

            {/* Bottom navigation buttons */}
            <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="inline-flex items-center px-2.5 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Anterior</span>
              </button>
              
              <div className="flex items-center gap-2 sm:gap-3">
                {currentStep < updatedSteps.length && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center px-3 sm:px-5 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="h-4 w-4 ml-0.5 sm:ml-1" />
                  </button>
                )}
                
                <button
                  onClick={onSubmit}
                  disabled={saving || isInitializing}
                  className="inline-flex items-center px-3 sm:px-5 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">{saving ? 'Guardando...' : 'Crear'}</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 