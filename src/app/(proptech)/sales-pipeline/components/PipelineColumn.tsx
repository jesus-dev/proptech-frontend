"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UserIcon, 
  MapPinIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { SortablePipelineCard } from "./SortablePipelineCard";
import { SalesPipeline, STAGE_CONFIG } from "../types";

interface PipelineColumnProps {
  stage: typeof STAGE_CONFIG[0];
  pipelines: SalesPipeline[];
  activeId: string | null;
  onPipelineDeleted: () => void;
  onAddPipeline?: (stage: string) => void;
}

export const PipelineColumn: React.FC<PipelineColumnProps> = ({
  stage,
  pipelines,
  activeId,
  onPipelineDeleted,
  onAddPipeline,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.name,
  });

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalValue = pipelines.reduce((sum, pipeline) => sum + (pipeline.expectedValue || 0), 0);
  const avgProbability = pipelines.length > 0 
    ? pipelines.reduce((sum, pipeline) => sum + pipeline.probability, 0) / pipelines.length 
    : 0;

  return (
    <div className="flex flex-col w-80 glass rounded-2xl p-6 shadow-modern hover-lift border-modern">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-gradient-to-r from-white/60 to-white/40 dark:from-gray-800/60 dark:to-gray-700/40 backdrop-blur-sm border border-white/20 dark:border-gray-600/20">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl shadow-lg" style={{ 
            background: `linear-gradient(135deg, ${stage.color}20, ${stage.color}10)`,
            border: `1px solid ${stage.color}30`
          }}>
            <ChartBarIcon className="h-6 w-6" style={{ color: stage.color }} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-gradient">
              {stage.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              {stage.description}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg">
            {pipelines.length}
          </span>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${pipelines.length > 0 ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {pipelines.length > 0 ? 'Activo' : 'Vacío'}
            </span>
          </div>
        </div>
      </div>

      {/* Column Stats */}
      <div className="mb-6 p-4 bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-700/60 rounded-xl backdrop-blur-sm border border-white/30 dark:border-gray-600/30 shadow-lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Valor Total</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white text-gradient">
              {formatCurrency(totalValue)}
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Prob. Prom.</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {avgProbability.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[400px] p-3 rounded-xl transition-all duration-300 ${
          isOver 
            ? 'bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-dashed border-blue-400 shadow-lg' 
            : 'bg-gradient-to-br from-white/60 to-white/40 dark:from-gray-800/60 dark:to-gray-700/40 backdrop-blur-sm border border-white/20 dark:border-gray-600/20'
        }`}
      >
        <SortableContext
          items={pipelines.map((p) => p.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {pipelines.map((pipeline) => (
              <SortablePipelineCard
                key={pipeline.id}
                pipeline={pipeline}
                activeId={activeId}
                onPipelineDeleted={onPipelineDeleted}
              />
            ))}
          </div>
        </SortableContext>

        {/* Empty State */}
        {pipelines.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 mb-4 shadow-lg">
              <ArrowTrendingUpIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4">
              No hay pipelines en esta etapa
            </p>
            {onAddPipeline && (
              <button
                onClick={() => onAddPipeline(stage.name)}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Agregar Pipeline
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Pipeline Button */}
      {onAddPipeline && (
        <div className="mt-6">
          <button
            onClick={() => onAddPipeline(stage.name)}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-green-400/20"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nuevo Pipeline</span>
          </button>
        </div>
      )}
    </div>
  );
}; 