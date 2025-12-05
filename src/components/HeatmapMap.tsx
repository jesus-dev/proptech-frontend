"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Property } from "../app/(proptech)/properties/components/types";

interface HeatmapData {
  lat: number;
  lng: number;
  intensity: number;
  property: Property;
}

interface HeatmapMapProps {
  heatmapData: HeatmapData[];
  zoom: number;
  formatCurrency: (amount: number, currency: string) => string;
  getMarkerColor: (intensity: number) => string;
  onPropertyClick?: (property: Property) => void;
}

export default function HeatmapMap({ 
  heatmapData, 
  zoom, 
  formatCurrency, 
  getMarkerColor,
  onPropertyClick 
}: HeatmapMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Agrupar propiedades por intensidad
  const intensityGroups = {
    high: heatmapData.filter(p => p.intensity >= 70),
    medium: heatmapData.filter(p => p.intensity >= 40 && p.intensity < 70),
    low: heatmapData.filter(p => p.intensity < 40)
  };

  useEffect(() => {
    if (!mapRef.current || heatmapData.length === 0) return;

    const loadMap = async () => {
      try {
        // Cargar Leaflet si no está cargado
        if (!(window as any).L) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          document.head.appendChild(script);

          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);

          await new Promise(resolve => {
            script.onload = resolve;
          });
        }

        const L = (window as any).L;
        
        // Limpiar mapa anterior si existe
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            console.log('Map already removed or invalid');
          }
          mapInstanceRef.current = null;
        }

        // Limpiar cualquier contenedor existente
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
        }

        // Pequeño delay para asegurar limpieza
        await new Promise(resolve => setTimeout(resolve, 50));

        // Verificar que el contenedor esté limpio
        if (!mapRef.current || mapRef.current.children.length > 0) {
          console.log('Container not ready, skipping map creation');
          return;
        }

        // Crear nuevo mapa - Centrado en Ciudad del Este
        const map = L.map(mapRef.current, {
          center: [-25.5095, -54.6154],
          zoom: zoom,
          zoomControl: true
        });

        mapInstanceRef.current = map;

        // Agregar capa de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Agregar marcadores con colores según intensidad
        heatmapData.forEach(point => {
          const markerSize = point.intensity >= 70 ? 35 : point.intensity >= 40 ? 28 : 22;
          const markerColor = getMarkerColor(point.intensity);
          
          // Crear icono personalizado
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="width: ' + markerSize + 'px; height: ' + markerSize + 'px; background: ' + markerColor + '; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ' + (markerSize * 0.3) + 'px; cursor: pointer;">' + Math.round(point.intensity) + '%</div>',
            iconSize: [markerSize, markerSize],
            iconAnchor: [markerSize / 2, markerSize / 2],
          });

          const marker = L.marker([point.lat, point.lng], { icon: customIcon }).addTo(map);
          
          // Popup mejorado
          let popupContent = '<div style="min-width: 250px; padding: 8px;">' +
            '<div style="background: linear-gradient(135deg, ' + markerColor + '20, ' + markerColor + '40); border-left: 4px solid ' + markerColor + '; padding: 12px; border-radius: 8px; margin-bottom: 8px;">' +
            '<h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: bold; color: #1f2937;">' + point.property.title + '</h3>' +
            '<p style="margin: 0; font-size: 14px; color: #6b7280;">' + point.property.address + '</p>' +
            '</div>' +
            '<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin-bottom: 8px;">' +
            '<div style="font-size: 18px; font-weight: bold; color: #059669;">' + formatCurrency(point.property.price || 0, point.property.currency || 'USD') + '</div>' +
            '</div>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">' +
            '<div style="text-align: center; padding: 4px; background: #f1f5f9; border-radius: 4px;">' +
            '<div style="font-size: 12px; color: #64748b;">Habitaciones</div>' +
            '<div style="font-weight: bold; color: #1f2937;">' + (point.property.bedrooms || 0) + '</div>' +
            '</div>' +
            '<div style="text-align: center; padding: 4px; background: #f1f5f9; border-radius: 4px;">' +
            '<div style="font-size: 12px; color: #64748b;">Baños</div>' +
            '<div style="font-weight: bold; color: #1f2937;">' + (point.property.bathrooms || 0) + '</div>' +
            '</div>';
          
          if (point.property.area) {
            popupContent += '<div style="text-align: center; padding: 4px; background: #f1f5f9; border-radius: 4px; grid-column: 1 / -1;">' +
              '<div style="font-size: 12px; color: #64748b;">Área</div>' +
              '<div style="font-weight: bold; color: #1f2937;">' + point.property.area + 'm²</div>' +
              '</div>';
          }
          
          popupContent += '</div>' +
            '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: ' + markerColor + '10; border-radius: 6px; border: 1px solid ' + markerColor + '30;">' +
            '<span style="font-size: 12px; color: #64748b;">Nivel de Actividad</span>' +
            '<span style="font-size: 14px; font-weight: bold; color: ' + markerColor + '; padding: 2px 8px; background: ' + markerColor + '20; border-radius: 12px;">' + Math.round(point.intensity) + '%</span>' +
            '</div>' +
            '</div>';
          
          marker.bindPopup(popupContent);
          
          // Click handler
          marker.on('click', () => {
            onPropertyClick?.(point.property);
          });
        });

        // Ajustar vista
        if (heatmapData.length > 0) {
          const bounds = L.latLngBounds(heatmapData.map(point => [point.lat, point.lng]));
          map.fitBounds(bounds, { padding: [20, 20] });
        }

      } catch (error) {
        console.error('Error cargando mapa:', error);
      }
    };

    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(loadMap, 100);

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.log('Map cleanup error:', e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [heatmapData, zoom, formatCurrency, getMarkerColor, onPropertyClick]);

  if (heatmapData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">🏠</div>
          <p className="text-gray-600">No hay propiedades para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-200 shadow-lg">
      <div ref={mapRef} className="w-full h-full" style={{ zIndex: 1 }} />
      
      {/* Leyenda */}
      {showLegend && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs border border-gray-200" style={{ zIndex: 1000 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">Leyenda de Actividad</h3>
            <button
              onClick={() => setShowLegend(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
              <div>
                <div className="text-xs font-semibold text-gray-800">Alta Actividad (70%+)</div>
                <div className="text-xs text-gray-600">{intensityGroups.high.length} propiedades</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
              <div>
                <div className="text-xs font-semibold text-gray-800">Actividad Media (40-69%)</div>
                <div className="text-xs text-gray-600">{intensityGroups.medium.length} propiedades</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
              <div>
                <div className="text-xs font-semibold text-gray-800">Baja Actividad (&lt;40%)</div>
                <div className="text-xs text-gray-600">{intensityGroups.low.length} propiedades</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel de estadísticas */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200" style={{ zIndex: 1000 }}>
        <div className="text-xs font-bold text-gray-800 mb-2">Resumen</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center p-1 bg-red-50 rounded">
            <div className="font-bold text-red-600">{intensityGroups.high.length}</div>
            <div className="text-gray-600">Alta</div>
          </div>
          <div className="text-center p-1 bg-yellow-50 rounded">
            <div className="font-bold text-yellow-600">{intensityGroups.medium.length}</div>
            <div className="text-gray-600">Media</div>
          </div>
          <div className="text-center p-1 bg-blue-50 rounded col-span-2">
            <div className="font-bold text-blue-600">{intensityGroups.low.length}</div>
            <div className="text-gray-600">Baja</div>
          </div>
        </div>
      </div>

      {/* Botón para mostrar leyenda */}
      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute top-4 right-4 p-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 hover:bg-white"
          style={{ zIndex: 1000 }}
        >
          📊
        </button>
      )}
    </div>
  );
} 