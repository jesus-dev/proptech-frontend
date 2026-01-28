"use client";

import { BuildingOfficeIcon, HomeIcon, MapPinIcon, UserIcon, ChartBarIcon, PlusIcon, ArrowRightIcon, ChartBarSquareIcon, StarIcon, BuildingOffice2Icon, MapPinIcon as MapPin, CalendarDaysIcon, EyeIcon } from "@heroicons/react/24/outline";

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { GridIcon, ListIcon } from "@/icons";
import { Development } from "./components/types";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-gradient-to-r from-emerald-500 to-green-500";
      case "sold": return "bg-gradient-to-r from-red-500 to-rose-500";
      default: return "bg-gradient-to-r from-yellow-500 to-amber-500";
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

  return (
    <>
      <Card className="group relative overflow-hidden bg-white dark:bg-slate-800 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Image with overlay and preview */}
        <div className="relative overflow-hidden rounded-t-xl h-64 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
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
          <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 flex items-center justify-center text-gray-500" style={{ display: mainImage ? 'none' : 'flex' }}>
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Sin imagen</p>
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
          <div className="absolute top-4 left-4 z-10">
            <Badge className={`${getStatusColor(development.status)} text-white border-0 shadow-lg backdrop-blur-sm flex items-center gap-1.5`}>
              {getTypeIcon(development.type)}
              {development.type === "loteamiento" ? "Loteamiento" : 
               development.type === "edificio" ? "Edificio" : 
               development.type === "condominio" ? "Condominio" : "Barrio Cerrado"}
            </Badge>
          </div>

          {/* Status Badge */}
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="secondary" className="bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-0 shadow-lg backdrop-blur-sm">
              {development.status === "available" ? "Disponible" : 
               development.status === "sold" ? "Vendido" : "Reservado"}
            </Badge>
          </div>

          {/* Image Counter */}
          {development.images && development.images.length > 1 && (
            <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
              {development.images.length} {development.images.length === 1 ? 'imagen' : 'imágenes'}
            </div>
          )}
        </div>

        <div className="p-6 relative">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <Link href={`/developments/${development.id}`} className="hover:underline">
              {development.title}
            </Link>
          </h3>
          
          <div className="flex items-center text-slate-600 dark:text-slate-400 mb-3">
            <MapPin className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="text-sm truncate">{development.address}, {development.city}</span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
            {development.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
              <CalendarDaysIcon className="w-4 h-4 mr-1" />
              {new Date(development.createdAt).toLocaleDateString('es-ES')}
            </div>
            
            <Link href={`/developments/${development.id}`}>
              <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <ArrowRightIcon className="w-4 h-4" />
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-gradient-to-r from-emerald-500 to-green-500";
      case "sold": return "bg-gradient-to-r from-red-500 to-rose-500";
      default: return "bg-gradient-to-r from-yellow-500 to-amber-500";
    }
  };

  return (
    <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center space-x-6 p-6">
        <div className="relative flex-shrink-0">
          <img
            src={development.images?.[0] || "/images/placeholder.jpg"}
            alt={development.title}
            className="w-32 h-32 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
          />
          <div className="absolute -top-2 -right-2">
            <Badge className={`${getStatusColor(development.status)} text-white border-0 shadow-lg backdrop-blur-sm flex items-center gap-1.5 text-xs`}>
              {getTypeIcon(development.type)}
              {development.type === "loteamiento" ? "Loteamiento" : 
               development.type === "edificio" ? "Edificio" : 
               development.type === "condominio" ? "Condominio" : "Barrio Cerrado"}
            </Badge>
          </div>
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <Link href={`/developments/${development.id}`} className="hover:underline">
                {development.title}
              </Link>
            </h3>
            
            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-0">
              {development.status === "available" ? "Disponible" : 
               development.status === "sold" ? "Vendido" : "Reservado"}
            </Badge>
          </div>

          <div className="flex items-center text-slate-600 dark:text-slate-400 mb-3">
            <MapPin className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="text-sm truncate">{development.address}, {development.city}</span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 hidden md:block">
            {development.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
              <CalendarDaysIcon className="w-4 h-4 mr-1" />
              {new Date(development.createdAt).toLocaleDateString('es-ES')}
            </div>
            
            <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function DevelopmentsPage() {
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "loteamiento" | "edificio" | "condominio" | "barrio_cerrado">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "sold" | "reserved">("all");
  const [sortBy, setSortBy] = useState<"date" | "price" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState({
    totalDevelopments: 0,
    availableDevelopments: 0,
    soldDevelopments: 0,
    reservedDevelopments: 0
  });

  useEffect(() => {
    const loadDevelopments = async () => {
      try {
        setIsLoading(true);
        const response = await developmentService.getAllDevelopments();
        const data = response.data || [];
        setDevelopments(data);
        
        // Calculate stats
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
      } catch (error) {
        console.error("Error loading developments:", error);
        setDevelopments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDevelopments();
  }, []);

  const filteredAndSortedDevelopments = developments
    .filter((development) => {
    const matchesSearch = development.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         development.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         development.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         development.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || development.type === filterType;
    const matchesStatus = filterStatus === "all" || development.status === filterStatus;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full min-w-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Enhanced Modern Header */}
        <div className="mb-8 relative">
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-3xl animate-pulse"></div>
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                    <div className="relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl">
                      <BuildingOffice2Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      Desarrollos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm lg:text-base font-medium">
                      Gestiona y administra tus emprendimientos inmobiliarios
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/developments/dashboard">
                  <Button className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 px-6 py-3">
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                    <ChartBarIcon className="w-5 h-5 mr-2 relative z-10" />
                    <span className="relative z-10 font-semibold">Dashboard</span>
                  </Button>
                </Link>
                <Link href="/developments/new">
                  <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 px-6 py-3">
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                    <PlusIcon className="w-5 h-5 mr-2 relative z-10" />
                    <span className="relative z-10 font-semibold">Nuevo Desarrollo</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                  <BuildingOffice2Icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-xs font-semibold uppercase tracking-wide">Total</p>
                  <p className="text-3xl font-extrabold mt-1">{stats.totalDevelopments}</p>
                </div>
              </div>
              <p className="text-blue-100/80 text-xs font-medium">Desarrollos registrados</p>
            </div>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                  <ChartBarSquareIcon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wide">Disponibles</p>
                  <p className="text-3xl font-extrabold mt-1">{stats.availableDevelopments}</p>
                </div>
              </div>
              <p className="text-emerald-100/80 text-xs font-medium">Listos para venta</p>
            </div>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                  <StarIcon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-red-100 text-xs font-semibold uppercase tracking-wide">Vendidos</p>
                  <p className="text-3xl font-extrabold mt-1">{stats.soldDevelopments}</p>
                </div>
              </div>
              <p className="text-red-100/80 text-xs font-medium">Emprendimientos vendidos</p>
            </div>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                  <CalendarDaysIcon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-yellow-100 text-xs font-semibold uppercase tracking-wide">Reservados</p>
                  <p className="text-3xl font-extrabold mt-1">{stats.reservedDevelopments}</p>
                </div>
              </div>
              <p className="text-yellow-100/80 text-xs font-medium">Con reserva activa</p>
            </div>
          </Card>
        </div>

        {/* Enhanced Modern Filters */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl mb-6">
          <div className="p-5 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Buscar</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar desarrollos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all duration-200 text-sm shadow-sm hover:shadow-md focus:shadow-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Tipo</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as "all" | "loteamiento" | "edificio" | "condominio" | "barrio_cerrado")}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all duration-200 text-sm shadow-sm hover:shadow-md focus:shadow-lg cursor-pointer"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="loteamiento">Loteamientos</option>
                  <option value="edificio">Edificios</option>
                  <option value="condominio">Condominios</option>
                  <option value="barrio_cerrado">Barrio Cerrado</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Estado</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as "all" | "available" | "sold" | "reserved")}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all duration-200 text-sm shadow-sm hover:shadow-md focus:shadow-lg cursor-pointer"
                >
                  <option value="all">Todos los estados</option>
                  <option value="available">Disponible</option>
                  <option value="sold">Vendido</option>
                  <option value="reserved">Reservado</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Ordenar</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all duration-200 text-sm shadow-sm hover:shadow-md focus:shadow-lg cursor-pointer"
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
            
            {/* Enhanced View Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Mostrando
                </p>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {filteredAndSortedDevelopments.length}
                </span>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  desarrollo{filteredAndSortedDevelopments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1.5 shadow-inner">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    view === "grid"
                      ? "bg-white dark:bg-gray-600 text-blue-600 shadow-lg transform scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50"
                  }`}
                  title="Vista de cuadrícula"
                >
                  <GridIcon className="size-5" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    view === "list"
                      ? "bg-white dark:bg-gray-600 text-blue-600 shadow-lg transform scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50"
                  }`}
                  title="Vista de lista"
                >
                  <ListIcon className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Content */}
        {filteredAndSortedDevelopments.length > 0 ? (
          <div className={view === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" 
            : "space-y-6"
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
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden">
            <div className="text-center py-20 px-6">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                  <BuildingOffice2Icon className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                No se encontraron desarrollos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto text-base leading-relaxed">
                No hay emprendimientos que coincidan con los criterios de búsqueda actuales. Intenta ajustar los filtros o crear un nuevo desarrollo.
              </p>
              <Link href="/developments/new">
                <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 px-8 py-4 text-base font-semibold">
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                  <PlusIcon className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10">Crear Nuevo Desarrollo</span>
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 