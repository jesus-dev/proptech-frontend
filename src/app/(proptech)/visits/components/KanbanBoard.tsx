"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, CalendarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { KanbanColumn, Visit } from "./types";
import { KanbanColumnComponent } from "./KanbanColumn";
import { SortableVisitCard } from "./SortableVisitCard";
import { visitService } from "../services/visitService";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface KanbanBoardProps {
  initialColumns?: KanbanColumn[];
  sampleProperties: unknown[];
  getProperty: (id: string) => any;
}

// Definir los estados y títulos de las columnas
const COLUMN_DEFS = [
  { id: "scheduled", title: "Programadas" },
  { id: "in_progress", title: "En Progreso" },
  { id: "completed", title: "Completadas" },
  { id: "cancelled", title: "Canceladas" },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  initialColumns,
  sampleProperties,
  getProperty,
}) => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragFailed, setDragFailed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );



  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setLoading(true);
        console.log("Iniciando carga de visitas...");
        
        const visits = await visitService.getAllVisits();
        console.log("Visitas cargadas:", visits);
        
        if (!visits || visits.length === 0) {
          console.log("No hay visitas, usando datos por defecto");
          
          const newColumns = COLUMN_DEFS.map(col => ({
            id: col.id as any,
            title: col.title,
            visits: [] // No hay visitas, por lo que las columnas estarán vacías
          }));
          
          setColumns(newColumns);
          return;
        }
        
        // Distribuir visitas en columnas fijas
        const newColumns = COLUMN_DEFS.map(col => ({
          id: col.id as any,
          title: col.title,
          visits: visits.filter(v => v.status === col.id)
        }));
        
        console.log("Columnas creadas:", newColumns);
        setColumns(newColumns);
        setError(null);
      } catch (err) {
        console.error("Error fetching visits:", err);
        setError(`Error al cargar las visitas: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, []);

  const findVisit = (id: string): Visit | undefined => {
    for (const column of columns) {
      const visit = column.visits.find((v) => v.id === id);
      if (visit) return visit;
    }
    return undefined;
  };

  const findColumn = (id: string): KanbanColumn | undefined => {
    return columns.find((col) => col.id === id);
  };

  const handleDragStart = (event: DragStartEvent) => {
    console.log("Drag start:", event.active.id);
    setActiveId(event.active.id as string);
    setDragFailed(false); // Reset error state
    
    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    (window as any).dragMouseListener = handleMouseMove;
  };

  const handleDragOver = (event: DragOverEvent) => {
    console.log("Drag over:", event);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    console.log("Drag end:", event);
    const { active, over } = event;
    setActiveId(null);
    
    // Remove mouse listener
    if ((window as any).dragMouseListener) {
      document.removeEventListener('mousemove', (window as any).dragMouseListener);
      (window as any).dragMouseListener = null;
    }

    if (!over) {
      console.log("No over target - returning to original position");
      setDragFailed(true);
      setTimeout(() => setDragFailed(false), 1000);
      // No hacer nada, DND Kit devolverá la card automáticamente
      return;
    }

    const activeVisit = findVisit(active.id as string);
    if (!activeVisit) {
      console.log("No active visit found");
      return;
    }

    const newStatus = over.id as string;
    if (newStatus === activeVisit.status) {
      console.log("Same status, no change needed");
      return;
    }

    // Verificar que el over.id sea una columna válida
    const validColumns = COLUMN_DEFS.map(col => col.id);
    if (!validColumns.includes(newStatus)) {
      console.log("Invalid drop target - returning to original position");
      setDragFailed(true);
      setTimeout(() => setDragFailed(false), 1000);
      // No hacer nada, DND Kit devolverá la card automáticamente
      return;
    }

    console.log(`Moving visit ${activeVisit.id} from ${activeVisit.status} to ${newStatus}`);

    try {
      const updatedVisit = await visitService.updateVisit(activeVisit.id, {
        status: newStatus as any,
      });

      if (updatedVisit) {
        console.log("Visit updated successfully:", updatedVisit);
        
        // Actualizar el estado local inmediatamente
        setColumns(prevColumns => {
          const newColumns = prevColumns.map((column) => ({
            ...column,
            visits: column.visits.filter((v) => v.id !== activeVisit.id),
          }));

          const targetCol = newColumns.find((col) => col.id === newStatus);
          if (targetCol) {
            targetCol.visits.push(updatedVisit);
          }

          return newColumns;
        });
      }
    } catch (err) {
      console.error("Error updating visit status:", err);
      setDragFailed(true);
      setTimeout(() => setDragFailed(false), 1000);
      // Revertir el estado local para que la card vuelva a su posición original
      setColumns(prevColumns => {
        const newColumns = prevColumns.map((column) => ({
          ...column,
          visits: column.visits.filter((v) => v.id !== activeVisit.id),
        }));

        const originalCol = newColumns.find((col) => col.id === activeVisit.status);
        if (originalCol) {
          originalCol.visits.push(activeVisit);
        }

        return newColumns;
      });
    }
  };



  const handleVisitDeleted = async () => {
    const updatedVisits = await visitService.getAllVisits();
    const updatedColumns = COLUMN_DEFS.map(col => ({
      id: col.id as any,
      title: col.title,
      visits: updatedVisits.filter((visit) => visit.status === col.id)
    }));
    setColumns(updatedColumns);
  };

  // Función para recargar datos si hay problemas
  const reloadVisits = async () => {
    try {
      const visits = await visitService.getAllVisits();
      
      if (!visits || visits.length === 0) {
        // Usar datos de prueba si no hay visitas
        const newColumns = COLUMN_DEFS.map(col => ({
          id: col.id as any,
          title: col.title,
          visits: [] // No hay visitas, por lo que las columnas estarán vacías
        }));
        
        setColumns(newColumns);
        return;
      }
      
      const newColumns = COLUMN_DEFS.map(col => ({
        id: col.id as any,
        title: col.title,
        visits: visits.filter(v => v.status === col.id)
      }));
      
      setColumns(newColumns);
      setError(null);
    } catch (err) {
      console.error("Error reloading visits:", err);
      // Si hay error, usar datos de prueba como fallback
      const newColumns = COLUMN_DEFS.map(col => ({
        id: col.id as any,
        title: col.title,
        visits: [] // No hay visitas, por lo que las columnas estarán vacías
      }));
      
      setColumns(newColumns);
    }
  };

  const filteredColumns = columns.map((column) => ({
    ...column,
    visits: column.visits.filter(
      (visit) =>
        visit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visit.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '0.1s' }}></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cargando visitas</h3>
          <p className="text-gray-600 dark:text-gray-400">Preparando tu tablero Kanban...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error al cargar</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={reloadVisits} 
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!columns || columns.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="relative">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <CalendarIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">¡Comienza tu primer tablero!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            No hay visitas programadas aún. Crea tu primera visita y comienza a organizar tu agenda de manera visual y eficiente.
          </p>
          <div className="space-y-3">
            <Link href="/visits/new">
              <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Programar Primera Visita</span>
                </div>
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Title Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Gestión de Visitas
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-base">
                Organiza y gestiona las visitas a propiedades de manera eficiente
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={reloadVisits}
                className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/30"
              >
                <svg className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Recargar
              </button>
              <Link href="/visits/new">
                <button className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30">
                  <svg className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nueva Visita
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {/* Programadas Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Programadas</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {columns.find(col => col.id === 'scheduled')?.visits.length || 0}
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* En Progreso Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">En Progreso</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {columns.find(col => col.id === 'in_progress')?.visits.length || 0}
                </p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Completadas Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Completadas</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {columns.find(col => col.id === 'completed')?.visits.length || 0}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Clientes Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Clientes</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {columns.reduce((total, col) => {
                    const uniqueClients = new Set(col.visits.map(visit => visit.clientEmail));
                    return total + uniqueClients.size;
                  }, 0)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters Bar */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar visitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setActiveId(null);
          if ((window as any).dragMouseListener) {
            document.removeEventListener('mousemove', (window as any).dragMouseListener);
            (window as any).dragMouseListener = null;
          }
        }}
      >
        <div className="flex space-x-3 w-full min-w-0 px-4 pb-4 justify-center">
          {filteredColumns && filteredColumns.length > 0 ? filteredColumns.map((column) => (
            <SortableContext
              key={column.id}
              id={column.id}
              items={column.visits.map((v) => v.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumnComponent
                column={column}
                activeId={activeId}
                getProperty={getProperty}
                onVisitDeleted={handleVisitDeleted}
              />
            </SortableContext>
          )) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No hay visitas para mostrar
            </div>
          )}
        </div>

        <DragOverlay>
          {null}
        </DragOverlay>
        
        {/* Custom overlay that follows mouse */}
        {activeId && findVisit(activeId) && (
          <div 
            className="fixed pointer-events-none z-[9999] w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-blue-500 p-4 transform rotate-1 backdrop-blur-sm"
            style={{
              left: mousePosition.x - 36,
              top: mousePosition.y - 36,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
                {findVisit(activeId)!.title}
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse ml-2"></div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
              {findVisit(activeId)!.clientName}
            </div>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                findVisit(activeId)!.status === 'scheduled' 
                  ? 'bg-blue-100 text-blue-800'
                  : findVisit(activeId)!.status === 'in_progress'
                  ? 'bg-yellow-100 text-yellow-800'
                  : findVisit(activeId)!.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {findVisit(activeId)!.status === 'scheduled' ? 'Programada' :
                 findVisit(activeId)!.status === 'in_progress' ? 'En Progreso' :
                 findVisit(activeId)!.status === 'completed' ? 'Completada' :
                 findVisit(activeId)!.status === 'cancelled' ? 'Cancelada' : findVisit(activeId)!.status}
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Arrastrando...
              </span>
            </div>
          </div>
        )}
        
        {/* Drag failed indicator */}
        {dragFailed && (
          <div className="fixed top-4 right-4 z-[10000] bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl transform transition-all duration-300 animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold">¡Card restaurada!</div>
                <div className="text-xs opacity-90">La visita volvió a su posición original</div>
              </div>
            </div>
          </div>
        )}
        

      </DndContext>

      {/* Custom Styles for Drag and Drop */}
      <style jsx global>{`
        .dnd-kit-dragging {
          opacity: 0.3;
          transform: rotate(2deg) scale(0.95);
        }
        
        .dnd-kit-over {
          background-color: rgba(59, 130, 246, 0.1);
          border: 2px dashed #3b82f6;
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .cursor-grab { cursor: grab; }
        .cursor-grabbing { cursor: grabbing; }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-in { animation: slideIn 0.3s ease-out; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .kanban-column {
          transition: all 0.3s ease;
        }
        
        .kanban-column:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>


    </div>
  );
};

export default KanbanBoard; 