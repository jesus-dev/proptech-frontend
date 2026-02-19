"use client";

import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { AvailabilitySlot } from '@/services/schedulingService';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

interface Props {
  availabilities: AvailabilitySlot[];
  onChange: (availabilities: AvailabilitySlot[]) => void;
}

export default function AgendaAvailabilityEditor({ availabilities, onChange }: Props) {
  const addSlot = (dayOfWeek: number) => {
    onChange([
      ...availabilities,
      { dayOfWeek, startTime: '09:00', endTime: '17:00', isActive: true }
    ]);
  };

  const removeSlot = (index: number) => {
    onChange(availabilities.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const updated = [...availabilities];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const getSlotsForDay = (dayOfWeek: number) => {
    return availabilities
      .map((slot, index) => ({ ...slot, originalIndex: index }))
      .filter(slot => slot.dayOfWeek === dayOfWeek);
  };

  const toggleDay = (dayOfWeek: number) => {
    const daySlots = getSlotsForDay(dayOfWeek);
    if (daySlots.length > 0) {
      const allActive = daySlots.every(s => s.isActive);
      if (allActive) {
        const updated = [...availabilities];
        daySlots.forEach(s => { updated[s.originalIndex] = { ...updated[s.originalIndex], isActive: false }; });
        onChange(updated);
      } else {
        const updated = [...availabilities];
        daySlots.forEach(s => { updated[s.originalIndex] = { ...updated[s.originalIndex], isActive: true }; });
        onChange(updated);
      }
    } else {
      addSlot(dayOfWeek);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
        Disponibilidad Semanal
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Configura las ventanas horarias en las que se pueden agendar citas
      </p>

      <div className="space-y-2">
        {DAY_NAMES.map((name, dayOfWeek) => {
          const daySlots = getSlotsForDay(dayOfWeek);
          const hasSlots = daySlots.length > 0;
          const allActive = hasSlots && daySlots.every(s => s.isActive);

          return (
            <div key={dayOfWeek} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <div className="flex items-center gap-3">
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDay(dayOfWeek)}
                  className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 relative ${
                    allActive ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                    allActive ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>

                {/* Day name */}
                <span className={`text-sm font-medium w-24 ${
                  allActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {name}
                </span>

                {/* Slots */}
                <div className="flex-1">
                  {daySlots.length === 0 ? (
                    <span className="text-xs text-gray-400">No disponible</span>
                  ) : (
                    <div className="space-y-1.5">
                      {daySlots.map((slot) => (
                        <div key={slot.originalIndex} className="flex items-center gap-2">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={e => updateSlot(slot.originalIndex, 'startTime', e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg 
                              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                              focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            disabled={!slot.isActive}
                          />
                          <span className="text-xs text-gray-400">a</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={e => updateSlot(slot.originalIndex, 'endTime', e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg 
                              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                              focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            disabled={!slot.isActive}
                          />
                          <button
                            type="button"
                            onClick={() => removeSlot(slot.originalIndex)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add slot */}
                {hasSlots && (
                  <button
                    type="button"
                    onClick={() => addSlot(dayOfWeek)}
                    className="p-1 text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded transition-colors flex-shrink-0"
                    title="Agregar horario"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
