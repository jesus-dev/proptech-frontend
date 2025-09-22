"use client";

import React, { useState, useMemo } from "react";
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

export default function NewDevelopmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const { formData, errors, handleChange, handleSubmit, resetForm, toggleAmenity, removePrivateFile, validate, addImages, removeImage, setUnits } = useDevelopmentForm();
  const router = useRouter();

  const steps = useMemo(() => {
    const baseSteps = [
      { id: "type", title: "Tipo de Desarrollo" },
      { id: "general", title: "Información General" },
      { id: "multimedia", title: "Multimedia" },
    ];

    if (formData.type === "loteamiento") {
      return [...baseSteps, { id: "loteamiento_details", title: "Detalles de Loteamiento" }];
    }
    if (formData.type === "edificio") {
      return [
        ...baseSteps,
        { id: "edificio_details", title: "Detalles de Edificio" },
        { id: "common_amenities", title: "Amenidades Comunes" },
      ];
    }
    if (formData.type === "condominio") {
      return [...baseSteps, { id: "condominio_details", title: "Detalles de Condominio" }];
    }
    if (formData.type === "barrio_cerrado") {
      return [
        ...baseSteps,
        { id: "barrio_details", title: "Detalles Principales" },
        { id: "infra_amenities", title: "Infraestructura y Amenidades" },
      ];
    }
    return baseSteps;
  }, [formData.type]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof DevelopmentFormData)[] = [];
    const stepId = steps[currentStep - 1]?.id;

    switch (stepId) {
      case 'type':
        fieldsToValidate = ['type'];
        break;
      case 'general':
        fieldsToValidate = ['title', 'description', 'address', 'city', 'state', 'zip', 'status'];
        break;
      case 'multimedia':
        fieldsToValidate = ['images'];
        break;
      case 'loteamiento_details':
        fieldsToValidate = ['numberOfLots', 'totalArea', 'availableLots', 'lotSizes', 'services'];
        break;
      case 'edificio_details':
        fieldsToValidate = ['numberOfFloors', 'numberOfUnits', 'availableUnits', 'unitTypes'];
        break;
      case 'common_amenities':
        fieldsToValidate = ['amenities'];
        break;
      case 'condominio_details':
        fieldsToValidate = ['numberOfUnits', 'availableUnits', 'unitTypes', 'lotSizes', 'totalArea', 'commonAreas', 'securityFeatures', 'maintenanceFee', 'amenities'];
        break;
      case 'barrio_details':
        fieldsToValidate = ['numberOfLots', 'availableLots', 'totalArea', 'lotSizes', 'buildingRegulations', 'maintenanceFee'];
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
      case 'loteamiento_details':
        return <LoteamientoSpecificStep formData={formData} handleChange={handleChange} errors={errors} />;
      case 'edificio_details':
        return <EdificioSpecificStep formData={formData} handleChange={handleChange} errors={errors} setUnits={setUnits} />;
      case 'common_amenities':
        return <CommonAmenitiesStep formData={formData} handleChange={handleChange} errors={errors} toggleAmenity={toggleAmenity} />;
      case 'condominio_details':
        return <CondominioSpecificStep formData={formData} handleChange={handleChange} errors={errors} />;
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
      router.push("/developments");
    }
  };
  
  const stepDescriptions: { [key: string]: string } = {
    type: "Seleccione el tipo de desarrollo.",
    general: "Ingrese la información general del desarrollo.",
    multimedia: "Suba las imágenes del desarrollo.",
    loteamiento_details: "Ingrese los detalles específicos del loteamiento.",
    edificio_details: "Ingrese los detalles específicos del edificio.",
    common_amenities: "Seleccione las amenidades comunes del edificio.",
    condominio_details: "Ingrese los detalles específicos del condominio.",
    barrio_details: "Ingrese los detalles principales de su barrio cerrado.",
    infra_amenities: "Defina la infraestructura, seguridad, áreas comunes y otras amenidades."
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Añadir Nuevo Desarrollo
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {stepDescriptions[steps[currentStep - 1]?.id] || ''}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center space-x-2 cursor-pointer group flex-shrink-0"
                onClick={() => {
                  if (index < currentStep) {
                    setCurrentStep(index + 1)
                  }
                }}
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
                <span
                  className={`text-sm font-medium transition-colors duration-200 ${
                    currentStep === index + 1
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

        <form onSubmit={handleFormSubmit} noValidate>
          {renderStepContent()}

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
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                Siguiente
              </button>
            )}
            {currentStep === steps.length && (
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Guardar Desarrollo
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 