"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { partnerPaymentService, CreatePaymentData, PartnerPayment } from "../../services/partnerPaymentService";
import { partnerService, Partner } from "../../services/partnerService";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PartnerCombobox from "@/components/ui/PartnerCombobox";
import CurrencyCodeSelector from "@/components/ui/CurrencyCodeSelector";
import { formatAmountWithCurrencySync, useCurrencySymbol } from "@/lib/currency-helpers";
import { 
  PlusIcon,
  BanknotesIcon,
  CalendarIcon,
  UserIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";



export default function NewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const [formData, setFormData] = useState({
    partnerId: "",
    paymentType: "SOCIAL_DUES",
    amount: "",
    currency: "USD",
    dueDate: "",
    description: "",
    notes: "",
    selectedQuotaId: "" // ID de la cuota pendiente seleccionada
  });

  const currencySymbol = useCurrencySymbol(formData.currency);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [pendingQuotas, setPendingQuotas] = useState<PartnerPayment[]>([]);
  const [loadingQuotas, setLoadingQuotas] = useState(false);

  // Cargar partner si viene en la URL
  useEffect(() => {
    const partnerIdParam = searchParams.get('partnerId');
    if (partnerIdParam) {
      const partnerId = Number(partnerIdParam);
      if (partnerId && !isNaN(partnerId)) {
        loadPartner(partnerId);
      }
    }
  }, [searchParams]);

  const loadPartner = async (partnerId: number) => {
    try {
      setInitialLoading(true);
      const partner = await partnerService.getPartnerById(partnerId);
      setSelectedPartner(partner);
    } catch (error) {
      console.error('Error loading partner:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el socio",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedPartner) {
        toast({
          title: "Error",
          description: "Debe seleccionar un socio",
          variant: "destructive",
        });
        return;
      }

      const paymentData: CreatePaymentData = {
        partnerId: selectedPartner.id,
        paymentType: formData.paymentType,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        dueDate: formData.dueDate,
        status: "PENDING",
        description: formData.description || undefined,
        notes: formData.notes || undefined
      };

      // Agregar partnerName al payload (aunque el backend lo puede obtener, lo enviamos por si acaso)
      const payload = {
        ...paymentData,
        partnerName: `${selectedPartner.firstName} ${selectedPartner.lastName}`.trim()
      };

      await partnerPaymentService.createPayment(payload);
      toast({
        title: "Éxito",
        description: "Pago creado exitosamente",
      });
      router.push("/partners/payments");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el pago",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Establecer fecha por defecto (hoy)
  useEffect(() => {
    if (!formData.dueDate) {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      setFormData(prev => ({
        ...prev,
        dueDate: nextMonth.toISOString().split('T')[0]
      }));
    }
  }, []);

  // Actualizar partnerId cuando se selecciona un socio y cargar cuotas pendientes
  useEffect(() => {
    if (selectedPartner) {
      setFormData(prev => ({
        ...prev,
        partnerId: selectedPartner.id.toString()
      }));
      loadPendingQuotas(selectedPartner.id);
    } else {
      setPendingQuotas([]);
      setFormData(prev => ({
        ...prev,
        selectedQuotaId: ""
      }));
    }
  }, [selectedPartner]);

  const loadPendingQuotas = async (partnerId: number) => {
    try {
      setLoadingQuotas(true);
      console.log('🔄 Cargando cuotas pendientes para socio:', partnerId);
      const quotas = await partnerPaymentService.getPendingQuotasByPartner(partnerId);
      console.log('📊 Cuotas pendientes recibidas:', quotas);
      console.log('📊 Cantidad de cuotas:', quotas.length);
      setPendingQuotas(quotas);
      if (quotas.length > 0) {
        console.log('✅ Cuotas encontradas:', quotas.map(q => ({
          id: q.id,
          description: q.description,
          amount: q.amount,
          currency: q.currency,
          dueDate: q.dueDate
        })));
      } else {
        console.log('⚠️ No hay cuotas pendientes para este socio');
      }
    } catch (error) {
      console.error('❌ Error loading pending quotas:', error);
      setPendingQuotas([]);
      toast({
        title: "Advertencia",
        description: "No se pudieron cargar las cuotas pendientes. Puedes crear el pago manualmente.",
        variant: "default",
      });
    } finally {
      setLoadingQuotas(false);
    }
  };

  const handleQuotaSelection = (quotaId: string) => {
    if (!quotaId || quotaId === "") {
      // Si se deselecciona, limpiar los campos (opcional)
      setFormData(prev => ({
        ...prev,
        selectedQuotaId: "",
        // No limpiamos los campos manualmente para que el usuario pueda seguir editando
      }));
      return;
    }

    const quota = pendingQuotas.find(q => q.id.toString() === quotaId);
    if (quota) {
      console.log('📋 Seleccionando cuota:', quota);
      console.log('💰 Moneda de la cuota:', quota.currency);
      console.log('💵 Monto de la cuota:', quota.amount);
      
      setFormData(prev => {
        const updated = {
          ...prev,
          selectedQuotaId: quotaId,
          amount: quota.amount.toString(),
          currency: quota.currency || "USD",
          dueDate: quota.dueDate || prev.dueDate,
          description: quota.description || "",
          paymentType: quota.paymentType || prev.paymentType
        };
        console.log('📝 FormData actualizado:', updated);
        return updated;
      });
      
      toast({
        title: "Cuota seleccionada",
        description: `Se han pre-llenado los datos de la cuota: ${quota.description || `Cuota ${quota.dueDate}`}`,
      });
    } else {
      console.warn('⚠️ Cuota no encontrada con ID:', quotaId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con fondo degradado */}
        <div className="mb-8 bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                Nuevo Pago
              </h1>
              <p className="text-brand-100">
                Registra un nuevo pago para un socio comercial
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center w-16 h-16 bg-white/20 rounded-full">
              <BanknotesIcon className="w-8 h-8" />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Socio - Tarjeta mejorada */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-brand-500 rounded-lg mr-3">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                Información del Socio
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-6">
                <div>
                  <PartnerCombobox
                    value={selectedPartner}
                    onChange={setSelectedPartner}
                    required={true}
                    label="Socio"
                    placeholder="Buscar y seleccionar socio..."
                    showCreateOption={true}
                    onCreatePartner={() => router.push('/partners/new')}
                  />
                  {selectedPartner && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                        <InformationCircleIcon className="w-4 h-4 mr-2" />
                        <span>
                          {selectedPartner.firstName} {selectedPartner.lastName}
                          {selectedPartner.email && ` • ${selectedPartner.email}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selector de Cuota Pendiente - Mejorado */}
                {selectedPartner && (
                  <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-600 rounded-xl p-6 shadow-xl">
                    <label className="block text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl mr-3 shadow-md">
                        <CurrencyDollarIcon className="w-6 h-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-amber-700 to-orange-700 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                        Seleccionar Cuota Pendiente
                      </span>
                    </label>
                    {loadingQuotas ? (
                      <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center py-4 px-4 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                        <LoadingSpinner size="sm" className="mr-2" />
                        Cargando cuotas pendientes...
                      </div>
                    ) : pendingQuotas.length > 0 ? (
                      <>
                        <div className="relative group">
                          <select
                            value={formData.selectedQuotaId}
                            onChange={(e) => {
                              const value = e.target.value;
                              console.log('🔄 Cambiando selección de cuota a:', value);
                              handleQuotaSelection(value);
                            }}
                            className="w-full px-6 py-4 text-base border-2 border-amber-400 dark:border-amber-500 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 dark:focus:ring-amber-900/50 dark:bg-gray-800 dark:text-white transition-all font-semibold shadow-lg hover:shadow-2xl bg-white text-gray-900 cursor-pointer appearance-none group-hover:border-amber-500 dark:group-hover:border-amber-400"
                            style={{ 
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f59e0b' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 1.25rem center',
                              backgroundSize: '1.25em 1.25em',
                              paddingRight: '3.5rem'
                            }}
                          >
                            <option value="" className="py-3 text-gray-400 italic font-normal">
                              Selecciona una cuota pendiente o crea un nuevo pago manualmente
                            </option>
                            {pendingQuotas.map((quota) => (
                              <option key={quota.id} value={quota.id.toString()} className="py-3 text-gray-900 font-medium">
                                {quota.description || `Cuota ${quota.dueDate}`} • {partnerPaymentService.formatCurrency(quota.amount, quota.currency)} • Vence: {new Date(quota.dueDate).toLocaleDateString('es-PY')} • {quota.paymentType === 'SOCIAL_DUES' ? 'Cuota Social' : 'Proptech'}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <div className="h-6 w-6 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                          <span className="font-semibold text-amber-700 dark:text-amber-400">💡 Tip:</span> Al seleccionar una cuota, se pre-llenarán automáticamente el monto, moneda, fecha de vencimiento, descripción y tipo de pago.
                        </p>
                        {formData.selectedQuotaId && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-400 dark:border-green-600 rounded-lg">
                            <p className="text-sm font-bold text-green-800 dark:text-green-200 flex items-center">
                              <CheckCircleIcon className="w-5 h-5 mr-2" />
                              Cuota seleccionada • Los datos se han pre-llenado automáticamente
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                        <InformationCircleIcon className="w-5 h-5 inline mr-2 text-amber-600 dark:text-amber-400" />
                        No hay cuotas pendientes para este socio. Puedes crear un nuevo pago manualmente usando los campos de abajo.
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Pago <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="paymentType"
                        value={formData.paymentType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 pl-10 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all appearance-none"
                      >
                        <option value="SOCIAL_DUES">Cuota Social</option>
                        <option value="PROPTECH">Proptech</option>
                      </select>
                      <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Selecciona el tipo de pago que se está registrando
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información Financiera - Tarjeta mejorada */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-800/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-green-500 rounded-lg mr-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-white" />
                </div>
                Información Financiera
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monto <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">{currencySymbol}</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  {formData.amount && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {formatAmountWithCurrencySync(
                        parseFloat(formData.amount || '0'),
                        formData.currency,
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Moneda <span className="text-red-500">*</span>
                  </label>
                  <CurrencyCodeSelector
                    selectedCurrencyCode={formData.currency}
                    onCurrencyChange={(currencyCode) => setFormData({ ...formData, currency: currencyCode })}
                    className="w-full"
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Vencimiento <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all"
                    />
                  </div>
                  {formData.dueDate && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Vence el: {new Date(formData.dueDate).toLocaleDateString('es-PY', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Descripción y Notas - Tarjeta mejorada */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-800/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-purple-500 rounded-lg mr-3">
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                Descripción y Notas Adicionales
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción del Pago
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Ej: Cuota mensual enero 2024"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Describe brevemente el motivo del pago
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all resize-none"
                  placeholder="Información adicional, observaciones o referencias del pago..."
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Campo opcional para agregar información adicional relevante
                </p>
              </div>
            </div>
          </div>

          {/* Resumen y Botones de Acción */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            {(selectedPartner && formData.amount && formData.dueDate) && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
                  Resumen del Pago
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Socio:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedPartner.firstName} {selectedPartner.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatAmountWithCurrencySync(
                        parseFloat(formData.amount),
                        formData.currency,
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formData.paymentType === 'SOCIAL_DUES' ? 'Cuota Social' : 'Proptech'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Vencimiento:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(formData.dueDate).toLocaleDateString('es-PY')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !selectedPartner || !formData.amount || !formData.dueDate}
                className="px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Creando Pago...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Crear Pago
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 