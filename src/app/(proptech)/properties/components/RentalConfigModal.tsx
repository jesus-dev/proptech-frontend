"use client";

import React, { useState } from "react";
import { XMarkIcon, HomeIcon, CurrencyDollarIcon, CalendarIcon, UserGroupIcon } from "@heroicons/react/24/outline";

interface RentalConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: number;
    title: string;
    address?: string;
  };
  onSave: (config: RentalConfig) => Promise<void>;
}

export interface RentalConfig {
  propertyId: number;
  pricePerNight: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  cleaningFee?: number;
  minNights: number;
  maxNights?: number;
  maxGuests: number;
  checkInTime: string;
  checkOutTime: string;
  instantBooking: boolean;
  rentalType: string;
  petsAllowed: boolean;
  petFee?: number;
  smokingAllowed: boolean;
  eventsAllowed: boolean;
  wifiAvailable: boolean;
  houseRules?: string;
  cancellationPolicy: string;
  currency: string;
}

export default function RentalConfigModal({ isOpen, onClose, property, onSave }: RentalConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RentalConfig>({
    propertyId: property.id,
    pricePerNight: 150000,
    cleaningFee: 50000,
    minNights: 1,
    maxNights: 30,
    maxGuests: 2,
    checkInTime: "14:00",
    checkOutTime: "11:00",
    instantBooking: false,
    rentalType: "APARTMENT",
    petsAllowed: false,
    smokingAllowed: false,
    eventsAllowed: false,
    wifiAvailable: true,
    cancellationPolicy: "MODERATE",
    currency: "PYG",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving rental config:", error);
      alert("Error al configurar la propiedad para alquiler");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[80%] max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HomeIcon className="w-7 h-7 text-blue-600" />
              Configurar Alquiler Temporal
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{property.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Tipo de Alquiler */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <HomeIcon className="w-5 h-5 text-blue-600" />
              Tipo de Alquiler
            </h3>
            <select
              value={formData.rentalType}
              onChange={(e) => setFormData({ ...formData, rentalType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="HOTEL">Hotel/Hostel</option>
              <option value="APARTMENT">Departamento</option>
              <option value="QUINTA">Quinta</option>
              <option value="GRANJA">Granja/Finca</option>
              <option value="VACATION_HOME">Casa Vacacional</option>
              <option value="CABANA">Cabaña</option>
              <option value="GLAMPING">Glamping</option>
              <option value="BNUEB">Bed & Breakfast</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          {/* Precios */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
              Precios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio por Noche *
                </label>
                <input
                  type="number"
                  required
                  value={formData.pricePerNight}
                  onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio por Semana (opcional)
                </label>
                <input
                  type="number"
                  value={formData.pricePerWeek || ""}
                  onChange={(e) => setFormData({ ...formData, pricePerWeek: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio por Mes (opcional)
                </label>
                <input
                  type="number"
                  value={formData.pricePerMonth || ""}
                  onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tarifa de Limpieza
                </label>
                <input
                  type="number"
                  value={formData.cleaningFee || ""}
                  onChange={(e) => setFormData({ ...formData, cleaningFee: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Restricciones */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-600" />
              Restricciones de Estadía
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mínimo de Noches *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.minNights}
                  onChange={(e) => setFormData({ ...formData, minNights: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Máximo de Noches
                </label>
                <input
                  type="number"
                  value={formData.maxNights || ""}
                  onChange={(e) => setFormData({ ...formData, maxNights: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Máximo de Huéspedes *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.maxGuests}
                  onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Horarios de Check-in/Check-out
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check-in
                </label>
                <input
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check-out
                </label>
                <input
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Políticas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Políticas
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Política de Cancelación
                </label>
                <select
                  value={formData.cancellationPolicy}
                  onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
                >
                  <option value="FLEXIBLE">Flexible - Reembolso hasta 24h antes</option>
                  <option value="MODERATE">Moderada - Reembolso hasta 5 días antes</option>
                  <option value="STRICT">Estricta - Reembolso hasta 14 días antes</option>
                  <option value="SUPER_STRICT">Super Estricta - Reembolso hasta 30 días antes</option>
                  <option value="NON_REFUNDABLE">No Reembolsable</option>
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.instantBooking}
                    onChange={(e) => setFormData({ ...formData, instantBooking: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Reserva Instantánea</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.petsAllowed}
                    onChange={(e) => setFormData({ ...formData, petsAllowed: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mascotas Permitidas</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.smokingAllowed}
                    onChange={(e) => setFormData({ ...formData, smokingAllowed: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Fumar Permitido</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.eventsAllowed}
                    onChange={(e) => setFormData({ ...formData, eventsAllowed: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Eventos Permitidos</span>
                </label>
              </div>

              {formData.petsAllowed && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tarifa por Mascota (opcional)
                  </label>
                  <input
                    type="number"
                    value={formData.petFee || ""}
                    onChange={(e) => setFormData({ ...formData, petFee: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="30000"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Reglas de la Casa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reglas de la Casa (opcional)
            </label>
            <textarea
              value={formData.houseRules || ""}
              onChange={(e) => setFormData({ ...formData, houseRules: e.target.value })}
              rows={4}
              placeholder="Ejemplo:&#10;- No fumar en interiores&#10;- Horario de silencio: 22:00 - 08:00&#10;- No fiestas&#10;- Dejar la cocina limpia"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Resumen */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              📋 Resumen de Configuración
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-700 dark:text-blue-300">Precio por noche:</span>
                <span className="ml-2 font-semibold text-blue-900 dark:text-blue-100">
                  {new Intl.NumberFormat('es-PY', { style: 'currency', currency: formData.currency, minimumFractionDigits: 0 }).format(formData.pricePerNight)}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Estadía mínima:</span>
                <span className="ml-2 font-semibold text-blue-900 dark:text-blue-100">
                  {formData.minNights} {formData.minNights === 1 ? 'noche' : 'noches'}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Capacidad:</span>
                <span className="ml-2 font-semibold text-blue-900 dark:text-blue-100">
                  {formData.maxGuests} huéspedes
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Tipo:</span>
                <span className="ml-2 font-semibold text-blue-900 dark:text-blue-100">
                  {formData.rentalType}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? "Guardando..." : "Configurar Alquiler"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

