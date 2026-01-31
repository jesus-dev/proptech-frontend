"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePropertyForm, PropertyFormData } from "../hooks/usePropertyForm";
import { useAuthContext } from "@/context/AuthContext";
import TypeAndOperationStep from "../components/steps/TypeAndOperationStep";
import CharacteristicsStep from "../components/steps/CharacteristicsStep";
import LocationStep from "../components/steps/LocationStep";
import MultimediaStep from "../components/steps/MultimediaStep";
import AmenitiesStep from "../components/steps/AmenitiesStep";
import ServicesStep from "../components/steps/ServicesStep";
import PrivateFilesStep from "../components/steps/PrivateFilesStep";
import VisibilityStep from "../components/steps/VisibilityStep";
import FloorPlansStep, { FloorPlanForm } from "../components/steps/FloorPlansStep";
import OwnerInfoStep from "../components/steps/OwnerInfoStep";
import NearbyFacilitiesStep from "../components/steps/NearbyFacilitiesStep";
import RentalConfigStep from "../components/steps/RentalConfigStep";
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  CheckCircle,
  AlertCircle,
  Home,
  Settings,
  MapPin,
  Image,
  Star,
  Wrench,
  FileText,
  Eye,
  Loader2,
  Users,
  User,
  Calendar
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { currencyService } from "@/app/(proptech)/catalogs/services/catalogService";
import { useToast } from "@/components/ui/use-toast";

interface StepInfo {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  requiredFields: (keyof PropertyFormData)[];
  isCompleted: boolean;
  hasErrors: boolean;
}

