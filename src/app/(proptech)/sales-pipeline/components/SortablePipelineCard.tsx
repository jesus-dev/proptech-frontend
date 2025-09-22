"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PhoneIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { SalesPipeline, STAGE_CONFIG, PRIORITY_CONFIG, SOURCE_CONFIG } from "../types";

interface SortablePipelineCardProps {
  pipeline: SalesPipeline;
  activeId: string | null;
  onPipelineDeleted: () => void;
}

export const SortablePipelineCard: React.FC<SortablePipelineCardProps> = ({
  pipeline,
  activeId,
  onPipelineDeleted,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pipeline.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de que quieres eliminar este pipeline?")) {
      try {
        // Aquí iría la llamada al servicio para eliminar
        onPipelineDeleted();
      } catch (error) {
        console.error("Error deleting pipeline:", error);
      }
    }
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

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-3 cursor-grab active:cursor-grabbing transition-all duration-300 ease-out ${
        isDragging 
          ? 'opacity-30 scale-95 rotate-1 shadow-xl' 
          : 'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {pipeline.lead ? `${pipeline.lead.firstName} ${pipeline.lead.lastName}` : 'Sin lead'}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {pipeline.property?.title || 'Sin propiedad'}
          </p>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Link
            href={`/sales-pipeline/${pipeline.id}`}
            className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <EyeIcon className="h-4 w-4" />
          </Link>
          <Link
            href={`/sales-pipeline/${pipeline.id}/edit`}
            className="p-1 text-gray-400 hover:text-green-500 dark:hover:text-green-400 rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <PencilIcon className="h-4 w-4" />
          </Link>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stage Badge */}
      <div className="mb-3">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
          getStageConfig(pipeline.stage).name === 'LEAD' 
            ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
            : getStageConfig(pipeline.stage).name === 'CONTACTED'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            : getStageConfig(pipeline.stage).name === 'MEETING'
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
            : getStageConfig(pipeline.stage).name === 'PROPOSAL'
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
            : getStageConfig(pipeline.stage).name === 'NEGOTIATION'
            ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
            : getStageConfig(pipeline.stage).name === 'CLOSED_WON'
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
            : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            getStageConfig(pipeline.stage).name === 'LEAD' ? 'bg-gray-200' :
            getStageConfig(pipeline.stage).name === 'CONTACTED' ? 'bg-blue-200' :
            getStageConfig(pipeline.stage).name === 'MEETING' ? 'bg-purple-200' :
            getStageConfig(pipeline.stage).name === 'PROPOSAL' ? 'bg-yellow-200' :
            getStageConfig(pipeline.stage).name === 'NEGOTIATION' ? 'bg-red-200' :
            getStageConfig(pipeline.stage).name === 'CLOSED_WON' ? 'bg-green-200' :
            'bg-gray-200'
          }`}></div>
          {getStageConfig(pipeline.stage).label}
        </span>
      </div>

      {/* Lead Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
          <UserIcon className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{pipeline.lead?.email || 'Sin email'}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
          <PhoneIcon className="h-3 w-3 flex-shrink-0" />
          <span>{pipeline.lead?.phone || 'Sin teléfono'}</span>
        </div>
      </div>

      {/* Financial Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
            <CurrencyDollarIcon className="h-3 w-3" />
            <span>Valor:</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {pipeline.expectedValue ? formatCurrency(pipeline.expectedValue, pipeline.currency) : '-'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
            <ChartBarIcon className="h-3 w-3" />
            <span>Probabilidad:</span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {pipeline.probability}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center">
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mr-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${pipeline.probability}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Priority and Source */}
      <div className="flex items-center justify-between">
        <span
          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
          style={{
            backgroundColor: getPriorityConfig(pipeline.priority).bgColor,
            color: getPriorityConfig(pipeline.priority).color
          }}
        >
          {getPriorityConfig(pipeline.priority).label}
        </span>
        
        {pipeline.source && (
          <span
            className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
            style={{
              backgroundColor: getSourceConfig(pipeline.source).color + '20',
              color: getSourceConfig(pipeline.source).color
            }}
          >
            {getSourceConfig(pipeline.source).label}
          </span>
        )}
      </div>

      {/* Days in Pipeline */}
      {pipeline.daysInPipeline && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Días en pipeline:</span>
            <span className="font-medium">{pipeline.daysInPipeline}</span>
          </div>
        </div>
      )}
    </div>
  );
}; 