"use client";
import React, { useMemo, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { usePropertyTypes } from "./hooks/usePropertyTypes";
import { PropertyType } from "./services/propertyTypeService";
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ModernPopup from '@/components/ui/ModernPopup';

interface PropertyTypeFormData {
  name: string;
  description: string;
  active: boolean;
  parentId?: number;
}

export default function PropertyTypesPage() {
  const {
    propertyTypes,
    parentTypes,
    loading,
    error,
    createPropertyType,
    updatePropertyType,
    deletePropertyType,
    clearError,
  } = usePropertyTypes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPropertyType, setEditingPropertyType] = useState<PropertyType | null>(null);
  const [formData, setFormData] = useState<PropertyTypeFormData>({
    name: '',
    description: '',
    active: true,
    parentId: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Crear o editar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingPropertyType) {
        await updatePropertyType(editingPropertyType.id, formData);
      } else {
        await createPropertyType(formData);
      }
      
      setIsModalOpen(false);
      setEditingPropertyType(null);
      setFormData({ name: '', description: '', active: true, parentId: undefined });
    } catch (error) {
      console.error('Error saving property type:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Editar
  const handleEdit = (propertyType: PropertyType) => {
    setEditingPropertyType(propertyType);
    setFormData({
      name: propertyType.name,
      description: propertyType.description || '',
      active: propertyType.active ?? true,
      parentId: propertyType.parentId
    });
    setIsModalOpen(true);
  };

  // Eliminar
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este tipo de propiedad?')) {
      return;
    }

    try {
      await deletePropertyType(id);
    } catch (error) {
      console.error('Error deleting property type:', error);
    }
  };

  // Abrir modal de nuevo
  const openModal = () => {
    setEditingPropertyType(null);
    setFormData({ name: '', description: '', active: true, parentId: undefined });
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPropertyType(null);
    setFormData({ name: '', description: '', active: true, parentId: undefined });
  };

  // Error alert
  const errorAlert = error && (
    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <div className="flex justify-between items-center">
        <span>{error}</span>
        <button
          onClick={() => clearError()}
          className="text-red-500 hover:text-red-700"
        >
          ×
        </button>
      </div>
    </div>
  );

  const filteredPropertyTypes = propertyTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (type.parentName && type.parentName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Ordenamiento y agrupación: padres primero y luego sus hijos, todo por nombre
  const groupedAndSortedTypes = useMemo(() => {
    if (searchTerm.trim()) {
      // En modo búsqueda mantenemos la lista plana filtrada
      return filteredPropertyTypes
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    const parents = propertyTypes
      .filter(t => !t.parentId)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));

    const childrenByParent = new Map<number, PropertyType[]>();
    propertyTypes
      .filter(t => !!t.parentId)
      .forEach(t => {
        const key = t.parentId as number;
        const arr = childrenByParent.get(key) || [];
        arr.push(t);
        childrenByParent.set(key, arr);
      });

    const result: PropertyType[] = [];
    parents.forEach(parent => {
      result.push(parent);
      const kids = (childrenByParent.get(parent.id) || []).sort((a, b) => a.name.localeCompare(b.name));
      kids.forEach(k => result.push(k));
    });

    // Hijos huérfanos (con parentId pero cuyo padre no está en la lista)
    const orphanChildren = propertyTypes
      .filter(t => !!t.parentId && !parents.find(p => p.id === (t.parentId as number)))
      .sort((a, b) => a.name.localeCompare(b.name));
    orphanChildren.forEach(c => result.push(c));

    return result;
  }, [propertyTypes, filteredPropertyTypes, searchTerm]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Tipos de Propiedad
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Administra los tipos de propiedad disponibles en el sistema
        </p>
      </div>

      {errorAlert}

      {/* Actions and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Tipo de Propiedad
        </button>

        <div className="relative">
          <input
            type="text"
            placeholder="Buscar tipos de propiedad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Property Types List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tipos de Propiedad ({filteredPropertyTypes.length})
          </h2>
        </div>

        {filteredPropertyTypes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoría Padre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {groupedAndSortedTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        {type.parentId && (
                          <span className="text-gray-400 mr-2">└─</span>
                        )}
                        {type.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {type.parentName || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {type.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {type.active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {type.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(type)}
                          className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(type.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {searchTerm ? 'No se encontraron tipos de propiedad' : 'No hay tipos de propiedad'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando tu primer tipo de propiedad.'}
            </p>
          </div>
        )}
      </div>

      {/* Modern Popup */}
      <ModernPopup
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPropertyType ? 'Editar Tipo de Propiedad' : 'Nuevo Tipo de Propiedad'}
        subtitle={editingPropertyType ? 'Modifica los datos del tipo de propiedad' : 'Crea un nuevo tipo de propiedad en el sistema'}
        icon={<BuildingOfficeIcon className="w-6 h-6 text-white" />}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              placeholder="Ej: Casa, Apartamento, Terreno..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Categoría Padre (Opcional)
            </label>
            <select
              value={formData.parentId || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                parentId: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
            >
              <option value="">Sin categoría padre</option>
              {parentTypes
                .filter(parent => !editingPropertyType || parent.id !== editingPropertyType.id)
                .map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Selecciona una categoría padre para crear una subcategoría
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              placeholder="Descripción detallada del tipo de propiedad..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Activo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={closeModal}
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
                  {editingPropertyType ? 'Actualizar' : 'Crear'}
                </div>
              )}
            </button>
          </div>
        </form>
      </ModernPopup>
    </div>
  );
} 