"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";

import { 
  SalesPipeline, 
  STAGE_CONFIG,
} from "./types";
import { salesPipelineService } from "./services/salesPipelineService";
import { PipelineColumn } from "./components/PipelineColumn";

export default function SalesPipelineMinimalist() {
  const router = useRouter();
  const [pipelines, setPipelines] = useState<SalesPipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await salesPipelineService.getAllPipelines();
      setPipelines(data);
      setError(null);
    } catch (err) {
      console.error('Error loading pipelines:', err);
      setError('Error al cargar el pipeline de ventas');
    } finally {
      setLoading(false);
    }
  };

  const getPipelinesByStage = (stage: string) => {
    let filtered = pipelines.filter(p => p.stage === stage);
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        (p.lead?.firstName + ' ' + p.lead?.lastName).toLowerCase().includes(search) ||
        p.property?.title?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activePipeline = pipelines.find((p) => p.id.toString() === active.id);
    if (!activePipeline) return;

    const newStage = over.id as string;
    if (newStage === activePipeline.stage) return;

    const validStages = STAGE_CONFIG.map(stage => stage.name);
    if (!validStages.includes(newStage)) return;

    try {
      await salesPipelineService.updatePipeline(activePipeline.id, {
        stage: newStage as any,
      });
      await loadData();
    } catch (err) {
      console.error("Error updating pipeline stage:", err);
    }
  };

  // Calcular estadísticas
  const stats = {
    total: pipelines.length,
    won: pipelines.filter(p => p.stage === 'CLOSED_WON').length,
    lost: pipelines.filter(p => p.stage === 'CLOSED_LOST').length,
    active: pipelines.filter(p => !['CLOSED_WON', 'CLOSED_LOST'].includes(p.stage)).length,
    totalValue: pipelines
      .filter(p => !['CLOSED_LOST'].includes(p.stage))
      .reduce((sum, p) => sum + (p.expectedValue || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={loadData}
            className="text-sm text-gray-600 underline hover:text-gray-900"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header - Minimalista */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-light text-gray-900 dark:text-white mb-1">
                Pipeline de Ventas
              </h1>
              <p className="text-sm text-gray-500">
                {stats.active} activos · {stats.won} ganados · {stats.lost} perdidos
              </p>
            </div>
            
            <button
              onClick={() => router.push('/sales-pipeline/new')}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 rounded-lg transition-colors"
            >
              + Nuevo
            </button>
          </div>

          {/* Search Bar - Minimalista */}
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-sm border-b border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-300 bg-transparent outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Stats Bar - Minimalista */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-light text-gray-900 dark:text-white">
                {stats.total}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Total
              </div>
            </div>
            <div>
              <div className="text-2xl font-light text-gray-900 dark:text-white">
                {stats.active}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Activos
              </div>
            </div>
            <div>
              <div className="text-2xl font-light text-green-600">
                {stats.won}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Ganados
              </div>
            </div>
            <div>
              <div className="text-2xl font-light text-gray-900 dark:text-white">
                {new Intl.NumberFormat('es-PY', {
                  style: 'currency',
                  currency: 'PYG',
                  minimumFractionDigits: 0,
                }).format(stats.totalValue)}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Valor Pipeline
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board - Minimalista */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-6 gap-3">
            {STAGE_CONFIG.slice(0, 6).map((stage) => {
              const stagePipelines = getPipelinesByStage(stage.name);
              const stageValue = stagePipelines.reduce((sum, p) => sum + (p.expectedValue || 0), 0);
              
              return (
                <div key={stage.name} className="min-h-[600px]">
                  {/* Column Header - Minimalista */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs uppercase tracking-wide font-medium text-gray-700 dark:text-gray-300">
                        {stage.label}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {stagePipelines.length}
                      </span>
                    </div>
                    {stageValue > 0 && (
                      <div className="text-xs text-gray-500">
                        {new Intl.NumberFormat('es-PY', {
                          style: 'currency',
                          currency: 'PYG',
                          notation: 'compact',
                          maximumFractionDigits: 0
                        }).format(stageValue)}
                      </div>
                    )}
                  </div>

                  {/* Drop Zone */}
                  <div 
                    id={stage.name}
                    className="space-y-2 min-h-[500px] p-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: activeId ? 'rgba(0,0,0,0.02)' : 'transparent'
                    }}
                  >
                    {stagePipelines.map((pipeline) => (
                      <div
                        key={pipeline.id}
                        draggable
                        onDragStart={() => setActiveId(pipeline.id.toString())}
                        className={`
                          p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 
                          rounded-lg cursor-move hover:border-gray-300 dark:hover:border-gray-700 
                          transition-all
                          ${activeId === pipeline.id.toString() ? 'opacity-50' : 'opacity-100'}
                        `}
                      >
                        {/* Card Content - Super Minimalista */}
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                            {pipeline.lead ? `${pipeline.lead.firstName} ${pipeline.lead.lastName}` : 'Sin lead'}
                          </div>
                          
                          {pipeline.property && (
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {pipeline.property.title}
                            </div>
                          )}
                          
                          {pipeline.expectedValue && (
                            <div className="text-xs font-medium text-gray-900 dark:text-white">
                              {new Intl.NumberFormat('es-PY', {
                                style: 'currency',
                                currency: pipeline.currency || 'PYG',
                                minimumFractionDigits: 0,
                              }).format(pipeline.expectedValue)}
                            </div>
                          )}
                          
                          {/* Priority Indicator - Minimal */}
                          {pipeline.priority === 'URGENT' && (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                              <span className="text-xs text-red-600">Urgente</span>
                            </div>
                          )}
                          {pipeline.priority === 'HIGH' && (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                              <span className="text-xs text-orange-600">Alta</span>
                            </div>
                          )}
                          
                          {/* Phone - Mini */}
                          {pipeline.lead?.phone && (
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <span>📞</span>
                              {pipeline.lead.phone}
                            </div>
                          )}
                          
                          {/* Days in pipeline */}
                          {pipeline.daysInPipeline && pipeline.daysInPipeline > 0 && (
                            <div className="text-xs text-gray-400">
                              {pipeline.daysInPipeline}d en pipeline
                            </div>
                          )}
                        </div>

                        {/* Actions - Minimal */}
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                          <div className="text-xs text-gray-400">
                            {pipeline.probability}%
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/sales-pipeline/${pipeline.id}`);
                              }}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                              title="Ver detalles"
                            >
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {stagePipelines.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-xs text-gray-400">
                        Vacío
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DndContext>
      </div>
    </div>
  );
}

