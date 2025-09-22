"use client";
import React, { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
const CalendarComponent = Calendar as any;
import { format, parse, startOfWeek, getDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { eventService, CalendarEvent } from "./eventService";
import { 
  MapPin, 
  FileText, 
  AlertTriangle, 
  Clock, 
  Phone, 
  Users, 
  DollarSign,
  Star,
  Mail,
  Building,
  Calendar as CalendarIcon,
  Plus,
  Search
} from "lucide-react";
const locales = {
  es: es,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Tipos de evento inmobiliario con iconos
const EVENT_TYPES = [
  { value: "VISITA", label: "Visita", color: "#3b82f6", icon: <MapPin className="w-4 h-4" /> },
  { value: "FIRMA", label: "Firma de Contrato", color: "#10b981", icon: <FileText className="w-4 h-4" /> },
  { value: "VENCIMIENTO", label: "Vencimiento", color: "#f59e42", icon: <AlertTriangle className="w-4 h-4" /> },
  { value: "TAREA", label: "Tarea", color: "#6366f1", icon: <Clock className="w-4 h-4" /> },
  { value: "LLAMADA", label: "Llamada", color: "#f43f5e", icon: <Phone className="w-4 h-4" /> },
  { value: "REUNION", label: "Reunión", color: "#a21caf", icon: <Users className="w-4 h-4" /> },
  { value: "COBRO", label: "Pago", color: "#eab308", icon: <DollarSign className="w-4 h-4" /> },
];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<string>("VISITA");
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [filters, setFilters] = useState({
    searchTerm: "",
    eventType: "",
    showCompleted: true,
  });

  // Filtrar eventos
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = !filters.searchTerm || 
        event.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (event.notes && event.notes.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      
      const matchesType = !filters.eventType || event.type === filters.eventType;
      
      return matchesSearch && matchesType;
    });
  }, [events, filters]);

  // Cargar eventos desde la API
  React.useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await eventService.getEvents();
        setEvents(data);
      } catch (e) {
        setError("Error al obtener eventos");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Abrir modal para nuevo evento
  const handleSelectSlot = (slotInfo: any) => {
    setSelectedEvent({
      title: "",
      type: selectedEventType,
      start: slotInfo.start.toISOString(),
      end: slotInfo.end.toISOString(),
      notes: "",
    });
    setModalOpen(true);
  };

  // Abrir modal para editar evento
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent({ ...event, start: new Date(event.start).toISOString(), end: new Date(event.end).toISOString() });
    setModalOpen(true);
  };

  // Guardar evento (crear o editar)
  const handleSaveEvent = async () => {
    if (!selectedEvent) return;
    setSaving(true);
    setError(null);
    try {
      console.log('🔍 CalendarPage: Saving event:', selectedEvent);
      
      if (selectedEvent.id) {
        const updated = await eventService.updateEvent(selectedEvent.id, {
          ...selectedEvent,
          start: selectedEvent.start,
          end: selectedEvent.end,
        });
        setEvents(evts => evts.map(ev => ev.id === updated.id ? updated : ev));
        console.log('✅ CalendarPage: Event updated successfully');
      } else {
        const created = await eventService.createEvent({
          ...selectedEvent,
          start: selectedEvent.start,
          end: selectedEvent.end,
        });
        setEvents(evts => [...evts, created]);
        console.log('✅ CalendarPage: Event created successfully');
      }
      setModalOpen(false);
      setSelectedEvent(null);
    } catch (e: any) {
      console.error('❌ CalendarPage: Error saving event:', e);
      setError(e.message || "Error al guardar evento");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar evento
  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return;
    setSaving(true);
    setError(null);
    try {
      await eventService.deleteEvent(selectedEvent.id);
      setEvents(evts => evts.filter(ev => ev.id !== selectedEvent.id));
      setModalOpen(false);
      setSelectedEvent(null);
    } catch (e: any) {
      setError(e.message || "Error al eliminar evento");
    } finally {
      setSaving(false);
    }
  };

  // Render de eventos con color y diseño mejorado
  const eventPropGetter = (event: CalendarEvent) => {
    const type = EVENT_TYPES.find(t => t.value === event.type);
    const isEventToday = isToday(new Date(event.start));
    
    return {
      style: {
        backgroundColor: type?.color || "#3b82f6",
        color: "#fff",
        borderRadius: "8px",
        border: isEventToday ? "2px solid #fff" : "none",
        padding: "6px 10px",
        fontSize: "12px",
        fontWeight: "600",
        boxShadow: isEventToday 
          ? "0 4px 12px rgba(0,0,0,0.15)" 
          : "0 2px 8px rgba(0,0,0,0.1)",
        margin: "2px 0",
        minHeight: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      },
    };
  };

  // Componente personalizado para eventos
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const type = EVENT_TYPES.find(t => t.value === event.type);
    const isEventToday = isToday(new Date(event.start));
    const typeClass = `agenda-event-type-${event.type}`;
    return (
      <div className={`flex items-center justify-between w-full ${typeClass}`}>
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {type?.icon}
          </div>
          <span className="truncate font-medium">{event.title}</span>
        </div>
        {isEventToday && (
          <div className="flex-shrink-0">
            <Star className="w-3 h-3 text-yellow-300" />
          </div>
        )}
      </div>
    );
  };

  // Handlers para el calendario
  const handleViewChange = (newView: any) => {
    setView(newView);
  };

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
  };

  if (loading) return (
    <div className="p-6">
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        <span className="ml-3 text-gray-600">Cargando eventos...</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header mejorado */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-100 dark:bg-brand-900/20 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Calendario de Eventos
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestiona visitas, contratos, pagos y otros eventos inmobiliarios
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setSelectedEvent({
                  title: "",
                  type: selectedEventType,
                  start: new Date().toISOString(),
                  end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                  notes: "",
                });
                setModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Evento
            </button>
          </div>
        </div>

        {/* Filtros y controles */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm w-96"
            />
          </div>

          {/* Filtro por tipo */}
          <select
            value={filters.eventType}
            onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          >
            <option value="">Todos los tipos</option>
            {EVENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Leyenda de tipos de eventos */}
        <div className="flex flex-wrap gap-3">
          {EVENT_TYPES.map(type => (
            <div key={type.value} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{type.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Calendario */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CalendarComponent
          localizer={localizer}
          events={filteredEvents.map(ev => ({ ...ev, start: new Date(ev.start), end: new Date(ev.end) }) as any)}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventPropGetter}
          components={{
            event: EventComponent,
            agenda: {
              event: EventComponent,
            },
          }}
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "No hay eventos en este rango.",
            showMore: (total: any) => `+${total} más`,
          }}
          popup
          views={["month", "week", "day", "agenda"]}
          culture="es"
          className="calendar-custom"
          step={60}
          timeslots={1}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
        />
      </div>

      {/* Modal mejorado para crear/editar evento */}
      {modalOpen && (
        <>
          {/* Overlay degradado y blur sobre el calendario */}
          <div className="fixed inset-0 z-40 bg-gradient-to-br from-white/80 to-brand-100/80 backdrop-blur-sm transition-all duration-300"></div>
          {/* Modal de evento */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <form onSubmit={e => { e.preventDefault(); handleSaveEvent(); }}>
                  {/* Título centrado */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex-1 text-center">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white w-full">
                        {selectedEvent?.id ? "Editar Evento" : "Nuevo Evento"}
                      </h2>
                    </div>
                    <button
                      onClick={() => { setModalOpen(false); setSelectedEvent(null); }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-4"
                      aria-label="Cerrar"
                      type="button"
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {/* Input de título del evento */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Título del Evento
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                      placeholder="Ej: Visita a propiedad en Ciudad del Este"
                      value={selectedEvent?.title || ""}
                      onChange={e => setSelectedEvent(ev => ev ? { ...ev, title: e.target.value } : ev)}
                      required
                    />
                  </div>
                  {/* Fechas en una fila horizontal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Inicio
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                        value={selectedEvent ? selectedEvent.start.slice(0,16) : ""}
                        onChange={e => setSelectedEvent(ev => ev ? { ...ev, start: e.target.value } : ev)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Fin
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                        value={selectedEvent ? selectedEvent.end.slice(0,16) : ""}
                        onChange={e => setSelectedEvent(ev => ev ? { ...ev, end: e.target.value } : ev)}
                        required
                      />
                    </div>
                  </div>
                  {/* Tipo de evento y descripción en una sola columna */}
                  <div className="space-y-6 mb-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Tipo de Evento
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {EVENT_TYPES.map(type => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setSelectedEvent(ev => ev ? { ...ev, type: type.value } : ev)}
                            className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors w-full text-left ${
                              selectedEvent?.type === type.value
                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            }`}
                          >
                            <div style={{ color: type.color }}>{type.icon}</div>
                            <span className="text-base font-medium">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Descripción
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                        placeholder="Detalles del evento..."
                        rows={5}
                        value={selectedEvent?.notes || ""}
                        onChange={e => setSelectedEvent(ev => ev ? { ...ev, notes: e.target.value } : ev)}
                      />
                    </div>
                  </div>
                  {/* Botones de acción */}
                  <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t dark:border-gray-700 gap-4 mt-8">
                    {selectedEvent?.id && (
                      <button
                        type="button"
                        className="px-5 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors text-base font-semibold"
                        onClick={handleDeleteEvent}
                        disabled={saving}
                      >
                        Eliminar
                      </button>
                    )}
                    <div className="flex gap-4 ml-auto">
                      <button
                        type="button"
                        className="px-5 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white disabled:opacity-50 transition-colors text-base font-semibold"
                        onClick={() => { setModalOpen(false); setSelectedEvent(null); }}
                        disabled={saving}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-7 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors font-semibold text-base shadow-md"
                        disabled={saving}
                      >
                        {saving ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Guardando...
                          </div>
                        ) : (
                          selectedEvent?.id ? 'Actualizar' : 'Crear'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .calendar-custom .rbc-calendar {
          font-family: inherit;
        }
        .calendar-custom .rbc-header {
          padding: 16px 8px;
          font-weight: 600;
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          color: #374151;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.05em;
        }
        .calendar-custom .rbc-today {
          background-color: #eff6ff !important;
          border: 2px solid #3b82f6 !important;
        }
        .calendar-custom .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        .calendar-custom .rbc-off-range {
          color: #9ca3af;
        }
        .calendar-custom .rbc-event {
          border-radius: 8px;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 600;
          margin: 1px 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .calendar-custom .rbc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .calendar-custom .rbc-toolbar {
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
          background-color: #f8fafc;
        }
        .calendar-custom .rbc-toolbar button {
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: 500;
          border: 1px solid #d1d5db;
          background-color: white;
          color: #374151;
          transition: all 0.2s ease;
        }
        .calendar-custom .rbc-toolbar button:hover {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }
        .calendar-custom .rbc-toolbar button.rbc-active {
          background-color: #3b82f6;
          border-color: #3b82f6;
          color: white;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }
        .calendar-custom .rbc-toolbar-label {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
        }
        .calendar-custom .rbc-month-view {
          border-radius: 8px;
          overflow: hidden;
        }
        .calendar-custom .rbc-month-row {
          border-bottom: 1px solid #e2e8f0;
        }
        .calendar-custom .rbc-date-cell {
          padding: 8px;
          font-weight: 500;
        }
        .calendar-custom .rbc-day-bg {
          transition: background-color 0.2s ease;
        }
        .calendar-custom .rbc-day-bg:hover {
          background-color: #f3f4f6;
        }
        .calendar-custom .rbc-time-view {
          border-radius: 8px;
          overflow: hidden;
        }
        .calendar-custom .rbc-time-header {
          border-bottom: 2px solid #e2e8f0;
        }
        .calendar-custom .rbc-time-content {
          border-top: 1px solid #e2e8f0;
        }
        .calendar-custom .rbc-timeslot-group {
          border-bottom: 1px solid #f3f4f6;
        }
        .calendar-custom .rbc-time-slot {
          border-top: 1px solid #f9fafb;
        }
        .calendar-custom .rbc-agenda-view {
          border-radius: 8px;
          overflow: hidden;
        }
        .calendar-custom .rbc-agenda-view table {
          border-collapse: collapse;
        }
        .calendar-custom .rbc-agenda-view .rbc-agenda-date-cell {
          padding: 12px;
          font-weight: 600;
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .calendar-custom .rbc-agenda-view .rbc-agenda-event-cell {
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          overflow: hidden;
          position: relative;
          background-color: #3b82f6;
          border: none;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(59,130,246,0.08);
          transition: box-shadow 0.2s;
        }
        .calendar-custom .rbc-agenda-view tr:hover .rbc-agenda-event-cell {
          box-shadow: 0 4px 16px rgba(59,130,246,0.18);
          filter: brightness(1.05);
        }
        .calendar-custom .rbc-agenda-view tr[data-event-type="VISITA"] .rbc-agenda-event-cell { background-color: #3b82f6; }
        .calendar-custom .rbc-agenda-view tr[data-event-type="FIRMA"] .rbc-agenda-event-cell { background-color: #10b981; }
        .calendar-custom .rbc-agenda-view tr[data-event-type="VENCIMIENTO"] .rbc-agenda-event-cell { background-color: #f59e42; }
        .calendar-custom .rbc-agenda-view tr[data-event-type="TAREA"] .rbc-agenda-event-cell { background-color: #6366f1; }
        .calendar-custom .rbc-agenda-view tr[data-event-type="LLAMADA"] .rbc-agenda-event-cell { background-color: #f43f5e; }
        .calendar-custom .rbc-agenda-view tr[data-event-type="REUNION"] .rbc-agenda-event-cell { background-color: #a21caf; }
        .calendar-custom .rbc-agenda-view tr[data-event-type="COBRO"] .rbc-agenda-event-cell { background-color: #eab308; }
        .calendar-custom .rbc-agenda-view .rbc-agenda-date-cell,
        .calendar-custom .rbc-agenda-view .rbc-agenda-time-cell {
          background: #f3f4f6;
          color: #64748b;
          font-weight: 500;
          border-radius: 8px 0 0 8px;
          font-size: 15px;
        }
        .calendar-custom .rbc-agenda-view .rbc-agenda-event-cell .flex {
          align-items: center;
          gap: 10px;
        }
        /* Unifica el fondo y el color de texto de toda la fila del evento en la agenda */
        .calendar-custom .rbc-agenda-view tbody > tr {
          border-radius: 12px;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .calendar-custom .rbc-agenda-view tbody > tr:hover {
          box-shadow: 0 4px 16px rgba(59,130,246,0.18);
          filter: brightness(1.05);
        }
        /* Aplica el color de fondo y texto blanco a todas las celdas de la fila del evento */
        .calendar-custom .rbc-agenda-view .rbc-agenda-date-cell,
        .calendar-custom .rbc-agenda-view .rbc-agenda-time-cell,
        .calendar-custom .rbc-agenda-view .rbc-agenda-event-cell {
          background: transparent;
          color: #fff;
          border: none;
          font-weight: 600;
          font-size: 16px;
          box-shadow: none;
          padding-top: 10px;
          padding-bottom: 10px;
        }
        /* Colorea toda la fila según el tipo de evento */
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-event-cell.agenda-event-type-VISITA,
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-date-cell.agenda-event-type-VISITA,
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-time-cell.agenda-event-type-VISITA {
          background-color: #3b82f6 !important;
        }
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-event-cell.agenda-event-type-FIRMA,
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-date-cell.agenda-event-type-FIRMA,
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-time-cell.agenda-event-type-FIRMA {
          background-color: #10b981 !important;
        }
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-event-cell.agenda-event-type-VENCIMIENTO,
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-date-cell.agenda-event-type-VENCIMIENTO,
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-time-cell.agenda-event-type-VENCIMIENTO {
          background-color: #f59e42 !important;
        }
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-event-cell.agenda-event-type-TAREA,
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-date-cell.agenda-event-type-TAREA,
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-time-cell.agenda-event-type-TAREA {
          background-color: #6366f1 !important;
        }
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-event-cell.agenda-event-type-LLAMADA,
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-date-cell.agenda-event-type-LLAMADA,
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-time-cell.agenda-event-type-LLAMADA {
          background-color: #f43f5e !important;
        }
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-event-cell.agenda-event-type-REUNION,
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-date-cell.agenda-event-type-REUNION,
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-time-cell.agenda-event-type-REUNION {
          background-color: #a21caf !important;
        }
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-event-cell.agenda-event-type-COBRO,
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-date-cell.agenda-event-type-COBRO,
        .calendar-custom .rbc-agenda-view tbody > tr .rbc-agenda-time-cell.agenda-event-type-COBRO {
          background-color: #eab308 !important;
        }
        /* Elimina el borde entre celdas */
        .calendar-custom .rbc-agenda-view td {
          border: none !important;
        }
      `}</style>
    </div>
  );
} 