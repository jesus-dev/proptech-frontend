"use client";

import { BuildingOfficeIcon, HomeIcon, MapPinIcon, UserIcon, ArrowLeftIcon, CalendarIcon, PencilIcon } from "@heroicons/react/24/outline";
import { ChevronLeft, Eye, Star, Zap, FileText, MapPin, Calendar, Clock } from "lucide-react";

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
import { getImageBaseUrl } from '@/config/environment';

// Importar el mapa real dinámicamente para evitar errores de SSR
const RealLoteamientoMap = dynamic(
  () => import('../components/maps/RealLoteamientoMap'),
  { ssr: false }
);

export default function DevelopmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const developmentId = params?.id as string;
  const [development, setDevelopment] = useState<Development | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  // Helper para construir URL de imagen (igual que en DevelopmentCard)
  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) {
      return '/images/placeholder.jpg';
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const baseUrl = getImageBaseUrl();
    // Si la ruta es /uploads/1/... debería ser /uploads/developments/1/...
    let correctedPath = imagePath;
    if (imagePath.startsWith('/uploads/') && !imagePath.includes('/developments/')) {
      // Extraer el ID del desarrollo de la ruta /uploads/1/... 
      // y reconstruir como /uploads/developments/1/...
      const parts = imagePath.split('/');
      if (parts.length >= 4 && parts[1] === 'uploads' && /^\d+$/.test(parts[2])) {
        // Formato: /uploads/1/filename.jpg -> /uploads/developments/1/filename.jpg
        const developmentId = parts[2];
        const fileName = parts.slice(3).join('/');
        correctedPath = `/uploads/developments/${developmentId}/${fileName}`;
      }
    }
    const fullUrl = `${baseUrl}${correctedPath.startsWith('/') ? '' : '/'}${correctedPath}`;
    return fullUrl;
  };

  useEffect(() => {
    const loadDevelopment = async () => {
      if (!developmentId) return;
      
      try {
        setIsLoading(true);
        const dev = await developmentService.getDevelopmentById(developmentId);
        if (dev) {
          setDevelopment(dev);
          setCurrentImageIndex(0); // Resetear índice de imagen al cargar nuevo desarrollo
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

    loadDevelopment();
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con Botones */}
        <div className="mb-8">
          {/* Botones de Acción - Arriba */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push("/developments")}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Volver a Desarrollos</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/developments/${development.id}/edit`)}
                className="flex items-center space-x-2 px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <PencilIcon className="h-5 w-5" />
                <span>Editar Desarrollo</span>
              </button>
              <button
                onClick={() => router.push("/developments")}
                className="px-6 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-700 font-medium shadow-sm hover:shadow-md"
              >
                Volver a la Lista
              </button>
            </div>
          </div>

          {/* Título y Badges */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                development.type === "loteamiento" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : development.type === "edificio"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  : development.type === "condominio"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                  : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
              }`}>
                {development.type === "loteamiento" ? "Loteamiento" : 
                 development.type === "edificio" ? "Edificio" : 
                 development.type === "condominio" ? "Condominio" : "Barrio Cerrado"}
              </span>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                development.status === "available" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : development.status === "sold"
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}>
                {development.status === "available" ? "Disponible" : 
                 development.status === "sold" ? "Vendido" : "Reservado"}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">{development.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{development.description}</p>
          </div>
        </div>

      {/* Image Gallery - Full Width */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        {development.images && development.images.length > 0 ? (
          <div className="relative">
            <div className="w-full aspect-w-16 aspect-h-9 max-h-[600px]">
                  {getImageUrl(development.images[currentImageIndex]) ? (
                    <img
                      src={getImageUrl(development.images[currentImageIndex])}
                      alt={development.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Sin imagen disponible</span>
                    </div>
                  )}
                </div>
                
                {/* Image Navigation */}
                {development.images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between p-4">
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : development.images.length - 1)}
                      className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev < development.images.length - 1 ? prev + 1 : 0)}
                      className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                    >
                      <ChevronLeft className="h-5 w-5 rotate-180" />
                    </button>
                  </div>
                )}
                
                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {development.images.length}
                </div>
              </div>
            ) : (
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Sin imágenes disponibles</p>
                </div>
              </div>
            )}
            
            {/* Thumbnail Gallery */}
            {development.images && development.images.length > 1 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                  {development.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-14 h-11 rounded-md overflow-hidden border-2 transition-all ${
                        currentImageIndex === index
                          ? 'border-brand-500'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {getImageUrl(image) ? (
                        <img
                          src={getImageUrl(image)}
                          alt={`${development.title} - Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400 text-xs">Sin imagen</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

      {/* Development Details with Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 w-full">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="grid grid-cols-2 gap-2 px-2 sm:flex sm:gap-4 sm:px-6 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Resumen', icon: <Eye className="h-4 w-4" /> },
              { id: 'details', label: 'Detalles', icon: <FileText className="h-4 w-4" /> },
              { id: 'amenities', label: 'Amenidades', icon: <Star className="h-4 w-4" /> },
              { id: 'services', label: 'Servicios', icon: <Zap className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Ubicación */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-brand-500" />
                  Ubicación
                </h3>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900 dark:text-white text-lg">
                    {development.address}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {development.city}{development.state ? `, ${development.state}` : ''} {development.zip || ''}
                  </p>
                </div>
              </div>

              {/* Información General */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información General</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Calendar className="h-5 w-5 mr-3 text-brand-500" />
                    <span>Creado: {new Date(development.createdAt).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Clock className="h-5 w-5 mr-3 text-brand-500" />
                    <span>Última Actualización: {new Date(development.updatedAt).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">

          {/* Información Específica del Tipo */}
          {development.type === "loteamiento" ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detalles del Loteamiento</h2>
              <div className="space-y-4">
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detalles del Edificio</h2>
              <div className="space-y-4">
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detalles del Condominio</h2>
              <div className="space-y-4">
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detalles del Barrio Cerrado</h2>
              <div className="space-y-4">
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
            </div>
          )}

          {/* Amenities Tab */}
          {activeTab === 'amenities' && (
            <div className="space-y-6">
              {((development as any).amenities && (development as any).amenities.length > 0) ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {((development as any).amenities as string[]).map((amenity: string, index: number) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 text-center">
                      <Star className="h-6 w-6 text-brand-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{amenity}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No hay amenidades disponibles</p>
                </div>
              )}
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {((development.type === 'loteamiento' || development.type === 'barrio_cerrado') && (development as Loteamiento | BarrioCerrado).services && (development as Loteamiento | BarrioCerrado).services.length > 0) ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {((development as Loteamiento | BarrioCerrado).services as string[]).map((service: string, index: number) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700 text-center">
                      <Zap className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{service}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No hay servicios disponibles</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lista de Lotes (solo para loteamientos, condominios y barrios cerrados) */}
      {development && (development.type === "loteamiento" || development.type === "condominio" || development.type === "barrio_cerrado") && (
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
          <LotsStats lots={(development as Loteamiento | Condominio | BarrioCerrado).lots || []} />
          
          {/* Lista de Lotes */}
          <LotsList 
            lots={(development as Loteamiento | Condominio | BarrioCerrado).lots || []}
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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

      </div>
    </div>
  );
} 