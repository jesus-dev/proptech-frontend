"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  UserPlusIcon,
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { BuildingIcon } from "@/icons";
import { contactService } from "../services/contactService";
import { Contact, ContactType, ContactStatus, ContactFormData } from "../types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function NewContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    type: "prospect",
    status: "lead",
    company: "",
    position: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    notes: "",
    source: "",
    budget: {
      min: undefined,
      max: undefined,
      currency: "USD"
    },
    preferences: {
      propertyType: [],
      location: [],
      bedrooms: undefined,
      bathrooms: undefined,
      area: {
        min: undefined,
        max: undefined
      }
    },
    tags: [],
    assignedTo: "",
    lastContact: "",
    nextFollowUp: ""
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBudgetChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        [field]: value
      }
    }));
  };

  const handlePreferencesChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName) {
        throw new Error("Los campos Nombre y Apellido son obligatorios");
      }
      
      if (!formData.phone) {
        throw new Error("El campo Teléfono es obligatorio");
      }

      console.log("📤 Enviando datos al backend:", JSON.stringify(formData, null, 2));

      // Create contact
      const newContact = await contactService.createContact(formData);
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/contacts");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el contacto");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Contacto Creado!</h2>
          <p className="text-gray-600 mb-4">El contacto se ha creado exitosamente.</p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500">Redirigiendo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlusIcon className="w-8 h-8 text-brand-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nuevo Contacto</h1>
                <p className="text-gray-600">Completa la información del contacto</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              <XMarkIcon className="w-5 h-5" />
              Cancelar
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <UserPlusIcon className="w-6 h-6 text-brand-500" />
                Información Básica
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Contacto
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value as ContactType)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="prospect">Interesado</option>
                    <option value="client">Cliente</option>
                    <option value="buyer">Comprador</option>
                    <option value="seller">Vendedor</option>
                    <option value="owner">Titular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value as ContactStatus)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="lead">Lead</option>
                    <option value="qualified">Calificado</option>
                    <option value="active">Activo</option>
                    <option value="converted">Convertido</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <BuildingIcon className="w-6 h-6 text-brand-500" />
                Información de Empresa
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={formData.company || ""}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.position || ""}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Dirección</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address || ""}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.city || ""}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado/Provincia
                  </label>
                  <input
                    type="text"
                    value={formData.state || ""}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={formData.zip || ""}
                    onChange={(e) => handleInputChange("zip", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.country || ""}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Adicional</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origen
                  </label>
                  <select
                    value={formData.source || ""}
                    onChange={(e) => handleInputChange("source", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">Seleccionar origen</option>
                    <option value="website">Sitio Web</option>
                    <option value="referral">Referido</option>
                    <option value="social_media">Redes Sociales</option>
                    <option value="advertisement">Publicidad</option>
                    <option value="cold_call">Llamada en Frío</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asignado a
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo || ""}
                    onChange={(e) => handleInputChange("assignedTo", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="ID del agente asignado"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Información adicional sobre el contacto..."
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Creando...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Crear Contacto
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 