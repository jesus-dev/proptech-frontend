"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import useSWR from 'swr';
import { settingsService } from '../app/(proptech)/settings/services/settingsService';
import { AppSettings, CompanyInfo, ContactSettings } from '../app/(proptech)/settings/types';

interface ContactContextType {
  companyInfo: CompanyInfo | null;
  primaryContact: ContactSettings | null;
  allContacts: ContactSettings[];
  isLoading: boolean;
  refreshContacts: () => Promise<void>;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};

interface ContactProviderProps {
  children: ReactNode;
}

// Fetcher para SWR
const settingsFetcher = async () => {
  try {
    return await settingsService.getSettings();
  } catch (error) {
    console.error('Error loading settings:', error);
    // Retornar settings por defecto en caso de error
    return {
      companyInfo: {
        name: "PropTech",
        address: "",
        phone: "",
        email: "",
        website: "",
        logoUrl: ""
      },
      contacts: [],
      propertySettings: {
        featured: { enabled: false, criteria: {} as any, autoSelection: false, manualSelection: [] },
        premium: { enabled: false, criteria: {} as any, autoSelection: false, manualSelection: [] }
      }
    } as AppSettings;
  }
};

export const ContactProvider: React.FC<ContactProviderProps> = ({ children }) => {
  // SWR maneja automáticamente cache, revalidación y deduplicación
  const { data: settings, isLoading, mutate } = useSWR<AppSettings>(
    'app-settings', 
    settingsFetcher,
    {
      revalidateOnFocus: false, // No revalidar al hacer focus en la ventana
      revalidateOnReconnect: false, // No revalidar al reconectar
      dedupingInterval: 60000, // Deduplicar requests por 1 minuto
      refreshInterval: 0, // No refrescar automáticamente
      shouldRetryOnError: false, // No reintentar en errores
    }
  );

  const refreshContacts = async () => {
    await mutate(); // Forzar revalidación
  };

  const value: ContactContextType = {
    companyInfo: settings?.companyInfo || null,
    primaryContact: settings?.contacts?.[0] || null,
    allContacts: settings?.contacts || [],
    isLoading,
    refreshContacts,
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
}; 