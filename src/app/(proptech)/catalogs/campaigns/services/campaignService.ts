import { Campaign } from '../types';

const STORAGE_KEY = 'campaigns';

const getStoredCampaigns = (): Campaign[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveCampaigns = (campaigns: Campaign[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
};

export const campaignService = {
  getAllCampaigns: async (): Promise<Campaign[]> => getStoredCampaigns(),
  getCampaignById: async (id: string): Promise<Campaign | undefined> => getStoredCampaigns().find(c => c.id === id),
  createCampaign: async (data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> => {
    const campaigns = getStoredCampaigns();
    const newCampaign: Campaign = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    campaigns.push(newCampaign);
    saveCampaigns(campaigns);
    return newCampaign;
  },
  updateCampaign: async (id: string, data: Partial<Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Campaign | undefined> => {
    const campaigns = getStoredCampaigns();
    const idx = campaigns.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    const updated = { ...campaigns[idx], ...data, updatedAt: new Date().toISOString() };
    campaigns[idx] = updated;
    saveCampaigns(campaigns);
    return updated;
  },
  deleteCampaign: async (id: string): Promise<boolean> => {
    const campaigns = getStoredCampaigns();
    const filtered = campaigns.filter(c => c.id !== id);
    if (filtered.length === campaigns.length) return false;
    saveCampaigns(filtered);
    return true;
  },
}; 