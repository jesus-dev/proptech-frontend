"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDevelopmentForm, DevelopmentFormData } from "../hooks/useDevelopmentForm";
import TypeStep from "../components/steps/TypeStep";
import GeneralInfoStep from "../components/steps/GeneralInfoStep";
import MultimediaStep from "../components/steps/MultimediaStep";
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
          requiredFields: ['numberOfFloors', 'numberOfUnits', 'availableUnits', 'unitTypes'],
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
          requiredFields: ['numberOfUnits', 'availableUnits', 'unitTypes', 'lotSizes', 'totalArea', 'commonAreas', 'securityFeatures', 'maintenanceFee', 'amenities'],
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
    if (formData.type === "condominio" && stepId === 4) {
      return <CondominioSpecificStep formData={formData} handleChange={handleChange} errors={errors} />;
    }
    if (formData.type === "barrio_cerrado") {
      if (stepId === 4) {
        return <BarrioCerradoDetailsStep formData={formData} handleChange={handleChange} errors={errors} />;
      }
      if (stepId === 5) {
        return <InfraAmenitiesStep formData={formData} handleChange={handleChange} errors={errors} />;
      }
    }
    
    return null;
  };

  const progressPercentage = (currentStep / updatedSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/developments')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Nuevo Desarrollo
                  </h1>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Paso {currentStep} de {updatedSteps.length} • {progressPercentage.toFixed(0)}% completado
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Save status indicator */}
              {saving && (
                <div className="flex items-center text-brand-600 dark:text-brand-400">
                  <LoadingSpinner size="md" />
                  <span className="text-sm ml-2">Guardando...</span>
                </div>
              )}
              
              {saveSuccess && (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Cambios guardados</span>
                </div>
              )}
              
              {/* Save button */}
              <button
                onClick={onSubmit}
                disabled={saving || isInitializing}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  saving || isInitializing
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg'
                }`}
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="md" />
                    <span className="ml-2">Guardando...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Guardado
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Desarrollo
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
        {/* Steps navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
            <nav className="flex space-x-8 overflow-x-auto">
              {updatedSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center space-x-2 cursor-pointer group flex-shrink-0"
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
                  <span
                    className={`text-sm font-medium transition-colors duration-200 ${
                      currentStep === step.id
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              {/* Step header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {updatedSteps.find(s => s.id === currentStep)?.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {updatedSteps.find(s => s.id === currentStep)?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step content */}
              <div className="p-6">
                {renderStepContent()}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </button>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onSubmit}
                    disabled={saving || isInitializing}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Guardando...' : 'Crear Desarrollo'}
                  </button>
                  
                  {currentStep < updatedSteps.length && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
} 