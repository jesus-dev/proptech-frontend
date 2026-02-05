"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BuildingOfficeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { condominiumService, Condominium } from "@/services/condominiumService";
import { developmentService } from "@/app/(proptech)/developments/services/developmentService";
import { currencyService } from "@/app/(proptech)/catalogs/currencies/services/currencyService";
import type { Development } from "@/app/(proptech)/developments/components/types";
import type { Currency } from "@/app/(proptech)/catalogs/currencies/services/types";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { apiClient } from "@/lib/api";

interface CityOption {
  id: number;
  name: string;
  countryId?: number;
}

interface CountryOption {
  id: number;
  name: string;
}

export default function NewCondominiumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [formData, setFormData] = useState<Partial<Condominium>>({
    name: "",
    description: "",
    address: "",
    city: "",
    country: "Paraguay",
    administratorName: "",
    administratorEmail: "",
    administratorPhone: "",
    isActive: true,
  });

  useEffect(() => {
    developmentService.getAllDevelopments().then((res) => {
      if (res.data?.length) setDevelopments(res.data);
    }).catch(() => {});
    currencyService.getActive().then(setCurrencies).catch(() => setCurrencies([]));
    
    // Cargar ciudades y países
    apiClient.get('/api/cities').then((res) => {
      setCities(res.data || []);
    }).catch(() => setCities([]));
    
    apiClient.get('/api/countries').then((res) => {
      setCountries(res.data || []);
    }).catch(() => setCountries([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ["developmentId", "currencyId"];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value === "" ? undefined : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name || !formData.address || !formData.city || !formData.country) {
      toast.error("Por favor completa los campos obligatorios: Nombre, Dirección, Ciudad y País");
      return;
    }

    try {
      setLoading(true);
      const newCondominium = await condominiumService.createCondominium(formData);
      toast.success("Condominio creado exitosamente");
      router.push(`/condominiums/${newCondominium.id}`);
    } catch (error: any) {
      console.error("Error creating condominium:", error);
      toast.error(error?.message || "Error al crear condominio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/condominiums"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver a Administración de Condominio
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Nuevo Condominio
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Completa la información para crear un nuevo condominio
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Información Básica
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Condominio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ej: Condominio Las Flores"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Descripción del condominio..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Desarrollo asociado (opcional)
                  </label>
                  <select
                    name="developmentId"
                    value={formData.developmentId ?? ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Ninguno</option>
                    {developments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} {d.city ? `— ${d.city}` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Si este condominio proviene de un desarrollo, selecciónalo para vincularlo.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Moneda (opcional)
                  </label>
                  <select
                    name="currencyId"
                    value={formData.currencyId ?? ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">PYG (por defecto)</option>
                    {currencies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Moneda para cuotas y pagos del condominio.
                  </p>
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Ubicación
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Dirección completa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    País <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar país</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ciudad <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar ciudad</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Administrador */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Administrador
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Administrador
                  </label>
                  <input
                    type="text"
                    name="administratorName"
                    value={formData.administratorName || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email del Administrador
                  </label>
                  <input
                    type="email"
                    name="administratorEmail"
                    value={formData.administratorEmail || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono del Administrador
                  </label>
                  <input
                    type="tel"
                    name="administratorPhone"
                    value={formData.administratorPhone || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="+595 9XX XXX XXX"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/condominiums"
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Guardando...
                  </span>
                ) : (
                  "Crear Condominio"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

