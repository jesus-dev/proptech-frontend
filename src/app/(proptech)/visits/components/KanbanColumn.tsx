"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { KanbanColumn as KanbanColumnType, Visit } from "./types";
import { SortableVisitCard } from "./SortableVisitCard";

interface KanbanColumnProps {
  column: KanbanColumnType;
  activeId: string | null;
  getProperty: (id: string) => any;
  onVisitDeleted: () => void;
}

export const KanbanColumnComponent: React.FC<KanbanColumnProps> = ({
  column,
  activeId,
  getProperty,
  onVisitDeleted,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col w-72 min-w-72 max-w-72 bg-gray-50 dark:bg-gray-700 rounded-xl p-3 shadow-sm kanban-column hover-lift snap-start">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg" style={{ 
            backgroundColor: column.id === 'scheduled' ? '#3B82F6' + '20' :
            column.id === 'in_progress' ? '#F59E0B' + '20' :
            column.id === 'completed' ? '#10B981' + '20' :
            '#EF4444' + '20'
          }}>
            <svg className="h-4 w-4" style={{ 
              color: column.id === 'scheduled' ? '#3B82F6' :
              column.id === 'in_progress' ? '#F59E0B' :
              column.id === 'completed' ? '#10B981' :
              '#EF4444'
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {column.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {column.id === 'scheduled' ? 'Visitas programadas' :
               column.id === 'in_progress' ? 'Visitas en curso' :
               column.id === 'completed' ? 'Visitas finalizadas' :
               'Visitas canceladas'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-600 px-2 py-1 rounded-full font-medium">
            {column.visits.length}
          </span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {column.visits.length > 0 ? 'Activo' : 'Vacío'}
            </span>
          </div>
        </div>
      </div>

      {/* Column Stats */}
      <div className="mb-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Visitas</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {column.visits.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Hoy</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {column.visits.filter(visit => {
                const today = new Date().toDateString();
                const visitDate = new Date(visit.scheduledDate).toDateString();
                return visitDate === today;
              }).length}
            </div>
          </div>
        </div>
      </div>

      {/* Droppable Zone */}
      <div 
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto min-h-[400px] p-2 rounded-lg transition-all duration-200 ${
          isOver 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600 shadow-lg scale-[1.02]' 
            : 'bg-white dark:bg-gray-800'
        }`}
      >
        {isOver && (
          <div className="flex items-center justify-center py-8 text-blue-600 dark:text-blue-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium">¡Suelta aquí!</p>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">Zona válida</p>
            </div>
          </div>
        )}
        
        {column.visits.length === 0 && !isOver ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-sm">Arrastra visitas aquí</p>
            </div>
          </div>
        ) : (
          column.visits.map((visit) => (
            <SortableVisitCard
              key={visit.id}
              visit={visit}
              activeId={activeId}
              getProperty={getProperty}
              onVisitDeleted={onVisitDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
}; 