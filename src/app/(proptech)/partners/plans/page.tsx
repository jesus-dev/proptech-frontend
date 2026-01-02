"use client";

import React, { useState, useEffect } from 'react';
import { SubscriptionPlan } from '../types/subscription';
import { subscriptionService } from '../services/subscriptionService';
import { currencyService } from '@/app/(proptech)/catalogs/currencies/services/currencyService';
import { Currency } from '@/app/(proptech)/catalogs/currencies/services/types';
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
  Settings,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  Star,
  TrendingUp,
  Zap,
  Crown,
  Shield,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ModernPopup from '@/components/ui/ModernPopup';

import { toast } from 'sonner';
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface PlanFormData {
  name: string;
  description: string;
  price: number;
  currencyId?: number;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  category: 'SOCIAL_DUES' | 'PROPTECH';
  maxUsers: number;
  maxProperties: number;
  maxContacts: number;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  isRecommended: boolean;
}

// ELIMINADO: AVAILABLE_FEATURES hardcoded
// Las features deben ser dinámicas, ingresadas por el admin al crear cada plan
// En el formulario, el admin puede escribir las features que quiera, no seleccionar de una lista fija

export default function PlansAndProductsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    price: 0,
    currencyId: undefined,
    billingCycle: 'MONTHLY',
    category: 'SOCIAL_DUES',
    maxUsers: 1,
    maxProperties: 10,
    maxContacts: 100,
    features: [],
    isActive: true,
    isPopular: false,
    isRecommended: false
  });

  const loadCurrencies = async () => {
    try {
      const activeCurrencies = await currencyService.getActive();
      setCurrencies(activeCurrencies || []);
    } catch (error) {
      console.error('Error loading currencies:', error);
    }
  };

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

  useEffect(() => {
    loadCurrencies();
    loadPlans();
  }, []);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (editingPlan) {
        // Update existing plan
        await subscriptionService.updateProduct(editingPlan.id, formData);
        toast.success('Plan actualizado exitosamente');
      } else {
        // Create new plan
        await subscriptionService.createProduct(formData);
        toast.success('Plan creado exitosamente');
      }
      
      setShowAddModal(false);
      setEditingPlan(null);
      resetForm();
      loadPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Error al guardar plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currencyId: plan.currencyId,
      billingCycle: plan.billingCycle,
      category: plan.category as any,
      maxUsers: plan.maxUsers || 1,
      maxProperties: plan.maxProperties || 10,
      maxContacts: plan.maxContacts || 100,
      features: plan.features,
      isActive: plan.isActive,
      isPopular: plan.isPopular || false,
      isRecommended: plan.isRecommended || false
    });
    setShowAddModal(true);
  };

  const handleDelete = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;

    try {
      setIsDeleting(true);
      await subscriptionService.deleteProduct(planToDelete.id);
      toast.success('Plan eliminado exitosamente');
      setPlanToDelete(null);
      loadPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Error al eliminar plan. Asegúrate de que no tenga suscripciones activas.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      currencyId: undefined,
      billingCycle: 'MONTHLY',
      category: 'SOCIAL_DUES',
      maxUsers: 1,
      maxProperties: 10,
      maxContacts: 100,
      features: [],
      isActive: true,
      isPopular: false,
      isRecommended: false
    });
  };

  // ELIMINADO: handleFeatureToggle - Ya no se usa
  // Las features ahora son de texto libre, no checkboxes

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || plan.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' ? plan.isActive : !plan.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'category':
        aValue = a.category;
        bValue = b.category;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'SOCIAL_DUES': return 'Cuota Social';
      case 'PROPTECH': return 'Suscripción PropTech';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SOCIAL_DUES': return 'bg-gray-100 !text-black border-gray-300 dark:bg-gray-700 dark:!text-white dark:border-gray-600';
      case 'PROPTECH': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700';
      case 'BASIC': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PROFESSIONAL': return 'bg-green-100 text-green-800 border-green-200';
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CUSTOM': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'TECHNOLOGY': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'SERVICES': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'TRAINING': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'NETWORKING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OTHER': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SOCIAL_DUES': return Users;
      case 'PROPTECH': return Zap;
      default: return Package;
    }
  };

  const getStats = () => {
    const total = plans.length;
    const active = plans.filter(p => p.isActive).length;
    const popular = plans.filter(p => p.isPopular).length;
    const recommended = plans.filter(p => p.isRecommended).length;
    const totalRevenue = plans.reduce((sum, p) => sum + p.price, 0);
    
    return { total, active, popular, recommended, totalRevenue };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Cargando planes y productos" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Planes y Productos</h1>
            </div>
            <p className="text-gray-600">Gestiona los planes de suscripción y productos disponibles para los socios</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={loadPlans}
              className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
            <Button 
              onClick={() => setShowAddModal(true)} 
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
            >
              <PlusCircle className="h-4 w-4" />
              Nuevo Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Planes</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-blue-400/20 p-3 rounded-lg">
              <Package className="h-8 w-8 text-blue-200" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Activos</p>
              <p className="text-3xl font-bold">{stats.active}</p>
            </div>
            <div className="bg-emerald-400/20 p-3 rounded-lg">
              <CheckCircle className="h-8 w-8 text-emerald-200" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium mb-1">Populares</p>
              <p className="text-3xl font-bold">{stats.popular}</p>
            </div>
            <div className="bg-yellow-400/20 p-3 rounded-lg">
              <Star className="h-8 w-8 text-yellow-200" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Recomendados</p>
              <p className="text-3xl font-bold">{stats.recommended}</p>
            </div>
            <div className="bg-purple-400/20 p-3 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Valor Total</p>
              <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-400/20 p-3 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros y Búsqueda
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar planes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
              <SelectValue placeholder="Filtrar por categoría">
                {categoryFilter === 'all' ? 'Todas las categorías' :
                 categoryFilter === 'SOCIAL_DUES' ? 'Cuota Social' :
                 categoryFilter === 'PROPTECH' ? 'Suscripción PropTech' :
                 'Filtrar por categoría'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="SOCIAL_DUES">Cuota Social</SelectItem>
              <SelectItem value="PROPTECH">Suscripción PropTech</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
              <SelectValue placeholder="Filtrar por estado">
                {statusFilter === 'all' ? 'Todos los estados' : 
                 statusFilter === 'active' ? 'Activos' : 
                 statusFilter === 'inactive' ? 'Inactivos' : 
                 'Filtrar por estado'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-');
            setSortBy(field);
            setSortOrder(order as 'asc' | 'desc');
          }}>
            <SelectTrigger className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
              <SelectValue placeholder="Ordenar por">
                {sortBy === 'name' && sortOrder === 'asc' ? 'Nombre (A-Z)' :
                 sortBy === 'name' && sortOrder === 'desc' ? 'Nombre (Z-A)' :
                 sortBy === 'price' && sortOrder === 'asc' ? 'Precio (Menor)' :
                 sortBy === 'price' && sortOrder === 'desc' ? 'Precio (Mayor)' :
                 sortBy === 'category' && sortOrder === 'asc' ? 'Categoría (A-Z)' :
                 'Ordenar por'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
              <SelectItem value="price-asc">Precio (Menor)</SelectItem>
              <SelectItem value="price-desc">Precio (Mayor)</SelectItem>
              <SelectItem value="category-asc">Categoría (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enhanced Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center max-w-md mx-auto py-12">
              <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron planes</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay planes configurados en el sistema'
                }
              </p>
              <Button 
                onClick={() => setShowAddModal(true)} 
                className="flex items-center gap-2 mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <PlusCircle className="h-4 w-4" />
                Crear Primer Plan
              </Button>
            </div>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const CategoryIcon = getCategoryIcon(plan.category);
            const isPopular = plan.isPopular;
            const isRecommended = plan.isRecommended;
            
            return (
              <div 
                key={plan.id} 
                className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all ${
                  isPopular ? 'ring-2 ring-yellow-400' : '' 
                } ${isRecommended ? 'ring-2 ring-purple-400' : ''}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`p-3 rounded-lg ${
                      plan.category === 'PROPTECH'
                        ? 'bg-blue-500'
                        : 'bg-gray-600'
                    }`}>
                      <CategoryIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {plan.name}
                      </h3>
                      <Badge className={`${getCategoryColor(plan.category)} text-xs`}>
                        {getCategoryLabel(plan.category)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(plan)}
                      className="hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(plan)}
                      className="hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                {plan.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    {plan.description}
                  </p>
                )}

                {/* Price */}
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {subscriptionService.formatCurrency(plan.price, plan.currencyCode || 'USD')}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      / {subscriptionService.getBillingCycleLabel(plan.billingCycle)}
                    </span>
                  </div>
                </div>

                {/* Status Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Badge 
                    className={`text-xs px-2 py-1 ${
                      plan.isActive 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {plan.isActive ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activo
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactivo
                      </>
                    )}
                  </Badge>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    ID: {plan.id}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Enhanced Add/Edit Modal */}
      <ModernPopup
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
        subtitle={editingPlan ? 'Modifica la información del plan de suscripción' : 'Crea un nuevo plan de suscripción para los socios'}
        icon={editingPlan ? <Edit className="w-6 h-6 text-white" /> : <PlusCircle className="w-6 h-6 text-white" />}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Plan *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Plan Básico"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              >
                <option value="SOCIAL_DUES">Cuota Social</option>
                <option value="PROPTECH">Suscripción PropTech</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Descripción detallada del plan..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Precio *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Moneda *
              </label>
              <select
                value={formData.currencyId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, currencyId: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              >
                <option value="">Seleccione una moneda</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ciclo de Facturación *
              </label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              >
                <option value="MONTHLY">Mensual</option>
                <option value="QUARTERLY">Trimestral</option>
                <option value="YEARLY">Anual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Características del Plan (una por línea)
            </label>
            <textarea
              value={formData.features.join('\n')}
              onChange={(e) => setFormData({
                ...formData,
                features: e.target.value.split('\n').filter(f => f.trim())
              })}
              rows={8}
              placeholder="Escribe cada característica en una línea nueva:&#10;Propiedades ilimitadas&#10;Analíticas avanzadas&#10;Soporte prioritario&#10;Acceso a API&#10;Reportes personalizados&#10;..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-sm transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-2">
              Las características se mostrarán en la página pública de planes con un checkmark (✓). Escribe una por línea.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Plan Activo
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPopular"
                checked={formData.isPopular}
                onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600"
              />
              <label htmlFor="isPopular" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Plan Popular
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isRecommended"
                checked={formData.isRecommended}
                onChange={(e) => setFormData(prev => ({ ...prev, isRecommended: e.target.checked }))}
                className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600"
              />
              <label htmlFor="isRecommended" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Plan Recomendado
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 border border-transparent rounded-xl hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  {editingPlan ? 'Actualizar' : 'Crear'}
                </div>
              )}
            </button>
          </div>
        </form>
      </ModernPopup>

      {/* Modal de Confirmación de Eliminación */}
      <ModernPopup
        isOpen={!!planToDelete}
        onClose={() => !isDeleting && setPlanToDelete(null)}
        title="Eliminar Plan de Suscripción"
        subtitle="Esta acción no se puede deshacer"
        icon={<AlertTriangle className="w-6 h-6 text-white" />}
        maxWidth="max-w-md"
        closeOnBackdropClick={!isDeleting}
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  ¿Estás seguro de que quieres eliminar este plan?
                </h3>
                {planToDelete && (
                  <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <p><strong>Plan:</strong> {planToDelete.name}</p>
                    <p><strong>Categoría:</strong> {planToDelete.category === 'PROPTECH' ? 'Proptech' : 'Cuotas Sociales'}</p>
                    <p className="mt-2">
                      Esta acción eliminará permanentemente el plan de suscripción. Si hay suscripciones activas asociadas, no podrás eliminarlo.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setPlanToDelete(null)}
              disabled={isDeleting}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 border border-transparent rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Eliminar Plan
                </div>
              )}
            </button>
          </div>
        </div>
      </ModernPopup>
    </div>
  );
} 