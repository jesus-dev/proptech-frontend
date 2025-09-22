export interface SalesPipeline {
  id: number;
  leadId?: number;
  propertyId?: number;
  agentId?: number;
  stage: 'LEAD' | 'CONTACTED' | 'MEETING' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  probability: number;
  expectedValue?: number;
  currency?: string;
  source?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  nextAction?: string;
  nextActionDate?: string;
  lastContactDate?: string;
  notes?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string;
  closeReason?: string;
  actualValue?: number;
  commissionEarned?: number;
  daysInPipeline?: number;
  stageChangesCount?: number;
  lastStageChangeDate?: string;
  
  // Campos relacionados (populados desde otras entidades)
  lead?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  
  property?: {
    id: number;
    title: string;
    address: string;
    price: number;
    currency: string;
    featuredImage?: string;
  };
  
  agent?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface SalesAnalytics {
  id: number;
  date: string;
  agentId?: number;
  stage?: string;
  leadsCount: number;
  conversionRate?: number;
  avgDealSize?: number;
  totalPipelineValue?: number;
  closedWonCount: number;
  closedLostCount: number;
  avgDaysToClose?: number;
  winRate?: number;
  revenueGenerated?: number;
  commissionGenerated?: number;
  sourceBreakdown?: string;
  priorityBreakdown?: string;
  stageVelocity?: string;
  createdAt?: string;
}

export interface PipelineOverview {
  totalLeads: number;
  activeLeads: number;
  closedWon: number;
  closedLost: number;
  totalPipelineValue: number;
  winRate: number;
}

export interface StageBreakdown {
  [stage: string]: {
    count: number;
    value: number;
    avgProbability: number;
  };
}

export interface AgentPerformance {
  [agentId: string]: {
    totalLeads: number;
    wonLeads: number;
    lostLeads: number;
    avgProbability: number;
    totalValue: number;
    conversionRate: number;
  };
}

export interface SourceAnalysis {
  [source: string]: {
    totalLeads: number;
    wonLeads: number;
    lostLeads: number;
    avgProbability: number;
    totalValue: number;
    conversionRate: number;
  };
}

export interface PipelineFilters {
  agentId?: number;
  stage?: string;
  source?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  minProbability?: number;
  maxProbability?: number;
}

export interface PipelineStats {
  totalValue: number;
  avgProbability: number;
  avgDaysInPipeline: number;
  conversionRate: number;
  winRate: number;
}

export interface StageConfig {
  name: string;
  label: string;
  color: string;
  probability: number;
  description: string;
}

export const STAGE_CONFIG: StageConfig[] = [
  {
    name: 'LEAD',
    label: 'Lead',
    color: '#6B7280',
    probability: 10,
    description: 'Lead inicial, sin contacto'
  },
  {
    name: 'CONTACTED',
    label: 'Contactado',
    color: '#3B82F6',
    probability: 20,
    description: 'Primer contacto realizado'
  },
  {
    name: 'MEETING',
    label: 'Reunión',
    color: '#8B5CF6',
    probability: 40,
    description: 'Reunión programada o realizada'
  },
  {
    name: 'PROPOSAL',
    label: 'Propuesta',
    color: '#F59E0B',
    probability: 60,
    description: 'Propuesta enviada'
  },
  {
    name: 'NEGOTIATION',
    label: 'Negociación',
    color: '#EF4444',
    probability: 80,
    description: 'En negociación activa'
  },
  {
    name: 'CLOSED_WON',
    label: 'Ganado',
    color: '#10B981',
    probability: 100,
    description: 'Deal cerrado exitosamente'
  },
  {
    name: 'CLOSED_LOST',
    label: 'Perdido',
    color: '#6B7280',
    probability: 0,
    description: 'Deal perdido'
  }
];

export const PRIORITY_CONFIG = {
  LOW: { label: 'Baja', color: '#6B7280', bgColor: '#F3F4F6' },
  MEDIUM: { label: 'Media', color: '#F59E0B', bgColor: '#FEF3C7' },
  HIGH: { label: 'Alta', color: '#EF4444', bgColor: '#FEE2E2' },
  URGENT: { label: 'Urgente', color: '#DC2626', bgColor: '#FEE2E2' }
};

export const SOURCE_CONFIG = {
  WEBSITE: { label: 'Sitio Web', color: '#3B82F6' },
  REFERRAL: { label: 'Referido', color: '#10B981' },
  SOCIAL_MEDIA: { label: 'Redes Sociales', color: '#8B5CF6' },
  COLD_CALL: { label: 'Llamada Fría', color: '#F59E0B' },
  EMAIL: { label: 'Email', color: '#EF4444' },
  EVENT: { label: 'Evento', color: '#06B6D4' },
  OTHER: { label: 'Otro', color: '#6B7280' }
}; 