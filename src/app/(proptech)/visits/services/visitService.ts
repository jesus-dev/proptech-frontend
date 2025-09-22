import { Visit } from "../components/types";

// Helper function to clean up malformed API URLs
function resolveApiUrl(): string {
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
  // Clean up malformed URLs that might have double concatenation
  if (apiUrl.includes('https://proptech.com.py/https/api.proptech.com.py')) {
    apiUrl = 'https://api.proptech.com.py';
  } else if (apiUrl.includes('http://proptech.com.py/http/api.proptech.com.py')) {
    apiUrl = 'http://api.proptech.com.py';
  }
  
  return apiUrl;
}

const API_BASE = resolveApiUrl();
const API_URL = `${API_BASE}/api/visits`;

export const visitService = {
  getAllVisits: async (): Promise<Visit[]> => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al obtener visitas');
    return await res.json();
  },

  getVisitById: async (id: string): Promise<Visit | undefined> => {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) return undefined;
    return await res.json();
  },

  createVisit: async (visitData: Omit<Visit, "id" | "createdAt" | "updatedAt">): Promise<Visit> => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData)
    });
    if (!res.ok) throw new Error('Error al crear visita');
    return await res.json();
  },

  updateVisit: async (id: string, visitData: Partial<Omit<Visit, "id" | "createdAt" | "updatedAt">>): Promise<Visit | undefined> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData)
    });
    if (!res.ok) return undefined;
    return await res.json();
  },

  deleteVisit: async (id: string): Promise<boolean> => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    return res.ok;
  },
}; 