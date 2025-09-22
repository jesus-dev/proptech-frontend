"use client";

import React, { useState, useEffect } from 'react';
import { CityZone, CityZoneFormData } from '../types';
import { getAllCities } from '../../cities/services/cityService';
import ModernPopup from '@/components/ui/ModernPopup';
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";

interface CityZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CityZoneFormData) => Promise<boolean>;
  editingCityZone?: CityZone | null;
  title: string;
  subtitle: string;
}

interface City {
  id: number;
  name: string;
  departmentId: number;
}

export default function CityZoneModal({
  isOpen,
  onClose,
  onSubmit,
  editingCityZone,
  title,
  subtitle
}: CityZoneModalProps) {
  const [formData, setFormData] = useState<CityZoneFormData>({
    name: '',
    description: '',
    cityId: '',
    active: true
  });
  const [cities, setCities] = useState<City[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCities();
      if (editingCityZone) {
        setFormData({
          name: editingCityZone.name,
          description: editingCityZone.description || '',
          cityId: editingCityZone.cityId.toString(),
          active: editingCityZone.active
        });
      } else {
        setFormData({
          name: '',
          description: '',
          cityId: '',
          active: true
        });
      }
    }
  }, [isOpen, editingCityZone]);

  const loadCities = async () => {
    try {
      setLoadingCities(true);
      const citiesData = await getAllCities();
      setCities(citiesData);
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.cityId) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <ModernPopup
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      subtitle={subtitle}
      icon={<MapPinIcon className="w-6 h-6 text-white" />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Nombre de la Zona Urbana *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
            placeholder="Ej: Centro, Villa Morra, Carmelitas..."
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
            placeholder="Descripción de la zona urbana..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Ciudad *
          </label>
          {loadingCities ? (
            <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700">
              <span className="text-gray-500">Cargando ciudades...</span>
            </div>
          ) : (
            <select
              required
              value={formData.cityId}
              onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              disabled={isSubmitting}
            >
              <option value="">Seleccionar ciudad</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            disabled={isSubmitting}
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Zona activa
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !formData.name.trim() || !formData.cityId}
          >
            {isSubmitting ? 'Guardando...' : editingCityZone ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </ModernPopup>
  );
}
