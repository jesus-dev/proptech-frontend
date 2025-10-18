"use client";
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Property } from '@/app/(proptech)/properties/components/types';

// Importar componentes de Leaflet dinámicamente
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// useMap no se puede importar dinámicamente, lo importamos normalmente
import { useMap } from 'react-leaflet';

// Importar Leaflet dinámicamente
let L: any = null;
if (typeof window !== 'undefined') {
  L = require('leaflet');
  require('leaflet/dist/leaflet.css');
}
// import { Tooltip } from 'react-tooltip'; // Eliminado, usamos solo title=""

// Fix para los iconos de Leaflet (solo si L está disponible)
if (L) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

const iconEmojiMap: Record<string, string> = {
  "Casa": "🏠",
  "Apartamento": "🏢",
  "Local Comercial": "🏬",
  "Terreno": "🌱",
  "Oficina": "💼"
};

const getIconColor = (type: string) => {
  switch (type) {
    case "Casa": return "#10B981";
    case "Apartamento": return "#3B82F6";
    case "Local Comercial": return "#F59E0B";
    case "Terreno": return "#8B5CF6";
    case "Oficina": return "#6B7280";
    default: return "#6B7280";
  }
};

const createPropertyIcon = (type: string, price: number) => {
  if (!L) return null;
  const color = getIconColor(type);
  const emoji = iconEmojiMap[type] || "🏠";
  return L.divIcon({
    className: 'custom-property-marker',
    html: `
      <div style="
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <span>${emoji}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

interface PropertyMapProps {
  properties: Property[];
  propertyTypes: { name: string }[]; // NUEVO
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
}

// Componente para actualizar el mapa cuando cambian las propiedades
function MapUpdater({ properties, selectedProperty }: { properties: Property[], selectedProperty?: Property | null }) {
  const map = useMap();

  useEffect(() => {
    if (properties.length > 0 && L) {
      const bounds = L.latLngBounds(
        properties.map(prop => [
          prop.latitude || -25.2637,
          prop.longitude || -57.5759
        ])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [properties, map]);

  useEffect(() => {
    if (selectedProperty) {
      const lat = selectedProperty.latitude || -25.2637;
      const lng = selectedProperty.longitude || -57.5759;
      map.setView([lat, lng], 15);
    }
  }, [selectedProperty, map]);

  return null;
}

export default function PropertyMap({
  properties,
  propertyTypes, // NUEVO
  center = [-25.2637, -57.5759], // Asunción, Paraguay
  zoom = 12,
  onPropertyClick,
  selectedProperty,
  filters
}: PropertyMapProps) {
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);
  const [mapView, setMapView] = useState<'map' | 'satellite'>('map');
  const [mapStyle, setMapStyle] = useState<'osm' | 'satellite' | 'carto' | 'toner'>('osm');

  // Filtrar propiedades
  useEffect(() => {
    let filtered = properties;

    if (filters?.type && filters.type !== 'all') {
      filtered = filtered.filter(prop => prop.type === filters.type);
    }

    if (filters?.minPrice) {
      filtered = filtered.filter(prop => prop.price >= filters.minPrice!);
    }

    if (filters?.maxPrice) {
      filtered = filtered.filter(prop => prop.price <= filters.maxPrice!);
    }

    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(prop => prop.status === filters.status);
    }

    setFilteredProperties(filtered);
  }, [properties, filters]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency || 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'house': 'Casa',
      'apartment': 'Apartamento',
      'duplex': 'Dúplex',
      'office': 'Oficina',
      'commercial': 'Local Comercial',
      'land': 'Terreno',
    };
    return types[type] || type;
  };

  const colorMap: Record<string, string> = {
    "Casa": "bg-green-500",
    "Apartamento": "bg-blue-500",
    "Local Comercial": "bg-yellow-500",
    "Terreno": "bg-purple-500",
    "Oficina": "bg-gray-500"
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Controles del mapa */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        {/* Selector de estilo de mapa */}
        <div className="flex gap-2 mb-2">
          <button
            className={`p-2 rounded ${mapStyle === 'osm' ? 'bg-blue-100 border border-blue-400' : 'bg-white border border-gray-200'} shadow`}
            onClick={() => setMapStyle('osm')}
            title="OpenStreetMap"
          >
            {/* OSM SVG */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="7" width="7" height="13" rx="2" fill="#3B82F6" />
              <rect x="14" y="4" width="7" height="16" rx="2" fill="#10B981" />
            </svg>
          </button>
          <button
            className={`p-2 rounded ${mapStyle === 'satellite' ? 'bg-blue-100 border border-blue-400' : 'bg-white border border-gray-200'} shadow`}
            onClick={() => setMapStyle('satellite')}
            title="Satélite"
          >
            {/* Satélite SVG */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#F59E0B" />
              <rect x="8" y="8" width="8" height="8" fill="#fff" />
            </svg>
          </button>
          <button
            className={`p-2 rounded ${mapStyle === 'carto' ? 'bg-blue-100 border border-blue-400' : 'bg-white border border-gray-200'} shadow`}
            onClick={() => setMapStyle('carto')}
            title="CartoDB Positron"
          >
            {/* CartoDB SVG */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="4" fill="#6366F1" />
              <rect x="8" y="8" width="8" height="8" fill="#fff" />
            </svg>
          </button>
          <button
            className={`p-2 rounded ${mapStyle === 'toner' ? 'bg-blue-100 border border-blue-400' : 'bg-white border border-gray-200'} shadow`}
            onClick={() => setMapStyle('toner')}
            title="Stamen Toner"
          >
            {/* Toner SVG */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="4" fill="#111827" />
              <rect x="8" y="8" width="8" height="8" fill="#fff" />
            </svg>
          </button>
        </div>
        {/* Botón de vista mapa/satélite (opcional, puedes dejarlo o quitarlo) */}
        <button
          onClick={() => setMapView(mapView === 'map' ? 'satellite' : 'map')}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          title={mapView === 'map' ? 'Ver satélite' : 'Ver mapa'}
        >
          {mapView === 'map' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
          )}
        </button>
        {/* Leyenda dinámica */}
        <div className="bg-white p-3 rounded-lg shadow-lg">
          <h4 className="text-sm font-semibold mb-2">Tipos de Propiedad</h4>
          <div className="space-y-1 text-xs">
            {propertyTypes && propertyTypes.length > 0 ? (
              propertyTypes.map(type => (
                <div className="flex items-center gap-2" key={type.name}>
                  <div className={`w-3 h-3 rounded-full ${colorMap[type.name] || 'bg-black'}`}></div>
                  <span>{type.name}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-400">Sin tipos</div>
            )}
          </div>
        </div>
      </div>

      {/* Contador de propiedades */}
      <div className="absolute top-4 right-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-lg">
        <span className="text-sm font-semibold">
          {filteredProperties.length} propiedades
        </span>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        style={{ height: '500px' }}
      >
        <MapUpdater properties={filteredProperties} selectedProperty={selectedProperty} />
        {/* TileLayers dinámicos según el estilo seleccionado */}
        {mapStyle === 'osm' && (
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {mapStyle === 'satellite' && (
          <TileLayer
            attribution='&copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}
        {mapStyle === 'carto' && (
          <TileLayer
            attribution='&copy; CartoDB'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
        )}
        {mapStyle === 'toner' && (
          <TileLayer
            attribution='&copy; Stamen'
            url="https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
          />
        )}

        {filteredProperties.map((property) => {
          const lat = property.latitude || -25.2637;
          const lng = property.longitude || -57.5759;
          const icon = createPropertyIcon(property.type, property.price);

          return (
            <Marker
              key={property.id}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => onPropertyClick?.(property),
              }}
            >
              <Popup>
                <div className="property-popup min-w-[250px]">
                  <div className="relative mb-3">
                    <img
                      src={property.images?.[0] || '/images/carousel/carousel-01.png'}
                      alt={property.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        property.status?.toLowerCase() === 'active' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {property.status?.toLowerCase() === 'active' ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    {property.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {property.address}
                  </p>
                  
                  <div className="text-lg font-bold text-brand-600 mb-3">
                    {formatPrice(property.price, property.currency)}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                      <span>{property.bedrooms || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 6h8" />
                      </svg>
                      <span>{property.bathrooms || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <span>{property.area || 0}m²</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {getPropertyTypeLabel(property.type)}
                    </span>
                    <button
                      onClick={() => onPropertyClick?.(property)}
                      className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                    >
                      Ver detalles →
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style jsx global>{`
        .custom-property-marker {
          background: transparent !important;
          border: none !important;
        }
        .property-marker {
          transition: all 0.2s ease;
        }
        .property-marker:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        .leaflet-popup,
        .leaflet-popup-pane,
        .leaflet-top,
        .leaflet-control {
          z-index: 2147483647 !important;
        }
        .leaflet-container {
          z-index: 0 !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25) !important;
          border: 2px solid #2563eb !important;
        }
        .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        .property-popup {
          padding: 0;
        }
      `}</style>
    </div>
  );
} 