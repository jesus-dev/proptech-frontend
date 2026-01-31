"use client";

import React, { useState, useEffect } from "react";
import { NearbyFacility, FacilityType, FacilityTypeLabels } from "@/app/(proptech)/catalogs/nearby-facilities/types";
import { nearbyFacilityService } from "@/app/(proptech)/catalogs/nearby-facilities/services/nearbyFacilityService";
import { X, Search, MapPin, Plus } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ModernPopup from "@/components/ui/ModernPopup";
import type { AxiosError } from "axios";

interface SelectNearbyFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (facility: NearbyFacility) => void;
  selectedFacilityIds: number[];
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    HOSPITAL: "🏥",
    SCHOOL: "🎓",
    UNIVERSITY: "🎓",
    SHOPPING_CENTER: "🛒",
    SUPERMARKET: "🛒",
    RESTAURANT: "🍽️",
    BANK: "🏦",
    PHARMACY: "💊",
    GYM: "💪",
    PARK: "🌳",
    TRANSPORT_STATION: "🚇",
    GAS_STATION: "⛽",
    OTHER: "📍",
  };
  return icons[type] ?? "📍";
};

export default function SelectNearbyFacilityModal({
  isOpen,
  onClose,
  onSelect,
  selectedFacilityIds,
}: SelectNearbyFacilityModalProps) {
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newFacilityForm, setNewFacilityForm] = useState({
    name: "",
    type: FacilityType.OTHER as FacilityType,
    address: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadFacilities();
    }
  }, [isOpen]);

  const loadFacilities = async () => {
    try {
      setLoading(true);
      const data = await nearbyFacilityService.getActive();
      setFacilities(data ?? []);
    } catch (error) {
      console.error("Error loading facilities:", error);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = facilities.filter((f) => {
    if (selectedFacilityIds.includes(f.id)) return false;
    const term = searchTerm.toLowerCase();
    return (
      f.name?.toLowerCase().includes(term) ||
      (f.address || "").toLowerCase().includes(term) ||
      FacilityTypeLabels[f.type]?.toLowerCase().includes(term)
    );
  });

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacilityForm.name?.trim()) {
      setCreateError("El nombre es requerido.");
      return;
    }
    if (!newFacilityForm.address?.trim()) {
      setCreateError("La dirección es requerida.");
      return;
    }
    try {
      setCreating(true);
      setCreateError(null);
      const created = await nearbyFacilityService.create({
        name: newFacilityForm.name.trim(),
        type: newFacilityForm.type,
        address: newFacilityForm.address.trim(),
        active: true,
      });
      await loadFacilities();
      onSelect(created);
      setShowCreatePopup(false);
      onClose();
      setNewFacilityForm({ name: "", type: FacilityType.OTHER, address: "" });
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      const msg =
        axiosErr?.response?.data?.error ??
        axiosErr?.response?.data?.message ??
        axiosErr?.message ??
        "Error al crear la facilidad.";
      setCreateError(typeof msg === "string" ? msg : "Error al crear la facilidad.");
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        <div className="relative w-[80%] max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Seleccionar Facilidad Cercana
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Elige una del catálogo o crea una nueva
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              type="button"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search + Nuevo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, tipo o dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => setShowCreatePopup(true)}
                className="inline-flex items-center gap-2 px-4 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Nuevo
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredFacilities.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? "No se encontraron facilidades con ese criterio"
                    : "No hay facilidades disponibles"}
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreatePopup(true)}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Agregar nueva facilidad
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredFacilities.map((facility) => (
                  <button
                    key={facility.id}
                    type="button"
                    onClick={() => {
                      onSelect(facility);
                      onClose();
                    }}
                    className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center flex-shrink-0 text-2xl">
                        {getTypeIcon(facility.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {facility.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {FacilityTypeLabels[facility.type]}
                        </p>
                        {facility.address && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{facility.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredFacilities.length} facilidad{filteredFacilities.length !== 1 ? "es" : ""}{" "}
              disponible{filteredFacilities.length !== 1 ? "s" : ""}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Popup crear nueva facilidad (igual que propietarios) */}
      <ModernPopup
        isOpen={showCreatePopup}
        onClose={() => {
          setShowCreatePopup(false);
          setNewFacilityForm({ name: "", type: FacilityType.OTHER, address: "" });
          setCreateError(null);
        }}
        title="Nueva Facilidad Cercana"
        subtitle="Completa los datos. Se agregará al catálogo y a esta propiedad."
        icon={<MapPin className="w-6 h-6 text-white" />}
        maxWidth="max-w-lg"
        closeOnBackdropClick={!creating}
      >
        <form onSubmit={handleCreateFacility} className="space-y-4 p-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              required
              value={newFacilityForm.name}
              onChange={(e) =>
                setNewFacilityForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Hospital San Rafael"
              disabled={creating}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo *
            </label>
            <select
              value={newFacilityForm.type}
              onChange={(e) =>
                setNewFacilityForm((prev) => ({
                  ...prev,
                  type: e.target.value as FacilityType,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
              disabled={creating}
            >
              {Object.entries(FacilityTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dirección *
            </label>
            <input
              type="text"
              required
              value={newFacilityForm.address}
              onChange={(e) =>
                setNewFacilityForm((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
              placeholder="Dirección completa"
              disabled={creating}
            />
          </div>
          {createError && (
            <p className="text-sm text-red-600 dark:text-red-400">{createError}</p>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowCreatePopup(false)}
              disabled={creating}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50"
            >
              {creating ? "Creando..." : "Crear y asociar"}
            </button>
          </div>
        </form>
      </ModernPopup>
    </div>
  );
}
