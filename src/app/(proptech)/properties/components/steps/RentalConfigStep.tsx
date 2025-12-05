"use client";

import React from "react";
import { Home, DollarSign, Calendar, Users, Info } from "lucide-react";

interface RentalConfigStepProps {
  formData: any;
  onChange: (e: any) => void;
  errors?: Record<string, string>;
}

export default function RentalConfigStep({ formData, onChange, errors }: RentalConfigStepProps) {
  const rentalData = formData.rentalConfig || {};
  
  const handleRentalChange = (field: string, value: any) => {
    console.log(`🔄 RentalConfigStep: handleRentalChange - campo: ${field}, valor:`, value);
    const newValue = {
      ...rentalData,
      [field]: value
    };
    console.log("📦 RentalConfigStep: Nuevo rentalConfig completo:", newValue);
    
    const syntheticEvent = {
      target: {
        name: 'rentalConfig',
        value: newValue
      }
    };
    onChange(syntheticEvent as any);
  };

  const toggleRental = (enabled: boolean) => {
    console.log("🔄 RentalConfigStep: toggleRental llamado con enabled =", enabled);
    const newValue = enabled ? {
      enabled: true,
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
      currency: formData.currency || "PYG",
    } : null;
    
    console.log("📦 RentalConfigStep: Nuevo valor de rentalConfig:", newValue);
    
    const syntheticEvent = {
      target: {
        name: 'rentalConfig',
        value: newValue
      }
    };
    onChange(syntheticEvent as any);
    console.log("✅ RentalConfigStep: onChange llamado con syntheticEvent");
  };

  return (
    <div className="space-y-8">
      {/* Header con toggle */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Alquiler Temporal (Opcional)
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Configura esta propiedad para alquileres de corta duración: hoteles, quintas, granjas, departamentos temporales
            </p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {rentalData?.enabled ? "Activado" : "Desactivado"}
            </span>
            <div className="relative">
              <input
                type="checkbox"
                checked={rentalData?.enabled || false}
                onChange={(e) => toggleRental(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-300 dark:bg-gray-700 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
              <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-md"></div>
            </div>
          </label>
        </div>
      </div>

      {/* Formulario - solo si está activado */}
      {rentalData?.enabled && (
        <div className="space-y-6">
          {/* Tipo de Alquiler */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-600" />
              Tipo de Alquiler
            </label>
            <select
              value={rentalData.rentalType || "APARTMENT"}
              onChange={(e) => handleRentalChange('rentalType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="HOTEL">🏨 Hotel/Hostel</option>
              <option value="APARTMENT">🏢 Departamento</option>
              <option value="QUINTA">🏡 Quinta</option>
              <option value="GRANJA">🌾 Granja/Finca</option>
              <option value="VACATION_HOME">🏖️ Casa Vacacional</option>
              <option value="CABANA">🏕️ Cabaña</option>
              <option value="GLAMPING">⛺ Glamping</option>
              <option value="BNUEB">☕ Bed & Breakfast</option>
              <option value="OTHER">📦 Otro</option>
            </select>
          </div>

          {/* Precios */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Precios
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Precio por Noche * (₲)
                </label>
                <input
                  type="number"
                  required
                  value={rentalData.pricePerNight || ""}
                  onChange={(e) => handleRentalChange('pricePerNight', Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="150000"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Tarifa de Limpieza (₲)
                </label>
                <input
                  type="number"
                  value={rentalData.cleaningFee || ""}
                  onChange={(e) => handleRentalChange('cleaningFee', e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Precio por Semana (₲)
                </label>
                <input
                  type="number"
                  value={rentalData.pricePerWeek || ""}
                  onChange={(e) => handleRentalChange('pricePerWeek', e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="900000"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Precio por Mes (₲)
                </label>
                <input
                  type="number"
                  value={rentalData.pricePerMonth || ""}
                  onChange={(e) => handleRentalChange('pricePerMonth', e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="3000000"
                />
              </div>
            </div>
          </div>

          {/* Restricciones */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              Restricciones de Estadía
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Mínimo de Noches *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={rentalData.minNights || 1}
                  onChange={(e) => handleRentalChange('minNights', Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Máximo de Noches
                </label>
                <input
                  type="number"
                  value={rentalData.maxNights || ""}
                  onChange={(e) => handleRentalChange('maxNights', e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Máximo de Huéspedes *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={rentalData.maxGuests || 2}
                  onChange={(e) => handleRentalChange('maxGuests', Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Horarios de Check-in/Check-out
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Check-in</label>
                <input
                  type="time"
                  value={rentalData.checkInTime || "14:00"}
                  onChange={(e) => handleRentalChange('checkInTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Check-out</label>
                <input
                  type="time"
                  value={rentalData.checkOutTime || "11:00"}
                  onChange={(e) => handleRentalChange('checkOutTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Políticas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Políticas
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Política de Cancelación
                </label>
                <select
                  value={rentalData.cancellationPolicy || "MODERATE"}
                  onChange={(e) => handleRentalChange('cancellationPolicy', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
                >
                  <option value="FLEXIBLE">Flexible - Reembolso hasta 24h antes</option>
                  <option value="MODERATE">Moderada - Reembolso hasta 5 días antes</option>
                  <option value="STRICT">Estricta - Reembolso hasta 14 días antes</option>
                  <option value="SUPER_STRICT">Super Estricta - 30 días antes</option>
                  <option value="NON_REFUNDABLE">No Reembolsable</option>
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={rentalData.instantBooking || false}
                    onChange={(e) => handleRentalChange('instantBooking', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Reserva Instantánea</span>
                </label>
                <label className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={rentalData.petsAllowed || false}
                    onChange={(e) => handleRentalChange('petsAllowed', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">🐕 Mascotas OK</span>
                </label>
                <label className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={rentalData.smokingAllowed || false}
                    onChange={(e) => handleRentalChange('smokingAllowed', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">🚬 Fumar OK</span>
                </label>
                <label className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={rentalData.eventsAllowed || false}
                    onChange={(e) => handleRentalChange('eventsAllowed', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">🎉 Eventos OK</span>
                </label>
              </div>

              {rentalData.petsAllowed && (
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Tarifa por Mascota (₲)
                  </label>
                  <input
                    type="number"
                    value={rentalData.petFee || ""}
                    onChange={(e) => handleRentalChange('petFee', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="30000"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Reglas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Reglas de la Casa (opcional)
            </label>
            <textarea
              value={rentalData.houseRules || ""}
              onChange={(e) => handleRentalChange('houseRules', e.target.value)}
              rows={4}
              placeholder="Ejemplo:&#10;• No fumar en interiores&#10;• Horario de silencio: 22:00 - 08:00&#10;• Dejar la cocina limpia"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Info banner */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-semibold mb-1">💡 Después de guardar:</p>
                <p>Esta propiedad aparecerá en <strong>"Alquileres Temporales"</strong> donde podrás gestionar reservas, ver el calendario de ocupación y más.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje si no está activado */}
      {!rentalData?.enabled && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Alquiler Temporal Desactivado
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Activa el switch arriba si quieres configurar esta propiedad para alquileres de corta duración.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Ideal para: hoteles, quintas, granjas, apartamentos temporales, cabañas, etc.
          </p>
        </div>
      )}
    </div>
  );
}

