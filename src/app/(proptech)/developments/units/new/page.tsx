"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeftIcon,
  HomeIcon,
  BuildingOfficeIcon,
  MapIcon,
  CurrencyDollarIcon,
  PlusIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { developmentUnitService } from "../../services/developmentUnitService";
import { developmentService } from "../../services/developmentService";
import { DevelopmentUnit, UnitType, UnitStatus } from "../../components/types";
import type { Development } from "../../components/types";
import type { Development, Edificio } from "../../components/types";

// Componente Combobox moderno
function ModernCombobox({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  label,
  required = false 
}: {
  options: { id: string | number; title: string }[];
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  placeholder: string;
  label: string;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState<{ id: string | number; title: string } | null>(
    options.find(opt => opt.id === value) || null
  );

  const filteredOptions = options.filter(option =>
    option.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: { id: string | number; title: string }) => {
    setSelectedOption(option);
    onChange(option.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative z-40">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-full px-3 py-2 text-left border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white ${
            selectedOption 
              ? 'border-gray-300 dark:border-gray-600' 
              : 'border-gray-300 dark:border-gray-600'
          } ${required && !selectedOption ? 'border-red-500' : ''}`}
        >
          <span className={`block truncate ${selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
            {selectedOption ? selectedOption.title : placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl">
            <div className="p-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar desarrollo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No se encontraron desarrollos
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      selectedOption?.id === option.id 
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-900 dark:text-brand-100' 
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{option.title}</span>
                      {selectedOption?.id === option.id && (
                        <CheckIcon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewUnitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [developments, setDevelopments] = useState<any[]>([]);
  /** Detalles del desarrollo cuando es edificio (pisos, unidades por piso) */
  const [developmentDetails, setDevelopmentDetails] = useState<Development | null>(null);
  /** Frente en metros para barrio cerrado (lotes/casas); se guarda en specifications */
  const [frontageMetros, setFrontageMetros] = useState<number | "">("");
  const [formData, setFormData] = useState<Partial<DevelopmentUnit>>({
    unitNumber: "",
    unitName: "",
    type: "DEPARTAMENTO",
    status: "AVAILABLE",
    price: 0,
    originalPrice: 0,
    discountPrice: 0,
    area: 0,
    areaUnit: "m²",
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    floor: "",
    block: "",
    orientation: "",
    view: "",
    featured: false,
    premium: false,
    description: "",
    specifications: "",
    amenities: "",
    constructionStatus: "EN_CONSTRUCTION",
    progressPercentage: 0,
    active: true
  });

  // Tipo de desarrollo seleccionado: determina qué tipos de unidad y qué datos pedir
  const selectedDevelopment = developments.find(d => Number(d.id) === Number(formData.developmentId));
  const developmentType = selectedDevelopment?.type as "loteamiento" | "edificio" | "condominio" | "barrio_cerrado" | undefined;

  const getAllowedUnitTypes = (devType?: string): UnitType[] => {
    switch (devType) {
      case "loteamiento":
        return ["LOT"];
      case "edificio":
        return ["DEPARTAMENTO", "STUDIO", "PENTHOUSE", "OFFICE", "COMMERCIAL", "WAREHOUSE", "PARKING", "STORAGE"];
      case "condominio":
        return ["LOT", "HOUSE", "TOWNHOUSE", "DUPLEX", "DEPARTAMENTO", "STUDIO", "PENTHOUSE", "OFFICE", "COMMERCIAL", "PARKING", "STORAGE"];
      case "barrio_cerrado":
        return ["LOT", "HOUSE", "TOWNHOUSE", "DUPLEX"];
      default:
        return ["LOT", "DEPARTAMENTO", "HOUSE", "TOWNHOUSE", "DUPLEX", "PENTHOUSE", "STUDIO", "OFFICE", "COMMERCIAL", "WAREHOUSE", "PARKING", "STORAGE"];
    }
  };

  const allowedUnitTypes = developmentType ? getAllowedUnitTypes(developmentType) : getAllowedUnitTypes();

  useEffect(() => {
    loadDevelopments();
  }, []);

  const loadDevelopments = async () => {
    try {
      const response = await developmentService.getAllDevelopments();
      const devs = response.data || [];
      setDevelopments(devs);
      if (devs.length > 0) {
        const first = devs[0];
        const firstAllowed = getAllowedUnitTypes(first?.type);
        setFormData(prev => ({
          ...prev,
          developmentId: Number(first.id),
          type: firstAllowed[0] ?? "DEPARTAMENTO"
        }));
      }
    } catch (error) {
      console.error("Error loading developments:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleDevelopmentChange = (developmentId: string | number) => {
    const dev = developments.find(d => Number(d.id) === Number(developmentId));
    const nextAllowed = getAllowedUnitTypes(dev?.type);
    setFrontageMetros("");
    setFormData(prev => ({
      ...prev,
      developmentId: Number(developmentId),
      type: nextAllowed.includes((prev.type as UnitType) || "DEPARTAMENTO") ? prev.type : nextAllowed[0]
    }));
  };

  // Si cambia el desarrollo y el tipo seleccionado queda inválido, corregirlo
  useEffect(() => {
    if (!formData.developmentId) return;
    if (!formData.type) return;
    if (!allowedUnitTypes.includes(formData.type as UnitType)) {
      setFormData(prev => ({ ...prev, type: allowedUnitTypes[0] }));
    }
  }, [formData.developmentId, developmentType, allowedUnitTypes, formData.type]);

  // Cargar detalles del desarrollo cuando es edificio (número de pisos, unidades)
  useEffect(() => {
    if (developmentType !== "edificio" || !formData.developmentId) {
      setDevelopmentDetails(null);
      return;
    }
    let cancelled = false;
    developmentService.getDevelopmentById(String(formData.developmentId))
      .then((dev) => {
        if (!cancelled) setDevelopmentDetails(dev);
      })
      .catch(() => {
        if (!cancelled) setDevelopmentDetails(null);
      });
    return () => { cancelled = true; };
  }, [developmentType, formData.developmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.developmentId) {
      alert("Por favor selecciona un desarrollo");
      return;
    }

    const payload = { ...formData };
    if (developmentType === "barrio_cerrado" && frontageMetros !== "") {
      const parts = [formData.specifications, `Frente: ${frontageMetros} m`].filter(Boolean);
      payload.specifications = parts.join(" | ");
    }

    try {
      setLoading(true);
      await developmentUnitService.createUnit(formData.developmentId.toString(), payload);
      router.push("/developments/units");
    } catch (error) {
      console.error("Error creating unit:", error);
      alert("Error al crear la unidad");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: UnitType) => {
    switch (type) {
      case "LOT":
        return <MapIcon className="w-5 h-5" />;
      case "DEPARTAMENTO":
        return <BuildingOfficeIcon className="w-5 h-5" />;
      case "HOUSE":
        return <HomeIcon className="w-5 h-5" />;
      default:
        return <HomeIcon className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: UnitType) => {
    const labels: Record<UnitType, string> = {
      LOT: "Lote",
      DEPARTAMENTO: "Departamento",
      HOUSE: "Casa",
      TOWNHOUSE: "Casa Adosada",
      DUPLEX: "Dúplex",
      PENTHOUSE: "Penthouse",
      STUDIO: "Estudio",
      OFFICE: "Oficina",
      COMMERCIAL: "Local Comercial",
      WAREHOUSE: "Depósito",
      PARKING: "Estacionamiento",
      STORAGE: "Almacén"
    };
    return labels[type] || type;
  };

  const getDevelopmentTypeLabel = (t?: string) => {
    switch (t) {
      case "loteamiento": return "Loteamiento";
      case "edificio": return "Edificio";
      case "condominio": return "Condominio";
      case "barrio_cerrado": return "Barrio Cerrado";
      default: return "—";
    }
  };

  const unitNumberPlaceholder = developmentType === "loteamiento"
    ? "Ej: L-001, Manzana 2"
    : developmentType === "edificio"
      ? "Ej: 101, A-201, PB-01"
      : "Ej: A-101, L-001";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/developments/units"
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Volver
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Nueva Unidad
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Crea una nueva unidad para el desarrollo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Desarrollo con Combobox moderno */}
            <ModernCombobox
              options={developments.map(dev => ({ id: dev.id, title: dev.title }))}
              value={formData.developmentId}
              onChange={handleDevelopmentChange}
              placeholder="Seleccionar desarrollo"
              label="Desarrollo"
              required={true}
            />
            {developmentType && (
              <p className="text-sm text-gray-600 dark:text-gray-400 -mt-2">
                Tipo de desarrollo: <span className="font-medium text-gray-800 dark:text-gray-200">{getDevelopmentTypeLabel(developmentType)}</span>
                {allowedUnitTypes.length === 1 && (
                  <span className="text-gray-500 dark:text-gray-500"> — solo unidades tipo {getTypeLabel(allowedUnitTypes[0])}</span>
                )}
              </p>
            )}

            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Unidad *
                </label>
                <input
                  type="text"
                  name="unitNumber"
                  value={formData.unitNumber}
                  onChange={handleChange}
                  required
                  placeholder={unitNumberPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de Unidad
                </label>
                <input
                  type="text"
                  name="unitName"
                  value={formData.unitName}
                  onChange={handleChange}
                  placeholder="Ej: Departamento Premium 101"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Tipo y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo * <span className="text-xs text-gray-500 dark:text-gray-400">(sub-tipo de la unidad)</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  disabled={allowedUnitTypes.length === 1}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {allowedUnitTypes.map((t) => (
                    <option key={t} value={t}>
                      {getTypeLabel(t)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="RESERVED">Reservado</option>
                  <option value="SOLD">Vendido</option>
                  <option value="UNDER_CONSTRUCTION">En Construcción</option>
                  <option value="DELIVERED">Entregado</option>
                  <option value="RENTED">Alquilado</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="UNAVAILABLE">No Disponible</option>
                </select>
              </div>
            </div>

            {/* Precios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio *
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio Original
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio con Descuento
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Características - para Lote solo Área; para departamento/casa también dormitorios, baños, estacionamientos */}
            {(() => {
              const isLot = formData.type === "LOT";
              return (
                <div className={`grid grid-cols-1 gap-6 ${isLot ? "md:grid-cols-1" : "md:grid-cols-4"}`}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Área (m²)
                    </label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  {!isLot && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Dormitorios
                        </label>
                        <input
                          type="number"
                          name="bedrooms"
                          value={formData.bedrooms}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Baños
                        </label>
                        <input
                          type="number"
                          name="bathrooms"
                          value={formData.bathrooms}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Estacionamientos
                        </label>
                        <input
                          type="number"
                          name="parkingSpaces"
                          value={formData.parkingSpaces}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Ubicación: edificio = Piso (selector 1..N) + unidades por piso; barrio = Bloque/Manzana, Frente; resto = Piso, Bloque, Orientación */}
            {(() => {
              const isLot = formData.type === "LOT";
              const isEdificio = developmentType === "edificio";
              const edificioData = developmentDetails?.type === "edificio" ? developmentDetails : null;
              const totalFloors = edificioData?.numberOfFloors ?? 0;
              const totalUnits = edificioData?.numberOfUnits ?? 0;
              const unitsPerFloor = totalFloors > 0 && totalUnits > 0 ? Math.ceil(totalUnits / totalFloors) : 0;

              return (
                <>
                  {isEdificio && !isLot && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Piso <span className="text-red-500">*</span>
                          </label>
                          {totalFloors > 0 ? (
                            <select
                              name="floor"
                              value={formData.floor}
                              onChange={handleChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="">Seleccionar piso</option>
                              {Array.from({ length: totalFloors }, (_, i) => i + 1).map((n) => (
                                <option key={n} value={String(n)}>
                                  {n === 1 ? "1 (PB)" : n}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              name="floor"
                              value={formData.floor}
                              onChange={handleChange}
                              placeholder="Ej: 1, 2, PB"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                            />
                          )}
                          {unitsPerFloor > 0 && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Aprox. {unitsPerFloor} {unitsPerFloor === 1 ? "unidad" : "unidades"} por piso
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Barrio cerrado: Frente (m) para lotes y casas */}
                  {developmentType === "barrio_cerrado" && (isLot || ["HOUSE", "TOWNHOUSE", "DUPLEX"].includes(formData.type || "")) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Frente (m)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={frontageMetros}
                          onChange={(e) => setFrontageMetros(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                          placeholder="Ej: 12"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Frente del lote a la calle
                        </p>
                      </div>
                    </div>
                  )}

                  <div className={`grid grid-cols-1 gap-6 ${!isLot && !isEdificio ? "md:grid-cols-3" : isLot ? "md:grid-cols-2" : "md:grid-cols-2"}`}>
                    {!isLot && !isEdificio && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Piso
                        </label>
                        <input
                          type="text"
                          name="floor"
                          value={formData.floor}
                          onChange={handleChange}
                          placeholder="Ej: 1, 2, PB"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {developmentType === "barrio_cerrado" ? "Manzana / Sector" : "Bloque"}
                      </label>
                      <input
                        type="text"
                        name="block"
                        value={formData.block}
                        onChange={handleChange}
                        placeholder={developmentType === "barrio_cerrado" ? "Ej: Manzana 1, Sector A" : isLot ? "Ej: Manzana 1, Sector A" : "Ej: A, B, C"}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Orientación
                      </label>
                      <select
                        name="orientation"
                        value={formData.orientation}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Seleccionar</option>
                        <option value="Norte">Norte</option>
                        <option value="Sur">Sur</option>
                        <option value="Este">Este</option>
                        <option value="Oeste">Oeste</option>
                        <option value="Noreste">Noreste</option>
                        <option value="Noroeste">Noroeste</option>
                        <option value="Sureste">Sureste</option>
                        <option value="Suroeste">Suroeste</option>
                      </select>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe las características y beneficios de la unidad..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Opciones */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Destacada
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="premium"
                  checked={formData.premium}
                  onChange={handleChange}
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Premium
                </span>
              </label>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/developments/units"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <PlusIcon className="w-4 h-4 mr-2" />
                )}
                Crear Unidad
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 