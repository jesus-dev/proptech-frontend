"use client";

import { ArrowPathIcon, ChartBarIcon, CheckCircleIcon, CurrencyDollarIcon, EnvelopeIcon, EyeIcon, FunnelIcon, InformationCircleIcon, PencilIcon, PhoneIcon, PlusIcon, UsersIcon, XCircleIcon } from "@heroicons/react/24/outline";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

import { 
  SalesPipeline, 
  STAGE_CONFIG, 
  PRIORITY_CONFIG, 
  SOURCE_CONFIG,
  PipelineOverview,
  StageBreakdown,
  AgentPerformance,
  SourceAnalysis
} from "./types";
import { salesPipelineService } from "./services/salesPipelineService";
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { PipelineColumn } from "./components/PipelineColumn";
import { SortablePipelineCard } from "./components/SortablePipelineCard";

export default function SalesPipelinePage() {
  const router = useRouter();
  const [pipelines, setPipelines] = useState<SalesPipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'analytics'>('kanban');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<SalesPipeline | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    stage: '',
    priority: '',
    source: ''
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragFailed, setDragFailed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowKeyboardShortcuts(false);
      }
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
    return pipelines.filter(p => p.stage === stage);
  };

  const handleMoveToStage = async (pipelineId: number, newStage: string) => {
    try {
      await salesPipelineService.updatePipeline(pipelineId, { 
        stage: newStage as 'LEAD' | 'CONTACTED' | 'MEETING' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST'
      });
      await loadData();
    } catch (error) {
      console.error('Error updating pipeline:', error);
    }
  };

  const handleUpdateContact = async (pipelineId: number, notes: string) => {
    try {
      await salesPipelineService.updatePipeline(pipelineId, { notes });
      await loadData();
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleCloseDeal = async (pipelineId: number, closeReason: string, actualValue: number) => {
    try {
      await salesPipelineService.updatePipeline(pipelineId, { 
        stage: 'CLOSED_WON',
        closeReason,
        actualValue
      });
      await loadData();
    } catch (error) {
      console.error('Error closing deal:', error);
    }
  };

  const handleLoseDeal = async (pipelineId: number, closeReason: string) => {
    try {
      await salesPipelineService.updatePipeline(pipelineId, { 
        stage: 'CLOSED_LOST',
        closeReason
      });
      await loadData();
    } catch (error) {
      console.error('Error losing deal:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PY');
  };

  const getStageConfig = (stage: string) => {
    return STAGE_CONFIG.find(s => s.name === stage) || STAGE_CONFIG[0];
  };

  const getPriorityConfig = (priority: string) => {
    return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.MEDIUM;
  };

  const getSourceConfig = (source: string) => {
    return SOURCE_CONFIG[source as keyof typeof SOURCE_CONFIG] || SOURCE_CONFIG.OTHER;
  };

  const findPipeline = (id: string): SalesPipeline | undefined => {
    return pipelines.find((p) => p.id.toString() === id);
  };

  const handleDragStart = (event: DragStartEvent) => {
    console.log("Drag start:", event.active.id);
    setActiveId(event.active.id as string);
    setDragFailed(false);
    
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
      return;
    }

    const activePipeline = findPipeline(active.id as string);
    if (!activePipeline) {
      console.log("No active pipeline found");
      return;
    }

    const newStage = over.id as string;
    if (newStage === activePipeline.stage) {
      console.log("Same stage, no change needed");
      return;
    }

    // Verificar que el over.id sea una etapa válida
    const validStages = STAGE_CONFIG.map(stage => stage.name);
    if (!validStages.includes(newStage)) {
      console.log("Invalid drop target - returning to original position");
      setDragFailed(true);
      setTimeout(() => setDragFailed(false), 1000);
      return;
    }

    console.log(`Moving pipeline ${activePipeline.id} from ${activePipeline.stage} to ${newStage}`);

    try {
      const updatedPipeline = await salesPipelineService.updatePipeline(activePipeline.id, {
        stage: newStage as any,
      });

      if (updatedPipeline) {
        console.log("Pipeline updated successfully:", updatedPipeline);
        await loadData(); // Recargar datos
      }
    } catch (err) {
      console.error("Error updating pipeline stage:", err);
      setDragFailed(true);
      setTimeout(() => setDragFailed(false), 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-green-400 rounded-full animate-spin" style={{ animationDelay: '0.1s' }}></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cargando pipeline</h3>
          <p className="text-gray-600 dark:text-gray-400">Preparando tu tablero de ventas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ChartBarIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Title Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-900 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                  Pipeline de Ventas
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Gestiona y analiza tu pipeline de ventas
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/30"
              >
                <FunnelIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Filtros
              </button>
              <button
                onClick={() => router.push('/sales-pipeline/new')}
                className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/30"
              >
                <PlusIcon className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                Nuevo Lead
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Mode Tabs */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-2 mb-8">
          <div className="flex space-x-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                viewMode === 'kanban' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
            >
              Vista Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                viewMode === 'analytics' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
            >
              <ChartBarIcon className="h-5 w-5 mr-2 inline" />
              Analytics
            </button>
          </div>
        </div>

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
                placeholder="Buscar pipelines..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 text-sm transition-all duration-200"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {pipelines.length} pipelines
              </span>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
              <button
                onClick={loadData}
                className="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                title="Recargar pipelines (Ctrl+R)"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowKeyboardShortcuts(true)}
                className="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                title="Atajos de teclado (Ctrl+?)"
              >
                <InformationCircleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={filters.stage}
                  onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
                  className="px-4 py-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 text-sm transition-all duration-200"
                >
                  <option value="">Todas las etapas</option>
                  {STAGE_CONFIG.map(stage => (
                    <option key={stage.name} value={stage.name}>{stage.label}</option>
                  ))}
                </select>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="px-4 py-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 text-sm transition-all duration-200"
                >
                  <option value="">Todas las prioridades</option>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
                <select
                  value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                  className="px-4 py-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 text-sm transition-all duration-200"
                >
                  <option value="">Todas las fuentes</option>
                  {Object.entries(SOURCE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Content based on view mode */}
        {viewMode === 'kanban' && (
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
            <div className="flex space-x-6 overflow-x-auto w-full min-w-0">
              {STAGE_CONFIG.map((stage) => (
                <PipelineColumn
                  key={stage.name}
                  stage={stage}
                  pipelines={getPipelinesByStage(stage.name)}
                  activeId={activeId}
                  onPipelineDeleted={loadData}
                  onAddPipeline={(stageName) => router.push(`/sales-pipeline/new?stage=${stageName}`)}
                />
              ))}
            </div>

            <DragOverlay>
              {null}
            </DragOverlay>
            
            {/* Custom overlay that follows mouse */}
            {activeId && findPipeline(activeId) && (
              <div 
                className="fixed pointer-events-none z-[9999] w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-green-500 p-4 transform rotate-1"
                style={{
                  left: mousePosition.x - 36,
                  top: mousePosition.y - 36,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
                    {findPipeline(activeId)!.lead ? `${findPipeline(activeId)!.lead!.firstName} ${findPipeline(activeId)!.lead!.lastName}` : 'Sin lead'}
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse ml-2"></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                  {findPipeline(activeId)!.property?.title || 'Sin propiedad'}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    findPipeline(activeId)!.stage === 'LEAD' 
                      ? 'bg-gray-100 text-gray-800'
                      : findPipeline(activeId)!.stage === 'CONTACTED'
                      ? 'bg-blue-100 text-blue-800'
                      : findPipeline(activeId)!.stage === 'MEETING'
                      ? 'bg-purple-100 text-purple-800'
                      : findPipeline(activeId)!.stage === 'PROPOSAL'
                      ? 'bg-yellow-100 text-yellow-800'
                      : findPipeline(activeId)!.stage === 'NEGOTIATION'
                      ? 'bg-red-100 text-red-800'
                      : findPipeline(activeId)!.stage === 'CLOSED_WON'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getStageConfig(findPipeline(activeId)!.stage).label}
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
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
                    <div className="text-sm font-semibold">¡Pipeline restaurado!</div>
                    <div className="text-xs opacity-90">El pipeline volvió a su posición original</div>
                  </div>
                </div>
              </div>
            )}
          </DndContext>
        )}

        {viewMode === 'list' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Propiedad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Etapa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Probabilidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {pipelines.map((pipeline) => (
                    <tr key={pipeline.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {pipeline.lead ? `${pipeline.lead.firstName} ${pipeline.lead.lastName}` : 'Sin lead'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {pipeline.lead?.email || 'Sin email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {pipeline.property?.title || 'Sin propiedad'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          style={{
                            backgroundColor: getStageConfig(pipeline.stage).color + '20',
                            color: getStageConfig(pipeline.stage).color
                          }}
                        >
                          {getStageConfig(pipeline.stage).label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {pipeline.expectedValue ? formatCurrency(pipeline.expectedValue, pipeline.currency) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${pipeline.probability}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{pipeline.probability}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedPipeline(pipeline)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Analytics del Pipeline</h2>
            <p className="text-gray-600 dark:text-gray-400">Funcionalidad de analytics en desarrollo...</p>
          </div>
        )}
      </div>

      {/* Pipeline Detail Modal */}
      {selectedPipeline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detalles del Pipeline
                </h2>
                <button
                  onClick={() => setSelectedPipeline(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Información del Lead</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre:</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedPipeline.lead ? `${selectedPipeline.lead.firstName} ${selectedPipeline.lead.lastName}` : 'Sin lead'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedPipeline.lead?.email || 'Sin email'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono:</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedPipeline.lead?.phone || 'Sin teléfono'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Información de la Propiedad</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Título:</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedPipeline.property?.title || 'Sin propiedad'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dirección:</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedPipeline.property?.address || 'Sin dirección'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Precio:</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedPipeline.property?.price ? formatCurrency(selectedPipeline.property.price, selectedPipeline.property.currency) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Información del Pipeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Etapa:</label>
                    <div className="mt-1">
                      <span
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: getStageConfig(selectedPipeline.stage).color + '20',
                          color: getStageConfig(selectedPipeline.stage).color
                        }}
                      >
                        {getStageConfig(selectedPipeline.stage).label}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prioridad:</label>
                    <div className="mt-1">
                      <span
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: getPriorityConfig(selectedPipeline.priority).bgColor,
                          color: getPriorityConfig(selectedPipeline.priority).color
                        }}
                      >
                        {getPriorityConfig(selectedPipeline.priority).label}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fuente:</label>
                    <div className="mt-1">
                      <span
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: getSourceConfig(selectedPipeline.source || '').color + '20',
                          color: getSourceConfig(selectedPipeline.source || '').color
                        }}
                      >
                        {selectedPipeline.source ? getSourceConfig(selectedPipeline.source).label : 'Sin fuente'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Información Financiera</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Valor Esperado:</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedPipeline.expectedValue ? formatCurrency(selectedPipeline.expectedValue, selectedPipeline.currency) : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Probabilidad:</label>
                    <div className="flex items-center mt-1">
                      <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${selectedPipeline.probability}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedPipeline.probability}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Días en Pipeline:</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedPipeline.daysInPipeline || 0}</p>
                  </div>
                </div>
              </div>

              {selectedPipeline.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Notas</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedPipeline.notes}</p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedPipeline(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cerrar
                </button>
                {selectedPipeline.stage !== 'CLOSED_WON' && selectedPipeline.stage !== 'CLOSED_LOST' && (
                  <button
                    onClick={() => {
                      handleMoveToStage(selectedPipeline.id, 'CONTACTED');
                      setSelectedPipeline(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Marcar como Contactado
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/50 z-[10001] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Atajos de Teclado
              </h3>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Recargar pipelines</span>
                <kbd className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded">Ctrl+R</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Mostrar atajos</span>
                <kbd className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded">Ctrl+?</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Cerrar modal</span>
                <kbd className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded">Esc</kbd>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-green-700 dark:text-green-300">
                💡 <strong>Tip:</strong> Puedes arrastrar los pipelines entre etapas para cambiar su estado
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles for Drag and Drop */}
      <style jsx global>{`
        .dnd-kit-dragging {
          opacity: 0.3;
          transform: rotate(2deg) scale(0.95);
        }
        
        .dnd-kit-over {
          background-color: rgba(34, 197, 94, 0.1);
          border: 2px dashed #22c55e;
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
        
        /* Cursor styles */
        .cursor-grab {
          cursor: grab;
        }
        
        .cursor-grabbing {
          cursor: grabbing;
        }
        
        /* Animations */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-in {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* Hover effects */
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        /* Smooth transitions */
        * {
          transition: all 0.2s ease;
        }
        
        /* Column animations */
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
} 