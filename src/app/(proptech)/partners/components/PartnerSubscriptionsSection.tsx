"use client";
import React, { useState, useEffect } from 'react';
import { 
  SubscriptionPlan, 
  PartnerSubscription, 
  CreateSubscriptionRequest 
} from '../types/subscription';
import { subscriptionService } from '../services/subscriptionService';
import { 
  Plus, 
  Activity,
  CheckCircle,
  XCircle,
  Package,
  Eye,
  X,
  CreditCard,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ModernPopup from '@/components/ui/ModernPopup';

interface PartnerSubscriptionsSectionProps {
  partnerId: number;
  partnerName: string;
}

export default function PartnerSubscriptionsSection({ partnerId, partnerName }: PartnerSubscriptionsSectionProps) {
  const [subscriptions, setSubscriptions] = useState<PartnerSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY'>('MONTHLY');
  const [autoRenew, setAutoRenew] = useState(true);
  const [creating, setCreating] = useState(false);
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 !text-black';
      case 'INACTIVE': return 'bg-gray-100 !text-black';
      case 'SUSPENDED': return 'bg-yellow-100 !text-black';
      case 'CANCELLED': return 'bg-red-100 !text-black';
      case 'PENDING': return 'bg-blue-100 !text-black';
      default: return 'bg-gray-100 !text-black';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activa';
      case 'INACTIVE': return 'Inactiva';
      case 'SUSPENDED': return 'Suspendida';
      case 'CANCELLED': return 'Cancelada';
      case 'PENDING': return 'Pendiente';
      default: return status;
    }
  };

  useEffect(() => {
    if (partnerId) {
      console.log('PartnerSubscriptionsSection: Loading data for partnerId:', partnerId);
      loadData();
    }
  }, [partnerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subscriptionsData, plansData] = await Promise.all([
        subscriptionService.getPartnerSubscriptions(partnerId),
        subscriptionService.getAllProducts()
      ]);
      
      // Log para debugging
      console.log('Subscriptions loaded:', subscriptionsData);
      console.log('Subscriptions count:', subscriptionsData.length);
      subscriptionsData.forEach((sub, idx) => {
        console.log(`Subscription ${idx + 1}:`, {
          id: sub.id,
          planId: sub.planId,
          plan: sub.plan ? { id: sub.plan.id, name: sub.plan.name, category: sub.plan.category } : null,
          status: sub.status
        });
      });
      console.log('Plans loaded:', plansData);
      console.log('Plans filtered (PROPTECH):', plansData.filter(p => p.category === 'PROPTECH' && p.isActive));
      console.log('All active plans:', plansData.filter(p => p.isActive));
      
      // Si alguna suscripción no tiene plan, intentar buscarlo
      const subscriptionsWithPlans = subscriptionsData.map(sub => {
        if (!sub.plan && sub.planId) {
          const plan = plansData.find(p => p.id === sub.planId);
          if (plan) {
            return { ...sub, plan };
          }
        }
        return sub;
      });
      
      setSubscriptions(subscriptionsWithPlans);
      setPlans(plansData);
      // setUsage([]); // TODO: Implementar si es necesario
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Error al cargar datos de suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscription = async () => {
    if (!selectedPlan) {
      toast.error('Selecciona un plan');
      return;
    }

    try {
      setCreating(true);
      const data: CreateSubscriptionRequest = {
        partnerId,
        planId: selectedPlan.id,
        billingCycle,
        autoRenew,
        startDate: new Date().toISOString().split('T')[0]
      };

      console.log('Creating subscription with data:', data);
      const newSubscription = await subscriptionService.createSubscription(data);
      console.log('Subscription created:', newSubscription);
      
      setShowAddModal(false);
      setSelectedPlan(null);
      setBillingCycle('MONTHLY');
      setAutoRenew(true);
      
      toast.success('Suscripción creada exitosamente');
      await loadData(); // Recargar para obtener las suscripciones actualizadas
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      const errorMessage = error?.message || 'Error al crear suscripción';
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: number) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta suscripción?')) {
      return;
    }

    try {
      await subscriptionService.cancelSubscription(subscriptionId);
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, status: 'CANCELLED' as const }
            : sub
        )
      );
      toast.success('Suscripción cancelada');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Error al cancelar suscripción');
    }
  };

  const handleReactivateSubscription = async (subscriptionId: number) => {
    try {
      await subscriptionService.reactivateSubscription(subscriptionId);
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, status: 'ACTIVE' as const }
            : sub
        )
      );
      toast.success('Suscripción reactivada');
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast.error('Error al reactivar suscripción');
    }
  };

  // Funciones de uso comentadas por ahora - se pueden implementar después si es necesario
  // const getUsageForMetric = (metric: string) => {
  //   return usage.find(u => u.metric === metric) || { currentUsage: 0, limit: 0 };
  // };

  // const getUsagePercentage = (metric: string) => {
  //   const usageData = getUsageForMetric(metric);
  //   if (usageData.limit === 0) return 0;
  //   return Math.round((usageData.currentUsage / usageData.limit) * 100);
  // };

  // const getUsageColor = (percentage: number) => {
  //   if (percentage >= 90) return 'bg-red-500';
  //   if (percentage >= 75) return 'bg-yellow-500';
  //   return 'bg-green-500';
  // };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner message="Cargando suscripciones" />
        </div>
      </div>
    );
  }

  // Limpiar y formatear el nombre del socio
  const formattedPartnerName = partnerName?.trim() || 'este socio';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            Suscripciones
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las suscripciones de <span className="font-semibold text-gray-900 dark:text-white">{formattedPartnerName}</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Suscripción
        </button>
      </div>

      {/* Estadísticas */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
              Suscripciones Activas
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {subscriptions.filter(s => s.status === 'ACTIVE').length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total: {subscriptions.length} suscripciones
            </p>
          </div>
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Lista de Suscripciones */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Package className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
            Suscripciones Actuales
          </h3>
        </div>
        
        {subscriptions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <Package className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No hay suscripciones</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Este socio no tiene suscripciones activas. Agrega una nueva suscripción para comenzar.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
            >
              <Plus className="h-5 w-5 mr-2" />
              Agregar Suscripción
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
                      <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {subscription.plan?.name || `Plan ID: ${subscription.planId || 'N/A'}`}
                      </h4>
                      {subscription.plan?.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {subscription.plan.description}
                        </p>
                      )}
                      {!subscription.plan && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                          ⚠️ Información del plan no disponible. Plan ID: {subscription.planId}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className={`${getStatusBadgeClass(subscription.status)} dark:bg-opacity-20`}>
                          {getStatusLabel(subscription.status)}
                        </Badge>
                        {subscription.plan && (
                          <>
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium">
                              {subscription.plan.billingCycle === 'MONTHLY' ? 'Mensual' : 
                               subscription.plan.billingCycle === 'QUARTERLY' ? 'Trimestral' : 
                               subscription.plan.billingCycle === 'YEARLY' ? 'Anual' : subscription.plan.billingCycle}
                            </span>
                            <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                              {subscriptionService.formatCurrency(
                                subscription.plan.price, 
                                subscription.plan.currencyCode || 'USD'
                              )}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        {subscription.nextBillingDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 block">Próxima facturación</span>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {new Date(subscription.nextBillingDate).toLocaleDateString('es-PY')}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <RefreshCw className={`h-4 w-4 ${subscription.autoRenew ? 'text-green-500' : 'text-gray-400'}`} />
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">Renovación automática</span>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {subscription.autoRenew ? 'Sí' : 'No'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">Fecha de inicio</span>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {new Date(subscription.startDate).toLocaleDateString('es-PY')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                    {subscription.status === 'ACTIVE' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelSubscription(subscription.id)}
                        className="w-full lg:w-auto"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    ) : subscription.status === 'CANCELLED' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReactivateSubscription(subscription.id)}
                        className="w-full lg:w-auto"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Reactivar
                      </Button>
                    ) : null}
                    
                    <Button variant="outline" size="sm" className="w-full lg:w-auto">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para agregar suscripción */}
      <ModernPopup
        isOpen={showAddModal}
        onClose={() => {
          if (!creating) {
            setShowAddModal(false);
            setSelectedPlan(null);
            setBillingCycle('MONTHLY');
            setAutoRenew(true);
          }
        }}
        title="Nueva Suscripción"
        subtitle={`Agrega una nueva suscripción para ${formattedPartnerName}`}
        icon={<CreditCard className="w-6 h-6 text-white" />}
        maxWidth="max-w-md"
        closeOnBackdropClick={!creating}
      >
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleAddSubscription();
          }}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Plan de Suscripción *
            </label>
            <select
              value={selectedPlan?.id || ''}
              onChange={(e) => {
                const plan = plans.find(p => p.id === Number(e.target.value));
                setSelectedPlan(plan || null);
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              required
            >
              <option value="">Selecciona un plan</option>
              {plans.filter(p => p.isActive).length === 0 ? (
                <option value="" disabled>
                  No hay planes disponibles
                </option>
              ) : (
                plans.filter(p => p.isActive).map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {subscriptionService.formatCurrency(plan.price, plan.currencyCode || 'USD')}
                  </option>
                ))
              )}
            </select>
            {selectedPlan && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {selectedPlan.description || 'Sin descripción disponible'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Ciclo de Facturación *
            </label>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value as 'MONTHLY' | 'QUARTERLY' | 'YEARLY')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              required
            >
              <option value="MONTHLY">Mensual</option>
              <option value="QUARTERLY">Trimestral</option>
              <option value="YEARLY">Anual</option>
            </select>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              La facturación se realizará según el ciclo seleccionado
            </p>
          </div>

          <div className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <input
              type="checkbox"
              id="autoRenew"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="h-5 w-5 mt-0.5 text-brand-600 focus:ring-brand-500 border-gray-300 rounded cursor-pointer"
              disabled={creating}
            />
            <label htmlFor="autoRenew" className="ml-3 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <span className="font-semibold">Renovación automática</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                La suscripción se renovará automáticamente al finalizar cada período
              </p>
            </label>
          </div>

          {selectedPlan && (
            <div className="p-4 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-900/20 dark:to-indigo-900/20 rounded-xl border border-brand-200 dark:border-brand-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total a facturar:</span>
                <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
                  {subscriptionService.formatCurrency(selectedPlan.price, selectedPlan.currencyCode || 'USD')}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {billingCycle === 'MONTHLY' ? 'Cada mes' : 
                 billingCycle === 'QUARTERLY' ? 'Cada 3 meses' : 
                 'Cada año'}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setSelectedPlan(null);
                setBillingCycle('MONTHLY');
                setAutoRenew(true);
              }}
              disabled={creating}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedPlan || creating}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 border border-transparent rounded-xl hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {creating ? (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Crear Suscripción
                </div>
              )}
            </button>
          </div>
        </form>
      </ModernPopup>
    </div>
  );
} 