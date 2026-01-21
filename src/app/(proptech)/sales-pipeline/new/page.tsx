"use client";

import React, { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Combobox, Transition } from "@headlessui/react";
import { 
  ChevronUpDownIcon,
  UserIcon,
  CheckIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  TagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { 
  SalesPipeline, 
  STAGE_CONFIG, 
  PRIORITY_CONFIG, 
  SOURCE_CONFIG 
} from "../types";
import { salesPipelineService } from "../services/salesPipelineService";
import PropertyCombobox from "@/components/ui/PropertyCombobox";
import Select from "@/components/form/Select";
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CurrencyCodeSelector from "@/components/ui/CurrencyCodeSelector";
import { clientService } from "../../developments/services/clientService";
import { Client } from "../../developments/components/types";
import type { Property } from "../../properties/components/types";
import { apiClient } from "@/lib/api";
import { useAuthContext } from "@/context/AuthContext";

interface LeadComboboxProps {
  selectedLead: Client | null;
  onLeadSelect: (lead: Client | null) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  error?: string;
}

const LeadCombobox: React.FC<LeadComboboxProps> = ({
  selectedLead,
  onLeadSelect,
  placeholder = "Seleccionar lead...",
  className = "",
  required = false,
  error
}) => {
  const [leads, setLeads] = useState<Client[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar leads
  useEffect(() => {
    const loadLeads = async () => {
      setLoading(true);
      try {
        const data = await clientService.getAllClients();
        setLeads(data);
      } catch (error) {
        console.error("Error loading leads:", error);
      } finally {
        setLoading(false);
      }
    };
    loadLeads();
  }, []);

  // Filtrar leads basado en la búsqueda
  const filteredLeads = query === ""
    ? leads
    : leads.filter((lead) =>
        `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.dni}`
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(query.toLowerCase().replace(/\s+/g, ""))
      );

  return (
    <div className={`relative ${className}`}>
      <Combobox value={selectedLead} onChange={onLeadSelect}>
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 text-left border border-gray-300 dark:border-gray-600 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
            <Combobox.Input
              className="w-full border-none py-3 pl-4 pr-10 text-sm leading-5 text-gray-900 dark:text-white bg-transparent focus:ring-0"
              displayValue={(lead: Client) =>
                lead ? `${lead.firstName} ${lead.lastName}` : ""
              }
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              required={required}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {loading ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                  Cargando leads...
                </div>
              ) : filteredLeads.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                  No se encontraron leads.
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <Combobox.Option
                    key={lead.id}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900 dark:text-white'
                      }`
                    }
                    value={lead}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
                          <div className="flex-1">
                            <div className="font-medium">
                              {lead.firstName} {lead.lastName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {lead.email && `${lead.email} • `}
                              {lead.dni}
                            </div>
                          </div>
                        </div>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-brand-600'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default function NewLeadPage() {
  const router = useRouter();
  const { getUserContext } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Available options
  const [agents, setAgents] = useState<any[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    leadId: '',
    propertyId: '',
    agentId: '',
    stage: 'NEW_LEAD',
    priority: 'MEDIUM',
    source: 'WEBSITE',
    expectedValue: '',
    currency: 'USD',
    notes: '',
    expectedCloseDate: '',
    nextContactDate: ''
  });

  // Selected objects for better UX
  const [selectedLead, setSelectedLead] = useState<Client | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [leadError, setLeadError] = useState<string | undefined>(undefined);
  const [propertyError, setPropertyError] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      setLoading(true);
      // Sin datos ficticios: cargar agentes desde backend (o vacío)
      const res = await apiClient.get("/api/sales-agents?size=100");
      const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      const mappedAgents = Array.isArray(list)
        ? list.map((a: any) => ({
            id: Number(a.id),
            name: `${a.firstName || a.name || ""} ${a.lastName || ""}`.trim() || String(a.email || "Agente"),
          }))
        : [];

      setAgents(mappedAgents);

      // Preseleccionar el agente asociado al usuario, si existe
      const context = getUserContext();
      if (context.agentId) {
        const agentIdNum = Number(context.agentId);
        const existsInList = mappedAgents.some(a => a.id === agentIdNum);

        if (existsInList) {
          setFormData(prev => ({
            ...prev,
            agentId: agentIdNum.toString(),
          }));
        }
      }
    } catch (error) {
      console.error('Error loading options:', error);
      setError('Error al cargar las opciones');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadChange = (lead: Client | null) => {
    setSelectedLead(lead);
    setLeadError(undefined);
    setFormData(prev => ({
      ...prev,
      leadId: lead ? lead.id : ''
    }));
  };

  const handlePropertyChange = (property: Property | null) => {
    setSelectedProperty(property);
    setPropertyError(undefined);
    setFormData(prev => ({
      ...prev,
      propertyId: property ? property.id : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que se haya seleccionado un lead
    if (!selectedLead) {
      setLeadError("Debes seleccionar un lead.");
      return;
    }

    if (!selectedProperty) {
      setPropertyError("Debes seleccionar una propiedad.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setLeadError(undefined);
      
      const newPipeline: Omit<SalesPipeline, 'id'> = {
        leadId: parseInt(formData.leadId),
        propertyId: parseInt(formData.propertyId),
        agentId: formData.agentId ? parseInt(formData.agentId) : undefined,
        stage: formData.stage as 'LEAD' | 'CONTACTED' | 'MEETING' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST',
        priority: formData.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        source: formData.source,
        expectedValue: formData.expectedValue ? parseFloat(formData.expectedValue) : undefined,
        currency: formData.currency,
        notes: formData.notes,
        probability: 10, // Default probability for new leads
        nextAction: formData.nextContactDate ? 'Contactar cliente' : undefined,
        nextActionDate: formData.nextContactDate || undefined
      };

      await salesPipelineService.createPipeline(newPipeline);
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/sales-pipeline');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating pipeline:', error);
      setError('Error al crear el nuevo lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="md" message="Cargando nueva oportunidad" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Lead Creado!</h2>
          <p className="text-gray-600 mb-4">El nuevo lead ha sido agregado al pipeline exitosamente.</p>
          <div className="animate-pulse text-sm text-gray-500">Redirigiendo al pipeline...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
                              <div>
                  <h1 className="text-3xl font-bold text-gray-900">Nuevo Lead</h1>
                  <p className="text-gray-600 mt-1">Agregar una nueva oportunidad al pipeline de ventas</p>

                </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Lead Description */}
          <div className="p-4 border-b border-gray-200">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <UserIcon className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <div className="font-medium mb-1">
                    <strong>Lead:</strong> Cliente potencial que busca comprar o alquilar
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-200 space-y-1">
                    <div>• <strong>Fuentes:</strong> Teléfono, email, sitio web, oficina, redes sociales</div>
                    <div>• <strong>Características:</strong> Interés demostrado, datos de contacto, necesidad específica</div>
                    <div>• <strong>Propósito:</strong> Convertir en cliente activo del pipeline de ventas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Lead and Property Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <UserIcon className="h-4 w-4 inline mr-1" />
                    Lead *
                  </label>
                  <div className="group relative">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="¿Qué es un Lead?"
                    >
                      <ExclamationTriangleIcon className="h-4 w-4" />
                    </button>
                    <div className="absolute right-0 top-6 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 text-xs text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">¿Qué es un Lead?</div>
                      Un <strong>Lead</strong> es una persona que ha mostrado interés en comprar o alquilar una propiedad. 
                      Puede ser un cliente potencial que contactó por teléfono, email, o visitó el sitio web.
                    </div>
                  </div>
                </div>
                <LeadCombobox
                  selectedLead={selectedLead}
                  onLeadSelect={handleLeadChange}
                  placeholder="Buscar y seleccionar lead..."
                  required={true}
                  error={leadError}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Selecciona el cliente potencial interesado en la propiedad
                </p>
              </div>

              {/* Property Selection */}
              <div>
                              <PropertyCombobox
                value={selectedProperty}
                onChange={handlePropertyChange}
                label="Propiedad *"
                placeholder="Buscar y seleccionar propiedad..."
              />
                {propertyError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{propertyError}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Propiedad en la que está interesado el lead
                </p>
              </div>
            </div>

            {/* Agent and Stage Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Agent Assignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="h-4 w-4 inline mr-1" />
                  Agente Asignado
                </label>
                <Select
                  options={[
                    { value: '', label: 'Sin asignar' },
                    ...agents.map(agent => ({ value: agent.id.toString(), label: agent.name }))
                  ]}
                  defaultValue={formData.agentId}
                  onChange={(value) => handleInputChange('agentId', value)}
                  placeholder="Seleccionar agente"
                />
              </div>

              {/* Stage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <TagIcon className="h-4 w-4 inline mr-1" />
                    Etapa
                  </label>
                  <div className="group relative">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="¿Qué son las etapas del pipeline?"
                    >
                      <ExclamationTriangleIcon className="h-4 w-4" />
                    </button>
                    <div className="absolute right-0 top-6 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 text-xs text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="font-medium text-gray-900 dark:text-white mb-2">Etapas del Pipeline:</div>
                      <div className="space-y-1">
                        <div><strong>Lead:</strong> Cliente potencial inicial</div>
                        <div><strong>Contactado:</strong> Primer contacto realizado</div>
                        <div><strong>Reunión:</strong> Visita o reunión programada</div>
                        <div><strong>Propuesta:</strong> Oferta enviada al cliente</div>
                        <div><strong>Negociación:</strong> Discusión de términos</div>
                        <div><strong>Ganado/Perdido:</strong> Resultado final</div>
                      </div>
                    </div>
                  </div>
                </div>
                <Select
                  options={STAGE_CONFIG.map(stage => ({ value: stage.name, label: stage.label }))}
                  defaultValue={formData.stage}
                  onChange={(value) => handleInputChange('stage', value)}
                  placeholder="Seleccionar etapa"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Etapa actual del lead en el proceso de venta
                </p>
              </div>
            </div>

            {/* Priority and Source Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                  Prioridad
                </label>
                <Select
                  options={Object.entries(PRIORITY_CONFIG).map(([key, config]) => ({ value: key, label: config.label }))}
                  defaultValue={formData.priority}
                  onChange={(value) => handleInputChange('priority', value)}
                  placeholder="Seleccionar prioridad"
                />
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TagIcon className="h-4 w-4 inline mr-1" />
                  Fuente
                </label>
                <Select
                  options={Object.entries(SOURCE_CONFIG).map(([key, config]) => ({ value: key, label: config.label }))}
                  defaultValue={formData.source}
                  onChange={(value) => handleInputChange('source', value)}
                  placeholder="Seleccionar fuente"
                />
              </div>
            </div>

            {/* Value and Currency Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expected Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                  Valor Esperado
                </label>
                <input
                  type="number"
                  value={formData.expectedValue}
                  onChange={(e) => handleInputChange('expectedValue', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda
                </label>
                <CurrencyCodeSelector
                  selectedCurrencyCode={formData.currency}
                  onCurrencyChange={(currencyCode) => handleInputChange('currency', currencyCode)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Dates Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expected Close Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Fecha de Cierre Esperada
                </label>
                <input
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Next Contact Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="h-4 w-4 inline mr-1" />
                  Próximo Contacto
                </label>
                <input
                  type="date"
                  value={formData.nextContactDate}
                  onChange={(e) => handleInputChange('nextContactDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                placeholder="Información adicional sobre el lead, preferencias, observaciones..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Crear Lead
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