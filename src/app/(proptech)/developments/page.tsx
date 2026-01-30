"use client";

import { BuildingOfficeIcon, HomeIcon, MapPinIcon, UserIcon, PlusIcon, ArrowRightIcon, ChartBarSquareIcon, StarIcon, BuildingOffice2Icon, MapPinIcon as MapPin, CalendarDaysIcon, EyeIcon } from "@heroicons/react/24/outline";

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { GridIcon, ListIcon } from "@/icons";
import { Development } from "./components/types";
import { getDevelopmentStatusLabel, getDevelopmentStatusBadgeClasses } from "./constants/developmentStatus";
import { developmentService } from "./services/developmentService";
import { getImageBaseUrl } from '@/config/environment';

const DevelopmentCard: React.FC<{ development: Development }> = ({ development }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "loteamiento": return <MapPin className="w-4 h-4" />;
      case "edificio": return <BuildingOffice2Icon className="w-4 h-4" />;
      case "condominio": return <BuildingOfficeIcon className="w-4 h-4" />;
      default: return <HomeIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "loteamiento": return "bg-gradient-to-r from-green-500 to-emerald-600";
      case "edificio": return "bg-gradient-to-r from-blue-500 to-indigo-600";
      case "condominio": return "bg-gradient-to-r from-purple-500 to-violet-600";
      case "barrio_cerrado": return "bg-gradient-to-r from-orange-500 to-amber-600";
      default: return "bg-gradient-to-r from-gray-500 to-slate-600";
    }
  };

  const getStatusColor = (status: string) => {
    const normalized = (status || "").toLowerCase();
    switch (normalized) {
      case "available": return "bg-gradient-to-r from-emerald-500 to-green-500";
      case "sold": return "bg-gradient-to-r from-red-500 to-rose-500";
      case "reserved": return "bg-gradient-to-r from-yellow-500 to-amber-500";
      default: return "bg-gradient-to-r from-slate-500 to-slate-600";
    }
  };

  // Helper para construir URL de imagen (igual que en PropertyCard)
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

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (development.images && development.images.length > 0) {
      const imageUrl = development.images[0];
      setPreviewImage(getImageUrl(imageUrl));
      setShowPreview(true);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewImage(null);
  };

  // Obtener la imagen principal (igual que PropertyCard)
  const mainImage = development.images && development.images.length > 0 ? development.images[0] : null;
  const fullImageUrl = getImageUrl(mainImage);
  const normalizedStatus = (development.status || "").toLowerCase();
  const statusLabel = getDevelopmentStatusLabel(development.status);

  return (
    <>
      <Card className="group relative overflow-hidden bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-sm hover:shadow-xl hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-300">
        {/* Image */}
        <div className="relative overflow-hidden rounded-t-2xl h-48 sm:h-52 bg-slate-100 dark:bg-slate-700/50">
          {(() => {
            // Usar la primera imagen si existe (igual que PropertyCard)
            const imageToShow = mainImage ? getImageUrl(mainImage) : null;
            
            return imageToShow && imageToShow !== '/images/placeholder.jpg' ? (
              <img
                src={imageToShow}
                alt={development.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                onClick={handleImageClick}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null;
          })()}
          {/* Fallback image */}
          <div className="w-full h-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center" style={{ display: mainImage ? 'none' : 'flex' }}>
            <div className="text-center p-4">
              <div className="w-14 h-14 mx-auto rounded-xl bg-slate-200/80 dark:bg-slate-600/50 flex items-center justify-center">
                <BuildingOffice2Icon className="w-7 h-7 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">Sin imagen</p>
            </div>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Preview Button */}
          {mainImage && (
            <button
              onClick={handleImageClick}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:scale-110 hover:bg-white dark:hover:bg-slate-700 z-10"
              title="Ver previsualización"
            >
              <EyeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </button>
          )}
          
          {/* Type Badge */}
          <div className="absolute top-3 left-3 z-10">
            <Badge className={`${getTypeColor(development.type)} text-white border-0 text-xs font-medium shadow-md rounded-lg flex items-center gap-1.5 px-2.5 py-1`}>
              {getTypeIcon(development.type)}
              {development.type === "loteamiento" ? "Loteamiento" : 
               development.type === "edificio" ? "Edificio" : 
               development.type === "condominio" ? "Condominio" : "Barrio Cerrado"}
            </Badge>
          </div>

          {/* Status Badge */}
          {statusLabel && (
            <div className="absolute top-3 right-3 z-10">
              <Badge
                className={`${getDevelopmentStatusBadgeClasses(development.status)} border-0 text-xs font-medium shadow-md rounded-lg !text-gray-900 !dark:text-gray-900 px-2.5 py-1`}
              >
                {statusLabel}
              </Badge>
            </div>
          )}

          {/* Image Counter */}
          {development.images && development.images.length > 1 && (
            <div className="absolute bottom-2 right-2 z-10 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full">
              {development.images.length} {development.images.length === 1 ? 'imagen' : 'imágenes'}
            </div>
          )}
        </div>

        <div className="p-5 relative">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors line-clamp-1">
            <Link href={`/developments/${development.id}`} className="hover:underline decoration-2 underline-offset-2">
              {development.title}
            </Link>
          </h3>
          <div className="flex items-center text-slate-500 dark:text-slate-400 mb-2">
            <MapPin className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <span className="text-sm truncate">{development.address}, {development.city}</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
            {development.description}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/80">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {new Date(development.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <Link href={`/developments/${development.id}`}>
              <Button variant="outline" size="sm" className="rounded-xl h-8 px-3 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-500">
                <ArrowRightIcon className="w-4 h-4 mr-1" />
                Ver
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Preview Modal */}
      {showPreview && previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={handleClosePreview}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            <button
              onClick={handleClosePreview}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={previewImage}
              alt={development.title}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

const DevelopmentListItem: React.FC<{ development: Development }> = ({ development }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "loteamiento": return <MapPin className="w-4 h-4" />;
      case "edificio": return <BuildingOffice2Icon className="w-4 h-4" />;
      case "condominio": return <BuildingOfficeIcon className="w-4 h-4" />;
      default: return <HomeIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "loteamiento": return "bg-gradient-to-r from-green-500 to-emerald-600";
      case "edificio": return "bg-gradient-to-r from-blue-500 to-indigo-600";
      case "condominio": return "bg-gradient-to-r from-purple-500 to-violet-600";
      case "barrio_cerrado": return "bg-gradient-to-r from-orange-500 to-amber-600";
      default: return "bg-gradient-to-r from-gray-500 to-slate-600";
    }
  };

  return (
    <Card className="group relative overflow-hidden bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-sm hover:shadow-lg hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-300">
      <div className="flex items-center gap-5 p-5">
        <div className="relative flex-shrink-0">
          <img
            src={development.images?.[0] || "/images/placeholder.jpg"}
            alt={development.title}
            className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl shadow-sm"
          />
          <div className="absolute -top-1 -right-1">
            <Badge className={`${getTypeColor(development.type)} text-white border-0 text-[10px] font-medium shadow rounded-md flex items-center gap-0.5 px-2 py-0.5`}>
              {getTypeIcon(development.type)}
              {development.type === "loteamiento" ? "Loteamiento" : 
               development.type === "edificio" ? "Edificio" : 
               development.type === "condominio" ? "Condominio" : "Barrio Cerrado"}
            </Badge>
          </div>
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors line-clamp-1">
              <Link href={`/developments/${development.id}`} className="hover:underline decoration-2 underline-offset-2">
                {development.title}
              </Link>
            </h3>
            <Badge className={`${getDevelopmentStatusBadgeClasses(development.status)} border-0 text-[10px] font-medium !text-gray-900 !dark:text-gray-900 shrink-0 rounded-lg px-2 py-0.5`}>
              {getDevelopmentStatusLabel(development.status) || "Sin estado"}
            </Badge>
          </div>
          <div className="flex items-center text-slate-500 dark:text-slate-400 mb-2">
            <MapPin className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <span className="text-sm truncate">{development.address}, {development.city}</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 hidden sm:block leading-relaxed">
            {development.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{new Date(development.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <Link href={`/developments/${development.id}`}>
              <Button variant="outline" size="sm" className="rounded-xl h-8 px-3 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <ArrowRightIcon className="w-4 h-4 mr-1" />
                Ver
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function DevelopmentsPage() {
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<boolean | null>(null);
  const [loadErrorDetail, setLoadErrorDetail] = useState<{ statusCode?: number; message?: string } | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "loteamiento" | "edificio" | "condominio" | "barrio_cerrado">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "sold" | "reserved">("all");
  const [sortBy, setSortBy] = useState<"date" | "price" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [stats, setStats] = useState({
    totalDevelopments: 0,
    availableDevelopments: 0,
    soldDevelopments: 0,
    reservedDevelopments: 0
  });

  const loadDevelopments = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      setLoadErrorDetail(null);
      const response = await developmentService.getAllDevelopments();
      if (response.error) {
        setLoadError(true);
        setLoadErrorDetail({
          statusCode: response.statusCode,
          message: response.message
        });
        setDevelopments([]);
        setStats({ totalDevelopments: 0, availableDevelopments: 0, soldDevelopments: 0, reservedDevelopments: 0 });
        return;
      }
      const data = response.data || [];
      setDevelopments(data);
      setLoadError(false);
      setLoadErrorDetail(null);

      const total = data.length;
      const available = data.filter((dev: Development) => dev.status === "available").length;
      const sold = data.filter((dev: Development) => dev.status === "sold").length;
      const reserved = data.filter((dev: Development) => dev.status === "reserved").length;

      setStats({
        totalDevelopments: total,
        availableDevelopments: available,
        soldDevelopments: sold,
        reservedDevelopments: reserved
      });
    } catch (error: any) {
      console.error("Error loading developments:", error);
      setLoadError(true);
      setLoadErrorDetail({
        statusCode: error?.response?.status,
        message: error?.message
      });
      setDevelopments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDevelopments();
  }, []);

  const filteredAndSortedDevelopments = developments
    .filter((development) => {
      const matchesSearch = development.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           development.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           development.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           development.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === "all" || development.type === filterType;

      const devStatus = (development.status || "").toLowerCase();
      const matchesStatus = filterStatus === "all" || devStatus === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case "price":
          comparison = (b.price || 0) - (a.price || 0);
          break;
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
      }
      
      return sortOrder === "asc" ? -comparison : comparison;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-2 border-red-200 dark:border-red-800 shadow-2xl overflow-hidden">
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <BuildingOffice2Icon className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No se pudieron cargar los desarrollos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
                Verifica que estés iniciado sesión y que el backend esté en marcha. Si el problema continúa, revisa la consola del navegador (F12) para más detalles.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={loadDevelopments}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3"
                >
                  Reintentar
                </Button>
                <Link href="/login">
                  <Button variant="outline" className="px-6 py-3">
                    Ir a iniciar sesión
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterStatus("all");
    setSortBy("date");
    setSortOrder("desc");
    setShowAdvancedFilters(false);
  };

  const hasActiveFilters = searchTerm || filterType !== "all" || filterStatus !== "all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full min-w-0">
      {/* Header — igual que Propiedades */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-600 rounded-2xl p-3 shadow-sm">
                <BuildingOffice2Icon className="h-10 w-10" />
              </span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Desarrollos
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                  Administra tus emprendimientos inmobiliarios
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                href="/developments/new"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200 shadow-lg hover:shadow-xl sm:gap-3 sm:px-6 sm:py-3 sm:text-base"
              >
                <BuildingOffice2Icon className="size-5" />
                Nuevo Desarrollo
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Filtros — mismo estilo que Propiedades */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md w-full">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por título, dirección, ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors"
                />
              </div>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  showAdvancedFilters
                    ? "bg-brand-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 4C3 3.44772 3.44772 3 4 3H20C20.5523 3 21 3.44772 21 4V6.58579C21 6.851 20.8946 7.10536 20.7071 7.29289L14 14V21C14 21.5523 13.5523 22 13 22H11C10.4477 22 10 21.5523 10 21V14L3.29289 7.29289C3.10536 7.10536 3 6.851 3 6.58579V4Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {showAdvancedFilters ? "Ocultar filtros" : "Mostrar filtros"}
              </button>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    view === "grid"
                      ? "bg-white dark:bg-gray-600 text-brand-600 dark:text-brand-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Vista de cuadrícula"
                >
                  <GridIcon className="size-5" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    view === "list"
                      ? "bg-white dark:bg-gray-600 text-brand-600 dark:text-brand-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Vista de lista"
                >
                  <ListIcon className="size-5" />
                </button>
              </div>
            </div>

            {showAdvancedFilters && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as "all" | "loteamiento" | "edificio" | "condominio" | "barrio_cerrado")}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors"
                      >
                        <option value="all">Todos los tipos</option>
                        <option value="loteamiento">Loteamientos</option>
                        <option value="edificio">Edificios</option>
                        <option value="condominio">Condominio</option>
                        <option value="barrio_cerrado">Barrio Cerrado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as "all" | "available" | "sold" | "reserved")}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors"
                      >
                        <option value="all">Todos los estados</option>
                        <option value="available">Disponible</option>
                        <option value="sold">Vendido</option>
                        <option value="reserved">Reservado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ordenar</label>
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                          setSortBy(newSortBy);
                          setSortOrder(newSortOrder);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors"
                      >
                        <option value="date-desc">Más recientes</option>
                        <option value="date-asc">Más antiguos</option>
                        <option value="price-desc">Precio mayor</option>
                        <option value="price-asc">Precio menor</option>
                        <option value="name-asc">A-Z</option>
                        <option value="name-desc">Z-A</option>
                      </select>
                    </div>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-fit"
                    >
                      Limpiar todos los filtros
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contenido */}
        {filteredAndSortedDevelopments.length > 0 ? (
          <div className={view === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-4"
          }>
            {filteredAndSortedDevelopments.map((dev: Development) =>
              view === "grid" ? (
                <DevelopmentCard key={dev.id} development={dev} />
              ) : (
                <DevelopmentListItem key={dev.id} development={dev} />
              )
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BuildingOffice2Icon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No se encontraron desarrollos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {hasActiveFilters
                ? "No hay desarrollos que coincidan con los criterios de búsqueda seleccionados."
                : "Aún no tienes desarrollos registrados. Comienza agregando tu primer emprendimiento."}
            </p>
            {!hasActiveFilters && (
              <Link
                href="/developments/new"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
              >
                <BuildingOffice2Icon className="size-5" />
                Nuevo Desarrollo
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 