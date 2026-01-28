import { Currency } from "./types";
import { apiClient } from "@/lib/api";

export const currencyService = {
  async getAll(): Promise<Currency[]> {
    const res = await apiClient.get('/api/currencies');
    return res.data;
  },
  async getActive(): Promise<Currency[]> {
    const res = await apiClient.get('/api/currencies/active');
    return res.data;
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