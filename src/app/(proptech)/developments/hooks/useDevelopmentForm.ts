"use client";

import { useState, useCallback, useEffect } from "react";
import { Development, Loteamiento, Edificio, Condominio, BarrioCerrado, Unit } from "../components/types";
import { developmentService } from "../services/developmentService";

export interface DevelopmentFormData {
  id?: string;
  type: "loteamiento" | "edificio" | "condominio" | "barrio_cerrado" | "";
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
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
  units?: Unit[];

  // Condominio specific (optional, only applicable if type is "condominio")
  commonAreas?: string[]; // e.g., "Piscina", "Club House", "Canchas de tenis"
  securityFeatures?: string[]; // e.g., "Seguridad 24/7", "Cámaras de vigilancia"
  maintenanceFee?: number; // Cuota de mantenimiento mensual

  // Barrio Cerrado specific (optional, only applicable if type is "barrio_cerrado")
  buildingRegulations?: string; // Reglamento de construcción
}

type FormErrors = { [K in keyof DevelopmentFormData]?: string };

export const useDevelopmentForm = (initialData?: Development) => {
  const initialFormData: DevelopmentFormData = {
    type: initialData?.type || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zip: initialData?.zip || "",
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
  };

  const [formData, setFormData] = useState<DevelopmentFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  // Update formData when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      const updatedFormData: DevelopmentFormData = {
        type: initialData.type || "",
        title: initialData.title || "",
        description: initialData.description || "",
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        zip: initialData.zip || "",
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
        // Condominio specific fields
        commonAreas: (initialData as Condominio)?.commonAreas || [],
        securityFeatures: (initialData as Condominio)?.securityFeatures || [],
        maintenanceFee: (initialData as Condominio)?.maintenanceFee || 0,
        // Barrio Cerrado specific fields
        buildingRegulations: (initialData as BarrioCerrado)?.buildingRegulations || "",
      };
      setFormData(updatedFormData);
      setErrors({}); // Clear errors when loading new data
    }
  }, [initialData]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, [initialFormData]);

  const validate = useCallback((fieldsToValidate?: (keyof DevelopmentFormData)[]) => {
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
        case 'state':
          if (!formData.state?.trim()) {
            newErrors.state = "Estado es requerido.";
            isValid = false;
          }
          break;
        case 'zip':
          if (!formData.zip?.trim()) {
            newErrors.zip = "Código postal es requerido.";
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
          if (formData.type === "edificio" && !formData.unitTypes?.trim()) {
            newErrors.unitTypes = "Tipos de unidades es requerido.";
            isValid = false;
          }
          break;
        case 'amenities':
          if (formData.type === "edificio" && (!formData.amenities || formData.amenities.length === 0)) {
            newErrors.amenities = "Se requiere al menos una amenidad.";
            isValid = false;
          }
          break;
        case 'additionalAmenities':
          if (formData.type === "edificio" && (!formData.additionalAmenities || formData.additionalAmenities.length === 0)) {
            newErrors.additionalAmenities = "Se requiere al menos una amenidad adicional.";
            isValid = false;
          }
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
    return isValid;
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
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
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
  }, []);

  const removeImage = useCallback((indexToRemove: number) => {
    setFormData(prev => ({
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
      'type', 'title', 'description', 'address', 'city', 'state', 'zip', 'currency', 'status', 'images'
    ];

    if (formData.type === "loteamiento") {
      allFieldsToValidate.push('numberOfLots', 'totalArea', 'availableLots', 'lotSizes', 'services');
    } else if (formData.type === "edificio") {
      allFieldsToValidate.push('numberOfFloors', 'numberOfUnits', 'availableUnits', 'unitTypes', 'amenities', 'additionalAmenities');
    } else if (formData.type === "condominio") {
      allFieldsToValidate.push('numberOfUnits', 'availableUnits', 'unitTypes', 'lotSizes', 'totalArea', 'commonAreas', 'securityFeatures', 'maintenanceFee', 'amenities');
    } else if (formData.type === "barrio_cerrado") {
      allFieldsToValidate.push('numberOfLots', 'availableLots', 'totalArea', 'lotSizes', 'services', 'securityFeatures', 'commonAreas', 'maintenanceFee', 'amenities', 'buildingRegulations');
    }

    if (!validate(allFieldsToValidate)) {
      console.error("Form has validation errors.", errors);
      return false;
    }

    try {
      if (initialData?.id) {
        // Update existing development
        const updateData: DevelopmentFormData = { ...formData };
        if (updateData.type === "loteamiento") {
            updateData.amenities = undefined; // Clear amenity fields for loteamiento
            updateData.additionalAmenities = undefined;
            updateData.numberOfFloors = undefined;
            updateData.numberOfUnits = undefined;
            updateData.availableUnits = undefined;
            updateData.unitTypes = undefined;
            updateData.buildingFeatures = undefined;
            updateData.commonAreas = undefined;
            updateData.securityFeatures = undefined;
            updateData.maintenanceFee = undefined;
            updateData.buildingRegulations = undefined;
        } else if (updateData.type === "edificio") {
            updateData.numberOfLots = undefined; // Clear loteamiento fields for edificio
            updateData.totalArea = undefined;
            updateData.availableLots = undefined;
            updateData.lotSizes = undefined;
            updateData.services = undefined;
            updateData.commonAreas = undefined;
            updateData.securityFeatures = undefined;
            updateData.maintenanceFee = undefined;
            updateData.buildingRegulations = undefined;
        } else if (updateData.type === "condominio") {
            updateData.numberOfLots = undefined; // Clear loteamiento fields for condominio
            updateData.services = undefined;
            updateData.numberOfFloors = undefined;
            updateData.buildingFeatures = undefined;
            updateData.additionalAmenities = undefined;
            updateData.buildingRegulations = undefined;
            updateData.units = undefined;
        } else if (updateData.type === "barrio_cerrado") {
            updateData.numberOfFloors = undefined; // Clear edificio fields for barrio cerrado
            updateData.numberOfUnits = undefined;
            updateData.availableUnits = undefined;
            updateData.unitTypes = undefined;
            updateData.buildingFeatures = undefined;
            updateData.additionalAmenities = undefined;
            updateData.units = undefined;
        }

        await developmentService.updateDevelopment(initialData.id, updateData as Development); // Cast to Development after clearing fields
      } else {
        // Create new development
        let developmentForCreate: Omit<Loteamiento, 'id' | 'createdAt' | 'updatedAt' | 'lots'> | Omit<Edificio, 'id' | 'createdAt' | 'updatedAt'> | Omit<Condominio, 'id' | 'createdAt' | 'updatedAt' | 'lots'> | Omit<BarrioCerrado, 'id' | 'createdAt' | 'updatedAt' | 'lots'>;

        if (formData.type === "loteamiento") {
          const { id: _, createdAt: __, updatedAt: ___, ...loteamientoData } = formData as DevelopmentFormData;
          developmentForCreate = {
            type: "loteamiento",
            title: loteamientoData.title,
            description: loteamientoData.description,
            address: loteamientoData.address,
            city: loteamientoData.city,
            state: loteamientoData.state,
            zip: loteamientoData.zip,
            currency: loteamientoData.currency,
            images: loteamientoData.images,
            status: loteamientoData.status,
            privateFiles: loteamientoData.privateFiles,
            coordinates: { lat: -31.4167, lng: -64.1833 }, // Default coordinates for Córdoba
            numberOfLots: loteamientoData.numberOfLots!,
            totalArea: loteamientoData.totalArea!,
            availableLots: loteamientoData.availableLots!,
            lotSizes: loteamientoData.lotSizes!,
            services: loteamientoData.services!,
          };
        } else if (formData.type === "edificio") {
          const { id: _, createdAt: __, updatedAt: ___, ...edificioData } = formData as DevelopmentFormData;
          developmentForCreate = {
            type: "edificio",
            title: edificioData.title,
            description: edificioData.description,
            address: edificioData.address,
            city: edificioData.city,
            state: edificioData.state,
            zip: edificioData.zip,
            currency: edificioData.currency,
            images: edificioData.images,
            status: edificioData.status,
            privateFiles: edificioData.privateFiles,
            numberOfFloors: edificioData.numberOfFloors!,
            numberOfUnits: edificioData.numberOfUnits!,
            availableUnits: edificioData.availableUnits!,
            unitTypes: edificioData.unitTypes!,
            amenities: edificioData.amenities!,
            buildingFeatures: edificioData.buildingFeatures || "",
            additionalAmenities: edificioData.additionalAmenities!,
            units: edificioData.units!,
          };
        } else if (formData.type === "condominio") {
          const { id: _, createdAt: __, updatedAt: ___, ...condominioData } = formData as DevelopmentFormData;
          developmentForCreate = {
            type: "condominio",
            title: condominioData.title,
            description: condominioData.description,
            address: condominioData.address,
            city: condominioData.city,
            state: condominioData.state,
            zip: condominioData.zip,
            currency: condominioData.currency,
            images: condominioData.images,
            status: condominioData.status,
            privateFiles: condominioData.privateFiles,
            coordinates: { lat: -31.4167, lng: -64.1833 }, // Default coordinates for Córdoba
            numberOfUnits: condominioData.numberOfUnits!,
            availableUnits: condominioData.availableUnits!,
            unitTypes: condominioData.unitTypes!,
            lotSizes: condominioData.lotSizes!,
            totalArea: condominioData.totalArea!,
            commonAreas: condominioData.commonAreas!,
            securityFeatures: condominioData.securityFeatures!,
            maintenanceFee: condominioData.maintenanceFee!,
            amenities: condominioData.amenities!,
          };
        } else {
          const { id: _, createdAt: __, updatedAt: ___, ...barrioCerradoData } = formData as DevelopmentFormData;
          developmentForCreate = {
            type: "barrio_cerrado",
            title: barrioCerradoData.title,
            description: barrioCerradoData.description,
            address: barrioCerradoData.address,
            city: barrioCerradoData.city,
            state: barrioCerradoData.state,
            zip: barrioCerradoData.zip,
            currency: barrioCerradoData.currency,
            images: barrioCerradoData.images,
            status: barrioCerradoData.status,
            privateFiles: barrioCerradoData.privateFiles,
            coordinates: { lat: -31.4167, lng: -64.1833 }, // Default coordinates for Córdoba
            numberOfLots: barrioCerradoData.numberOfLots!,
            availableLots: barrioCerradoData.availableLots!,
            totalArea: barrioCerradoData.totalArea!,
            lotSizes: barrioCerradoData.lotSizes!,
            services: barrioCerradoData.services!,
            securityFeatures: barrioCerradoData.securityFeatures!,
            commonAreas: barrioCerradoData.commonAreas!,
            maintenanceFee: barrioCerradoData.maintenanceFee!,
            buildingRegulations: barrioCerradoData.buildingRegulations!,
            amenities: barrioCerradoData.amenities!,
          };
        }

        await developmentService.createDevelopment(developmentForCreate as Development);
      }

      return true;
    } catch (error) {
      console.error("Error saving development:", error);
      return false;
    }
  }, [formData, validate, errors, initialData]);

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