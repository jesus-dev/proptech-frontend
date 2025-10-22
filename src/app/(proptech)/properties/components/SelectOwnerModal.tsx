"use client";

import React, { useState, useEffect } from "react";
import { Contact } from "@/app/(proptech)/contacts/types";
import { contactService } from "@/app/(proptech)/contacts/services/contactService";
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
import Link from "next/link";

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadContacts();
    }
  }, [isOpen]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const allContacts = await contactService.getAllContacts();
      setContacts(allContacts || []);
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    if (selectedOwnerIds.includes(contact.id)) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.firstName?.toLowerCase().includes(searchLower) ||
      contact.lastName?.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.phone?.toLowerCase().includes(searchLower) ||
      contact.company?.toLowerCase().includes(searchLower)
    );
  });

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
    return colors[type] || "bg-gray-100 text-gray-800";
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
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
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
              <Link
                href="/contacts/new"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                <UserPlus className="h-5 w-5" />
                Nuevo
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm 
                    ? "No se encontraron contactos con ese criterio" 
                    : "No hay contactos disponibles"}
                </p>
                <Link
                  href="/contacts/new"
                  target="_blank"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Crear Primer Contacto
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
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
                            {contact.firstName} {contact.lastName}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(contact.type)}`}>
                            {getContactTypeLabel(contact.type)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {contact.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate">{contact.email}</span>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          {contact.company && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Building className="h-3.5 w-3.5" />
                              <span className="truncate">{contact.company}</span>
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
              {filteredContacts.length} contacto{filteredContacts.length !== 1 ? 's' : ''} disponible{filteredContacts.length !== 1 ? 's' : ''}
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
    </div>
  );
}

