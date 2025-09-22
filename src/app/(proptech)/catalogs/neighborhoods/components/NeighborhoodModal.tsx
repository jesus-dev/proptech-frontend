import React, { useState, useEffect } from 'react';
import { Neighborhood } from '../types';

interface NeighborhoodModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; cityId: string; countryId: string }) => void;
  neighborhood?: Neighborhood | null;
  cities: unknown[];
  countries: unknown[];
  loading?: boolean;
}

export default function NeighborhoodModal({
  open,
  onClose,
  onSubmit,
  neighborhood,
  cities,
  countries,
  loading = false
}: NeighborhoodModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    cityId: '',
    countryId: ''
  });

  useEffect(() => {
    if (neighborhood) {
      let city: any = cities.find((c: unknown) => typeof c === 'object' && c !== null && 'id' in c && (c as any).id === neighborhood.cityId);
      setFormData({
        name: neighborhood.name,
        cityId: neighborhood.cityId,
        countryId: city && city.countryId ? city.countryId : ''
      });
    } else {
      setFormData({ name: '', cityId: '', countryId: '' });
    }
  }, [neighborhood, cities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.cityId) return;
    onSubmit(formData);
  };

  const getCitiesByCountry = (countryId: string) => {
    return cities.filter(city => (city as any).countryId === countryId);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {neighborhood ? 'Editar Barrio' : 'Nuevo Barrio'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Barrio *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              País *
            </label>
            <select
              value={formData.countryId}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  countryId: e.target.value, 
                  cityId: '' // Reset city when country changes
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Selecciona un país</option>
              {countries.map((country) => (
                <option key={(country as any).id} value={(country as any).id}>
                  {(country as any).name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ciudad *
            </label>
            <select
              value={formData.cityId}
              onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={!formData.countryId}
            >
              <option value="">Selecciona una ciudad</option>
              {formData.countryId && getCitiesByCountry(formData.countryId).map((city) => (
                <option key={(city as any).id} value={(city as any).id}>
                  {(city as any).name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : neighborhood ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 