"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePropertyForm, PropertyFormData } from "../../hooks/usePropertyForm";
import TypeAndOperationStep from "../../components/steps/TypeAndOperationStep";
import CharacteristicsStep from "../../components/steps/CharacteristicsStep";
import LocationStep from "../../components/steps/LocationStep";
import MultimediaStep from "../../components/steps/MultimediaStep";
import AmenitiesStep from "../../components/steps/AmenitiesStep";
import ServicesStep from "../../components/steps/ServicesStep";
import PrivateFilesStep from "../../components/steps/PrivateFilesStep";
import VisibilityStep from "../../components/steps/VisibilityStep";
import FloorPlansStep, { FloorPlanForm } from "../../components/steps/FloorPlansStep";
import OwnerInfoStep from "../../components/steps/OwnerInfoStep";
import NearbyFacilitiesStep from "../../components/steps/NearbyFacilitiesStep";
import RentalConfigStep from "../../components/steps/RentalConfigStep";
import { propertyService } from "../../services/propertyService";
import { getActivePropertyTypes } from '@/services/publicPropertyTypeService';
import { rentalPropertyService } from "@/app/(proptech)/rentals/services/rentalPropertyService";
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  CheckCircle,
  AlertCircle,
  Home,
  Building,
  MapPin,
  Settings,
  Image,
  FileText,
  Video,
  Users,
  Calendar,
  DollarSign,
  Ruler,
  Car,
  Bed,
  Bath,
  Wifi,
  Shield,
  Dumbbell,
  Snowflake,
  Flame,
  File,
  ExternalLink,
  Clock,
  Award,
  Zap,
  Droplets,
  Wrench,
  Bell,
  Star,
  Heart,
  Share2,
  Phone,
  Mail,
  Globe,
  Download,
  Eye,
  Loader2,
  User
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";

interface PageProps {
  params: { id: string }
}

interface StepInfo {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  requiredFields: (keyof PropertyFormData)[];
  isCompleted: boolean;
  hasErrors: boolean;
}

