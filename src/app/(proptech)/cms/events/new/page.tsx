"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import EventForm from '../components/EventForm';
import { getEndpoint } from '@/lib/api-config';
import { analytics } from '@/lib/analytics';

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getEndpoint('/api/cms/events'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const eventData = await response.json();
        analytics.trackEventCreated(eventData.id, {
          title: formData.title,
          event_date: formData.eventDate,
          featured: formData.featured || false,
        });
        router.push('/cms/events');
      } else {
        setError('Error al crear el evento');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
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

