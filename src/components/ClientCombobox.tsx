"use client";
import React, { useEffect, useState } from "react";
import { Combobox } from '@headlessui/react';
import { clientService } from '@/app/(proptech)/developments/services/clientService';
import { Client } from '@/app/(proptech)/developments/components/types';
import ModernPopup from './ui/ModernPopup';
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, UserCircleIcon, PlusIcon } from "@heroicons/react/24/outline";

interface ClientComboboxProps {
  value: Client | null;
  onChange: (client: Client | null) => void;
  required?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
}

export default function ClientCombobox({ value, onChange, required = false, className = "", label = "Cliente", placeholder = "Buscar y seleccionar cliente..." }: ClientComboboxProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
    city: ''
  });

  useEffect(() => {
    clientService.getAllClients().then(setClients);
  }, []);

  const filteredClients = query === ""
    ? clients
    : clients.filter(c =>
        `${c.firstName} ${c.lastName} ${c.email} ${c.phone} ${c.dni} ${c.city}`.toLowerCase().includes(query.toLowerCase())
      );

  const handleCreateClient = async () => {
    if (!newClient.firstName || !newClient.lastName || !newClient.email) return;
    setCreating(true);
    try {
      const created = await clientService.createClient({ ...newClient, address: '', state: '', zip: '' });
      setClients(prev => [...prev, created]);
      onChange(created);
      setShowCreateModal(false);
      setNewClient({ firstName: '', lastName: '', email: '', phone: '', dni: '', city: '' });
      setQuery('');
    } finally {
      setCreating(false);
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
            displayValue={(c: Client|null) => c ? `${c.firstName} ${c.lastName}` : ""}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <UserCircleIcon className="h-5 w-5 text-gray-400" />
          </Combobox.Button>
          <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            {filteredClients.length === 0 && (
              <div className="text-gray-500 px-4 py-3 text-center flex flex-col items-center">
                No se encontraron clientes.
                <button
                  type="button"
                  className="mt-2 flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm"
                  onClick={() => setShowCreateModal(true)}
                >
                  <PlusIcon className="w-4 h-4" /> Crear nuevo cliente
                </button>
              </div>
            )}
            {filteredClients.map((c) => (
              <Combobox.Option key={c.id} value={c} className={({ active }) => `cursor-pointer select-none px-4 py-3 ${active ? 'bg-brand-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{c.firstName} {c.lastName}</h3>
                    <p className="text-sm text-gray-600">{c.email}</p>
                    <p className="text-sm text-gray-500">{c.phone}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>DNI: {c.dni}</div>
                    <div>{c.city}</div>
                  </div>
                </div>
              </Combobox.Option>
            ))}
            {filteredClients.length > 0 && (
              <div className="px-4 py-2 border-t text-center">
                <button
                  type="button"
                  className="flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm mx-auto"
                  onClick={() => setShowCreateModal(true)}
                >
                  <PlusIcon className="w-4 h-4" /> Crear nuevo cliente
                </button>
              </div>
            )}
          </Combobox.Options>
        </div>
      </Combobox>
      <ModernPopup
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Cliente Rápidamente"
        subtitle="Complete los datos básicos del cliente"
        icon={<UserCircleIcon className="w-6 h-6 text-white" />}
        maxWidth="max-w-md"
      >
        <form onSubmit={e => { e.preventDefault(); handleCreateClient(); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
              <input type="text" value={newClient.firstName} onChange={e => setNewClient(prev => ({ ...prev, firstName: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido *</label>
              <input type="text" value={newClient.lastName} onChange={e => setNewClient(prev => ({ ...prev, lastName: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
            <input type="email" value={newClient.email} onChange={e => setNewClient(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
              <input type="tel" value={newClient.phone} onChange={e => setNewClient(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">DNI</label>
              <input type="text" value={newClient.dni} onChange={e => setNewClient(prev => ({ ...prev, dni: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad</label>
            <input type="text" value={newClient.city} onChange={e => setNewClient(prev => ({ ...prev, city: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
          </div>
          <div className="flex justify-end space-x-3 pt-6">
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl" disabled={creating}>Cancelar</button>
            <button type="submit" disabled={creating} className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 border border-transparent rounded-xl">{creating ? 'Creando...' : 'Crear Cliente'}</button>
          </div>
        </form>
      </ModernPopup>
    </div>
  );
} 