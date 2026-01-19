"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Partner, partnerService } from "../../services/partnerService";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ImageCropModal from '@/components/common/ImageCropModal';
import { getEndpoint } from '@/lib/api-config';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  User,
  Building2,
  MapPin,
  FileText,
  Save,
  Camera,
  X
} from "lucide-react";

interface StepInfo {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function EditPartnerPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingPartner, setLoadingPartner] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pendingImageBlob, setPendingImageBlob] = useState<Blob | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Partner>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    documentNumber: "",
    documentType: "CI",
    type: "INDIVIDUAL",
    status: "PENDING",
    companyName: "",
    companyRegistration: "",
    position: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Paraguay",
    website: "",
    socialMedia: [],
    notes: "",
    specializations: [],
    territories: [],
    languages: ["Español"],
    certifications: [],
    experienceYears: 0,
    propertiesManaged: 0,
    successfulDeals: 0,
    isVerified: false
  });

  const partnerId = Number(params?.id);

  useEffect(() => {
    if (partnerId) {
      loadPartner();
    }
  }, [partnerId]);

  const loadPartner = async () => {
    try {
      setLoadingPartner(true);
      const data = await partnerService.getPartnerById(partnerId);
      
      if (!data) {
        toast({
          title: "Error",
          description: "Socio no encontrado",
          variant: "destructive",
        });
        router.push("/partners");
        return;
      }
      
      // Procesar los datos del socio igual que en la página de detalle
      const processedPartner = {
        ...data,
        specializations: Array.isArray(data.specializations) 
          ? data.specializations 
          : (typeof data.specializations === 'string' && data.specializations
              ? (data.specializations as string).split(",").map((s: string) => s.trim())
              : []),
        territories: Array.isArray(data.territories)
          ? data.territories
          : (typeof data.territories === 'string' && data.territories
              ? (data.territories as string).split(",").map((s: string) => s.trim())
              : []),
        // Asegurar que socialMedia siempre sea un array, nunca null o undefined
        socialMedia: (data.socialMedia && Array.isArray(data.socialMedia)) ? data.socialMedia : [],
        languages: Array.isArray(data.languages) ? data.languages : ["Español"],
        certifications: Array.isArray(data.certifications) ? data.certifications : []
      };
      
      setFormData(processedPartner);
      
      // Cargar la foto si existe
      if (processedPartner.photo) {
        const photoUrl = processedPartner.photo.startsWith('http') 
          ? processedPartner.photo 
          : getEndpoint(processedPartner.photo.startsWith('/') ? processedPartner.photo : `/${processedPartner.photo}`);
        setPreviewUrl(photoUrl);
        setOriginalPhotoUrl(processedPartner.photo.split('?')[0]);
      }
    } catch (error) {
      console.error("Error loading partner:", error);
      toast({
        title: "Error",
        description: "Error al cargar el socio",
        variant: "destructive",
      });
      router.push("/partners");
    } finally {
      setLoadingPartner(false);
    }
  };

  const steps: StepInfo[] = [
    {
      id: 1,
      title: "Tipo de Socio",
      description: "Selecciona el tipo de socio comercial",
      icon: <User className="h-5 w-5" />
    },
    {
      id: 2,
      title: "Información Básica",
      description: "Datos personales o empresariales",
      icon: <Building2 className="h-5 w-5" />
    },
    {
      id: 3,
      title: "Contacto y Ubicación",
      description: "Dirección y medios de contacto",
      icon: <MapPin className="h-5 w-5" />
    },
    {
      id: 4,
      title: "Información Adicional",
      description: "Detalles profesionales y especializaciones",
      icon: <FileText className="h-5 w-5" />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setShowCropModal(true);
      setUploadError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    try {
      setShowCropModal(false);
      setUploadError(null);
      setPendingImageBlob(croppedBlob);
      const localUrl = URL.createObjectURL(croppedBlob);
      setPreviewUrl(localUrl);
      if (!originalPhotoUrl && formData.photo) {
        setOriginalPhotoUrl(formData.photo.split('?')[0]);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setUploadError('Error al procesar la imagen. Por favor intenta nuevamente.');
    } finally {
      setSelectedImage(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = () => {
    if (pendingImageBlob || previewUrl) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPendingImageBlob(null);
      setPreviewUrl(null);
      setUploadError(null);
      return;
    }
    
    if (formData.photo) {
      if (!originalPhotoUrl) {
        setOriginalPhotoUrl(formData.photo.split('?')[0]);
      }
      setFormData(prev => ({ ...prev, photo: undefined }));
      setPreviewUrl(null);
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return true; // URL vacía es válida (opcional)
    
    // Verificar que tenga protocolo
    const hasProtocol = /^https?:\/\//i.test(url);
    if (!hasProtocol) {
      return false;
    }
    
    // Verificar que no sea solo un dominio sin protocolo
    try {
      const urlObj = new URL(url);
      // Verificar que tenga un hostname válido (no solo "www." o similar)
      const hostname = urlObj.hostname;
      if (!hostname || hostname === 'www' || hostname === 'www.') {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setUploadError(null);

      // Validar URL del sitio web
      if (formData.website && !validateUrl(formData.website)) {
        toast({
          title: "Error de validación",
          description: "La URL del sitio web debe incluir el protocolo (http:// o https://) y un dominio válido.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Si hay una imagen pendiente, subirla primero
      if (pendingImageBlob) {
        try {
          const file = new File([pendingImageBlob], 'partner-photo.jpg', { type: 'image/jpeg' });
          const result = await partnerService.uploadPartnerPhoto(partnerId, file, originalPhotoUrl || undefined);
          if (result.fileUrl) {
            setFormData(prev => ({ ...prev, photo: result.fileUrl }));
            
            // Esperar un momento para que el estado se actualice
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Limpiar el estado local
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
            }
            setPendingImageBlob(null);
            setOriginalPhotoUrl(result.fileUrl.split('?')[0]);
          }
        } catch (photoError) {
          console.error('Error uploading photo:', photoError);
          setUploadError('Error al subir la foto. Por favor intenta nuevamente.');
        }
      } 
      // Si se eliminó la foto pero había una original, eliminarla del servidor
      else if (!formData.photo && originalPhotoUrl) {
        try {
          await partnerService.deletePartnerPhoto(partnerId, originalPhotoUrl);
          setOriginalPhotoUrl('');
        } catch (photoError) {
          console.error('Error deleting photo:', photoError);
        }
      }

      // Preparar datos para enviar, asegurando que socialMedia sea un array vacío si es null/undefined
      const dataToSend: Partial<Partner> = {
        ...formData,
        // Asegurar que socialMedia siempre sea un array, nunca null o undefined
        socialMedia: Array.isArray(formData.socialMedia) ? formData.socialMedia : [],
        // No enviar campos de fecha
        partnershipDate: undefined,
        contractStartDate: undefined,
        contractEndDate: undefined,
        nextPaymentDate: undefined,
        lastPaymentDate: undefined,
      };
      
      // Asegurar explícitamente que socialMedia esté presente como array
      if (!dataToSend.socialMedia || !Array.isArray(dataToSend.socialMedia)) {
        dataToSend.socialMedia = [];
      }

      // Actualizar el socio
      await partnerService.updatePartner(partnerId, dataToSend);
      
      toast({
        title: "Socio actualizado",
        description: uploadError ? "El socio ha sido actualizado pero la foto no se pudo subir. Puedes intentarlo después." : "El socio ha sido actualizado exitosamente.",
      });
      router.push(`/partners/${partnerId}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Selecciona el tipo de socio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['INDIVIDUAL', 'COMPANY', 'AGENT'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={`p-6 border-2 rounded-lg text-center transition-colors ${
                    formData.type === type
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <User className={`w-8 h-8 mx-auto mb-2 ${formData.type === type ? 'text-brand-600' : 'text-gray-400'}`} />
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">
                    {type === 'INDIVIDUAL' ? 'Individual' : type === 'COMPANY' ? 'Empresa' : 'Agente'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            {/* Foto de Perfil */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Foto de Perfil
              </h3>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 relative">
                  {(previewUrl || formData.photo) ? (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                      <img 
                        src={previewUrl || (formData.photo?.startsWith('http') ? formData.photo : getEndpoint(formData.photo?.startsWith('/') ? formData.photo : `/${formData.photo}`))}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ccircle fill="%23ddd" cx="50" cy="50" r="50"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EFoto%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      {pendingImageBlob && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white text-xs">Pendiente</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="partner-photo-upload-edit"
                  />
                  <label
                    htmlFor="partner-photo-upload-edit"
                    className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {previewUrl || formData.photo ? 'Cambiar Foto' : 'Subir Foto'}
                  </label>
                  {(previewUrl || formData.photo) && (
                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Eliminar Foto
                    </button>
                  )}
                  {uploadError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                  )}
                  {pendingImageBlob && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Foto pendiente de guardar. Se subirá al guardar el formulario.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {formData.type !== 'COMPANY' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre(s) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Apellido(s) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </>
            )}
            {formData.type === 'COMPANY' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la Empresa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    RUC/Registro <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyRegistration"
                    value={formData.companyRegistration || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cargo/Posición
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Documento <span className="text-red-500">*</span>
                </label>
                <select
                  name="documentType"
                  value={formData.documentType || "CI"}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="CI">Cédula de Identidad</option>
                  <option value="RUC">RUC</option>
                  <option value="PASSPORT">Pasaporte</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Documento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="documentNumber"
                  value={formData.documentNumber || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status || "PENDING"}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="PENDING">Pendiente</option>
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
                <option value="SUSPENDED">Suspendido</option>
                <option value="TERMINATED">Terminado</option>
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dirección
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Departamento/Estado
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  País
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sitio Web
              </label>
              <input
                type="url"
                name="website"
                value={formData.website || ""}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Debe incluir el protocolo (http:// o https://)
              </p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notas
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                placeholder="Información adicional sobre el socio..."
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loadingPartner) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/partners')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Editar Socio
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Paso {currentStep} de {steps.length} • {progressPercentage.toFixed(0)}% completado
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
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
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                      currentStep === index + 1
                        ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300'
                        : index + 1 < currentStep
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
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
                      <p className="text-sm font-medium truncate">{step.title}</p>
                      <p className="text-xs opacity-75 truncate">{step.description}</p>
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

      {/* Image Crop Modal */}
      {showCropModal && selectedImage && (
        <ImageCropModal
          imageSrc={selectedImage}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
        />
      )}
    </div>
  );
}