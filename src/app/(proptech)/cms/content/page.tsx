"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  PhotoIcon,
  MapPinIcon,
  UserGroupIcon,
  FolderIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getEndpoint } from '@/lib/api-config';
import { webGalleryService, Gallery } from '@/services/webGalleryService';
import { toast } from 'sonner';
import Image from 'next/image';
import { analytics, AnalyticsEvent } from '@/lib/analytics';

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
  galleryId?: number; // ID del álbum asociado
}

type TabType = 'events' | 'galleries';

export default function UnifiedContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('events');
  
  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsFilter, setEventsFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  
  // Galleries state
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [galleriesLoading, setGalleriesLoading] = useState(false);
  
  // Auth state
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Check for tab query parameter on mount and when it changes
  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam === 'galleries') {
      setActiveTab('galleries');
    } else if (tabParam === 'events') {
      setActiveTab('events');
    }
    
    // Track page view
    analytics.trackPageView('/cms/content', 'Gestor de Contenido');
  }, [searchParams]);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'events') {
      loadEvents();
    } else {
      loadGalleries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadEvents = async () => {
    // Evitar requests si ya sabemos que no estamos autorizados
    if (isUnauthorized) return;
    
    try {
      setEventsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token || token === 'undefined' || token === 'null') {
        handleUnauthorized();
        return;
      }
      
      const response = await fetch(getEndpoint('/api/cms/events'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        setIsUnauthorized(false); // Reset si la request fue exitosa
      } else {
        console.error('Error loading events:', response.status, response.statusText);
      }
    } catch (error: any) {
      console.error('Error loading events:', error);
      if (error?.response?.status === 401 || error?.message?.includes('401')) {
        handleUnauthorized();
      }
    } finally {
      setEventsLoading(false);
    }
  };

  const loadGalleries = async () => {
    // Evitar requests si ya sabemos que no estamos autorizados
    if (isUnauthorized) return;
    
    try {
      setGalleriesLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token || token === 'undefined' || token === 'null') {
        handleUnauthorized();
        return;
      }
      
      console.log('Loading galleries...');
      const data = await webGalleryService.getMyGalleries();
      console.log('Galleries loaded:', data);
      if (data && Array.isArray(data)) {
        setGalleries(data);
        setIsUnauthorized(false); // Reset si la request fue exitosa
        if (data.length === 0) {
          console.log('No galleries found');
        }
      } else {
        console.warn('Invalid galleries data:', data);
        setGalleries([]);
      }
    } catch (error: any) {
      console.error('Error loading galleries:', error);
      
      if (error?.response?.status === 401 || error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
        handleUnauthorized();
      } else {
        const errorMessage = error?.response?.data?.error || error?.message || 'Error al cargar álbumes';
        toast.error(errorMessage);
        setGalleries([]);
      }
    } finally {
      setGalleriesLoading(false);
    }
  };
  
  // Función centralizada para manejar errores de autenticación
  const handleUnauthorized = () => {
    if (isUnauthorized) return; // Evitar múltiples redirecciones
    
    setIsUnauthorized(true);
    toast.error('Tu sesión ha expirado. Redirigiendo al login...', {
      duration: 2000,
    });
    
    // Limpiar localStorage y redirigir
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/login';
      }
    }, 2000);
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;
    if (isUnauthorized) return;

    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        handleUnauthorized();
        return;
      }
      
      const response = await fetch(getEndpoint(`/api/cms/events/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.ok) {
        analytics.track(AnalyticsEvent.EVENT_DELETED, { event_id: id });
        toast.success('Evento eliminado');
        loadEvents();
      } else {
        toast.error('Error al eliminar evento');
      }
    } catch (error: any) {
      console.error('Error deleting event:', error);
      if (error?.response?.status === 401 || error?.message?.includes('401')) {
        handleUnauthorized();
      } else {
        toast.error('Error al eliminar evento');
      }
    }
  };

  const handleDeleteGallery = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este álbum? Se eliminarán todas las fotos.')) return;
    if (isUnauthorized) return;

    try {
      await webGalleryService.deleteGallery(id);
      analytics.track(AnalyticsEvent.ALBUM_DELETED, { album_id: id });
      toast.success('Álbum eliminado exitosamente');
      loadGalleries();
    } catch (error: any) {
      console.error('Error deleting gallery:', error);
      if (error?.response?.status === 401 || error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
        handleUnauthorized();
      } else {
        toast.error(error.response?.data?.error || 'Error al eliminar álbum');
      }
    }
  };

  const handleTogglePublish = async (gallery: Gallery) => {
    if (isUnauthorized) return;
    
    try {
      await webGalleryService.updateGallery(gallery.id, { isPublished: !gallery.isPublished });
      toast.success(gallery.isPublished ? 'Álbum ocultado' : 'Álbum publicado');
      loadGalleries();
    } catch (error: any) {
      console.error('Error toggling publish:', error);
      if (error?.response?.status === 401 || error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
        handleUnauthorized();
      } else {
        toast.error('Error al cambiar estado de publicación');
      }
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '/images/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return getEndpoint(url);
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.eventDate);
    const now = new Date();
    
    if (eventsFilter === 'all') return true;
    if (eventsFilter === 'upcoming') return eventDate >= now && event.status !== 'COMPLETED';
    if (eventsFilter === 'completed') return event.status === 'COMPLETED';
    return true;
  });

  const eventsStats = {
    total: events.length,
    upcoming: events.filter(e => new Date(e.eventDate) >= new Date() && e.status !== 'COMPLETED').length,
    completed: events.filter(e => e.status === 'COMPLETED').length,
    featured: events.filter(e => e.featured).length
  };

  const galleriesStats = {
    total: galleries.length,
    published: galleries.filter(g => g.isPublished).length,
    totalPhotos: galleries.reduce((sum, g) => sum + (g.photoCount || 0), 0),
    totalViews: galleries.reduce((sum, g) => sum + (g.viewsCount || 0), 0),
  };

  // Insights para mejorar conversión
  const getConversionInsights = () => {
    if (activeTab === 'events') {
      if (events.length === 0) {
        return {
          type: 'empty',
          message: 'Crea tu primer evento para aumentar el engagement',
          action: 'Crear Evento',
          href: '/cms/events/new',
        };
      }
      if (eventsStats.featured === 0 && events.length > 0) {
        return {
          type: 'suggestion',
          message: 'Destaca eventos importantes para aumentar su visibilidad',
          action: null,
        };
      }
      if (eventsStats.upcoming === 0 && events.length > 0) {
        return {
          type: 'suggestion',
          message: 'Crea más eventos próximos para mantener el engagement activo',
          action: 'Crear Evento',
          href: '/cms/events/new',
        };
      }
    } else {
      if (galleries.length === 0) {
        return {
          type: 'empty',
          message: 'Los álbumes aumentan el engagement. Crea tu primer álbum',
          action: 'Crear Álbum',
          href: '/cms/content/create-album',
        };
      }
      if (galleriesStats.published < galleries.length) {
        return {
          type: 'suggestion',
          message: `${galleries.length - galleriesStats.published} álbum(es) sin publicar. Publica para aumentar visibilidad`,
          action: null,
        };
      }
      if (galleriesStats.totalPhotos === 0 && galleries.length > 0) {
        return {
          type: 'suggestion',
          message: 'Agrega fotos a tus álbumes para hacerlos más atractivos',
          action: null,
        };
      }
    }
    return null;
  };

  const insight = getConversionInsights();

  return (
    <div>
      {/* Unauthorized Banner */}
      {isUnauthorized && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              ⚠️
            </div>
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">Sesión expirada</p>
              <p className="text-red-600 dark:text-red-300 text-sm">Serás redirigido al login en breve...</p>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Insights Banner */}
      {insight && insight.type === 'suggestion' && !isUnauthorized && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              💡
            </div>
            <p className="text-blue-800 dark:text-blue-200 font-medium">{insight.message}</p>
          </div>
          {insight.action && insight.href && (
            <button
              onClick={() => {
                analytics.trackCreateButtonClicked(activeTab === 'events' ? 'event' : 'album', 'insight_banner');
                router.push(insight.href!);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {insight.action}
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestor de Contenido
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona eventos, actividades y álbumes de fotos
          </p>
        </div>
        {activeTab === 'events' ? (
          <Link
            href="/cms/events/new"
            onClick={() => analytics.trackCreateButtonClicked('event', 'header')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Evento
          </Link>
        ) : (
          <button
            onClick={() => {
              analytics.trackCreateButtonClicked('album', 'header');
              router.push('/cms/content/create-album');
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Álbum
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            setActiveTab('events');
            analytics.trackContentTabSwitched('events');
          }}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'events'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Eventos y Actividades
            {events.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                {events.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => {
            setActiveTab('galleries');
            analytics.trackContentTabSwitched('galleries');
          }}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'galleries'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <PhotoIcon className="w-5 h-5" />
            Álbumes y Galerías
            {galleries.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full">
                {galleries.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <>
          {/* Conversion Metrics Banner */}
          {events.length === 0 && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    🎯 Comienza a crear eventos
                  </h3>
                  <p className="text-purple-700 dark:text-purple-300 mb-4">
                    Los eventos ayudan a aumentar el engagement y atraer más visitantes. Crea tu primer evento para empezar a generar más interacción.
                  </p>
                  <Link
                    href="/cms/events/new"
                    onClick={() => analytics.trackCreateButtonClicked('event', 'empty_state')}
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-md"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Crear Primer Evento
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{eventsStats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Próximos</p>
              <p className="text-2xl font-bold text-purple-600">{eventsStats.upcoming}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completados</p>
              <p className="text-2xl font-bold text-gray-600">{eventsStats.completed}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Destacados</p>
              <p className="text-2xl font-bold text-yellow-600">{eventsStats.featured}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setEventsFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                eventsFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
            >
              Todos ({eventsStats.total})
            </button>
            <button
              onClick={() => setEventsFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                eventsFilter === 'upcoming'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
            >
              Próximos ({eventsStats.upcoming})
            </button>
            <button
              onClick={() => setEventsFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                eventsFilter === 'completed'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
            >
              Completados ({eventsStats.completed})
            </button>
          </div>

          {/* Events Table */}
          {eventsLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Álbum
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center gap-3">
                            <CalendarIcon className="w-12 h-12 text-gray-400" />
                            <p>No hay eventos para mostrar con este filtro.</p>
                            <Link 
                              href="/cms/events/new" 
                              onClick={() => analytics.trackCreateButtonClicked('event', 'empty_table')}
                              className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1"
                            >
                              <PlusIcon className="w-4 h-4" />
                              Crear el primero
                            </Link>
                          </div>
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
                          <td className="px-6 py-4">
                            {event.galleryId ? (
                              <Link
                                href={`/cms/content/edit-album/${event.galleryId}`}
                                className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                              >
                                <FolderIcon className="w-4 h-4" />
                                Ver Álbum
                              </Link>
                            ) : (
                              <button
                                onClick={() => {
                                  // TODO: Implementar asociación de álbum a evento
                                  toast.info('Funcionalidad de asociar álbum próximamente');
                                }}
                                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                              >
                                <PlusIcon className="w-4 h-4" />
                                Crear Álbum
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/cms/events/${event.id}/edit`}
                                onClick={() => analytics.track(AnalyticsEvent.EVENT_VIEWED, { event_id: event.id, action: 'edit' })}
                                className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                                title="Editar"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
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
          )}
        </>
      )}

      {/* Galleries Tab */}
      {activeTab === 'galleries' && (
        <>
          {/* Conversion Metrics Banner */}
          {!galleriesLoading && galleries.length > 0 && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Álbumes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{galleries.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Publicados</p>
                <p className="text-2xl font-bold text-green-600">{galleries.filter(g => g.isPublished).length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Fotos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {galleries.reduce((sum, g) => sum + (g.photoCount || 0), 0)}
                </p>
              </div>
            </div>
          )}
          
          {galleriesLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando álbumes...</span>
            </div>
          ) : galleries.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <FolderIcon className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                📸 Crea tu primer álbum
              </h3>
              <p className="text-orange-700 dark:text-orange-300 mb-6 max-w-md mx-auto">
                Los álbumes de fotos aumentan el engagement y ayudan a mostrar mejor tus propiedades y eventos. ¡Comienza ahora!
              </p>
              <button
                onClick={() => {
                  analytics.trackCreateButtonClicked('album', 'empty_state');
                  router.push('/cms/content/create-album');
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Crear Primer Álbum
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries.map((gallery) => (
                <div key={gallery.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                  {gallery.photos && gallery.photos.length > 0 ? (
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={getImageUrl(gallery.photos[0].url)}
                        alt={gallery.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        {gallery.isPublished ? (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Publicado</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded">Borrador</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <PhotoIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 dark:text-white">{gallery.title}</h3>
                    {gallery.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{gallery.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span>{gallery.photoCount || 0} foto(s)</span>
                      <span>{gallery.viewsCount || 0} vistas</span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/cms/content/edit-album/${gallery.id}`}
                        onClick={() => analytics.track(AnalyticsEvent.ALBUM_VIEWED, { album_id: gallery.id, action: 'edit' })}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm text-center flex items-center justify-center gap-1 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Ver/Editar
                      </Link>
                      <button
                        onClick={() => handleTogglePublish(gallery)}
                        className="px-3 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800"
                        title={gallery.isPublished ? 'Ocultar álbum' : 'Publicar álbum'}
                      >
                        {gallery.isPublished ? (
                          <EyeIcon className="w-4 h-4" />
                        ) : (
                          <EyeSlashIcon className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteGallery(gallery.id)}
                        className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
