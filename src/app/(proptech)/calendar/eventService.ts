import { getEndpoint } from "@/lib/api-config";

export interface CalendarEvent {
  id?: number;
  title: string;
  type: string;
  start: string; // ISO string
  end: string;   // ISO string
  propertyId?: number;
  clientId?: number;
  notes?: string;
  color?: string;
  status?: string;
}

const API_URL = getEndpoint("/api/calendar-events");

export const eventService = {
  async getEvents(): Promise<CalendarEvent[]> {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener eventos");
    const data = await res.json();
    // Mapear fechas a ISO string si vienen como objeto
    return data.map((ev: any) => ({
      ...ev,
      start: typeof ev.start === "string" ? ev.start : ev.start?.dateTime || ev.start,
      end: typeof ev.end === "string" ? ev.end : ev.end?.dateTime || ev.end,
    }));
  },
  async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ eventService: Error creating event:', {
        status: res.status,
        statusText: res.statusText,
        errorText,
        url: res.url,
        headers: Object.fromEntries(res.headers.entries()),
        body: JSON.stringify(event)
      });
      throw new Error(`Error al crear evento: ${res.status} ${res.statusText} - ${errorText}`);
    }
    const result = await res.json();
    return result;
  },
  async updateEvent(id: number, event: CalendarEvent): Promise<CalendarEvent> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ eventService: Error updating event:', {
        status: res.status,
        statusText: res.statusText,
        errorText
      });
      throw new Error(`Error al actualizar evento: ${res.status} ${res.statusText} - ${errorText}`);
    }
    const result = await res.json();
    return result;
  },
  async deleteEvent(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ eventService: Error deleting event:', {
        status: res.status,
        statusText: res.statusText,
        errorText
      });
      throw new Error(`Error al eliminar evento: ${res.status} ${res.statusText} - ${errorText}`);
    }
  },
}; 