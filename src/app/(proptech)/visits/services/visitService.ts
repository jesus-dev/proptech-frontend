import { Visit } from "../components/types";
import { apiClient } from "@/lib/api";

export const visitService = {
  getAllVisits: async (): Promise<Visit[]> => {
    try {
      const response = await apiClient.get('/api/visits');
      return response.data;
    } catch (error) {
      console.error('Error fetching visits:', error);
      throw new Error('Error al obtener visitas');
    }
  },

  getVisitById: async (id: string): Promise<Visit | undefined> => {
    try {
      const response = await apiClient.get(`/api/visits/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching visit by id:', error);
      return undefined;
    }
  },

  createVisit: async (visitData: Omit<Visit, "id" | "createdAt" | "updatedAt">): Promise<Visit> => {
    try {
      const response = await apiClient.post('/api/visits', visitData);
      return response.data;
    } catch (error) {
      console.error('Error creating visit:', error);
      throw new Error('Error al crear visita');
    }
  },

  updateVisit: async (id: string, visitData: Partial<Omit<Visit, "id" | "createdAt" | "updatedAt">>): Promise<Visit | undefined> => {
    try {
      const response = await apiClient.put(`/api/visits/${id}`, visitData);
      return response.data;
    } catch (error) {
      console.error('Error updating visit:', error);
      return undefined;
    }
  },

  deleteVisit: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/visits/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting visit:', error);
      return false;
    }
  },
}; 