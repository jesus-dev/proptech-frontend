"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  StarIcon,
  ArrowLeftIcon,
  UserIcon,
  ClockIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  PhotoIcon,
  WrenchScrewdriverIcon,
  CheckBadgeIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { publicProfessionalService, PublicProfessional } from '@/services/publicProfessionalService';
import { getEndpoint } from '@/lib/api-config';
import { formatPrice } from '@/lib/utils';
import ModernPopup from '@/components/ui/ModernPopup';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api';

export default function ProfessionalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slugOrId = params?.slug as string;
  const [professional, setProfessional] = useState<PublicProfessional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Estados para el modal de votación
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [voterName, setVoterName] = useState('');
  const [voterEmail, setVoterEmail] = useState('');
  const [voterComment, setVoterComment] = useState('');
  const [submittingVote, setSubmittingVote] = useState(false);
  const { toast } = useToast();

  // Extraer ID del slug (formato: nombre-apellido-id o solo número)
  const extractIdFromSlug = (slugOrId: string): number | null => {
    // Si es solo un número, es un ID directo (compatibilidad)
    if (/^\d+$/.test(slugOrId)) {
      return Number(slugOrId);
    }
    
    // Si tiene formato slug-id, extraer el ID del final
    const parts = slugOrId.split('-');
    const lastPart = parts[parts.length - 1];
    
    if (/^\d+$/.test(lastPart)) {
      return Number(lastPart);
    }
    
    return null;
  };

  useEffect(() => {
    const fetchProfessionalData = async () => {
      if (!slugOrId) return;
      
      try {
        setLoading(true);
        setError('');
        
        const professionalId = extractIdFromSlug(slugOrId);
        
        if (!professionalId) {
          throw new Error('URL inválida');
        }
        
        // Obtener datos del profesional
        const data = await publicProfessionalService.getProfessionalById(professionalId);
        
        if (!data) {
          throw new Error('Profesional no encontrado');
        }
        
        if (data.status !== 'ACTIVE') {
          router.replace('/profesionales');
          return;
        }
        
        setProfessional(data);
      } catch (err: any) {
        console.error('Error loading professional:', err);
        setError(err.message || 'Error al cargar el perfil del profesional');
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionalData();
  }, [slugOrId, router]);

  // Funciones para el sistema de votación
  const openVoteModal = () => {
    setSelectedRating(0);
    setVoterName('');
    setVoterEmail('');
    setVoterComment('');
    setVoteModalOpen(true);
  };

  const closeVoteModal = () => {
    setVoteModalOpen(false);
    setSelectedRating(0);
    setVoterName('');
    setVoterEmail('');
    setVoterComment('');
  };

  const handleVote = async () => {
    if (!professional || !selectedRating || selectedRating === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona una calificación",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingVote(true);
      const response = await publicProfessionalService.voteProfessional(professional.id, {
        rating: selectedRating,
        voterName: voterName.trim() || undefined,
        voterEmail: voterEmail.trim() || undefined,
        comment: voterComment.trim() || undefined,
      });

      // Actualizar el profesional con los nuevos valores
      setProfessional(prev => prev ? {
        ...prev,
        averageRating: response.averageRating,
        totalReviews: response.totalReviews
      } : null);

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

  const formatPriceLocal = (price: number, currencyCode: string) => {
    return formatPrice(price, currencyCode as any, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const getWhatsAppUrl = (phone: string) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('+') ? cleanPhone : `+595${cleanPhone}`;
    return `https://wa.me/${phoneWithCountry.replace(/\+/g, '')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil del profesional...</p>
        </div>
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <UserIcon className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profesional no encontrado</h1>
          <p className="text-gray-600 mb-6">{error || 'El profesional que buscas no existe o no está disponible.'}</p>
          <Link
            href="/profesionales"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver a profesionales
          </Link>
        </div>
      </div>
    );
  }

  const photoUrl = professional.photo 
    ? (professional.photo.startsWith('http') 
        ? professional.photo 
        : getEndpoint(professional.photo.startsWith('/') ? professional.photo : `/uploads/professionals/${professional.photo}`))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header con botón volver - Solo el fondo del menú */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 min-h-[18vh] sm:min-h-[25vh] flex items-start justify-start overflow-hidden bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="professional-detail-hero-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="4" fill="white" opacity="0.3"/>
                <circle cx="10" cy="10" r="2" fill="white" opacity="0.2"/>
                <circle cx="50" cy="50" r="2" fill="white" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#professional-detail-hero-pattern)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full z-10 pt-16 sm:pt-20">
          <Link
            href="/profesionales"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-gray-900 text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border border-white/50"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Volver a profesionales</span>
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 -mt-[8vh] sm:-mt-[12vh] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar izquierdo - Información del profesional */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:sticky lg:top-24"
            >
              {/* Foto de perfil */}
              <div className="relative mb-6">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`${professional.firstName} ${professional.lastName}`}
                    className="w-full aspect-square object-cover rounded-2xl shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full aspect-square bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg';
                        fallback.textContent = `${professional.firstName?.[0] || ''}${professional.lastName?.[0] || ''}`;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                    {professional.firstName?.[0] || ''}{professional.lastName?.[0] || ''}
                  </div>
                )}
                {professional.isVerified && (
                  <div className="absolute top-4 right-4 w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                    <CheckBadgeIcon className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              {/* Nombre y tipo de servicio */}
              <div className="text-center mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {professional.firstName} {professional.lastName}
                </h1>
                {professional.companyName && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-3">{professional.companyName}</p>
                )}
                {/* Especialidad Principal - Destacada */}
                {professional.serviceTypeName && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl text-sm font-bold shadow-lg mb-3">
                    <WrenchScrewdriverIcon className="w-5 h-5" />
                    <span>{professional.serviceTypeName}</span>
                  </div>
                )}
              </div>

              {/* Rating */}
              {professional.averageRating != null && Number(professional.averageRating) > 0 && (
                <div className="mb-3 w-full flex flex-col items-center gap-1">
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarSolidIcon 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(Number(professional.averageRating) || 0) ? 'text-yellow-500' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-base font-bold text-orange-600 text-center">
                    {Number(professional.averageRating).toFixed(1)}
                  </span>
                  {professional.totalReviews != null && Number(professional.totalReviews) > 0 && (
                    <span className="text-xs text-gray-600 text-center">
                      {professional.totalReviews} {professional.totalReviews === 1 ? 'reseña' : 'reseñas'}
                    </span>
                  )}
                </div>
              )}

              {/* Estadísticas */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {professional.completedJobs != null && Number(professional.completedJobs) > 0 && (
                  <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-green-50 rounded-lg">
                    <BriefcaseIcon className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-700">Trabajos completados</p>
                      <p className="text-base sm:text-lg font-bold text-green-600">{professional.completedJobs}+</p>
                    </div>
                  </div>
                )}
                {professional.experienceYears != null && Number(professional.experienceYears) > 0 && (
                  <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-purple-50 rounded-lg">
                    <StarSolidIcon className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-700">Años de experiencia</p>
                      <p className="text-base sm:text-lg font-bold text-purple-600">{professional.experienceYears} años</p>
                    </div>
                  </div>
                )}
                {professional.responseTimeHours != null && Number(professional.responseTimeHours) > 0 && (
                  <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-cyan-50 rounded-lg">
                    <ClockIcon className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-700">Tiempo de respuesta</p>
                      <p className="text-base sm:text-lg font-bold text-cyan-600">{professional.responseTimeHours}h</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Precios */}
              {(professional.hourlyRate || professional.minimumServicePrice) && professional.currencyCode && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Precios</h3>
                  {professional.hourlyRate && (
                    <div className="mb-2">
                      <p className="text-[10px] sm:text-xs text-gray-600">Por hora</p>
                      <p className="text-lg sm:text-xl font-bold text-blue-600">
                        {formatPriceLocal(professional.hourlyRate, professional.currencyCode)}
                      </p>
                    </div>
                  )}
                  {professional.minimumServicePrice && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-600">Precio mínimo</p>
                      <p className="text-lg sm:text-xl font-bold text-blue-600">
                        {formatPriceLocal(professional.minimumServicePrice, professional.currencyCode)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Botones de contacto */}
              <div className="space-y-2 sm:space-y-3">
                {professional.phone && (
                  <>
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={`tel:${professional.phone}`}
                      className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-center text-sm sm:text-base font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <PhoneIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                      Llamar
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={getWhatsAppUrl(professional.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-center text-sm sm:text-base font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                      WhatsApp
                    </motion.a>
                  </>
                )}
                {professional.email && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`mailto:${professional.email}`}
                    className="block w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-center text-sm sm:text-base font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <EnvelopeIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                    Email
                  </motion.a>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openVoteModal}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-center text-sm sm:text-base font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <StarSolidIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                  Calificar
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción */}
            {professional.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre el profesional</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{professional.description}</p>
              </motion.div>
            )}

            {/* Información de contacto y ubicación */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información de contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {professional.city && (
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Ubicación</p>
                      <p className="font-semibold text-gray-900">{professional.city}{professional.state ? `, ${professional.state}` : ''}</p>
                    </div>
                  </div>
                )}
                {professional.address && (
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Dirección</p>
                      <p className="font-semibold text-gray-900">{professional.address}</p>
                    </div>
                  </div>
                )}
                {professional.website && (
                  <div className="flex items-center gap-3">
                    <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Sitio web</p>
                      <a 
                        href={professional.website.startsWith('http') ? professional.website : `https://${professional.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 hover:text-blue-700"
                      >
                        {professional.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Certificaciones */}
            {professional.certifications && professional.certifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AcademicCapIcon className="w-6 h-6 text-indigo-600" />
                  Certificaciones
                </h2>
                <div className="flex flex-wrap gap-2">
                  {professional.certifications.map((cert, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold border border-indigo-200">
                      <AcademicCapIcon className="w-4 h-4" />
                      {cert}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Habilidades */}
            {professional.skills && professional.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Habilidades</h2>
                <div className="flex flex-wrap gap-2">
                  {professional.skills.map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-semibold border border-teal-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Ubicaciones que cubre con su servicio */}
            {professional.serviceAreas && professional.serviceAreas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPinIcon className="w-6 h-6 text-green-600" />
                  Ubicaciones que cubre con su servicio
                </h2>
                <div className="flex flex-wrap gap-2">
                  {professional.serviceAreas.map((area, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg text-sm font-semibold border border-green-200 shadow-sm">
                      <MapPinIcon className="w-4 h-4" />
                      {area}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Portfolio */}
            {professional.portfolioImages && professional.portfolioImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <PhotoIcon className="w-6 h-6 text-gray-600" />
                  Portfolio de trabajos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {professional.portfolioImages.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={img.startsWith('http') ? img : getEndpoint(img.startsWith('/') ? img : `/uploads/professionals/portfolio/${img}`)}
                        alt={`Trabajo ${idx + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(img.startsWith('http') ? img : getEndpoint(img.startsWith('/') ? img : `/uploads/professionals/portfolio/${img}`), '_blank')}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de votación */}
      <ModernPopup
        isOpen={voteModalOpen}
        onClose={closeVoteModal}
        title="Calificar Profesional"
        subtitle={`Califica a ${professional.firstName} ${professional.lastName}`}
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
  );
}

