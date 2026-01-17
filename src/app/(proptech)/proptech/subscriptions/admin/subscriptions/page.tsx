"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, RefreshCw, Filter, Download, Loader2, Calendar, User, Package, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { subscriptionService, UserSubscription } from '@/services/subscriptionService';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    planType: '',
    page: 0,
    size: 20
  });
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subscriptionsData, statsData] = await Promise.all([
        subscriptionService.getAllSubscriptions(filters.page, filters.size, filters.status, filters.planType),
        subscriptionService.getSubscriptionStats()
      ]);
      setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setSubscriptions([]);
      setStats({
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        expiringSoon: 0,
        monthlyRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const getStatusColor = (status: string) => {
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString('es-PY', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-lg">Cargando suscripciones...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Administrar Suscripciones</h1>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Suscripciones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubscriptions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suscripciones Activas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiran Pronto</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiringSoon || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.monthlyRevenue ? subscriptionService.formatPrice(stats.monthlyRevenue) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVE">Activa</option>
              <option value="INACTIVE">Inactiva</option>
              <option value="SUSPENDED">Suspendida</option>
              <option value="CANCELLED">Cancelada</option>
              <option value="PENDING">Pendiente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Plan
            </label>
            <select
              value={filters.planType}
              onChange={(e) => handleFilterChange('planType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todos los tipos</option>
              <option value="PROPTECH">PropTech</option>
              <option value="NETWORK">Network</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Elementos por página
            </label>
            <select
              value={filters.size}
              onChange={(e) => handleFilterChange('size', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Suscripciones */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Suscripciones ({subscriptions.length})
          </h3>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario / Agente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan de Suscripción
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Fechas / Vencimiento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Pago / Referencia
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {subscription.userName || `Usuario ID: ${subscription.userId || 'N/A'}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {subscription.userId || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {subscription.planName || subscription.subscriptionPlan?.name || 'N/A'}
                    </div>
                    {subscription.subscriptionPlan && (
                      <div className="text-xs text-gray-500">
                        {subscription.subscriptionPlan.tier || 'N/A'} - {subscriptionService.getBillingCycleText(subscription.subscriptionPlan.billingCycleDays || 30)}
                      </div>
                    )}
                    {subscription.daysRemaining !== undefined && (
                      <div className={`text-xs mt-1 md:hidden ${subscription.daysRemaining <= 7 ? 'text-red-600 font-semibold' : subscription.daysRemaining <= 30 ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {subscription.daysRemaining} días restantes
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Badge className={getStatusColor(subscription.status || 'INACTIVE')}>
                      {getStatusLabel(subscription.status || 'INACTIVE')}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div className="text-sm text-gray-900">
                      <div className="mb-1">
                        <span className="text-xs text-gray-500">Inicio: </span>
                        {formatDate(subscription.startDate)}
                      </div>
                      <div className="mb-1">
                        <span className="text-xs text-gray-500">Fin: </span>
                        {formatDate(subscription.endDate)}
                      </div>
                      {subscription.daysRemaining !== undefined && subscription.daysRemaining !== null && (
                        <div className={`text-xs mt-1 ${subscription.daysRemaining <= 7 ? 'text-red-600 font-semibold' : subscription.daysRemaining <= 30 ? 'text-yellow-600' : 'text-gray-500'}`}>
                          {subscription.daysRemaining} días restantes
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="text-sm text-gray-900 break-all">
                      {subscription.paymentReference || 'N/A'}
                    </div>
                    {subscription.amountPaid !== undefined && subscription.amountPaid !== null && (
                      <div className="text-xs text-gray-500">
                        {subscriptionService.formatPrice(subscription.amountPaid)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        onClick={() => {
                          toast.info('Funcionalidad de ver detalles próximamente');
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          toast.info('Funcionalidad de editar próximamente');
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {subscriptions.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron suscripciones con los filtros aplicados</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {subscriptions.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-700">
            Mostrando {filters.page * filters.size + 1} a {Math.min((filters.page + 1) * filters.size, subscriptions.length)} de {subscriptions.length} resultados
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
              disabled={filters.page === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={subscriptions.length < filters.size}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
