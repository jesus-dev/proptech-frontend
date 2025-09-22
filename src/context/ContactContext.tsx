"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

export const ContactProvider: React.FC<ContactProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const appSettings = await settingsService.getSettings();
      setSettings(appSettings);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshContacts = async () => {
    await loadContacts();
  };

  useEffect(() => {
    loadContacts();
  }, []);

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