export default function NewPropertyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, getUserContext } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Si el usuario es AGENT, el formulario debe tener agentId/agencyId desde el inicio (el backend lo exige)
  const initialDataForNew = useMemo(() => {
    const ctx = getUserContext();
    if (ctx.isAgent && ctx.agentId != null) {
      return {
        agentId: Number(ctx.agentId),
        agencyId: ctx.agencyId != null ? Number(ctx.agencyId) : undefined,
      };
    }
    return undefined;
  }, [user, getUserContext]);

  const { 
    formData, 
    errors,
    draftPropertyId,
    isAutoSaving,
    lastSaved,
    hasUnsavedChanges,
    handleChange, 
    handleFileChange, 
    removeImage, 
    reorderImages, 
    removeFeaturedImage, 
    toggleAmenity, 
    toggleService, 
    toggleBooleanField, 
    removePrivateFile, 
    validate, 
    handleSubmit, 
    resetForm,
    handleFloorPlansChange,
    handleFloorPlanImageUpload,
    handleNearbyFacilitiesChange,
      publishProperty,
      saveDraft,
      isProcessingImages,
  } = usePropertyForm(initialDataForNew);

  useEffect(() => {
    // No inicializar/sembrear datos ficticios
    setIsInitializing(false);
  }, []);

  // Advertir al usuario si intenta salir con cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos los campos obligatorios antes de enviar
    const allRequiredFields = steps.flatMap(step => step.requiredFields);
    
    const isValidForm = validate(allRequiredFields);
    
    if (!isValidForm) {
      // Construir lista de campos faltantes
      const missingFields = allRequiredFields
        .filter(field => errors[field])
        .map(field => {
          const labels: Record<string, string> = {
            title: 'Título',
            price: 'Precio',
            propertyTypeId: 'Tipo de Propiedad',
            propertyStatusId: 'Estado',
            operacion: 'Operación',
            address: 'Dirección',
            city: 'Ciudad',
            cityId: 'Ciudad',
            area: 'Área',
            bedrooms: 'Dormitorios',
            bathrooms: 'Baños',
            description: 'Descripción'
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
      const firstStepWithErrors = steps.find(step => 
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
      } else {
      }
    } catch (error) {
      console.error('❌ NewPropertyPage: Error in onSubmit:', error);
    } finally {
      setSaving(false);
    }
  };

  // Guardado de borrador SIN validación
  const onSaveDraft = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveDraft();
      setSaveSuccess(true);
    } catch (error) {
      console.error('❌ NewPropertyPage: Error in onSaveDraft:', error);
    } finally {
      setSaving(false);
    }
  };

  // Detectar tipo de propiedad (por nombre) para ajustar pasos dinámicamente
  const typeName = (formData.type || "").toString().toLowerCase();
  const isLand =
    typeName.includes("terreno") ||
    typeName.includes("lote") ||
    typeName.includes("loteo");

  // Step configuration with icons and validation (dinámico según tipo)
  const steps: StepInfo[] = [
    {
      id: 1,
      title: "Descripción y Precio",
      description: "Información básica de la propiedad",
      icon: <Home className="h-5 w-5" />,
      requiredFields: ['title', 'price', 'currency', 'type', 'propertyStatusId', 'description'],
      isCompleted: false,
      hasErrors: false
    },
    {
      id: 2,
      title: "Características",
      description: "Detalles físicos de la propiedad",
      icon: <Settings className="h-5 w-5" />,
      requiredFields: isLand ? ['lotSize'] : ['area', 'bedrooms', 'bathrooms'],
      isCompleted: false,
      hasErrors: false
    },
    {
      id: 3,
      title: "Ubicación",
      description: "Dirección y ubicación geográfica",
      icon: <MapPin className="h-5 w-5" />,
      requiredFields: ['address', 'city', 'state'],
      isCompleted: false,
      hasErrors: false
    },
    {
      id: 4,
      title: "Multimedia",
      description: "Imágenes, videos y tours virtuales",
      icon: <Image className="h-5 w-5" aria-label="Icono de multimedia" />,
      requiredFields: [],
      isCompleted: false,
      hasErrors: false
    },
    {
      id: 5,
      title: "Amenidades",
      description: "Servicios y comodidades disponibles",
      icon: <Star className="h-5 w-5" aria-label="Icono de amenidades" />,
      requiredFields: [],
      isCompleted: false,
      hasErrors: false
    },
    {
      id: 6,
      title: "Servicios",
      description: "Servicios adicionales disponibles",
      icon: <Wrench className="h-5 w-5" aria-label="Icono de servicios" />,
      requiredFields: [],
      isCompleted: false,
      hasErrors: false
    },
    {
      id: 7,
      title: "Archivos Privados",
      description: "Documentos y archivos confidenciales",
      icon: <FileText className="h-5 w-5" aria-label="Icono de archivos privados" />,
      requiredFields: [],
      isCompleted: false,
      hasErrors: false
    },
    {
      id: 8,
      title: "Visibilidad",
      description: "Configuración de publicación",
      icon: <Eye className="h-5 w-5" aria-label="Icono de visibilidad" />,
      requiredFields: [],
      isCompleted: false,
      hasErrors: false
    },
    {
      id: 9,
      title: "Planos de Planta",
      description: "Agrega uno o más planos de planta para la propiedad",
      icon: <FileText className="h-5 w-5" aria-label="Icono de planos de planta" />, // Puedes cambiar el icono si lo deseas
      requiredFields: [],
      isCompleted: false,
      hasErrors: false
    },
    {
      id: 10,
      title: "Facilidades Cercanas",
      description: "Servicios y facilidades cercanas a la propiedad",
      icon: <MapPin className="h-5 w-5" aria-label="Icono de facilidades cercanas" />,
      requiredFields: [],
      isCompleted: false,
      hasErrors: false
    },
    {
      id: 11,
      title: "Propietario",
      description: "Información del propietario (opcional)",
      icon: <User className="h-5 w-5" aria-label="Icono de propietario" />,
      requiredFields: [],
      isCompleted: false,
      hasErrors: false
    },
    {
      id: 12,
      title: "Alquiler Temporal",
      description: "Configuración para alquileres de corta duración (opcional)",
      icon: <Calendar className="h-5 w-5" aria-label="Icono de alquiler temporal" />,
      requiredFields: [],
      isCompleted: false,
      hasErrors: false
    }
  ];

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

  if (isInitializing) {
    return <LoadingSpinner size="md" />;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TypeAndOperationStep
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <CharacteristicsStep
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
        );
      case 3:
        return (
          <LocationStep
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
        );
      case 4:
        return (
          <MultimediaStep
            formData={formData}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
            removeImage={removeImage}
            reorderImages={reorderImages}
            removeFeaturedImage={removeFeaturedImage}
            errors={errors}
            isProcessingImages={isProcessingImages}
          />
        );
      case 5:
        return (
          <AmenitiesStep
            formData={formData}
            toggleAmenity={toggleAmenity}
            errors={errors}
          />
        );
      case 6:
        return <ServicesStep formData={formData} toggleService={toggleService} errors={errors} />;
      case 7:
        return <PrivateFilesStep formData={formData} handleChange={handleChange} errors={errors} removePrivateFile={removePrivateFile} />;
      case 8:
        return (
          <VisibilityStep
            formData={formData}
            toggleBooleanField={toggleBooleanField}
            errors={errors}
          />
        );
      case 9:
        return (
          <FloorPlansStep
            propertyId={undefined}
            formData={formData}
            floorPlans={formData.floorPlans || []}
            setFloorPlans={handleFloorPlansChange}
            errors={errors && 'floorPlans' in errors ? errors.floorPlans : undefined}
            handleFloorPlanImageUpload={handleFloorPlanImageUpload}
          />
        );
      case 10:
        return (
          <NearbyFacilitiesStep
            initialFacilities={formData.nearbyFacilities ?? []}
            onDataChange={handleNearbyFacilitiesChange}
          />
        );
      case 11:
        return (
          <OwnerInfoStep
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
        );
      case 12:
        return (
          <RentalConfigStep
            formData={formData}
            onChange={handleChange}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;
  const isDraftStatus =
    !draftPropertyId ||
    formData.status?.toUpperCase() === 'DRAFT' ||
    formData.propertyStatusLabel?.toLowerCase() === 'borrador';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/properties')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Nueva Propiedad
                  </h1>
                  {draftPropertyId && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      📝 Borrador
                    </span>
                  )}
                  {isAutoSaving && (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      💾 Guardando...
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Paso {currentStep} de {steps.length} • {progressPercentage.toFixed(0)}% completado
                  </p>
                  {lastSaved && !hasUnsavedChanges && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      • Último guardado: {new Date(lastSaved).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
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
              
              {/* Save as Draft button */}
              <button
                onClick={onSaveDraft}
                disabled={saving || isInitializing}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  saving || isInitializing
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700 shadow-lg'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Guardado
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {draftPropertyId ? 'Actualizar Borrador' : 'Guardar Borrador'}
                  </>
                )}
              </button>

              {/* Publish button */}
              {isDraftStatus ? (
                <button
                  onClick={publishProperty}
                  disabled={saving || isInitializing}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    saving || isInitializing
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                  }`}
                >
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {draftPropertyId ? 'Publicar Propiedad' : 'Guardar y Publicar'}
                  </>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-emerald-100 text-emerald-700 cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  Publicada
                </button>
              )}
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with steps */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Progreso del Formulario
              </h3>
              
              <nav className="space-y-2">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                      currentStep === index + 1
                        ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300'
                        : index + 1 < currentStep
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                        : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {index + 1 < currentStep ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs opacity-75">{step.description}</p>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              {/* Step header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {steps[currentStep - 1]?.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {steps[currentStep - 1]?.description}
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
                    Crear Propiedad
                  </button>
                  
                  {currentStep < steps.length && (
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
    </div>
  );
} 