"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { settingsService } from "./services/settingsService";
import { AppSettings, CompanyInfo, ContactSettings } from "./types";
import LocationManager from "./components/LocationManager";
import PropertySettingsManager from "./components/PropertySettingsManager";

type Tab = "company" | "contacts" | "locations" | "property-types" | "services" | "amenities" | "properties";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("company");
  const searchParams = useSearchParams();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // Handle URL parameters for tab navigation
    const tabParam = searchParams.get('tab');
    if (tabParam && ['company', 'contacts', 'locations', 'property-types', 'services', 'amenities', 'properties'].includes(tabParam)) {
      setActiveTab(tabParam as Tab);
    }
  }, [searchParams]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const currentSettings = await settingsService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!settings) return;
    const { name, value } = e.target;
    setSettings({
      ...settings,
      companyInfo: {
        ...settings.companyInfo,
        [name]: value,
      },
    });
  };

  const handleContactChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!settings) return;
    const { name, value } = e.target;
    const updatedContacts = [...settings.contacts];
    updatedContacts[index] = { ...updatedContacts[index], [name]: value };
    setSettings({ ...settings, contacts: updatedContacts });
  };
  
  const handleAddContact = () => {
    if (!settings) return;
    const newContact: ContactSettings = {
      id: `contact-${Date.now()}`,
      name: "",
      phone: "",
      email: "",
      position: ""
    };
    setSettings({ ...settings, contacts: [...settings.contacts, newContact] });
  };

  const handleRemoveContact = (index: number) => {
    if (!settings) return;
    const updatedContacts = settings.contacts.filter((_, i) => i !== index);
    setSettings({ ...settings, contacts: updatedContacts });
  };

  const handleSaveChanges = async () => {
    if (!settings) return;
    try {
      await settingsService.saveSettings(settings);
      alert("Cambios guardados correctamente!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error al guardar los cambios.");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return <div>Error al cargar la configuración.</div>;
  }
  
  const renderTabContent = () => {
    switch(activeTab) {
      case "company":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Información de la Empresa</h2>
            {Object.keys(settings.companyInfo).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type="text"
                  name={key}
                  value={settings.companyInfo[key as keyof CompanyInfo] || ""}
                  onChange={handleCompanyInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            ))}
          </div>
        );
      case "contacts":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contactos de la Agencia</h2>
              <button onClick={handleAddContact} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Añadir Contacto
              </button>
            </div>
            <div className="space-y-6">
              {settings.contacts.map((contact, index) => (
                <div key={contact.id} className="p-4 border rounded-md dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(contact).filter(k => k !== 'id').map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{key}</label>
                        <input
                          type="text"
                          name={key}
                          value={contact[key as keyof Omit<ContactSettings, 'id'>]}
                          onChange={(e) => handleContactChange(index, e)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    ))}
                  </div>
                   <button onClick={() => handleRemoveContact(index)} className="mt-4 text-red-500 hover:text-red-700 text-sm">
                      Eliminar Contacto
                    </button>
                </div>
              ))}
            </div>
          </div>
        );
      case "locations":
        return <LocationManager />;
      case "property-types":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tipos de Propiedad</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                <strong>Próximamente:</strong> Gestión de tipos de propiedad (Casa, Departamento, Oficina, etc.)
              </p>
            </div>
          </div>
        );
      case "services":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Servicios</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                <strong>Próximamente:</strong> Gestión de servicios disponibles (Agua, Electricidad, Gas, etc.)
              </p>
            </div>
          </div>
        );
      case "amenities":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Amenities</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                <strong>Próximamente:</strong> Gestión de amenities (Piscina, Gimnasio, Seguridad 24/7, etc.)
              </p>
            </div>
          </div>
        );
      case "properties":
        return (
          <PropertySettingsManager 
            settings={settings.propertySettings}
            onSettingsChange={(propertySettings) => {
              if (settings) {
                setSettings({ ...settings, propertySettings });
              }
            }}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ajustes Generales
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Configura la información de tu empresa y otros ajustes de la aplicación.
        </p>
      </div>
      
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("company")}
            className={`${
              activeTab === "company"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Empresa
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`${
              activeTab === "contacts"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Contactos
          </button>
          <button
            onClick={() => setActiveTab("locations")}
            className={`${
              activeTab === "locations"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Ubicaciones
          </button>
          <button
            onClick={() => setActiveTab("property-types")}
            className={`${
              activeTab === "property-types"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Tipos de Propiedad
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`${
              activeTab === "services"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Servicios
          </button>
          <button
            onClick={() => setActiveTab("amenities")}
            className={`${
              activeTab === "amenities"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Amenities
          </button>
          <button
            onClick={() => setActiveTab("properties")}
            className={`${
              activeTab === "properties"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Propiedades
          </button>
        </nav>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {renderTabContent()}
        
        {activeTab === "company" || activeTab === "contacts" ? (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
} 