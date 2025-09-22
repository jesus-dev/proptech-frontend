"use client";

import React, { useState, useEffect } from 'react';
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useNearbyFacilities } from './hooks/useNearbyFacilities';
import { NearbyFacility, NearbyFacilityFormData, NearbyFacilityFilters } from './types';
import NearbyFacilityModal from './components/NearbyFacilityModal';
import NearbyFacilityTable from './components/NearbyFacilityTable';
import NearbyFacilityFiltersComponent from './components/NearbyFacilityFilters';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function NearbyFacilitiesPage() {
  const {
    facilities,
    filteredFacilities,
    types,
    loading,
    error,
    stats,
    filterFacilities,
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
  const [filters, setFilters] = useState<NearbyFacilityFilters>({
    searchTerm: '',
    type: undefined,
    active: undefined
  });

  // Aplicar filtros cuando cambien
  useEffect(() => {
    filterFacilities(filters);
  }, [filters, filterFacilities]);

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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MapPinIcon className="h-8 w-8 text-orange-600 mr-3" />
              Facilidades Cercanas
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona las facilidades cercanas que pueden estar asociadas a las propiedades
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Facilidad
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorAlert}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPinIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Facilidades
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Activas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.active}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-red-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Inactivas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.inactive}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tipos Diferentes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {Object.keys(stats.byType).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <NearbyFacilityFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        types={types}
      />

      {/* Table */}
      <div className="bg-white shadow rounded-lg">
        <NearbyFacilityTable
          facilities={filteredFacilities}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
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
