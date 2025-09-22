"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Coordinates, Lot, Loteamiento, Condominio, BarrioCerrado } from '../types';

interface RealLoteamientoMapProps {
  development: Loteamiento | Condominio | BarrioCerrado;
  onLotClick?: (lot: Lot) => void;
  className?: string;
  height?: string;
}

declare global {
  interface Window {
    L: unknown;
  }
}

export default function RealLoteamientoMap({
  development,
  onLotClick,
  className = "",
  height = "500px"
}: RealLoteamientoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('RealLoteamientoMap useEffect triggered');
    console.log('Development:', development);
    console.log('Coordinates:', development.coordinates);
    console.log('Map ref:', mapRef.current);
    
    if (!development.coordinates || !mapRef.current) {
      console.log('Map not initialized - missing coordinates or map ref');
      setError('Coordenadas no disponibles');
      setIsLoading(false);
      return;
    }

    let map: any = null;
    let L: any = null;

    const initializeMap = async () => {
      try {
        console.log('Starting map initialization...');
        setIsLoading(true);
        setError(null);

        // Cargar Leaflet CSS si no está cargado
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          console.log('Loading Leaflet CSS...');
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Cargar Leaflet JS
        if (!window.L) {
          console.log('Loading Leaflet JS...');
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = () => {
              console.log('Leaflet JS loaded successfully');
              resolve();
            };
            script.onerror = () => {
              console.error('Error loading Leaflet JS');
              reject(new Error('Error loading Leaflet'));
            };
            document.head.appendChild(script);
          });
        }

        L = window.L;
        if (!L) {
          throw new Error('Leaflet no se cargó correctamente');
        }

        console.log('Leaflet loaded, creating map...');

        // Limpiar el contenedor
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
        }

        // Crear el mapa
        map = (L as any).map(mapRef.current!).setView(
          [development.coordinates!.lat, development.coordinates!.lng], 
          16
        );

        console.log('Map created, adding tile layer...');

        // Agregar capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        console.log('Tile layer added, processing lots...');

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
        const validLots = (development.lots || []).filter(
          lot => lot.coordinates && lot.coordinates.length >= 3
        );

        console.log('Valid lots found:', validLots.length);

        if (validLots.length === 0) {
          setError('No hay lotes con coordenadas válidas');
          setIsLoading(false);
          return;
        }

        validLots.forEach((lot, index) => {
          console.log(`Adding polygon for lot ${lot.number} (${index + 1}/${validLots.length})`);
          try {
            const polygon = L.polygon(
              lot.coordinates.map(coord => [coord.lat, coord.lng]),
              {
                color: getLotColor(lot.status),
                fillColor: getLotColor(lot.status),
                fillOpacity: 0.6,
                weight: 2
              }
            ).addTo(map);

            // Agregar popup con información del lote
            polygon.bindPopup(`
              <div class="p-3 min-w-[200px]">
                <h3 class="font-semibold text-lg mb-2">Lote ${lot.number}</h3>
                <div class="space-y-1 text-sm">
                  <p><strong>Área:</strong> ${lot.area} m²</p>
                  <p><strong>Precio:</strong> $${lot.price.toLocaleString()}</p>
                  <p><strong>Estado:</strong> ${
                    lot.status === 'available' ? 'Disponible' :
                    lot.status === 'sold' ? 'Vendido' : 'Reservado'
                  }</p>
                  ${lot.description ? `<p class="mt-2 text-gray-600">${lot.description}</p>` : ''}
                </div>
              </div>
            `);

            // Agregar evento de clic
            if (onLotClick) {
              polygon.on('click', () => {
                onLotClick(lot);
              });
            }
          } catch (polygonError) {
            console.error(`Error creating polygon for lot ${lot.number}:`, polygonError);
          }
        });

        // Ajustar el zoom para mostrar todos los lotes
        if (validLots.length > 0) {
          console.log('Fitting bounds to show all lots...');
          const bounds = L.latLngBounds(
            validLots.flatMap(lot => 
              lot.coordinates.map(coord => [coord.lat, coord.lng])
            )
          );
          map.fitBounds(bounds.pad(0.1));
        }

        console.log('Map initialization complete');
        setIsLoading(false);

      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Error al cargar el mapa');
        setIsLoading(false);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [development, onLotClick]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
            <span className="text-sm text-gray-600">Cargando mapa...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-2 left-2 z-20 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-sm">
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