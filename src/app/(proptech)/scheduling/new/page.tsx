"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { schedulingService, AvailabilitySlot } from '@/services/schedulingService';
import AgendaAvailabilityEditor from '@/components/scheduling/AgendaAvailabilityEditor';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const DEFAULT_AVAILABILITIES: AvailabilitySlot[] = [
  { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', isActive: true },
  { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', isActive: true },
  { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', isActive: true },
  { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', isActive: true },
  { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', isActive: true },
  { dayOfWeek: 6, startTime: '08:00', endTime: '13:00', isActive: true },
];

export default function NewAgendaPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

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
  });

  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>(DEFAULT_AVAILABILITIES);

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: autoSlug ? generateSlug(name) : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      setError('El nombre y slug son requeridos');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const activeAvailabilities = availabilities.filter(a => a.isActive);

      await schedulingService.createAgenda({
        ...formData,
        timezone: 'America/Asuncion',
        isActive: true,
        availabilities: activeAvailabilities,
      });

      router.push('/scheduling');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al crear la agenda');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/scheduling" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-4">
          <ArrowLeftIcon className="w-4 h-4" /> Volver a agendas
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <CalendarDaysIcon className="w-8 h-8 text-cyan-600" />
          Nueva Agenda
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Información General</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la agenda <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleNameChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              placeholder="Ej: Demo PropTech"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug (URL pública) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">/agendar/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={e => {
                  setAutoSlug(false);
                  setFormData(prev => ({ ...prev, slug: e.target.value }));
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="demo-proptech"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
              placeholder="Describe brevemente el propósito de esta agenda"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duración (minutos)</label>
              <select
                value={formData.defaultDuration}
                onChange={e => setFormData(prev => ({ ...prev, defaultDuration: parseInt(e.target.value) }))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
                <option value={90}>90 minutos</option>
                <option value={120}>120 minutos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reservas por horario</label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.maxBookingsPerSlot}
                onChange={e => setFormData(prev => ({ ...prev, maxBookingsPerSlot: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">1 = individual, 2+ = grupal</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de ubicación</label>
              <select
                value={formData.locationType}
                onChange={e => setFormData(prev => ({ ...prev, locationType: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="VIRTUAL">Virtual / Online</option>
                <option value="OFFICE">Oficina</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ubicación / Link de reunión
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              placeholder="Ej: https://meet.google.com/xxx o Oficina Central"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Días de anticipación máxima
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={formData.maxAdvanceDays}
                onChange={e => setFormData(prev => ({ ...prev, maxAdvanceDays: parseInt(e.target.value) || 30 }))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Horas mínimas de anticipación
              </label>
              <input
                type="number"
                min={0}
                max={168}
                value={formData.minNoticeHours}
                onChange={e => setFormData(prev => ({ ...prev, minNoticeHours: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">WhatsApp</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configura el teléfono y mensaje para que el visitante pueda confirmar por WhatsApp
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono WhatsApp</label>
            <input
              type="text"
              value={formData.whatsappPhone}
              onChange={e => setFormData(prev => ({ ...prev, whatsappPhone: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              placeholder="+595981123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mensaje personalizado (opcional)
            </label>
            <textarea
              value={formData.whatsappMessage}
              onChange={e => setFormData(prev => ({ ...prev, whatsappMessage: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
              placeholder="Hola, soy {clientName}. Agendé una cita para {agendaName} el {date} a las {time}. Código: {confirmationCode}"
            />
            <p className="text-xs text-gray-400 mt-1">
              Variables disponibles: {'{clientName}'}, {'{date}'}, {'{time}'}, {'{agendaName}'}, {'{confirmationCode}'}
            </p>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <AgendaAvailabilityEditor
            availabilities={availabilities}
            onChange={setAvailabilities}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl
              hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {saving ? 'Creando...' : 'Crear Agenda'}
          </button>
          <Link
            href="/scheduling"
            className="px-6 py-3 text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
