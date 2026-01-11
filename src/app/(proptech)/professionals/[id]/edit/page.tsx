"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, CameraIcon, XMarkIcon, UserIcon, AcademicCapIcon, SparklesIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { Professional, professionalService } from "../../services/professionalService";
import { ServiceType, serviceTypeService } from "../../service-types/services/serviceTypeService";
import { SERVICE_STATUS } from "../../types";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import CurrencyCodeSelector from "@/components/ui/CurrencyCodeSelector";
import ImageCropModal from '@/components/common/ImageCropModal';
import { getEndpoint } from '@/lib/api-config';

export default function EditProfessionalPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [formData, setFormData] = useState<Partial<Professional>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pendingImageBlob, setPendingImageBlob] = useState<Blob | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [certificationInput, setCertificationInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [serviceAreaInput, setServiceAreaInput] = useState("");

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
      if (data) {
        setFormData({
          ...data,
          socialMedia: data.socialMedia || [],
          serviceAreas: data.serviceAreas || [],
          skills: data.skills || [],
          certifications: data.certifications || [],
          portfolioImages: data.portfolioImages || []
        });
        if (data.photo) {
          setOriginalPhotoUrl(data.photo.split('?')[0]);
        }
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

  const handleUploadPhoto = async () => {
    if (!pendingImageBlob) return;

    try {
      setUploadingPhoto(true);
      setUploadError(null);
      const file = new File([pendingImageBlob], 'professional-photo.jpg', { type: 'image/jpeg' });
      const result = await professionalService.uploadProfessionalPhoto(professionalId, file, originalPhotoUrl || undefined);
      
      if (result.fileUrl) {
        setFormData(prev => ({ ...prev, photo: result.fileUrl }));
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

  const handleAddCertification = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && certificationInput.trim()) {
      e.preventDefault();
      const certifications = formData.certifications || [];
      if (!certifications.includes(certificationInput.trim())) {
        setFormData({
          ...formData,
          certifications: [...certifications, certificationInput.trim()]
        });
      }
      setCertificationInput("");
    }
  };

  const handleRemoveCertification = (index: number) => {
    const certifications = formData.certifications || [];
    setFormData({
      ...formData,
      certifications: certifications.filter((_, i) => i !== index)
    });
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const skills = formData.skills || [];
      if (!skills.includes(skillInput.trim())) {
        setFormData({
          ...formData,
          skills: [...skills, skillInput.trim()]
        });
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    const skills = formData.skills || [];
    setFormData({
      ...formData,
      skills: skills.filter((_, i) => i !== index)
    });
  };

  const handleAddServiceArea = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && serviceAreaInput.trim()) {
      e.preventDefault();
      const serviceAreas = formData.serviceAreas || [];
      if (!serviceAreas.includes(serviceAreaInput.trim())) {
        setFormData({
          ...formData,
          serviceAreas: [...serviceAreas, serviceAreaInput.trim()]
        });
      }
      setServiceAreaInput("");
    }
  };

  const handleRemoveServiceArea = (index: number) => {
    const serviceAreas = formData.serviceAreas || [];
    setFormData({
      ...formData,
      serviceAreas: serviceAreas.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.serviceTypeId) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await professionalService.updateProfessional(professionalId, formData);
      toast({
        title: "Éxito",
        description: "Profesional actualizado exitosamente",
      });
      router.push(`/professionals/${professionalId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el profesional",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/professionals/${professionalId}`}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver al Profesional
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Editar Profesional
            </h1>
          </div>
        </div>

        {/* Form - Similar to new page but with existing data */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          {/* Foto de Perfil */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Foto de Perfil
            </h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 relative">
                {(previewUrl || formData.photo) ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                    <img 
                      src={
                        previewUrl || 
                        (formData.photo?.startsWith('http') 
                          ? formData.photo 
                          : getEndpoint(formData.photo?.startsWith('/') 
                            ? formData.photo 
                            : `/uploads/professionals/${formData.photo}`))
                      }
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
                    <UserIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="professional-photo-upload-edit"
                />
                <label
                  htmlFor="professional-photo-upload-edit"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <CameraIcon className="w-4 h-4 mr-2" />
                  {previewUrl || formData.photo ? 'Cambiar Foto' : 'Subir Foto'}
                </label>
                {(previewUrl || formData.photo) && (
                  <>
                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Eliminar Foto
                    </button>
                    {pendingImageBlob && (
                      <button
                        type="button"
                        onClick={handleUploadPhoto}
                        disabled={uploadingPhoto}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {uploadingPhoto ? 'Subiendo...' : 'Guardar Foto'}
                      </button>
                    )}
                  </>
                )}
                {uploadError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                )}
                {pendingImageBlob && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Foto pendiente de guardar. Haz clic en "Guardar Foto" para subirla.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Información Personal */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Información Personal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName || ""}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName || ""}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Documento
                </label>
                <select
                  value={formData.documentType || ""}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="CEDULA">Cédula</option>
                  <option value="RUC">RUC</option>
                  <option value="PASSPORT">Pasaporte</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Documento
                </label>
                <input
                  type="text"
                  value={formData.documentNumber || ""}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Información de Servicio */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Información de Servicio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Servicio <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.serviceTypeId || ""}
                  onChange={(e) => setFormData({ ...formData, serviceTypeId: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Selecciona un tipo de servicio</option>
                  {serviceTypes.map((type: ServiceType) => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status || ""}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {SERVICE_STATUS.map((status: { value: string; label: string }) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                rows={4}
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe los servicios que ofreces..."
              />
            </div>
          </div>

          {/* Precios */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Precios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tarifa por Hora
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate || ""}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio Mínimo de Servicio
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimumServicePrice || ""}
                  onChange={(e) => setFormData({ ...formData, minimumServicePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Moneda
                </label>
                <CurrencyCodeSelector
                  selectedCurrencyCode={formData.currencyCode}
                  onCurrencyChange={(currencyCode) => setFormData({ ...formData, currencyCode })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Certificaciones - Compacto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-1.5">
                <AcademicCapIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Certificaciones
              </div>
            </label>
            <div className="space-y-2">
              <div className="relative flex flex-wrap items-center gap-1.5 min-h-[2.5rem] px-2.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                {(formData.certifications || []).map((cert, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium border border-blue-200 dark:border-blue-800"
                  >
                    <AcademicCapIcon className="w-3 h-3" />
                    {cert}
                    <button
                      type="button"
                      onClick={() => handleRemoveCertification(index)}
                      className="ml-0.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded p-0.5 transition-colors"
                      aria-label={`Eliminar ${cert}`}
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={certificationInput}
                  onChange={(e) => setCertificationInput(e.target.value)}
                  onKeyDown={handleAddCertification}
                  placeholder="Agregar certificación..."
                  className="flex-1 min-w-[150px] border-0 outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Especialidades / Skills - Compacto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Especialidades y Habilidades
              </div>
            </label>
            <div className="space-y-2">
              <div className="relative flex flex-wrap items-center gap-1.5 min-h-[2.5rem] px-2.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all">
                {(formData.skills || []).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-xs font-medium border border-green-200 dark:border-green-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="ml-0.5 hover:bg-green-100 dark:hover:bg-green-900/40 rounded p-0.5 transition-colors"
                      aria-label={`Eliminar ${skill}`}
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Agregar especialidad..."
                  className="flex-1 min-w-[150px] border-0 outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Áreas de servicio que cubre - Compacto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-1.5">
                <MapPinIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                Ubicaciones que cubre con su servicio
              </div>
            </label>
            <div className="space-y-2">
              <div className="relative flex flex-wrap items-center gap-1.5 min-h-[2.5rem] px-2.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-all">
                {(formData.serviceAreas || []).map((area, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-xs font-medium border border-green-200 dark:border-green-800"
                  >
                    <MapPinIcon className="w-3 h-3" />
                    {area}
                    <button
                      type="button"
                      onClick={() => handleRemoveServiceArea(index)}
                      className="ml-0.5 hover:bg-green-100 dark:hover:bg-green-900/40 rounded p-0.5 transition-colors"
                      aria-label={`Eliminar ${area}`}
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={serviceAreaInput}
                  onChange={(e) => setServiceAreaInput(e.target.value)}
                  onKeyDown={handleAddServiceArea}
                  placeholder="Agregar ubicación..."
                  className="flex-1 min-w-[150px] border-0 outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-xs"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Agrega las ciudades, zonas o áreas donde el profesional brinda sus servicios. Presiona Enter después de cada una.
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href={`/professionals/${professionalId}`}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving && <LoadingSpinner size="sm" />}
              Guardar Cambios
            </button>
          </div>
        </form>

        {/* Modal de recorte de imagen */}
        {showCropModal && selectedImage && (
          <ImageCropModal
            imageSrc={selectedImage}
            onComplete={handleCropComplete}
            onCancel={handleCropCancel}
            aspectRatio={1}
            circularCrop={true}
          />
        )}
      </div>
    </div>
  );
}

