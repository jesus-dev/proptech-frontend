"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { schedulingService, Agenda, Booking } from '@/services/schedulingService';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-700', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  CONFIRMED: { label: 'Confirmada', color: 'text-green-700', bg: 'bg-green-100 dark:bg-green-900/30' },
  CANCELLED: { label: 'Cancelada', color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-900/30' },
  COMPLETED: { label: 'Completada', color: 'text-blue-700', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  NO_SHOW: { label: 'No se presentó', color: 'text-gray-700', bg: 'bg-gray-100 dark:bg-gray-700' },
};

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-PY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BookingsPage() {
  const params = useParams();
  const agendaId = Number(params.id);

  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [agendaId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [agendaData, bookingsData] = await Promise.all([
        schedulingService.getAgenda(agendaId),
        schedulingService.getBookings(agendaId),
      ]);
      setAgenda(agendaData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: number, status: string) => {
    try {
      const updated = await schedulingService.updateBookingStatus(bookingId, status);
      setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const filteredBookings = filterStatus
    ? bookings.filter(b => b.status === filterStatus)
    : bookings;

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/scheduling/${agendaId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-4">
          <ArrowLeftIcon className="w-4 h-4" /> Volver a la agenda
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <CalendarDaysIcon className="w-8 h-8 text-cyan-600" />
          Reservas — {agenda?.name}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900 dark:text-white' },
          { label: 'Pendientes', value: stats.pending, color: 'text-yellow-600' },
          { label: 'Confirmadas', value: stats.confirmed, color: 'text-green-600' },
          { label: 'Completadas', value: stats.completed, color: 'text-blue-600' },
          { label: 'Canceladas', value: stats.cancelled, color: 'text-red-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            !filterStatus ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}>Todas</button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <button key={key} onClick={() => setFilterStatus(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === key ? `${config.bg} ${config.color}` : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}>{config.label}</button>
        ))}
      </div>

      {/* Bookings list */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No hay reservas{filterStatus ? ` con estado "${STATUS_CONFIG[filterStatus]?.label}"` : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map(booking => {
            const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
            return (
              <div key={booking.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Date/Time */}
                  <div className="flex items-center gap-3 sm:w-48 flex-shrink-0">
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-2">
                      <CalendarDaysIcon className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(booking.bookingDate)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </p>
                    </div>
                  </div>

                  {/* Client info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <UserIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{booking.clientName}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {booking.clientPhone && (
                        <span className="flex items-center gap-1">
                          <PhoneIcon className="w-3 h-3" /> {booking.clientPhone}
                        </span>
                      )}
                      {booking.clientEmail && (
                        <span className="flex items-center gap-1 truncate">
                          <EnvelopeIcon className="w-3 h-3" /> {booking.clientEmail}
                        </span>
                      )}
                    </div>
                    {booking.notes && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{booking.notes}</p>
                    )}
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>

                    <span className="text-[10px] text-gray-400 font-mono">{booking.confirmationCode}</span>

                    {booking.whatsappLink && (
                      <a href={booking.whatsappLink} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="WhatsApp">
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      </a>
                    )}

                    {/* Status dropdown */}
                    <select
                      value={booking.status}
                      onChange={e => handleStatusChange(booking.id, e.target.value)}
                      className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 
                        bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300
                        focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="PENDING">Pendiente</option>
                      <option value="CONFIRMED">Confirmar</option>
                      <option value="COMPLETED">Completar</option>
                      <option value="CANCELLED">Cancelar</option>
                      <option value="NO_SHOW">No show</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
