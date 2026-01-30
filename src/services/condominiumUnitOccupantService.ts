import { apiClient } from '@/lib/api';

export interface CondominiumUnitOccupant {
  id: number;
  userId: number;
  userEmail?: string;
  condominiumUnitId: number;
  unitNumber?: string;
  condominiumId?: number;
  condominiumName?: string;
  role: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const condominiumUnitOccupantService = {
  async listByCondominium(condominiumId: number): Promise<CondominiumUnitOccupant[]> {
    const response = await apiClient.get(`/api/condominiums/unit-occupants?condominiumId=${condominiumId}`);
    return response.data as CondominiumUnitOccupant[];
  },
  async listByUnit(unitId: number): Promise<CondominiumUnitOccupant[]> {
    const response = await apiClient.get(`/api/condominiums/unit-occupants?unitId=${unitId}`);
    return response.data as CondominiumUnitOccupant[];
  },
  async create(data: { userId: number; condominiumUnitId: number; role?: string; isActive?: boolean }): Promise<CondominiumUnitOccupant> {
    const response = await apiClient.post('/api/condominiums/unit-occupants', data);
    return response.data as CondominiumUnitOccupant;
  },
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/condominiums/unit-occupants/${id}`);
  },
};
