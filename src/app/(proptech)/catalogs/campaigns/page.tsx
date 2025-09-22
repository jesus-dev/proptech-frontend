"use client";

import React, { useEffect, useState } from "react";
import { campaignService } from "./services/campaignService";
import type { Campaign } from "./types";
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UserIcon, 
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MegaphoneIcon
} from "@heroicons/react/24/outline";
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ModernPopup from '@/components/ui/ModernPopup';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await campaignService.getAllCampaigns();
      setCampaigns(data);
    } catch (err) {
      setError("Error al cargar campañas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta campaña?")) return;
    try {
      await campaignService.deleteCampaign(id);
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Error al eliminar la campaña');
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditCampaign(campaign);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditCampaign(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditCampaign(null);
    fetchCampaigns();
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Campañas de Marketing
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Administra las campañas de marketing del sistema
        </p>
      </div>

      {/* Actions and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Nueva Campaña
        </button>

        <div className="relative">
          <input
            type="text"
            placeholder="Buscar campañas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        /* Campaigns List */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Campañas ({filteredCampaigns.length})
            </h2>
          </div>

          {filteredCampaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Costo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {campaign.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {campaign.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${campaign.cost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {campaign.startDate} {campaign.endDate ? `- ${campaign.endDate}` : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {campaign.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                            Inactiva
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(campaign)}
                            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(campaign.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {searchTerm ? 'No se encontraron campañas' : 'No hay campañas'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando tu primera campaña.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modern Popup */}
      {showForm && (
        <ModernPopup
          isOpen={showForm}
          onClose={handleFormClose}
          title={editCampaign ? 'Editar Campaña' : 'Nueva Campaña'}
          subtitle={editCampaign ? 'Modifica los datos de la campaña' : 'Crea una nueva campaña de marketing en el sistema'}
          icon={<MegaphoneIcon className="w-6 h-6 text-white" />}
          maxWidth="max-w-md"
        >
          <CampaignForm campaign={editCampaign} onClose={handleFormClose} />
        </ModernPopup>
      )}
    </div>
  );
}

function CampaignForm({ campaign, onClose }: { campaign: Campaign | null; onClose: () => void }) {
  const isEdit = !!campaign;
  const [form, setForm] = useState<Partial<Campaign>>(
    campaign || {
      name: "",
      type: "facebook",
      cost: 0,
      startDate: "",
      endDate: "",
      notes: "",
      active: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit && campaign) {
        await campaignService.updateCampaign(campaign.id, form);
      } else {
        await campaignService.createCampaign(form as any);
      }
      onClose();
    } catch (err) {
      setError("Error al guardar la campaña");
    } finally {
      setSaving(false);
    }
  };

  return (
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
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
          placeholder="Ej: Campaña de Facebook Q1 2024"
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Tipo *
        </label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
        >
          <option value="facebook">Facebook</option>
          <option value="google">Google</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="referido">Referido</option>
          <option value="otro">Otro</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Costo (USD)
        </label>
        <input
          type="number"
          name="cost"
          value={form.cost}
          onChange={handleChange}
          min={0}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
          placeholder="0"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Fecha inicio
          </label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Fecha fin
          </label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Notas
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
          placeholder="Descripción de la campaña..."
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          name="active"
          checked={form.active}
          onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
          id="active"
          className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Campaña activa
        </label>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all duration-200"
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 border border-transparent rounded-xl hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {saving ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>✅</span>
              {isEdit ? 'Actualizar' : 'Crear'}
            </div>
          )}
        </button>
      </div>
    </form>
  );
} 