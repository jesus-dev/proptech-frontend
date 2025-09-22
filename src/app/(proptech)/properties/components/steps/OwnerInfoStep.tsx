"use client";

import React, { useState, useEffect } from "react";
import { PropertyFormData, PropertyFormErrors } from "../../hooks/usePropertyForm";
import { Contact } from "@/app/(proptech)/contacts/types";
import { contactService } from "@/app/(proptech)/contacts/services/contactService";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Trash2,
  Shield,
  Cog,
  BarChart3,
  AlertTriangle,
  X,
  Building2,
  Briefcase,
  CreditCard,
  Globe,
  FileText
} from "lucide-react";

// Componente simple para seleccionar contactos
interface ContactSelectorProps {
  selectedContact: Contact | null;
  onContactSelect: (contact: Contact | null) => void;
  contacts: Contact[];
  loading: boolean;
}

const ContactSelector: React.FC<ContactSelectorProps> = ({
  selectedContact,
  onContactSelect,
  contacts,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredContacts = contacts.filter(contact =>
    contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
        <button
          type="button"
          onClick={() => onContactSelect(null)}
          className="px-4 py-3 text-red-600 border border-red-300 rounded-xl hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Cargando contactos...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No se encontraron contactos</div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => {
                  onContactSelect(contact);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{contact.email}</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    contact.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {contact.status === 'active' ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

interface OwnerInfoStepProps {
  formData: PropertyFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  errors: PropertyFormErrors;
}

export default function OwnerInfoStep({ formData, handleChange, errors }: OwnerInfoStepProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [showAdvancedInfo, setShowAdvancedInfo] = useState(false);

  // Cargar datos del contacto cuando cambie el propietarioId
  useEffect(() => {
    const loadContactData = async () => {
      if (formData.propietarioId) {
        setLoadingContact(true);
        try {
          const contact = await contactService.getContactById(formData.propietarioId?.toString() || '');
          setSelectedContact(contact || null);
        } catch (error) {
          console.error('Error loading contact:', error);
          setSelectedContact(null);
        } finally {
          setLoadingContact(false);
        }
      } else {
        setSelectedContact(null);
      }
    };

    loadContactData();
  }, [formData.propietarioId]);

  const handleContactSelect = (contact: Contact | null) => {
    setSelectedContact(contact);
    // Simular el evento de cambio para el propietarioId
    const event = {
      target: {
        name: 'propietarioId',
        value: contact?.id || ''
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleChange(event);
  };

  const handleRemoveOwner = () => {
    setSelectedContact(null);
    const event = {
      target: {
        name: 'propietarioId',
        value: ''
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleChange(event);
  };

  const getContactStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500 text-white';
      case 'inactive':
        return 'bg-slate-500 text-white';
      case 'lead':
      case 'qualified':
      case 'converted':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-amber-500 text-white';
    }
  };

  const getContactTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'client':
      case 'buyer':
      case 'seller':
        return <User className="h-4 w-4" />;
              case 'prospect':
          return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getContactStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'lead': return 'Lead';
      case 'qualified': return 'Calificado';
      case 'converted': return 'Convertido';
      default: return status;
    }
  };

  const getContactTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'client': return 'Cliente';
      case 'prospect': return 'Prospecto';
      case 'buyer': return 'Comprador';
      case 'seller': return 'Vendedor';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Professional Header Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Información del Propietario
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Datos confidenciales - Solo visible en el CRM
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Datos Seguros</span>
            </div>
            <div className="flex items-center space-x-1">
              <Cog className="h-4 w-4 text-blue-500" />
              <span>Gestión Interna</span>
            </div>
            <div className="flex items-center space-x-1">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <span>Análisis CRM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Selection Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                Selección de Propietario
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Identifique al propietario de la propiedad
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                Requerido
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <ContactSelector
            selectedContact={selectedContact}
            onContactSelect={handleContactSelect}
            contacts={[]} // Placeholder, will be populated with actual contacts
            loading={loadingContact}
          />

          {!formData.propietarioId && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Propietario no seleccionado
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Seleccione un propietario existente o cree uno nuevo para continuar con el registro de la propiedad.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Owner Information Display */}
      {selectedContact && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          {/* Owner Header */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                    <CheckCircle className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedContact.firstName} {selectedContact.lastName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getContactStatusColor(selectedContact.status)}`}>
                      {getContactStatusLabel(selectedContact.status)}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {getContactTypeIcon(selectedContact.type)}
                      <span className="ml-1">
                        {getContactTypeLabel(selectedContact.type)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleRemoveOwner}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Quitar propietario"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Owner Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wide">
                  Información de Contacto
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {selectedContact.email || 'No especificado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Teléfono</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedContact.phone || 'No especificado'}
                      </p>
                    </div>
                  </div>

                  {selectedContact.company && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Empresa</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {selectedContact.company}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedContact.position && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                        <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Cargo</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {selectedContact.position}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wide">
                  Detalles Adicionales
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">ID de Contacto</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                        #{selectedContact.id}
                      </p>
                    </div>
                  </div>

                  {selectedContact.address && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                        <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Dirección</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {selectedContact.address}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedContact.createdAt && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
                        <Calendar className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha de Registro</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(selectedContact.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedContact.source && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg">
                        <Globe className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Origen</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {selectedContact.source}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {selectedContact.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wide">
                    Notas Adicionales
                  </h4>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedContact.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loadingContact && (
              <div className="mt-6 flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Cargando datos del propietario...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Confirmation */}
      {selectedContact && !loadingContact && (
        <div className="bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Propietario Confirmado
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  La información del propietario ha sido validada y está lista para continuar
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 