"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { Contract } from "./types";
import { downloadContractDocument } from "../services/documentService";
import { SignatureAuditData } from "../services/signatureAuditService";
import { useSignatureWithAudit } from "../hooks/useSignatureWithAudit";
import { TemplateVariable } from "../templates/types";
import { templateService } from "../templates/services/templateService";
import { 
  BuildingIcon, 
  User, 
  FileText, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Percent, 
  CheckCircle,
  AlertCircle,
  Save,
  Download,
  Eye
} from "lucide-react";
import ContractPreview from "./ContractPreview";
import SignaturePad from "./SignaturePad";
import SignatureAuditLog from "./SignatureAuditLog";
import { propertyService } from "../../properties/services/propertyService";
import { clientService } from "../../developments/services/clientService";
import { agentService } from "../../properties/services/agentService";
import ClientCombobox from "@/components/ClientCombobox";
import AgentCombobox from "@/components/ui/AgentCombobox";
import PropertyCombobox from "@/components/ui/PropertyCombobox";
import { Client } from "@/app/(proptech)/developments/components/types";
import { Agent } from "@/app/(proptech)/properties/services/agentService";
import { Property } from "@/app/(proptech)/properties/components/types";
import { formatDateLatino, formatDateTimeLatino } from "../utils/dateUtils";

interface ContractFormProps {
  initialData?: Omit<Contract, "id" | "generatedDocumentUrl">;
  contractId?: string;
  onSubmit: (formData: Omit<Contract, "id" | "generatedDocumentUrl">) => void;
  onCancel: () => void;
  templateVariables?: TemplateVariable[];
}

