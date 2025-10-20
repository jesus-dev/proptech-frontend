"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Visit, VisitStatus } from "../../components/types";
import { 
  ChevronLeft, 
  Save, 
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Building,
  MapPin,
  Clock,
  FileText,
  CheckSquare,
  XSquare,
  Loader2
} from "lucide-react";
import { visitService } from "../../services/visitService";
import PropertyCombobox from "@/components/ui/PropertyCombobox";
import ClientCombobox from "../../components/ClientCombobox";
import { Client } from "../../../developments/components/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { propertyService } from "@/app/(proptech)/properties/services/propertyService";
import { Property } from "@/app/(proptech)/properties/components/types";

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: visitId } = React.use(params);
  const router = useRouter();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    scheduledDate: "",
    time: "",
    notes: "",
    status: "scheduled" as VisitStatus,
  });

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        setLoading(true);
        const foundVisit = await visitService.getVisitById(visitId);
        
        if (foundVisit) {
          setVisit(foundVisit);
          setFormData({
            scheduledDate: foundVisit.scheduledDate ? foundVisit.scheduledDate.split('T')[0] : "",
            time: foundVisit.scheduledDate ? foundVisit.scheduledDate.split('T')[1]?.substring(0, 5) || "" : "",
            notes: foundVisit.notes || "",
            status: foundVisit.status || "scheduled",
          });

          // Set selected property if exists
          if (foundVisit.propertyId) {
            const property = properties.find(p => p.id === foundVisit.propertyId);
            if (property) {
              setSelectedProperty(property);
            }
          }

          // Set selected client if exists
          if (foundVisit.clientId) {
            setSelectedClient({
              id: foundVisit.clientId,
              firstName: foundVisit.clientName?.split(' ')[0] || '',
              lastName: foundVisit.clientName?.split(' ').slice(1).join(' ') || '',
              email: foundVisit.clientEmail || '',
              phone: foundVisit.clientPhone || '',
              dni: '',
              city: '',
              address: '',
              state: '',
              zip: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error("❌ EditVisitPage: Error fetching visit:", error);
        setError("Error al cargar la visita.");
      } finally {
        setLoading(false);
      }
    };

    const fetchProperties = async () => {
      try {
        const props = await propertyService.getAllProperties();
        setProperties((props as any).data || props);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
    fetchVisit();
  }, [visitId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePropertySelect = (property: Property | null) => {
    setSelectedProperty(property);
  };

  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
    setClientError(null);
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
      const visitData = {
        ...formData,
        propertyId: selectedProperty?.id,
        clientId: selectedClient?.id,
        clientName: selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : "",
        clientEmail: selectedClient?.email || "",
        clientPhone: selectedClient?.phone || "",
      };

      
      const success = await visitService.updateVisit(visitId, visitData);
      
      if (success) {
        router.push(`/visits/${visitId}`);
      } else {
        setError("Error al actualizar la visita.");
      }
    } catch (error) {
      console.error("❌ EditVisitPage: Error updating visit:", error);
      setError("Error al actualizar la visita.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="md" />;
  }

  if (error && !visit) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar la visita
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/visits')}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Volver a Visitas
          </button>
        </div>
      </div>
    );
  }

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
                  Editar Visita
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Modifica los detalles de la visita programada
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {saving && (
                <div className="flex items-center text-brand-600 dark:text-brand-400">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Guardando...</span>
                </div>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                Guardar Cambios
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
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="scheduled">Programada</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
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
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.scheduledDate ? new Date(formData.scheduledDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Fecha no establecida'}
                    </p>
                    {formData.time && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.time}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Propiedad
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedProperty ? selectedProperty.title : 'No seleccionada'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Cliente
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : 'No seleccionado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Estado
                    </p>
                    <div className="flex items-center space-x-2">
                      {formData.status === 'scheduled' && (
                        <>
                          <CheckSquare className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-blue-600 dark:text-blue-400">Programada</span>
                        </>
                      )}
                      {formData.status === 'in_progress' && (
                        <>
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600 dark:text-yellow-400">En Progreso</span>
                        </>
                      )}
                      {formData.status === 'completed' && (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">Completada</span>
                        </>
                      )}
                      {formData.status === 'cancelled' && (
                        <>
                          <XSquare className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600 dark:text-red-400">Cancelada</span>
                        </>
                      )}
                    </div>
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