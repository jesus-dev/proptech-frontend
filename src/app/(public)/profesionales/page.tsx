"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Script from 'next/script';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  WrenchScrewdriverIcon,
  CheckBadgeIcon,
  XMarkIcon,
  UserPlusIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  ClockIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  PhotoIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { publicProfessionalService, PublicProfessional } from '@/services/publicProfessionalService';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { getEndpoint } from '@/lib/api-config';
import Image from 'next/image';
import { formatPrice, getCurrencySymbol, createProfessionalSlug } from '@/lib/utils';
import ModernPopup from '@/components/ui/ModernPopup';
import { useToast } from '@/components/ui/use-toast';

interface ServiceType {
  id: number;
  code: string;
  name: string;
  icon?: string;
  description?: string;
}

export default function ProfesionalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'rating' | 'jobs' | 'experience'>('rating');
  const [professionals, setProfessionals] = useState<PublicProfessional[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Estados para el modal de votación
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [voterName, setVoterName] = useState('');
  const [voterEmail, setVoterEmail] = useState('');
  const [voterComment, setVoterComment] = useState('');
  const [submittingVote, setSubmittingVote] = useState(false);
  const { toast } = useToast();

  // Función para normalizar nombres de ciudades
  const normalizeCityName = (cityName: string) => {
    return cityName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/ó/g, 'o')
      .replace(/ñ/g, 'n')
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ú/g, 'u');
  };

  // Cargar tipos de servicio
  useEffect(() => {
    const loadServiceTypes = async () => {
      try {
        const response = await apiClient.get('/api/service-types');
        setServiceTypes(response.data || []);
      } catch (error) {
        console.error('Error loading service types:', error);
      }
    };
    loadServiceTypes();
  }, []);

  // Filtros dinámicos basados en datos reales
  const cities = React.useMemo(() => {
    const unique = Array.from(new Set(professionals.map(p => (p.city || '').trim()).filter(Boolean)));
    unique.sort((a, b) => a.localeCompare(b, 'es'));
    return [{ value: '', label: 'Todas las ciudades' }, ...unique.map(c => ({ value: normalizeCityName(c), label: c }))];
  }, [professionals]);

  // Cargar profesionales
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await publicProfessionalService.getAllProfessionals();
        console.log('🔍 TODOS los profesionales cargados:', data.length);
        console.log('🔍 Datos completos del primer profesional:', data[0]);
        data.forEach((p, i) => {
          console.log(`Profesional ${i + 1}: ${p.firstName} ${p.lastName} - isVerified:`, p.isVerified, 'tipo:', typeof p.isVerified);
        });
        setProfessionals(data);
      } catch (err: any) {
        console.error('Error loading professionals:', err);
        setError('Error al cargar los profesionales. Por favor, intenta recargar la página.');
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfessionals();
  }, []);

  const filteredProfessionals = professionals.filter(professional => {
    const serviceTypeCode = professional.serviceTypeCode || professional.serviceType;
    const matchesSearch = !searchTerm || 
                         `${professional.firstName} ${professional.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.serviceTypeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         serviceTypeCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || (professional.city && normalizeCityName(professional.city) === selectedCity);
    const matchesServiceType = !selectedServiceType || serviceTypeCode === selectedServiceType;
    
    return matchesSearch && matchesCity && matchesServiceType;
  });

  const sortedProfessionals = [...filteredProfessionals].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0);
      case 'jobs':
        return (b.completedJobs || 0) - (a.completedJobs || 0);
      case 'experience':
        return (b.experienceYears || 0) - (a.experienceYears || 0);
      default:
        return 0;
    }
  });

  const getServiceTypeInfo = (code: string) => {
    return serviceTypes.find(st => st.code === code);
  };

  // Funciones para el sistema de votación
  const openVoteModal = (professionalId: number) => {
    setSelectedProfessionalId(professionalId);
    setSelectedRating(0);
    setVoterName('');
    setVoterEmail('');
    setVoterComment('');
    setVoteModalOpen(true);
  };

  const closeVoteModal = () => {
    setVoteModalOpen(false);
    setSelectedProfessionalId(null);
    setSelectedRating(0);
    setVoterName('');
    setVoterEmail('');
    setVoterComment('');
  };

  const handleVote = async () => {
    if (!selectedProfessionalId || selectedRating === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona una calificación",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingVote(true);
      const response = await publicProfessionalService.voteProfessional(selectedProfessionalId, {
        rating: selectedRating,
        voterName: voterName.trim() || undefined,
        voterEmail: voterEmail.trim() || undefined,
        comment: voterComment.trim() || undefined,
      });

      // Actualizar el profesional en la lista con los nuevos valores
      setProfessionals(prev => prev.map(p => 
        p.id === selectedProfessionalId
          ? { ...p, averageRating: response.averageRating, totalReviews: response.totalReviews }
          : p
      ));

      toast({
        title: "¡Votación enviada!",
        description: `Has calificado con ${selectedRating} estrellas. Gracias por tu opinión.`,
        variant: "success",
      });

      closeVoteModal();
    } catch (error: any) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: error.message || "Error al procesar la votación. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmittingVote(false);
    }
  };

  // Función para formatear precios
  const formatPriceLocal = (price: number, currencyCode: string) => {
    return formatPrice(price, currencyCode as any, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Función para obtener URL de WhatsApp
  const getWhatsAppUrl = (phone: string) => {
    // Limpiar el número de teléfono (remover espacios, guiones, paréntesis, etc.)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    // Si no empieza con código de país, asumir que es Paraguay (+595)
    const phoneWithCountry = cleanPhone.startsWith('+') ? cleanPhone : `+595${cleanPhone}`;
    return `https://wa.me/${phoneWithCountry.replace(/\+/g, '')}`;
  };

  // Structured Data para SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Profesionales de Servicios del Hogar en Paraguay',
    description: 'Lista de profesionales certificados para servicios del hogar en Paraguay. Electricistas, plomeros, carpinteros y más.',
    url: 'https://proptech.com.py/profesionales',
    numberOfItems: professionals.length,
    itemListElement: professionals.slice(0, 10).map((professional, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: `${professional.firstName} ${professional.lastName}`,
        description: professional.description,
        provider: {
          '@type': 'Person',
          name: `${professional.firstName} ${professional.lastName}`,
          email: professional.email,
          telephone: professional.phone,
        },
        areaServed: {
          '@type': 'City',
          name: professional.city || 'Paraguay',
        },
      },
    })),
  };

  return (
    <>
      {/* Structured Data para SEO */}
      <Script
        id="profesionales-structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(structuredData)}
      </Script>
      
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 min-h-[45vh] sm:min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="professionals-hero-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="4" fill="white" opacity="0.3"/>
                <circle cx="10" cy="10" r="2" fill="white" opacity="0.2"/>
                <circle cx="50" cy="50" r="2" fill="white" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#professionals-hero-pattern)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-6 sm:pb-8 w-full z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              Encuentra Profesionales de
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent">
                Servicios del Hogar
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto mb-8 px-4">
              Electricistas, plomeros, carpinteros, pintores y más. Profesionales verificados y con experiencia para tu hogar.
            </p>
            <Link
              href="/profesionales/registrarse"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 mt-4"
            >
              <UserPlusIcon className="w-6 h-6 mr-2" />
              Regístrate como Profesional
            </Link>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <FunnelIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Encuentra tu profesional ideal</h3>
                    <p className="text-xs text-gray-500">Filtra y ordena según tus necesidades</p>
                  </div>
                </div>
                
                {/* Clear Filters */}
                {(searchTerm || selectedCity || selectedServiceType) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCity('');
                      setSelectedServiceType('');
                      setSortBy('rating');
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-lg text-xs font-medium transition-colors duration-200"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Limpiar filtros</span>
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre, empresa o servicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 placeholder-gray-400 text-sm transition-all"
                />
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                {/* City Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Ciudad</label>
                  <div className="relative">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer transition-all"
                    >
                      {cities.map(city => (
                        <option key={city.value} value={city.value}>{city.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Service Type Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tipo de Servicio</label>
                  <div className="relative">
                    <select
                      value={selectedServiceType}
                      onChange={(e) => setSelectedServiceType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer transition-all"
                    >
                      <option value="">Todos los servicios</option>
                      {serviceTypes.map(st => (
                        <option key={st.code} value={st.code}>{st.icon} {st.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <WrenchScrewdriverIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Ordenar por</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer transition-all"
                    >
                      <option value="rating">Mejor calificados</option>
                      <option value="jobs">Más trabajos</option>
                      <option value="experience">Más experiencia</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <StarIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* View Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Vista</label>
                  <div className="flex bg-gray-50 border border-gray-300 rounded-lg overflow-hidden h-9">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 flex items-center justify-center transition-all duration-200 text-sm font-medium ${
                        viewMode === 'grid' 
                          ? 'bg-orange-600 text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Squares2X2Icon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 flex items-center justify-center transition-all duration-200 text-sm font-medium ${
                        viewMode === 'list' 
                          ? 'bg-orange-600 text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ListBulletIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{sortedProfessionals.length}</span>
                  <span>
                    {sortedProfessionals.length === 1 ? 'profesional encontrado' : 'profesionales encontrados'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando profesionales...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
              >
                Recargar
              </button>
            </div>
          ) : sortedProfessionals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No se encontraron profesionales con los filtros seleccionados.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProfessionals.map((professional, index) => {
                const serviceTypeCode = professional.serviceTypeCode || professional.serviceType;
                const serviceTypeName = professional.serviceTypeName;
                const serviceTypeInfo = serviceTypeCode ? getServiceTypeInfo(serviceTypeCode) : null;
                return (
                  <motion.div
                    key={professional.id}
                    initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.08, type: "spring" }}
                    className="group relative perspective-1000"
                    style={{ overflow: 'visible' }}
                  >
                    {/* Badge de verificado - Solo icono, sin fondo */}
                    {Boolean(professional.isVerified) && (
                      <div 
                        className="absolute top-2 right-2 z-[99999]"
                        title="Profesional Verificado"
                      >
                        <CheckBadgeIcon className="w-6 h-6 text-emerald-600" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                      </div>
                    )}

                    <div className="relative h-full rounded-2xl bg-gradient-to-br from-white via-gray-50 to-white shadow-xl hover:shadow-2xl border border-gray-200/50 overflow-visible transition-all duration-700 hover:-translate-y-3 hover:scale-[1.03] transform-gpu"
                      style={{ 
                        transformStyle: 'preserve-3d',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,250,251,0.9) 50%, rgba(255,255,255,0.9) 100%)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {/* Círculo decorativo de fondo superior */}
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-orange-200/30 via-red-200/20 to-pink-200/30 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000"></div>
                      
                      {/* Círculo decorativo de fondo inferior */}
                      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-blue-200/20 via-indigo-200/15 to-purple-200/25 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000"></div>

                      <div className="relative p-5 flex flex-col items-center text-center overflow-visible">

                        {/* Foto circular grande centrada con badge de verificado */}
                        <div className="relative mb-4 w-28 h-28 mx-auto overflow-visible">
                          {/* Anillos concéntricos animados */}
                          <div className="absolute inset-0 rounded-full border-3 border-orange-200/50 scale-110 group-hover:scale-115 group-hover:border-orange-300 transition-all duration-700 pointer-events-none z-0"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-red-200/30 scale-125 group-hover:scale-130 group-hover:border-red-300 transition-all duration-1000 pointer-events-none z-0"></div>
                          
                          <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-2xl border-3 border-white group-hover:scale-105 transition-transform duration-500 z-10">
                            {professional.photo ? (
                              <img
                                src={
                                  professional.photo.startsWith('http') 
                                    ? professional.photo 
                                    : getEndpoint(professional.photo.startsWith('/') ? professional.photo : `/uploads/professionals/${professional.photo}`)
                                }
                                alt={`${professional.firstName} ${professional.lastName}`}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'w-full h-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl rounded-full';
                                    fallback.textContent = `${professional.firstName?.[0] || ''}${professional.lastName?.[0] || ''}`;
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl rounded-full">
                                {professional.firstName?.[0] || ''}{professional.lastName?.[0] || ''}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Nombre y empresa */}
                        <div className="mb-3 w-full">
                          <h3 className="text-xl font-extrabold text-gray-900 mb-1 group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:via-red-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                            {professional.firstName} {professional.lastName}
                          </h3>
                          {professional.companyName && (
                            <p className="text-xs text-gray-500 font-medium mb-2">{professional.companyName}</p>
                          )}
                          
                          {/* Especialidad Principal - Destacada */}
                          {(serviceTypeName || serviceTypeInfo?.name) && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-xs font-bold shadow-md mb-2">
                              <WrenchScrewdriverIcon className="w-4 h-4" />
                              <span>{serviceTypeName || serviceTypeInfo?.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Rating y reseñas mejorado */}
                        {professional.averageRating != null && Number(professional.averageRating) > 0 && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                            className="mb-2 w-full flex flex-col items-center justify-center gap-1"
                          >
                            <div className="flex items-center justify-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <StarSolidIcon 
                                  key={i} 
                                  className={`w-3.5 h-3.5 ${i < Math.floor(Number(professional.averageRating) || 0) ? 'text-yellow-500' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm font-bold text-orange-600 text-center">
                              {Number(professional.averageRating).toFixed(1)}
                            </span>
                            {professional.totalReviews != null && Number(professional.totalReviews) > 0 && (
                              <span className="text-[9px] text-gray-600 text-center">
                                {professional.totalReviews} {professional.totalReviews === 1 ? 'reseña' : 'reseñas'}
                              </span>
                            )}
                          </motion.div>
                        )}

                        {/* Estadísticas de confianza */}
                        <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                          {professional.completedJobs != null && Number(professional.completedJobs) > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-[10px] font-semibold border border-green-200">
                              <BriefcaseIcon className="w-3 h-3" />
                              <span>{professional.completedJobs}+</span>
                            </div>
                          )}
                          {professional.experienceYears != null && Number(professional.experienceYears) > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 text-[10px] font-semibold border border-purple-200">
                              <StarSolidIcon className="w-3 h-3" />
                              <span>{professional.experienceYears}a</span>
                            </div>
                          )}
                          {professional.responseTimeHours != null && Number(professional.responseTimeHours) > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 text-[10px] font-semibold border border-cyan-200">
                              <ClockIcon className="w-3 h-3" />
                              <span>{professional.responseTimeHours}h</span>
                            </div>
                          )}
                        </div>

                        {/* Certificaciones y Habilidades */}
                        {(professional.certifications && professional.certifications.length > 0) || (professional.skills && professional.skills.length > 0) ? (
                          <div className="mb-3 w-full">
                            <div className="flex flex-wrap justify-center gap-1">
                              {professional.certifications && professional.certifications.slice(0, 2).map((cert, idx) => (
                                <span key={`cert-${idx}`} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-md text-[9px] font-semibold border border-indigo-200">
                                  <AcademicCapIcon className="w-2.5 h-2.5" />
                                  <span className="truncate max-w-[80px]">{cert}</span>
                                </span>
                              ))}
                              {professional.skills && professional.skills.slice(0, 2).map((skill, idx) => (
                                <span key={`skill-${idx}`} className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 rounded-md text-[9px] font-semibold border border-teal-200">
                                  <span className="truncate max-w-[80px]">{skill}</span>
                                </span>
                              ))}
                              {((professional.certifications?.length || 0) + (professional.skills?.length || 0)) > 4 && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[9px] font-semibold">
                                  +{((professional.certifications?.length || 0) + (professional.skills?.length || 0)) - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : null}

                        {/* Descripción */}
                        {professional.description && (
                          <div className="mb-3 w-full px-2">
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                              {professional.description}
                            </p>
                          </div>
                        )}

                        {/* Ubicación y áreas de servicio */}
                        <div className="mb-3 w-full space-y-1.5">
                          {professional.city && (
                            <div className="flex items-center justify-center gap-1">
                              <MapPinIcon className="w-3 h-3 text-blue-600" />
                              <span className="text-[10px] font-semibold text-gray-700">
                                {professional.city}
                                {professional.state && `, ${professional.state}`}
                              </span>
                            </div>
                          )}
                          {professional.serviceAreas && professional.serviceAreas.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-1">
                              <span className="text-[9px] font-medium text-gray-500 uppercase">Áreas:</span>
                              {professional.serviceAreas.slice(0, 3).map((area, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-md text-[9px] font-semibold border border-green-200">
                                  {area}
                                </span>
                              ))}
                              {professional.serviceAreas.length > 3 && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[9px] font-semibold">
                                  +{professional.serviceAreas.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Precio destacado - Estilo profesional limpio */}
                        {(professional.hourlyRate || professional.minimumServicePrice) && professional.currencyCode && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mb-4 w-full text-center"
                          >
                            {professional.hourlyRate && (
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">POR HORA</span>
                                <div className="flex items-baseline justify-center gap-1.5">
                                  {(() => {
                                    // Formatear el número manualmente para control de colores
                                    const symbol = getCurrencySymbol(professional.currencyCode as any);
                                    const formattedNumber = new Intl.NumberFormat('es-PY', {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0
                                    }).format(professional.hourlyRate);
                                    
                                    // Para PYG mostrar "Gs." en lugar del símbolo
                                    const displaySymbol = professional.currencyCode === 'PYG' ? 'Gs.' : symbol;
                                    
                                    return (
                                      <>
                                        <span className="text-base font-semibold text-blue-600">{displaySymbol}</span>
                                        <span className="text-3xl font-extrabold text-gray-900 leading-none tracking-tight">
                                          {formattedNumber}
                                        </span>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* Portfolio - Galería de trabajos */}
                        {professional.portfolioImages && professional.portfolioImages.length > 0 && (
                          <div className="mb-4 w-full">
                            <div className="flex items-center justify-center gap-1 mb-2">
                              <PhotoIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600">Portfolio</span>
                            </div>
                            <div className="flex justify-center gap-1.5">
                              {professional.portfolioImages.slice(0, 3).map((img, idx) => (
                                <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                                  <img
                                    src={img.startsWith('http') ? img : getEndpoint(img.startsWith('/') ? img : `/uploads/professionals/portfolio/${img}`)}
                                    alt={`Trabajo ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              ))}
                              {professional.portfolioImages.length > 3 && (
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-200 shadow-sm flex items-center justify-center">
                                  <span className="text-xs font-bold text-gray-600">+{professional.portfolioImages.length - 3}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Botones circulares compactos */}
                        <div className="flex flex-wrap justify-center gap-3 w-full mt-auto">
                          {professional.phone ? (
                            <>
                              <motion.a
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                                href={`tel:${professional.phone}`}
                                className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 group/btn relative overflow-hidden"
                                title="Llamar"
                              >
                                <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover/btn:scale-150 transition-transform duration-500"></div>
                                <PhoneIcon className="w-6 h-6 relative z-10" />
                              </motion.a>
                              <motion.a
                                whileHover={{ scale: 1.1, rotate: -5 }}
                                whileTap={{ scale: 0.95 }}
                                href={getWhatsAppUrl(professional.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 group/btn relative overflow-hidden"
                                title="WhatsApp"
                              >
                                <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover/btn:scale-150 transition-transform duration-500"></div>
                                <ChatBubbleLeftRightIcon className="w-6 h-6 relative z-10" />
                              </motion.a>
                            </>
                          ) : null}
                          {professional.email && (
                            <motion.a
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.95 }}
                              href={`mailto:${professional.email}`}
                              className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 group/btn relative overflow-hidden"
                              title="Email"
                            >
                              <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover/btn:scale-150 transition-transform duration-500"></div>
                              <EnvelopeIcon className="w-6 h-6 relative z-10" />
                            </motion.a>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openVoteModal(professional.id)}
                            className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 group/btn relative overflow-hidden"
                            title="Calificar"
                          >
                            <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover/btn:scale-150 transition-transform duration-500"></div>
                            <StarSolidIcon className="w-6 h-6 relative z-10" />
                          </motion.button>
                        </div>
                        
                        {/* Botón Ver perfil */}
                        <Link
                          href={`/profesionales/${createProfessionalSlug(professional)}`}
                          className="mt-3 w-full text-center py-2 px-4 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        >
                          Ver perfil
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProfessionals.map((professional, index) => {
                const serviceTypeCode = professional.serviceTypeCode || professional.serviceType;
                const serviceTypeName = professional.serviceTypeName;
                const serviceTypeInfo = serviceTypeCode ? getServiceTypeInfo(serviceTypeCode) : null;
                return (
                  <motion.div
                    key={professional.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.03 }}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Fondo animado */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-50/0 via-red-50/0 to-pink-50/0 group-hover:from-orange-50/20 group-hover:via-red-50/15 group-hover:to-pink-50/20 transition-all duration-500"></div>
                    
                    {/* Top accent bar animada */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 group-hover:h-2 transition-all duration-300"></div>
                    
                    {/* Efecto de brillo lateral */}
                    <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-orange-100/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    
                    <div className="relative p-6 flex items-start gap-6">
                      {/* Foto mejorada */}
                      <div className="relative flex-shrink-0">
                        {/* Anillo animado alrededor de la foto */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-md transition-all duration-500 animate-pulse"></div>
                        <div className="relative">
                          {professional.photo ? (
                            <img
                              src={
                                professional.photo.startsWith('http') 
                                  ? professional.photo 
                                  : getEndpoint(professional.photo.startsWith('/') ? professional.photo : `/uploads/professionals/${professional.photo}`)
                              }
                              alt={`${professional.firstName} ${professional.lastName}`}
                              className="w-32 h-32 rounded-2xl object-cover shadow-xl border-4 border-white group-hover:scale-105 transition-transform duration-500 z-10"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const fallback = document.createElement('div');
                                  fallback.className = 'w-32 h-32 bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl border-4 border-white group-hover:scale-105 transition-transform duration-500 z-10';
                                  fallback.textContent = `${professional.firstName?.[0] || ''}${professional.lastName?.[0] || ''}`;
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-32 h-32 bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl border-4 border-white group-hover:scale-105 transition-transform duration-500 z-10">
                              {professional.firstName?.[0] || ''}{professional.lastName?.[0] || ''}
                            </div>
                          )}
                          {/* Badge de verificación mejorado */}
                          {professional.isVerified && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                              className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 rounded-full flex items-center justify-center border-3 border-white shadow-xl z-20 group-hover:scale-110 transition-transform duration-300"
                            >
                              <CheckBadgeIcon className="w-5 h-5 text-white" />
                              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                      
                      {/* Contenido mejorado */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors duration-300">
                              {professional.firstName} {professional.lastName}
                            </h3>
                            {professional.companyName && (
                              <p className="text-sm text-gray-500 mb-2 font-medium">{professional.companyName}</p>
                            )}
                            
                            {/* Especialidad Principal - Destacada */}
                            {(serviceTypeName || serviceTypeInfo?.name) && (
                              <motion.div 
                                whileHover={{ scale: 1.02 }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl text-sm font-bold shadow-lg mb-3"
                              >
                                <WrenchScrewdriverIcon className="w-5 h-5" />
                                <span>{serviceTypeName || serviceTypeInfo?.name}</span>
                              </motion.div>
                            )}
                            
                            {/* Descripción */}
                            {professional.description && (
                              <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                                {professional.description}
                              </p>
                            )}
                            
                            {/* Badges informativos mejorados */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              {professional.city && (
                                <motion.span 
                                  whileHover={{ scale: 1.05 }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl text-xs font-semibold border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                  <MapPinIcon className="w-3.5 h-3.5 text-blue-500" />
                                  {professional.city}
                                </motion.span>
                              )}
                              {professional.averageRating != null && Number(professional.averageRating) > 0 && (
                                <motion.span 
                                  whileHover={{ scale: 1.05 }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 rounded-xl text-xs font-semibold border border-yellow-100 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                  <StarSolidIcon className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                  <span className="font-bold">{Number(professional.averageRating).toFixed(1)}</span>
                                  {professional.totalReviews != null && Number(professional.totalReviews) > 0 && ` (${professional.totalReviews} ${professional.totalReviews === 1 ? 'reseña' : 'reseñas'})`}
                                </motion.span>
                              )}
                            </div>

                            {/* Estadísticas de confianza */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              {professional.completedJobs != null && Number(professional.completedJobs) > 0 && (
                                <motion.span 
                                  whileHover={{ scale: 1.05 }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl text-xs font-semibold border border-green-100 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                  <BriefcaseIcon className="w-3.5 h-3.5 text-green-500" />
                                  {professional.completedJobs}+ trabajos
                                </motion.span>
                              )}
                              {professional.experienceYears != null && Number(professional.experienceYears) > 0 && (
                                <motion.span 
                                  whileHover={{ scale: 1.05 }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 rounded-xl text-xs font-semibold border border-purple-100 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                  <StarSolidIcon className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />
                                  {professional.experienceYears} años exp.
                                </motion.span>
                              )}
                              {professional.responseTimeHours != null && Number(professional.responseTimeHours) > 0 && (
                                <motion.span 
                                  whileHover={{ scale: 1.05 }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 rounded-xl text-xs font-semibold border border-cyan-100 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                  <ClockIcon className="w-3.5 h-3.5 text-cyan-500" />
                                  Responde en {professional.responseTimeHours}h
                                </motion.span>
                              )}
                              {professional.serviceAreas && professional.serviceAreas.length > 0 && (
                                <motion.span 
                                  whileHover={{ scale: 1.05 }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 rounded-xl text-xs font-semibold border border-pink-100 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                  <MapPinIcon className="w-3.5 h-3.5 text-pink-500" />
                                  {professional.serviceAreas.length} {professional.serviceAreas.length === 1 ? 'área' : 'áreas'}
                                </motion.span>
                              )}
                            </div>

                            {/* Certificaciones y habilidades */}
                            {(professional.certifications && professional.certifications.length > 0) || (professional.skills && professional.skills.length > 0) ? (
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                {professional.certifications && professional.certifications.slice(0, 2).map((cert, idx) => (
                                  <motion.span 
                                    key={idx}
                                    whileHover={{ scale: 1.05 }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg text-[10px] font-semibold border border-indigo-100 shadow-sm"
                                  >
                                    <AcademicCapIcon className="w-3 h-3" />
                                    {cert}
                                  </motion.span>
                                ))}
                                {professional.skills && professional.skills.slice(0, 3).map((skill, idx) => (
                                  <motion.span 
                                    key={idx}
                                    whileHover={{ scale: 1.05 }}
                                    className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 rounded-lg text-[10px] font-semibold border border-teal-100 shadow-sm"
                                  >
                                    {skill}
                                  </motion.span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        
                        {/* Precios destacados mejorados */}
                        {(professional.hourlyRate || professional.minimumServicePrice) && professional.currencyCode && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-4 relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 p-4 border-2 border-blue-100/50 shadow-inner group-hover:shadow-lg transition-all duration-300"
                          >
                            {/* Decoración de fondo */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-2xl"></div>
                            
                            <div className="relative z-10">
                              <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 text-center flex items-center justify-center gap-2">
                                <div className="w-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                                <span>Precios</span>
                                <div className="w-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                              </div>
                              <div className="flex flex-wrap gap-4">
                                {professional.hourlyRate && (
                                  <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2.5 border border-blue-100/50 backdrop-blur-sm">
                                    <span className="text-xs text-gray-600 font-semibold">Por hora:</span>
                                    <span className="text-base font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                      {formatPriceLocal(professional.hourlyRate, professional.currencyCode)}
                                    </span>
                                  </div>
                                )}
                                {professional.minimumServicePrice && (
                                  <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2.5 border border-indigo-100/50 backdrop-blur-sm">
                                    <span className="text-xs text-gray-600 font-semibold">Mínimo:</span>
                                    <span className="text-base font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                      {formatPriceLocal(professional.minimumServicePrice, professional.currencyCode)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Portfolio - Galería de trabajos */}
                        {professional.portfolioImages && professional.portfolioImages.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <PhotoIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600">Portfolio de trabajos</span>
                            </div>
                            <div className="flex gap-2">
                              {professional.portfolioImages.slice(0, 4).map((img, idx) => (
                                <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                  <img
                                    src={img.startsWith('http') ? img : getEndpoint(img.startsWith('/') ? img : `/uploads/professionals/portfolio/${img}`)}
                                    alt={`Trabajo ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              ))}
                              {professional.portfolioImages.length > 4 && (
                                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-200 shadow-sm flex items-center justify-center">
                                  <span className="text-xs font-bold text-gray-600">+{professional.portfolioImages.length - 4}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Indicador de disponibilidad mejorado */}
                        {professional.isAvailable !== undefined && (
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="mb-4"
                          >
                            <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold shadow-lg transition-all duration-300 ${
                              professional.isAvailable 
                                ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white border-2 border-emerald-300 shadow-emerald-200/50 hover:shadow-emerald-300/50' 
                                : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                            }`}>
                              <div className={`relative w-2 h-2 rounded-full ${professional.isAvailable ? 'bg-white' : 'bg-gray-400'}`}>
                                {professional.isAvailable && (
                                  <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
                                )}
                              </div>
                              <span>{professional.isAvailable ? 'Disponible ahora' : 'No disponible'}</span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                      
                      {/* Botones de contacto mejorados */}
                      <div className="flex flex-col gap-2.5 flex-shrink-0">
                        {professional.phone ? (
                          <>
                            <motion.a
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              href={`tel:${professional.phone}`}
                              className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 hover:from-green-700 hover:via-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl text-center text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/40 flex items-center justify-center gap-2.5 min-w-[140px] group/btn"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                              <PhoneIcon className="w-5 h-5 relative z-10" />
                              <span className="relative z-10">Llamar</span>
                            </motion.a>
                            <motion.a
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              href={getWhatsAppUrl(professional.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-green-600 hover:from-emerald-600 hover:via-green-600 hover:to-green-700 text-white py-3 px-6 rounded-xl text-center text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/40 flex items-center justify-center gap-2.5 min-w-[140px] group/btn"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                              <ChatBubbleLeftRightIcon className="w-5 h-5 relative z-10" />
                              <span className="relative z-10">WhatsApp</span>
                            </motion.a>
                          </>
                        ) : null}
                        {professional.email && (
                          <motion.a
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            href={`mailto:${professional.email}`}
                            className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-red-700 hover:from-orange-700 hover:via-red-700 hover:to-red-800 text-white py-3 px-6 rounded-xl text-center text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/40 flex items-center justify-center gap-2.5 min-w-[140px] group/btn"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                            <EnvelopeIcon className="w-5 h-5 relative z-10" />
                            <span className="relative z-10">Email</span>
                          </motion.a>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => openVoteModal(professional.id)}
                          className="relative overflow-hidden bg-gradient-to-r from-yellow-500 via-orange-500 to-orange-600 hover:from-yellow-600 hover:via-orange-600 hover:to-orange-700 text-white py-3 px-6 rounded-xl text-center text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/40 flex items-center justify-center gap-2.5 min-w-[140px] group/btn"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                          <StarSolidIcon className="w-5 h-5 relative z-10" />
                          <span className="relative z-10">Calificar</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de votación */}
      <ModernPopup
        isOpen={voteModalOpen}
        onClose={closeVoteModal}
        title="Calificar Profesional"
        subtitle={selectedProfessionalId ? `Califica a ${professionals.find(p => p.id === selectedProfessionalId)?.firstName} ${professionals.find(p => p.id === selectedProfessionalId)?.lastName}` : ''}
        maxWidth="max-w-md"
        icon={<StarSolidIcon className="w-6 h-6 text-yellow-400" />}
      >
        <div className="space-y-6">
          {/* Sistema de estrellas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Selecciona tu calificación (1-5 estrellas)
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setSelectedRating(rating)}
                  className="transition-transform hover:scale-125 active:scale-95"
                >
                  <StarSolidIcon
                    className={`w-10 h-10 ${
                      rating <= selectedRating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 fill-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {selectedRating > 0 && (
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                {selectedRating === 1 && 'Muy malo'}
                {selectedRating === 2 && 'Malo'}
                {selectedRating === 3 && 'Regular'}
                {selectedRating === 4 && 'Bueno'}
                {selectedRating === 5 && 'Excelente'}
              </p>
            )}
          </div>

          {/* Nombre (opcional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tu nombre (opcional)
            </label>
            <input
              type="text"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          {/* Email (opcional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tu email (opcional)
            </label>
            <input
              type="email"
              value={voterEmail}
              onChange={(e) => setVoterEmail(e.target.value)}
              placeholder="Ej: juan@ejemplo.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Si proporcionas tu email, podrás editar tu reseña más tarde
            </p>
          </div>

          {/* Comentario (opcional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={voterComment}
              onChange={(e) => setVoterComment(e.target.value)}
              placeholder="Comparte tu experiencia con este profesional..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={closeVoteModal}
              disabled={submittingVote}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleVote}
              disabled={submittingVote || selectedRating === 0}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submittingVote ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <StarSolidIcon className="w-5 h-5" />
                  Enviar Calificación
                </>
              )}
            </button>
          </div>
        </div>
      </ModernPopup>

    </div>
    </>
  );
}

