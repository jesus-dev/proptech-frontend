"use client";

import React from 'react';
// Iconos reemplazados con SVG inline para evitar problemas de tipos
import { Agency } from '../types';
import ModernPopup from '@/components/ui/ModernPopup';
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  agency: Agency | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  agency,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  if (!agency) return null;

  return (
    <ModernPopup
      isOpen={isOpen}
      onClose={onCancel}
      title="Confirmar eliminación"
      subtitle="Eliminar agencia del sistema"
      icon={
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      }
      maxWidth="max-w-md"
      closeOnBackdropClick={!isLoading}
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <svg className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              ¿Estás seguro de que quieres eliminar la agencia{' '}
              <strong className="text-red-900 dark:text-red-100">{agency.name}</strong>?
            </p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1">
              Esta acción no se puede deshacer y eliminará permanentemente todos los datos de la agencia.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 border border-transparent rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Eliminando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>🗑️</span>
                Eliminar
              </div>
            )}
          </button>
        </div>
      </div>
    </ModernPopup>
  );
} 