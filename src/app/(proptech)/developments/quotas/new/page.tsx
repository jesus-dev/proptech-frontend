"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  PlusIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { developmentQuotaService } from "../../services/developmentQuotaService";
import { developmentService } from "../../services/developmentService";
import { developmentUnitService } from "../../services/developmentUnitService";
import { DevelopmentQuota, QuotaType, QuotaStatus } from "../../components/types";
import CurrencySelector from "@/components/ui/CurrencySelector";
import PriceInput from "@/components/ui/PriceInput";

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
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 text-left border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white ${
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
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
            <div className="p-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Buscar ${label.toLowerCase()}...`}
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
                  No se encontraron opciones
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

type GeneratorMode = "single" | "plan";
type PlanAmountType = "perInstallment" | "total";
type PlanFrequency = "MONTHLY" | "QUARTERLY" | "ANNUAL";

export default function NewQuotaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [developments, setDevelopments] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [formData, setFormData] = useState<Partial<DevelopmentQuota>>({
    quotaNumber: "",
    quotaName: "",
    type: "INITIAL",
    status: "PENDING",
    amount: 0,
    paidAmount: 0,
    discountAmount: 0,
    currencyId: undefined,
    dueDate: "",
    installmentNumber: 1,
    totalInstallments: 1,
    description: "",
    notes: "",
    active: true
  });
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>("");

  const [generatorMode, setGeneratorMode] = useState<GeneratorMode>("plan");
  const [planConfig, setPlanConfig] = useState<{
    amountType: PlanAmountType;
    amount: number;
    installments: number;
    frequency: PlanFrequency;
    firstDueDate: string;
  }>({
    amountType: "perInstallment",
    amount: 0,
    installments: 12,
    frequency: "MONTHLY",
    firstDueDate: ""
  });

  useEffect(() => {
    loadDevelopments();
  }, []);

  useEffect(() => {
    if (formData.developmentId) {
      loadUnits(formData.developmentId);
    }
  }, [formData.developmentId]);

  const loadDevelopments = async () => {
    try {
      const response = await developmentService.getAllDevelopments();
      const developments = response.data || [];
      setDevelopments(developments);
      if (developments.length > 0) {
        setFormData(prev => ({ ...prev, developmentId: Number(developments[0].id) }));
      }
    } catch (error) {
      console.error("Error loading developments:", error);
    }
  };

  const loadUnits = async (developmentId: number) => {
    try {
      const units = await developmentUnitService.getUnitsByDevelopmentId(developmentId.toString());
      setUnits(units);
    } catch (error) {
      console.error("Error loading units:", error);
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
    setFormData(prev => ({ ...prev, developmentId: Number(developmentId), unitId: undefined }));
  };

  const handleUnitChange = (unitId: string | number) => {
    setFormData(prev => ({ ...prev, unitId: Number(unitId) }));
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setPlanConfig(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) || 0 : value
    }) as typeof prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.developmentId) {
      alert("Por favor selecciona un desarrollo");
      return;
    }
    if (!formData.unitId) {
      alert("Por favor selecciona una unidad. Las cuotas deben estar asociadas a una unidad específica.");
      return;
    }
    if (!formData.currencyId) {
      alert("Por favor selecciona una moneda");
      return;
    }

    try {
      setLoading(true);
      if (generatorMode === "single") {
        if (!formData.amount || formData.amount <= 0) {
          alert("Por favor indica el monto de la cuota");
          setLoading(false);
          return;
        }
        if (!formData.dueDate) {
          alert("Por favor selecciona la fecha de vencimiento");
          setLoading(false);
          return;
        }
        await developmentQuotaService.createQuota(formData.developmentId.toString(), formData);
      } else {
        // Generador automático de plan de cuotas
        if (!planConfig.firstDueDate) {
          alert("Por favor selecciona la fecha de vencimiento de la primera cuota");
          setLoading(false);
          return;
        }
        if (!planConfig.installments || planConfig.installments <= 0) {
          alert("Por favor indica la cantidad de cuotas a generar");
          setLoading(false);
          return;
        }
        if (!planConfig.amount || planConfig.amount <= 0) {
          alert("Por favor indica el monto");
          setLoading(false);
          return;
        }

        const baseDate = new Date(planConfig.firstDueDate);
        const amountPerInstallment =
          planConfig.amountType === "perInstallment"
            ? planConfig.amount
            : planConfig.amount / planConfig.installments;

        for (let i = 1; i <= planConfig.installments; i++) {
          const dueDate = new Date(baseDate);
          if (planConfig.frequency === "MONTHLY") {
            dueDate.setMonth(dueDate.getMonth() + (i - 1));
          } else if (planConfig.frequency === "QUARTERLY") {
            dueDate.setMonth(dueDate.getMonth() + (i - 1) * 3);
          } else if (planConfig.frequency === "ANNUAL") {
            dueDate.setFullYear(dueDate.getFullYear() + (i - 1));
          }

          const formattedDueDate = dueDate.toISOString().slice(0, 10);

          const quotaPayload: Partial<DevelopmentQuota> = {
            developmentId: formData.developmentId,
            unitId: formData.unitId!, // Ya validado arriba
            quotaNumber: `PLAN-${i}/${planConfig.installments}`,
            quotaName: `Cuota ${i} de ${planConfig.installments}`,
            type: planConfig.frequency,
            status: "PENDING",
            amount: Number(amountPerInstallment.toFixed(2)),
            currencyId: formData.currencyId,
            dueDate: formattedDueDate,
            description: formData.description,
            notes: formData.notes,
            active: true
          };

          await developmentQuotaService.createQuota(
            formData.developmentId.toString(),
            quotaPayload
          );
        }
      }
      router.push("/developments/quotas");
    } catch (error: any) {
      console.error("Error creating quota:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      alert(`Error al crear la cuota: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Utilidad para formatear precio con puntos
  function formatPriceWithDots(value: string | number) {
    const num = typeof value === 'number' ? value : value.toString().replace(/\D/g, '');
    if (!num || num === '0') return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  const getTypeLabel = (type: QuotaType) => {
    const labels: Record<QuotaType, string> = {
      INITIAL: "Inicial",
      MONTHLY: "Mensual",
      QUARTERLY: "Trimestral",
      ANNUAL: "Anual",
      FINAL: "Final",
      SPECIAL: "Especial",
      MAINTENANCE: "Mantenimiento",
      INSURANCE: "Seguro",
      TAXES: "Impuestos"
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/developments/quotas"
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Volver
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {generatorMode === "plan" ? "Generar Plan de Cuotas" : "Nueva Cuota"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {generatorMode === "plan" 
                    ? "Crea automáticamente múltiples cuotas para un desarrollo o unidad."
                    : "Define una cuota individual para un desarrollo o unidad específica."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Modo de creación */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  ¿Cómo querés crear las cuotas?
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Elegí entre una sola cuota o generar automáticamente un plan completo.
                </p>
              </div>
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setGeneratorMode("plan")}
                  className={`px-4 py-2 text-sm font-medium ${
                    generatorMode === "plan"
                      ? "bg-brand-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Generar plan
                </button>
                <button
                  type="button"
                  onClick={() => setGeneratorMode("single")}
                  className={`px-4 py-2 text-sm font-medium border-l border-gray-200 dark:border-gray-700 ${
                    generatorMode === "single"
                      ? "bg-brand-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Una sola cuota
                </button>
              </div>
            </div>
            {/* Desarrollo y Unidad con Combobox moderno */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModernCombobox
                options={developments.map(dev => ({ id: dev.id, title: dev.title }))}
                value={formData.developmentId}
                onChange={handleDevelopmentChange}
                placeholder="Seleccionar desarrollo"
                label="Desarrollo"
                required={true}
              />

              <div>
                <ModernCombobox
                  options={units.map(unit => ({ 
                    id: unit.id, 
                    title: `${unit.unitNumber} - ${unit.unitName || 'Sin nombre'}` 
                  }))}
                  value={formData.unitId}
                  onChange={handleUnitChange}
                  placeholder={units.length === 0 ? "No hay unidades disponibles" : "Seleccionar unidad"}
                  label="Unidad"
                  required={true}
                />
                {formData.developmentId && units.length === 0 && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Este desarrollo no tiene unidades. Primero debes crear unidades antes de generar cuotas.
                  </p>
                )}
              </div>
            </div>

            {/* Moneda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Moneda <span className="text-red-500">*</span>
              </label>
              <CurrencySelector
                selectedCurrencyId={formData.currencyId}
                onCurrencyChange={(currencyId, currencyCode) => {
                  setFormData(prev => ({ ...prev, currencyId }));
                  setSelectedCurrencyCode(currencyCode);
                }}
                className="w-full"
              />
              {!formData.currencyId && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Selecciona la moneda para las cuotas
                </p>
              )}
            </div>

            {/* Información Básica */}
            {generatorMode === "single" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número de Cuota *
                  </label>
                  <input
                    type="text"
                    name="quotaNumber"
                    value={formData.quotaNumber}
                    onChange={handleChange}
                    required={generatorMode === "single"}
                    placeholder="Ej: Q-001, CUOTA-1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de Cuota *
                  </label>
                  <input
                    type="text"
                    name="quotaName"
                    value={formData.quotaName}
                    onChange={handleChange}
                    required={generatorMode === "single"}
                    placeholder="Ej: Cuota Inicial, Cuota Mensual 1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}

            {generatorMode === "plan" && (
              <div className="space-y-6 rounded-xl border-2 border-brand-200 dark:border-brand-800 p-6 bg-gradient-to-br from-brand-50/50 to-white dark:from-gray-900/50 dark:to-gray-800 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BuildingOfficeIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Configuración del Plan de Cuotas
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  El sistema generará automáticamente todas las cuotas según los parámetros que definas.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de monto
                    </label>
                    <select
                      name="amountType"
                      value={planConfig.amountType}
                      onChange={handlePlanChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white text-sm font-medium"
                    >
                      <option value="perInstallment">Monto por cuota</option>
                      <option value="total">Monto total del plan</option>
                    </select>
                  </div>
                  <div>
                    <PriceInput
                      value={planConfig.amount}
                      onChange={(value) => setPlanConfig(prev => ({ ...prev, amount: value }))}
                      currencyCode={selectedCurrencyCode}
                      label={`${planConfig.amountType === "perInstallment" ? "Monto por cuota" : "Monto total"} *`}
                      placeholder="0"
                      required
                      className="w-full"
                    />
                    {planConfig.amountType === "total" && planConfig.amount > 0 && planConfig.installments > 0 && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        ≈ {formatPriceWithDots(Math.round(planConfig.amount / planConfig.installments))} por cuota
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Cantidad de cuotas *
                    </label>
                    <input
                      type="number"
                      name="installments"
                      value={planConfig.installments}
                      onChange={handlePlanChange}
                      min={1}
                      placeholder="Ej: 60"
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white text-sm font-medium"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Frecuencia de pago *
                    </label>
                    <select
                      name="frequency"
                      value={planConfig.frequency}
                      onChange={handlePlanChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white text-sm font-medium"
                    >
                      <option value="MONTHLY">Mensual</option>
                      <option value="QUARTERLY">Trimestral</option>
                      <option value="ANNUAL">Anual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Día de vencimiento (primer mes) *
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Las demás cuotas usarán el mismo día de cada mes.
                    </p>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-brand-600 dark:text-brand-400" />
                      <input
                        type="date"
                        name="firstDueDate"
                        value={planConfig.firstDueDate}
                        onChange={handlePlanChange}
                        required
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Campos solo para modo single */}
            {generatorMode === "single" && (
              <>
                {/* Tipo y Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="INITIAL">Inicial</option>
                      <option value="MONTHLY">Mensual</option>
                      <option value="QUARTERLY">Trimestral</option>
                      <option value="ANNUAL">Anual</option>
                      <option value="FINAL">Final</option>
                      <option value="SPECIAL">Especial</option>
                      <option value="MAINTENANCE">Mantenimiento</option>
                      <option value="INSURANCE">Seguro</option>
                      <option value="TAXES">Impuestos</option>
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
                      <option value="PENDING">Pendiente</option>
                      <option value="PAID">Pagada</option>
                      <option value="OVERDUE">Vencida</option>
                      <option value="CANCELLED">Cancelada</option>
                      <option value="PARTIAL">Parcial</option>
                      <option value="REFUNDED">Reembolsada</option>
                    </select>
                  </div>
                </div>

                {/* Monto principal */}
                <div>
                  <PriceInput
                    value={formData.amount || 0}
                    onChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
                    currencyCode={selectedCurrencyCode}
                    label="Monto"
                    placeholder="0"
                    required
                    className="w-full"
                  />
                </div>

                {/* Fecha de vencimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Vencimiento *
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe el propósito de esta cuota..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notas
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Notas adicionales sobre la cuota..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/developments/quotas"
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
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {generatorMode === "plan" ? "Generando..." : "Creando..."}
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    {generatorMode === "plan" ? `Generar ${planConfig.installments} Cuotas` : "Crear Cuota"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 