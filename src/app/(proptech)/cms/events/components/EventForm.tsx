"use client";

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, MapPin } from 'lucide-react';
import { getEndpoint } from '@/lib/api-config';

interface EventFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export default function EventForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false,
}: EventFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    eventDate: '',
    endDate: '',
    location: '',
    locationUrl: '',
    maxAttendees: '',
    status: 'UPCOMING',
    registrationRequired: false,
    registrationUrl: '',
    contactEmail: '',
    contactPhone: '',
    eventImage: '',
    featured: false,
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        eventDate: initialData.eventDate ? initialData.eventDate.substring(0, 16) : '',
        endDate: initialData.endDate ? initialData.endDate.substring(0, 16) : '',
        location: initialData.location || '',
        locationUrl: initialData.locationUrl || '',
        maxAttendees: initialData.maxAttendees || '',
        status: initialData.status || 'UPCOMING',
        registrationRequired: initialData.registrationRequired || false,
        registrationUrl: initialData.registrationUrl || '',
        contactEmail: initialData.contactEmail || '',
        contactPhone: initialData.contactPhone || '',
        eventImage: initialData.eventImage || '',
        featured: initialData.featured || false,
      });
    }
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'title' && !isEditing) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('fileName', file.name);
      uploadFormData.append('category', 'EVENT');

      const headers: Record<string, string> = {};
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const selectedTenant = typeof window !== 'undefined' ? localStorage.getItem('selectedTenant') : null;
      if (selectedTenant) {
        try {
          const tenant = JSON.parse(selectedTenant);
          if (tenant?.id && tenant.id !== 0 && tenant.id != null) {
            headers['X-Selected-Tenant-Id'] = String(tenant.id);
          }
        } catch (_) {}
      }

      const res = await fetch(getEndpoint('/api/cms/media/upload'), {
        method: 'POST',
        headers,
        body: uploadFormData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || 'Error al subir la imagen');
      }
      const data = (await res.json()) as { fileUrl: string };
      handleChange('eventImage', data.fileUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      if (error?.message && !error.message.includes('401')) {
        alert(error.message || 'Error al subir la imagen');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
    };
    
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título del Evento *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Casa abierta - Nuevo desarrollo..."
            />
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción del Evento
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Describe el evento, actividades, qué incluye..."
            />
          </div>

          {/* Date and Time */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fecha y Hora</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inicio *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.eventDate}
                  onChange={(e) => handleChange('eventDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fin
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ubicación</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Av. Principal 123, Ciudad del Este"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL de Google Maps
                </label>
                <input
                  type="url"
                  value={formData.locationUrl}
                  onChange={(e) => handleChange('locationUrl', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="eventos@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="+595 981 001411"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Box */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuración</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="UPCOMING">Próximo</option>
                  <option value="ONGOING">En curso</option>
                  <option value="COMPLETED">Completado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cupo Máximo
                </label>
                <input
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => handleChange('maxAttendees', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ej: 50"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="registrationRequired"
                    checked={formData.registrationRequired}
                    onChange={(e) => handleChange('registrationRequired', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="registrationRequired" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Requiere registro
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleChange('featured', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Marcar como destacado
                  </label>
                </div>
              </div>

              {formData.registrationRequired && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL de Registro
                  </label>
                  <input
                    type="url"
                    value={formData.registrationUrl}
                    onChange={(e) => handleChange('registrationUrl', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="https://forms.google.com/..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
              >
                {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </div>

          {/* Event Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Imagen del Evento</h3>
            
            {formData.eventImage ? (
              <div className="space-y-3">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                  <img
                    src={formData.eventImage.startsWith('http') ? formData.eventImage : getEndpoint(formData.eventImage.startsWith('/') ? formData.eventImage : `/${formData.eventImage}`)}
                    alt="Event"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('eventImage', '')}
                  className="w-full text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Eliminar imagen
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-purple-500 transition-colors">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {uploadingImage ? 'Subiendo...' : 'Click para subir imagen'}
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

