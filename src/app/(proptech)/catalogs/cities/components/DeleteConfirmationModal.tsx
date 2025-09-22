import React from 'react';
import { City } from '../services/cityService';

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  city: City | null;
  loading: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  open, 
  onClose, 
  onConfirm, 
  city, 
  loading 
}) => {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  if (!open || !city) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
        <p className="mb-4">
          ¿Estás seguro de que quieres eliminar la ciudad "{city.name}"?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirm} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 