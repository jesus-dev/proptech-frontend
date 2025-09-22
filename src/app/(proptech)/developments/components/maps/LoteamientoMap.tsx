"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Coordinates, Lot, Loteamiento } from '../types';

interface LoteamientoMapProps {
  development: Loteamiento;
  onLotClick?: (lot: Lot) => void;
  className?: string;
  height?: string;
}

export default function LoteamientoMap({
  development,
  onLotClick,
  className = "",
  height = "500px"
}: LoteamientoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!development.coordinates || !mapRef.current) {
      setError('Coordenadas no disponibles');
      return;
    }

    // Cargar Leaflet dinámicamente
    const loadLeaflet = () => {
      if ((window as any).L) {
        try {
          const L = (window as any).L as any;
          
          // Limpiar el contenedor
          mapRef.current!.innerHTML = '';
          
          // Crear el mapa centrado en las coordenadas del desarrollo
          const map = L.map(mapRef.current!).setView([development.coordinates!.lat, development.coordinates!.lng], 15);
          
          // Agregar capa de OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Función para obtener el color según el estado del lote
          const getLotColor = (status: string) => {
            switch (status) {
              case 'available':
                return '#10B981'; // verde
              case 'sold':
                return '#EF4444'; // rojo
              case 'reserved':
                return '#F59E0B'; // amarillo
              default:
                return '#6B7280'; // gris
            }
          };

          // Agregar polígonos para cada lote
          (development.lots || []).forEach((lot) => {
            if (lot.coordinates && lot.coordinates.length >= 3) {
              try {
                const polygon = L.polygon(
                  lot.coordinates.map(coord => [coord.lat, coord.lng]),
                  {
                    color: getLotColor(lot.status),
                    fillColor: getLotColor(lot.status),
                    fillOpacity: 0.6,
                    weight: 3
                  }
                ).addTo(map);

                // Agregar popup con información del lote
                polygon.bindPopup(`
                  <div class="p-2">
                    <h3 class="font-semibold">Lote ${lot.number}</h3>
                    <p class="text-sm">Área: ${lot.area} m²</p>
                    <p class="text-sm">Precio: $${lot.price.toLocaleString()}</p>
                    <p class="text-sm">Estado: ${
                      lot.status === 'available' ? 'Disponible' :
                      lot.status === 'sold' ? 'Vendido' : 'Reservado'
                    }</p>
                    ${lot.description ? `<p class="text-sm mt-1">${lot.description}</p>` : ''}
                  </div>
                `);

                // Agregar evento de clic si se proporciona el callback
                if (onLotClick) {
                  polygon.on('click', () => {
                    onLotClick(lot);
                  });
                }
              } catch (polygonError) {
                console.error(`Error creating polygon for lot ${lot.number}:`, polygonError);
              }
            }
          });

          // Ajustar el zoom para mostrar todos los lotes
          const validLots = (development.lots || []).filter(lot => lot.coordinates && lot.coordinates.length >= 3);
          if (validLots.length > 0) {
            try {
              const bounds = L.latLngBounds(
                validLots.flatMap(lot => 
                  lot.coordinates.map(coord => [coord.lat, coord.lng])
                )
              );
              map.fitBounds(bounds.pad(0.1));
            } catch (boundsError) {
              console.error('Error fitting bounds:', boundsError);
            }
          }

        } catch (err) {
          console.error('Error creating map:', err);
          setError('Error al cargar el mapa');
        }
      }
    };

    // Cargar Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Cargar Leaflet JS
    if ((window as any).L) {
      loadLeaflet();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = loadLeaflet;
      script.onerror = () => setError('Error al cargar Leaflet');
      document.head.appendChild(script);
    }
  }, [development, onLotClick]);

  return (
    <div className={`relative ${className}`}>
      {error && (
        <div className="absolute top-2 left-2 z-10 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div 
        ref={mapRef}
        className="w-full rounded-lg shadow-md"
        style={{ height }}
      />
      
      {/* Leyenda */}
      <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Estado de los Lotes</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Vendido</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Reservado</span>
          </div>
        </div>
      </div>
    </div>
  );
} 