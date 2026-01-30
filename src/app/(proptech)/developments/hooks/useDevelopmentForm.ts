"use client";

import { useState, useCallback, useEffect } from "react";
import { Development, Loteamiento, Edificio, Condominio, BarrioCerrado, Unit } from "../components/types";
import { developmentService } from "../services/developmentService";
import { imageUploadService } from "@/app/(proptech)/properties/services/imageUploadService";
import { apiClient } from "@/lib/api";
import { buildDevelopmentPayload } from "../utils/developmentPayloadBuilder";

export interface DevelopmentFormData {
  id?: string;
  type: "loteamiento" | "edificio" | "condominio" | "barrio_cerrado" | "";
  title: string;
  description: string;
  address: string;
  city: string;
  currency: string; // Campo de moneda
  currencyId?: number; // <-- Agregado para el id de moneda
  price: number;
  images: string[];
  status: "available" | "sold" | "reserved" | "rented";
  createdAt?: string;
  updatedAt?: string;
  privateFiles: string[];

  // Loteamiento specific (optional, only applicable if type is "loteamiento")
  numberOfLots?: number;
  totalArea?: number; // Total area of the development
  availableLots?: number;
  lotSizes?: string; // e.g., "From 300m² to 500m²"
  services?: string[]; // e.g., "Water", "Electricity", "Sewage", "Paved Roads"

  // Edificio specific (optional, only applicable if type is "edificio")
  numberOfFloors?: number;
  numberOfUnits?: number;
  availableUnits?: number;
  unitTypes?: string; // e.g., "1, 2, 3 bedroom apartments"
  amenities?: string[]; // e.g., "Gym", "Pool", "24/7 Security"
  buildingFeatures?: string;
  additionalAmenities?: string[];
  // Edificio opcionales (se envían dentro de buildingFeatures)
  numberOfElevators?: number;
  parkingPerUnit?: string;
  commercialGroundFloor?: boolean;
  estimatedDeliveryYear?: number;
  units?: Unit[];

  // Condominio specific (optional, only applicable if type is "condominio")
  commonAreas?: string[]; // e.g., "Piscina", "Club House", "Canchas de tenis"
  securityFeatures?: string[]; // e.g., "Seguridad 24/7", "Cámaras de vigilancia"
  maintenanceFee?: number; // Cuota de mantenimiento mensual

  // Barrio Cerrado specific (optional, only applicable if type is "barrio_cerrado")
  buildingRegulations?: string; // Reglamento de construcción

  // Información avanzada - financiamiento / legal
  financingOptions?: string;
  paymentPlans?: string;
  legalStatus?: string;
  permits?: string;

  // Información avanzada - infraestructura / servicios
  utilities?: string;
  infrastructure?: string;
  environmentalImpact?: string;
  sustainabilityFeatures?: string;
  // Para infraestructura avanzada podemos reutilizar securityFeatures existente (solo usamos como texto en AdvancedInfoStep)
  parkingSpaces?: string;
  storageSpaces?: string;

  // Políticas y costos
  petPolicy?: string;
  rentalPolicy?: string;
  propertyTax?: string;
  insurance?: string;
  hoaFees?: string;
  hoaRules?: string;
  hoaContact?: string;

  // Contactos y gestión
  propertyManager?: string;
  managerContact?: string;
  emergencyContact?: string;

  // Multimedia avanzada
  virtualTourUrl?: string;
  videoUrl?: string;
  brochureUrl?: string;
  floorPlanUrl?: string;
  sitePlanUrl?: string;
  masterPlanUrl?: string;
  specificationsUrl?: string;

  // Garantía y notas
  warrantyInfo?: string;
  warrantyPeriod?: string;
  warrantyCoverage?: string;
  warrantyContact?: string;
  notes?: string;
  internalNotes?: string;
}

type FormErrors = { [K in keyof DevelopmentFormData]?: string };

