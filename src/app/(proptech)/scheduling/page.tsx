"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  GlobeAltIcon,
  PhoneIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { schedulingService, Agenda, Booking } from '@/services/schedulingService';

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function SchedulingPage() {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [bookingCounts, setBookingCounts] = useState<Record<number, { total: number; pending: number }>>({});
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    loadAgendas();
  }, []);

  const loadAgendas = async () => {
    try {
      setLoading(true);
      const data = await schedulingService.listAgendas();
      setAgendas(data);

      const counts: Record<number, { total: number; pending: number }> = {};
      await Promise.all(
        data.map(async (agenda) => {
          if (!agenda.id) return;
          try {
            const bookings = await schedulingService.getBookings(agenda.id);
            counts[agenda.id] = {
              total: bookings.length,
              pending: bookings.filter((b: Booking) => b.status === 'PENDING').length,
            };
          } catch {
            counts[agenda.id!] = { total: 0, pending: 0 };
          }
        })
      );
      setBookingCounts(counts);
    } catch (error) {
      console.error('Error cargando agendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyPublicLink = (slug: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${baseUrl}/agendar/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleDelete = async (id: number) => {
    try {
      await schedulingService.deleteAgenda(id);
      setAgendas(prev => prev.filter(a => a.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error eliminando agenda:', error);
    }
  };

  const toggleActive = async (agenda: Agenda) => {
    try {
      await schedulingService.updateAgenda(agenda.id!, { isActive: !agenda.isActive });
      setAgendas(prev => prev.map(a => a.id === agenda.id ? { ...a, isActive: !a.isActive } : a));
    } catch (error) {
      console.error('Error actualizando agenda:', error);
    }
  };

  const getActiveDays = (agenda: Agenda): string => {
    if (!agenda.availabilities || agenda.availabilities.length === 0) return 'Sin configurar';
    const activeDays = agenda.availabilities
      .filter(a => a.isActive)
      .map(a => a.dayOfWeek)
      .sort();
    const unique = [...new Set(activeDays)];
    if (unique.length === 0) return 'Sin días activos';
    return unique.map(d => DAYS_SHORT[d]).join(', ');
  };

  const totalBookings = Object.values(bookingCounts).reduce((sum, c) => sum + c.total, 0);
  const totalPending = Object.values(bookingCounts).reduce((sum, c) => sum + c.pending, 0);
  const activeAgendas = agendas.filter(a => a.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white">
                <CalendarDaysIcon className="w-7 h-7" />
              </div>
              Agenda Online
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1.5 ml-14">
              Crea y gestiona agendas públicas para que tus clientes reserven citas
            </p>
          </div>
          <Link
            href="/scheduling/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white 
              rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl
              hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusIcon className="w-5 h-5" />
            Nueva Agenda
          </Link>
        </div>

        {/* Stats */}
        {!loading && agendas.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agendas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{agendas.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Activas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{activeAgendas}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Reservas</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{totalBookings}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pendientes</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{totalPending}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Cargando agendas...</p>
          </div>
        ) : agendas.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CalendarDaysIcon className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aún no tienes agendas</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Crea tu primera agenda online para que tus clientes puedan reservar citas directamente desde un link público.
            </p>
            <Link
              href="/scheduling/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white 
                rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
            >
              <PlusIcon className="w-5 h-5" />
              Crear mi primera Agenda
            </Link>
          </div>
        ) : (
          /* Agendas Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {agendas.map((agenda, i) => {
              const counts = bookingCounts[agenda.id!] || { total: 0, pending: 0 };
              return (
                <motion.div
                  key={agenda.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm hover:shadow-lg transition-all overflow-hidden ${
                    agenda.isActive
                      ? 'border-gray-200 dark:border-gray-700'
                      : 'border-gray-200 dark:border-gray-700 opacity-70'
                  }`}
                >
                  {/* Status bar */}
                  <div className={`h-1 ${agenda.isActive ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />

                  {/* Card content */}
                  <div className="p-5">
                    {/* Title + Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{agenda.name}</h3>
                        {agenda.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{agenda.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleActive(agenda)}
                        className={`ml-3 flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          agenda.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {agenda.isActive ? 'Activa' : 'Inactiva'}
                      </button>
                    </div>

                    {/* Public link */}
                    <button
                      onClick={() => copyPublicLink(agenda.slug)}
                      className="w-full flex items-center gap-2 px-3 py-2 mb-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 
                        border border-gray-200 dark:border-gray-600 hover:border-cyan-400 dark:hover:border-cyan-500 
                        hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all group cursor-pointer"
                    >
                      <GlobeAltIcon className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 flex-shrink-0" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-cyan-600 truncate flex-1 text-left font-mono">
                        /agendar/{agenda.slug}
                      </span>
                      <AnimatePresence mode="wait">
                        {copiedSlug === agenda.slug ? (
                          <motion.span
                            key="copied"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="text-xs font-semibold text-green-600 flex-shrink-0 flex items-center gap-1"
                          >
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            Copiado
                          </motion.span>
                        ) : (
                          <motion.span
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="text-xs text-gray-400 group-hover:text-cyan-500 flex-shrink-0"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>

                    {/* Info pills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs font-medium text-blue-700 dark:text-blue-400">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {agenda.defaultDuration} min
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-xs font-medium text-purple-700 dark:text-purple-400">
                        <CalendarDaysIcon className="w-3.5 h-3.5" />
                        {getActiveDays(agenda)}
                      </span>
                      {agenda.whatsappPhone && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-xs font-medium text-green-700 dark:text-green-400">
                          <PhoneIcon className="w-3.5 h-3.5" />
                          WhatsApp
                        </span>
                      )}
                      {agenda.maxBookingsPerSlot && agenda.maxBookingsPerSlot > 1 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-xs font-medium text-indigo-700 dark:text-indigo-400">
                          <UsersIcon className="w-3.5 h-3.5" />
                          Grupal ({agenda.maxBookingsPerSlot})
                        </span>
                      )}
                      {agenda.location && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 max-w-[150px] truncate">
                          <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          {agenda.location}
                        </span>
                      )}
                    </div>

                    {/* Bookings summary */}
                    <div className="flex items-center gap-4 py-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-1.5">
                        <ClipboardDocumentListIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{counts.total}</span>
                        <span className="text-xs text-gray-500">reservas</span>
                      </div>
                      {counts.pending > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{counts.pending}</span>
                          <span className="text-xs text-gray-500">pendientes</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card actions */}
                  <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-2 flex items-center gap-1 bg-gray-50/50 dark:bg-gray-800/50">
                    <Link
                      href={`/scheduling/${agenda.id}/bookings`}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg
                        text-gray-600 hover:bg-white hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-700 transition-all"
                    >
                      <ClipboardDocumentListIcon className="w-4 h-4" />
                      Reservas
                    </Link>

                    <Link
                      href={`/scheduling/${agenda.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg
                        text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-900/20 transition-all"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Editar
                    </Link>

                    <a
                      href={`/agendar/${agenda.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg
                        text-gray-600 hover:bg-white hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-700 transition-all"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Ver
                    </a>

                    {deleteConfirm === agenda.id ? (
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(agenda.id!)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700 
                            hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-500 hover:bg-white transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(agenda.id!)}
                        className="ml-auto flex items-center gap-1 px-2 py-2 text-xs font-medium rounded-lg
                          text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all"
                        title="Eliminar agenda"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
