"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { apiClient } from '@/lib/api';

interface Event {
  id: number;
  title: string;
  slug: string;
  eventDate: string;
  location: string;
  status: string;
  maxAttendees: number;
  currentAttendees: number;
  featured: boolean;
  createdByName: string;
}

export default function EventsManagementPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/cms/events');
      setEvents(response.data);
    } catch (error: any) {
      console.error('Error loading events:', error);
      // 401 es manejado automáticamente por el interceptor de apiClient
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
      await apiClient.delete(`/api/cms/events/${id}`);
      loadEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      // 401 es manejado automáticamente por el interceptor de apiClient
    }
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.eventDate);
    const now = new Date();
    
    if (filter === 'all') return true;
    if (filter === 'upcoming') return eventDate >= now && event.status !== 'COMPLETED';
    if (filter === 'completed') return event.status === 'COMPLETED';
    return true;
  });

  const stats = {
    total: events.length,
    upcoming: events.filter(e => new Date(e.eventDate) >= new Date() && e.status !== 'COMPLETED').length,
    completed: events.filter(e => e.status === 'COMPLETED').length,
    featured: events.filter(e => e.featured).length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Eventos</h2>
          <p className="text-gray-600 dark:text-gray-400">Administra eventos y actividades</p>
        </div>
        <Link
          href="/cms/events/new"
          className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Evento
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Próximos</p>
          <p className="text-2xl font-bold text-purple-600">{stats.upcoming}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completados</p>
          <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Destacados</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.featured}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
          }`}
        >
          Todos ({stats.total})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'upcoming'
              ? 'bg-purple-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
          }`}
        >
          Próximos ({stats.upcoming})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-gray-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
          }`}
        >
          Completados ({stats.completed})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Asistentes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No hay eventos para mostrar. <Link href="/cms/events/new" className="text-purple-600 hover:text-purple-700">Crear el primero</Link>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {event.featured && (
                          <span className="text-yellow-500" title="Destacado">⭐</span>
                        )}
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(event.eventDate).toLocaleDateString('es-PY', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPinIcon className="w-4 h-4" />
                        {event.location || 'Sin ubicación'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <UserGroupIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {event.currentAttendees || 0}
                        </span>
                        {event.maxAttendees && (
                          <span className="text-gray-500">/ {event.maxAttendees}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        event.status === 'UPCOMING' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        event.status === 'ONGOING' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        event.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {event.status === 'UPCOMING' ? 'Próximo' :
                         event.status === 'ONGOING' ? 'En curso' :
                         event.status === 'COMPLETED' ? 'Completado' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/cms/events/${event.id}/edit`}
                          className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

