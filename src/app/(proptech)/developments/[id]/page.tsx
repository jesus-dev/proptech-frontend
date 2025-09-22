"use client";

import { BuildingOfficeIcon, HomeIcon, MapPinIcon, UserIcon } from "@heroicons/react/24/outline";

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { useParams, useRouter } from "next/navigation";
import { Development, Loteamiento, Condominio, BarrioCerrado, Edificio } from "../components/types";
import { developmentService } from "../services/developmentService";
import dynamic from 'next/dynamic';
import LotsList from '../components/LotsList';
import LotsStats from '../components/LotsStats';
import UnitsList from '../components/UnitsList';
import UnitsStats from '../components/UnitsStats';
import Link from 'next/link';

// Importar el mapa real dinámicamente para evitar errores de SSR
const RealLoteamientoMap = dynamic(
  () => import('../components/maps/RealLoteamientoMap'),
  { ssr: false }
);

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DevelopmentDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { id: developmentId } = React.use(params);
  const [development, setDevelopment] = useState<Development | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDevelopment = async () => {
      try {
        setIsLoading(true);
        const dev = await developmentService.getDevelopmentById(developmentId);
        if (dev) {
          setDevelopment(dev);
        } else {
          setError("Desarrollo no encontrado");
        }
      } catch (err) {
        setError("No se pudo cargar el desarrollo");
        console.error("Error loading development:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (developmentId) {
      loadDevelopment();
    }
  }, [developmentId]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  if (error || !development) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">{error || "Desarrollo no encontrado"}</p>
          <button
            onClick={() => router.push("/developments")}
            className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            Volver a Desarrollos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/developments")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Volver a Desarrollos</span>
        </button>
        
        <div className="flex items-center space-x-3 mb-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            development.type === "loteamiento" 
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : development.type === "edificio"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
              : development.type === "condominio"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
              : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
          }`}>
            {development.type === "loteamiento" ? "Loteamiento" : 
             development.type === "edificio" ? "Edificio" : 
             development.type === "condominio" ? "Condominio" : "Barrio Cerrado"}
          </span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            development.status === "available" 
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : development.status === "sold"
              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
          }`}>
            {development.status === "available" ? "Disponible" : 
             development.status === "sold" ? "Vendido" : "Reservado"}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{development.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{development.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Información Principal */}
        <div className="space-y-6">
          {/* Imágenes */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Imágenes</h2>
            <div className="grid grid-cols-2 gap-4">
              {development.images?.map((image, index) => (
                <div key={index} className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${development.title} - Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {!development.images || development.images.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                  No hay imágenes disponibles
                </div>
              )}
            </div>
          </div>

          {/* Información de Ubicación */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ubicación</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {development.address}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {development.city}, {development.state} {development.zip}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información Específica del Tipo */}
          {development.type === "loteamiento" ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detalles del Loteamiento</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total de Lotes</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{development.numberOfLots}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Lotes Disponibles</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{development.availableLots}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Área Total</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{development.totalArea} m²</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tamaños de Lotes</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{development.lotSizes}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Servicios Incluidos</p>
                  <div className="flex flex-wrap gap-2">
                    {development.services?.map((service, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : development.type === "edificio" ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detalles del Edificio</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Número de Pisos</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{development.numberOfFloors}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total de Unidades</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{development.numberOfUnits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unidades Disponibles</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{development.availableUnits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tipos de Unidades</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{development.unitTypes}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Amenidades</p>
                  <div className="flex flex-wrap gap-2">
                    {development.amenities?.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : development.type === "condominio" ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detalles del Condominio</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total de Unidades</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{development.numberOfUnits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unidades Disponibles</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{development.availableUnits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Área Total</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{development.totalArea} m²</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cuota de Mantenimiento</p>
                    <p className="font-semibold text-gray-900 dark:text-white">${development.maintenanceFee?.toLocaleString()}/mes</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tipos de Unidades</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{development.unitTypes}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tamaños de Lotes</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{development.lotSizes}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Áreas Comunes</p>
                  <div className="flex flex-wrap gap-2">
                    {development.commonAreas?.map((area, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-md text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Características de Seguridad</p>
                  <div className="flex flex-wrap gap-2">
                    {development.securityFeatures?.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-md text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Amenidades</p>
                  <div className="flex flex-wrap gap-2">
                    {development.amenities?.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detalles del Barrio Cerrado</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total de Lotes</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{development.numberOfLots}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Lotes Disponibles</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{development.availableLots}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Área Total</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{development.totalArea} m²</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cuota de Mantenimiento</p>
                    <p className="font-semibold text-gray-900 dark:text-white">${development.maintenanceFee?.toLocaleString()}/mes</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tamaños de Lotes</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{development.lotSizes}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Servicios Incluidos</p>
                  <div className="flex flex-wrap gap-2">
                    {development.services?.map((service, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-md text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Características de Seguridad</p>
                  <div className="flex flex-wrap gap-2">
                    {development.securityFeatures?.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-md text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Áreas Comunes</p>
                  <div className="flex flex-wrap gap-2">
                    {development.commonAreas?.map((area, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-md text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Amenidades</p>
                  <div className="flex flex-wrap gap-2">
                    {development.amenities?.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Reglamento de Construcción</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{development.buildingRegulations}</p>
                </div>
              </div>
            </div>
          )}

          {/* Información de Fechas */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Información General</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Creado</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(development.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Última Actualización</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(development.updatedAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Distribución de Lotes</h2>
          {(development.type === "loteamiento" || development.type === "condominio" || development.type === "barrio_cerrado") ? (
            <RealLoteamientoMap 
              development={development as Loteamiento | Condominio | BarrioCerrado} 
              className="mb-4"
              onLotClick={(lot) => {
                // Aquí puedes manejar el clic en un lote
                console.log('Lote seleccionado:', lot);
              }}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {development.address}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {development.city}, {development.state} {development.zip}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Lotes (solo para loteamientos, condominios y barrios cerrados) */}
      {(development.type === "loteamiento" || development.type === "condominio" || development.type === "barrio_cerrado") && (
        <div className="mt-8 space-y-6">
          {/* Debug button */}
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <p>Debug: Development type: {development.type}</p>
            <p>Debug: Has coordinates: {development.coordinates ? 'Yes' : 'No'}</p>
            <p>Debug: Lots count: {(development as Loteamiento | Condominio | BarrioCerrado).lots?.length || 0}</p>
            <button 
              onClick={() => {
                localStorage.removeItem('developments');
                window.location.reload();
              }}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Regenerar datos
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones Rápidas</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/clients/new"
                className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar Cliente
              </Link>
              <Link
                href="/clients"
                className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Ver Clientes
              </Link>
              <Link
                href="/sales"
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Ver Ventas
              </Link>
            </div>
          </div>
          
          {/* Estadísticas */}
          <LotsStats lots={(development as Loteamiento | Condominio | BarrioCerrado).lots} />
          
          {/* Lista de Lotes */}
          <LotsList 
            lots={(development as Loteamiento | Condominio | BarrioCerrado).lots}
            onLotClick={(lot) => {
              // Aquí puedes manejar el clic en un lote desde la lista
              console.log('Lote seleccionado desde lista:', lot);
            }}
          />
        </div>
      )}

      {/* Lista de Unidades (solo para edificios) */}
      {development.type === "edificio" && (
        <div className="mt-8 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones Rápidas</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/clients/new"
                className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar Cliente
              </Link>
              <Link
                href="/clients"
                className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Ver Clientes
              </Link>
              <Link
                href="/sales"
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Ver Ventas
              </Link>
            </div>
          </div>
          
          {/* Estadísticas de Unidades */}
          <UnitsStats units={(development as Edificio).units || []} />
          
          {/* Lista de Unidades */}
          <UnitsList 
            units={(development as Edificio).units || []}
            onUnitClick={(unit) => {
              // Aquí puedes manejar el clic en una unidad desde la lista
              console.log('Unidad seleccionada desde lista:', unit);
            }}
          />
        </div>
      )}

      {/* Botones de Acción */}
      <div className="mt-8 flex space-x-4">
        <button
          onClick={() => router.push(`/developments/${development.id}/edit`)}
          className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          Editar Desarrollo
        </button>
        <button
          onClick={() => router.push("/developments")}
          className="px-6 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Volver a la Lista
        </button>
      </div>
    </div>
  );
} 