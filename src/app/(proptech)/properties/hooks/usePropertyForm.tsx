"use client";
import { useState, ChangeEvent, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { Property } from "../components/types";
import { propertyService } from "../services/propertyService";
import { imageUploadService } from "../services/imageUploadService";
import { agentService } from "../services/agentService";
import { CurrencyCode } from "@/lib/utils";
import { getEndpoint } from '@/lib/api-config';
import { apiClient } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { FloorPlanForm } from "../components/steps/FloorPlansStep";
import { uploadFloorPlanImage } from "../services/floorPlanService";
import { useAuthContext } from "@/context/AuthContext";
import { rentalPropertyService } from "@/app/(proptech)/rentals/services/rentalPropertyService";
import { getAllPropertyStatuses } from "@/app/(proptech)/catalogs/property-status/services/propertyStatusService";
import { debug } from "@/lib/logger";
import { processImageFiles } from "@/lib/image-utils";

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

export function usePropertyForm(initialData?: Partial<PropertyFormData> & { id?: string }) {
  const { toast } = useToast();
  const { user, getUserContext } = useAuthContext();
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
    balconyArea: 0,
    gardenArea: 0,
    laundry: "",
    storage: "",
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
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  const uploadedFilesRef = useRef(uploadedFiles);
  uploadedFilesRef.current = uploadedFiles;

  const formDataRef = useRef(formData);
  formDataRef.current = formData;

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

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  /**
   * Construye el payload para create/update. UNA sola función para ambos flujos.
   * Solo campos que PropertyCreateDTO espera; sin ...rest para no enviar basura ni romper nada.
   */
  const buildPropertyPayload = useCallback((
    data: PropertyFormData,
    opts: { asDraft: boolean; propertyStatusId: number | undefined; additionalPropertyTypes: (string | number)[]; fallbackFeatured: string | undefined; isEditing: boolean }
  ) => {
    const { asDraft, propertyStatusId, additionalPropertyTypes, fallbackFeatured, isEditing } = opts;
    const num = (v: unknown): number | undefined => (v != null && v !== '') ? Number(v) : undefined;
    const int = (v: unknown): number | undefined => (v != null && v !== '') ? Math.floor(Number(v)) : undefined;
    const str = (v: unknown): string | undefined => (v != null ? String(v).trim() : undefined) || undefined;
    const payload: Record<string, unknown> = {
      title: data.title || (asDraft ? '' : data.title),
      images: [],
      operacion: data.operacion || '',
      propertyStatusId,
      agentId: data.agentId ?? undefined,
      agencyId: data.agencyId ?? undefined,
      description: str(data.description) || undefined,
      price: data.price != null ? Number(data.price) : 0,
      currencyId: data.currencyId,
      address: str(data.address) || undefined,
      cityId: data.cityId,
      departmentId: (data as any).departmentId,
      neighborhoodId: (data as any).neighborhoodId,
      countryId: (data as any).countryId,
      bedrooms: int(data.bedrooms) ?? 0,
      bathrooms: int(data.bathrooms) ?? 0,
      rooms: int(data.rooms) ?? 0,
      kitchens: int(data.kitchens) ?? 0,
      floors: int(data.floors) ?? 0,
      yearBuilt: int(data.yearBuilt),
      garage: int(data.parking) ?? 0,
      area: num(data.area) ?? 0,
      lotSize: num(data.lotSize) ?? 0,
      availableFrom: str(data.availableFrom) || undefined,
      additionalDetails: str(data.additionalDetails) || undefined,
      balconyArea: num((data as any).balconyArea) ?? 0,
      gardenArea: num((data as any).gardenArea) ?? 0,
      laundry: str((data as any).laundry) || undefined,
      storage: str((data as any).storage) || undefined,
      propertyTypeId: data.propertyTypeId,
      additionalPropertyTypeIds: Array.isArray(additionalPropertyTypes)
        ? additionalPropertyTypes.map((id: any) => Number(id)).filter((n: number) => !isNaN(n))
        : [],
      latitude: num(data.latitude),
      longitude: num(data.longitude),
      featured: data.featured ?? false,
      premium: data.premium ?? false,
      virtualTourUrl: str(data.virtualTourUrl) || undefined,
      reelVideoUrl: str(data.reelVideoUrl) || undefined,
      fullVideoUrl: str(data.fullVideoUrl) || undefined,
      amenities: Array.isArray(data.amenities) ? data.amenities.map((a: unknown) => Number(a)).filter((n: number) => !isNaN(n)) : undefined,
      services: Array.isArray(data.services) ? data.services.map((s: unknown) => Number(s)).filter((n: number) => !isNaN(n)) : undefined,
      propietarioId: data.propietarioId ?? undefined,
      privateFiles: isEditing ? undefined : (data.privateFiles?.length
        ? data.privateFiles.map((file: any) => ({
            url: file.url || file,
            fileName: file.fileName || file.name || (typeof file === 'string' ? file.split('/').pop() : 'unknown')
          }))
        : undefined),
    };
    if (fallbackFeatured) payload.featuredImage = fallbackFeatured;
    return payload as any;
  }, []);

  /**
   * Lógica de guardado unificada para "Guardar" y "Guardar borrador".
   * Create y update usan el mismo payload (buildPropertyPayload).
   */
  const performSave = useCallback(async (asDraft: boolean): Promise<{ success: boolean; propertyId?: string }> => {
    let propertyStatusId = formData.propertyStatusId;
    if (asDraft) {
      try {
        const statuses = await getAllPropertyStatuses();
        const draftStatus = statuses.find((s: { code?: string; name?: string }) =>
          (s.code && s.code.toUpperCase() === 'DRAFT') || (s.name && s.name.toLowerCase() === 'borrador')
        );
        if (draftStatus) propertyStatusId = draftStatus.id;
      } catch (e) {
        debug('No se pudo obtener estado DRAFT:', e);
      }
    }

    const additionalPropertyTypes = (formData.additionalPropertyTypes && Array.isArray(formData.additionalPropertyTypes))
      ? formData.additionalPropertyTypes
      : [];
    const fallbackFeatured = selectFallbackFeaturedImage();
    const isEditing = Boolean(initialData?.id);
    const effectiveId = initialData?.id ?? draftPropertyId;
    const isCreate = !(effectiveId != null ? String(effectiveId) : '');
    let dataForPayload = formData;
    if (isCreate) {
      const ctx = getUserContext();
      const resolvedAgentId = formData.agentId ?? (ctx.isAgent && ctx.agentId != null ? Number(ctx.agentId) : undefined);
      const resolvedAgencyId = formData.agencyId ?? (ctx.isAgent && ctx.agencyId != null ? Number(ctx.agencyId) : undefined);
      if (resolvedAgentId !== undefined || resolvedAgencyId !== undefined) {
        dataForPayload = { ...formData, agentId: resolvedAgentId ?? formData.agentId, agencyId: resolvedAgencyId ?? formData.agencyId };
      }
    }

    const propertyData = buildPropertyPayload(dataForPayload, {
      asDraft,
      propertyStatusId,
      additionalPropertyTypes,
      fallbackFeatured,
      isEditing,
    });

    const effectiveIdStr = effectiveId != null ? String(effectiveId) : '';
    let savedProperty;
    if (effectiveIdStr) {
      savedProperty = await propertyService.updateProperty(effectiveIdStr, propertyData);
    } else {
      savedProperty = await propertyService.createProperty(propertyData);
      if (savedProperty?.id != null) setDraftPropertyId(String(savedProperty.id));
    }
    const propertyId = savedProperty?.id != null ? String(savedProperty.id) : '';
    if (!propertyId) return { success: false };

    const files = uploadedFilesRef.current;
    if (files.featuredImage || files.galleryImages.length > 0) {
      try {
        const imageResults = await imageUploadService.uploadPropertyImages(
          files.featuredImage,
          files.galleryImages,
          String(propertyId)
        );
        const normalizedGalleryUrls = (imageResults.galleryImageUrls || [])
          .map((url: string) => normalizeImagePathForBackend(url))
          .filter((url): url is string => Boolean(url));
        const normalizedFeaturedUrl =
          normalizeImagePathForBackend(imageResults.featuredImageUrl) ||
          normalizeImagePathForBackend(formData.featuredImage) ||
          normalizedGalleryUrls[0];
        const payload: Record<string, unknown> = { imageUrls: normalizedGalleryUrls };
        if (normalizedFeaturedUrl) payload.featuredImageUrl = normalizedFeaturedUrl;
        await apiClient.put(`/api/properties/${propertyId}/images`, payload);
      } catch (imageError) {
        console.warn('⚠️ performSave: Error subiendo fotos:', imageError);
      }
    }

    try {
      const plans = (formDataRef.current.floorPlans ?? formData.floorPlans) ?? [];
      if (plans.length > 0) {
        const plansWithUploadedImages = await Promise.all(
          plans.map(async (plan, index) => {
            let imageUrl = typeof plan.image === 'string' ? plan.image : '';
            if (imageUrl.startsWith('blob:')) {
              try {
                const res = await fetch(imageUrl);
                const blob = await res.blob();
                const ext = blob.type?.split('/')[1] || 'jpg';
                const file = new File([blob], `floor-plan-${index}.${ext}`, { type: blob.type });
                imageUrl = await uploadFloorPlanImage(propertyId, file);
              } catch (e) {
                console.error('Error uploading floor plan image from blob:', e);
                imageUrl = '';
              }
            }
            return {
              id: null,
              title: plan.title ?? '',
              bedrooms: plan.bedrooms ?? 0,
              bathrooms: plan.bathrooms ?? 0,
              price: plan.price ?? 0,
              priceSuffix: plan.priceSuffix ?? '',
              size: plan.size ?? 0,
              image: imageUrl,
              description: plan.description ?? '',
              propertyId,
            };
          })
        );
        await apiClient.post(`/api/properties/${propertyId}/floor-plans`, plansWithUploadedImages);
      } else {
        await apiClient.delete(`/api/properties/${propertyId}/floor-plans`);
      }
    } catch (floorPlanError: any) {
      console.error('❌ performSave: Error saving floor plans:', floorPlanError);
      if (!asDraft) {
        toast({
          variant: 'destructive',
          title: 'Error al guardar planos',
          description: floorPlanError?.response?.data ?? 'No se pudieron guardar los planos de planta.',
        });
      }
    }

    const nearbyFacilities = (formData as any).nearbyFacilities;
    if (Array.isArray(nearbyFacilities)) {
      try {
        const existingRes = await apiClient.get(`/api/properties/${propertyId}/nearby-facilities`);
        const existingList = Array.isArray(existingRes?.data) ? existingRes.data : [];
        for (const ex of existingList) {
          const facilityId = ex.nearbyFacilityId ?? ex.nearbyFacility?.id;
          if (facilityId != null) {
            try {
              await apiClient.delete(`/api/properties/${propertyId}/nearby-facilities/${facilityId}`);
            } catch (delErr: any) {
              if (delErr?.response?.status !== 404) console.warn('⚠️ performSave: Error eliminando cercanía:', delErr);
            }
          }
        }
        for (const f of nearbyFacilities) {
          const payload = {
            nearbyFacilityId: f.nearbyFacilityId,
            distanceKm: f.distanceKm,
            walkingTimeMinutes: f.walkingTimeMinutes,
            drivingTimeMinutes: f.drivingTimeMinutes,
            isFeatured: f.isFeatured === true,
            notes: f.notes ?? '',
          };
          await apiClient.post(`/api/properties/${propertyId}/nearby-facilities`, payload);
        }
      } catch (nearbyErr: any) {
        if (nearbyErr?.response?.status !== 404) {
          console.warn('⚠️ performSave: Error guardando cercanías:', nearbyErr);
        }
      }
    }

    // Alquiler temporal
    if ((formData as any).rentalConfig?.enabled) {
      try {
        const rentalConfig = (formData as any).rentalConfig;
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
          checkInTime: rentalConfig.checkInTime || '14:00',
          checkOutTime: rentalConfig.checkOutTime || '11:00',
          instantBooking: rentalConfig.instantBooking || false,
          rentalType: rentalConfig.rentalType || 'APARTMENT',
          petsAllowed: rentalConfig.petsAllowed || false,
          petFee: rentalConfig.petFee,
          smokingAllowed: rentalConfig.smokingAllowed || false,
          eventsAllowed: rentalConfig.eventsAllowed || false,
          wifiAvailable: rentalConfig.wifiAvailable !== false,
          cancellationPolicy: rentalConfig.cancellationPolicy || 'MODERATE',
          houseRules: rentalConfig.houseRules,
          alwaysAvailable: rentalConfig.alwaysAvailable !== false,
        };
        const existingRental = await rentalPropertyService.getRentalPropertyByPropertyId(parseInt(propertyId));
        if (existingRental) {
          await rentalPropertyService.updateRentalProperty(existingRental.id, rentalData);
        } else {
          await rentalPropertyService.createRentalProperty(rentalData);
        }
      } catch (rentalError) {
        console.error('❌ performSave: Error saving rental config:', rentalError);
        if (!asDraft) {
          toast({
            variant: 'warning',
            title: 'Advertencia',
            description: 'La propiedad se guardó, pero hubo un error al configurar el alquiler temporal. Por favor, intenta configurarlo nuevamente.',
          });
        }
      }
    }

    setHasUnsavedChanges(false);
    setLastSaved(new Date());
    return { success: true, propertyId };
  }, [formData, initialData?.id, draftPropertyId, setDraftPropertyId, selectFallbackFeaturedImage, toast, buildPropertyPayload, getUserContext]);

  const saveDraft = useCallback(async () => {
    try {
      const result = await performSave(true);
      if (!result.success) return false;
      toast({
        variant: 'default',
        title: '💾 Guardado automático',
        description: `Borrador ${draftPropertyId ? 'actualizado' : 'creado'}.`,
        duration: 2000,
      });
      return true;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.error || error?.message;
      if (error?.response?.status === 403) {
        toast({
          variant: 'destructive',
          title: 'Error de permisos',
          description: message || 'No tienes permisos para asignar este agente o crear la propiedad.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo guardar el borrador. Intenta nuevamente.',
        });
      }
      return false;
    }
  }, [performSave, draftPropertyId, toast]);

  useEffect(() => {
    return;
  }, []);

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
        } catch (error: any) {
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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
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
        e.target.value = "";
        setTimeout(() => validate(['featuredImage']), 0);
      }
    } else if (name === "images") {
      const fileArray = Array.from(files);
      setIsProcessingImages(true);
      try {
        const processedFiles = await processImageFiles(fileArray);
        const newImageUrls = processedFiles.map(file => URL.createObjectURL(file));
        setUploadedFiles(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...processedFiles] }));
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...newImageUrls]
        }));
        setTimeout(() => validate(['images']), 0);
      } finally {
        setIsProcessingImages(false);
      }
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
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
    setTimeout(() => validate(['images']), 0);
  };

  /** Reordenar imágenes de la galería (propiedad nueva). */
  const reorderImages = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) return;
    const moveInArray = <T,>(arr: T[]) => {
      const result = [...arr];
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    };
    setFormData(prev => ({ ...prev, images: moveInArray(prev.images || []) }));
    setUploadedFiles(prev => ({ ...prev, galleryImages: moveInArray(prev.galleryImages) }));
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
    if (Object.keys(validationErrors).length > 0) {
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
    try {
      const result = await performSave(false);
      if (!result.success) return false;
      if (typeof window !== 'undefined') {
        toast({
          variant: 'success',
          title: '¡Excelente!',
          description: initialData?.id
            ? 'La propiedad ha sido actualizada correctamente. Los cambios están ahora disponibles en el sistema.'
            : 'La propiedad ha sido guardada. Podrás publicarla cuando esté lista.',
        });
      }
      return true;
    } catch (error) {
      console.error('❌ usePropertyForm: Error submitting form:', error);
      if (typeof window !== 'undefined') {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Error desconocido al guardar la propiedad',
        });
      }
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
      balconyArea: 0,
      gardenArea: 0,
      laundry: "",
      storage: "",
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
      await apiClient.post(`/api/properties/${propertyId}/images`, {
        imageUrl,
        fileName: imageUrl.split('/').pop(),
        isPrimary,
      });
    } catch (error) {
      console.error('Error saving image reference:', error);
      throw error;
    }
  };

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
    reorderImages,
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
    isProcessingImages,
  };
} 