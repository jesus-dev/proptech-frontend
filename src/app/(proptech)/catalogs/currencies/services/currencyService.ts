import { Currency } from "./types";
import { getEndpoint } from "@/lib/api-config";

const API_URL = getEndpoint('/api/currencies');

export const currencyService = {
  async getAll(): Promise<Currency[]> {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener monedas");
    return res.json();
  },
  async getActive(): Promise<Currency[]> {
    const res = await fetch(`${API_URL}/active`);
    if (!res.ok) throw new Error("Error al obtener monedas activas");
    return res.json();
  },
  async getById(id: number): Promise<Currency> {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Error al obtener moneda por ID");
    return res.json();
  },
  async create(currency: Omit<Currency, "id">): Promise<Currency> {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currency),
    });
    if (!res.ok) throw new Error("Error al crear moneda");
    return res.json();
  },
  async update(id: number, currency: Partial<Currency>): Promise<Currency> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currency),
    });
    if (!res.ok) throw new Error("Error al actualizar moneda");
    return res.json();
  },
  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar moneda");
  },
}; 