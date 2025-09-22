"use client";

import React from 'react';
import { Agent } from '../types';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  agent: Agent | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  agent,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Confirmar Eliminación
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            ¿Estás seguro de que quieres eliminar al agente{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {agent.firstName} {agent.lastName}
            </span>
            ?
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Información del agente:
            </p>
            <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
              <li><strong>Email:</strong> {agent.email}</li>
              <li><strong>Teléfono:</strong> {agent.phone}</li>
              {agent.agencyName && (
                <li><strong>Agencia:</strong> {agent.agencyName}</li>
              )}
              {agent.position && (
                <li><strong>Posición:</strong> {agent.position}</li>
              )}
            </ul>
          </div>
          
          <p className="text-xs text-red-600 dark:text-red-400 mt-3">
            Esta acción no se puede deshacer. Todos los datos del agente serán eliminados permanentemente.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                Eliminando...
              </div>
            ) : (
              'Eliminar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 