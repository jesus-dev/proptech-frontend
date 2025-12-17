"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import EventForm from '../components/EventForm';
import { apiClient } from '@/lib/api';
import { analytics } from '@/lib/analytics';

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/cms/events', formData);
      analytics.trackEventCreated(response.data.id, {
        title: formData.title,
        event_date: formData.eventDate,
        featured: formData.featured || false,
      });
      router.push('/cms/events');
    } catch (error: any) {
      console.error('Error:', error);
      // 401 es manejado automáticamente por el interceptor de apiClient
      if (error?.response?.status !== 401) {
        setError(error?.response?.data?.error || 'Error al crear el evento');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Evento</h2>
        <p className="text-gray-600 dark:text-gray-400">Crea un nuevo evento o actividad</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <EventForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/cms/events')}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

