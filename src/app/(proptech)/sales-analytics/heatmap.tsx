"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { propertyService } from "../properties/services/propertyService";
import type { Property } from "../properties/components/types";

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const HeatmapLayer = dynamic(() => import("react-leaflet-heatmap-layer-v3"), { ssr: false });

export default function HeatmapPage() {
  const [properties, setProperties] = useState<{ lat: number; lng: number; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      try {
        const response = await propertyService.getAllProperties();
        // Manejar tanto array directo como objeto con data
        const allProperties = Array.isArray(response) ? response : (response?.data || []);
        // Solo propiedades con lat/lng válidos
        const points = allProperties
          .filter(p => typeof p.latitude === 'number' && typeof p.longitude === 'number')
          .map(p => ({ lat: p.latitude as number, lng: p.longitude as number, value: 1 }));
        setProperties(points);
      } catch (error) {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <FireIcon className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-900">Mapa de Calor Inmobiliario</h1>
        </div>
        <p className="text-gray-600 mb-4">
          Visualiza la concentración de propiedades por zona. Pronto podrás filtrar por precio, tipo y más.
        </p>
      </div>
      <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-lg bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-500">Cargando mapa...</span>
          </div>
        ) : (
          <MapContainer center={[-25.2637, -57.5759]} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <HeatmapLayer
              points={properties}
              longitudeExtractor={(m: { lng: number }) => m.lng}
              latitudeExtractor={(m: { lat: number }) => m.lat}
              intensityExtractor={() => 1}
              radius={30}
              blur={20}
              max={2}
            />
          </MapContainer>
        )}
      </div>
    </div>
  );
} 