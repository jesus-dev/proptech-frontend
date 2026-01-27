"use client";
import { useState, ChangeEvent, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Property } from "../components/types";
import { propertyService } from "../services/propertyService";
import { imageUploadService } from "../services/imageUploadService";
import { agentService } from "../services/agentService";
import { CurrencyCode } from "@/lib/utils";
import { getEndpoint } from '@/lib/api-config';
import { useToast } from "@/components/ui/use-toast";
import { FloorPlanForm } from "../components/steps/FloorPlansStep";
import { useAuthContext } from "@/context/AuthContext";
import { rentalPropertyService } from "@/app/(proptech)/rentals/services/rentalPropertyService";
import { debug } from "@/lib/logger";

export type PropertyFormData = Omit<Property, "id"> & { 
  propertyStatusId?: number;
  propertyTypeId?: number;
  agentId?: number;
  agencyId?: number;
  propietarioId?: number;
  currencyId?: number; // ID de la moneda
  additionalPropertyTypes?: string[];
  floorPlans?: FloorPlanForm[];
};
export type PropertyFormErrors = Partial<Record<keyof PropertyFormData, string>>;

export function usePropertyForm(initialData?: PropertyFormData & { id?: string }) {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const pathname = usePathname();
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    address: "",
    city: "Ciudad del Este",
    cityId: undefined, // ID de la ciudad seleccionada
    state: "Alto Paraná",
    zip: "",
    price: 0,
    currency: "USD" as CurrencyCode,
    status: "active",
    type: "apartment",
    operacion: "SALE" as 'SALE' | 'RENT' | 'BOTH',
    images: [],
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    description: "",
    privateFiles: [],
    amenities: [],
    services: [],
    featured: false,
    premium: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lotSize: 0,
    rooms: 0,
    kitchens: 0,
    floors: 0,
    availableFrom: "",
    additionalDetails: "",
    country: "Paraguay",
    neighborhood: "",
    locationDescription: "",
    virtualTourUrl: "",
    reelVideoUrl: "",
    fullVideoUrl: "",
    featuredImage: "",
    propertyId: "",
    propertyStatus: "",
    propertyLabel: "",
    propertyType: "",
    propertyTypeLabel: "",
    propertyStatusLabel: "",
    propertyPrice: 0,
    propertyPriceLabel: "",
    propertyBedrooms: 0,
    propertyBathrooms: 0,
    propertyGarage: 0,
    propertySize: 0,
    propertyLotSize: 0,
    propertyRooms: 0,
    propertyKitchens: 0,
    propertyFloors: 0,
    propertyYearBuilt: 0,
    propertyAvailableFrom: "",
    propertyAdditionalDetails: "",
    propertyAddress: "",
    propertyCity: "Ciudad del Este",
    propertyState: "Alto Paraná",
    propertyZip: "",
    propertyCountry: "Paraguay",
    propertyNeighborhood: "",
    propertyLocationDescription: "",
    propertyVirtualTourUrl: "",
    propertyReelVideoUrl: "",
    propertyFullVideoUrl: "",
    propertyFeaturedImage: "",
    propertyGalleryImages: [],
    propertyPrivateFiles: [],
    propertyAmenities: [],
    propertyServices: [],
    propertyAgent: {
      name: "",
      email: "",
      phone: "+595 985 940797",
      photo: ""
    },
    department: "",
    propertyStatusId: initialData?.propertyStatusId,
    propertyTypeId: initialData?.propertyTypeId,
    agentId: initialData?.agentId,
    agencyId: initialData?.agencyId,
    propietarioId: initialData?.propietarioId,
    currencyId: initialData?.currencyId,
    additionalPropertyTypes: initialData?.additionalPropertyTypes || [],
    floorPlans: initialData?.floorPlans || [],
    nearbyFacilities: initialData?.nearbyFacilities || [],
    ...initialData,
  });

  const [errors, setErrors] = useState<PropertyFormErrors>({});
  const [draftPropertyId, setDraftPropertyId] = useState<string | null>(initialData?.id || null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    featuredImage: File | null;
    galleryImages: File[];
  }>({
    featuredImage: null,
    galleryImages: []
  });
  const [uploadedFloorPlanImages, setUploadedFloorPlanImages] = useState<{ [key: number]: File | null }>({});

  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://api.proptech.com.py' : 'http://localhost:8080')).replace(/\/$/, '');

  const normalizeImagePathForBackend = (value?: string | null): string | undefined => {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
      return undefined;
    }
    if (trimmed.startsWith(API_BASE_URL)) {
      const relative = trimmed.slice(API_BASE_URL.length);
      return relative.startsWith('/') ? relative : `/${relative}`;
    }
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  };

  const selectFallbackFeaturedImage = (): string | undefined => {
    const current = normalizeImagePathForBackend(formData.featuredImage);
    if (current) return current;
    if (Array.isArray(formData.images)) {
      for (const img of formData.images) {
        const normalized = normalizeImagePathForBackend(img);
        if (normalized) {
          return normalized;
        }
      }
    }
    return undefined;
  };

  // Actualizar el formulario cuando cambie initialData
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Guardar borrador SIN validación (reutilizado por autosave manual / botón "Guardar borrador")
  const saveDraft = useCallback(async () => {
    try {
      // Preparar datos mínimos - SIN validaciones
      // IMPORTANTE: ahora SÍ enviamos agentId (y agencyId) para que el backend valide coherencia
      const {
        currency,
        propertyStatusId,
        additionalPropertyTypes,
        ...propertyDataWithoutCurrency
      } = formData;

      const propertyData: any = {
        ...propertyDataWithoutCurrency,
        // El título puede estar vacío (el backend pone "Borrador sin título")
        title: formData.title || '',
        images: [],
        // operacion se enviará con valor por defecto en backend si está vacío
        operacion: formData.operacion || '',
        // Mapear additionalPropertyTypes a additionalPropertyTypeIds para el backend
        // Siempre enviar el campo, incluso si está vacío, para que el backend pueda limpiar la lista
        additionalPropertyTypeIds: additionalPropertyTypes && Array.isArray(additionalPropertyTypes)
          ? additionalPropertyTypes.map((id: any) => Number(id)).filter((id: number) => !isNaN(id))
          : [],
        // Mapear privateFiles al formato esperado por el backend
        privateFiles: formData.privateFiles && Array.isArray(formData.privateFiles)
          ? formData.privateFiles.map((file: any) => ({
              url: file.url || file,
              fileName: file.fileName || file.name || (typeof file === 'string' ? file.split('/').pop() : 'unknown')
            }))
          : undefined,
      };

      const fallbackFeatured = selectFallbackFeaturedImage();
      if (fallbackFeatured) {
        propertyData.featuredImage = fallbackFeatured;
      } else {
        delete propertyData.featuredImage;
      }

      let savedProperty;
      if (draftPropertyId) {
        // Actualizar borrador existente
        savedProperty = await propertyService.updateProperty(draftPropertyId, propertyData);
      } else {
        // Crear nuevo borrador
        savedProperty = await propertyService.createProperty(propertyData);
        if (savedProperty && savedProperty.id) {
          setDraftPropertyId(savedProperty.id);
        }
      }
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      // Mostrar notificación sutil
      toast({
        variant: 'default',
        title: '💾 Guardado automático',
        description: `Borrador ${draftPropertyId ? 'actualizado' : 'creado'}.`,
        duration: 2000,
      });

      return true;
    } catch (error: any) {
      // Manejar explícitamente el 403 para que no entre en bucle ni rompa la página
      const message = error?.response?.data?.message || error?.response?.data?.error || error?.message;
      if (error?.response?.status === 403) {
        console.error('❌ Error 403 al guardar borrador:', message);
        toast({
          variant: 'destructive',
          title: 'Error de permisos',
          description: message || 'No tienes permisos para asignar este agente o crear la propiedad.',
        });
      } else {
        console.error('❌ Error al guardar borrador:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo guardar el borrador. Intenta nuevamente.',
        });
      }
      return false;
    }
  }, [formData, draftPropertyId, selectFallbackFeaturedImage, toast]);

  useEffect(() => {
    return;
  }, []);

  // Nota: La validación de bedrooms y bathrooms se manejará más adelante
  // Por ahora, estos campos no son obligatorios

  // Obtener automáticamente el agente del usuario logueado
  useEffect(() => {
    const getAgentFromUser = async () => {
      if (user?.email && !formData.agentId) {
        try {
          const agent = await agentService.getAgentByEmail(user.email);
          if (agent) {
            setFormData(prev => ({
              ...prev,
              agentId: agent.id,
              agencyId: agent.agencyId || undefined
            }));
          }
          // No generar error si no hay agente - es esperado que algunos usuarios no tengan agente asociado
        } catch (error: any) {
          // Solo registrar errores que no sean 404 (que es esperado cuando no hay agente)
          if (error?.response?.status !== 404 && error?.status !== 404) {
            console.error('❌ Error obteniendo agente del usuario:', error);
          }
        }
      }
    };

    getAgentFromUser();
  }, [user?.email, formData.agentId]);

  const handleChange = async (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "privateFiles") {
      const input = e.target as HTMLInputElement;
      if (input.files) {
        // Subir cada archivo al backend
        const uploadPromises = Array.from(input.files).map(async (file) => {
          const result = await imageUploadService.uploadImage(file, 'private');
          return { url: result.url, fileName: file.name, name: file.name }; // Asegurar que fileName esté presente
        });
        const uploadedFiles = await Promise.all(uploadPromises);
        setFormData((prev) => ({
          ...prev,
          privateFiles: Array.isArray(prev.privateFiles)
            ? [...prev.privateFiles, ...uploadedFiles]
            : uploadedFiles
        }));
        setHasUnsavedChanges(true);
      }
    } else if (name === "images") {
      const input = e.target as HTMLInputElement;
      if (input.files) {
        const newFiles = Array.from(input.files).map((file) => URL.createObjectURL(file));
        setFormData((prev) => ({
          ...prev,
          images: Array.isArray(prev.images)
            ? [...(prev.images as string[]), ...newFiles]
            : newFiles
        }));
      }
    } else {
      // Lista de campos que deben ser convertidos a números
      const numericFields = [
        'price', 'bedrooms', 'bathrooms', 'area', 'propertyStatusId', 'propertyTypeId',
        'agentId', 'agencyId', 'propietarioId', 'lotSize', 'rooms', 'kitchens', 'floors', 'yearBuilt', 'parking', 'latitude', 'longitude'
      ];
      
      // Campos que son arrays
      const arrayFields = ['additionalPropertyTypes'];
      
      setFormData((prev) => {
        let processedValue: any = value;
        
        if (numericFields.includes(name)) {
          processedValue = Number(value);
        } else if (arrayFields.includes(name)) {
          // Para campos de array, el value ya viene como array desde el componente
          processedValue = Array.isArray(value) ? value : [];
          if (name === 'additionalPropertyTypes') {
            // Asegurar que todos los valores sean números y eliminar duplicados
            processedValue = processedValue
              .map((id: any) => Number(id))
              .filter((id: number) => !isNaN(id) && id > 0);
            // Eliminar duplicados
            processedValue = Array.from(new Set(processedValue));
            debug('🔍 Actualizando additionalPropertyTypes:', processedValue, 'desde value:', value);
          }
        }
        
        const newData = {
          ...prev,
          [name]: processedValue,
        };
        
        if (name === 'additionalPropertyTypes') {
          debug('🔍 Nuevo formData.additionalPropertyTypes:', newData.additionalPropertyTypes);
        }
        
        return newData;
      });
      
      // Marcar que hay cambios sin guardar
      setHasUnsavedChanges(true);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files) return;

    if (name === "featuredImage") {
      const file = files[0];
      if (file) {
        // Limpia la anterior para liberar memoria
        if (formData.featuredImage) URL.revokeObjectURL(formData.featuredImage);
        setUploadedFiles(prev => ({ ...prev, featuredImage: file }));
        setFormData(prev => ({
          ...prev,
          featuredImage: URL.createObjectURL(file)
        }));
        // Limpia el input para permitir volver a seleccionar la misma imagen
        e.target.value = "";
        // Validar automáticamente después de cambiar la imagen destacada
        setTimeout(() => validate(['featuredImage']), 0);
      }
    } else if (name === "images") {
      const fileArray = Array.from(files);
      const newImageUrls = fileArray.map(file => URL.createObjectURL(file));
      setUploadedFiles(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...fileArray] }));
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImageUrls]
      }));
      e.target.value = "";
      // Validar automáticamente después de cambiar las imágenes de galería
      setTimeout(() => validate(['images']), 0);
    }
  };

  const removeImage = (index: number) => {
    // Libera la memoria del objeto URL
    const urlToRemove = formData.images[index];
    if (urlToRemove) URL.revokeObjectURL(urlToRemove);

    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setUploadedFiles(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
    // Validar automáticamente después de eliminar una imagen
    setTimeout(() => validate(['images']), 0);
  };

  const removeFeaturedImage = () => {
    if (formData.featuredImage) URL.revokeObjectURL(formData.featuredImage);
    setFormData(prev => ({
      ...prev,
      featuredImage: ""
    }));
    setUploadedFiles(prev => ({
      ...prev,
      featuredImage: null
    }));
    // Validar automáticamente después de eliminar la imagen destacada
    setTimeout(() => validate(['featuredImage']), 0);
  };

  const toggleAmenity = (amenityId: number) => {
    setFormData((prev) => {
      const currentAmenities = prev.amenities || [];
      const updatedAmenities = currentAmenities.includes(amenityId)
        ? currentAmenities.filter((a) => a !== amenityId)
        : [...currentAmenities, amenityId];
      return {
        ...prev,
        amenities: updatedAmenities,
      };
    });
    setHasUnsavedChanges(true);
  };

  const toggleService = (serviceId: number) => {
    setFormData((prev) => {
      const currentServices = prev.services || [];
      const updatedServices = currentServices.includes(serviceId)
        ? currentServices.filter((s) => s !== serviceId)
        : [...currentServices, serviceId];
      return {
        ...prev,
        services: updatedServices,
      };
    });
    setHasUnsavedChanges(true);
  };

  const toggleBooleanField = (field: 'featured' | 'premium') => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
    setHasUnsavedChanges(true);
  };

  const removePrivateFile = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      privateFiles: prev.privateFiles?.filter((_, index) => index !== indexToRemove) || [],
    }));
  };

  const handleFloorPlansChange = (floorPlans: FloorPlanForm[]) => {
    setFormData(prev => ({
      ...prev,
      floorPlans
    }));
  };

  const handleFloorPlanImageUpload = async (planIndex: number, file: File) => {
    try {
      const result = await imageUploadService.uploadImage(file, 'floor-plans');
      setUploadedFloorPlanImages(prev => ({
        ...prev,
        [planIndex]: file
      }));
      
      return result.url;
    } catch (error) {
      console.error('Error uploading floor plan image:', error);
      throw error;
    }
  };

  const handleNearbyFacilitiesChange = (facilities: any[]) => {
    setFormData(prev => ({
      ...prev,
      nearbyFacilities: facilities
    }));
  };

  const validate = useCallback((fieldsToValidate?: (keyof PropertyFormData)[]) => {
    const newErrors: PropertyFormErrors = {};

    const checkField = (field: keyof PropertyFormData, errorMsg: string, condition: boolean) => {
      if (!fieldsToValidate || fieldsToValidate.includes(field)) {
        if (condition && !newErrors[field]) {
          newErrors[field] = errorMsg;
        }
      }
    };

    // Validación mejorada con mensajes más descriptivos
    checkField('title', "El título es obligatorio", !formData.title || formData.title.trim() === '');
    checkField('title', "El título debe tener entre 3 y 100 caracteres", Boolean(formData.title && (formData.title.length < 3 || formData.title.length > 100)));
    
    // --- AJUSTE: Validar descripción por texto plano ---
    function stripHtml(html: string) {
      if (!html) return '';
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    }
    const plainDescription = stripHtml(formData.description);
    checkField('description', "La descripción es obligatoria", !plainDescription || plainDescription.trim() === '');
    checkField('description', "La descripción debe tener entre 10 y 5000 caracteres", Boolean(plainDescription && (plainDescription.length < 10 || plainDescription.length > 5000)));
    // --- FIN AJUSTE ---
    
    checkField('price', "El precio es obligatorio y debe ser mayor a 0", !formData.price || formData.price <= 0);
    
    checkField('currency', "La moneda es obligatoria", !formData.currency);
    
    checkField('type', "El tipo de propiedad es obligatorio", !formData.type);
    checkField('operacion', "La operación es obligatoria", !formData.operacion);
    checkField('status', "El estado de la propiedad es obligatorio", !formData.status);
    checkField('propertyStatusId', "El estado de la propiedad es obligatorio", !formData.propertyStatusId);
    checkField('agentId', "El agente es obligatorio", !formData.agentId);
    
    checkField('address', "La dirección es obligatoria", !formData.address || formData.address.trim() === '');
    // Validar ciudad por ID o nombre
    checkField('city', "La ciudad es obligatoria", !(formData.cityId || (formData.city && formData.city.trim() !== '')));
    checkField('state', "El estado/departamento es obligatorio", false);
    // checkField('zip', "El código postal es obligatorio", !formData.zip || formData.zip.trim() === '');
    
    // Nota: bedrooms y bathrooms no son obligatorios por ahora
    // Solo validar que no sean negativos si se proporcionan
    if (formData.bedrooms !== undefined && formData.bedrooms !== null && formData.bedrooms < 0) {
      checkField('bedrooms', "El número de dormitorios no puede ser negativo", true);
    }
    if (formData.bathrooms !== undefined && formData.bathrooms !== null && formData.bathrooms < 0) {
      checkField('bathrooms', "El número de baños no puede ser negativo", true);
    }
    checkField('area', "El área debe ser mayor a 0 m²", (formData.area || 0) < 0);
    checkField('parking', "El número de espacios de estacionamiento no puede ser negativo", (formData.parking || 0) < 0);
    
    // Validación de año de construcción
    if (formData.yearBuilt && (formData.yearBuilt < 1800 || formData.yearBuilt > new Date().getFullYear() + 1)) {
      checkField('yearBuilt', "El año de construcción debe ser válido (entre 1800 y " + (new Date().getFullYear() + 1) + ")", true);
    }

    // Validación de imágenes - más flexible para edición
    if (fieldsToValidate && fieldsToValidate.includes('images')) {
      // Solo validar imágenes si específicamente se solicita
      if (!formData.images || !Array.isArray(formData.images) || formData.images.length === 0) {
        checkField('images', "Se recomienda subir al menos una imagen de la propiedad", true);
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    if (!isValid) {
    } else {
    }
    
    return isValid;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        // Preparar datos de la propiedad sin las imágenes
        debug('🔍 formData completo antes de preparar:', formData);
        debug('🔍 formData.additionalPropertyTypes:', formData.additionalPropertyTypes);
        const { currency, additionalPropertyTypes, ...propertyDataWithoutCurrency } = formData;
        debug('🔍 additionalPropertyTypes extraído:', additionalPropertyTypes);
        const propertyData: any = {
          ...propertyDataWithoutCurrency,
          images: [], // Las imágenes se manejarán por separado
          // Enviar currencyId en lugar del código de moneda
          currencyId: formData.currencyId,
          // Mapear additionalPropertyTypes a additionalPropertyTypeIds para el backend
          // Siempre enviar el campo, incluso si está vacío, para que el backend pueda limpiar la lista
          additionalPropertyTypeIds: (() => {
            const ids = additionalPropertyTypes && Array.isArray(additionalPropertyTypes)
              ? additionalPropertyTypes.map((id: any) => Number(id)).filter((id: number) => !isNaN(id))
              : [];
            debug('🔍 Enviando additionalPropertyTypeIds:', ids, 'desde additionalPropertyTypes:', additionalPropertyTypes);
            return ids;
          })(),
          // Mapear privateFiles al formato esperado por el backend
          privateFiles: formData.privateFiles && Array.isArray(formData.privateFiles)
            ? formData.privateFiles.map((file: any) => ({
                url: file.url || file,
                fileName: file.fileName || file.name || (typeof file === 'string' ? file.split('/').pop() : 'unknown')
              }))
            : undefined,
        };

        const fallbackFeatured = selectFallbackFeaturedImage();
        if (fallbackFeatured) {
          propertyData.featuredImage = fallbackFeatured;
        } else {
          delete propertyData.featuredImage;
        }

        let propertyId: string;

        if (initialData?.id) {
          const updatedProperty = await propertyService.updateProperty(initialData.id, propertyData);
          if (updatedProperty) {
            propertyId = updatedProperty.id;
            // Mostrar notificación de éxito
            if (typeof window !== 'undefined') {
              toast({
                variant: 'success',
                title: '¡Excelente!',
                description: 'La propiedad ha sido actualizada correctamente. Los cambios están ahora disponibles en el sistema.'
              });
            }
          } else {
            throw new Error('No se pudo actualizar la propiedad');
          }
        } else {
          const newProperty = await propertyService.createProperty(propertyData);
          if (newProperty) {
            propertyId = newProperty.id;
            setDraftPropertyId(propertyId); // Guardar ID para poder publicar después
            // Mostrar notificación de éxito
            if (typeof window !== 'undefined') {
              toast({
                variant: 'success',
                title: '¡Excelente!',
                description: 'La propiedad ha sido guardada como borrador. Podrás publicarla cuando esté lista.'
              });
            }
          } else {
            throw new Error('No se pudo crear la propiedad');
          }
        }

        // Guardar floor plans si existen
        if (formData.floorPlans && formData.floorPlans.length > 0) {
          try {
            
            // Mapear los floor plans al formato esperado por el backend
            const mappedFloorPlans = formData.floorPlans.map(plan => ({
              id: null, // Nuevo plano
              title: plan.title,
              bedrooms: plan.bedrooms,
              bathrooms: plan.bathrooms,
              price: plan.price,
              priceSuffix: plan.priceSuffix,
              size: plan.size,
              image: typeof plan.image === 'string' ? plan.image : null,
              description: plan.description,
              propertyId: propertyId
            }));
            
            
            const response = await fetch(getEndpoint(`/api/properties/${propertyId}/floor-plans`), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(mappedFloorPlans)
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.warn('⚠️ usePropertyForm: Failed to save floor plans:', errorText);
            } else {
            }
          } catch (floorPlanError) {
            console.error('❌ usePropertyForm: Error saving floor plans:', floorPlanError);
            // No fallar el formulario si hay error con los floor plans
          }
        }

        // Ahora subir las imágenes y guardar las referencias en la base de datos
        if (uploadedFiles.featuredImage || uploadedFiles.galleryImages.length > 0) {
          try {
            
            // Subir imágenes al servidor
            const imageResults = await imageUploadService.uploadPropertyImages(
              uploadedFiles.featuredImage,
              uploadedFiles.galleryImages,
              propertyId
            );

            // Guardar referencias en la base de datos
            const normalizedGalleryUrls = (imageResults.galleryImageUrls || [])
              .map((url) => normalizeImagePathForBackend(url))
              .filter((url): url is string => Boolean(url));

            const normalizedFeaturedUrl =
              normalizeImagePathForBackend(imageResults.featuredImageUrl) ||
              normalizeImagePathForBackend(formData.featuredImage) ||
              normalizedGalleryUrls[0];

            const payload: Record<string, unknown> = {
              imageUrls: normalizedGalleryUrls
            };

            if (normalizedFeaturedUrl) {
              payload.featuredImageUrl = normalizedFeaturedUrl;
            }

            // Llamar al endpoint para actualizar las imágenes en la base de datos
            const response = await fetch(getEndpoint(`/api/properties/${propertyId}/images`), {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload)
            });

            if (!response.ok) {
              console.warn('⚠️ usePropertyForm: Failed to update images, but property was saved');
            }

          } catch (imageError) {
            console.error("❌ usePropertyForm: Error handling images:", imageError);
            // No fallar el formulario si hay error con las imágenes
          }
        }

        // Guardar configuración de alquiler temporal si está habilitada
        debug("🔍 Verificando configuración de alquiler temporal...");
        console.log("📦 formData completo:", formData);
        console.log("🏠 rentalConfig:", (formData as any).rentalConfig);
            debug("✅ enabled?", (formData as any).rentalConfig?.enabled);
        
        if ((formData as any).rentalConfig?.enabled) {
          try {
            debug("🏠 ✅ Configuración de alquiler temporal ACTIVADA - Procediendo a guardar para propertyId:", propertyId);
            const rentalConfig = (formData as any).rentalConfig;
            console.log("📋 Datos del rental config:", rentalConfig);
            
            // Mapear los datos del formulario al formato del backend
            const rentalData = {
              propertyId: parseInt(propertyId),
              pricePerNight: rentalConfig.pricePerNight,
              pricePerWeek: rentalConfig.pricePerWeek,
              pricePerMonth: rentalConfig.pricePerMonth,
              cleaningFee: rentalConfig.cleaningFee,
              currency: rentalConfig.currency || formData.currency,
              minNights: rentalConfig.minNights || 1,
              maxNights: rentalConfig.maxNights,
              maxGuests: rentalConfig.maxGuests || 2,
              checkInTime: rentalConfig.checkInTime || "14:00",
              checkOutTime: rentalConfig.checkOutTime || "11:00",
              instantBooking: rentalConfig.instantBooking || false,
              rentalType: rentalConfig.rentalType || "APARTMENT",
              petsAllowed: rentalConfig.petsAllowed || false,
              petFee: rentalConfig.petFee,
              smokingAllowed: rentalConfig.smokingAllowed || false,
              eventsAllowed: rentalConfig.eventsAllowed || false,
              wifiAvailable: rentalConfig.wifiAvailable !== false,
              cancellationPolicy: rentalConfig.cancellationPolicy || "MODERATE",
              houseRules: rentalConfig.houseRules,
              alwaysAvailable: rentalConfig.alwaysAvailable !== false,
            };

            debug("📝 Datos a enviar al backend:", rentalData);

            // Verificar si ya existe una configuración para esta propiedad
            debug("🔍 Verificando si ya existe configuración de rental...");
            const existingRental = await rentalPropertyService.getRentalPropertyByPropertyId(parseInt(propertyId));
            
            if (existingRental) {
              // Actualizar existente
              debug("📝 Configuración existente encontrada:", existingRental.id);
              await rentalPropertyService.updateRentalProperty(existingRental.id, rentalData);
              debug("✅ Configuración actualizada exitosamente");
            } else {
              // Crear nueva
              console.log("✨ No existe configuración - Creando nueva configuración de rental");
              const result = await rentalPropertyService.createRentalProperty(rentalData);
              debug("✅ Configuración creada exitosamente:", result);
            }
            
            console.log("🎉 Configuración de alquiler temporal guardada exitosamente");
          } catch (rentalError) {
            console.error("❌ usePropertyForm: Error saving rental config:", rentalError);
            console.error("❌ Error details:", rentalError);
            toast({
              variant: 'warning',
              title: 'Advertencia',
              description: 'La propiedad se guardó, pero hubo un error al configurar el alquiler temporal. Por favor, intenta configurarlo nuevamente.',
            });
          }
        } else {
          console.log("⚠️ Configuración de alquiler temporal NO ACTIVADA o no existe");
          console.log("   rentalConfig:", (formData as any).rentalConfig);
          console.log("   enabled:", (formData as any).rentalConfig?.enabled);
        }

        return true;
      } catch (error) {
        console.error('❌ usePropertyForm: Error submitting form:', error);
        // Mostrar notificación de error
        if (typeof window !== 'undefined') {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error instanceof Error ? error.message : 'Error desconocido al guardar la propiedad'
          });
        }
        return false;
      }
    } else {
      // Mostrar notificación de error de validación
      toast({
        variant: 'warning',
        title: 'Errores de validación',
        description: (
          <ul className="list-disc pl-5 space-y-1">
            {Object.values(validationErrors).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )
      });
      return false;
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      price: 0,
      currency: "USD" as CurrencyCode,
      status: "active",
      type: "apartment",
      images: [],
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      description: "",
      privateFiles: [],
      amenities: [],
      services: [],
      featured: false,
      premium: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lotSize: 0,
      rooms: 0,
      kitchens: 0,
      floors: 0,
      availableFrom: "",
      additionalDetails: "",
      country: "",
      neighborhood: "",
      locationDescription: "",
      virtualTourUrl: "",
      featuredImage: "",
      propertyId: "",
      propertyStatus: "",
      propertyLabel: "",
      propertyType: "",
      propertyTypeLabel: "",
      propertyStatusLabel: "",
      propertyPrice: 0,
      propertyPriceLabel: "",
      propertyBedrooms: 0,
      propertyBathrooms: 0,
      propertyGarage: 0,
      propertySize: 0,
      propertyLotSize: 0,
      propertyRooms: 0,
      propertyKitchens: 0,
      propertyFloors: 0,
      propertyYearBuilt: 0,
      propertyAvailableFrom: "",
      propertyAdditionalDetails: "",
      propertyAddress: "",
      propertyCity: "",
      propertyState: "",
      propertyZip: "",
      propertyCountry: "",
      propertyNeighborhood: "",
      propertyLocationDescription: "",
      propertyVirtualTourUrl: "",
      propertyFeaturedImage: "",
      propertyGalleryImages: [],
      propertyPrivateFiles: [],
      propertyAmenities: [],
      propertyServices: [],
      propertyAgent: {
        name: "",
        email: "",
        phone: "",
        photo: ""
      },
      department: "",
      propertyStatusId: initialData?.propertyStatusId,
      propertyTypeId: initialData?.propertyTypeId,
      agentId: initialData?.agentId,
      agencyId: initialData?.agencyId,
      additionalPropertyTypes: [],
      floorPlans: [],
    });
    setUploadedFiles({
      featuredImage: null,
      galleryImages: []
    });
    setUploadedFloorPlanImages({});
  };

  const handleCurrencyChange = (currency: CurrencyCode) => {
    setFormData((prev) => ({
      ...prev,
      currency,
    }));
  };

  const saveImageReference = async (propertyId: string, imageUrl: string, isPrimary: boolean = false) => {
    try {
      const response = await fetch(getEndpoint(`/api/properties/${propertyId}/images`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          fileName: imageUrl.split('/').pop(),
          isPrimary,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save image reference');
      }
    } catch (error) {
      console.error('Error saving image reference:', error);
      throw error;
    }
  };

  // Método para publicar propiedad (cambiar de DRAFT a ACTIVE)
  const publishProperty = async () => {
    if (!draftPropertyId) {
      throw new Error('No hay propiedad en borrador para publicar');
    }
    
    try {
      const published = await propertyService.publishProperty(draftPropertyId);
      toast({
        variant: 'success',
        title: '¡Publicado!',
        description: 'La propiedad ha sido publicada y ahora es visible al público.'
      });
      return published;
    } catch (error) {
      console.error('Error al publicar propiedad:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo publicar la propiedad. Intenta nuevamente.'
      });
      throw error;
    }
  };

  return {
    formData,
    errors,
    draftPropertyId,
    isAutoSaving,
    lastSaved,
    hasUnsavedChanges,
    handleChange,
    handleFileChange,
    removeImage,
    removeFeaturedImage,
    toggleAmenity,
    toggleService,
    toggleBooleanField,
    removePrivateFile,
    validate,
    handleSubmit,
    resetForm,
    handleCurrencyChange,
    handleFloorPlansChange,
    handleFloorPlanImageUpload,
    handleNearbyFacilitiesChange,
    publishProperty,
    saveDraft,
  };
} 