import React, { useState } from "react";
import { Combobox } from '@headlessui/react';
import type { Client } from '@/app/(proptech)/developments/components/types';

interface ClientComboboxProps {
  clients: Client[];
  value: Client | null;
  onChange: (client: Client | null) => void;
  label?: string;
  placeholder?: string;
}

export default function ClientCombobox({ clients, value, onChange, label = "Cliente", placeholder = "Buscar y seleccionar cliente..." }: ClientComboboxProps) {
  const [query, setQuery] = useState("");
  const filteredClients = query === ""
    ? clients
    : clients.filter(c =>
        `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(query.toLowerCase())
      );
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      <Combobox value={value} onChange={onChange} nullable>
        <div className="relative">
          <Combobox.Input
            className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            displayValue={(c: Client|null) => c ? `${c.firstName} ${c.lastName}` : ""}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Combobox.Button>
          <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            {filteredClients.length === 0 && (
              <div className="text-gray-500 px-4 py-3 text-center">No se encontraron clientes.</div>
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
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
} 