'use client';

import { Visit } from './types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { visitService } from '../services/visitService';
import { useToast } from '@/components/ui/use-toast';

interface VisitKanbanProps {
  visits: Visit[];
  onVisitClick: (visit: Visit) => void;
  onVisitsChange: () => void;
}

const VISIT_STATES = {
  pending: {
    title: 'Pendientes',
    description: 'Visitas que requieren confirmación',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  },
  confirmed: {
    title: 'Confirmadas',
    description: 'Visitas confirmadas por el cliente',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  },
  completed: {
    title: 'Completadas',
    description: 'Visitas realizadas exitosamente',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  },
  cancelled: {
    title: 'Canceladas',
    description: 'Visitas canceladas por el cliente',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  },
  rescheduled: {
    title: 'Reprogramadas',
    description: 'Visitas que requieren nueva fecha',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
  },
} as const;

type Status = keyof typeof VISIT_STATES;

function VisitCard({ visit, onClick }: { visit: Visit; onClick: () => void }) {
  const status = VISIT_STATES[visit.status as Status];
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg cursor-pointer transition-all hover:shadow-md",
        status.color,
        "border border-transparent hover:border-current"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium line-clamp-1 flex-1">
          {visit.title}
        </h4>
        <span className="text-xs px-2 py-1 rounded-full bg-white/20 dark:bg-black/20">
          {visit.visitType}
        </span>
      </div>
      <p className="text-sm opacity-80 line-clamp-2 mb-3">
        {visit.description}
      </p>
      <div className="text-xs space-y-1.5">
        <p className="flex items-center gap-1.5">
          <span className="opacity-70">Fecha:</span>
          {visit.date ? format(new Date(visit.date), "PPP") : "No especificada"}
        </p>
        <p className="flex items-center gap-1.5">
          <span className="opacity-70">Hora:</span>
          {(visit as any).startTime} - {(visit as any).endTime}
        </p>
        <p className="flex items-center gap-1.5">
          <span className="opacity-70">Visitante:</span>
          {visit.visitorName}
        </p>
        {(visit as any).location && (
          <p className="flex items-center gap-1.5">
            <span className="opacity-70">Ubicación:</span>
            {(visit as any).location}
          </p>
        )}
      </div>
    </div>
  );
}

export default function VisitKanban({ visits, onVisitClick, onVisitsChange }: VisitKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = Object.entries(VISIT_STATES).map(([status, config]) => ({
    status,
    ...config,
    visits: visits.filter(visit => visit.status === status),
  }));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const visitId = active.id as string;
    const newStatus = over.id as Status;
    const visit = visits.find(v => v.id === visitId);

    if (!visit || visit.status === newStatus) return;

    try {
      await visitService.updateVisit(visitId, {
        ...visit,
        status: newStatus,
      });
      
      onVisitsChange();
      
      toast({
        title: "Estado actualizado",
        description: `La visita se ha movido a ${VISIT_STATES[newStatus].title.toLowerCase()}`,
      });
    } catch (error) {
      console.error('Error updating visit status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la visita",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const visitId = active.id as string;
    const newStatus = over.id as Status;
    const visit = visits.find(v => v.id === visitId);

    if (!visit || visit.status === newStatus) return;
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="grid grid-cols-5 gap-4 h-full">
        {columns.map((column) => (
          <div key={column.status} className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {column.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {column.description}
                </p>
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {column.visits.length}
              </span>
            </div>
            <div
              className="flex-1 overflow-y-auto space-y-3 pr-2"
              data-status={column.status}
            >
              <SortableContext
                items={column.visits.map(v => v.id)}
                strategy={verticalListSortingStrategy}
              >
                {column.visits.map((visit) => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    onClick={() => onVisitClick(visit)}
                  />
                ))}
              </SortableContext>
              {column.visits.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No hay visitas {column.title.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeId ? (
          <VisitCard
            visit={visits.find(v => v.id === activeId)!}
            onClick={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
} 