import React, { useState, useEffect } from 'react';
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { PropertyType, PropertyTypeFormData } from '../services/propertyTypeService';
import ModernPopup from '@/components/ui/ModernPopup';
interface PropertyTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PropertyTypeFormData) => Promise<boolean>;
  initialData?: PropertyType | null;
  loading: boolean;
}

const PropertyTypeModal: React.FC<PropertyTypeModalProps> = ({ open, onClose, onSubmit, initialData, loading }) => {
  const [form, setForm] = useState<PropertyTypeFormData>({ name: '', description: '', active: true });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        active: initialData.active !== false,
      });
    } else {
      setForm({ name: '', description: '', active: true });
    }
    setError(null);
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, active: e.target.checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    const success = await onSubmit(form);
    if (success) {
      onClose();
    }
  };

  return (
    <ModernPopup
      isOpen={open}
      onClose={onClose}
      title={initialData ? 'Editar Tipo de Propiedad' : 'Nuevo Tipo de Propiedad'}
      subtitle={initialData ? 'Modifica los datos del tipo de propiedad' : 'Crea un nuevo tipo de propiedad en el sistema'}
      icon={<BuildingOfficeIcon className="w-6 h-6 text-white" />}
      maxWidth="max-w-md"
      closeOnBackdropClick={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <span className="text-red-600 dark:text-red-400">❌</span>
            <div>
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Nombre *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
            placeholder="Ej: Casa, Apartamento, Terreno..."
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
            rows={3}
            placeholder="Descripción detallada del tipo de propiedad..."
            disabled={loading}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleCheckbox}
            id="active"
            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Activo
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 border border-transparent rounded-xl hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>✅</span>
                {initialData ? 'Actualizar' : 'Crear'}
              </div>
            )}
          </button>
        </div>
      </form>
    </ModernPopup>
  );
};

export default PropertyTypeModal; 