"use client";

import React, { useState, useMemo } from 'react';
import { CityZone, CityZoneFormData } from './types';
import { useCityZones } from './hooks/useCityZones';
import CityZoneModal from './components/CityZoneModal';
import CityZoneTable from './components/CityZoneTable';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import { Plus as PlusIcon, MapPin as MapPinIcon, Search as MagnifyingGlassIcon, AlertTriangle as ExclamationTriangleIcon } from 'lucide-react';

export default function CityZonesPage() {
  const { cityZones, loading, error, create, update, remove } = useCityZones();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCityZone, setEditingCityZone] = useState<CityZone | null>(null);
  const [cityZoneToDelete, setCityZoneToDelete] = useState<CityZone | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtrar zonas urbanas por término de búsqueda
  const filteredCityZones = useMemo(() => {
    if (!searchTerm.trim()) return cityZones;
    
    const term = searchTerm.toLowerCase();
    return cityZones.filter(zone => 
      zone.name.toLowerCase().includes(term) ||
      zone.cityName?.toLowerCase().includes(term) ||
      zone.description?.toLowerCase().includes(term)
    );
  }, [cityZones, searchTerm]);

  const handleCreate = () => {
    setEditingCityZone(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cityZone: CityZone) => {
    setEditingCityZone(cityZone);
    setIsModalOpen(true);
  };

  const handleDelete = (cityZone: CityZone) => {
    setCityZoneToDelete(cityZone);
    setIsDeleteModalOpen(true);
  };

  const handleModalSubmit = async (data: CityZoneFormData): Promise<boolean> => {
    if (editingCityZone) {
      return await update(editingCityZone.id, data);
    } else {
      return await create(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!cityZoneToDelete) return;
    
    setIsDeleting(true);
    try {
      await remove(cityZoneToDelete.id);
      setIsDeleteModalOpen(false);
      setCityZoneToDelete(null);
    } catch (error) {
      console.error('Error deleting city zone:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCityZone(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCityZoneToDelete(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error al cargar las zonas urbanas
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <MapPinIcon className="w-8 h-8 text-brand-600 mr-3" />
                Zonas Urbanas
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Gestiona las zonas urbanas para organizar mejor las propiedades por ubicación
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-sm"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nueva Zona Urbana
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar zonas urbanas por nombre, ciudad o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-brand-100 dark:bg-brand-900/20 rounded-lg">
                <MapPinIcon className="w-6 h-6 text-brand-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Zonas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cityZones.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <MapPinIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Zonas Activas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cityZones.filter(zone => zone.active).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <MapPinIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resultados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredCityZones.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <CityZoneTable
          cityZones={filteredCityZones}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />

        {/* Modals */}
        <CityZoneModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
          editingCityZone={editingCityZone}
          title={editingCityZone ? 'Editar Zona Urbana' : 'Nueva Zona Urbana'}
          subtitle={editingCityZone ? 'Modifica los datos de la zona urbana' : 'Crea una nueva zona urbana en el sistema'}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          cityZone={cityZoneToDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
