import { Currency } from "./types";
import { apiClient } from "@/lib/api";

function normalizeListResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as { content: T[] }).content)) {
    return (data as { content: T[] }).content;
  }
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: T[] }).data)) {
    return (data as { data: T[] }).data;
  }
  return [];
}

export const currencyService = {
  async getAll(): Promise<Currency[]> {
    const res = await apiClient.get('/api/currencies');
    return normalizeListResponse<Currency>(res.data);
  },
  async getActive(): Promise<Currency[]> {
    const res = await apiClient.get('/api/currencies/active');
    return normalizeListResponse<Currency>(res.data);
  },
  async getById(id: number): Promise<Currency> {
    const res = await apiClient.get(`/api/currencies/${id}`);
    return res.data;
  },
  async create(currency: Omit<Currency, "id">): Promise<Currency> {
    const res = await apiClient.post('/api/currencies', currency);
    return res.data;
  },
  async update(id: number, currency: Partial<Currency>): Promise<Currency> {
    const res = await apiClient.put(`/api/currencies/${id}`, currency);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/currencies/${id}`);
  },
}; 