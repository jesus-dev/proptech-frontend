"use client";

import React, { useState } from "react";
import { useNeighborhoods } from "./hooks/useNeighborhoods";
import { Neighborhood } from "./types";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ModernPopup from '@/components/ui/ModernPopup';

interface NeighborhoodFormData {
  name: string;
  cityId: string;
  countryId: string;
}

export default function NeighborhoodsPage() {
  const {
    neighborhoods,
    cities,
    countries,
    loading,
    error,
    createNeighborhood,
    updateNeighborhood,
    deleteNeighborhood,
    setError,
  } = useNeighborhoods();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNeighborhood, setEditingNeighborhood] = useState<Neighborhood | null>(null);
  const [formData, setFormData] = useState<NeighborhoodFormData>({
    name: '',
    cityId: '',
    countryId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.cityId) return;

    setIsSubmitting(true);
    try {
      if (editingNeighborhood) {
        await updateNeighborhood(editingNeighborhood.id.toString(), formData.name, formData.cityId);
      } else {
        await createNeighborhood(formData.name, formData.cityId);
      }
      
      setIsModalOpen(false);
      setEditingNeighborhood(null);
      setFormData({ name: '', cityId: '', countryId: '' });
    } catch (error) {
      console.error('Error saving neighborhood:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (neighborhood: Neighborhood) => {
    setEditingNeighborhood(neighborhood);
    setFormData({
      name: neighborhood.name,
      cityId: neighborhood.cityId.toString(),
      countryId: ''
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este barrio?')) {
      return;
    }

    try {
      await deleteNeighborhood(id.toString());
    } catch (error) {
      console.error('Error deleting neighborhood:', error);
    }
  };

  // Reset modal
  const openModal = () => {
    setEditingNeighborhood(null);
    setFormData({ name: '', cityId: '', countryId: '' });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNeighborhood(null);
    setFormData({ name: '', cityId: '', countryId: '' });
  };

  // Error alert
  const errorAlert = error && (
    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <div className="flex justify-between items-center">
        <span>{error}</span>
        <button
          onClick={() => setError(null)}
          className="text-red-500 hover:text-red-700"
        >
          ×
        </button>
      </div>
    </div>
  );

  const filteredNeighborhoods = neighborhoods.filter(neighborhood => {
    const city = cities.find(c => c.id === neighborhood.cityId);
    const country = city ? countries.find(c => c.id === city.countryId) : null;
    
    return (
      neighborhood.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (city && city.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (country && country.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

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
          Gestión de Barrios
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Administra los barrios disponibles en el sistema
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
          Nuevo Barrio
        </button>

        <div className="relative">
          <input
            type="text"
            placeholder="Buscar barrios..."
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

      {/* Neighborhoods List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Barrios ({filteredNeighborhoods.length})
          </h2>
        </div>

        {filteredNeighborhoods.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Barrio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ciudad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    País
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
                {filteredNeighborhoods.map((neighborhood) => {
                  const city = cities.find(c => c.id === neighborhood.cityId);
                  const country = city ? countries.find(c => c.id === city.countryId) : null;
                  
                  return (
                    <tr key={neighborhood.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {neighborhood.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {city ? city.name : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {country ? country.name : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {neighborhood.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(neighborhood)}
                            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(Number(neighborhood.id))}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              {searchTerm ? 'No se encontraron barrios' : 'No hay barrios'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando tu primer barrio.'}
            </p>
          </div>
        )}
      </div>

      {/* Modern Popup */}
      <ModernPopup
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingNeighborhood ? 'Editar Barrio' : 'Nuevo Barrio'}
        subtitle={editingNeighborhood ? 'Modifica los datos del barrio' : 'Crea un nuevo barrio en el sistema'}
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
              placeholder="Ej: Villa Morra, San Lorenzo..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Ciudad *
            </label>
            <select
              value={formData.cityId}
              onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              required
            >
              <option value="">🏙️ Seleccionar ciudad</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id.toString()}>
                  {city.name}
                </option>
              ))}
            </select>
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
                  {editingNeighborhood ? 'Actualizar' : 'Crear'}
                </div>
              )}
            </button>
          </div>
        </form>
      </ModernPopup>
    </div>
  );
} 