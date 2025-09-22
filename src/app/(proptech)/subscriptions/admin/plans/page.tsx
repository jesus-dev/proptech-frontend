"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Eye, Loader2, Save, X, RefreshCw, Download, Upload, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { subscriptionService, SubscriptionPlan } from '@/services/subscriptionService';
import DeleteConfirmationDialog from './components/DeleteConfirmationDialog';
import PlanDetailsDialog from './components/PlanDetailsDialog';
import { SubscriptionPlansManager } from '@/components/auth/ProtectedRoute';

interface PlanFormData {
  name: string;
  description: string;
  type: 'PROPTECH' | 'NETWORK';
  tier: 'FREE' | 'INICIAL' | 'INTERMEDIO' | 'PREMIUM';
  price: number;
  billingCycleDays: number;
  maxProperties: number | null;
  maxAgents: number | null;
  hasAnalytics: boolean;
  hasCrm: boolean;
  hasNetworkAccess: boolean;
  hasPrioritySupport: boolean;
  isActive: boolean;
}

function AdminPlansPageContent() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    type: 'PROPTECH',
    tier: 'INICIAL',
    price: 0,
    billingCycleDays: 30,
    maxProperties: 5,
    maxAgents: 2,
    hasAnalytics: false,
    hasCrm: false,
    hasNetworkAccess: false,
    hasPrioritySupport: false,
    isActive: true
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; planId: number | null; planName: string }>({
    isOpen: false,
    planId: null,
    planName: ""
  });
  const [detailsDialog, setDetailsDialog] = useState<{ isOpen: boolean; plan: SubscriptionPlan | null }>({
    isOpen: false,
    plan: null
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const plansData = await subscriptionService.getAllPlans();
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Error al cargar los planes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPlan) {
        await subscriptionService.updatePlan(editingPlan.id, formData);
        toast.success('Plan actualizado exitosamente');
      } else {
        await subscriptionService.createPlan(formData);
        toast.success('Plan creado exitosamente');
      }
      
      setShowForm(false);
      setEditingPlan(null);
      resetForm();
      await loadPlans();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      toast.error(error.message || 'Error al guardar el plan');
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      type: plan.type as 'PROPTECH' | 'NETWORK',
      tier: plan.tier as 'FREE' | 'INICIAL' | 'INTERMEDIO' | 'PREMIUM',
      price: plan.price,
      billingCycleDays: plan.billingCycleDays,
      maxProperties: plan.maxProperties,
      maxAgents: plan.maxAgents,
      hasAnalytics: plan.hasAnalytics,
      hasCrm: plan.hasCrm,
      hasNetworkAccess: plan.hasNetworkAccess,
      hasPrioritySupport: plan.hasPrioritySupport,
      isActive: plan.isActive
    });
    setShowForm(true);
  };

  const handleDelete = (planId: number, planName: string) => {
    setDeleteDialog({
      isOpen: true,
      planId,
      planName
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.planId) return;
    
    try {
      await subscriptionService.deletePlan(deleteDialog.planId);
      toast.success("Plan eliminado correctamente");
      loadPlans();
      setDeleteDialog({ isOpen: false, planId: null, planName: "" });
    } catch (error) {
      toast.error("Error al eliminar el plan");
      console.error("Error deleting plan:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'PROPTECH',
      tier: 'INICIAL',
      price: 0,
      billingCycleDays: 30,
      maxProperties: 5,
      maxAgents: 2,
      hasAnalytics: false,
      hasCrm: false,
      hasNetworkAccess: false,
      hasPrioritySupport: false,
      isActive: true
    });
  };

  const handleViewDetails = (plan: SubscriptionPlan) => {
    setDetailsDialog({
      isOpen: true,
      plan
    });
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PREMIUM': return 'bg-yellow-100 text-yellow-800';
      case 'INTERMEDIO': return 'bg-blue-100 text-blue-800';
      case 'INICIAL': return 'bg-green-100 text-green-800';
      case 'FREE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PROPTECH': return 'bg-purple-100 text-purple-800';
      case 'NETWORK': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-lg">Cargando planes...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Planes de Suscripción</h1>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          Nuevo Plan
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar planes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos los tipos</option>
            <option value="mensual">Mensual</option>
            <option value="anual">Anual</option>
            <option value="semestral">Semestral</option>
          </select>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos los niveles</option>
            <option value="gratuito">Gratuito</option>
            <option value="inicial">Inicial</option>
            <option value="intermedio">Intermedio</option>
            <option value="premium">Premium</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
          <Button
            onClick={() => {
              toast.info('Filtros aplicados');
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">
              {editingPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}
            </h2>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingPlan(null);
                resetForm();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Plan
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Plan Premium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PROPTECH' | 'NETWORK' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="PROPTECH">PropTech</option>
                  <option value="NETWORK">Network</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tier
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value as 'FREE' | 'INICIAL' | 'INTERMEDIO' | 'PREMIUM' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="FREE">Gratuito</option>
                  <option value="INICIAL">Inicial</option>
                  <option value="INTERMEDIO">Intermedio</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (PYG)
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciclo de Facturación
                </label>
                <select
                  value={formData.billingCycleDays}
                  onChange={(e) => setFormData({ ...formData, billingCycleDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value={30}>Mensual (30 días)</option>
                  <option value={90}>Trimestral (90 días)</option>
                  <option value={365}>Anual (365 días)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máx. Propiedades
                </label>
                <Input
                  type="number"
                  value={formData.maxProperties || ''}
                  onChange={(e) => setFormData({ ...formData, maxProperties: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="-1"
                  min="-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máx. Agentes
                </label>
                <Input
                  type="number"
                  value={formData.maxAgents || ''}
                  onChange={(e) => setFormData({ ...formData, maxAgents: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="-1"
                  min="-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasAnalytics}
                  onChange={(e) => setFormData({ ...formData, hasAnalytics: e.target.checked })}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Analytics</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasCrm}
                  onChange={(e) => setFormData({ ...formData, hasCrm: e.target.checked })}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">CRM</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasNetworkAccess}
                  onChange={(e) => setFormData({ ...formData, hasNetworkAccess: e.target.checked })}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Network</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasPrioritySupport}
                  onChange={(e) => setFormData({ ...formData, hasPrioritySupport: e.target.checked })}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Soporte VIP</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingPlan(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                <Save className="h-4 w-4 mr-2" />
                {editingPlan ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Planes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Planes Existentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Plan
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Tipo
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Precio
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Estado
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{plan.description}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <Badge className={`${getTypeColor(plan.type)} text-xs`}>
                        {plan.type}
                      </Badge>
                      <Badge className={`${getTierColor(plan.tier)} text-xs`}>
                        {plan.tier}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subscriptionService.formatPrice(plan.price)}
                    </div>
                    <div className="text-xs text-gray-500">
                      /{subscriptionService.getBillingCycleText(plan.billingCycleDays)}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Badge variant={plan.isActive ? "default" : "secondary"} className="text-xs">
                      {plan.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleViewDetails(plan)}
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEdit(plan)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(plan.id, plan.name)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, planId: null, planName: "" })}
        onConfirm={confirmDelete}
        planName={deleteDialog.planName}
      />

      {/* Plan Details Dialog */}
      <PlanDetailsDialog
        isOpen={detailsDialog.isOpen}
        onClose={() => setDetailsDialog({ isOpen: false, plan: null })}
        plan={detailsDialog.plan}
      />
    </div>
  );
}

export default function AdminPlansPage() {
  return (
    <SubscriptionPlansManager>
      <AdminPlansPageContent />
    </SubscriptionPlansManager>
  );
}
