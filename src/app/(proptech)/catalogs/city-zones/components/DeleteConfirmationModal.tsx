"use client";

import React from 'react';
import { CityZone } from '../types';
import ModernPopup from '@/components/ui/ModernPopup';
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  cityZone: CityZone | null;
  isDeleting?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  cityZone,
  isDeleting = false
}: DeleteConfirmationModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting city zone:', error);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  return (
    <ModernPopup
      isOpen={isOpen}
      onClose={handleClose}
      title="Eliminar Zona Urbana"
      subtitle="Esta acción no se puede deshacer"
      icon={<ExclamationTriangleIcon className="w-6 h-6 text-white" />}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                ¿Estás seguro de que quieres eliminar esta zona urbana?
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p><strong>Zona:</strong> {cityZone?.name}</p>
                <p><strong>Ciudad:</strong> {cityZone?.cityName}</p>
                <p className="mt-2">
                  Esta acción eliminará permanentemente la zona urbana y no se podrá recuperar.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </ModernPopup>
  );
}
