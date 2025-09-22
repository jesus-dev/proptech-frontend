"use client";
import React, { useEffect, useState } from "react";
import { Combobox } from '@headlessui/react';
import { agentService } from '@/app/(proptech)/properties/services/agentService';
import { Agent } from '@/app/(proptech)/properties/services/agentService';
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";

interface AgentComboboxProps {
  value: Agent | null;
  onChange: (agent: Agent | null) => void;
  required?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
}

export default function AgentCombobox({ 
  value, 
  onChange, 
  required = false, 
  className = "",
  label = "Agente",
  placeholder = "Buscar y seleccionar agente..."
}: AgentComboboxProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    agentService.getAllAgents().then(setAgents);
  }, []);

  const filteredAgents = query === ""
    ? agents
    : agents.filter(a =>
        `${a.firstName} ${a.lastName} ${a.email} ${a.phone}`.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Combobox value={value} onChange={onChange} nullable>
        <div className="relative">
          <Combobox.Input
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            displayValue={(a: Agent|null) => a ? `${a.firstName} ${a.lastName}` : ""}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
          </Combobox.Button>
          <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            {filteredAgents.length === 0 && (
              <div className="text-gray-500 px-4 py-3 text-center">
                No se encontraron agentes disponibles.
              </div>
            )}
            {filteredAgents.map((a) => (
              <Combobox.Option key={a.id} value={a} className={({ active }) => `cursor-pointer select-none px-4 py-3 ${active ? 'bg-brand-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{a.firstName} {a.lastName}</h3>
                    <p className="text-sm text-gray-600">{a.email}</p>
                    <p className="text-sm text-gray-500">{a.phone}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>ID: {a.id}</div>
                    <div>{a.position || 'Sin posición'}</div>
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