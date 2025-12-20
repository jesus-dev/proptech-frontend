"use client";

import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AppointmentSchedulerProps {
  selectedDate?: string;
  selectedTime?: string;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  minDate?: Date;
  maxDate?: Date;
  availableTimeSlots?: string[];
  disabledDates?: string[];
  bookedAppointments?: Array<{ date: string; time: string }>; // Citas ocupadas
}

// Generar horarios disponibles según el día de la semana
// Lunes a viernes: 8:00 AM a 5:00 PM
// Sábados: 8:00 AM a 1:30 PM
// Domingos: sin horarios disponibles
const generateTimeSlotsForDay = (dayOfWeek: number): string[] => {
  const slots: string[] = [];
  
  // Domingo (0) - sin horarios
  if (dayOfWeek === 0) {
    return [];
  }
  
  // Sábado (6) - hasta las 13:30
  if (dayOfWeek === 6) {
    for (let hour = 8; hour < 13; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    // Agregar el último slot de las 13:30
    slots.push('13:30');
    return slots;
  }
  
  // Lunes a viernes (1-5) - 8:00 AM a 5:00 PM
  for (let hour = 8; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  // Agregar el último slot de las 17:00
  slots.push('17:00');
  
  return slots;
};

// Nombres de los días de la semana
const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function AppointmentScheduler({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  minDate = new Date(),
  maxDate,
  availableTimeSlots = [],
  disabledDates = [],
  bookedAppointments = []
}: AppointmentSchedulerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  // Calcular días del mes
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isDisabled: boolean }> = [];
    
    // Días del mes anterior (para completar la primera semana)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: true
      });
    }
    
    // Días del mes actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // Generar dateString de forma consistente (YYYY-MM-DD)
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate === dateString;
      const isSunday = dayOfWeek === 0; // Deshabilitar domingos
      
      // Verificar si la fecha está completamente ocupada
      const appointmentsForDate = bookedAppointments.filter(apt => apt.date === dateString);
      const daySlots = generateTimeSlotsForDay(dayOfWeek);
      const isFullyBooked = daySlots.length > 0 && appointmentsForDate.length >= daySlots.length;
      
      const isDisabled = 
        date < minDate ||
        (maxDate && date > maxDate) ||
        disabledDates.includes(dateString) ||
        date < today ||
        isSunday || // Deshabilitar domingos
        isFullyBooked; // Deshabilitar si está completamente ocupada
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isDisabled
      });
    }
    
    // Días del mes siguiente (para completar la última semana)
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: true
      });
    }
    
    return days;
  }, [currentMonth, selectedDate, minDate, maxDate, disabledDates, bookedAppointments]);

  const handleDateClick = (date: Date) => {
    // Generar dateString de forma consistente (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();
    const isSunday = dayOfWeek === 0;
    
    if (date >= today && date >= minDate && (!maxDate || date <= maxDate) && !isSunday) {
      onDateSelect(dateString);
      setShowTimeSlots(true);
    }
  };

  const handleTimeClick = (time: string) => {
    onTimeSelect(time);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Generar horarios disponibles según el día seleccionado (filtrando los ocupados)
  const timeSlotsForSelectedDate = useMemo(() => {
    if (!selectedDate) {
      return [];
    }
    // Parsear la fecha correctamente para evitar problemas de zona horaria
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    
    // Obtener todos los horarios posibles para este día
    const allSlots = generateTimeSlotsForDay(dayOfWeek);
    
    // Filtrar horarios ocupados
    const bookedTimesForDate = bookedAppointments
      .filter(apt => apt.date === selectedDate)
      .map(apt => apt.time);
    
    // Retornar solo los horarios disponibles (no ocupados)
    return allSlots.filter(slot => !bookedTimesForDate.includes(slot));
  }, [selectedDate, bookedAppointments]);

  // Agrupar horarios por hora para mejor visualización
  const groupedTimeSlots = useMemo(() => {
    const slots = selectedDate ? timeSlotsForSelectedDate : availableTimeSlots;
    const grouped: { [key: number]: string[] } = {};
    slots.forEach(slot => {
      const hour = parseInt(slot.split(':')[0]);
      if (!grouped[hour]) {
        grouped[hour] = [];
      }
      grouped[hour].push(slot);
    });
    return grouped;
  }, [selectedDate, timeSlotsForSelectedDate, availableTimeSlots]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendario */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          {/* Header del calendario */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Mes anterior"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            
            <h3 className="text-xl font-bold text-gray-900">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Mes siguiente"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const year = day.date.getFullYear();
              const month = day.date.getMonth();
              const dayNum = day.date.getDate();
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isClickable = day.isCurrentMonth && !day.isDisabled;
              
              // Verificar si está completamente ocupada
              const appointmentsForDate = bookedAppointments.filter(apt => apt.date === dateString);
              const dayOfWeek = day.date.getDay();
              const daySlots = generateTimeSlotsForDay(dayOfWeek);
              const isFullyBooked = daySlots.length > 0 && appointmentsForDate.length >= daySlots.length;
              
              return (
                <button
                  key={`${dateString}-${index}`}
                  type="button"
                  onClick={() => handleDateClick(day.date)}
                  disabled={!isClickable}
                  className={`
                    aspect-square rounded-lg text-sm font-medium transition-all duration-200 relative
                    ${!day.isCurrentMonth 
                      ? 'text-gray-300 cursor-default' 
                      : day.isDisabled
                      ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                      : day.isSelected
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
                      : day.isToday
                      ? 'bg-cyan-100 text-cyan-700 font-bold border-2 border-cyan-400'
                      : 'text-gray-700 bg-gray-50 hover:bg-cyan-50 hover:text-cyan-700 hover:scale-105'
                    }
                    ${isFullyBooked && day.isCurrentMonth && !day.isDisabled ? 'opacity-50' : ''}
                  `}
                  title={isFullyBooked ? 'Fecha completamente ocupada' : ''}
                >
                  {day.date.getDate()}
                  {isFullyBooked && day.isCurrentMonth && !day.isDisabled && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-gray-400 transform rotate-45"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-cyan-100 border-2 border-cyan-400"></div>
              <span>Hoy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-cyan-500 to-blue-600"></div>
              <span>Seleccionado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-50"></div>
              <span>Disponible</span>
            </div>
          </div>
        </div>

        {/* Horarios disponibles */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <ClockIcon className="w-6 h-6 text-cyan-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Horarios Disponibles
            </h3>
          </div>

          {!selectedDate ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">Selecciona una fecha para ver los horarios disponibles</p>
              </div>
            </div>
          ) : timeSlotsForSelectedDate.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm font-semibold mb-1">No hay horarios disponibles</p>
                <p className="text-xs text-gray-400">Los domingos no están disponibles para agendar citas</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Fecha seleccionada:
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedDate).toLocaleDateString('es-PY', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(groupedTimeSlots)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([hour, slots]) => {
                      const hourNum = parseInt(hour);
                      const period = hourNum >= 12 ? 'Tarde' : 'Mañana';
                      const periodColor = hourNum >= 12 ? 'text-orange-600' : 'text-cyan-600';
                      
                      return (
                        <div key={hour} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className={`h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent`}></div>
                            <h4 className={`text-xs font-bold ${periodColor} uppercase tracking-wider px-2`}>
                              {period}
                            </h4>
                            <div className={`h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent`}></div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2.5">
                            {slots.map(time => {
                              const isSelected = selectedTime === time;
                              return (
                                <motion.button
                                  key={time}
                                  type="button"
                                  onClick={() => handleTimeClick(time)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`
                                    px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                    border-2 relative overflow-hidden
                                    ${isSelected
                                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-cyan-600 shadow-lg shadow-cyan-500/30'
                                      : 'bg-white text-gray-700 border-gray-200 hover:border-cyan-400 hover:bg-gradient-to-br hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-700 hover:shadow-md'
                                    }
                                  `}
                                >
                                  <div className="flex items-center justify-center gap-1.5 relative z-10">
                                    {isSelected && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                      >
                                        <CheckCircleIcon className="w-4 h-4" />
                                      </motion.div>
                                    )}
                                    <span className="font-semibold">{formatTime(time)}</span>
                                  </div>
                                  {isSelected && (
                                    <motion.div
                                      className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                    />
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border-2 border-cyan-200"
                  >
                    <div className="flex items-center gap-2 text-cyan-700">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="font-semibold">
                        Cita seleccionada: {formatTime(selectedTime)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

