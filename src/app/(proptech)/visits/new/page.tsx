"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { visitService } from "../services/visitService";
import ClientCombobox from "../components/ClientCombobox";
import { Client } from "../../developments/components/types";
import PropertyCombobox from "@/components/ui/PropertyCombobox";
import { Property } from "@/app/(proptech)/properties/components/types";
import { propertyService } from "@/app/(proptech)/properties/services/propertyService";
import { 
  ChevronLeft, 
  Save, 
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Building,
  Clock,
  FileText,
  CheckSquare,
  XSquare,
  Plus
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function NewVisitPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledDate: "",
    clientId: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    propertyId: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Cargar propiedades al montar el componente
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const props = await propertyService.getAllProperties();
        setProperties((props as any).data || props);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };
    fetchProperties();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePropertySelect = (property: Property | null) => {
    setSelectedProperty(property);
    setFormData(prev => ({ 
      ...prev, 
      propertyId: property?.id || '',
      title: property?.title || ''
    }));
  };

  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
    setClientError(null);
    setFormData(prev => ({
      ...prev,
      clientId: client?.id || '',
      clientName: client ? `${client.firstName} ${client.lastName}` : '',
      clientEmail: client?.email || '',
      clientPhone: client?.phone || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que se haya seleccionado un cliente
    if (!selectedClient) {
      setClientError("Debes seleccionar un cliente.");
      return;
    }
    
    setSaving(true);
    setError(null);
    setClientError(null);

    try {
      await visitService.createVisit({
        ...formData,
        status: "scheduled",
      });
      setSaveSuccess(true);
      setTimeout(() => {
        router.push("/visits");
      }, 2000);
    } catch (err) {
      setError("Error al crear la visita");
      console.error("Error creating visit:", err);
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: "scheduled", label: "Programada", icon: <Calendar className="h-4 w-4" /> },
    { value: "in_progress", label: "En Progreso", icon: <Clock className="h-4 w-4" /> },
    { value: "completed", label: "Completada", icon: <CheckSquare className="h-4 w-4" /> },
    { value: "cancelled", label: "Cancelada", icon: <XSquare className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/visits')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Nueva Visita
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Complete el formulario para programar una nueva visita
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
                  <span className="text-sm">Visita creada exitosamente</span>
                </div>
              )}
              
              {/* Save button */}
              <button
                onClick={handleSubmit}
                disabled={saving || loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  saving || loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg'
                }`}
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="md" />
                    <span className="ml-2">Guardando...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    ¡Perfecto! Creada
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Crear Visita
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detalles de la Visita
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      {error}
                    </div>
                  </div>
                )}

                {/* Property Selection */}
                <div>
                  <PropertyCombobox
                    value={selectedProperty}
                    onChange={handlePropertySelect}
                    label="Propiedad"
                    placeholder="Buscar y seleccionar propiedad..."
                  />
                </div>

                {/* Client Selection */}
                <div>
                  <ClientCombobox
                    value={selectedClient}
                    onChange={handleClientSelect}
                    required={true}
                  />
                  {clientError && (
                    <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {clientError}
                    </div>
                  )}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="scheduledDate"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hora
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Detalles adicionales sobre la visita..."
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Información de la Visita
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Calendar className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.title || 'Sin título'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.scheduledDate ? new Date(formData.scheduledDate).toLocaleDateString('es-PY') : 'Sin fecha'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <User className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Cliente
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : 'No seleccionado'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Building className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Propiedad
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedProperty ? selectedProperty.title : 'No seleccionada'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Clock className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Estado
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Programada
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 