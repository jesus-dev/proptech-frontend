"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDevelopmentForm, DevelopmentFormData } from "../../hooks/useDevelopmentForm";
import TypeStep from "../../components/steps/TypeStep";
import GeneralInfoStep from "../../components/steps/GeneralInfoStep";
import MultimediaStep from "../../components/steps/MultimediaStep";
import AdvancedInfoStep from "../../components/steps/AdvancedInfoStep";
import LoteamientoSpecificStep from "../../components/steps/LoteamientoSpecificStep";
import EdificioSpecificStep from "../../components/steps/EdificioSpecificStep";
import CondominioSpecificStep from "../../components/steps/CondominioSpecificStep";
import BarrioCerradoDetailsStep from "../../components/steps/BarrioCerradoDetailsStep";
import InfraAmenitiesStep from "../../components/steps/InfraAmenitiesStep";
import CommonAmenitiesStep from "../../components/steps/CommonAmenitiesStep";
import { developmentService } from "../../services/developmentService";

export default function EditDevelopmentPage() {
  const router = useRouter();
  const params = useParams();
  const developmentId = params?.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<any>(null);

  const { 
    formData, 
    errors, 
    handleChange, 
    handleSubmit, 
    toggleAmenity, 
    removePrivateFile, 
    validate, 
    addImages, 
    removeImage,
    setUnits 
  } = useDevelopmentForm(initialData);

  useEffect(() => {
    const fetchDevelopment = async () => {
      try {
        const development = await developmentService.getDevelopmentById(developmentId);
        if (development) {
          setInitialData(development);
        } else {
          setError("Emprendimiento no encontrado.");
        }
      } catch (err) {
        setError("Error al cargar el emprendimiento.");
        console.error("Error loading development:", err);
      } finally {
        setLoading(false);
      }
    };

    if (developmentId) {
      fetchDevelopment();
    }
  }, [developmentId]);

  const steps = useMemo(() => {
    const baseSteps = [
      { id: "type", title: "Tipo de Emprendimiento" },
      { id: "general", title: "Información General" },
      { id: "multimedia", title: "Multimedia" },
    ];

    if (formData.type === "loteamiento") {
      return [...baseSteps, { id: "loteamiento_details", title: "Detalles de Loteamiento" }, { id: "advanced", title: "Info Avanzada" }];
    }
    if (formData.type === "edificio") {
      return [
        ...baseSteps,
        { id: "edificio_details", title: "Detalles de Edificio" },
        { id: "common_amenities", title: "Amenidades Comunes" },
        { id: "advanced", title: "Info Avanzada" },
      ];
    }
    if (formData.type === "condominio") {
      return [
        ...baseSteps,
        { id: "condominio_details", title: "Detalles de Condominio" },
        { id: "condominio_amenities", title: "Áreas Comunes y Amenidades" },
        { id: "advanced", title: "Info Avanzada" },
      ];
    }
    if (formData.type === "barrio_cerrado") {
      return [
        ...baseSteps,
        { id: "barrio_details", title: "Detalles Principales" },
        { id: "infra_amenities", title: "Infraestructura y Amenidades" },
        { id: "advanced", title: "Info Avanzada" },
      ];
    }
    return [...baseSteps, { id: "advanced", title: "Info Avanzada" }];
  }, [formData.type]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof DevelopmentFormData)[] = [];
    const stepId = steps[currentStep - 1]?.id;

    switch (stepId) {
      case 'type':
        fieldsToValidate = ['type'];
        break;
      case 'general':
        fieldsToValidate = ['title', 'description', 'address', 'city', 'currency', 'status'];
        break;
      case 'multimedia':
        fieldsToValidate = ['images'];
        break;
      case 'loteamiento_details':
        fieldsToValidate = ['numberOfLots', 'totalArea', 'availableLots', 'lotSizes', 'services'];
        break;
      case 'edificio_details':
        fieldsToValidate = ['numberOfFloors', 'numberOfUnits', 'availableUnits'];
        break;
      case 'common_amenities':
        fieldsToValidate = ['amenities'];
        break;
      case 'condominio_details':
        fieldsToValidate = ['numberOfUnits', 'availableUnits', 'unitTypes', 'lotSizes', 'totalArea', 'maintenanceFee'];
        break;
      case 'barrio_details':
        fieldsToValidate = ['numberOfLots', 'availableLots', 'totalArea', 'lotSizes', 'buildingRegulations', 'maintenanceFee'];
        break;
      case 'condominio_amenities':
        fieldsToValidate = ['commonAreas', 'securityFeatures', 'amenities'];
        break;
      case 'infra_amenities':
        fieldsToValidate = ['services', 'securityFeatures', 'commonAreas', 'amenities'];
        break;
      default:
        break;
    }

    const isValidCurrentStep = validate(fieldsToValidate);

    if (isValidCurrentStep) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      console.log("Validation failed for current step.", errors);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (step: number) => {
    // En edición permitimos navegación libre entre steps sin validación previa
    setCurrentStep(step);
  };

  const renderStepContent = () => {
    const stepId = steps[currentStep - 1]?.id;
    switch (stepId) {
      case 'type':
        return <TypeStep formData={formData} handleChange={handleChange} errors={errors} />;
      case 'general':
        return (
          <div className="col-span-full w-full">
            <GeneralInfoStep formData={formData} handleChange={handleChange} errors={errors} />
          </div>
        );
      case 'multimedia':
        return <MultimediaStep formData={formData} errors={errors} addImages={addImages} removeImage={removeImage} />;
      case 'advanced':
        return <AdvancedInfoStep formData={formData} handleChange={handleChange} errors={errors} />;
      case 'loteamiento_details':
        return <LoteamientoSpecificStep formData={formData} handleChange={handleChange} errors={errors} />;
      case 'edificio_details':
        return <EdificioSpecificStep 
          formData={formData} 
          handleChange={handleChange} 
          errors={errors} 
          setUnits={setUnits}
        />;
      case 'common_amenities':
        return <CommonAmenitiesStep formData={formData} handleChange={handleChange} errors={errors} toggleAmenity={toggleAmenity} />;
      case 'condominio_details':
        return <CondominioSpecificStep formData={formData} handleChange={handleChange} errors={errors} />;
      case 'condominio_amenities':
        return <InfraAmenitiesStep formData={formData} handleChange={handleChange} errors={errors} />;
      case 'barrio_details':
        return <BarrioCerradoDetailsStep formData={formData} handleChange={handleChange} errors={errors} />;
      case 'infra_amenities':
        return <InfraAmenitiesStep formData={formData} handleChange={handleChange} errors={errors} />;
      default:
        return null;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    if (await handleSubmit(e)) {
      // Después de guardar, volver al detalle del desarrollo
      router.push(`/developments/${developmentId}`);
    }
  };

  const stepDescriptions: { [key: string]: string } = {
    type: "Edite el tipo de emprendimiento.",
    general: "Edite la información general del emprendimiento.",
    multimedia: "Edite las imágenes del emprendimiento.",
    loteamiento_details: "Edite los detalles específicos del loteamiento.",
    edificio_details: "Edite los detalles específicos del edificio.",
    common_amenities: "Edite las amenidades comunes del edificio.",
    condominio_details: "Edite los detalles específicos del condominio.",
    barrio_details: "Edite los detalles principales de su barrio cerrado.",
    condominio_amenities: "Edite las áreas comunes, seguridad y amenidades del condominio.",
    infra_amenities: "Edite la infraestructura, seguridad, áreas comunes y otras amenidades."
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-700 dark:text-gray-300">Cargando emprendimiento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="p-6">
        <p className="text-center text-red-500">No se pudo cargar el emprendimiento.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Editar Emprendimiento
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {stepDescriptions[steps[currentStep - 1]?.id] || ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.push(`/developments/${developmentId}`)}
            className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Ver desarrollo
          </button>
          <button
            type="button"
            onClick={() => router.push("/developments")}
            className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Volver a la lista
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-6">
          {/* Sidebar steps */}
          <aside className="border-r border-gray-200 dark:border-gray-700 pr-0 lg:pr-4">
            <nav className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 cursor-pointer group ${
                    index < currentStep ? "" : "opacity-70"
                  }`}
                  onClick={() => handleStepClick(index + 1)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200 ${
                      currentStep === index + 1
                        ? "bg-brand-600 text-white"
                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:group-hover:bg-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        currentStep === index + 1
                          ? "text-brand-600 dark:text-brand-400"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stepDescriptions[step.id] || ''}
                    </p>
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <section>
            <form onSubmit={handleFormSubmit} noValidate>
              {/* Top buttons */}
              <div className="flex justify-end gap-3 pb-4 border-b dark:border-gray-700 mb-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Anterior
                  </button>
                )}
                {currentStep < steps.length && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-3 py-2 text-xs sm:text-sm font-medium text-white bg-brand-500 border border-transparent rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                  >
                    Siguiente
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3 py-2 text-xs sm:text-sm font-medium text-white bg-brand-500 border border-transparent rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                >
                  Guardar Cambios
                </button>
              </div>

              {renderStepContent()}

              {/* Bottom buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700 mt-6">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Anterior
                  </button>
                )}
                {currentStep < steps.length && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2 text-sm font-medium text-white bg-brand-500 border border-transparent rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                  >
                    Siguiente
                  </button>
                )}
                {currentStep === steps.length && (
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-brand-500 border border-transparent rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                  >
                    Guardar Cambios
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
} 