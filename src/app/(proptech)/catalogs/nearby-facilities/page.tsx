"use client";

import React, { useState } from 'react';
import { MapPinIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useNearbyFacilities } from './hooks/useNearbyFacilities';
import { NearbyFacility, NearbyFacilityFormData, FacilityTypeLabels } from './types';
import NearbyFacilityModal from './components/NearbyFacilityModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function NearbyFacilitiesPage() {
  const {
    facilities,
    loading,
    error,
    createFacility,
    updateFacility,
    deleteFacility,
    toggleActive,
    clearError
  } = useNearbyFacilities();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<NearbyFacility | null>(null);
  const [facilityToDelete, setFacilityToDelete] = useState<NearbyFacility | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFacilities = facilities.filter((facility) =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingFacility(null);
    setIsModalOpen(true);
  };

  const handleEdit = (facility: NearbyFacility) => {
    setEditingFacility(facility);
    setIsModalOpen(true);
  };

  const handleDelete = (facility: NearbyFacility) => {
    setFacilityToDelete(facility);
    setIsDeleteModalOpen(true);
  };

  const handleModalSubmit = async (data: NearbyFacilityFormData): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      let success: boolean;
      if (editingFacility) {
        success = await updateFacility(editingFacility.id, data);
      } else {
        success = await createFacility(data);
      }
      return success;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!facilityToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deleteFacility(facilityToDelete.id);
      if (success) {
        setIsDeleteModalOpen(false);
        setFacilityToDelete(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (facility: NearbyFacility) => {
    await toggleActive(facility.id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFacility(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setFacilityToDelete(null);
  };

  // Error alert
  const errorAlert = error && (
    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <div className="flex justify-between items-center">
        <span>{error}</span>
        <button
          onClick={clearError}
          className="text-red-500 hover:text-red-700"
        >
          ×
        </button>
      </div>
    </div>
  );

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
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <MapPinIcon className="h-8 w-8 text-orange-600 mr-3" />
          Facilidades Cercanas
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Gestiona las facilidades cercanas que pueden estar asociadas a las propiedades
        </p>
      </div>

      {errorAlert}

      {/* Actions and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Nueva facilidad
        </button>

        <div className="relative">
          <input
            type="text"
            placeholder="Buscar facilidades..."
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

      {/* Facilities List - mismo estilo que departamentos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Facilidades Cercanas ({filteredFacilities.length})
          </h2>
        </div>

        {filteredFacilities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Facilidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
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
                {filteredFacilities.map((facility) => (
                  <tr key={facility.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {facility.name}
                      </div>
                      {facility.address && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {facility.address}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {FacilityTypeLabels[facility.type]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        onClick={() => handleToggleActive(facility)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                          facility.active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {facility.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {facility.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(facility)}
                          className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(facility)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="w-4 h-4" />
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
            <div className="text-gray-500 dark:text-gray-400">
              {searchTerm
                ? 'No se encontraron facilidades que coincidan con la búsqueda.'
                : 'No hay facilidades registradas.'}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NearbyFacilityModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        facility={editingFacility}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        facility={facilityToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
