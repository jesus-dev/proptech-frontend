"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  GlobeAltIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { publicSchedulingService, PublicAgenda, AvailableSlot, Booking } from '@/services/schedulingService';

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

type Step = 'calendar' | 'form' | 'confirmation';

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function formatDateLong(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-PY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function AgendarPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [agenda, setAgenda] = useState<PublicAgenda | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('calendar');

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableDatesSet, setAvailableDatesSet] = useState<Set<string>>(new Set());
  const [loadingDates, setLoadingDates] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadAgenda();
  }, [slug]);

  useEffect(() => {
    if (selectedDate && slug) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (agenda && slug) {
      loadAvailableDates();
    }
  }, [currentMonth, agenda]);

  const loadAgenda = async () => {
    try {
      setLoading(true);
      const data = await publicSchedulingService.getAgenda(slug);
      setAgenda(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Agenda no encontrada');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDates = async () => {
    try {
      setLoadingDates(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const dates = await publicSchedulingService.getAvailableDates(slug, from, to);
      setAvailableDatesSet(new Set(dates));
    } catch {
      setAvailableDatesSet(new Set());
    } finally {
      setLoadingDates(false);
    }
  };

  const loadAvailableSlots = async (date: string) => {
    try {
      setLoadingSlots(true);
      const slots = await publicSchedulingService.getAvailableSlots(slug, date);
      setAvailableSlots(slots);
    } catch {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const goToForm = () => {
    if (selectedDate && selectedTime) {
      setStep('form');
    }
  };

  const goBackToCalendar = () => {
    setStep('calendar');
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.clientName.trim()) errors.clientName = 'El nombre es requerido';
    if (!formData.clientPhone.trim()) errors.clientPhone = 'El teléfono es requerido';
    if (formData.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      errors.clientEmail = 'Email inválido';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const result = await publicSchedulingService.createBooking(slug, {
        date: selectedDate,
        time: selectedTime,
        clientName: formData.clientName.trim(),
        clientEmail: formData.clientEmail.trim() || undefined,
        clientPhone: formData.clientPhone.trim(),
        notes: formData.notes.trim() || undefined
      });
      setBooking(result);
      setStep('confirmation');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al crear la reserva';
      setFormErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days: Array<{
      date: Date; dateStr: string; isCurrentMonth: boolean;
      isToday: boolean; isSelected: boolean; isDisabled: boolean;
      hasAvailability: boolean;
    }> = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = agenda ? new Date(today.getTime() + (agenda.maxAdvanceDays * 24 * 60 * 60 * 1000)) : undefined;

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date, dateStr: '', isCurrentMonth: false, isToday: false, isSelected: false, isDisabled: true, hasAvailability: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate === dateStr;
      const isPast = date < today;
      const isBeyondMax = maxDate ? date > maxDate : false;
      const hasAvailability = availableDatesSet.has(dateStr);
      const isDisabled = isPast || isBeyondMax || !hasAvailability;

      days.push({
        date, dateStr, isCurrentMonth: true, isToday, isSelected,
        isDisabled, hasAvailability
      });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, dateStr: '', isCurrentMonth: false, isToday: false, isSelected: false, isDisabled: true, hasAvailability: false });
    }

    return days;
  }, [currentMonth, selectedDate, agenda, availableDatesSet]);

  const groupedSlots = useMemo(() => {
    const grouped: Record<string, AvailableSlot[]> = {};
    availableSlots.filter(s => s.available).forEach(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      const period = hour < 12 ? 'Mañana' : hour < 18 ? 'Tarde' : 'Noche';
      if (!grouped[period]) grouped[period] = [];
      grouped[period].push(slot);
    });
    Object.values(grouped).forEach(slots => slots.sort((a, b) => a.time.localeCompare(b.time)));
    return grouped;
  }, [availableSlots]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando agenda...</p>
        </div>
      </div>
    );
  }

  if (error || !agenda) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center max-w-md mx-auto px-6">
          <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Agenda no encontrada</h1>
          <p className="text-gray-600">{error || 'La agenda solicitada no existe o no está activa.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 min-h-[35vh] sm:min-h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="agenda-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="none" stroke="cyan" strokeWidth="0.5" opacity="0.3"/>
                <rect x="10" y="10" width="60" height="45" fill="none" stroke="cyan" strokeWidth="0.3" opacity="0.4" rx="2"/>
                <circle cx="20" cy="25" r="3" fill="cyan" opacity="0.3"/>
                <circle cx="35" cy="30" r="2" fill="cyan" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#agenda-grid)" />
          </svg>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-300/20 rounded-full blur-xl animate-bounce" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-12 sm:pt-16 pb-6 sm:pb-8 w-full z-10">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight"
            >
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                {agenda.name}
              </span>
            </motion.h1>
            {agenda.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg sm:text-xl text-cyan-100 max-w-3xl mx-auto mb-6 px-4"
              >
                {agenda.description}
              </motion.p>
            )}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-sm text-cyan-200/70"
            >
              Selecciona una fecha y hora para agendar tu cita
            </motion.p>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 ${agenda.location || (agenda.maxBookingsPerSlot && agenda.maxBookingsPerSlot > 1) ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Duración</h3>
                <p className="text-sm text-gray-600">{agenda.defaultDuration} minutos</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CalendarDaysIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Disponibilidad</h3>
                <p className="text-sm text-gray-600">Hasta {agenda.maxAdvanceDays} días de anticipación</p>
              </div>
            </motion.div>

            {agenda.location && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="group flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPinIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ubicación</h3>
                  <p className="text-sm text-gray-600">{agenda.location}</p>
                </div>
              </motion.div>
            )}

            {agenda.maxBookingsPerSlot && agenda.maxBookingsPerSlot > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="group flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UsersIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Sesión Grupal</h3>
                  <p className="text-sm text-gray-600">Hasta {agenda.maxBookingsPerSlot} personas por horario</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {['Fecha y hora', 'Datos', 'Confirmación'].map((label, idx) => {
              const stepIdx = idx === 0 ? 'calendar' : idx === 1 ? 'form' : 'confirmation';
              const isActive = step === stepIdx;
              const isDone = (step === 'form' && idx === 0) || (step === 'confirmation' && idx <= 1);
              return (
                <div key={label} className="flex items-center gap-2">
                  {idx > 0 && <div className={`w-8 sm:w-12 h-0.5 ${isDone ? 'bg-cyan-500' : 'bg-gray-300'}`} />}
                  <div className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    isActive ? 'bg-cyan-100 text-cyan-700 ring-2 ring-cyan-300' :
                    isDone ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isDone && !isActive ? <CheckCircleIcon className="w-4 h-4" /> : null}
                    {label}
                  </div>
                </div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Calendar + Time */}
            {step === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Calendar */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 relative">
                  {loadingDates && (
                    <div className="absolute inset-0 bg-white/60 rounded-3xl z-10 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-6">
                    <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                      className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                      <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <h3 className="text-xl font-bold text-gray-900">
                      {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                      className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                      <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS_OF_WEEK.map(day => (
                      <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarDays.map((day, index) => {
                      const canSelect = day.isCurrentMonth && !day.isDisabled;
                      const isAvailable = day.isCurrentMonth && day.hasAvailability && !day.isDisabled;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => canSelect && handleDateSelect(day.dateStr)}
                          disabled={!canSelect}
                          className={`
                            aspect-square rounded-xl text-sm transition-all duration-200 flex items-center justify-center
                            ${!day.isCurrentMonth
                              ? 'text-gray-200 cursor-default'
                              : day.isSelected
                                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold shadow-lg scale-110 ring-2 ring-cyan-300'
                              : isAvailable
                                ? day.isToday
                                  ? 'bg-cyan-100 text-cyan-800 font-extrabold ring-2 ring-cyan-400 hover:bg-cyan-200 cursor-pointer'
                                  : 'bg-cyan-50 text-cyan-800 font-semibold border border-cyan-200 hover:bg-cyan-100 hover:scale-105 cursor-pointer'
                              : day.isCurrentMonth
                                ? 'text-gray-300 bg-gray-50/80 cursor-not-allowed'
                                : 'text-gray-200 cursor-default'
                            }
                          `}
                        >
                          {day.date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-50 border border-cyan-200 inline-block" />
                      Disponible
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-200 inline-block" />
                      No disponible
                    </span>
                  </div>
                </div>

                {/* Time Slots */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 flex flex-col">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Horarios Disponibles</h3>
                  </div>

                  {!selectedDate ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <CalendarIcon className="w-14 h-14 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">Selecciona una fecha</p>
                        <p className="text-xs text-gray-400 mt-1">para ver los horarios disponibles</p>
                      </div>
                    </div>
                  ) : loadingSlots ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : availableSlots.filter(s => s.available).length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <ClockIcon className="w-14 h-14 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">No hay horarios disponibles</p>
                        <p className="text-xs text-gray-400 mt-1">Prueba con otra fecha</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto max-h-[400px] pr-1">
                      <p className="text-sm text-gray-600 mb-4 font-medium capitalize">{formatDateLong(selectedDate)}</p>
                      {Object.entries(groupedSlots).map(([period, slots]) => (
                        <div key={period} className="mb-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                            <p className={`text-xs font-bold uppercase tracking-wider px-2 ${
                              period === 'Mañana' ? 'text-cyan-600' : period === 'Tarde' ? 'text-orange-600' : 'text-indigo-600'
                            }`}>{period}</p>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {slots.map(slot => {
                              const isSelected = selectedTime === slot.time;
                              return (
                                <motion.button
                                  key={slot.time}
                                  type="button"
                                  onClick={() => handleTimeSelect(slot.time)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`
                                    px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2
                                    ${isSelected
                                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-cyan-600 shadow-lg shadow-cyan-500/30'
                                      : 'bg-white text-gray-700 border-gray-200 hover:border-cyan-400 hover:bg-gradient-to-br hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-700 hover:shadow-md'}
                                  `}
                                >
                                  <div className="flex items-center justify-center gap-1.5">
                                    {isSelected && <CheckCircleIcon className="w-3.5 h-3.5" />}
                                    <span className="font-semibold">{formatTime(slot.time)}</span>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedDate && selectedTime && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 pt-4 border-t">
                      <button
                        type="button"
                        onClick={goToForm}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold 
                          hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Continuar
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Form */}
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12">
                  <button type="button" onClick={goBackToCalendar}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                    <ArrowLeftIcon className="w-4 h-4" /> Volver al calendario
                  </button>

                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4">
                      <UserIcon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Completa tus datos</h3>
                    <p className="text-gray-600 text-sm">Para confirmar tu cita</p>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-5 mb-8 border border-cyan-100">
                    <div className="flex items-center gap-4 text-cyan-800">
                      <div className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="font-semibold capitalize">{formatDateLong(selectedDate)}</p>
                        <p className="text-sm text-cyan-600">{formatTime(selectedTime)} - {agenda.defaultDuration} min</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre completo <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.clientName}
                          onChange={e => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                            formErrors.clientName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      {formErrors.clientName && <p className="text-xs text-red-500 mt-1">{formErrors.clientName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <PhoneIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.clientPhone}
                          onChange={e => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                            formErrors.clientPhone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="+595 xxx xxx xxx"
                        />
                      </div>
                      {formErrors.clientPhone && <p className="text-xs text-red-500 mt-1">{formErrors.clientPhone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-gray-400 text-xs">(opcional)</span>
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={formData.clientEmail}
                          onChange={e => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                            formErrors.clientEmail ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="tu@email.com"
                        />
                      </div>
                      {formErrors.clientEmail && <p className="text-xs text-red-500 mt-1">{formErrors.clientEmail}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Notas <span className="text-gray-400 text-xs">(opcional)</span>
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                        placeholder="Algo que quieras comentar..."
                      />
                    </div>

                    {formErrors.submit && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                        {formErrors.submit}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold 
                        hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] 
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Agendando...
                        </>
                      ) : (
                        'Confirmar Agenda'
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Confirmation */}
            {step === 'confirmation' && booking && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircleIcon className="w-10 h-10 text-white" />
                  </motion.div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Agendado con éxito</h2>
                  <p className="text-gray-600 mb-8">Tu cita ha sido registrada correctamente</p>

                  <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fecha</p>
                        <p className="font-semibold text-gray-900 capitalize">{formatDateLong(booking.bookingDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ClockIcon className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Hora</p>
                        <p className="font-semibold text-gray-900">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Nombre</p>
                        <p className="font-semibold text-gray-900">{booking.clientName}</p>
                      </div>
                    </div>
                  </div>

                  {booking.whatsappLink && (
                    <>
                      <p className="text-sm text-gray-500 mb-3">
                        Confirma tu cita enviando un mensaje por WhatsApp:
                      </p>
                      <a
                        href={booking.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 
                          text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl 
                          hover:scale-[1.02] active:scale-[0.98] mb-4"
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        Enviar WhatsApp al asesor
                      </a>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
