"use client";
import React, { useState, useEffect } from 'react';
import { 
  SubscriptionProduct, 
  PartnerSubscription, 
  SubscriptionUsage,
  CreateSubscriptionRequest 
} from '../types/subscription';
import { subscriptionService } from '../services/subscriptionService';
import { 
  Plus, 
  Calendar, 
  Users, 
  Building, 
  Database, 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Star,
  TrendingUp,
  Package,
  Settings,
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw
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
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [usage, setUsage] = useState<SubscriptionUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SubscriptionProduct | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY'>('MONTHLY');
  const [autoRenew, setAutoRenew] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, [partnerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subscriptionsData, productsData, usageData] = await Promise.all([
        subscriptionService.getPartnerSubscriptions(partnerId),
        subscriptionService.getAllProducts(),
        subscriptionService.getCurrentUsage(partnerId)
      ]);
      
      setSubscriptions(subscriptionsData);
      setProducts(productsData);
      setUsage(usageData);
    } catch {
      console.error('Error loading subscription data:');
      toast.error('Error al cargar datos de suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscription = async () => {
    if (!selectedProduct) {
      toast.error('Selecciona un producto');
      return;
    }

    try {
      setCreating(true);
      const data: CreateSubscriptionRequest = {
        partnerId,
        productId: selectedProduct.id,
        billingCycle,
        autoRenew,
        startDate: new Date().toISOString().split('T')[0]
      };

      const newSubscription = await subscriptionService.createSubscription(data);
      setSubscriptions(prev => [...prev, newSubscription]);
      setShowAddModal(false);
      setSelectedProduct(null);
      toast.success('Suscripción creada exitosamente');
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

  const getUsageForMetric = (metric: string) => {
    return usage.find(u => u.metric === metric) || { currentUsage: 0, limit: 0 };
  };

  const getUsagePercentage = (metric: string) => {
    const usageData = getUsageForMetric(metric);
    if (usageData.limit === 0) return 0;
    return Math.round((usageData.currentUsage / usageData.limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

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
          <Button
            variant="outline"
            onClick={() => setLoadingUsage(true)}
            disabled={loadingUsage}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingUsage ? 'animate-spin' : ''}`} />
            Actualizar Uso
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Suscripción
          </Button>
        </div>
      </div>

      {/* Estadísticas de Uso */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">
                {getUsageForMetric('USERS').currentUsage}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Uso</span>
              <span>{getUsagePercentage('USERS')}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(getUsagePercentage('USERS'))}`}
                style={{ width: `${Math.min(getUsagePercentage('USERS'), 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Propiedades</p>
              <p className="text-2xl font-bold text-gray-900">
                {getUsageForMetric('PROPERTIES').currentUsage}
              </p>
            </div>
            <Building className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Uso</span>
              <span>{getUsagePercentage('PROPERTIES')}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(getUsagePercentage('PROPERTIES'))}`}
                style={{ width: `${Math.min(getUsagePercentage('PROPERTIES'), 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contactos</p>
              <p className="text-2xl font-bold text-gray-900">
                {getUsageForMetric('CONTACTS').currentUsage}
              </p>
            </div>
            <Database className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Uso</span>
              <span>{getUsagePercentage('CONTACTS')}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(getUsagePercentage('CONTACTS'))}`}
                style={{ width: `${Math.min(getUsagePercentage('CONTACTS'), 100)}%` }}
              />
            </div>
          </div>
        </div>

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
                        {subscription.product.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {subscription.product.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={subscriptionService.getStatusColor(subscription.status)}>
                          {subscriptionService.getStatusLabel(subscription.status)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {subscriptionService.getBillingCycleLabel(subscription.billingCycle)}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {subscriptionService.formatCurrency(subscription.amount, subscription.currency)}
                        </span>
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
                  <div>
                    <span className="text-gray-500">Próxima facturación:</span>
                    <p className="font-medium">
                      {new Date(subscription.nextBillingDate).toLocaleDateString('es-PY')}
                    </p>
                  </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nueva Suscripción</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Producto
                </label>
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const product = products.find(p => p.id === Number(e.target.value));
                    setSelectedProduct(product || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona un producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {subscriptionService.formatCurrency(product.price, product.currency)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciclo de facturación
                </label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value as any)}
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
                disabled={!selectedProduct || creating}
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