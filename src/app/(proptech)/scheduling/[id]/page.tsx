"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  TrashIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { schedulingService, Agenda, AvailabilitySlot, BlockedDate } from '@/services/schedulingService';
import AgendaAvailabilityEditor from '@/components/scheduling/AgendaAvailabilityEditor';

export default function EditAgendaPage() {
  const params = useParams();
  const router = useRouter();
  const agendaId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    defaultDuration: 30,
    location: '',
    locationType: 'VIRTUAL',
    maxAdvanceDays: 30,
    minNoticeHours: 2,
    maxBookingsPerSlot: 1,
    whatsappPhone: '',
    whatsappMessage: '',
    isActive: true,
  });

  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newBlocked, setNewBlocked] = useState({ blockedDate: '', reason: '' });

  useEffect(() => {
    loadAgenda();
    loadBlockedDates();
  }, [agendaId]);

  const loadAgenda = async () => {
    try {
      setLoading(true);
      const agenda = await schedulingService.getAgenda(agendaId);
      setFormData({
        name: agenda.name || '',
        slug: agenda.slug || '',
        description: agenda.description || '',
        defaultDuration: agenda.defaultDuration || 30,
        location: agenda.location || '',
        locationType: agenda.locationType || 'VIRTUAL',
        maxAdvanceDays: agenda.maxAdvanceDays || 30,
        minNoticeHours: agenda.minNoticeHours || 2,
        maxBookingsPerSlot: agenda.maxBookingsPerSlot || 1,
        whatsappPhone: agenda.whatsappPhone || '',
        whatsappMessage: agenda.whatsappMessage || '',
        isActive: agenda.isActive ?? true,
      });
      setAvailabilities(agenda.availabilities || []);
    } catch (err) {
      setError('Error cargando la agenda');
    } finally {
      setLoading(false);
    }
  };

  const loadBlockedDates = async () => {
    try {
      const data = await schedulingService.getBlockedDates(agendaId);
      setBlockedDates(data);
    } catch (err) {
      console.error('Error cargando fechas bloqueadas:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await schedulingService.updateAgenda(agendaId, formData);
      setSuccess('Agenda actualizada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAvailability = async () => {
    try {
      setSavingAvailability(true);
      setError('');
      const active = availabilities.filter(a => a.isActive);
      const result = await schedulingService.updateAvailability(agendaId, active);
      setAvailabilities(result);
      setSuccess('Disponibilidad actualizada');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al actualizar disponibilidad');
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleAddBlockedDate = async () => {
    if (!newBlocked.blockedDate) return;
    try {
      const result = await schedulingService.addBlockedDate(agendaId, newBlocked);
      setBlockedDates(prev => [...prev, result]);
      setNewBlocked({ blockedDate: '', reason: '' });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al bloquear fecha');
    }
  };

  const handleRemoveBlockedDate = async (blockedDateId: number) => {
    try {
      await schedulingService.removeBlockedDate(agendaId, blockedDateId);
      setBlockedDates(prev => prev.filter(b => b.id !== blockedDateId));
    } catch (err) {
      console.error('Error eliminando fecha bloqueada:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/scheduling" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-4">
          <ArrowLeftIcon className="w-4 h-4" /> Volver a agendas
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <CalendarDaysIcon className="w-8 h-8 text-cyan-600" />
          Editar Agenda
        </h1>
      </div>

      {/* Success/Error messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Basic Info Form */}
        <form onSubmit={handleSave}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Información General</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input type="text" value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                <input type="text" value={formData.slug}
                  onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
              <textarea value={formData.description} rows={2}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duración</label>
                <select value={formData.defaultDuration}
                  onChange={e => setFormData(p => ({ ...p, defaultDuration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                <select value={formData.locationType}
                  onChange={e => setFormData(p => ({ ...p, locationType: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                  <option value="VIRTUAL">Virtual</option>
                  <option value="OFFICE">Oficina</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reservas/horario</label>
                <input type="number" min={1} max={100} value={formData.maxBookingsPerSlot}
                  onChange={e => setFormData(p => ({ ...p, maxBookingsPerSlot: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                <p className="text-xs text-gray-400 mt-1">1 = individual, 2+ = grupal</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Máx. días anticipación</label>
                <input type="number" min={1} max={365} value={formData.maxAdvanceDays}
                  onChange={e => setFormData(p => ({ ...p, maxAdvanceDays: parseInt(e.target.value) || 30 }))}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Anticipación mín. (horas)</label>
                <input type="number" min={0} max={168} value={formData.minNoticeHours}
                  onChange={e => setFormData(p => ({ ...p, minNoticeHours: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ubicación / Link</label>
              <input type="text" value={formData.location}
                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="https://meet.google.com/xxx" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp</label>
                <input type="text" value={formData.whatsappPhone}
                  onChange={e => setFormData(p => ({ ...p, whatsappPhone: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  placeholder="+595981123456" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensaje WhatsApp</label>
                <input type="text" value={formData.whatsappMessage}
                  onChange={e => setFormData(p => ({ ...p, whatsappMessage: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  placeholder="Mensaje personalizado..." />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${formData.isActive ? 'bg-cyan-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${formData.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">{formData.isActive ? 'Activa' : 'Inactiva'}</span>
              </div>
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>

        {/* Availability */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <AgendaAvailabilityEditor availabilities={availabilities} onChange={setAvailabilities} />
          <div className="mt-4 flex justify-end">
            <button onClick={handleSaveAvailability} disabled={savingAvailability}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50">
              {savingAvailability ? 'Guardando...' : 'Guardar Disponibilidad'}
            </button>
          </div>
        </div>

        {/* Blocked Dates */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Fechas Bloqueadas
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Bloquea fechas específicas donde no se podrán agendar citas (feriados, vacaciones, etc.)
          </p>

          {/* Add blocked date */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Fecha</label>
              <input type="date" value={newBlocked.blockedDate}
                onChange={e => setNewBlocked(p => ({ ...p, blockedDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Motivo</label>
              <input type="text" value={newBlocked.reason}
                onChange={e => setNewBlocked(p => ({ ...p, reason: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                placeholder="Ej: Feriado" />
            </div>
            <button onClick={handleAddBlockedDate} disabled={!newBlocked.blockedDate}
              className="px-3 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50">
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          {blockedDates.length > 0 ? (
            <div className="space-y-2">
              {blockedDates.map(bd => (
                <div key={bd.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{bd.blockedDate}</span>
                    {bd.reason && <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">— {bd.reason}</span>}
                  </div>
                  <button onClick={() => handleRemoveBlockedDate(bd.id!)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">No hay fechas bloqueadas</p>
          )}
        </div>

        {/* Quick links */}
        <div className="flex items-center gap-4">
          <Link href={`/scheduling/${agendaId}/bookings`}
            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
            Ver reservas de esta agenda →
          </Link>
          <a href={`/agendar/${formData.slug}`} target="_blank" rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700 font-medium">
            Ver página pública →
          </a>
        </div>
      </div>
    </div>
  );
}
