"use client";

import React, { useState, useEffect } from "react";
import { ContactFormData, ContactType, ContactStatus } from "../types";
import { locationService } from "../../settings/services/locationService";
import { Country, City, Neighborhood } from "../../settings/types";
import { getAllPropertyTypes, PropertyType } from "../../catalogs/property-types/services/propertyTypeService";
import MultiSelect from "./MultiSelect";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface ContactFormProps {
  initialData?: ContactFormData;
  onSubmit: (formData: ContactFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

export default function ContactForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  isLoading = false,
}: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    type: "prospect",
    status: "lead",
    company: "",
    position: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "Paraguay",
    notes: "",
    source: "",
    budget: {
      min: undefined,
      max: undefined,
      currency: "USD"
    },
    preferences: {
      propertyType: [],
      location: [],
      bedrooms: undefined,
      bathrooms: undefined,
      area: {
        min: undefined,
        max: undefined
      }
    },
    tags: [],
    assignedTo: "",
    lastContact: "",
    nextFollowUp: "",
    ...initialData
  });

  // Location states
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Property types state
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(true);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoadingLocations(true);
        const allCountries = await locationService.getCountries();
        setCountries(allCountries);
        if (allCountries.length > 0) {
          setSelectedCountry(allCountries[0].id);
        }
      } catch (error) {
        console.error("Error loading countries:", error);
      } finally {
        setLoadingLocations(false);
      }
    };
    loadLocations();
  }, []);

  // Load property types from CRUD
  useEffect(() => {
    const loadPropertyTypes = async () => {
      try {
        setLoadingPropertyTypes(true);
        const types = await getAllPropertyTypes();
        setPropertyTypes(types);
      } catch (error) {
        console.error("Error loading property types:", error);
        // Fallback to default types if API fails
        setPropertyTypes([
          { id: 1, name: 'Casa' },
          { id: 2, name: 'Departamento' },
          { id: 3, name: 'Casa Quinta' },
          { id: 4, name: 'Duplex' },
          { id: 5, name: 'Local Comercial' },
          { id: 6, name: 'Oficina' },
          { id: 7, name: 'Terreno' },
        ]);
      } finally {
        setLoadingPropertyTypes(false);
      }
    };
    loadPropertyTypes();
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      if (selectedCountry) {
        try {
          const countryCities = await locationService.getCitiesByCountry(selectedCountry);
          setCities(countryCities);
          setSelectedCity('');
          setNeighborhoods([]);
          setSelectedNeighborhoods([]);
        } catch (error) {
          console.error("Error loading cities:", error);
        }
      }
    };
    loadCities();
  }, [selectedCountry]);

  useEffect(() => {
    const loadNeighborhoods = async () => {
      if (selectedCity) {
        try {
          const cityNeighborhoods = await locationService.getNeighborhoodsByCity(selectedCity);
          setNeighborhoods(cityNeighborhoods);
          setSelectedNeighborhoods([]);
        } catch (error) {
          console.error("Error loading neighborhoods:", error);
        }
      }
    };
    loadNeighborhoods();
  }, [selectedCity]);
  
  useEffect(() => {
    handlePreferencesChange('location', selectedNeighborhoods);
  }, [selectedNeighborhoods]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBudgetChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        [field]: value
      }
    }));
  };

  const handlePreferencesChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleAreaChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        area: {
          ...prev.preferences?.area,
          [field]: value
        }
      }
    }));
  };

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        propertyType: checked 
          ? [...(prev.preferences?.propertyType || []), type]
          : (prev.preferences?.propertyType || []).filter(t => t !== type)
      }
    }));
  };
  
  const handleTagsChange = (tags: string) => {
    setFormData(prev => ({
      ...prev,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (loadingLocations || loadingPropertyTypes) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">Cargando datos...</span>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Información Básica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Apellido *
            </label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Type and Status */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Clasificación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo *
            </label>
            <select
              name="type"
              required
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="prospect">Interesado</option>
              <option value="client">Cliente</option>
              <option value="buyer">Comprador</option>
              <option value="seller">Vendedor</option>
              <option value="owner">Titular</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado *
            </label>
            <select
              name="status"
              required
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="lead">Lead</option>
              <option value="qualified">Calificado</option>
              <option value="converted">Convertido</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Información de Empresa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Empresa
            </label>
            <input
              type="text"
              name="company"
              value={formData.company || ""}
              onChange={(e) => handleInputChange("company", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cargo
            </label>
            <input
              type="text"
              name="position"
              value={formData.position || ""}
              onChange={(e) => handleInputChange("position", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Dirección
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dirección
            </label>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ciudad
            </label>
            <input
              type="text"
              name="city"
              value={formData.city || ""}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Provincia
            </label>
            <input
              type="text"
              name="state"
              value={formData.state || ""}
              onChange={(e) => handleInputChange("state", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código Postal
            </label>
            <input
              type="text"
              name="zip"
              value={formData.zip || ""}
              onChange={(e) => handleInputChange("zip", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              País
            </label>
            <input
              type="text"
              name="country"
              value={formData.country || ""}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Budget */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Presupuesto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mínimo
            </label>
            <input
              type="number"
              name="budgetMin"
              value={formData.budget?.min || ""}
              onChange={(e) => handleBudgetChange("min", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Máximo
            </label>
            <input
              type="number"
              name="budgetMax"
              value={formData.budget?.max || ""}
              onChange={(e) => handleBudgetChange("max", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Moneda
            </label>
            <select
              name="budgetCurrency"
              value={formData.budget?.currency || "USD"}
              onChange={(e) => handleBudgetChange("currency", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="USD">USD</option>
              <option value="PYG">PYG</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Preferencias
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Ubicaciones de Interés</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">País</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Seleccione un país</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ciudad / Departamento</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedCountry || cities.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="">Seleccione una ciudad</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Barrios / Localidades</label>
                <MultiSelect
                  options={neighborhoods}
                  selected={selectedNeighborhoods}
                  onChange={setSelectedNeighborhoods}
                  placeholder="Seleccionar barrios"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Tipo de Propiedad</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              {propertyTypes.map(type => (
                <div key={type.id} className="flex items-center">
                  <input
                    id={`type-${type.id}`}
                    type="checkbox"
                    checked={formData.preferences?.propertyType?.includes(type.name)}
                    onChange={(e) => handlePropertyTypeChange(type.name, e.target.checked)}
                    className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <label htmlFor={`type-${type.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {type.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dormitorios
              </label>
              <input
                type="number"
                name="bedrooms"
                placeholder="Cantidad"
                value={formData.preferences?.bedrooms || ''}
                onChange={(e) => handlePreferencesChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Baños
              </label>
              <input
                type="number"
                name="bathrooms"
                placeholder="Cantidad"
                value={formData.preferences?.bathrooms || ''}
                onChange={(e) => handlePreferencesChange('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Superficie (m²)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="areaMin"
                placeholder="Min"
                value={formData.preferences?.area?.min || ''}
                onChange={(e) => handleAreaChange('min', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              <input
                type="number"
                name="areaMax"
                placeholder="Max"
                value={formData.preferences?.area?.max || ''}
                onChange={(e) => handleAreaChange('max', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Información Adicional
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Origen del Contacto
            </label>
            <input
              type="text"
              name="source"
              value={formData.source || ""}
              onChange={(e) => handleInputChange("source", e.target.value)}
              placeholder="Website, Referido, Redes Sociales, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Etiquetas
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags?.join(", ") || ""}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="VIP, Inversor, Primera vez (separadas por comas)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Asignado a
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo || ""}
              onChange={(e) => handleInputChange("assignedTo", e.target.value)}
              placeholder="Nombre del agente asignado"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas
            </label>
            <textarea
              name="notes"
              rows={4}
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Información adicional sobre el contacto..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner />
              {isEditing ? "Actualizando..." : "Creando..."}
            </div>
          ) : (
            isEditing ? "Actualizar Contacto" : "Crear Contacto"
          )}
        </button>
      </div>
    </form>
  );
} 