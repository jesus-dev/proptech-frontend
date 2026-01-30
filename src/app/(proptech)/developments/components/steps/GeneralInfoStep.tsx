"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";
import { getAllCities, City } from "@/app/(proptech)/catalogs/cities/services/cityService";
import { getAllDepartments } from "@/app/(proptech)/catalogs/departments/services/departmentService";
import type { Department } from "@/app/(proptech)/catalogs/departments/types";
import ValidatedInput from "@/components/form/input/ValidatedInput";
import { DEVELOPMENT_STATUSES } from "../../constants/developmentStatus";
import CurrencySelector from "@/components/ui/CurrencySelector";
import PriceInput from "@/components/ui/PriceInput";
import { RefreshCw, Search, ChevronDown, X } from "lucide-react";

interface GeneralInfoStepProps {
  formData: DevelopmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
}

export default function GeneralInfoStep({ formData, handleChange, errors }: GeneralInfoStepProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [citiesLoadError, setCitiesLoadError] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | "">("");
  const [citySearch, setCitySearch] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>(formData.currency || "");
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const loadCities = useCallback(async () => {
    setLoadingCities(true);
    setCitiesLoadError(false);
    try {
      const citiesData = await getAllCities();
      setCities(citiesData.filter(city => city.active !== false));
    } catch (error) {
      console.error("Error loading cities:", error);
      setCities([]);
      setCitiesLoadError(true);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    setLoadingDepts(true);
    try {
      const depts = await getAllDepartments();
      setDepartments((depts || []).filter((d: Department) => d.active !== false));
    } catch (error) {
      console.error("Error loading departments:", error);
      setDepartments([]);
    } finally {
      setLoadingDepts(false);
    }
  }, []);

  useEffect(() => {
    loadCities();
    loadDepartments();
  }, [loadCities, loadDepartments]);

  // Sincronizar input de búsqueda cuando el formulario trae ciudad (ej. al editar)
  useEffect(() => {
    if (formData.city && (citySearch === "" || citySearch === formData.city)) {
      setCitySearch(formData.city);
    }
  }, [formData.city]);

  const citiesByDepartment = selectedDepartmentId === ""
    ? cities
    : cities.filter((c) => c.departmentId === selectedDepartmentId);
  const filteredCities = citySearch.trim() === ""
    ? citiesByDepartment
    : citiesByDepartment.filter((c) =>
        c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
        (c.departmentName || "").toLowerCase().includes(citySearch.toLowerCase())
      );

  const handleCitySelect = (cityName: string) => {
    handleChange({
      target: { name: "city", value: cityName },
    } as React.ChangeEvent<HTMLInputElement>);
    setCitySearch(cityName);
    setCityDropdownOpen(false);
  };

  const handleClearCity = () => {
    handleChange({
      target: { name: "city", value: "" },
    } as React.ChangeEvent<HTMLInputElement>);
    setCitySearch("");
    setCityDropdownOpen(false);
  };

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
        if (formData.city && citySearch !== formData.city) setCitySearch(formData.city);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [formData.city, citySearch]);

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <ValidatedInput
          type="text"
          id="title"
          name="title"
          label="Título"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required={true}
        />
      </div>

      {/* Estado */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Estado <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={`w-full h-12 px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ${
            errors.status ? "border-red-500 ring-red-500/20" : "border-gray-300"
          }`}
        >
          {DEVELOPMENT_STATUSES.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe el desarrollo..."
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 resize-none ${
            errors.description ? "border-red-500 ring-red-500/20" : "border-gray-300"
          }`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

      {/* Dirección */}
      <div>
        <ValidatedInput
          type="text"
          id="address"
          name="address"
          label="Dirección"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          required={true}
        />
      </div>

      {/* Departamento y Ciudad con buscador */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Departamento
          </label>
          <select
            id="department"
            value={selectedDepartmentId}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedDepartmentId(v === "" ? "" : Number(v));
              setCitySearch("");
            }}
            disabled={loadingDepts}
            className={`w-full h-12 px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ${
              loadingDepts ? "opacity-50 cursor-not-allowed" : ""
            } border-gray-300 dark:border-gray-600`}
          >
            <option value="">Todos los departamentos</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div ref={cityDropdownRef} className="relative">
          <label htmlFor="city-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ciudad <span className="text-red-500">*</span>
          </label>
          {citiesLoadError && !loadingCities ? (
            <div className="w-full px-3 py-3 border-2 border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-700 flex items-center justify-between gap-3">
              <span className="text-red-600 dark:text-red-400 text-sm">
                No se pudieron cargar las ciudades. Revisar conexión con el backend.
              </span>
              <button
                type="button"
                onClick={loadCities}
                disabled={loadingCities}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loadingCities ? "animate-spin" : ""}`} />
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  id="city-search"
                  name="city"
                  type="text"
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setCityDropdownOpen(true);
                    if (formData.city && e.target.value !== formData.city) {
                      handleChange({ target: { name: "city", value: "" } } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                  onFocus={() => setCityDropdownOpen(true)}
                  placeholder={loadingCities ? "Cargando ciudades..." : "Buscar o seleccionar ciudad..."}
                  disabled={loadingCities}
                  autoComplete="off"
                  className={`w-full h-12 pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ${
                    errors.city ? "border-red-500 ring-red-500/20" : "border-gray-300"
                  } ${loadingCities ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {formData.city ? (
                  <button
                    type="button"
                    onClick={handleClearCity}
                    className="absolute inset-y-0 right-9 flex items-center pr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Limpiar ciudad"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setCityDropdownOpen((o) => !o)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <ChevronDown className={`h-5 w-5 transition-transform ${cityDropdownOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
              {cityDropdownOpen && !loadingCities && (
                <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg py-1">
                  {filteredCities.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {citySearch.trim() ? "No hay coincidencias." : "Seleccione un departamento o busque por nombre."}
                    </div>
                  ) : (
                    filteredCities.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => handleCitySelect(city.name)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-brand-900/20 ${
                          formData.city === city.name ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium" : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <span className="block truncate">{city.name}</span>
                        {city.departmentName && (
                          <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">{city.departmentName}</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </>
          )}
          {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
        </div>
      </div>

      {/* Precio y Moneda */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <PriceInput
            value={formData.price || 0}
            onChange={(value) => handleChange({
              target: { name: 'price', value: value.toString() }
            } as React.ChangeEvent<HTMLInputElement>)}
            currencyCode={selectedCurrencyCode}
            label="Precio base"
            placeholder="0"
            error={errors.price}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Moneda
          </label>
          <CurrencySelector
            selectedCurrencyId={formData.currencyId}
            onCurrencyChange={(currencyId, currencyCode) => {
              handleChange({
                target: { name: 'currencyId', value: currencyId.toString() }
              } as React.ChangeEvent<HTMLInputElement>);
              handleChange({
                target: { name: 'currency', value: currencyCode }
              } as React.ChangeEvent<HTMLInputElement>);
              setSelectedCurrencyCode(currencyCode);
            }}
            className="w-full"
          />
          {errors.currency && <p className="mt-1 text-sm text-red-500">{errors.currency}</p>}
        </div>
      </div>
    </div>
  );
} 