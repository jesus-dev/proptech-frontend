export type VisitStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "pending" | "confirmed" | "rescheduled";

export interface Visit {
  id: string;
  title: string;
  description: string;
  status: VisitStatus;
  propertyId: string;
  scheduledDate: string;
  date?: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  visitorName?: string;
  visitType?: 'property' | 'development' | 'office';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  id: VisitStatus;
  title: string;
  visits: Visit[];
}

export interface KanbanBoardProps {
  initialColumns: KanbanColumn[];
  sampleProperties: unknown[];
  getProperty: (id: string) => any;
}

export interface KanbanColumnProps {
  column: KanbanColumn;
  handleDeleteColumn: (columnId: string) => void;
  activeId: string | null;
  getProperty: (id: string) => any;
  onVisitDeleted: () => void;
}

export interface SortableVisitCardProps {
  visit: Visit;
  activeId: string | null;
  getProperty: (id: string) => any;
  onVisitDeleted: () => void;
} 