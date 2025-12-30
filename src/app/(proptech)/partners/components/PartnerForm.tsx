"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Partner, partnerService } from "../services/partnerService";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, PlusIcon, XMarkIcon, CheckCircleIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import QRCode from 'react-qr-code';
import { Dialog } from '@headlessui/react';

interface PartnerFormProps {
  partner?: Partner;
  isEditing?: boolean;
}

export default function PartnerForm({ partner, isEditing = false }: PartnerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (partner) {
      // Ensure specializations and territories are always arrays
      const processedPartner = {
        ...partner,
        specializations: Array.isArray(partner.specializations) 
          ? partner.specializations 
          : (typeof partner.specializations === 'string' && partner.specializations
              ? (partner.specializations as string).split(",").map((s: string) => s.trim())
              : []),
        territories: Array.isArray(partner.territories)
          ? partner.territories
          : (typeof partner.territories === 'string' && partner.territories
              ? (partner.territories as string).split(",").map((s: string) => s.trim())
              : []),
        socialMedia: Array.isArray(partner.socialMedia) ? partner.socialMedia : [],
        languages: Array.isArray(partner.languages) ? partner.languages : ["Español"],
        certifications: Array.isArray(partner.certifications) ? partner.certifications : []
      };
      setFormData(processedPartner);
    }
  }, [partner]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (field: keyof Partner, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    if (value.trim() && !currentArray.includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...currentArray, value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: keyof Partner, index: number) => {
    const currentArray = (formData[field] as string[]) || [];
    setFormData(prev => ({
      ...prev,
      [field]: currentArray.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && partner) {
        await partnerService.updatePartner(partner.id, formData);
        toast({
          title: "Socio actualizado",
          description: "El socio ha sido actualizado exitosamente.",
        });
      } else {
        await partnerService.createPartner(formData as Omit<Partner, 'id'>);
        toast({
          title: "Socio creado",
          description: "El socio ha sido creado exitosamente.",
        });
      }
      router.push("/partners");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      INDIVIDUAL: UserIcon,
      COMPANY: BuildingOfficeIcon,
      AGENCY: BuildingOfficeIcon,
      BROKER: BriefcaseIcon,
      INVESTOR: BriefcaseIcon
    };
    return icons[type as keyof typeof icons] || UserIcon;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? "Editar Socio" : "Nuevo Socio"}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isEditing ? "Modifica la información del socio" : "Agrega un nuevo socio comercial"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Personal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Información Personal
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre <span className="text-red-500">*</span>
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
                Apellido <span className="text-red-500">*</span>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número de Documento
              </label>
              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Documento
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
          </div>
        </div>

        {/* Tipo y Estado */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Tipo y Estado
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Socio <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["INDIVIDUAL", "COMPANY", "AGENCY", "BROKER", "INVESTOR"].map((type) => {
                  const Icon = getTypeIcon(type);
                  const isSelected = formData.type === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type }))}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        isSelected
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">
                        {type === "INDIVIDUAL" && "Individual"}
                        {type === "COMPANY" && "Empresa"}
                        {type === "AGENCY" && "Agencia"}
                        {type === "BROKER" && "Broker"}
                        {type === "INVESTOR" && "Inversor"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
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
        </div>

        {/* Información de la Empresa */}
        {(formData.type === "COMPANY" || formData.type === "AGENCY") && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Información de la Empresa
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Registro de Empresa
                </label>
                <input
                  type="text"
                  name="companyRegistration"
                  value={formData.companyRegistration || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cargo/Puesto
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Dirección */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Dirección
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
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
                Estado/Departamento
              </label>
              <input
                type="text"
                name="state"
                value={formData.state || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

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
                value={formData.country || "Paraguay"}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Especializaciones y Territorios */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Especializaciones y Territorios
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Especializaciones
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Agregar especialización..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayInputChange('specializations', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      handleArrayInputChange('specializations', input.value);
                      input.value = '';
                    }}
                    className="px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.specializations || []).map((item: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-brand-100 text-brand-800"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('specializations', index)}
                        className="ml-1 text-brand-600 hover:text-brand-800"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Territorios de Trabajo
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Agregar territorio..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayInputChange('territories', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      handleArrayInputChange('territories', input.value);
                      input.value = '';
                    }}
                    className="px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.territories || []).map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('territories', index)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Notas Adicionales
          </h2>
          
          <textarea
            name="notes"
            value={formData.notes || ""}
            onChange={handleInputChange}
            rows={4}
            placeholder="Información adicional sobre el socio..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Guardando...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                {isEditing ? "Actualizar Socio" : "Crear Socio"}
              </div>
            )}
          </button>
        </div>
      </form>

      <button
        type="button"
        className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg shadow hover:bg-brand-700 focus:outline-none"
        onClick={() => setShowCard(true)}
      >
        Carnet digital
      </button>

      <Dialog open={showCard} onClose={() => setShowCard(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-sm w-full z-10">
            <Dialog.Title className="text-xl font-bold mb-4 text-center">Carnet Digital de Socio</Dialog.Title>
            <div className="flex flex-col items-center gap-2">
              {/* Foto del socio */}
              {partner?.photo ? (
                <img src={partner.photo} alt="Foto socio" className="w-24 h-24 rounded-full object-cover border-2 border-brand-500 mb-2" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                  <UserIcon className="w-12 h-12 text-gray-500" />
                </div>
              )}
              <div className="text-lg font-semibold">{formData.firstName} {formData.lastName}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{formData.type}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Vencimiento: {formData.nextPaymentDate || 'N/A'}</div>
              <div className="mt-4">
                <QRCode value={partner?.id ? `${window.location.origin}/validar-socio/${partner.id}` : 'Socio'} size={128} />
              </div>
            </div>
            <button
              type="button"
              className="mt-6 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowCard(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
} 