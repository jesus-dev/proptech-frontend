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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import LoadingSpinner from "@/components/common/LoadingSpinner";

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
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
    loadData();
  }, [partnerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subscriptionsData, plansData] = await Promise.all([
        subscriptionService.getPartnerSubscriptions(partnerId),
        subscriptionService.getAllProducts()
      ]);
      
      setSubscriptions(subscriptionsData);
      setPlans(plansData);
      // setUsage([]); // TODO: Implementar si es necesario
    } catch {
      console.error('Error loading subscription data:');
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

      const newSubscription = await subscriptionService.createSubscription(data);
      setSubscriptions(prev => [...prev, newSubscription]);
      setShowAddModal(false);
      setSelectedPlan(null);
      setBillingCycle('MONTHLY');
      toast.success('Suscripción creada exitosamente');
      loadData(); // Recargar para obtener las suscripciones actualizadas
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Error al crear suscripción');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Suscripciones</h2>
          <p className="text-gray-600">Gestiona las suscripciones de {partnerName}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Suscripción
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Suscripciones Activas</p>
            <p className="text-2xl font-bold text-gray-900">
              {subscriptions.filter(s => s.status === 'ACTIVE').length}
            </p>
          </div>
          <Activity className="h-8 w-8 text-orange-500" />
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Total: {subscriptions.length}
          </p>
        </div>
      </div>

      {/* Lista de Suscripciones */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Suscripciones Actuales</h3>
        </div>
        
        {subscriptions.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay suscripciones</h3>
            <p className="text-gray-600 mb-4">
              Este socio no tiene suscripciones activas. Agrega una nueva suscripción para comenzar.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Suscripción
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {subscription.plan?.name || 'Plan no disponible'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {subscription.plan?.description || ''}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusBadgeClass(subscription.status)}>
                          {getStatusLabel(subscription.status)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {subscription.plan?.billingCycle === 'MONTHLY' ? 'Mensual' : 
                           subscription.plan?.billingCycle === 'QUARTERLY' ? 'Trimestral' : 
                           subscription.plan?.billingCycle === 'YEARLY' ? 'Anual' : subscription.plan?.billingCycle}
                        </span>
                        {subscription.plan && (
                          <span className="text-sm font-medium text-gray-900">
                            {subscriptionService.formatCurrency(
                              subscription.plan.price, 
                              subscription.plan.currencyCode || 'USD'
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {subscription.status === 'ACTIVE' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelSubscription(subscription.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    ) : subscription.status === 'CANCELLED' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReactivateSubscription(subscription.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Reactivar
                      </Button>
                    ) : null}
                    
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {subscription.nextBillingDate && (
                    <div>
                      <span className="text-gray-500">Próxima facturación:</span>
                      <p className="font-medium">
                        {new Date(subscription.nextBillingDate).toLocaleDateString('es-PY')}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Renovación automática:</span>
                    <p className="font-medium">
                      {subscription.autoRenew ? 'Sí' : 'No'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Fecha de inicio:</span>
                    <p className="font-medium">
                      {new Date(subscription.startDate).toLocaleDateString('es-PY')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para agregar suscripción */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Nueva Suscripción</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={creating}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Producto
                </label>
                <select
                  value={selectedPlan?.id || ''}
                  onChange={(e) => {
                    const plan = plans.find(p => p.id === Number(e.target.value));
                    setSelectedPlan(plan || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona un plan</option>
                  {plans.filter(p => p.category === 'PROPTECH' && p.isActive).map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {subscriptionService.formatCurrency(plan.price, plan.currencyCode || 'USD')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciclo de Facturación
                </label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value as 'MONTHLY' | 'QUARTERLY' | 'YEARLY')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MONTHLY">Mensual</option>
                  <option value="QUARTERLY">Trimestral</option>
                  <option value="YEARLY">Anual</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoRenew" className="ml-2 block text-sm text-gray-900">
                  Renovación automática
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddSubscription}
                disabled={!selectedPlan || creating}
              >
                {creating ? 'Creando...' : 'Crear Suscripción'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 