export default function EditPropertyPage({ params }: PageProps) {
  const [propertyId, setPropertyId] = useState<string>(params.id || '');
  const router = useRouter();
  const { toast } = useToast();
  const [initialPropertyData, setInitialPropertyData] = useState<PropertyFormData & { id?: string } | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const { 
    formData, 
    errors, 
    draftPropertyId,
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
  } = usePropertyForm(initialPropertyData);

  // Sin promesas: params ya viene resuelto
  useEffect(() => {
    setPropertyId(params.id);
  }, [params.id]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        
        const property = await propertyService.getPropertyById(propertyId);
        
        if (property) {
          const { id, ...propertyData } = property;
          const amenitiesIds = propertyData.amenities?.map((a: unknown) => typeof a === 'number' ? a : (a as any).id).filter((id: unknown) => !isNaN(id as number)) || [];
          let typeName = propertyData.type;
          if ((!typeName || typeName === '') && propertyData.propertyTypeId) {
            // Buscar el nombre del tipo por ID
            const propertyTypes = await getActivePropertyTypes();
            const foundType = propertyTypes.find((pt: unknown) => (pt as any).id === propertyData.propertyTypeId);
            if (foundType) typeName = (foundType as any).name;
          }
          // Función para procesar la URL de la imagen destacada
          const processFeaturedImageUrl = (imageUrl: string | null | undefined): string => {
            if (!imageUrl || imageUrl.trim() === '') return '';
            if (imageUrl.startsWith('http')) return imageUrl;
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://api.proptech.com.py' : 'http://localhost:8080');
            if (imageUrl.startsWith('/') && apiBaseUrl.endsWith('/')) {
              return `${apiBaseUrl.slice(0, -1)}${imageUrl}`;
            }
            return `${apiBaseUrl}${imageUrl}`;
          };

          let processedFeaturedImage = processFeaturedImageUrl(propertyData.featuredImage);
          if ((!processedFeaturedImage || processedFeaturedImage === '') && Array.isArray(propertyData.images) && propertyData.images.length > 0) {
            processedFeaturedImage = processFeaturedImageUrl(propertyData.images[0]);
          }

          // Cargar configuración de alquiler temporal si existe
          let rentalConfig = null;
          try {
            const rentalProperty = await rentalPropertyService.getRentalPropertyByPropertyId(parseInt(propertyId));
            if (rentalProperty) {
              rentalConfig = {
                enabled: true,
                pricePerNight: rentalProperty.pricePerNight,
                pricePerWeek: rentalProperty.pricePerWeek,
                pricePerMonth: rentalProperty.pricePerMonth,
                cleaningFee: rentalProperty.cleaningFee,
                currency: rentalProperty.currency,
                minNights: rentalProperty.minNights,
                maxNights: rentalProperty.maxNights,
                maxGuests: rentalProperty.maxGuests,
                checkInTime: rentalProperty.checkInTime,
                checkOutTime: rentalProperty.checkOutTime,
                instantBooking: rentalProperty.instantBooking,
                rentalType: rentalProperty.rentalType,
                petsAllowed: rentalProperty.petsAllowed,
                petFee: rentalProperty.petFee,
                smokingAllowed: rentalProperty.smokingAllowed,
                eventsAllowed: rentalProperty.eventsAllowed,
                wifiAvailable: rentalProperty.wifiAvailable,
                cancellationPolicy: rentalProperty.cancellationPolicy,
                houseRules: rentalProperty.houseRules,
              };
            }
            // No generar logs si no hay configuración de rental - es esperado
          } catch (error) {
            // Silenciosamente ignorar errores 404 - es esperado que no todas las propiedades tengan rental config
          }

          const initialData = {
            ...propertyData,
            id: propertyId,
            amenities: amenitiesIds,
            type: typeName,
            propertyTypeId: propertyData.propertyTypeId,
            featuredImage: processedFeaturedImage,
            rentalConfig: rentalConfig,
          };
          
          setInitialPropertyData(initialData);
        } else {
          // Create a new property with the requested ID
          const newPropertyData: PropertyFormData = {
            title: "Nueva Propiedad",
            description: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            price: 0,
            currency: "USD",
            type: "casa",
            status: "active",
            bedrooms: 0,
            bathrooms: 0,
            area: 0,
            parking: 0,
            yearBuilt: 0,
            images: [],
            privateFiles: [],
            amenities: [],
            featured: false,
            premium: false,
            department: "",
          };
          setInitialPropertyData({
            ...newPropertyData,
            id: propertyId
          });
        }
        setLoading(false);
      } catch (error) {
        setError("Error al cargar la propiedad.");
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  // Auto-save functionality
  // Memoizar la función de auto-save para evitar recreaciones
  const autoSaveFunction = useCallback(async () => {
    if (!autoSave || !formData || loading) return;

      setSaving(true);
      try {
        await handleSubmit(new Event('submit') as any);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error) {
      } finally {
        setSaving(false);
      }
  }, [autoSave, formData, loading, handleSubmit]);

  useEffect(() => {
    if (!autoSave || !formData || loading) return;

    const autoSaveTimeout = setTimeout(autoSaveFunction, 2000);
    return () => clearTimeout(autoSaveTimeout);
  }, [autoSaveFunction]);

  // Detectar cambios en el formulario usando useMemo para evitar bucles infinitos
  const hasChanges = useMemo(() => {
    if (!initialPropertyData || !formData) return false;
    
    // Comparar solo los campos relevantes en lugar de todo el objeto
    const relevantFields = [
      'title', 'price', 'currency', 'type', 'status', 'description',
      'area', 'bedrooms', 'bathrooms', 'address', 'city', 'state', 'zip',
      'images', 'amenities', 'services', 'featured', 'premium'
    ];
    
    return relevantFields.some(field => {
      const initialValue = (initialPropertyData as any)[field];
      const currentValue = (formData as any)[field];
      
      if (Array.isArray(initialValue) && Array.isArray(currentValue)) {
        return JSON.stringify(initialValue) !== JSON.stringify(currentValue);
    }
      
      return initialValue !== currentValue;
    });
  }, [formData, initialPropertyData]);

  useEffect(() => {
    setHasUnsavedChanges(hasChanges);
  }, [hasChanges]);

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
        
        // Recargar los datos de la propiedad después de guardar
        const updatedProperty = await propertyService.getPropertyById(propertyId);
        
        if (updatedProperty) {
          const { id, ...propertyData } = updatedProperty;
          const amenitiesIds = propertyData.amenities?.map((a: unknown) => typeof a === 'number' ? a : (a as any).id).filter((id: unknown) => !isNaN(id as number)) || [];
          
          const newInitialData = {
            ...propertyData,
            id: propertyId,
            amenities: amenitiesIds
          };
          
          setInitialPropertyData(newInitialData);
          resetForm(); // Reset form data to reflect new property data
        }
        
        // Redirigir a la página de detalles después de 2 segundos
        setTimeout(() => {
          router.push(`/properties/${propertyId}`);
        }, 2000);
      } else {
      }
    } catch (error) {
    } finally {
      setSaving(false);
    }
  };

  // Guardar borrador SIN validación (igual que en nueva propiedad)
  const onSaveDraft = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveDraft();
      setSaveSuccess(true);
    } catch (error) {
      console.error('❌ EditPropertyPage: Error in onSaveDraft:', error);
    } finally {
      setSaving(false);
    }
  };

  const isDraftStatus = useMemo(() => {
    const candidates = [
      formData.status,
      formData.propertyStatus,
      formData.propertyStatusCode,
      formData.propertyStatusLabel,
      initialPropertyData?.status,
      initialPropertyData?.propertyStatus,
      initialPropertyData?.propertyStatusCode,
      initialPropertyData?.propertyStatusLabel,
    ]
      .filter(Boolean)
      .map((value) => value!.toString().toLowerCase());

    return candidates.some((value) => value === 'draft' || value === 'borrador');
  }, [formData, initialPropertyData]);

  const markStatusAsPublished = useCallback(() => {
    const publishLabelCandidates = ['published', 'publicado', 'activa', 'active'];

    setInitialPropertyData((prev) =>
      prev
        ? {
            ...prev,
            status: 'active',
            propertyStatus: 'Publicado',
            propertyStatusCode: 'ACTIVE',
            propertyStatusLabel: 'Publicado',
          }
        : prev
    );

    setHasUnsavedChanges(false);
  }, []);

  const onPublish = useCallback(async () => {
    if (!isDraftStatus) return;

    setPublishing(true);
    setPublishSuccess(false);
    try {
      await publishProperty();
      setPublishSuccess(true);
      markStatusAsPublished();
      toast({
        variant: 'success',
        title: 'Propiedad publicada',
        description: 'La propiedad ahora es visible en el portal público.',
      });
      setTimeout(() => router.push('/properties'), 1800);
    } catch (err) {
      console.error('❌ Error al publicar propiedad:', err);
      toast({
        variant: 'destructive',
        title: 'Error al publicar',
        description: 'No se pudo publicar la propiedad. Intenta nuevamente.',
      });
    } finally {
      setPublishing(false);
    }
  }, [isDraftStatus, publishProperty, router, toast, markStatusAsPublished]);

  // Confirmación antes de salir si hay cambios
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

  // Detectar tipo de propiedad para ajustar validaciones (terreno vs casa/departamento)
  const typeName = ((formData as any).type || (formData as any).propertyType || '').toString().toLowerCase();
  const isLand =
    typeName.includes('terreno') ||
    typeName.includes('lote') ||
    typeName.includes('loteo');

  // Step configuration with icons and validation (dinámico según tipo)
  const steps: StepInfo[] = [
    {
      id: 1,
      title: "Descripción y Precio",
      description: "Información básica de la propiedad",
      icon: <Home className="h-5 w-5" />,
      requiredFields: ['title', 'price', 'currency', 'type', 'status', 'description'],
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
      requiredFields: ['address', 'city', 'state', 'zip'],
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
      icon: <FileText className="h-5 w-5" aria-label="Icono de planos de planta" />,
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

  const handleStepClick = (targetIndex: number) => {
    setCurrentStep(targetIndex + 1);
    
    // En móvil, hacer scroll al formulario después de cambiar el paso
    if (window.innerWidth < 1024) { // lg breakpoint
      setTimeout(() => {
        const formElement = document.querySelector('[data-step-content]');
        if (formElement) {
          formElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  };

  if (loading) {
    return <LoadingSpinner size="md" />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar la propiedad
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

  if (!initialPropertyData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Propiedad no encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            No se pudo cargar la propiedad solicitada.
          </p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TypeAndOperationStep
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            isEditing={true}
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
            errors={errors}
            handleFileChange={handleFileChange}
            removeImage={removeImage}
            reorderImages={reorderImages}
            removeFeaturedImage={removeFeaturedImage}
            propertyId={propertyId}
            setFormData={data => handleChange({ target: { name: 'images', value: data.images } } as any)}
            validate={validate}
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
            propertyId={propertyId}
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
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {initialPropertyData ? 'Editar Propiedad' : 'Nueva Propiedad'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Paso {currentStep} de {steps.length} • {progressPercentage.toFixed(0)}% completado
                </p>
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
              
              {/* Save Draft button */}
              <button
                onClick={onSaveDraft}
                disabled={saving || loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  saving || loading
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

              {/* Save button (con validación completa) */}
              <button
                onClick={onSubmit}
                disabled={saving || loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  saving || loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : hasUnsavedChanges
                    ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg'
                    : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    ¡Perfecto! Guardado
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {hasUnsavedChanges ? 'Guardar Cambios' : 'Guardar'}
                  </>
                )}
              </button>

              {/* Indicador simple de estado publicado/borrador */}
              <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                <CheckCircle className="w-4 h-4" />
                {isDraftStatus ? 'Borrador' : 'Propiedad publicada'}
              </span>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6 sticky top-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Progreso del Formulario
              </h3>
              
              <nav className="space-y-2">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-3 rounded-lg text-left transition-all duration-200 ${
                      currentStep === index + 1
                        ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300'
                        : index + 1 < currentStep
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                        : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {index + 1 < currentStep ? (
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium">{step.title}</p>
                      <p className="text-xs opacity-75 hidden sm:block">{step.description}</p>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" data-step-content>
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
                    disabled={saving || loading}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
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