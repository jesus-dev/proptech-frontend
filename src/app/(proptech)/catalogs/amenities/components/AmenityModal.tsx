import React, { useState, useEffect } from 'react';
import { Amenity } from '../services/amenityService';
import ModernPopup from '@/components/ui/ModernPopup';
import IconSelector from '@/components/ui/IconSelector';
import { Image as ImageIcon } from 'lucide-react';
// Iconos reemplazados con SVG inline para evitar problemas de tipos

interface AmenityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; icon: string }) => Promise<boolean>;
  amenity: Amenity | null;
  loading: boolean;
}

export default function AmenityModal({ open, onClose, onSubmit, amenity, loading }: AmenityModalProps) {
  const [form, setForm] = useState({ name: '', description: '', icon: '' });
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);

  useEffect(() => {
    if (amenity) {
      setForm({ name: amenity.name, description: amenity.description || '', icon: amenity.icon || '' });
    } else {
      setForm({ name: '', description: '', icon: '' });
    }
  }, [amenity, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleIconSelect = (iconName: string) => {
    setForm({ ...form, icon: iconName });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <>
      <ModernPopup
        isOpen={open}
        onClose={onClose}
        title={amenity ? 'Editar Amenidad' : 'Nueva Amenidad'}
        subtitle={amenity ? 'Modifica los datos de la amenidad' : 'Crea una nueva amenidad en el sistema'}
        icon={
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        }
        maxWidth="max-w-md"
        closeOnBackdropClick={!loading}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Ej: Piscina, Gimnasio, Estacionamiento..."
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
              placeholder="Descripción detallada de la amenidad..."
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Icono
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="icon"
                value={form.icon}
                onChange={handleChange}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                placeholder="Nombre del icono (ej: GlassWater, ParkingSquare)"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setIsIconSelectorOpen(true)}
                disabled={loading}
                className="px-4 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50"
                title="Seleccionar icono visualmente"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Escribe el nombre del icono o usa el botón para seleccionar visualmente
            </p>
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
                  {amenity ? 'Actualizar' : 'Crear'}
                </div>
              )}
            </button>
          </div>
        </form>
      </ModernPopup>

      {/* Icon Selector Modal */}
      <IconSelector
        selectedIcon={form.icon}
        onIconSelect={handleIconSelect}
        onClose={() => setIsIconSelectorOpen(false)}
        isOpen={isIconSelectorOpen}
      />
    </>
  );
} 