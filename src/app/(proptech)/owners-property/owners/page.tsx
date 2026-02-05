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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
              Propietarios
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
              Administra la información de propietarios
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportOwners}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-xs sm:text-sm"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
              onClick={openCreateModal}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center text-xs sm:text-sm"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
            <option value="PENDING">Pendientes</option>
          </select>

          <button
            onClick={loadOwners}
            className="px-2.5 py-1.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2.5 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
              <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Total</p>
              <p className="text-sm sm:text-xl font-bold text-gray-900">{owners.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2.5 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Activos</p>
              <p className="text-sm sm:text-xl font-bold text-gray-900">
                {owners.filter(o => o.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2.5 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Pend.</p>
              <p className="text-sm sm:text-xl font-bold text-gray-900">
                {owners.filter(o => o.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2.5 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Inact.</p>
              <p className="text-sm sm:text-xl font-bold text-gray-900">
                {owners.filter(o => o.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de propietarios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-3 sm:px-6 py-3 border-b border-gray-200">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">
            Lista ({filteredOwners.length})
          </h3>
        </div>
        
        {/* Vista móvil - Cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {filteredOwners.map((owner) => (
            <div key={owner.id} className="p-3 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {owner.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{owner.name}</p>
                    <p className="text-[10px] text-gray-500">{owner.email}</p>
                  </div>
                </div>
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                  owner.status === 'active' ? 'bg-green-100 text-green-700' :
                  owner.status === 'inactive' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {owner.status === 'active' ? 'Activo' : owner.status === 'inactive' ? 'Inactivo' : 'Pend.'}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(owner)}
                  className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => openDeleteModal(owner)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Vista desktop - Tabla */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">
                  Propietario
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">
                  Contacto
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOwners.map((owner) => (
                <tr key={owner.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mr-2.5 text-white text-sm font-semibold">
                        {owner.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{owner.name}</div>
                        <div className="text-xs text-gray-500">{owner.documentNumber || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{owner.email}</div>
                    {owner.phone && (
                      <div className="text-xs text-gray-500">{owner.phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      owner.status === 'active' ? 'bg-green-100 text-green-700' :
                      owner.status === 'inactive' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {OwnersPropertyService.getStatusDisplayName(owner.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(owner)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(owner)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-start sm:items-center justify-center p-3">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Nuevo Propietario</h3>
              <OwnerForm
                formData={formData}
                setFormData={setFormData}
                formErrors={formErrors}
                onSubmit={handleCreateOwner}
                onCancel={() => setShowCreateModal(false)}
                isSubmitting={isSubmitting}
                submitText="Crear"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {showEditModal && editingOwner && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-start sm:items-center justify-center p-3">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Editar Propietario</h3>
              <OwnerForm
                formData={formData}
                setFormData={setFormData}
                formErrors={formErrors}
                onSubmit={handleUpdateOwner}
                onCancel={() => setShowEditModal(false)}
                isSubmitting={isSubmitting}
                submitText="Guardar"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && deletingOwner && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-3">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mb-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Eliminar Propietario</h3>
              <p className="text-sm text-gray-500 mb-4">
                ¿Eliminar a <strong>{deletingOwner.name}</strong>?
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteOwner}
                  className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '...' : 'Eliminar'}
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
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              formErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nombre completo"
          />
          {formErrors.name && <p className="text-red-500 text-[10px] mt-0.5">{formErrors.name}</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              formErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="email@ejemplo.com"
          />
          {formErrors.email && <p className="text-red-500 text-[10px] mt-0.5">{formErrors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="+595 XXX"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">DNI/CI</label>
          <input
            type="text"
            value={formData.documentNumber}
            onChange={(e) => handleInputChange('documentNumber', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="12345678"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Dirección</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Calle, número, ciudad"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Información adicional..."
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? '...' : submitText}
        </button>
      </div>
    </form>
  );
}
