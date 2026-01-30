"use client";

import React, { useState, useEffect } from "react";
import { Contact } from "@/app/(proptech)/contacts/types";
import { ownerService, Owner, CreateOwnerRequest } from "@/services/ownerService";
import { 
  X, 
  Search, 
  User, 
  Building, 
  Phone, 
  Mail,
  Plus,
  UserPlus
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ModernPopup from "@/components/ui/ModernPopup";

interface SelectOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (contact: Contact) => void;
  selectedOwnerIds: string[];
}

export default function SelectOwnerModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedOwnerIds 
}: SelectOwnerModalProps) {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newOwnerForm, setNewOwnerForm] = useState<CreateOwnerRequest>({
    name: "",
    email: "",
    phone: "",
    address: "",
    documentNumber: "",
    bankAccount: "",
    notes: ""
  });

  useEffect(() => {
    if (isOpen) {
      loadOwners();
    }
  }, [isOpen]);

  // Convertir Owner a Contact para compatibilidad
  const ownerToContact = (owner: Owner): Contact => {
    const nameParts = owner.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    return {
      id: owner.id.toString(),
      firstName,
      lastName,
      email: owner.email || '',
      phone: owner.phone || '',
      type: 'owner',
      status: owner.status === 'active' ? 'active' : 'inactive',
      company: '',
      position: '',
      address: owner.address || '',
      city: '',
      state: '',
      zip: '',
      country: '',
      notes: owner.notes || '',
      source: '',
      budget: {
        min: undefined,
        max: undefined,
        currency: 'USD'
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
      assignedTo: '',
      lastContact: '',
      nextFollowUp: '',
      createdAt: '',
      updatedAt: ''
    };
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación: nombre y teléfono obligatorios (email opcional)
    if (!newOwnerForm.name?.trim()) {
      alert("Por favor complete el nombre del propietario.");
      return;
    }
    if (!newOwnerForm.phone?.trim()) {
      alert("Por favor complete el teléfono del propietario.");
      return;
    }

    try {
      setCreating(true);
      const newOwner = await ownerService.createOwner(newOwnerForm);
      
      if (newOwner) {
        await loadOwners();
        const contact = ownerToContact(newOwner);
        onSelect(contact);
        setShowCreatePopup(false);
        onClose();
        setNewOwnerForm({
          name: "",
          email: "",
          phone: "",
          address: "",
          documentNumber: "",
          bankAccount: "",
          notes: ""
        });
      }
    } catch (error: any) {
      console.error("Error creating owner:", error);
      const msg = error?.response?.data ?? error?.message ?? "Error al crear el propietario. Por favor intente nuevamente.";
      alert(typeof msg === "string" ? msg : msg?.error ?? JSON.stringify(msg));
    } finally {
      setCreating(false);
    }
  };

  const loadOwners = async () => {
    try {
      setLoading(true);
      const allOwners = await ownerService.getAllOwners();
      setOwners(allOwners || []);
    } catch (error) {
      console.error("Error loading owners:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOwners = owners.filter((owner) => {
    if (selectedOwnerIds.includes(owner.id.toString())) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      owner.name?.toLowerCase().includes(searchLower) ||
      owner.email?.toLowerCase().includes(searchLower) ||
      owner.phone?.toLowerCase().includes(searchLower) ||
      owner.address?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Activo",
      inactive: "Inactivo",
      pending: "Pendiente"
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-[80%] max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Seleccionar Propietario
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Elige un contacto existente o crea uno nuevo
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, teléfono o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
              </div>
              <button
                onClick={() => setShowCreatePopup(true)}
                className="inline-flex items-center gap-2 px-4 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                <UserPlus className="h-5 w-5" />
                Nuevo
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredOwners.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm 
                    ? "No se encontraron propietarios con ese criterio" 
                    : "No hay propietarios disponibles"}
                </p>
                <button
                  onClick={() => setShowCreatePopup(true)}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Crear Primer Propietario
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredOwners.map((owner) => (
                  <button
                    key={owner.id}
                    onClick={() => {
                      const contact = ownerToContact(owner);
                      onSelect(contact);
                      onClose();
                    }}
                    className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-brand-200 dark:group-hover:bg-brand-800 transition-colors">
                        <User className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {owner.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(owner.status)}`}>
                            {getStatusLabel(owner.status)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {owner.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate">{owner.email}</span>
                            </div>
                          )}
                          {owner.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{owner.phone}</span>
                            </div>
                          )}
                          {owner.address && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Building className="h-3.5 w-3.5" />
                              <span className="truncate">{owner.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredOwners.length} propietario{filteredOwners.length !== 1 ? 's' : ''} disponible{filteredOwners.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Popup para crear nuevo contacto */}
      <ModernPopup
        isOpen={showCreatePopup}
        onClose={() => {
          setShowCreatePopup(false);
          // Resetear formulario al cerrar
          setNewOwnerForm({
            name: "",
            email: "",
            phone: "",
            address: "",
            documentNumber: "",
            bankAccount: "",
            notes: ""
          });
        }}
        title="Crear Nuevo Propietario"
        subtitle="Completa los datos del nuevo propietario"
        icon={<UserPlus className="w-6 h-6 text-white" />}
        maxWidth="max-w-2xl"
        closeOnBackdropClick={!creating}
      >
        <form onSubmit={handleCreateOwner} className="space-y-6">
          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newOwnerForm.name}
                  onChange={(e) => setNewOwnerForm({ ...newOwnerForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newOwnerForm.email}
                  onChange={(e) => setNewOwnerForm({ ...newOwnerForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={newOwnerForm.phone}
                  onChange={(e) => setNewOwnerForm({ ...newOwnerForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="+595 981 123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={newOwnerForm.address || ""}
                  onChange={(e) => setNewOwnerForm({ ...newOwnerForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Dirección completa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Documento
                </label>
                <input
                  type="text"
                  value={newOwnerForm.documentNumber || ""}
                  onChange={(e) => setNewOwnerForm({ ...newOwnerForm, documentNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="1234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cuenta Bancaria
                </label>
                <input
                  type="text"
                  value={newOwnerForm.bankAccount || ""}
                  onChange={(e) => setNewOwnerForm({ ...newOwnerForm, bankAccount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Número de cuenta"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas
                </label>
                <textarea
                  value={newOwnerForm.notes || ""}
                  onChange={(e) => setNewOwnerForm({ ...newOwnerForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Notas adicionales sobre el propietario"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setShowCreatePopup(false);
                setNewOwnerForm({
                  name: "",
                  email: "",
                  phone: "",
                  address: "",
                  documentNumber: "",
                  bankAccount: "",
                  notes: ""
                });
              }}
              disabled={creating}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? (
                <>
                  <LoadingSpinner />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Crear Propietario
                </>
              )}
            </button>
          </div>
        </form>
      </ModernPopup>
    </div>
  );
}

