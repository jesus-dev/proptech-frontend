"use client";
import React, { useState, useEffect } from 'react';
import { 
  PartnerSubscription, 
  SubscriptionProduct,
  SubscriptionUsage,
  CreateSubscriptionRequest 
} from '../types/subscription';
import { subscriptionService } from '../services/subscriptionService';
import { partnerService, Partner } from '../services/partnerService';
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Package,
  Users,
  Building,
  Database,
  Activity,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  CreditCard,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface SubscriptionFormData {
  partnerId: number;
  productId: number;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  autoRenew: boolean;
  startDate: string;
  notes: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<PartnerSubscription[]>([]);
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    partnerId: 0,
    productId: 0,
    billingCycle: 'MONTHLY',
    autoRenew: true,
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, partnersResponse] = await Promise.all([
        subscriptionService.getAllProducts(),
        partnerService.getAllPartners()
      ]);
      
      setProducts(productsData.filter(p => p.isActive));
      setPartners(partnersResponse.content);
      
      // Placeholder data for subscriptions
      setSubscriptions([]);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Error al cargar datos de suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async () => {
    try {
      if (!formData.partnerId || !formData.productId) {
        toast.error('Selecciona un socio y un producto');
        return;
      }

      const data: CreateSubscriptionRequest = {
        partnerId: formData.partnerId,
        productId: formData.productId,
        billingCycle: formData.billingCycle,
        autoRenew: formData.autoRenew,
        startDate: formData.startDate,
        notes: formData.notes
      };

      // Aquí iría la llamada real al servicio
      // const newSubscription = await subscriptionService.createSubscription(data);
      
      toast.success('Suscripción creada exitosamente');
      setShowCreateModal(false);
      setFormData({
        partnerId: 0,
        productId: 0,
        billingCycle: 'MONTHLY',
        autoRenew: true,
        startDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Error al crear suscripción');
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (partners.find(p => p.id === subscription.partnerId)?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    const matchesProduct = productFilter === 'all' || subscription.productId === Number(productFilter);
    return matchesSearch && matchesStatus && matchesProduct;
  });

  const getActiveSubscriptionsCount = () => subscriptions.filter(s => s.status === 'ACTIVE').length;
  const getTotalRevenue = () => subscriptions
    .filter(s => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + s.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Activa</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactiva</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Suspendida</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelada</Badge>;
      case 'PENDING':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Pendiente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner message="Cargando suscripciones" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suscripciones de Socios</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gestiona todas las suscripciones activas de los socios
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={loadData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Suscripción
              </Button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Suscripciones</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{subscriptions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Activas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getActiveSubscriptionsCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos Mensuales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subscriptionService.formatCurrency(getTotalRevenue(), 'USD')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Socios Suscritos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Array.from(new Set(subscriptions.map(s => s.partnerId))).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar suscripciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="ACTIVE">Activas</option>
              <option value="INACTIVE">Inactivas</option>
              <option value="SUSPENDED">Suspendidas</option>
              <option value="CANCELLED">Canceladas</option>
              <option value="PENDING">Pendientes</option>
            </select>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Todos los productos</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Suscripciones */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Suscripciones ({filteredSubscriptions.length})
            </h3>
          </div>

          {filteredSubscriptions.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay suscripciones
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' || productFilter !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay suscripciones registradas'
                }
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Suscripción
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSubscriptions.map((subscription) => {
                const partner = partners.find(p => p.id === subscription.partnerId);
                return (
                  <div key={subscription.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {subscription.product.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Socio: {partner ? `${partner.firstName} ${partner.lastName}` : `ID: ${subscription.partnerId}`}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(subscription.status)}
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {subscriptionService.getBillingCycleLabel(subscription.billingCycle)}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {subscriptionService.formatCurrency(subscription.amount, subscription.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Configurar
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Inicio:</span>
                        <span className="font-medium">
                          {new Date(subscription.startDate).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Próximo pago:</span>
                        <span className="font-medium">
                          {subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString('es-ES') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Renovación:</span>
                        <span className="font-medium">
                          {subscription.autoRenew ? 'Automática' : 'Manual'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Crear Suscripción */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Nueva Suscripción
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Socio <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.partnerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, partnerId: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Seleccionar socio</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.firstName} {partner.lastName} - {partner.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Producto <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData(prev => ({ ...prev, productId: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Seleccionar producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {subscriptionService.formatCurrency(product.price, product.currency)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ciclo de Facturación
                  </label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="MONTHLY">Mensual</option>
                    <option value="QUARTERLY">Trimestral</option>
                    <option value="YEARLY">Anual</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Notas adicionales sobre la suscripción"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={formData.autoRenew}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoRenew: e.target.checked }))}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="autoRenew" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Renovación automática
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSubscription}>
                Crear Suscripción
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 