export default function ContractForm({
  initialData,
  contractId,
  onSubmit,
  onCancel,
  templateVariables,
}: ContractFormProps) {
  const [formData, setFormData] = useState<Omit<Contract, "id" | "generatedDocumentUrl"> & {
    clientSignature?: string;
    brokerSignature?: string;
    clientSignatureAudit?: SignatureAuditData;
    brokerSignatureAudit?: SignatureAuditData;
    selectedClient?: Client | null | undefined;
    selectedAgent?: Agent | null | undefined;
    selectedProperty?: Property | null | undefined;
  }>({
    title: initialData?.title || "CONTRATO DE CORRETAJE INMOBILIARIO",
    clientName: initialData?.clientName || "",
    clientIdentification: initialData?.clientIdentification || "",
    brokerName: initialData?.brokerName || "",
    brokerId: initialData?.brokerId || "",
    commissionPercentage: initialData?.commissionPercentage || 3.0,
    propertyAddress: initialData?.propertyAddress || "",
    propertyDescription: initialData?.propertyDescription || "",
    startDate: initialData?.startDate || new Date().toISOString().split("T")[0],
    templateContent: initialData?.templateContent || "",
    status: initialData?.status || "DRAFT",
    amount: initialData?.amount || 0,
    currency: initialData?.currency || "USD",
    type: initialData?.type || "SALE",
    clientId: initialData?.clientId || undefined,
    agentId: initialData?.agentId || undefined,
    propertyId: initialData?.propertyId || undefined,
    clientSignature: initialData?.clientSignature || "",
    brokerSignature: initialData?.brokerSignature || "",
    clientSignatureAudit: initialData?.clientSignatureAudit,
    brokerSignatureAudit: initialData?.brokerSignatureAudit,
    selectedClient: null,
    selectedAgent: null,
    selectedProperty: null,
  });

  // Estado para las variables de plantilla
  const [templateVariableValues, setTemplateVariableValues] = useState<Record<string, string>>({});
  const [loadedTemplateVariables, setLoadedTemplateVariables] = useState<TemplateVariable[]>([]);

  // Hooks para manejar firmas con auditoría
  const clientSignature = useSignatureWithAudit({
    signatureType: 'client',
    contractId,
    initialValue: formData.clientSignature,
    initialAudit: formData.clientSignatureAudit
  });

  const brokerSignature = useSignatureWithAudit({
    signatureType: 'broker',
    contractId,
    initialValue: formData.brokerSignature,
    initialAudit: formData.brokerSignatureAudit
  });

  // Actualizar formData cuando cambien las firmas
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      clientSignature: clientSignature.signature,
      clientSignatureAudit: clientSignature.auditData,
      brokerSignature: brokerSignature.signature,
      brokerSignatureAudit: brokerSignature.auditData
    }));
  }, [clientSignature.signature, clientSignature.auditData, brokerSignature.signature, brokerSignature.auditData]);

  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    
    if (name === "selectedClient") {
      setFormData(prev => ({
        ...prev,
        selectedClient: value as any,
        clientId: value?.id || undefined,
        clientName: value ? `${value.firstName} ${value.lastName}` : "",
        clientIdentification: value?.dni || "",
      }));
    } else if (name === "selectedAgent") {
      setFormData(prev => ({
        ...prev,
        selectedAgent: value as any,
        agentId: value?.id || undefined,
        brokerName: value ? `${value.firstName} ${value.lastName}` : "",
        brokerId: value?.dni || "",
      }));
    } else if (name === "selectedProperty") {
      setFormData(prev => ({
        ...prev,
        selectedProperty: value as any,
        propertyId: value?.id || undefined,
        propertyAddress: value?.address || "",
        propertyDescription: value?.title || "",
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTemplateVariableChange = (variableName: string, value: string) => {
    setTemplateVariableValues(prev => ({
      ...prev,
      [variableName]: value
    }));
  };

  const generateContractContent = () => {
    
    // Si estamos editando un contrato existente y ya tiene contenido procesado, usarlo directamente
    if (contractId && formData.templateContent && !formData.templateContent.includes('{{')) {
      return formData.templateContent;
    }
    
    // Si no hay contenido de plantilla, retornar vacío
    if (!formData.templateContent) {
      return '';
    }
    
    // Procesar variables solo si el contenido tiene variables sin procesar
    if (formData.templateContent.includes('{{')) {
      let content = formData.templateContent;
      const allVariables = templateVariables || loadedTemplateVariables;
      
      
      allVariables?.forEach(variable => {
        const value = templateVariableValues[variable.name] || `[${variable.label}]`;
        const regex = new RegExp(`{{${variable.name}}}`, 'g');
        const originalContent = content;
        content = content.replace(regex, value);
        
        if (originalContent !== content) {
        } else {
        }
      });
      
      
      return content;
    } else {
      return formData.templateContent;
    }
  };

  const cleanContractPayload = (payload: any) => {
    const cleaned = { ...payload };

    // Elimina campos undefined
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined) delete cleaned[key];
    });

    // Convierte strings vacíos a null
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === "") cleaned[key] = null;
    });

    // Convierte amount y commissionPercentage a número si existen
    if (cleaned.amount !== undefined && cleaned.amount !== null) cleaned.amount = Number(cleaned.amount);
    if (cleaned.commissionPercentage !== undefined && cleaned.commissionPercentage !== null) cleaned.commissionPercentage = Number(cleaned.commissionPercentage);

    // Convierte IDs a número si existen
    ['propertyId', 'clientId', 'agentId'].forEach(idKey => {
      if (cleaned[idKey] !== undefined && cleaned[idKey] !== null && cleaned[idKey] !== "") cleaned[idKey] = Number(cleaned[idKey]);
    });

    // Formatea fechas a yyyy-MM-dd'T'HH:mm:ss si existen
    ['startDate', 'endDate', 'signedDate', 'createdAt', 'updatedAt'].forEach(dateKey => {
      if (cleaned[dateKey] && typeof cleaned[dateKey] === 'string' && cleaned[dateKey].length === 10) {
        cleaned[dateKey] = cleaned[dateKey] + "T00:00:00";
      }
    });

    // Maneja las firmas - solo incluye si no están vacías
    if (cleaned.clientSignature && cleaned.clientSignature.trim() === "") {
      delete cleaned.clientSignature;
    }
    if (cleaned.brokerSignature && cleaned.brokerSignature.trim() === "") {
      delete cleaned.brokerSignature;
    }

    // Elimina campos de auditoría que no deben enviarse al backend
    delete cleaned.clientSignatureAudit;
    delete cleaned.brokerSignatureAudit;

    // Asegurar que las variables de plantilla se incluyan
    if (cleaned.templateVariableValues) {
      // Filtrar variables vacías
      const filteredVariables: Record<string, string> = {};
      Object.entries(cleaned.templateVariableValues).forEach(([key, value]) => {
        if (value && value.toString().trim() !== '') {
          filteredVariables[key] = value.toString();
        }
      });
      cleaned.templateVariableValues = filteredVariables;
    }

    // Log del payload limpio para debug

    return cleaned;
  };

  const [clientIdTouched, setClientIdTouched] = useState(false);
  const [clientIdError, setClientIdError] = useState("");
  const [agentIdTouched, setAgentIdTouched] = useState(false);
  const [agentIdError, setAgentIdError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar variables requeridas de la plantilla
    if (templateVariables) {
      const missingRequired = templateVariables.filter(variable => 
        variable.required && !templateVariableValues[variable.name]
      );
      
      if (missingRequired.length > 0) {
        alert(`Por favor complete los siguientes campos requeridos:\n${missingRequired.map(v => v.label).join('\n')}`);
        return;
      }
    }
    
    // Validar datos del sistema (siempre visibles ahora)
    const missingSystemData = [];
    if (!formData.clientId) missingSystemData.push("Cliente Asociado");
    if (!formData.agentId) missingSystemData.push("Agente Responsable");
    if (!formData.propertyId) missingSystemData.push("Propiedad Asociada");
    
    if (missingSystemData.length > 0) {
      alert(`Por favor complete los siguientes datos del sistema:\n${missingSystemData.join('\n')}`);
      return;
    }
    
    // Generar el contenido del contrato con las variables reemplazadas
    const generatedContent = generateContractContent();
    
    // Crear el payload del contrato
    const contractPayload = {
      ...formData,
      templateContent: generatedContent,
      // Agregar las variables como metadata
      templateVariableValues,
    };
    
    //   clientId: formData.clientId,
    //   agentId: formData.agentId,
    //   propertyId: formData.propertyId
    // });
    
    onSubmit(cleanContractPayload(contractPayload));
  };

  const handleGenerateDocument = async () => {
    try {
      // Generar el contenido del contrato con las variables reemplazadas
      const generatedContent = generateContractContent();
      
      // Crear un contrato temporal con el contenido generado
      const contractForDownload = {
        ...formData,
        id: contractId || 'temp', // Agregar ID temporal para el tipo Contract
        templateContent: generatedContent,
      };
      
      await downloadContractDocument(contractForDownload);
    } catch (error) {
      console.error("Error al generar el documento:", error);
      alert("Error al generar el documento. Por favor, intente nuevamente.");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: formData.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Usar la función formatDateLatino importada de las utilidades

  const getContractTypeText = (type: string) => {
    switch (type) {
      case "SALE": return "VENTA";
      case "RENT": return "ALQUILER";
      case "MANAGEMENT": return "ADMINISTRACIÓN";
      default: return type;
    }
  };

  const getStatusText = (status: Contract["status"]) => {
    switch (status) {
      case "DRAFT": return "BORRADOR";
      case "ACTIVE": return "ACTIVO";
      case "COMPLETED": return "COMPLETADO";
      case "CANCELLED": return "CANCELADO";
      case "SIGNED_PHYSICAL": return "FIRMADO FÍSICAMENTE";
      case "SIGNED_DIGITAL": return "FIRMADO DIGITALMENTE";
      default: return status;
    }
  };

  const getStatusColor = (status: Contract["status"]) => {
    switch (status) {
      case "DRAFT": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800";
      case "ACTIVE": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800";
      case "COMPLETED": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800";
      case "SIGNED_PHYSICAL": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800";
      case "DRAFT": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ACTIVE": return "bg-green-100 text-green-800 border-green-200";
      case "COMPLETED": return "bg-blue-100 text-blue-800 border-blue-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      case "SIGNED_PHYSICAL": return "bg-green-100 text-green-800 border-green-200";
      case "SIGNED_DIGITAL": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const [properties, setProperties] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    // Cargar propiedades para el select
    const fetchProperties = async () => {
      try {
        const props = await propertyService.getAllProperties?.() || [];
        setProperties(props as any);
      } catch (e) {
        setProperties([]);
      }
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    // Cargar clientes para el select
    const fetchClients = async () => {
      try {
        const clis = await clientService.getAllClients?.() || [];
        setClients(clis);
      } catch (e) {
        setClients([]);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    // Cargar agentes para el select
    const fetchAgents = async () => {
      try {
        const ags = await agentService.getAllAgents?.() || [];
        setAgents(ags);
      } catch (e) {
        setAgents([]);
      }
    };
    fetchAgents();
  }, []);

  const [showPreview, setShowPreview] = useState(false);
  const [showSystemData, setShowSystemData] = useState(false);

  // Cargar datos de los objetos seleccionados cuando se edita un contrato
  useEffect(() => {
    const loadSelectedData = async () => {
      if (initialData) {
        // Cargar cliente seleccionado
        if (initialData.clientId) {
          try {
            const client = await clientService.getClientById(initialData.clientId.toString());
            if (client) {
              setFormData(prev => ({
                ...prev,
                selectedClient: client,
                clientName: `${client.firstName} ${client.lastName}`,
                clientIdentification: client.dni || "",
              }));
            }
          } catch (error) {
            console.error('Error loading client:', error);
          }
        }

        // Cargar agente seleccionado
        if (initialData.agentId) {
          try {
            const agent = await agentService.getAgentById(Number(initialData.agentId));
            if (agent) {
              setFormData(prev => ({
                ...prev,
                selectedAgent: agent,
                brokerName: `${agent.firstName} ${agent.lastName}`,
                brokerId: agent.dni || "",
              }));
            }
          } catch (error) {
            console.error('Error loading agent:', error);
          }
        }

        // Cargar propiedad seleccionada
        if (initialData.propertyId) {
          try {
            const property = await propertyService.getPropertyById(initialData.propertyId.toString());
            if (property) {
              setFormData(prev => ({
                ...prev,
                selectedProperty: property,
                propertyAddress: property.address || "",
                propertyDescription: property.title || "",
              }));
            }
          } catch (error) {
            console.error('Error loading property:', error);
          }
        }
      }
    };

    loadSelectedData();
  }, [initialData]);

  // Cargar variables de plantilla cuando se edita un contrato
  useEffect(() => {
    const loadTemplateVariables = async () => {
      if (initialData?.templateContent && !templateVariables) {
        try {
          // Extraer variables del contenido de la plantilla
          const variableRegex = /\{\{([^}]+)\}\}/g;
          const matches = [...initialData.templateContent.matchAll(variableRegex)];
          const extractedVariables = matches.map(match => match[1]);
          
          // Crear variables de plantilla basadas en el contenido
          const templateVars: TemplateVariable[] = extractedVariables.map((varName, index) => ({
            name: varName,
            label: varName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            type: 'text',
            required: false,
            placeholder: `Ingrese ${varName.replace(/_/g, ' ')}`,
            description: `Variable ${varName} del contrato`
          }));
          
          setLoadedTemplateVariables(templateVars);
          
          // Extraer valores de las variables del contenido actual
          const currentValues: Record<string, string> = {};
          templateVars.forEach(variable => {
            const valueRegex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
            const hasValue = !valueRegex.test(initialData.templateContent || '');
            if (hasValue) {
              // Si no tiene la variable, significa que ya tiene un valor
              // Intentar extraer el valor del contenido actual
              const contentWithoutVar = initialData.templateContent?.replace(valueRegex, '') || '';
              // Esto es una aproximación simple, podríamos mejorarlo
              currentValues[variable.name] = `[Valor de ${variable.label}]`;
            }
          });
          
          setTemplateVariableValues(currentValues);
        } catch (error) {
          console.error('Error loading template variables:', error);
        }
      }
    };

    loadTemplateVariables();
  }, [initialData?.templateContent, templateVariables]);

  // Verificar si el contrato está firmado
  const isContractSigned = () => {
    const hasSignedStatus = formData.status === 'ACTIVE' || 
                           formData.status === 'COMPLETED' || 
                           formData.status === 'CANCELLED';
    
    const hasSignedDate = formData.signedDate != null;
    
    const hasDigitalSignatures = (formData.clientSignature && formData.clientSignature.trim() !== '') ||
                                (formData.brokerSignature && formData.brokerSignature.trim() !== '');
    
    return hasSignedStatus || hasSignedDate || hasDigitalSignatures;
  };

  const isDisabled = isContractSigned();

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-600" />
            {viewMode === "edit" ? "Editar Contrato" : "Vista Previa"}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {viewMode === "edit" ? "Complete los campos del contrato" : "Vista previa del documento final"}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "edit" ? "preview" : "edit")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              viewMode === "preview" 
                ? "bg-brand-50 text-brand-700 border-brand-200" 
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {viewMode === "edit" ? <Eye className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            {viewMode === "edit" ? "Vista Previa" : "Editar"}
          </button>
          
          <button
            type="button"
            onClick={handleGenerateDocument}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar
          </button>
        </div>
      </div>

      {viewMode === "edit" ? (
        /* Modo Edición */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos del Sistema - Mostrados directamente para estadísticas */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Datos del Sistema (para estadísticas y búsquedas)
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ClientCombobox
                  value={formData.selectedClient || null}
                  onChange={(value) => handleChange({ target: { name: "selectedClient", value } })}
                  required={false}
                  label="Cliente Asociado"
                  placeholder="Buscar y seleccionar cliente..."
                />
              </div>
              
              <div>
                <AgentCombobox
                  value={formData.selectedAgent || null}
                  onChange={(value) => handleChange({ target: { name: "selectedAgent", value } })}
                  required={false}
                  label="Agente Responsable"
                  placeholder="Buscar y seleccionar agente..."
                />
              </div>
              
              <div className="md:col-span-2">
                <PropertyCombobox
                  value={formData.selectedProperty || null}
                  onChange={(value) => handleChange({ target: { name: "selectedProperty", value } })}
                  required={false}
                  label="Propiedad Asociada"
                  placeholder="Buscar y seleccionar propiedad..."
                />
              </div>
            </div>
          </div>

          {/* Variables de Plantilla - Solo si hay variables */}
          {((templateVariables && templateVariables.length > 0) || loadedTemplateVariables.length > 0) ? (
            <>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-600" />
                    Variables del Contrato
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? "Ocultar Vista Previa" : "Ver Vista Previa"}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(templateVariables || loadedTemplateVariables).map((variable, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {variable.label}
                        {variable.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {variable.type === "textarea" ? (
                        <textarea
                          value={templateVariableValues[variable.name] || ""}
                          onChange={(e) => handleTemplateVariableChange(variable.name, e.target.value)}
                          rows={3}
                          required={variable.required}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder={variable.placeholder || `Ingrese ${variable.label.toLowerCase()}`}
                        />
                      ) : variable.type === "select" && variable.options ? (
                        <select
                          value={templateVariableValues[variable.name] || ""}
                          onChange={(e) => handleTemplateVariableChange(variable.name, e.target.value)}
                          required={variable.required}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Seleccione una opción</option>
                          {variable.options.map((option, optionIndex) => (
                            <option key={optionIndex} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={variable.type === "date" ? "date" : variable.type === "number" ? "number" : "text"}
                          value={templateVariableValues[variable.name] || ""}
                          onChange={(e) => handleTemplateVariableChange(variable.name, e.target.value)}
                          required={variable.required}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder={variable.placeholder || `Ingrese ${variable.label.toLowerCase()}`}
                        />
                      )}
                      {variable.description && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {variable.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vista Previa del Contrato */}
              {showPreview && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-brand-600" />
                    Vista Previa del Contrato
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-mono">
                      {generateContractContent()}
                    </pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay variables definidas
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Esta plantilla no tiene variables configuradas. El contrato se generará con el contenido base.
                </p>
              </div>
            </div>
          )}

          {/* Estado del contrato */}
          <div className="mb-4 flex flex-col items-start">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(formData.status)}`}
              title={formData.status === 'SIGNED_PHYSICAL' ? 'Este contrato fue firmado de forma física y no puede ser modificado.' : formData.status === 'SIGNED_DIGITAL' ? 'Este contrato fue firmado digitalmente y no puede ser modificado.' : undefined}
            >
              {formData.status === 'SIGNED_PHYSICAL' && (
                <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {formData.status === 'SIGNED_DIGITAL' && (
                <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7c0-1.657-1.343-3-3-3s-3 1.343-3 3c0 1.306.835 2.417 2 2.83V17m0 0l-2-2m2 2l2-2" />
                </svg>
              )}
              {getStatusText(formData.status)}
            </span>
            {(formData.status === 'SIGNED_PHYSICAL' || formData.status === 'SIGNED_DIGITAL') && formData.signedDate && (
              <span className={`text-xs mt-1 ${formData.status === 'SIGNED_PHYSICAL' ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}>Firmado el {formatDateTimeLatino(formData.signedDate)}</span>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Generar Contrato
              </button>
            </div>
          </div>
        </form>
      ) : (
        <ContractPreview 
          contract={formData} 
          templateContent={formData.templateContent}
          templateVariableValues={templateVariableValues}
        />
      )}
    </div>
  );
} 