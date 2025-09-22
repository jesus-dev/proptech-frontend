"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import SuspenseBoundary from '../common/SuspenseBoundary';
import { Property } from '@/app/(proptech)/properties/components/types';

// Importar PropertyMap dinámicamente
const PropertyMap = dynamic(
  () => import('./PropertyMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Cargando mapa...</p>
        </div>
      </div>
    ),
  }
);

interface LazyPropertyMapProps {
  properties: Property[];
  propertyTypes: { name: string }[];
  center?: [number, number];
  zoom?: number;
  onPropertyClick?: (property: Property) => void;
  selectedProperty?: Property | null;
  filters?: {
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
  };
  className?: string;
}

const LazyPropertyMap: React.FC<LazyPropertyMapProps> = (props) => {
  return (
    <SuspenseBoundary className={props.className}>
      <PropertyMap {...props} />
    </SuspenseBoundary>
  );
};

export default React.memo(LazyPropertyMap); 