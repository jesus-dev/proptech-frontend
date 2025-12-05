"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import EventForm from '../../components/EventForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getEndpoint } from '@/lib/api-config';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getEndpoint(`/api/cms/events/${eventId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        setError('Evento no encontrado');
      }
    } catch (error) {
      console.error('Error loading event:', error);
      setError('Error al cargar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getEndpoint(`/api/cms/events/${eventId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/cms/events');
      } else {
        setError('Error al actualizar el evento');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Evento</h2>
        <p className="text-gray-600 dark:text-gray-400">Modifica la información del evento</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <EventForm
        initialData={event}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/cms/events')}
        isSubmitting={isSubmitting}
        isEditing={true}
      />
    </div>
  );
}