export const useDevelopmentForm = (initialData?: Development) => {
  const initialFormData: DevelopmentFormData = {
    type: initialData?.type || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    currency: initialData?.currency || "",
    currencyId: (initialData as any)?.currencyId || undefined,
    price: initialData?.price || 0,
    images: initialData?.images || [],
    status: initialData?.status || "available",
    privateFiles: (initialData as any)?.privateFiles || [],
    // Loteamiento specific fields
    numberOfLots: (initialData as Loteamiento)?.numberOfLots || 0,
    totalArea: (initialData as Loteamiento)?.totalArea || 0,
    availableLots: (initialData as Loteamiento)?.availableLots || 0,
    lotSizes: (initialData as Loteamiento)?.lotSizes || "",
    services: initialData?.type === "loteamiento" ? (initialData as Loteamiento).services || [] : [],
    // Edificio specific fields
    numberOfFloors: (initialData as Edificio)?.numberOfFloors || 0,
    numberOfUnits: (initialData as Edificio)?.numberOfUnits || 0,
    availableUnits: (initialData as Edificio)?.availableUnits || 0,
    unitTypes: (initialData as Edificio)?.unitTypes || "",
    amenities: (initialData as Edificio)?.amenities || [],
    buildingFeatures: (initialData as Edificio)?.buildingFeatures || "",
    additionalAmenities: (initialData as Edificio)?.additionalAmenities || [],
    units: (initialData as Edificio)?.units || [],
    // Advanced info defaults
    financingOptions: "",
    paymentPlans: "",
    legalStatus: "",
    permits: "",
    utilities: "",
    infrastructure: "",
    environmentalImpact: "",
    sustainabilityFeatures: "",
    securityFeatures: [],
    parkingSpaces: "",
    storageSpaces: "",
    petPolicy: "",
    rentalPolicy: "",
    propertyTax: "",
    insurance: "",
    hoaFees: "",
    hoaRules: "",
    hoaContact: "",
    propertyManager: "",
    managerContact: "",
    emergencyContact: "",
    virtualTourUrl: "",
    videoUrl: "",
    brochureUrl: "",
    floorPlanUrl: "",
    sitePlanUrl: "",
    masterPlanUrl: "",
    specificationsUrl: "",
    warrantyInfo: "",
    warrantyPeriod: "",
    warrantyCoverage: "",
    warrantyContact: "",
    notes: "",
    internalNotes: "",
  };

  const [formData, setFormData] = useState<DevelopmentFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ images: File[] }>({ images: [] });

  // Update formData when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      const updatedFormData: DevelopmentFormData = {
        type: initialData.type || "",
        title: initialData.title || "",
        description: initialData.description || "",
        address: initialData.address || "",
        city: initialData.city || "",
        currency: initialData.currency || "",
        currencyId: (initialData as any)?.currencyId || undefined,
        price: initialData.price || 0,
        images: initialData.images || [],
        status: initialData.status || "available",
        privateFiles: (initialData as any)?.privateFiles || [],
        // Loteamiento specific fields
        numberOfLots: (initialData as Loteamiento)?.numberOfLots || 0,
        totalArea: (initialData as Loteamiento)?.totalArea || 0,
        availableLots: (initialData as Loteamiento)?.availableLots || 0,
        lotSizes: (initialData as Loteamiento)?.lotSizes || "",
        services: initialData.type === "loteamiento" ? (initialData as Loteamiento).services || [] : [],
        // Edificio specific fields
        numberOfFloors: (initialData as Edificio)?.numberOfFloors || 0,
        numberOfUnits: (initialData as Edificio)?.numberOfUnits || 0,
        availableUnits: (initialData as Edificio)?.availableUnits || 0,
        unitTypes: (initialData as Edificio)?.unitTypes || "",
        amenities: (initialData as Edificio)?.amenities || [],
        buildingFeatures: (initialData as Edificio)?.buildingFeatures || "",
        additionalAmenities: (initialData as Edificio)?.additionalAmenities || [],
        units: (initialData as Edificio)?.units || [],
        // Condominio / Barrio (comparten commonAreas y securityFeatures)
        commonAreas: (initialData as Condominio)?.commonAreas || (initialData as BarrioCerrado)?.commonAreas || [],
        securityFeatures: (initialData as Condominio)?.securityFeatures || (initialData as BarrioCerrado)?.securityFeatures || [],
        maintenanceFee: (initialData as Condominio)?.maintenanceFee || (initialData as BarrioCerrado)?.maintenanceFee || 0,
        // Barrio Cerrado specific
        buildingRegulations: (initialData as BarrioCerrado)?.buildingRegulations || "",
        // Advanced info from backend (cuando esté disponible en DTO)
        financingOptions: (initialData as any).financingOptions || "",
        paymentPlans: (initialData as any).paymentPlans || "",
        legalStatus: (initialData as any).legalStatus || "",
        permits: (initialData as any).permits || "",
        utilities: (initialData as any).utilities || "",
        infrastructure: (initialData as any).infrastructure || "",
        environmentalImpact: (initialData as any).environmentalImpact || "",
        sustainabilityFeatures: (initialData as any).sustainabilityFeatures || "",
        parkingSpaces: (initialData as any).parkingSpaces || "",
        storageSpaces: (initialData as any).storageSpaces || "",
        petPolicy: (initialData as any).petPolicy || "",
        rentalPolicy: (initialData as any).rentalPolicy || "",
        propertyTax: (initialData as any).propertyTax || "",
        insurance: (initialData as any).insurance || "",
        hoaFees: (initialData as any).hoaFees || "",
        hoaRules: (initialData as any).hoaRules || "",
        hoaContact: (initialData as any).hoaContact || "",
        propertyManager: (initialData as any).propertyManager || "",
        managerContact: (initialData as any).managerContact || "",
        emergencyContact: (initialData as any).emergencyContact || "",
        virtualTourUrl: (initialData as any).virtualTourUrl || "",
        videoUrl: (initialData as any).videoUrl || "",
        brochureUrl: (initialData as any).brochureUrl || "",
        floorPlanUrl: (initialData as any).floorPlanUrl || "",
        sitePlanUrl: (initialData as any).sitePlanUrl || "",
        masterPlanUrl: (initialData as any).masterPlanUrl || "",
        specificationsUrl: (initialData as any).specificationsUrl || "",
        warrantyInfo: (initialData as any).warrantyInfo || "",
        warrantyPeriod: (initialData as any).warrantyPeriod || "",
        warrantyCoverage: (initialData as any).warrantyCoverage || "",
        warrantyContact: (initialData as any).warrantyContact || "",
        notes: (initialData as any).notes || "",
        internalNotes: (initialData as any).internalNotes || "",
      };
      setFormData(updatedFormData);
      setErrors({}); // Clear errors when loading new data
    }
  }, [initialData]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, [initialFormData]);

  const validate = useCallback((fieldsToValidate?: (keyof DevelopmentFormData)[]): { isValid: boolean; errors: Partial<Record<keyof DevelopmentFormData, string>> } => {
    const newErrors: Partial<Record<keyof DevelopmentFormData, string>> = {};
    let isValid = true;

    const fields = fieldsToValidate || Object.keys(formData) as (keyof DevelopmentFormData)[];

    fields.forEach(field => {
      switch (field) {
        case 'type':
          if (!formData.type) {
            newErrors.type = "Tipo de emprendimiento es requerido.";
            isValid = false;
          }
          break;
        case 'title':
          if (!formData.title?.trim()) {
            newErrors.title = "Título es requerido.";
            isValid = false;
          }
          break;
        case 'description':
          if (!formData.description?.trim()) {
            newErrors.description = "Descripción es requerida.";
            isValid = false;
          }
          break;
        case 'address':
          if (!formData.address?.trim()) {
            newErrors.address = "Dirección es requerida.";
            isValid = false;
          }
          break;
        case 'city':
          if (!formData.city?.trim()) {
            newErrors.city = "Ciudad es requerida.";
            isValid = false;
          }
          break;
        case 'currency':
          if (!formData.currency?.trim()) {
            newErrors.currency = "Moneda es requerida.";
            isValid = false;
          }
          break;
        case 'status':
          if (!formData.status) {
            newErrors.status = "Estado es requerido.";
            isValid = false;
          }
          break;
        case 'images':
          if (!formData.images || formData.images.length === 0) {
            newErrors.images = "Al menos una imagen es requerida.";
            isValid = false;
          }
          break;
        // Loteamiento specific validations
        case 'numberOfLots':
          if (formData.type === "loteamiento" && (!formData.numberOfLots || formData.numberOfLots <= 0)) {
            newErrors.numberOfLots = "Número de lotes es requerido y debe ser mayor a 0.";
            isValid = false;
          }
          break;
        case 'totalArea':
          if (formData.type === "loteamiento" && (!formData.totalArea || formData.totalArea <= 0)) {
            newErrors.totalArea = "Área total es requerida y debe ser mayor a 0.";
            isValid = false;
          }
          break;
        case 'availableLots':
          if (formData.type === "loteamiento" && (formData.availableLots === undefined || formData.availableLots < 0)) {
            newErrors.availableLots = "Lotes disponibles es requerido y no puede ser negativo.";
            isValid = false;
          }
          break;
        case 'lotSizes':
          if (formData.type === "loteamiento" && !formData.lotSizes?.trim()) {
            newErrors.lotSizes = "Tamaños de lotes es requerido.";
            isValid = false;
          }
          break;
        case 'services':
          if (formData.type === "loteamiento" && (!formData.services || formData.services.length === 0)) {
            newErrors.services = "Se requiere al menos un servicio.";
            isValid = false;
          }
          break;
        // Edificio specific validations
        case 'numberOfFloors':
          if (formData.type === "edificio" && (!formData.numberOfFloors || formData.numberOfFloors <= 0)) {
            newErrors.numberOfFloors = "Número de pisos es requerido y debe ser mayor a 0.";
            isValid = false;
          }
          break;
        case 'numberOfUnits':
          if (formData.type === "edificio" && (!formData.numberOfUnits || formData.numberOfUnits <= 0)) {
            newErrors.numberOfUnits = "Número de unidades es requerido y debe ser mayor a 0.";
            isValid = false;
          }
          break;
        case 'availableUnits':
          if (formData.type === "edificio" && (formData.availableUnits === undefined || formData.availableUnits < 0)) {
            newErrors.availableUnits = "Unidades disponibles es requerido y no puede ser negativo.";
            isValid = false;
          }
          break;
        case 'unitTypes':
          // Edificio: opcional (puede tener varios tipos, no es relevante obligarlo)
          break;
        case 'amenities':
          if (formData.type === "edificio" && (!formData.amenities || formData.amenities.length === 0)) {
            newErrors.amenities = "Se requiere al menos una amenidad.";
            isValid = false;
          }
          break;
        case 'additionalAmenities':
          // Opcional para edificio (solo amenities es requerido en el paso)
          break;
        // Condominio specific validations
        case 'numberOfUnits':
          if (formData.type === "condominio" && (!formData.numberOfUnits || formData.numberOfUnits <= 0)) {
            newErrors.numberOfUnits = "Número de unidades es requerido y debe ser mayor a 0.";
            isValid = false;
          }
          break;
        case 'availableUnits':
          if (formData.type === "condominio" && (formData.availableUnits === undefined || formData.availableUnits < 0)) {
            newErrors.availableUnits = "Unidades disponibles es requerido y no puede ser negativo.";
            isValid = false;
          }
          break;
        case 'unitTypes':
          if (formData.type === "condominio" && !formData.unitTypes?.trim()) {
            newErrors.unitTypes = "Tipos de unidades es requerido.";
            isValid = false;
          }
          break;
        case 'lotSizes':
          if (formData.type === "condominio" && !formData.lotSizes?.trim()) {
            newErrors.lotSizes = "Tamaños de lotes es requerido.";
            isValid = false;
          }
          break;
        case 'totalArea':
          if (formData.type === "condominio" && (!formData.totalArea || formData.totalArea <= 0)) {
            newErrors.totalArea = "Área total es requerida y debe ser mayor a 0.";
            isValid = false;
          }
          break;
        case 'commonAreas':
          if (formData.type === "condominio" && (!formData.commonAreas || formData.commonAreas.length === 0)) {
            newErrors.commonAreas = "Se requiere al menos un área común.";
            isValid = false;
          }
          break;
        case 'securityFeatures':
          if (formData.type === "condominio" && (!formData.securityFeatures || formData.securityFeatures.length === 0)) {
            newErrors.securityFeatures = "Se requiere al menos una característica de seguridad.";
            isValid = false;
          }
          break;
        case 'maintenanceFee':
          if (formData.type === "condominio" && (!formData.maintenanceFee || formData.maintenanceFee < 0)) {
            newErrors.maintenanceFee = "Cuota de mantenimiento es requerida y no puede ser negativa.";
            isValid = false;
          }
          break;
        case 'amenities':
          if (formData.type === "condominio" && (!formData.amenities || formData.amenities.length === 0)) {
            newErrors.amenities = "Se requiere al menos una amenidad.";
            isValid = false;
          }
          break;
        // Barrio Cerrado specific validations
        case 'numberOfLots':
          if (formData.type === "barrio_cerrado" && (!formData.numberOfLots || formData.numberOfLots <= 0)) {
            newErrors.numberOfLots = "Número de lotes es requerido y debe ser mayor a 0.";
            isValid = false;
          }
          break;
        case 'availableLots':
          if (formData.type === "barrio_cerrado" && (formData.availableLots === undefined || formData.availableLots < 0)) {
            newErrors.availableLots = "Lotes disponibles es requerido y no puede ser negativo.";
            isValid = false;
          }
          break;
        case 'totalArea':
          if (formData.type === "barrio_cerrado" && (!formData.totalArea || formData.totalArea <= 0)) {
            newErrors.totalArea = "Área total es requerida y debe ser mayor a 0.";
            isValid = false;
          }
          break;
        case 'lotSizes':
          if (formData.type === "barrio_cerrado" && !formData.lotSizes?.trim()) {
            newErrors.lotSizes = "Tamaños de lotes es requerido.";
            isValid = false;
          }
          break;
        case 'services':
          if (formData.type === "barrio_cerrado" && (!formData.services || formData.services.length === 0)) {
            newErrors.services = "Se requiere al menos un servicio.";
            isValid = false;
          }
          break;
        case 'securityFeatures':
          if (formData.type === "barrio_cerrado" && (!formData.securityFeatures || formData.securityFeatures.length === 0)) {
            newErrors.securityFeatures = "Se requiere al menos una característica de seguridad.";
            isValid = false;
          }
          break;
        case 'commonAreas':
          if (formData.type === "barrio_cerrado" && (!formData.commonAreas || formData.commonAreas.length === 0)) {
            newErrors.commonAreas = "Se requiere al menos un área común.";
            isValid = false;
          }
          break;
        case 'maintenanceFee':
          if (formData.type === "barrio_cerrado" && (!formData.maintenanceFee || formData.maintenanceFee < 0)) {
            newErrors.maintenanceFee = "Cuota de mantenimiento es requerida y no puede ser negativa.";
            isValid = false;
          }
          break;
        case 'amenities':
          if (formData.type === "barrio_cerrado" && (!formData.amenities || formData.amenities.length === 0)) {
            newErrors.amenities = "Se requiere al menos una amenidad.";
            isValid = false;
          }
          break;
        case 'buildingRegulations':
          if (formData.type === "barrio_cerrado" && !formData.buildingRegulations?.trim()) {
            newErrors.buildingRegulations = "Reglamento de construcción es requerido.";
            isValid = false;
          }
          break;
        default:
          break;
      }
    });

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Special handling for FeatureSelector which passes an array
    if (Array.isArray(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: undefined }));
      return;
    }
    
    if (type === 'file') {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const fileNames = Array.from(files).map(file => URL.createObjectURL(file));
        setFormData(prev => ({
          ...prev,
          [name]: [...(prev[name as keyof DevelopmentFormData] as string[] || []), ...fileNames]
        }));
      }
    } else if (name === 'commonAreas' || name === 'securityFeatures') {
      // For condominio array fields
      setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(s => s) }));
    } else if (name === 'services' || name === 'amenities') {
      // For loteamiento and barrio cerrado array fields
      setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(s => s) }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === "" ? undefined : Number(value) }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'currencyId') {
      setFormData(prev => ({ ...prev, currencyId: Number(value) }));
      setErrors(prev => ({ ...prev, [name]: undefined }));
      return;
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: undefined })); // Clear error on change
  }, []);

  const toggleAmenity = useCallback((amenity: string) => {
    setFormData(prev => {
      const currentAmenities = prev.amenities || [];
      const updatedAmenities = currentAmenities.includes(amenity)
        ? currentAmenities.filter(a => a !== amenity)
        : [...currentAmenities, amenity];
      return { ...prev, amenities: updatedAmenities };
    });
  }, []);

  const removePrivateFile = useCallback((fileToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      privateFiles: prev.privateFiles.filter(file => file !== fileToRemove)
    }));
  }, []);

  const addImages = useCallback((newFiles: File[]) => {
    setFormData(prev => {
      const currentImages = prev.images || [];
      const newImageUrls = newFiles.map(file => URL.createObjectURL(file));
      return { ...prev, images: [...currentImages, ...newImageUrls] };
    });
    // Guardar los archivos originales para subirlos después
    setUploadedFiles(prev => ({
      ...prev,
      images: [...prev.images, ...newFiles]
    }));
  }, []);

  const removeImage = useCallback((indexToRemove: number) => {
    setFormData(prev => {
      const urlToRemove = prev.images[indexToRemove];
      if (urlToRemove && urlToRemove.startsWith('blob:')) {
        URL.revokeObjectURL(urlToRemove);
      }
      return {
        ...prev,
        images: prev.images.filter((_, index) => index !== indexToRemove)
      };
    });
    // También remover el archivo original
    setUploadedFiles(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  }, []);

  const addAdditionalAmenity = useCallback((amenity: string) => {
    const trimmedAmenity = amenity.trim();
    if (trimmedAmenity && !(formData.additionalAmenities || []).includes(trimmedAmenity)) {
      setFormData(prev => ({
        ...prev,
        additionalAmenities: [...(prev.additionalAmenities || []), trimmedAmenity]
      }));
    }
  }, [formData.additionalAmenities]);

  const removeAdditionalAmenity = useCallback((amenityToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      additionalAmenities: (prev.additionalAmenities || []).filter(a => a !== amenityToRemove)
    }));
  }, []);

  const setUnits = useCallback((units: Unit[]) => {
    setFormData(prev => ({
      ...prev,
      units: units
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const allFieldsToValidate: (keyof DevelopmentFormData)[] = [
      'type', 'title', 'description', 'address', 'city', 'status', 'images'
    ];

    if (formData.type === "loteamiento") {
      allFieldsToValidate.push('numberOfLots', 'totalArea', 'availableLots', 'lotSizes', 'services');
    } else if (formData.type === "edificio") {
      allFieldsToValidate.push('numberOfFloors', 'numberOfUnits', 'availableUnits', 'amenities');
    } else if (formData.type === "condominio") {
      allFieldsToValidate.push('numberOfUnits', 'availableUnits', 'unitTypes', 'lotSizes', 'totalArea', 'commonAreas', 'securityFeatures', 'maintenanceFee', 'amenities');
    } else if (formData.type === "barrio_cerrado") {
      allFieldsToValidate.push('numberOfLots', 'availableLots', 'totalArea', 'lotSizes', 'services', 'securityFeatures', 'commonAreas', 'maintenanceFee', 'amenities', 'buildingRegulations');
    }

    const validationResult = validate(allFieldsToValidate);
    if (!validationResult.isValid) {
      console.error("Form has validation errors.", validationResult.errors);
      return false;
    }

    try {
      if (initialData?.id) {
        // Update existing development - usar buildDevelopmentPayload para construir el payload correcto
        const coordinates = initialData.coordinates 
          ? { lat: initialData.coordinates.lat, lng: initialData.coordinates.lng }
          : { lat: -31.4167, lng: -64.1833 };
        
        // Primero subir imágenes nuevas si hay archivos pendientes
        let uploadedImageUrls: string[] = [];
        if (uploadedFiles.images.length > 0) {
          try {
            console.log('📤 Subiendo', uploadedFiles.images.length, 'imagen(es) nuevas al servidor...');
            
            // Subir imágenes al servidor usando el developmentId
            const subDirectory = `developments/${initialData.id}`;
            const uploadResults = await imageUploadService.uploadMultipleImages(uploadedFiles.images, subDirectory);
            uploadedImageUrls = uploadResults.map(result => result.url);
            console.log('✅ Imágenes subidas:', uploadedImageUrls);
          } catch (imageError) {
            console.error("❌ useDevelopmentForm: Error subiendo imágenes:", imageError);
            // Continuar aunque falle la subida de imágenes
          }
        }

        // Combinar imágenes existentes con las nuevas
        const existingImages = formData.images.filter(img => !img.startsWith('blob:'));
        const allImages = [...existingImages, ...uploadedImageUrls];
        console.log('🖼️ useDevelopmentForm: Total imágenes a guardar:', allImages.length);
        console.log('🖼️ useDevelopmentForm: URLs de imágenes:', allImages);

        // Construir el payload SIN imágenes (las imágenes se manejan por separado)
        const updatePayload = buildDevelopmentPayload(formData, coordinates);
        // NO incluir imágenes en el payload principal

        // Actualizar el desarrollo primero (sin imágenes)
        await apiClient.put(`/api/developments/${initialData.id}`, updatePayload);
        console.log('✅ Desarrollo actualizado');

        // Luego actualizar las imágenes usando el endpoint específico (igual que en properties)
        if (allImages.length > 0) {
          try {
            const imagePayload: Record<string, unknown> = {
              imageUrls: allImages
            };

            // Si hay una imagen destacada, agregarla
            if (allImages.length > 0) {
              imagePayload.featuredImageUrl = allImages[0];
            }

            await apiClient.put(`/api/developments/${initialData.id}/images`, imagePayload);
            console.log('✅ Imágenes guardadas en la base de datos:', allImages.length);
          } catch (imageError) {
            console.warn('⚠️ useDevelopmentForm: Failed to update images, but development was saved', imageError);
          }
        }
      } else {
        // Create new development - EXACTAMENTE como properties: crear primero, luego subir imágenes
        // Usar buildDevelopmentPayload para construir el payload según el tipo
        const coordinates = { lat: -31.4167, lng: -64.1833 }; // Default coordinates
        const developmentForCreate = buildDevelopmentPayload(formData, coordinates);

        // Crear el desarrollo primero (sin imágenes)
        console.log('📤 [useDevelopmentForm] Enviando desarrollo para crear:', {
          type: developmentForCreate.type,
          status: developmentForCreate.status,
          title: developmentForCreate.title,
          city: developmentForCreate.city,
          address: developmentForCreate.address
          // Price y currency se manejan solo en DevelopmentUnit
        });
        
        const newDevelopment = await developmentService.createDevelopment(developmentForCreate as any);
        const developmentId = newDevelopment.id;

        // Ahora subir las imágenes y guardar las referencias en la base de datos (EXACTAMENTE como properties)
        if (uploadedFiles.images.length > 0) {
          try {
            console.log('📤 Subiendo', uploadedFiles.images.length, 'imagen(es) al servidor...');
            
            // Subir imágenes al servidor usando el developmentId
            const subDirectory = `developments/${developmentId}`;
            const uploadResults = await imageUploadService.uploadMultipleImages(uploadedFiles.images, subDirectory);
            const uploadedImageUrls = uploadResults.map(result => result.url);
            console.log('✅ Imágenes subidas:', uploadedImageUrls);

            // Actualizar el desarrollo con las URLs de las imágenes usando el endpoint específico (igual que en editar)
            try {
              const imagePayload: Record<string, unknown> = {
                imageUrls: uploadedImageUrls
              };

              // Si hay una imagen destacada, agregarla
              if (uploadedImageUrls.length > 0) {
                imagePayload.featuredImageUrl = uploadedImageUrls[0];
              }

              await apiClient.put(`/api/developments/${developmentId}/images`, imagePayload);
              console.log('✅ Imágenes guardadas en la base de datos:', uploadedImageUrls.length);
            } catch (error) {
              console.warn('⚠️ useDevelopmentForm: Failed to update images, but development was saved', error);
            }

          } catch (imageError) {
            console.error("❌ useDevelopmentForm: Error handling images:", imageError);
            // No fallar el formulario si hay error con las imágenes
          }
        }
      }

      return true;
    } catch (error: any) {
      console.error("❌ [useDevelopmentForm] Error saving development:");
      console.error("   - Error completo:", error);
      console.error("   - Mensaje:", error.message);
      console.error("   - Stack:", error.stack);
      
      // Re-lanzar el error para que el componente pueda manejarlo
      throw error;
    }
  }, [formData, validate, errors, initialData, uploadedFiles]);

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    toggleAmenity,
    removePrivateFile,
    validate,
    addImages,
    removeImage,
    addAdditionalAmenity,
    removeAdditionalAmenity,
    setUnits,
  };
}; 