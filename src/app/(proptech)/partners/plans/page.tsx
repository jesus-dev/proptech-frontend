"use client";

import React, { useState, useEffect } from 'react';
import { SubscriptionProduct } from '../types/subscription';
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
  ArrowDown
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
  currency: string;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  category: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM';
  maxUsers: number;
  maxProperties: number;
  maxContacts: number;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  isRecommended: boolean;
}

const AVAILABLE_FEATURES = [
  { value: 'unlimited_properties', label: 'Propiedades Ilimitadas' },
  { value: 'advanced_analytics', label: 'Analíticas Avanzadas' },
  { value: 'priority_support', label: 'Soporte Prioritario' },
  { value: 'custom_branding', label: 'Marca Personalizada' },
  { value: 'api_access', label: 'Acceso a API' },
  { value: 'white_label', label: 'White Label' },
  { value: 'multi_user', label: 'Múltiples Usuarios' },
  { value: 'advanced_reports', label: 'Reportes Avanzados' },
  { value: 'integrations', label: 'Integraciones' },
  { value: 'training_sessions', label: 'Sesiones de Capacitación' }
];

export default function PlansAndProductsPage() {
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SubscriptionProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    billingCycle: 'MONTHLY',
    category: 'BASIC',
    maxUsers: 1,
    maxProperties: 10,
    maxContacts: 100,
    features: [],
    isActive: true,
    isPopular: false,
    isRecommended: false
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar planes y productos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (editingProduct) {
        // Update existing product
        await subscriptionService.updateProduct(editingProduct.id, formData);
        toast.success('Plan actualizado exitosamente');
      } else {
        // Create new product
        await subscriptionService.createProduct(formData);
        toast.success('Plan creado exitosamente');
      }
      
      setShowAddModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: SubscriptionProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      billingCycle: product.billingCycle,
      category: product.category as any,
      maxUsers: product.maxUsers || 1,
      maxProperties: product.maxProperties || 10,
      maxContacts: product.maxContacts || 100,
      features: product.features,
      isActive: product.isActive,
      isPopular: product.isPopular || false,
      isRecommended: product.isRecommended || false
    });
    setShowAddModal(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este plan?')) {
      return;
    }

    try {
      await subscriptionService.deleteProduct(productId);
      toast.success('Plan eliminado exitosamente');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
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
      category: 'BASIC',
      maxUsers: 1,
      maxProperties: 10,
      maxContacts: 100,
      features: [],
      isActive: true,
      isPopular: false,
      isRecommended: false
    });
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' ? product.isActive : !product.isActive);
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
      case 'BASIC': return 'Básico';
      case 'PROFESSIONAL': return 'Profesional';
      case 'ENTERPRISE': return 'Empresarial';
      case 'CUSTOM': return 'Personalizado';
      case 'TECHNOLOGY': return 'Tecnología';
      case 'SERVICES': return 'Servicios';
      case 'TRAINING': return 'Capacitación';
      case 'NETWORKING': return 'Networking';
      case 'OTHER': return 'Otros';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'BASIC': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PROFESSIONAL': return 'bg-green-100 text-green-800 border-green-200';
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CUSTOM': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'TECHNOLOGY': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'SERVICES': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'TRAINING': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'NETWORKING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OTHER': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BASIC': return Package;
      case 'PROFESSIONAL': return Building;
      case 'ENTERPRISE': return Crown;
      case 'CUSTOM': return Settings;
      case 'TECHNOLOGY': return Zap;
      case 'SERVICES': return Shield;
      case 'TRAINING': return Users;
      case 'NETWORKING': return TrendingUp;
      case 'OTHER': return Package;
      default: return Package;
    }
  };

  const getStats = () => {
    const total = products.length;
    const active = products.filter(p => p.isActive).length;
    const popular = products.filter(p => p.isPopular).length;
    const recommended = products.filter(p => p.isRecommended).length;
    const totalRevenue = products.reduce((sum, p) => sum + p.price, 0);
    
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
              onClick={loadProducts}
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
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="BASIC">Básico</SelectItem>
              <SelectItem value="PROFESSIONAL">Profesional</SelectItem>
              <SelectItem value="ENTERPRISE">Empresarial</SelectItem>
              <SelectItem value="CUSTOM">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
              <SelectValue placeholder="Filtrar por estado" />
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
              <SelectValue placeholder="Ordenar por" />
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
        {filteredProducts.length === 0 ? (
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
          filteredProducts.map((product) => {
            const CategoryIcon = getCategoryIcon(product.category);
            return (
              <div key={product.id} className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 ${product.isPopular ? 'ring-2 ring-yellow-400' : ''} ${product.isRecommended ? 'ring-2 ring-purple-400' : ''}`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${getCategoryColor(product.category).replace('border-', 'bg-').replace('text-', '').replace('bg-', 'bg-').replace('border-', '')}`}>
                      <CategoryIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getCategoryColor(product.category)}>
                          {getCategoryLabel(product.category)}
                        </Badge>
                        {product.isPopular && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        {product.isRecommended && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Recomendado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {subscriptionService.formatCurrency(product.price, product.currency)}
                    </span>
                    <span className="text-sm text-gray-500">
                      / {subscriptionService.getBillingCycleLabel(product.billingCycle)}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-4">
                  {product.maxUsers && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Usuarios máx.</span>
                      <span className="font-medium text-gray-900">{product.maxUsers}</span>
                    </div>
                  )}
                  {product.maxProperties && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Propiedades máx.</span>
                      <span className="font-medium text-gray-900">{product.maxProperties}</span>
                    </div>
                  )}
                  {product.maxContacts && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Contactos máx.</span>
                      <span className="font-medium text-gray-900">{product.maxContacts}</span>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <Badge variant={product.isActive ? "default" : "destructive"}>
                    {product.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    ID: {product.id}
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
        title={editingProduct ? 'Editar Plan' : 'Nuevo Plan'}
        subtitle={editingProduct ? 'Modifica la información del plan de suscripción' : 'Crea un nuevo plan de suscripción para los socios'}
        icon={editingProduct ? <Edit className="w-6 h-6 text-white" /> : <PlusCircle className="w-6 h-6 text-white" />}
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
                <option value="BASIC">Básico</option>
                <option value="PROFESSIONAL">Profesional</option>
                <option value="ENTERPRISE">Empresarial</option>
                <option value="CUSTOM">Personalizado</option>
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
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="PYG">PYG</option>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Usuarios Máximos
              </label>
              <input
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) || 0 }))}
                placeholder="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Propiedades Máximas
              </label>
              <input
                type="number"
                value={formData.maxProperties}
                onChange={(e) => setFormData(prev => ({ ...prev, maxProperties: parseInt(e.target.value) || 0 }))}
                placeholder="10"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Contactos Máximos
              </label>
              <input
                type="number"
                value={formData.maxContacts}
                onChange={(e) => setFormData(prev => ({ ...prev, maxContacts: parseInt(e.target.value) || 0 }))}
                placeholder="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Características del Plan
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              {AVAILABLE_FEATURES.map((feature) => (
                <div key={feature.value} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={feature.value}
                    checked={formData.features.includes(feature.value)}
                    onChange={() => handleFeatureToggle(feature.value)}
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600"
                  />
                  <label htmlFor={feature.value} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {feature.label}
                  </label>
                </div>
              ))}
            </div>
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
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </div>
              )}
            </button>
          </div>
        </form>
      </ModernPopup>
    </div>
  );
} 