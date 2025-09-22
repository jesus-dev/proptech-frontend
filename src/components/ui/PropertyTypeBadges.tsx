"use client";

import React from 'react';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  BuildingStorefrontIcon, 
  MapIcon 
} from '@heroicons/react/24/outline';

interface PropertyTypeBadgesProps {
  type?: string;
  className?: string;
  compact?: boolean;
}

// Mapeo de iconos por tipo de propiedad
const getPropertyTypeIcon = (typeName: string) => {
  const name = typeName.toLowerCase();
  if (name.includes('casa') || name.includes('house') || name.includes('ph') || name.includes('duplex') || name.includes('loft')) {
    return HomeIcon;
  }
  if (name.includes('apartamento') || name.includes('departamento') || name.includes('apartment') || name.includes('oficina') || name.includes('office')) {
    return BuildingOfficeIcon;
  }
  if (name.includes('local') || name.includes('comercial') || name.includes('commercial') || name.includes('tienda') || name.includes('store')) {
    return BuildingStorefrontIcon;
  }
  if (name.includes('terreno') || name.includes('land') || name.includes('lote')) {
    return MapIcon;
  }
  return HomeIcon;
};

// Mapeo de colores por tipo de propiedad
const getPropertyTypeColor = (typeName: string) => {
  const name = typeName.toLowerCase();
  if (name.includes('casa') || name.includes('house') || name.includes('ph') || name.includes('duplex') || name.includes('loft')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
  }
  if (name.includes('apartamento') || name.includes('departamento') || name.includes('apartment')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
  }
  if (name.includes('oficina') || name.includes('office')) {
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
  }
  if (name.includes('local') || name.includes('comercial') || name.includes('commercial') || name.includes('tienda') || name.includes('store')) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
  }
  if (name.includes('terreno') || name.includes('land') || name.includes('lote')) {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
};

export default function PropertyTypeBadges({ 
  type, 
  className = "", 
  compact = false 
}: PropertyTypeBadgesProps) {
  if (!type) {
    return null;
  }

  const Icon = getPropertyTypeIcon(type);
  const colorClasses = getPropertyTypeColor(type);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses} ${className}`}>
        <Icon className="w-3 h-3" />
        <span>{type}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${colorClasses} ${className}`}>
      <Icon className="w-4 h-4" />
      <span>{type}</span>
    </div>
  );
} 