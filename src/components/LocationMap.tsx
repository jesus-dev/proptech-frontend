'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Función para formatear y resumir direcciones
const formatAddress = (fullAddress: string): string => {
  if (!fullAddress) return '';
  
  // Dividir la dirección en partes
  const parts = fullAddress.split(', ');
  
  // Para Paraguay, priorizar: Ciudad, Barrio, Calle
  if (parts.length > 2) {
    // Buscar patrones específicos de Paraguay
    const cityIndex = parts.findIndex(part => 
      part.includes('Ciudad del Este') || 
      part.includes('Asunción') || 
      part.includes('San Lorenzo') ||
      part.includes('Luque') ||
      part.includes('Capiatá') ||
      part.includes('Lambaré') ||
      part.includes('Fernando de la Mora') ||
      part.includes('Ñemby') ||
      part.includes('San Antonio') ||
      part.includes('Villa Elisa') ||
      part.includes('Itauguá') ||
      part.includes('Ypané') ||
      part.includes('Areguá') ||
      part.includes('Itá') ||
      part.includes('Yaguarón') ||
      part.includes('Villarrica') ||
      part.includes('Caacupé') ||
      part.includes('Coronel Oviedo') ||
      part.includes('Villa Hayes') ||
      part.includes('Concepción') ||
      part.includes('Pedro Juan Caballero') ||
      part.includes('Encarnación') ||
      part.includes('Pilar') ||
      part.includes('Villarrica') ||
      part.includes('Caacupé') ||
      part.includes('Coronel Oviedo') ||
      part.includes('Villa Hayes') ||
      part.includes('Concepción') ||
      part.includes('Pedro Juan Caballero') ||
      part.includes('Encarnación') ||
      part.includes('Pilar')
    );
    
    if (cityIndex !== -1) {
      const city = parts[cityIndex];
      const barrio = parts[cityIndex - 1] || parts[cityIndex + 1];
      const street = parts[0];
      
      // Formatear según lo que tengamos
      if (barrio && !barrio.includes('Paraguay') && !barrio.includes('Departamento')) {
        return `${street}, ${barrio}, ${city}`;
      } else {
        return `${street}, ${city}`;
      }
    }
  }
  
  // Para otros países o casos generales
  if (parts.length >= 3) {
    // Tomar: Calle, Ciudad, País
    const street = parts[0];
    const city = parts[parts.length - 2];
    const country = parts[parts.length - 1];
    
    // Evitar duplicados
    if (city !== country && !city.includes('Departamento') && !city.includes('Provincia')) {
      return `${street}, ${city}, ${country}`;
    } else {
      return `${street}, ${country}`;
    }
  }
  
  // Si es muy corta, devolver tal como está
  if (parts.length <= 2) {
    return fullAddress;
  }
  
  // Caso por defecto: tomar los primeros 3 elementos
  return parts.slice(0, 3).join(', ');
};

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string; fullAddress?: string }) => void;
  selectedLocation: { lat: number; lng: number; address: string; fullAddress?: string } | null;
}

export default function LocationMap({ onLocationSelect, selectedLocation }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Crear el mapa centrado en Paraguay
    const map = L.map(mapRef.current).setView([-25.2637, -57.5759], 8);
    mapInstanceRef.current = map;

    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Evento de clic en el mapa
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      
      // Obtener dirección usando Nominatim (OpenStreetMap)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        const address = formatAddress(data.display_name) || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        // Actualizar marcador
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }
        
        markerRef.current = L.marker([lat, lng]).addTo(map);
        
        // Llamar a la función de callback
        onLocationSelect({ lat, lng, address, fullAddress: data.display_name });
        
      } catch (error) {
        console.error('Error obteniendo dirección:', error);
        const address = formatAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        onLocationSelect({ lat, lng, address, fullAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
      }
    });

    // Limpiar al desmontar
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onLocationSelect]);

  // Función de búsqueda
  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;
    
    setIsSearching(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const location = { lat: parseFloat(lat), lng: parseFloat(lon), address: formatAddress(display_name), fullAddress: display_name };
        
        // Centrar mapa en la ubicación encontrada
        mapInstanceRef.current.setView([lat, lon], 15);
        
        // Actualizar marcador
        if (markerRef.current) {
          mapInstanceRef.current.removeLayer(markerRef.current);
        }
        
        markerRef.current = L.marker([lat, lon]).addTo(mapInstanceRef.current);
        
        // Llamar a la función de callback
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Centrar en ubicación actual si está disponible
  const centerOnCurrentLocation = () => {
    if (!mapInstanceRef.current) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapInstanceRef.current?.setView([latitude, longitude], 15);
        },
        (error) => {
          console.error('Error obteniendo ubicación actual:', error);
        }
      );
    }
  };

  return (
    <div className="relative h-full">
      {/* Controles del mapa */}
      <div className="absolute top-2 left-2 z-10 flex space-x-2">
        <button
          onClick={centerOnCurrentLocation}
          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          title="Centrar en mi ubicación"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Búsqueda */}
      <div className="absolute top-2 right-2 z-10 w-64">
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar dirección..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {isSearching ? '...' : '🔍'}
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Instrucciones */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 p-2 rounded-lg text-xs text-gray-600">
        Haz clic en el mapa para seleccionar ubicación
      </div>
    </div>
  );
}
