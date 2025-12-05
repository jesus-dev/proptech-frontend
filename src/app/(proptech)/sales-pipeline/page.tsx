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

export default function SalesPipelinePage() {
  const router = useRouter();
  const [pipelines, setPipelines] = useState<SalesPipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    stage: '',
    priority: '',
    source: ''
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // Keyboard shortcut para reload
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        loadData();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    
    // Filtrar por búsqueda si existe
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        (p.lead?.firstName + ' ' + p.lead?.lastName).toLowerCase().includes(search) ||
        p.property?.title?.toLowerCase().includes(search) ||
        p.lead?.email?.toLowerCase().includes(search) ||
        p.lead?.phone?.includes(search)
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

  // Calcular estadísticas (DESPUÉS de verificar loading/error)
  const activePipelines = pipelines.filter(p => !['CLOSED_WON', 'CLOSED_LOST'].includes(p.stage));
  const stats = {
    total: pipelines.length,
    won: pipelines.filter(p => p.stage === 'CLOSED_WON').length,
    lost: pipelines.filter(p => p.stage === 'CLOSED_LOST').length,
    active: activePipelines.length,
    totalValue: activePipelines.reduce((sum, p) => sum + (p.expectedValue || 0), 0),
    avgProbability: activePipelines.length > 0 
      ? Math.round(activePipelines.reduce((sum, p) => sum + (p.probability || 0), 0) / activePipelines.length)
      : 0,
    wonValue: pipelines
      .filter(p => p.stage === 'CLOSED_WON')
      .reduce((sum, p) => sum + (p.expectedValue || 0), 0),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header - Minimalista */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-light text-gray-900 dark:text-white mb-1">
                Pipeline
              </h1>
              <p className="text-sm text-gray-500">
                {stats.active} activos · {stats.won} ganados · {stats.lost} perdidos
              </p>
            </div>
            
            <button
              onClick={() => router.push('/sales-pipeline/new')}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-gray-300 rounded transition-colors"
            >
              + Nuevo
            </button>
          </div>

        </div>

        {/* Search - Minimalista */}
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Buscar leads o propiedades..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full px-3 py-2 text-sm border-b border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-300 bg-transparent outline-none transition-colors placeholder:text-gray-400"
          />
        </div>

        {/* Stats Cards - Mejorado */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          {/* Total Oportunidades */}
          <div className="group relative p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">
                Total
              </span>
            </div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
              {stats.total}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Oportunidades
            </div>
          </div>

          {/* Activos */}
          <div className="group relative p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl border border-purple-200 dark:border-purple-800 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-purple-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded">
                Activos
              </span>
            </div>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">
              {stats.active}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              En proceso
            </div>
          </div>

          {/* Ganados */}
          <div className="group relative p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-green-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">
                Ganados
              </span>
            </div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
              {stats.won}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              {stats.wonValue > 0 && (
                <span className="font-medium">
                  {new Intl.NumberFormat('es-PY', {
                    style: 'currency',
                    currency: 'PYG',
                    notation: 'compact',
                    minimumFractionDigits: 0,
                  }).format(stats.wonValue)}
                </span>
              )}
              {stats.wonValue === 0 && 'Cerrados'}
            </div>
          </div>

          {/* Valor Total Pipeline */}
          <div className="group relative p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 rounded-xl border border-amber-200 dark:border-amber-800 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-amber-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded">
                Pipeline
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-amber-900 dark:text-amber-100 mb-1 truncate">
              {new Intl.NumberFormat('es-PY', {
                style: 'currency',
                currency: 'PYG',
                notation: 'compact',
                minimumFractionDigits: 0,
              }).format(stats.totalValue)}
            </div>
            <div className="text-sm text-amber-600 dark:text-amber-400">
              Valor activo
            </div>
          </div>

          {/* Probabilidad Promedio */}
          <div className="group relative p-4 bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/10 rounded-xl border border-cyan-200 dark:border-cyan-800 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-cyan-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/50 px-2 py-1 rounded">
                Prob.
              </span>
            </div>
            <div className="text-3xl font-bold text-cyan-900 dark:text-cyan-100 mb-1">
              {stats.avgProbability}%
            </div>
            <div className="text-sm text-cyan-600 dark:text-cyan-400">
              Promedio
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board - Minimalista */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
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
                  <div key={stage.name}>
                    {/* Column Header - Minimalista */}
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs uppercase tracking-wider font-medium text-gray-600 dark:text-gray-400">
                          {stage.label}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {stagePipelines.length}
                        </span>
                      </div>
                      {stageValue > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Intl.NumberFormat('es-PY', {
                            style: 'currency',
                            currency: 'PYG',
                            notation: 'compact',
                            maximumFractionDigits: 0
                          }).format(stageValue)}
                        </div>
                      )}
                    </div>

                    {/* Drop Zone - Minimalista */}
                    <div 
                      id={stage.name}
                      className="space-y-2 min-h-[500px]"
                    >
                      {stagePipelines.map((pipeline) => {
                        const leadName = pipeline.lead 
                          ? `${pipeline.lead.firstName} ${pipeline.lead.lastName}`
                          : 'Sin lead';
                        const initials = pipeline.lead
                          ? `${pipeline.lead.firstName?.[0] || ''}${pipeline.lead.lastName?.[0] || ''}`.toUpperCase()
                          : '?';
                        
                        return (
                          <div
                            key={pipeline.id}
                            draggable
                            onDragStart={() => setActiveId(pipeline.id.toString())}
                            onClick={() => router.push(`/sales-pipeline/${pipeline.id}`)}
                            className={`
                              group relative p-4 bg-white dark:bg-gray-900 
                              border border-gray-200 dark:border-gray-800 
                              rounded-lg cursor-move 
                              hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700
                              transition-all duration-200
                              ${activeId === pipeline.id.toString() ? 'opacity-30 scale-95' : ''}
                              ${pipeline.priority === 'URGENT' ? 'border-l-4 border-l-red-500' : ''}
                              ${pipeline.priority === 'HIGH' ? 'border-l-4 border-l-orange-500' : ''}
                            `}
                          >
                            {/* Header con Avatar y Nombre */}
                            <div className="flex items-start gap-3 mb-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                {initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                  {leadName}
                                </div>
                                {pipeline.lead?.email && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {pipeline.lead.email}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Property Info */}
                            {pipeline.property && (
                              <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  Propiedad
                                </div>
                                <div className="text-sm text-gray-900 dark:text-white truncate font-medium">
                                  {pipeline.property.title}
                                </div>
                              </div>
                            )}

                            {/* Value y Probability */}
                            <div className="flex items-center justify-between mb-3">
                              {pipeline.expectedValue ? (
                                <div>
                                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('es-PY', {
                                      style: 'currency',
                                      currency: pipeline.currency || 'PYG',
                                      notation: 'compact',
                                      minimumFractionDigits: 0,
                                    }).format(pipeline.expectedValue)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Valor esperado
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">Sin valor</div>
                              )}
                              
                              <div className="text-right">
                                <div className="text-lg font-semibold text-blue-600">
                                  {pipeline.probability}%
                                </div>
                                <div className="text-xs text-gray-500">
                                  Prob.
                                </div>
                              </div>
                            </div>

                            {/* Footer con acciones y metadata */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2">
                                {pipeline.lead?.phone && (
                                  <a
                                    href={`tel:${pipeline.lead.phone}`}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Llamar"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                  </a>
                                )}
                                {pipeline.lead?.email && (
                                  <a
                                    href={`mailto:${pipeline.lead.email}`}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Email"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                  </a>
                                )}
                              </div>
                              
                              {/* Source badge */}
                              {pipeline.source && (
                                <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                                  {pipeline.source}
                                </div>
                              )}
                            </div>

                            {/* Hover indicator */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                          </div>
                        );
                      })}
                      
                      {stagePipelines.length === 0 && (
                        <div className="flex items-center justify-center h-32 text-xs text-gray-400">
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
      
      {/* Minimal Styles */}
      <style jsx global>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
} 