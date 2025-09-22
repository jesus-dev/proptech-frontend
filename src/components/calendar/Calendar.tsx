"use client";
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from '@fullcalendar/core/locales/es';
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  Users, 
  Tag,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  Star
} from "lucide-react";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    description?: string;
    location?: string;
    attendees?: string[];
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    Danger: { value: "danger", color: "#ef4444", label: "Urgente", icon: AlertCircle },
    Success: { value: "success", color: "#10b981", label: "Completado", icon: CheckCircle },
    Primary: { value: "primary", color: "#3b82f6", label: "General", icon: Info },
    Warning: { value: "warning", color: "#f59e0b", label: "Importante", icon: Star },
  };

  useEffect(() => {
    // Initialize with some events
    setEvents([
      {
        id: "1",
        title: "Reunión de Ventas",
        start: new Date().toISOString().split("T")[0],
        extendedProps: { 
          calendar: "Danger",
          description: "Revisión mensual de ventas y proyecciones",
          location: "Sala de Conferencias A",
          attendees: ["Juan Pérez", "María García", "Carlos López"]
        },
      },
      {
        id: "2",
        title: "Presentación Cliente",
        start: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        extendedProps: { 
          calendar: "Success",
          description: "Presentación del proyecto final al cliente",
          location: "Oficina Principal",
          attendees: ["Ana Rodríguez", "Luis Martínez"]
        },
      },
      {
        id: "3",
        title: "Capacitación Equipo",
        start: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        end: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        extendedProps: { 
          calendar: "Primary",
          description: "Capacitación sobre nuevas herramientas",
          location: "Sala de Capacitación",
          attendees: ["Todo el equipo"]
        },
      },
    ]);
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar);
    setEventDescription(event.extendedProps.description || "");
    setEventLocation(event.extendedProps.location || "");
    openModal();
  };

  const handleAddOrUpdateEvent = () => {
    if (selectedEvent) {
      // Update existing event
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: eventTitle,
                start: eventStartDate,
                end: eventEndDate,
                extendedProps: { 
                  calendar: eventLevel,
                  description: eventDescription,
                  location: eventLocation,
                  attendees: selectedEvent.extendedProps.attendees
                },
              }
            : event
        )
      );
    } else {
      // Add new event
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        start: eventStartDate,
        end: eventEndDate,
        extendedProps: { 
          calendar: eventLevel,
          description: eventDescription,
          location: eventLocation,
          attendees: []
        },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    closeModal();
    resetModalFields();
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== selectedEvent.id)
      );
      closeModal();
      resetModalFields();
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setEventDescription("");
    setEventLocation("");
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <CalendarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Calendario de Eventos
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Gestiona y organiza todos tus eventos importantes
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Total eventos:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{events.length}</span>
              </div>
              <button
                onClick={openModal}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo Evento</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:bg-gray-800/90 dark:border-gray-700/50 overflow-hidden">
          {/* Calendar Legend */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Leyenda:</span>
              {Object.entries(calendarsEvents).map(([key, config]) => {
                const IconComponent = config.icon;
                return (
                  <div key={key} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: config.color }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar Component */}
          <div className="p-6">
            <div className="custom-calendar">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={esLocale}
                headerToolbar={{
                  left: "prev,next",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                buttonText={{
                  today: 'Hoy',
                  month: 'Mes',
                  week: 'Semana',
                  day: 'Día'
                }}
                events={events}
                selectable={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                height="auto"
                dayMaxEvents={3}
                moreLinkClick="popover"
                eventDisplay="block"
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: false
                }}
                slotMinTime="07:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={true}
                slotDuration="00:30:00"
                slotLabelInterval="01:00"
                expandRows={true}
                stickyHeaderDates={true}
                weekNumbers={false}
                weekNumberCalculation="ISO"
                handleWindowResize={true}
                windowResizeDelay={100}
                eventResizableFromStart={true}
                eventDurationEditable={true}
                eventStartEditable={true}
                editable={true}
                droppable={true}
                eventDrop={function(info) {
                  // Handle event drop
                }}
                eventResize={function(info) {
                  // Handle event resize
                }}
                dayCellDidMount={function(info) {
                  // Add custom styling to day cells
                }}
                eventDidMount={function(info) {
                  // Add custom styling to events
                }}
                eventWillUnmount={function(info) {
                  // Clean up event styling
                }}
                datesSet={function(info) {
                  // Handle date range changes
                }}
                loading={function(isLoading) {
                  // Handle loading state
                }}
                eventClassNames={function(arg) {
                  const calendarType = arg.event.extendedProps.calendar;
                  const config = calendarsEvents[calendarType as keyof typeof calendarsEvents];
                  return [`event-${config.value}`, 'custom-event'];
                }}
                dayCellClassNames={function(arg) {
                  return ['custom-day-cell'];
                }}
                
                                 eventBackgroundColor="auto"
                 eventBorderColor="auto"
                eventTextColor="white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-4xl p-0 overflow-hidden"
        showCloseButton={false}
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
          {/* Modal Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6 rounded-t-2xl">
            <div className="absolute inset-0 bg-black/10 rounded-t-2xl"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedEvent ? "✏️ Editar Evento" : "✨ Nuevo Evento"}
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedEvent ? "Modifica los detalles del evento existente" : "Crea un nuevo evento en tu calendario"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedEvent && (
                  <button
                    onClick={handleDeleteEvent}
                    className="p-3 text-red-200 hover:text-white hover:bg-red-500/30 rounded-xl transition-all duration-200 backdrop-blur-sm"
                    title="Eliminar evento"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                  title="Cerrar"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-8 space-y-8">
            {/* Event Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                📝 Título del Evento
              </label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Ej: Reunión de ventas, Presentación cliente..."
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg transition-all duration-200"
              />
            </div>

            {/* Event Type */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                🎨 Tipo de Evento
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(calendarsEvents).map(([key, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <label
                      key={key}
                      className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        eventLevel === key
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 hover:shadow-md'
                      }`}
                    >
                      <input
                        type="radio"
                        name="event-level"
                        value={key}
                        checked={eventLevel === key}
                        onChange={() => setEventLevel(key)}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3 mb-2">
                        <div 
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                          style={{ 
                            borderColor: eventLevel === key ? config.color : '#d1d5db',
                            backgroundColor: eventLevel === key ? config.color : 'transparent'
                          }}
                        >
                          {eventLevel === key && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
                          )}
                        </div>
                        <IconComponent className="h-5 w-5" style={{ color: config.color }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                        {config.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                <MapPin className="inline h-4 w-4 mr-2" />
                📍 Ubicación
              </label>
              <input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Ej: Sala de conferencias, Oficina principal, Zoom..."
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                <Edit3 className="inline h-4 w-4 mr-2" />
                📄 Descripción
              </label>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Describe los detalles del evento, agenda, participantes..."
                rows={4}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none transition-all duration-200"
              />
            </div>

            {/* Event Preview */}
            {eventTitle && (
              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  👁️ Vista Previa del Evento
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ 
                        backgroundColor: eventLevel ? calendarsEvents[eventLevel as keyof typeof calendarsEvents]?.color : '#6b7280'
                      }}
                    ></div>
                    <span className="font-medium text-gray-900 dark:text-white">{eventTitle}</span>
                  </div>
                  {eventStartDate && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      📅 {new Date(eventStartDate).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  )}
                  {eventLocation && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      📍 {eventLocation}
                    </div>
                  )}
                  {eventDescription && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      📄 {eventDescription}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 border-t border-gray-200 dark:border-gray-600 rounded-b-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedEvent ? "Modificando evento existente" : "Creando nuevo evento"}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500 transition-all duration-200 font-medium"
                >
                  ❌ Cancelar
                </button>
                <button
                  onClick={handleAddOrUpdateEvent}
                  disabled={!eventTitle || !eventLevel}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium transform hover:scale-105"
                >
                  {selectedEvent ? "💾 Actualizar Evento" : "✨ Crear Evento"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Custom Styles */}
      <style jsx global>{`
        .custom-calendar {
          font-family: 'Inter', sans-serif;
        }
        
        .fc {
          background: transparent;
        }
        
        .fc-header-toolbar {
          margin-bottom: 1.5rem;
        }
        
        .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }
        
        .fc-button {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: none;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .fc-button:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-1px);
        }
        
        .fc-button:active {
          transform: translateY(0);
        }
        
        .fc-button-primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }
        
        .fc-button-primary:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
        }
        
        .fc-daygrid-day {
          border-radius: 0.5rem;
          margin: 1px;
          transition: all 0.2s;
        }
        
        .fc-daygrid-day:hover {
          background-color: #f8fafc;
        }
        
        .fc-daygrid-day.fc-day-today {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          border-radius: 0.5rem;
        }
        
        .custom-event {
          border-radius: 0.5rem;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          margin: 1px 0;
        }
        
        .custom-event:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .fc-event-main {
          padding: 0.25rem 0.5rem;
        }
        
        .fc-event-time {
          font-weight: 600;
          font-size: 0.75rem;
        }
        
        .fc-event-title {
          font-weight: 500;
          font-size: 0.875rem;
        }
        
        .fc-daygrid-event-dot {
          display: none;
        }
        
        .fc-col-header-cell {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border: none;
          padding: 1rem 0;
          font-weight: 600;
          color: #374151;
        }
        
        .fc-daygrid-day-frame {
          min-height: 100px;
        }
        
        .fc-daygrid-day-events {
          margin-top: 0.25rem;
        }
        
        .fc-more-link {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border-radius: 0.25rem;
          padding: 0.125rem 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .fc-more-link:hover {
          background: rgba(59, 130, 246, 0.2);
        }
        
        .dark .fc-toolbar-title {
          color: #f9fafb;
        }
        
        .dark .fc-daygrid-day:hover {
          background-color: #374151;
        }
        
        .dark .fc-daygrid-day.fc-day-today {
          background: linear-gradient(135deg, #1e3a8a, #1e40af);
        }
        
        .dark .fc-col-header-cell {
          background: linear-gradient(135deg, #374151, #4b5563);
          color: #f9fafb;
        }
      `}</style>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const calendarType = eventInfo.event.extendedProps.calendar;
  const configMap = {
    Danger: { color: "#ef4444", icon: AlertCircle },
    Success: { color: "#10b981", icon: CheckCircle },
    Primary: { color: "#3b82f6", icon: Info },
    Warning: { color: "#f59e0b", icon: Star },
  };
  const config = configMap[calendarType as keyof typeof configMap] || { color: "#6b7280", icon: Info };

  const IconComponent = config.icon;

  return (
    <div className="flex items-center space-x-1 p-1">
      <IconComponent className="h-3 w-3 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">
          {eventInfo.event.title}
        </div>
        {eventInfo.timeText && (
          <div className="text-xs opacity-75">
            {eventInfo.timeText}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Calendar);
