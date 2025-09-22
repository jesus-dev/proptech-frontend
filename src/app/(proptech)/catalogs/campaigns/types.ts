export type CampaignType = 'facebook' | 'google' | 'instagram' | 'tiktok' | 'referido' | 'otro';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  cost: number;
  startDate: string;
  endDate?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
} 