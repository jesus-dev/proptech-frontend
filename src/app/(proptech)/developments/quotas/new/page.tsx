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
    dueDate: "",
    installmentNumber: 1,
    totalInstallments: 1,
    description: "",
    notes: "",
    active: true
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.developmentId) {
      alert("Por favor selecciona un desarrollo");
      return;
    }

    try {
      setLoading(true);
      await developmentQuotaService.createQuota(formData.developmentId.toString(), formData);
      router.push("/developments/quotas");
    } catch (error) {
      console.error("Error creating quota:", error);
      alert("Error al crear la cuota");
    } finally {
      setLoading(false);
    }
  };

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
                  Nueva Cuota
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Crea una nueva cuota para el desarrollo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

              <ModernCombobox
                options={[
                  { id: "", title: "Sin unidad específica" },
                  ...units.map(unit => ({ 
                    id: unit.id, 
                    title: `${unit.unitNumber} - ${unit.unitName || 'Sin nombre'}` 
                  }))
                ]}
                value={formData.unitId}
                onChange={handleUnitChange}
                placeholder="Sin unidad específica"
                label="Unidad (Opcional)"
                required={false}
              />
            </div>

            {/* Información Básica */}
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
                  required
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
                  required
                  placeholder="Ej: Cuota Inicial, Cuota Mensual 1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

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

            {/* Montos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto *
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
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
                  Monto Pagado
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="paidAmount"
                    value={formData.paidAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descuento
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="discountAmount"
                    value={formData.discountAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Pago
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="paidDate"
                    value={formData.paidDate || ""}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Cuotas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Cuota
                </label>
                <input
                  type="number"
                  name="installmentNumber"
                  value={formData.installmentNumber}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total de Cuotas
                </label>
                <input
                  type="number"
                  name="totalInstallments"
                  value={formData.totalInstallments}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <PlusIcon className="w-4 h-4 mr-2" />
                )}
                Crear Cuota
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 