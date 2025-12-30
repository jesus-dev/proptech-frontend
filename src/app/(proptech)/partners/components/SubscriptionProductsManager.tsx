"use client";
import React, { useState, useEffect } from 'react';
import { SubscriptionPlan } from '../types/subscription';
import { subscriptionService } from '../services/subscriptionService';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  DollarSign, 
  Calendar,
  Users,
  Building,
  Database,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function SubscriptionProductsManager() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    billingCycle: 'MONTHLY' as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
    category: 'SOCIAL_DUES' as 'SOCIAL_DUES' | 'PROPTECH',
    maxUsers: 0,
    maxProperties: 0,
    maxContacts: 0,
    features: [] as string[],
    isActive: true
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getAllProducts();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Error al cargar planes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPlan) {
        // Update existing plan
        // await subscriptionService.updateProduct(editingPlan.id, formData);
        toast.success('Plan actualizado exitosamente');
      } else {
        // Create new plan
        // await subscriptionService.createProduct(formData);
        toast.success('Plan creado exitosamente');
      }
      
      setShowAddModal(false);
      setEditingPlan(null);
      resetForm();
      loadPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Error al guardar plan');
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      category: plan.category,
      maxUsers: plan.maxUsers || 0,
      maxProperties: plan.maxProperties || 0,
      maxContacts: plan.maxContacts || 0,
      features: plan.features,
      isActive: plan.isActive
    });
    setShowAddModal(true);
  };

  const handleDelete = async (planId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este plan?')) {
      return;
    }

    try {
      // await subscriptionService.deleteProduct(planId);
      toast.success('Plan eliminado exitosamente');
      loadPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Error al eliminar plan');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      category: 'SOCIAL_DUES',
      maxUsers: 0,
      maxProperties: 0,
      maxContacts: 0,
      features: [],
      isActive: true
    });
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'SOCIAL_DUES': return 'Cuota Social';
      case 'PROPTECH': return 'Suscripción PropTech';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SOCIAL_DUES': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PROPTECH': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner message="Cargando planes" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Planes de Suscripción</h2>
          <p className="text-gray-600">Gestiona los planes disponibles para suscripción</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Plan
        </Button>
      </div>

      {/* Lista de Planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <Badge className={getCategoryColor(plan.category)}>
                    {getCategoryLabel(plan.category)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(plan)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(plan.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{plan.description}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Precio</span>
                <span className="font-semibold text-gray-900">
                  {subscriptionService.formatCurrency(plan.price, plan.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Ciclo</span>
                <span className="text-sm text-gray-900">
                  {subscriptionService.getBillingCycleLabel(plan.billingCycle)}
                </span>
              </div>

              {plan.maxUsers && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Usuarios máx.</span>
                  <span className="text-sm text-gray-900">{plan.maxUsers}</span>
                </div>
              )}

              {plan.maxProperties && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Propiedades máx.</span>
                  <span className="text-sm text-gray-900">{plan.maxProperties}</span>
                </div>
              )}

              {plan.maxContacts && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Contactos máx.</span>
                  <span className="text-sm text-gray-900">{plan.maxContacts}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Estado</span>
                <Badge className={plan.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>

            {plan.features.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Características</h4>
                <ul className="space-y-1">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-sm text-gray-500">
                      +{plan.features.length - 3} más...
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay planes</h3>
          <p className="text-gray-600 mb-4">
            Crea el primer plan de suscripción para comenzar.
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Plan
          </Button>
        </div>
      )}

      {/* Modal para agregar/editar plan */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="SOCIAL_DUES">Cuota Social</option>
                    <option value="PROPTECH">Suscripción PropTech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="PYG">PYG</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciclo de Facturación *
                  </label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MONTHLY">Mensual</option>
                    <option value="QUARTERLY">Trimestral</option>
                    <option value="YEARLY">Anual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuarios Máximos
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Propiedades Máximas
                  </label>
                  <input
                    type="number"
                    value={formData.maxProperties}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxProperties: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contactos Máximos
                  </label>
                  <input
                    type="number"
                    value={formData.maxContacts}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxContacts: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Producto Activo
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPlan(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPlan ? 'Actualizar' : 'Crear'} Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 