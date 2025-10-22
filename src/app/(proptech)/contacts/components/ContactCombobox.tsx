"use client";
import React, { useEffect, useState } from "react";
import { Combobox } from '@headlessui/react';
import { Contact } from '@/app/(proptech)/contacts/types';
import { contactService } from '@/app/(proptech)/contacts/services/contactService';
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";

interface ContactComboboxProps {
  value: Contact | null;
  onChange: (contact: Contact | null) => void;
  required?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
}

export default function ContactCombobox({ 
  value, 
  onChange, 
  required = false, 
  className = "",
  label = "Contacto",
  placeholder = "Buscar y seleccionar contacto..."
}: ContactComboboxProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      try {
        const response = await contactService.getAllContacts();
        // Manejar tanto arrays directos como objetos con estructura paginada
        if (Array.isArray(response)) {
          setContacts(response);
        } else {
          setContacts([]);
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };
    loadContacts();
  }, []);

  const filteredContacts = query === ""
    ? contacts
    : contacts.filter(contact =>
        `${contact.firstName} ${contact.lastName} ${contact.email} ${contact.phone}`.toLowerCase().includes(query.toLowerCase())
      );

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

  const getContactTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'client': return 'Cliente';
      case 'prospect': return 'Prospecto';
      case 'buyer': return 'Comprador';
      case 'seller': return 'Vendedor';
      case 'owner': return 'Titular';
      default: return type;
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Combobox value={value} onChange={onChange} nullable>
        <div className="relative">
          <Combobox.Input
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            displayValue={(contact: Contact|null) => contact ? `${contact.firstName} ${contact.lastName}` : ""}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
          </Combobox.Button>
          <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            {loading ? (
              <div className="text-gray-500 px-4 py-3 text-center">Cargando contactos...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-gray-500 px-4 py-3 text-center">No se encontraron contactos disponibles.</div>
            ) : (
              filteredContacts.map((contact) => (
                <Combobox.Option key={contact.id} value={contact} className={({ active }) => `cursor-pointer select-none px-4 py-3 ${active ? 'bg-brand-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{contact.firstName} {contact.lastName}</h3>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        {contact.phone && <span>📞 {contact.phone}</span>}
                        {contact.type && <span>👤 {getContactTypeLabel(contact.type)}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      {contact.status && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getContactStatusColor(contact.status)}`}>
                          {contact.status}
                        </span>
                      )}
                    </div>
                  </div>
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
} 