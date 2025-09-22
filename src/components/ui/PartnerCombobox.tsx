"use client";

import React, { useState, useEffect } from "react";
import { Combobox } from '@headlessui/react';
import { partnerService, Partner } from '@/app/(proptech)/partners/services/partnerService';
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";

interface PartnerComboboxProps {
  value: Partner | null;
  onChange: (partner: Partner | null) => void;
  required?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
  showCreateOption?: boolean;
  onCreatePartner?: () => void;
}

export default function PartnerCombobox({ 
  value, 
  onChange, 
  required = false, 
  className = "",
  label = "Socio",
  placeholder = "Buscar y seleccionar socio...",
  showCreateOption = false,
  onCreatePartner
}: PartnerComboboxProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const response = await partnerService.getAllPartners();
      setPartners(response.content);
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = query === ""
    ? partners
    : partners.filter(partner =>
        `${partner.firstName} ${partner.lastName} ${partner.email} ${partner.phone} ${partner.type} ${partner.companyName || ''}`.toLowerCase().includes(query.toLowerCase())
      );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL': return UserIcon;
      case 'COMPANY': 
      case 'AGENCY': return BuildingOfficeIcon;
      case 'BROKER': return BriefcaseIcon;
      case 'INVESTOR': return BanknotesIcon;
      default: return UserIcon;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL': return 'Individual';
      case 'COMPANY': return 'Empresa';
      case 'AGENCY': return 'Agencia';
      case 'BROKER': return 'Broker';
      case 'INVESTOR': return 'Inversor';
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
            displayValue={(partner: Partner|null) => partner ? `${partner.firstName} ${partner.lastName}` : ""}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
          </Combobox.Button>
          <Combobox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-auto">
            {loading ? (
              <div className="text-gray-500 px-4 py-3 text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500 mx-auto"></div>
                <span className="ml-2">Cargando socios...</span>
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="text-gray-500 px-4 py-3 text-center flex flex-col items-center">
                No se encontraron socios.
                {showCreateOption && onCreatePartner && (
                  <button
                    type="button"
                    className="mt-2 flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm"
                    onClick={onCreatePartner}
                  >
                    <PlusIcon className="w-4 h-4" /> Crear nuevo socio
                  </button>
                )}
              </div>
            ) : (
              <>
                {filteredPartners.map((partner) => {
                  const TypeIcon = getTypeIcon(partner.type || 'INDIVIDUAL');
                  return (
                    <Combobox.Option 
                      key={partner.id} 
                      value={partner} 
                      className={({ active }) => `cursor-pointer select-none px-4 py-3 ${active ? 'bg-brand-50 dark:bg-brand-900/20' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-700">
                            <TypeIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {partner.firstName} {partner.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{partner.email}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">{partner.phone}</p>
                            {partner.companyName && (
                              <p className="text-xs text-gray-500 dark:text-gray-500">{partner.companyName}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                          <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                            {getTypeLabel(partner.type || 'INDIVIDUAL')}
                          </div>
                          <div className="mt-1">ID: {partner.id}</div>
                          {partner.status && (
                            <div className={`mt-1 px-2 py-1 rounded-full text-xs ${
                              partner.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : partner.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {partner.status}
                            </div>
                          )}
                        </div>
                      </div>
                    </Combobox.Option>
                  );
                })}
                {showCreateOption && onCreatePartner && (
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-600 text-center">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm mx-auto"
                      onClick={onCreatePartner}
                    >
                      <PlusIcon className="w-4 h-4" /> Crear nuevo socio
                    </button>
                  </div>
                )}
              </>
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
} 