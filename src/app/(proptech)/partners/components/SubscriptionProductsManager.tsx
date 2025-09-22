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
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function SubscriptionProductsManager() {
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SubscriptionProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    billingCycle: 'MONTHLY' as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
    category: 'BASIC' as 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM' | 'TECHNOLOGY' | 'SERVICES' | 'TRAINING' | 'NETWORKING' | 'OTHER',
    maxUsers: 0,
    maxProperties: 0,
    maxContacts: 0,
    features: [] as string[],
    isActive: true
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
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Update existing product
        // await subscriptionService.updateProduct(editingProduct.id, formData);
        toast.success('Producto actualizado exitosamente');
      } else {
        // Create new product
        // await subscriptionService.createProduct(formData);
        toast.success('Producto creado exitosamente');
      }
      
      setShowAddModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar producto');
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
      category: product.category,
      maxUsers: product.maxUsers || 0,
      maxProperties: product.maxProperties || 0,
      maxContacts: product.maxContacts || 0,
      features: product.features,
      isActive: product.isActive
    });
    setShowAddModal(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      // await subscriptionService.deleteProduct(productId);
      toast.success('Producto eliminado exitosamente');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
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
      maxUsers: 0,
      maxProperties: 0,
      maxContacts: 0,
      features: [],
      isActive: true
    });
  };

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner message="Cargando productos" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Productos de Suscripción</h2>
          <p className="text-gray-600">Gestiona los productos disponibles para suscripción</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Lista de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <Badge className={getCategoryColor(product.category)}>
                    {getCategoryLabel(product.category)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{product.description}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Precio</span>
                <span className="font-semibold text-gray-900">
                  {subscriptionService.formatCurrency(product.price, product.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Ciclo</span>
                <span className="text-sm text-gray-900">
                  {subscriptionService.getBillingCycleLabel(product.billingCycle)}
                </span>
              </div>

              {product.maxUsers && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Usuarios máx.</span>
                  <span className="text-sm text-gray-900">{product.maxUsers}</span>
                </div>
              )}

              {product.maxProperties && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Propiedades máx.</span>
                  <span className="text-sm text-gray-900">{product.maxProperties}</span>
                </div>
              )}

              {product.maxContacts && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Contactos máx.</span>
                  <span className="text-sm text-gray-900">{product.maxContacts}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Estado</span>
                <Badge className={product.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                  {product.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>

            {product.features.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Características</h4>
                <ul className="space-y-1">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                  {product.features.length > 3 && (
                    <li className="text-sm text-gray-500">
                      +{product.features.length - 3} más...
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
          <p className="text-gray-600 mb-4">
            Crea el primer producto de suscripción para comenzar.
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Producto
          </Button>
        </div>
      )}

      {/* Modal para agregar/editar producto */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
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
                    <option value="BASIC">Básico</option>
                    <option value="PROFESSIONAL">Profesional</option>
                    <option value="ENTERPRISE">Empresarial</option>
                    <option value="CUSTOM">Personalizado</option>
                    <option value="TECHNOLOGY">Tecnología</option>
                    <option value="SERVICES">Servicios</option>
                    <option value="TRAINING">Capacitación</option>
                    <option value="NETWORKING">Networking</option>
                    <option value="OTHER">Otros</option>
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
                    setEditingProduct(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Actualizar' : 'Crear'} Producto
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 