"use client";

import React, { useState, useEffect } from 'react';
import { Agency, AgencyFilters } from './types';
import { useAgencies } from './hooks/useAgencies';
import AgencyStats from './components/AgencyStats';
import AgencyFiltersComponent from './components/AgencyFilters';
import AgencyTable from './components/AgencyTable';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import { LoadingHouse } from '@/components/common/LoadingSpinner';
import { useRouter } from 'next/navigation';

export default function AgenciesPage() {
  // Custom hook for agency management
  const {
    agencies,
    filteredAgencies,
    stats,
    loading,
    error,
    initializeSampleData,
    clearAllData,
    deleteExistingAgency,
    filterAgencies,
    clearError,
  } = useAgencies();

  // Local state
  const [filters, setFilters] = useState<AgencyFilters>({
    searchTerm: '',
    active: null,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState<Agency | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  // Apply filters when they change
  useEffect(() => {
    filterAgencies(filters);
  }, [filters, filterAgencies]);

  // Handle delete
  const handleDelete = (agency: Agency) => {
    setAgencyToDelete(agency);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!agencyToDelete) return;

    setIsSubmitting(true);
    try {
      const success = await deleteExistingAgency(agencyToDelete.id);
      if (success) {
        setIsDeleteModalOpen(false);
        setAgencyToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting agency:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setAgencyToDelete(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <LoadingHouse size={64} color="#2563eb" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white text-gradient mb-4">
            Gestión de Agencias
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
            Administra las agencias inmobiliarias
          </p>
        </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-8 card-modern p-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 mr-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <span className="font-medium text-red-800 dark:text-red-300">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <AgencyStats stats={stats} />

      {/* Filters and Actions */}
      <AgencyFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onCreateNew={() => router.push('/catalogs/agencies/new')}
        onGenerateSample={initializeSampleData}
        onClearData={clearAllData}
        hasData={agencies.length > 0}
      />

      {/* Agencies Table */}
      <AgencyTable
        agencies={filteredAgencies}
        onView={(agency) => router.push(`/catalogs/agencies/${agency.id}`)}
        onEdit={(agency) => router.push(`/catalogs/agencies/${agency.id}/edit`)}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        agency={agencyToDelete}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        isLoading={isSubmitting}
      />
      </div>
    </div>
  );
} 