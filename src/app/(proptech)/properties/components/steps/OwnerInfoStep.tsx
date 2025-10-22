"use client";

import React, { useState, useEffect } from "react";
import { PropertyFormData, PropertyFormErrors } from "../../hooks/usePropertyForm";
import { Contact } from "@/app/(proptech)/contacts/types";
import { contactService } from "@/app/(proptech)/contacts/services/contactService";
import SelectOwnerModal from "../SelectOwnerModal";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Plus,
  Trash2,
  AlertTriangle,
  UserPlus,
  Users
} from "lucide-react";

interface OwnerInfoStepProps {
  formData: PropertyFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  errors: PropertyFormErrors;
}

export default function OwnerInfoStep({ formData, handleChange, errors }: OwnerInfoStepProps) {
  const [owners, setOwners] = useState<Contact[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar datos de los propietarios cuando cambie propietarioId
  useEffect(() => {
    const loadOwners = async () => {
      if (formData.propietarioId) {
        setLoadingOwners(true);
        try {
          const contact = await contactService.getContactById(formData.propietarioId.toString());
          if (contact) {
            setOwners([contact]);
          }
        } catch (error) {
          console.error('Error loading owner:', error);
        } finally {
          setLoadingOwners(false);
        }
      } else {
        setOwners([]);
      }
    };

    loadOwners();
  }, [formData.propietarioId]);

  const handleAddOwner = (contact: Contact) => {
    // Verificar si ya existe
    if (owners.find(o => o.id === contact.id)) {
      return;
    }

    const newOwners = [...owners, contact];
    setOwners(newOwners);

    // Si es el primer propietario, actualizar propietarioId en el formData
    if (newOwners.length === 1) {
      const event = {
        target: {
          name: 'propietarioId',
          value: contact.id
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(event);
    }
  };

  const handleRemoveOwner = (contactId: string) => {
    const newOwners = owners.filter(o => o.id !== contactId);
    setOwners(newOwners);

    // Si se eliminó el último propietario o el propietario principal, actualizar propietarioId
    if (newOwners.length === 0) {
      const event = {
        target: {
          name: 'propietarioId',
          value: ''
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(event);
    } else if (formData.propietarioId?.toString() === contactId) {
      // Si se eliminó el propietario principal, asignar el primero de la lista
      const event = {
        target: {
          name: 'propietarioId',
          value: newOwners[0].id
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(event);
    }
  };

  const getContactTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      owner: "Titular",
      client: "Cliente",
      prospect: "Interesado",
      buyer: "Comprador",
      seller: "Vendedor"
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      owner: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      client: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      prospect: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      buyer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      seller: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Propietarios</h2>
            <p className="text-brand-100 text-sm">
              Agrega los propietarios de esta propiedad
            </p>
          </div>
        </div>
      </div>

      {/* Owners List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Propietarios Registrados
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {owners.length === 0 
                  ? "No hay propietarios registrados" 
                  : `${owners.length} propietario${owners.length !== 1 ? 's' : ''} registrado${owners.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Agregar Propietario
            </button>
          </div>
        </div>

        <div className="p-6">
          {owners.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Sin propietarios
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                Agrega al menos un propietario para identificar a los titulares de esta propiedad
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Agregar Primer Propietario
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {owners.map((owner, index) => (
                <div
                  key={owner.id}
                  className="relative group bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-brand-500 transition-all"
                >
                  {/* Badge de propietario principal */}
                  {index === 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-500 text-white text-xs font-medium rounded-full">
                        Principal
                      </span>
                    </div>
                  )}

                  {/* Botón de eliminar */}
                  <button
                    type="button"
                    onClick={() => handleRemoveOwner(owner.id)}
                    className="absolute bottom-2 right-2 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Eliminar propietario"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-start gap-3 pr-8">
                    <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                          {owner.firstName} {owner.lastName}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(owner.type)}`}>
                          {getContactTypeLabel(owner.type)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {owner.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{owner.email}</span>
                          </div>
                        )}
                        {owner.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{owner.phone}</span>
                          </div>
                        )}
                        {owner.company && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Building className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{owner.company}</span>
                          </div>
                        )}
                        {owner.city && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{owner.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info footer */}
        {owners.length > 0 && (
          <div className="px-6 pb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Propietario Principal
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    El primer propietario de la lista es considerado el contacto principal. Los demás propietarios serán considerados co-propietarios.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de selección */}
      <SelectOwnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleAddOwner}
        selectedOwnerIds={owners.map(o => o.id)}
      />
    </div>
  );
}
