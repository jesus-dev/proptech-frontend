"use client";
import React, { useEffect, useState } from "react";
import { Combobox } from '@headlessui/react';
import { clientService } from '@/app/(proptech)/developments/services/clientService';
import { Client } from '@/app/(proptech)/developments/components/types';
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, UserCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { X } from 'lucide-react';
import ReactDOM from 'react-dom';

interface ClientComboboxProps {
  value: Client | null;
  onChange: (client: Client | null) => void;
  required?: boolean;
  className?: string;
}

export default function ClientCombobox({ value, onChange, required = false, className = "" }: ClientComboboxProps) {
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
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    clientService.getAllClients().then(setClients);
  }, []);

  const filteredClients = query === ""
    ? clients
    : clients.filter(c =>
        `${c.firstName} ${c.lastName} ${c.email} ${c.phone} ${c.dni} ${c.city}`.toLowerCase().includes(query.toLowerCase())
      );

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRegisterError(null);
    if (!newClient.firstName || !newClient.lastName || !newClient.email || !newClient.phone) {
      setRegisterError('Completa los campos obligatorios.');
      return;
    }
    setCreating(true);
    try {
      const created = await clientService.createClient({ ...newClient, address: '', state: '', zip: '' });
      setClients(prev => [...prev, created]);
      onChange(created);
      setShowCreateModal(false);
      setNewClient({ firstName: '', lastName: '', email: '', phone: '', dni: '', city: '' });
      setQuery('');
    } catch {
      setRegisterError('Error al crear el cliente.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">
        Cliente <span className="text-red-500">*</span>
      </label>
      <Combobox value={value} onChange={onChange} nullable>
        <div className="relative">
          <Combobox.Input
            className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            displayValue={(c: Client|null) => c ? `${c.firstName} ${c.lastName}` : ""}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar y seleccionar cliente..."
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
                  <PlusIcon className="w-4 h-4" /> Agregar nuevo cliente
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
                    <div>Documento Identidad: {c.dni}</div>
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
                  <PlusIcon className="w-4 h-4" /> Agregar nuevo cliente
                </button>
              </div>
            )}
          </Combobox.Options>
        </div>
      </Combobox>
      {showCreateModal && ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-brand-900/30 backdrop-blur-sm"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
            <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-t-2xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">🆕 Nuevo Cliente</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-white/80 text-sm mt-1">
                Registra un nuevo cliente en el sistema
              </p>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre *</label>
                    <input type="text" value={newClient.firstName} onChange={e => setNewClient(prev => ({ ...prev, firstName: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Apellido *</label>
                    <input type="text" value={newClient.lastName} onChange={e => setNewClient(prev => ({ ...prev, lastName: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                  <input type="email" value={newClient.email} onChange={e => setNewClient(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Teléfono <span className="text-red-500">*</span></label>
                    <input type="tel" value={newClient.phone} onChange={e => setNewClient(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Documento de Identidad</label>
                    <input type="text" value={newClient.dni} onChange={e => setNewClient(prev => ({ ...prev, dni: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ciudad</label>
                  <input type="text" value={newClient.city} onChange={e => setNewClient(prev => ({ ...prev, city: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200" />
                </div>
                {registerError && (
                  <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">⚠️</span>
                      {registerError}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCreateModal(false);
                    }}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all duration-200"
                    disabled={creating}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => e.stopPropagation()}
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 border border-transparent rounded-xl hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={creating}
                  >
                    {creating ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Registrando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>✅</span>
                        Registrar
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
} 