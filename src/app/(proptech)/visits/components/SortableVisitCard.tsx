"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Visit } from "./types";
import { visitService } from "../services/visitService";
import Link from "next/link";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";

interface SortableVisitCardProps {
  visit: Visit;
  activeId: string | null;
  getProperty: (id: string) => any;
  onVisitDeleted: () => void;
}

export const SortableVisitCard: React.FC<SortableVisitCardProps> = ({
  visit,
  activeId,
  getProperty,
  onVisitDeleted,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: visit.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("¿Estás seguro de que deseas eliminar esta visita?")) {
      const success = await visitService.deleteVisit(visit.id);
      if (success) {
        onVisitDeleted();
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm';
      case 'in_progress':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm';
      case 'completed':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-sm';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
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
            {visit.title}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {visit.description}
          </p>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Link
            href={`/visits/${visit.id}`}
            className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <EyeIcon className="h-4 w-4" />
          </Link>
          <Link
            href={`/visits/${visit.id}/edit`}
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

      {/* Status Badge */}
      <div className="mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
          {getStatusLabel(visit.status)}
        </span>
      </div>

      {/* Client Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
          <UserIcon className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{visit.clientName}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
          <CalendarIcon className="h-3 w-3 flex-shrink-0" />
          <span>{new Date(visit.scheduledDate).toLocaleDateString('es-ES', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>

        {visit.clientEmail && (
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
            <EnvelopeIcon className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{visit.clientEmail}</span>
          </div>
        )}

        {visit.clientPhone && (
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
            <PhoneIcon className="h-3 w-3 flex-shrink-0" />
            <span>{visit.clientPhone}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
          <svg className="h-3 w-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="truncate">{visit.propertyId ? `Propiedad #${visit.propertyId}` : 'Sin propiedad'}</span>
        </div>
      </div>

      {/* Drag Handle */}
      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
          <span className="ml-2">Arrastra para mover</span>
        </div>
      </div>
    </div>
  );
}; 