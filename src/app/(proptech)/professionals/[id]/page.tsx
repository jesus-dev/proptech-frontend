"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Professional, professionalService } from "../services/professionalService";
import { ServiceType, serviceTypeService } from "../service-types/services/serviceTypeService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { SERVICE_STATUS } from "../types";
import ImageCropModal from '@/components/common/ImageCropModal';
import { getEndpoint } from '@/lib/api-config';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  MapPinIcon,
  StarIcon,
  PencilIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  CalendarIcon,
  PhotoIcon,
  ShareIcon,
  CameraIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export default function ProfessionalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pendingImageBlob, setPendingImageBlob] = useState<Blob | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const professionalId = Number(params?.id);

  useEffect(() => {
    loadServiceTypes();
    if (professionalId) {
      loadProfessional();
    }
  }, [professionalId]);

  const loadServiceTypes = async () => {
    try {
      const data = await serviceTypeService.getActiveServiceTypes();
      setServiceTypes(data);
    } catch (error) {
      console.error("Error loading service types:", error);
    }
  };

  const loadProfessional = async () => {
    try {
      setLoading(true);
      const data = await professionalService.getProfessionalById(professionalId);
      setProfessional(data);
      if (data?.photo) {
        setOriginalPhotoUrl(data.photo.split('?')[0]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar el profesional",
        variant: "destructive",
      });
      router.push("/professionals");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona un archivo de imagen');
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
      if (!originalPhotoUrl && professional?.photo) {
        setOriginalPhotoUrl(professional.photo.split('?')[0]);
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

  const handleUploadPhoto = async () => {
    if (!pendingImageBlob || !professional) return;

    try {
      setUploadingPhoto(true);
      setUploadError(null);
      const file = new File([pendingImageBlob], 'professional-photo.jpg', { type: 'image/jpeg' });
      const result = await professionalService.uploadProfessionalPhoto(professional.id, file, originalPhotoUrl || undefined);
      
      if (result.fileUrl) {
        setProfessional(prev => prev ? { ...prev, photo: result.fileUrl } : null);
        setOriginalPhotoUrl(result.fileUrl.split('?')[0]);
        
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPendingImageBlob(null);
        setPreviewUrl(null);
        
        toast({
          title: "Foto actualizada",
          description: "La foto de perfil ha sido actualizada exitosamente.",
        });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setUploadError(error instanceof Error ? error.message : 'Error al subir la foto');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al subir la foto",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!professional) return;

    if (pendingImageBlob || previewUrl) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPendingImageBlob(null);
      setPreviewUrl(null);
      setUploadError(null);
      return;
    }
    
    if (professional.photo) {
      if (!confirm("¿Estás seguro de que quieres eliminar la foto de perfil?")) {
        return;
      }

      try {
        setUploadingPhoto(true);
        await professionalService.deleteProfessionalPhoto(professional.id, professional.photo);
        setProfessional(prev => prev ? { ...prev, photo: undefined } : null);
        setOriginalPhotoUrl('');
        
        toast({
          title: "Foto eliminada",
          description: "La foto de perfil ha sido eliminada exitosamente.",
        });
      } catch (error) {
        console.error('Error deleting photo:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al eliminar la foto",
          variant: "destructive",
        });
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!professional) return;

    if (!confirm("¿Estás seguro de que quieres eliminar este profesional? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      setActionLoading(true);
      await professionalService.deleteProfessional(professional.id);
      toast({
        title: "Profesional eliminado",
        description: "El profesional ha sido eliminado exitosamente.",
      });
      router.push("/professionals");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el profesional",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-100 text-green-800", icon: CheckCircleIcon },
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: ClockIcon },
      INACTIVE: { color: "bg-gray-100 text-gray-800", icon: UserIcon },
      SUSPENDED: { color: "bg-red-100 text-red-800", icon: ExclamationTriangleIcon },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status}
      </span>
    );
  };

  const getServiceTypeInfo = (professional: Professional) => {
    if (professional.serviceTypeId) {
      const type = serviceTypes.find(t => t.id === professional.serviceTypeId);
      if (type) {
        return type;
      }
    }
    return { 
      id: 0, 
      name: professional.serviceTypeName || "Desconocido", 
      icon: "🔧", 
      description: "",
      code: professional.serviceTypeCode || "",
      isActive: true,
      sortOrder: 0
    };
  };

  const formatCurrency = (amount: number | undefined, currency: string = "USD") => {
    if (!amount) return "$0";
    return formatPrice(amount, currency as 'USD' | 'ARS' | 'EUR');
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No especificado";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Profesional no encontrado
          </h2>
          <Link
            href="/professionals"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  const serviceTypeInfo = getServiceTypeInfo(professional);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/professionals"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {professional.firstName} {professional.lastName}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Profesional #{professional.id}
                </p>
                <div className="flex flex-wrap gap-2 mt-2 items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <span className="mr-1">{serviceTypeInfo.icon}</span>
                    {serviceTypeInfo.name}
                  </span>
                  {getStatusBadge(professional.status || "")}
                  {professional.isVerified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Verificado
                    </span>
                  )}
                  {professional.isAvailable && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      Disponible
                    </span>
                  )}
                </div>
                <div className="flex flex-nowrap gap-2 mt-4 overflow-x-auto pb-2">
                  <Link
                    href={`/professionals/${professional.id}/edit`}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Editar Profesional
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Eliminar Profesional
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Foto y Descripción */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 relative">
                  {(previewUrl || professional.photo) ? (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 bg-white dark:bg-gray-700">
                      <img
                        src={previewUrl || (professional.photo?.startsWith('http') ? professional.photo : getEndpoint(professional.photo?.startsWith('/') ? professional.photo : `/${professional.photo}`))}
                        alt={`${professional.firstName} ${professional.lastName}`}
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
                    <div className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border-4 border-blue-500">
                      <UserIcon className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="professional-photo-upload"
                    />
                    <label
                      htmlFor="professional-photo-upload"
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm"
                    >
                      <CameraIcon className="w-4 h-4 mr-2" />
                      {previewUrl || professional.photo ? 'Cambiar Foto' : 'Subir Foto'}
                    </label>
                    {(previewUrl || professional.photo) && (
                      <button
                        type="button"
                        onClick={handleDeletePhoto}
                        disabled={uploadingPhoto}
                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                      >
                        <XMarkIcon className="w-4 h-4 mr-2" />
                        Eliminar
                      </button>
                    )}
                    {pendingImageBlob && (
                      <button
                        type="button"
                        onClick={handleUploadPhoto}
                        disabled={uploadingPhoto}
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                      >
                        {uploadingPhoto ? 'Subiendo...' : 'Guardar Foto'}
                      </button>
                    )}
                  </div>
                  {uploadError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mb-2">{uploadError}</p>
                  )}
                  {pendingImageBlob && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                      Foto pendiente de guardar. Haz clic en "Guardar Foto" para subirla.
                    </p>
                  )}
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    {professional.firstName} {professional.lastName}
                  </h2>
                  {professional.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {professional.description}
                    </p>
                  )}
                  {professional.averageRating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(professional.averageRating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {professional.averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({professional.totalReviews} reseñas)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información Personal */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Información de Contacto
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Email
                  </label>
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <a
                      href={`mailto:${professional.email}`}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      {professional.email}
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Teléfono
                  </label>
                  <div className="flex items-center">
                    <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <a
                      href={`tel:${professional.phone}`}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      {professional.phone}
                    </a>
                  </div>
                </div>

                {professional.documentNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Documento
                    </label>
                    <div className="flex items-center">
                      <DocumentTextIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">
                        {professional.documentType}: {professional.documentNumber}
                      </span>
                    </div>
                  </div>
                )}

                {professional.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Sitio Web
                    </label>
                    <div className="flex items-center">
                      <GlobeAltIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <a
                        href={professional.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        {professional.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ubicación */}
            {professional.address && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Ubicación
                </h2>

                <div className="flex items-start">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-gray-900 dark:text-white">{professional.address}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {professional.city}{professional.state && `, ${professional.state}`}
                      {professional.zipCode && ` ${professional.zipCode}`}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {professional.country}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Áreas de Servicio */}
            {professional.serviceAreas && professional.serviceAreas.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Áreas de Cobertura
                </h2>
                <div className="flex flex-wrap gap-2">
                  {professional.serviceAreas.map((area: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Habilidades */}
            {professional.skills && professional.skills.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Habilidades
                </h2>
                <div className="flex flex-wrap gap-2">
                  {professional.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certificaciones */}
            {professional.certifications && professional.certifications.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Certificaciones
                </h2>
                <div className="flex flex-wrap gap-2">
                  {professional.certifications.map((cert: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portafolio */}
            {professional.portfolioImages && professional.portfolioImages.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Portafolio
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {professional.portfolioImages.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Trabajo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Notas */}
            {professional.notes && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Notas
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {professional.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Precios */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Precios
              </h3>

              <div className="space-y-4">
                {professional.hourlyRate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Tarifa por Hora
                    </label>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(professional.hourlyRate, professional.currencyCode || "USD")}
                    </p>
                  </div>
                )}

                {professional.minimumServicePrice && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Precio Mínimo
                    </label>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(professional.minimumServicePrice, professional.currencyCode || "USD")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Estadísticas
              </h3>

              <div className="space-y-4">
                {professional.experienceYears && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Años de Experiencia
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {professional.experienceYears} años
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Trabajos Completados
                  </label>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {professional.completedJobs || 0}
                  </p>
                </div>

                {professional.responseTimeHours && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Tiempo de Respuesta
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {professional.responseTimeHours} horas
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Información Adicional */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Información Adicional
              </h3>

              <div className="space-y-3">
                {professional.companyName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Empresa
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {professional.companyName}
                    </p>
                  </div>
                )}

                {professional.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Fecha de Registro
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(professional.createdAt)}
                    </p>
                  </div>
                )}

                {professional.verificationDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Fecha de Verificación
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(professional.verificationDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de recorte de imagen */}
      {showCropModal && selectedImage && (
        <ImageCropModal
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          cropShape="round"
        />
      )}
    </div>
  );
}

