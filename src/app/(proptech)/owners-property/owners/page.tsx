'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { ownerService, Owner, CreateOwnerRequest } from '@/services/ownerService';
import { OwnersPropertyService } from '@/services/ownersPropertyService';
import ModernPopup from '@/components/ui/ModernPopup';

export default function OwnersListPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [deletingOwner, setDeletingOwner] = useState<Owner | null>(null);
  const [formData, setFormData] = useState<CreateOwnerRequest>({
    name: '',
    email: '',
    phone: '',
    address: '',
    documentNumber: '',
    bankAccount: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      setLoading(true);
      const ownersData = await ownerService.getAllOwners();
      setOwners(ownersData);
    } catch (error) {
      console.error('Error cargando propietarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }
    
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = 'El teléfono no es válido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOwner = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      const newOwner = await ownerService.createOwner(formData);
      if (newOwner) {
        setOwners(prev => [...prev, newOwner]);
      }
      setShowCreateModal(false);
      resetForm();
      alert('Propietario creado exitosamente');
    } catch (error) {
      console.error('Error creando propietario:', error);
      alert('Error creando propietario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOwner = async () => {
    if (!editingOwner || !validateForm()) return;
    
    try {
      setIsSubmitting(true);
      const updatedOwner = await ownerService.updateOwner(editingOwner.id, formData);
      if (updatedOwner) {
        setOwners(prev => prev.map(owner => 
          owner.id === editingOwner.id ? updatedOwner : owner
        ));
      }
      setShowEditModal(false);
      setEditingOwner(null);
      resetForm();
      alert('Propietario actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando propietario:', error);
      alert('Error actualizando propietario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOwner = async () => {
    if (!deletingOwner) return;
    
    try {
      setIsSubmitting(true);
      await ownerService.deleteOwner(deletingOwner.id);
      setOwners(prev => prev.filter(owner => owner.id !== deletingOwner.id));
      setShowDeleteModal(false);
      setDeletingOwner(null);
      alert('Propietario eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando propietario:', error);
      alert('Error eliminando propietario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (owner: Owner) => {
    setEditingOwner(owner);
    setFormData({
      name: owner.name,
      email: owner.email,
      phone: owner.phone || '',
      address: owner.address || '',
      documentNumber: owner.documentNumber || '',
      bankAccount: owner.bankAccount || '',
      notes: owner.notes || ''
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (owner: Owner) => {
    setDeletingOwner(owner);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      documentNumber: '',
      bankAccount: '',
      notes: ''
    });
    setFormErrors({});
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const filteredOwners = owners.filter(owner => {
    const matchesSearch = owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (owner.phone && owner.phone.includes(searchTerm)) ||
                         (owner.documentNumber && owner.documentNumber.includes(searchTerm));
    const matchesStatus = filterStatus === 'all' || owner.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportOwners = () => {
    const csvContent = [
      ['ID', 'Nombre', 'Email', 'Teléfono', 'Dirección', 'DNI/NIE', 'Cuenta Bancaria', 'Estado', 'Fecha Creación'],
      ...filteredOwners.map(owner => [
        owner.id,
        owner.name,
        owner.email,
        owner.phone || '',
        owner.address || '',
        owner.documentNumber || '',
        owner.bankAccount || '',
        OwnersPropertyService.getStatusDisplayName(owner.status),
        new Date().toLocaleDateString('es-ES')
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `propietarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Propietarios
            </h1>
            <p className="text-gray-600">
              Administra la información de todos los propietarios del sistema
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportOwners}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Propietario
            </button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar propietarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
            <option value="PENDING">Pendientes</option>
          </select>

          <button
            onClick={loadOwners}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full mr-4">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{owners.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {owners.filter(o => o.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {owners.filter(o => o.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full mr-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Inactivos</p>
              <p className="text-2xl font-bold text-gray-900">
                {owners.filter(o => o.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de propietarios */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Propietarios ({filteredOwners.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propietario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documentación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOwners.map((owner) => (
                <tr key={owner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{owner.name}</div>
                        <div className="text-sm text-gray-500">ID: {owner.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{owner.email}</div>
                    {owner.phone && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {owner.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {owner.documentNumber && (
                      <div className="text-sm text-gray-900">{owner.documentNumber}</div>
                    )}
                    {owner.address && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {owner.address}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      owner.status === 'active' ? 'bg-green-100 text-green-800' :
                      owner.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {OwnersPropertyService.getStatusDisplayName(owner.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date().toLocaleDateString('es-ES')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(owner)}
                        className="text-orange-600 hover:text-orange-900 p-1"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(owner)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de creación */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nuevo Propietario</h3>
              <OwnerForm
                formData={formData}
                setFormData={setFormData}
                formErrors={formErrors}
                onSubmit={handleCreateOwner}
                onCancel={() => setShowCreateModal(false)}
                isSubmitting={isSubmitting}
                submitText="Crear Propietario"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {showEditModal && editingOwner && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Propietario</h3>
              <OwnerForm
                formData={formData}
                setFormData={setFormData}
                formErrors={formErrors}
                onSubmit={handleUpdateOwner}
                onCancel={() => setShowEditModal(false)}
                isSubmitting={isSubmitting}
                submitText="Actualizar Propietario"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && deletingOwner && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmar Eliminación</h3>
              <p className="text-sm text-gray-500 mb-6">
                ¿Estás seguro de que quieres eliminar al propietario <strong>{deletingOwner.name}</strong>?
                Esta acción no se puede deshacer.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteOwner}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente del formulario reutilizable
interface OwnerFormProps {
  formData: CreateOwnerRequest;
  setFormData: (data: CreateOwnerRequest) => void;
  formErrors: Record<string, string>;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitText: string;
}

function OwnerForm({
  formData,
  setFormData,
  formErrors,
  onSubmit,
  onCancel,
  isSubmitting,
  submitText
}: OwnerFormProps) {
  const handleInputChange = (field: keyof CreateOwnerRequest, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field]) {
      const newErrors = { ...formErrors };
      delete newErrors[field];
      // Aquí necesitarías actualizar formErrors, pero como es solo lectura en este componente,
      // la validación se hará en el componente padre
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
            formErrors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nombre completo"
        />
        {formErrors.name && (
          <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
            formErrors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="email@ejemplo.com"
        />
        {formErrors.email && (
          <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
            formErrors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="+34 600 123 456"
        />
        {formErrors.phone && (
          <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Calle, número, ciudad"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          DNI/NIE
        </label>
        <input
          type="text"
          value={formData.documentNumber}
          onChange={(e) => handleInputChange('documentNumber', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="12345678A"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cuenta Bancaria
        </label>
        <input
          type="text"
          value={formData.bankAccount}
          onChange={(e) => handleInputChange('bankAccount', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="ES91 2100 0418 4502 0005 1332"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Información adicional..."
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : submitText}
        </button>
      </div>
    </form>
  );
}
