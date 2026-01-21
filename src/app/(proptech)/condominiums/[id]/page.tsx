"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  BuildingOfficeIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  HomeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { condominiumService, Condominium } from "@/services/condominiumService";
import { condominiumUnitService, CondominiumUnit } from "@/services/condominiumUnitService";
import { condominiumFeeService, CondominiumFee } from "@/services/condominiumFeeService";
import { condominiumPaymentService, CondominiumFeePayment } from "@/services/condominiumPaymentService";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Pagination from "@/components/common/Pagination";
import ModernPopup from "@/components/ui/ModernPopup";

type TabType = 'info' | 'units' | 'fees' | 'payments' | 'stats';

export default function CondominiumDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  
  const [loading, setLoading] = useState(true);
  const [condominium, setCondominium] = useState<Condominium | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  
  // Units state
  const [units, setUnits] = useState<CondominiumUnit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [unitsPage, setUnitsPage] = useState(1);
  const [unitsTotal, setUnitsTotal] = useState(0);
  const [unitsTotalPages, setUnitsTotalPages] = useState(0);
  
  // Fees state
  const [fees, setFees] = useState<CondominiumFee[]>([]);
  const [feesLoading, setFeesLoading] = useState(false);
  const [feesPage, setFeesPage] = useState(1);
  const [feesTotal, setFeesTotal] = useState(0);
  const [feesTotalPages, setFeesTotalPages] = useState(0);
  
  // Payments state
  const [payments, setPayments] = useState<CondominiumFeePayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentsTotalPages, setPaymentsTotalPages] = useState(0);
  
  // Modals state
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<CondominiumUnit | null>(null);
  const [editingFee, setEditingFee] = useState<CondominiumFee | null>(null);
  const [editingPayment, setEditingPayment] = useState<CondominiumFeePayment | null>(null);
  
  // Form states
  const [unitForm, setUnitForm] = useState<Partial<CondominiumUnit>>({
    condominiumId: id,
    unitNumber: '',
    floorNumber: undefined,
    unitType: '',
    area: undefined,
    percentageOwnership: undefined,
    isActive: true
  });
  const [feeForm, setFeeForm] = useState<Partial<CondominiumFee>>({
    condominiumId: id,
    period: '',
    totalAmount: 0,
    type: 'COMMON',
    description: '',
    dueDate: '',
    isActive: true
  });
  const [paymentForm, setPaymentForm] = useState<Partial<CondominiumFeePayment>>({
    feeId: 0,
    unitId: 0,
    amount: 0,
    status: 'PENDING',
    paymentDate: '',
    paymentMethod: '',
    transactionReference: '',
    notes: ''
  });
  
  // Stats state
  const [stats, setStats] = useState({
    totalUnits: 0,
    activeUnits: 0,
    totalFees: 0,
    activeFees: 0,
    totalPayments: 0,
    pendingPayments: 0,
    paidPayments: 0,
    totalCollected: 0
  });

  useEffect(() => {
    loadCondominium();
  }, [id]);

  useEffect(() => {
    if (condominium && activeTab === 'units') {
      loadUnits();
    }
  }, [condominium, activeTab, unitsPage]);

  useEffect(() => {
    if (condominium && activeTab === 'fees') {
      loadFees();
    }
  }, [condominium, activeTab, feesPage]);

  useEffect(() => {
    if (condominium && activeTab === 'payments') {
      loadPayments();
    }
  }, [condominium, activeTab, paymentsPage]);

  useEffect(() => {
    if (condominium && activeTab === 'stats') {
      loadStats();
    }
  }, [condominium, activeTab]);

  const loadCondominium = async () => {
    try {
      setLoading(true);
      const data = await condominiumService.getCondominiumById(id);
      setCondominium(data);
    } catch (error: any) {
      console.error("Error loading condominium:", error);
      toast.error(error?.message || "Error al cargar condominio");
      router.push("/condominiums");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este condominio? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await condominiumService.deleteCondominium(id);
      toast.success("Condominio eliminado exitosamente");
      router.push("/condominiums");
    } catch (error: any) {
      console.error("Error deleting condominium:", error);
      toast.error(error?.message || "Error al eliminar condominio");
    }
  };

  const loadUnits = async () => {
    if (!condominium) return;
    try {
      setUnitsLoading(true);
      const response = await condominiumUnitService.getUnitsPaginated({
        condominiumId: id,
        page: unitsPage,
        limit: 12
      });
      setUnits(response.units || []);
      setUnitsTotal(response.total || 0);
      setUnitsTotalPages(response.totalPages || 0);
    } catch (error: any) {
      console.error("Error loading units:", error);
      toast.error(error?.message || "Error al cargar unidades");
    } finally {
      setUnitsLoading(false);
    }
  };

  const loadFees = async () => {
    if (!condominium) return;
    try {
      setFeesLoading(true);
      const response = await condominiumFeeService.getFeesPaginated({
        condominiumId: id,
        page: feesPage,
        limit: 12
      });
      setFees(response.fees || []);
      setFeesTotal(response.total || 0);
      setFeesTotalPages(response.totalPages || 0);
    } catch (error: any) {
      console.error("Error loading fees:", error);
      toast.error(error?.message || "Error al cargar cuotas");
    } finally {
      setFeesLoading(false);
    }
  };

  const loadPayments = async () => {
    if (!condominium) return;
    try {
      setPaymentsLoading(true);
      // Primero cargar las cuotas del condominio para obtener los feeIds
      const feesResponse = await condominiumFeeService.getFeesPaginated({
        condominiumId: id,
        limit: 1000 // Obtener todas las cuotas para filtrar pagos
      });
      
      const feeIds = feesResponse.fees.map(f => f.id);
      
      // Si no hay cuotas, no hay pagos que mostrar
      if (feeIds.length === 0) {
        setPayments([]);
        setPaymentsTotal(0);
        setPaymentsTotalPages(0);
        return;
      }
      
      // Cargar pagos de todas las cuotas del condominio
      // Nota: El backend no tiene un filtro directo por múltiples feeIds,
      // así que cargamos todos y filtramos en el frontend
      const response = await condominiumPaymentService.getPaymentsPaginated({
        page: paymentsPage,
        limit: 1000 // Cargar más para poder filtrar
      });
      
      // Filtrar pagos que pertenecen a las cuotas de este condominio
      const filteredPayments = (response.payments || []).filter(p => feeIds.includes(p.feeId));
      
      // Aplicar paginación manual
      const startIndex = (paymentsPage - 1) * 12;
      const endIndex = startIndex + 12;
      const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
      
      setPayments(paginatedPayments);
      setPaymentsTotal(filteredPayments.length);
      setPaymentsTotalPages(Math.ceil(filteredPayments.length / 12));
    } catch (error: any) {
      console.error("Error loading payments:", error);
      toast.error(error?.message || "Error al cargar pagos");
    } finally {
      setPaymentsLoading(false);
    }
  };

  const loadStats = async () => {
    if (!condominium) return;
    try {
      // Cargar datos para estadísticas
      const [unitsRes, feesRes, paymentsRes] = await Promise.all([
        condominiumUnitService.getUnitsPaginated({ condominiumId: id, limit: 1000 }),
        condominiumFeeService.getFeesPaginated({ condominiumId: id, limit: 1000 }),
        condominiumPaymentService.getPaymentsPaginated({ limit: 1000 })
      ]);

      const allUnits = unitsRes.units || [];
      const allFees = feesRes.fees || [];
      const allPayments = paymentsRes.payments || [];

      // Filtrar pagos relacionados con este condominio
      const relatedPayments = allPayments.filter(p => 
        allFees.some(f => f.id === p.feeId)
      );

      setStats({
        totalUnits: allUnits.length,
        activeUnits: allUnits.filter(u => u.isActive).length,
        totalFees: allFees.length,
        activeFees: allFees.filter(f => f.isActive).length,
        totalPayments: relatedPayments.length,
        pendingPayments: relatedPayments.filter(p => p.status === 'PENDING').length,
        paidPayments: relatedPayments.filter(p => p.status === 'PAID').length,
        totalCollected: relatedPayments
          .filter(p => p.status === 'PAID')
          .reduce((sum, p) => sum + (p.amount || 0), 0)
      });
    } catch (error: any) {
      console.error("Error loading stats:", error);
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    if (!confirm("¿Estás seguro de eliminar esta unidad?")) return;
    try {
      await condominiumUnitService.deleteUnit(unitId);
      toast.success("Unidad eliminada exitosamente");
      loadUnits();
    } catch (error: any) {
      toast.error(error?.message || "Error al eliminar unidad");
    }
  };

  const handleDeleteFee = async (feeId: number) => {
    if (!confirm("¿Estás seguro de eliminar esta cuota?")) return;
    try {
      await condominiumFeeService.deleteFee(feeId);
      toast.success("Cuota eliminada exitosamente");
      loadFees();
      if (activeTab === 'stats') loadStats();
    } catch (error: any) {
      toast.error(error?.message || "Error al eliminar cuota");
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm("¿Estás seguro de eliminar este pago?")) return;
    try {
      await condominiumPaymentService.deletePayment(paymentId);
      toast.success("Pago eliminado exitosamente");
      loadPayments();
      if (activeTab === 'stats') loadStats();
    } catch (error: any) {
      toast.error(error?.message || "Error al eliminar pago");
    }
  };

  // Unit modal handlers
  const openUnitModal = (unit?: CondominiumUnit) => {
    if (unit) {
      setEditingUnit(unit);
      setUnitForm({
        condominiumId: id,
        unitNumber: unit.unitNumber || '',
        floorNumber: unit.floorNumber,
        unitType: unit.unitType || '',
        area: unit.area,
        percentageOwnership: unit.percentageOwnership,
        isActive: unit.isActive
      });
    } else {
      setEditingUnit(null);
      setUnitForm({
        condominiumId: id,
        unitNumber: '',
        floorNumber: undefined,
        unitType: '',
        area: undefined,
        percentageOwnership: undefined,
        isActive: true
      });
    }
    setShowUnitModal(true);
  };

  const handleUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUnit) {
        await condominiumUnitService.updateUnit(editingUnit.id, unitForm);
        toast.success("Unidad actualizada exitosamente");
      } else {
        await condominiumUnitService.createUnit(unitForm);
        toast.success("Unidad creada exitosamente");
      }
      setShowUnitModal(false);
      loadUnits();
      if (activeTab === 'stats') loadStats();
    } catch (error: any) {
      toast.error(error?.message || "Error al guardar unidad");
    }
  };

  // Fee modal handlers
  const openFeeModal = (fee?: CondominiumFee) => {
    if (fee) {
      setEditingFee(fee);
      setFeeForm({
        condominiumId: id,
        period: fee.period || '',
        totalAmount: fee.totalAmount || 0,
        type: fee.type || 'COMMON',
        description: fee.description || '',
        dueDate: fee.dueDate || '',
        isActive: fee.isActive
      });
    } else {
      setEditingFee(null);
      // Generar período actual por defecto
      const now = new Date();
      const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setFeeForm({
        condominiumId: id,
        period: currentPeriod,
        totalAmount: 0,
        type: 'COMMON',
        description: '',
        dueDate: '',
        isActive: true
      });
    }
    setShowFeeModal(true);
  };

  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFee) {
        await condominiumFeeService.updateFee(editingFee.id, feeForm);
        toast.success("Cuota actualizada exitosamente");
      } else {
        await condominiumFeeService.createFee(feeForm);
        toast.success("Cuota creada exitosamente");
      }
      setShowFeeModal(false);
      loadFees();
      if (activeTab === 'stats') loadStats();
    } catch (error: any) {
      toast.error(error?.message || "Error al guardar cuota");
    }
  };

  // Payment modal handlers
  const openPaymentModal = (payment?: CondominiumFeePayment) => {
    if (payment) {
      setEditingPayment(payment);
      setPaymentForm({
        feeId: payment.feeId || 0,
        unitId: payment.unitId || 0,
        amount: payment.amount || 0,
        status: payment.status || 'PENDING',
        paymentDate: payment.paymentDate || '',
        paymentMethod: payment.paymentMethod || '',
        transactionReference: payment.transactionReference || '',
        notes: payment.notes || ''
      });
    } else {
      setEditingPayment(null);
      setPaymentForm({
        feeId: fees.length > 0 ? fees[0].id : 0,
        unitId: units.length > 0 ? units[0].id : 0,
        amount: 0,
        status: 'PENDING',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        transactionReference: '',
        notes: ''
      });
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPayment) {
        await condominiumPaymentService.updatePayment(editingPayment.id, paymentForm);
        toast.success("Pago actualizado exitosamente");
      } else {
        await condominiumPaymentService.createPayment(paymentForm);
        toast.success("Pago registrado exitosamente");
      }
      setShowPaymentModal(false);
      loadPayments();
      if (activeTab === 'stats') loadStats();
    } catch (error: any) {
      toast.error(error?.message || "Error al guardar pago");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!condominium) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/condominiums"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver a Condominios
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <BuildingOfficeIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {condominium.name}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{condominium.city}{condominium.state && `, ${condominium.state}`}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => openUnitModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Nueva Unidad
              </button>
              <Link
                href={`/condominiums/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <PencilIcon className="w-5 h-5" />
                Editar
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
                Eliminar
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('info')}
                className={`${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
              >
                <BuildingOfficeIcon className="w-5 h-5" />
                Información
              </button>
              <button
                onClick={() => setActiveTab('units')}
                className={`${
                  activeTab === 'units'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
              >
                <HomeIcon className="w-5 h-5" />
                Unidades
              </button>
              <button
                onClick={() => setActiveTab('fees')}
                className={`${
                  activeTab === 'fees'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
              >
                <CurrencyDollarIcon className="w-5 h-5" />
                Cuotas
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
              >
                <DocumentTextIcon className="w-5 h-5" />
                Pagos
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
              >
                <ChartBarIcon className="w-5 h-5" />
                Estadísticas
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción */}
            {condominium.description && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Descripción
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {condominium.description}
                </p>
              </div>
            )}

            {/* Ubicación */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Ubicación
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Dirección</p>
                    <p className="text-gray-600 dark:text-gray-400">{condominium.address}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ciudad</p>
                    <p className="text-gray-900 dark:text-white">{condominium.city}</p>
                  </div>
                  {condominium.state && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</p>
                      <p className="text-gray-900 dark:text-white">{condominium.state}</p>
                    </div>
                  )}
                  {condominium.zip && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Código Postal</p>
                      <p className="text-gray-900 dark:text-white">{condominium.zip}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">País</p>
                    <p className="text-gray-900 dark:text-white">{condominium.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Administrador */}
            {(condominium.administratorName || condominium.administratorEmail || condominium.administratorPhone) && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Administrador
                </h2>
                <div className="space-y-3">
                  {condominium.administratorName && (
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{condominium.administratorName}</p>
                    </div>
                  )}
                  {condominium.administratorEmail && (
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                      <a 
                        href={`mailto:${condominium.administratorEmail}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {condominium.administratorEmail}
                      </a>
                    </div>
                  )}
                  {condominium.administratorPhone && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <a 
                        href={`tel:${condominium.administratorPhone}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {condominium.administratorPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información General */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Información
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</p>
                  <span className={`inline-flex px-2 py-1 rounded-md text-sm font-medium ${
                    condominium.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {condominium.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {condominium.createdAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Creado</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(condominium.createdAt).toLocaleDateString('es-PY')}
                    </p>
                  </div>
                )}
                {condominium.updatedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Última actualización</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(condominium.updatedAt).toLocaleDateString('es-PY')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'units' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Unidades del Condominio</h2>
              <button
                onClick={() => openUnitModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Nueva Unidad
              </button>
            </div>

            {unitsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : units.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unidad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Piso</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Área</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {units.map((unit) => (
                        <tr key={unit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{unit.unitNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-400">{unit.floorNumber || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-400">{unit.unitType || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {unit.area ? `${unit.area} m²` : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                              unit.isActive 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {unit.isActive ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openUnitModal(unit)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Editar"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUnit(unit.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Eliminar"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {unitsTotalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={unitsPage}
                      totalPages={unitsTotalPages}
                      totalElements={unitsTotal}
                      pageSize={12}
                      onPageChange={setUnitsPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <HomeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No hay unidades registradas</p>
                <button
                  onClick={() => openUnitModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Crear Primera Unidad
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cuotas de Mantenimiento</h2>
              <button
                onClick={() => openFeeModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Nueva Cuota
              </button>
            </div>

            {feesLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : fees.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Período</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vencimiento</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {fees.map((fee) => (
                        <tr key={fee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{fee.period}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-400">{fee.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(fee.totalAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('es-PY') : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                              fee.isActive 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {fee.isActive ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openFeeModal(fee)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Editar"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteFee(fee.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Eliminar"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {feesTotalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={feesPage}
                      totalPages={feesTotalPages}
                      totalElements={feesTotal}
                      pageSize={12}
                      onPageChange={setFeesPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <CurrencyDollarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No hay cuotas registradas</p>
                <button
                  onClick={() => openFeeModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Crear Primera Cuota
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pagos de Cuotas</h2>
              <button
                onClick={() => openPaymentModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Registrar Pago
              </button>
            </div>

            {paymentsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : payments.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Período</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unidad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Pago</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Método</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{payment.feePeriod || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-400">{payment.unitNumber || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(payment.amount || 0)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('es-PY') : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-400">{payment.paymentMethod || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                              payment.status === 'PAID'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : payment.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {payment.status === 'PAID' ? 'Pagado' : payment.status === 'PENDING' ? 'Pendiente' : payment.status || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openPaymentModal(payment)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Editar"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeletePayment(payment.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Eliminar"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {paymentsTotalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={paymentsPage}
                      totalPages={paymentsTotalPages}
                      totalElements={paymentsTotal}
                      pageSize={12}
                      onPageChange={setPaymentsPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No hay pagos registrados</p>
                <button
                  onClick={() => openPaymentModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Registrar Primer Pago
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Unidades */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Unidades</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalUnits}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stats.activeUnits} activas</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                    <HomeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Total Cuotas */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cuotas</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalFees}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stats.activeFees} activas</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                    <CurrencyDollarIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              {/* Pagos */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pagos</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalPayments}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {stats.paidPayments} pagados / {stats.pendingPayments} pendientes
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                    <DocumentTextIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Total Recaudado */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Recaudado</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {new Intl.NumberFormat('es-PY', { 
                        style: 'currency', 
                        currency: 'PYG',
                        notation: 'compact',
                        maximumFractionDigits: 0
                      }).format(stats.totalCollected)}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Pagado</p>
                  </div>
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl">
                    <ChartBarIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen Detallado */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unidades Activas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUnits} / {stats.totalUnits}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cuotas Activas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeFees} / {stats.totalFees}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pagos Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingPayments}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pagos Completados</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.paidPayments}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unit Modal */}
      <ModernPopup
        isOpen={showUnitModal}
        onClose={() => setShowUnitModal(false)}
        title={editingUnit ? 'Editar Unidad' : 'Nueva Unidad'}
        subtitle={editingUnit ? 'Modifica los datos de la unidad' : 'Registra una nueva unidad en el condominio'}
        icon={<HomeIcon className="w-6 h-6 text-white" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUnitSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Número de Unidad *
              </label>
              <input
                type="text"
                value={unitForm.unitNumber || ''}
                onChange={(e) => setUnitForm({ ...unitForm, unitNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ej: 101, A-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Número de Piso
              </label>
              <input
                type="number"
                value={unitForm.floorNumber || ''}
                onChange={(e) => setUnitForm({ ...unitForm, floorNumber: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ej: 1, 2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Unidad
              </label>
              <input
                type="text"
                value={unitForm.unitType || ''}
                onChange={(e) => setUnitForm({ ...unitForm, unitType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ej: Departamento, Oficina"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Área (m²)
              </label>
              <input
                type="number"
                step="0.01"
                value={unitForm.area || ''}
                onChange={(e) => setUnitForm({ ...unitForm, area: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ej: 45.5"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Porcentaje de Propiedad (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={unitForm.percentageOwnership || ''}
                onChange={(e) => setUnitForm({ ...unitForm, percentageOwnership: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ej: 2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={unitForm.isActive ? 'true' : 'false'}
                onChange={(e) => setUnitForm({ ...unitForm, isActive: e.target.value === 'true' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowUnitModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingUnit ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </ModernPopup>

      {/* Fee Modal */}
      <ModernPopup
        isOpen={showFeeModal}
        onClose={() => setShowFeeModal(false)}
        title={editingFee ? 'Editar Cuota' : 'Nueva Cuota'}
        subtitle={editingFee ? 'Modifica los datos de la cuota' : 'Genera una nueva cuota de mantenimiento'}
        icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFeeSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Período * (YYYY-MM)
              </label>
              <input
                type="text"
                pattern="[0-9]{4}-[0-9]{2}"
                value={feeForm.period || ''}
                onChange={(e) => setFeeForm({ ...feeForm, period: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="2024-01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tipo *
              </label>
              <select
                value={feeForm.type || 'COMMON'}
                onChange={(e) => setFeeForm({ ...feeForm, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="COMMON">Ordinaria</option>
                <option value="EXTRAORDINARY">Extraordinaria</option>
                <option value="SPECIAL">Especial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Monto Total *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={feeForm.totalAmount || 0}
                onChange={(e) => setFeeForm({ ...feeForm, totalAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={feeForm.dueDate || ''}
                onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={feeForm.description || ''}
                onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Descripción de la cuota..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={feeForm.isActive ? 'true' : 'false'}
                onChange={(e) => setFeeForm({ ...feeForm, isActive: e.target.value === 'true' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowFeeModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingFee ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </ModernPopup>

      {/* Payment Modal */}
      <ModernPopup
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={editingPayment ? 'Editar Pago' : 'Registrar Pago'}
        subtitle={editingPayment ? 'Modifica los datos del pago' : 'Registra un nuevo pago de cuota'}
        icon={<DocumentTextIcon className="w-6 h-6 text-white" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Cuota *
              </label>
              <select
                value={paymentForm.feeId || 0}
                onChange={(e) => setPaymentForm({ ...paymentForm, feeId: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value={0}>Seleccionar cuota...</option>
                {fees.map((fee) => (
                  <option key={fee.id} value={fee.id}>
                    {fee.period} - {fee.type} - {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(fee.totalAmount)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Unidad *
              </label>
              <select
                value={paymentForm.unitId || 0}
                onChange={(e) => setPaymentForm({ ...paymentForm, unitId: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value={0}>Seleccionar unidad...</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.unitNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Monto *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={paymentForm.amount || 0}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Estado *
              </label>
              <select
                value={paymentForm.status || 'PENDING'}
                onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="PENDING">Pendiente</option>
                <option value="PAID">Pagado</option>
                <option value="OVERDUE">Vencido</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Pago
              </label>
              <input
                type="date"
                value={paymentForm.paymentDate || ''}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Método de Pago
              </label>
              <select
                value={paymentForm.paymentMethod || ''}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Seleccionar método...</option>
                <option value="CASH">Efectivo</option>
                <option value="TRANSFER">Transferencia</option>
                <option value="CHECK">Cheque</option>
                <option value="CARD">Tarjeta</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Referencia de Transacción
              </label>
              <input
                type="text"
                value={paymentForm.transactionReference || ''}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Número de comprobante..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Notas
              </label>
              <textarea
                value={paymentForm.notes || ''}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Notas adicionales..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingPayment ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </ModernPopup>
    </div>
  );
}

