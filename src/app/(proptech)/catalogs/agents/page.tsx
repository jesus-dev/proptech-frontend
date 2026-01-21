"use client";

import React, { useState, useEffect } from 'react';
import { useAgents } from './hooks/useAgents';
import { AgentFilters as AgentFiltersType } from './types';
import AgentStats from './components/AgentStats';
import AgentFilters from './components/AgentFilters';
import AgentTable from './components/AgentTable';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useRouter } from 'next/navigation';

export default function AgentsPage() {
  const {
    agents,
    filteredAgents,
    agencies,
    stats,
    loading,
    error,
    deleteExistingAgent,
    filterAgents,
    clearError,
  } = useAgents();

  // State for modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<AgentFiltersType>({
    searchTerm: '',
    active: null,
    agencyId: null,
    isActive: null,
    tenantId: null,
  });

  const router = useRouter();

  // Apply filters when they change
  useEffect(() => {
    filterAgents(filters);
  }, [filters, agents]);

  // Handle delete agent
  const handleDelete = (agent: unknown) => {
    setAgentToDelete(agent);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!agentToDelete) return;

    setIsSubmitting(true);
    try {
      const success = await deleteExistingAgent(agentToDelete.id);
      if (success) {
        setIsDeleteModalOpen(false);
        setAgentToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete modal close
  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setAgentToDelete(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Agentes
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Administra los agentes inmobiliarios y su relación con las agencias
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <AgentStats stats={stats} />

      {/* Filters */}
      <AgentFilters
        filters={filters}
        onFiltersChange={setFilters}
        onCreateNew={() => router.push('/catalogs/agents/new')}
        agencies={agencies}
      />

      {/* Table */}
      <AgentTable
        agents={filteredAgents}
        onView={(agent) => router.push(`/catalogs/agents/${agent.id}`)}
        onEdit={(agent) => router.push(`/catalogs/agents/${agent.id}/edit`)}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        agent={agentToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleDeleteModalClose}
        isLoading={isSubmitting}
      />
    </>
  );
} 