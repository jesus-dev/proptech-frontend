import { Visit } from './types';
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useToast } from '@/components/ui/use-toast';
import { visitService } from '../services/visitService';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
const VISIT_STATES = {
  scheduled: {
    title: 'Programadas',
    color: 'bg-blue-50',
    border: 'border-blue-100',
    textColor: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700'
  },
  in_progress: {
    title: 'En Progreso',
    color: 'bg-orange-50',
    border: 'border-orange-100',
    textColor: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700'
  },
  pending: {
    title: 'Pendientes',
    color: 'bg-yellow-50',
    border: 'border-yellow-100',
    textColor: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700'
  },
  confirmed: {
    title: 'Confirmadas',
    color: 'bg-green-50',
    border: 'border-green-100',
    textColor: 'text-green-700',
    badge: 'bg-green-100 text-green-700'
  },
  completed: {
    title: 'Completadas',
    color: 'bg-green-50',
    border: 'border-green-100',
    textColor: 'text-green-700',
    badge: 'bg-green-100 text-green-700'
  },
  cancelled: {
    title: 'Canceladas',
    color: 'bg-red-50',
    border: 'border-red-100',
    textColor: 'text-red-700',
    badge: 'bg-red-100 text-red-700'
  },
  rescheduled: {
    title: 'Reprogramadas',
    color: 'bg-purple-50',
    border: 'border-purple-100',
    textColor: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700'
  }
} as const;

interface ActivitiesKanbanProps {
  activities: Visit[];
  onActivityClick: (activity: Visit) => void;
}

const SortableVisitCard = ({ visit, onClick }: { visit: Visit; onClick: () => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: visit.id });

  const state = VISIT_STATES[visit.status];
  const visitTypeColors = {
    property: 'bg-emerald-100 text-emerald-700',
    development: 'bg-blue-100 text-blue-700',
    office: 'bg-purple-100 text-purple-700'
  };

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging ? '0 8px 32px 0 rgba(60,60,60,0.12)' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'rounded-xl border flex flex-col gap-2 px-4 py-3 cursor-grab active:cursor-grabbing transition-all duration-200 bg-white hover:bg-gray-50 shadow-sm',
        state.border,
        isDragging && 'ring-2 ring-primary/30',
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn('font-semibold text-base truncate', state.textColor)}>{visit.title}</span>
        {visit.visitType && (
          <Badge className={cn('ml-2 px-2 py-0.5 text-xs font-medium rounded', visitTypeColors[visit.visitType])}>
            {visit.visitType === 'property' ? 'Propiedad' : visit.visitType === 'development' ? 'Desarrollo' : 'Oficina'}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <CalendarIcon className="w-4 h-4" />
        <span>{format(new Date(visit.date || visit.scheduledDate), "d MMM yyyy")}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <UserIcon className="w-4 h-4" />
        <span className="truncate">{visit.visitorName || visit.clientName}</span>
      </div>
    </div>
  );
};

export function ActivitiesKanban({ activities, onActivityClick }: ActivitiesKanbanProps) {
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeVisit, setActiveVisit] = useState<Visit | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const draggedVisit = activities.find(a => a.id === active.id);
    if (draggedVisit) {
      setActiveVisit(draggedVisit);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveVisit(null);

    if (over && active.id !== over.id) {
      const oldStatus = activities.find(a => a.id === active.id)?.status;
      const newStatus = over.id as keyof typeof VISIT_STATES;

      if (oldStatus && oldStatus !== newStatus) {
        const updatedVisit = activities.find(a => a.id === active.id);
        if (updatedVisit) {
          try {
            await visitService.updateVisit(updatedVisit.id, {
              ...updatedVisit,
              status: newStatus
            });
            toast({
              title: "Estado actualizado",
              description: `La visita se ha movido a ${VISIT_STATES[newStatus].title.toLowerCase()}`,
            });
          } catch (error) {
            toast({
              title: "Error",
              description: "No se pudo actualizar el estado de la visita",
              variant: "destructive",
            });
          }
        }
      }
    }
  };

  const getActivitiesByStatus = useCallback((status: keyof typeof VISIT_STATES) => {
    return activities.filter(activity => activity.status === status);
  }, [activities]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 p-4">
        {Object.entries(VISIT_STATES).map(([status, config]) => (
          <div
            key={status}
            className={cn(
              'rounded-2xl border shadow-sm flex flex-col gap-3 p-3 min-h-[220px] bg-white',
              config.border
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className={cn('font-bold text-base', config.textColor)}>{config.title}</h3>
              <span className={cn('text-xs font-semibold', config.textColor)}>
                {getActivitiesByStatus(status as keyof typeof VISIT_STATES).length}
              </span>
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <SortableContext
                items={getActivitiesByStatus(status as keyof typeof VISIT_STATES).map(a => a.id)}
                strategy={verticalListSortingStrategy}
              >
                {getActivitiesByStatus(status as keyof typeof VISIT_STATES).map((activity) => (
                  <SortableVisitCard
                    key={activity.id}
                    visit={activity}
                    onClick={() => onActivityClick(activity)}
                  />
                ))}
              </SortableContext>
            </div>
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeVisit && (
          <div className="w-[300px]">
            <SortableVisitCard
              visit={activeVisit}
              onClick={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
} 