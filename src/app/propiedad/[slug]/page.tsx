"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Script from "next/script";
import { publicPropertyService } from "@/services/publicPropertyService";
import { getImageBaseUrl } from "@/config/environment";
import { generatePropertyStructuredData } from "@/lib/seo";
import { PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, HomeModernIcon, UserIcon, MapPinIcon, CurrencyDollarIcon, StarIcon, CheckCircleIcon, VideoCameraIcon, MapIcon, ArrowLeftIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon, WifiIcon, ShieldCheckIcon, ClockIcon, BanknotesIcon, DocumentTextIcon, InformationCircleIcon, XMarkIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

// Componente para manejar gestos de swipe en mobile
const SwipeHandler = ({ onSwipeLeft, onSwipeRight }: { onSwipeLeft: () => void; onSwipeRight: () => void }) => {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    // Ignorar si el toque es en un botón u otro elemento interactivo
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Ignorar si el toque es en un botón u otro elemento interactivo
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Solo procesar swipe horizontal si es más pronunciado que el vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div
      className="block sm:hidden absolute inset-0 z-0 pointer-events-none"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Solo capturar eventos en el área central, no en los bordes donde están los botones */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{
          left: '80px',
          right: '80px',
          top: '80px',
          bottom: '80px',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

// Función helper para construir URLs completas de imágenes
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '/images/placeholder.jpg';
  
  // Si ya es una URL completa, retornarla
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si es una imagen local del frontend (no del backend)
  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }
  
  // Construir URL completa del backend
  const baseUrl = getImageBaseUrl();
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const fullUrl = `${baseUrl}${cleanPath}`;
  
  return fullUrl;
};

// Función helper para convertir HTML a texto respetando formato original
const stripHtml = (html: string | null | undefined): string => {
  if (!html) return '';
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Convertir etiquetas HTML a saltos de línea respetando la estructura
  let text = tempDiv.innerHTML
    .replace(/<br\s*\/?>/gi, '\n')           // <br> → salto de línea
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')   // </p><p> → doble salto
    .replace(/<p[^>]*>/gi, '')               // <p> → nada
    .replace(/<\/p>/gi, '\n')                // </p> → salto de línea
    .replace(/<strong[^>]*>/gi, '')          // <strong> → nada
    .replace(/<\/strong>/gi, '')             // </strong> → nada
    .replace(/<[^>]*>/g, '');                // Cualquier otra etiqueta → nada
  
  // Crear un nuevo div para obtener solo el texto limpio
  const cleanDiv = document.createElement('div');
  cleanDiv.innerHTML = text;
  let cleanText = cleanDiv.textContent || cleanDiv.innerText || '';
  
  // Limpiar espacios excesivos pero mantener saltos de línea
  cleanText = cleanText
    .replace(/[ \t]+/g, ' ')      // Múltiples espacios a uno
    .replace(/\n /g, '\n')        // Espacios después de saltos
    .replace(/ \n/g, '\n')        // Espacios antes de saltos
    .replace(/\n\n+/g, '\n\n');   // Múltiples saltos a máximo dos
  
  return cleanText.trim();
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  // Estados para secciones expandibles
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    amenities: false,
    financial: false,
    location: false,
    additional: false
  });

  // Inicializar mounted para el portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevenir scroll del body cuando el lightbox está abierto
  useEffect(() => {
    if (lightboxOpen) {
      // Guardar la posición actual del scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar el scroll
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    
    return () => {
      // Cleanup: restaurar siempre al desmontar
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [lightboxOpen]);

  // Botón WhatsApp flotante con DOM puro - se crea inmediatamente
  useEffect(() => {
    // Pequeño delay para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      // Eliminar botón anterior si existe
      const existing = document.getElementById('wa-float-btn');
      if (existing) {
        existing.remove();
      }
      
      // Crear botón
      const btn = document.createElement('a');
      btn.id = 'wa-float-btn';
      btn.href = `https://wa.me/595981000000?text=${encodeURIComponent('Hola, me interesa una propiedad')}`;
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.innerHTML = `
        <svg viewBox="0 0 32 32" style="width: 32px; height: 32px;">
          <path fill="white" d="M16.002 0C7.164 0 0 7.164 0 16c0 2.825.734 5.48 2.02 7.78L.697 31.302l7.687-2.015A15.93 15.93 0 0 0 16.002 32C24.838 32 32 24.836 32 16S24.838 0 16.002 0zm9.38 22.73c-.39 1.1-2.3 2.02-3.17 2.15-.87.13-1.74.39-5.87-1.26-5.26-2.1-8.64-7.46-8.9-7.8-.26-.35-2.13-2.84-2.13-5.42s1.35-3.84 1.83-4.37c.48-.53 1.05-.66 1.4-.66s.7.01.99.02c.32.01.74-.12 1.16.88.42 1 1.44 3.51 1.57 3.77s.22.57.04.92c-.17.35-.26.57-.52.88-.26.31-.55.69-.78.93-.26.26-.53.54-.23 1.07.3.53 1.34 2.21 2.88 3.58 1.98 1.76 3.65 2.31 4.17 2.57.52.26.83.22 1.13-.13.3-.35 1.29-1.5 1.63-2.02.35-.52.7-.44 1.18-.26.48.17 3.06 1.44 3.58 1.7.52.26.87.39 1 .61.13.22.13 1.27-.26 2.37z"/>
        </svg>
      `;
      
      // Aplicar estilos directamente como string
      const styles = [
        'position: fixed',
        'bottom: 20px',
        'right: 20px',
        'width: 60px',
        'height: 60px',
        'background-color: #25D366',
        'border-radius: 50%',
        'color: white',
        'font-size: 30px',
        'text-decoration: none',
        'box-shadow: 0 4px 12px rgba(0,0,0,0.3)',
        'z-index: 999999',
        'cursor: pointer',
        'display: flex',
        'align-items: center',
        'justify-content: center',
        'text-align: center',
        'line-height: 60px'
      ].map(s => s + ' !important').join('; ');
      
      btn.setAttribute('style', styles);
      
      // Forzar inserción en body
      if (document.body) {
        // IMPORTANTE: Eliminar transform del html y body que rompen position:fixed
        const htmlEl = document.documentElement;
        const bodyEl = document.body;
        
        // Forzar transform: none para que position:fixed funcione
        htmlEl.style.setProperty('transform', 'none', 'important');
        bodyEl.style.setProperty('transform', 'none', 'important');
        
        // Agregar directamente al body
        document.body.insertBefore(btn, document.body.firstChild);
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      const el = document.getElementById('wa-float-btn');
      if (el) {
        el.remove();
      }
    };
  }, []);


  useEffect(() => {
    let isCancelled = false;
    let retryTimeout: NodeJS.Timeout;
    
    const fetchProperty = async (attempt = 1) => {
      if (!slug || isCancelled) return;
      
      try {
        setLoading(true);
        
        const summary = await publicPropertyService.getPropertySummaryBySlug(slug);
        
        if (isCancelled) return;
        
        if (!summary) {
          router.push('/');
          return;
        }
        
        setProperty(summary);
        setLoading(false);
        
        // Incrementar vistas (silencioso)
        if (summary.id) {
          publicPropertyService.incrementViews(summary.id.toString()).catch(() => {});
        }
        
        // Cargar datos adicionales en background
        const loadAdditionalData = async () => {
          const [gallery, amenities] = await Promise.allSettled([
            publicPropertyService.getPropertyGallery(slug),
            publicPropertyService.getPropertyAmenities(slug)
          ]);
          
          if (isCancelled) return;
          
          setProperty((prev: any) => ({
            ...prev,
            galleryImages: gallery.status === 'fulfilled' ? gallery.value?.galleryImages : [],
            amenityIds: amenities.status === 'fulfilled' ? amenities.value?.amenityIds : [],
            amenitiesDetails: amenities.status === 'fulfilled' ? amenities.value?.amenities : []
          }));
        };
        
        loadAdditionalData();
      } catch (err: any) {
        if (isCancelled) return;
        
        // Si no existe, redirigir
        if (err.message?.includes('PROPERTY_NOT_FOUND')) {
          router.push('/');
          return;
        }
        
        // ⭐ REINTENTO AUTOMÁTICO TRANSPARENTE - como si el usuario recargara
        if (attempt < 3) {
          retryTimeout = setTimeout(() => fetchProperty(attempt + 1), 2000);
          return;
        }
        
        // Después de 3 intentos completos, mostrar contenido vacío
        setProperty({
          title: 'Propiedad',
          description: '',
          price: 0,
          bedrooms: 0,
          bathrooms: 0
        });
        setLoading(false);
      }
    };

    fetchProperty();
    
    return () => {
      isCancelled = true;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [slug]);



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 flex items-center justify-center relative overflow-hidden">
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Contenido */}
        <div className="relative z-10 flex flex-col items-center space-y-6">
          {/* Spinner principal con efecto dual */}
          <div className="relative">
            <div className="w-24 h-24 border-4 border-cyan-200/30 border-t-cyan-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            
            {/* Icono de casa en el centro */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
          
          {/* Texto */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              Cargando propiedad
            </h2>
            <p className="text-cyan-100 text-lg drop-shadow-md">
              Preparando los detalles para ti...
            </p>
          </div>
          
          {/* Puntos animados */}
          <div className="flex space-x-3">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-500/50"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce shadow-lg shadow-blue-500/50" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce shadow-lg shadow-indigo-500/50" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-64 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{
              animation: 'loading 1.5s ease-in-out infinite',
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 flex items-center justify-center relative overflow-hidden px-4">
        {/* Efectos de fondo */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>
        
        {/* Contenido */}
        <div className="relative z-10 max-w-md text-center space-y-6">
          {/* Icono de error */}
          <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center border-4 border-red-400/30 shadow-2xl">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          {/* Mensaje */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">
              Propiedad no encontrada
            </h2>
            <p className="text-cyan-100 text-lg drop-shadow-md">
              {error || 'La propiedad que buscas no existe o ya no está disponible'}
            </p>
          </div>
          
          {/* Botón volver */}
          <button
            onClick={() => router.push('/propiedades')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Ver todas las propiedades
          </button>
        </div>
      </div>
    );
  }

  // Procesar datos del agente
  if (property.agent) {
    const firstName = property.agent.firstName || property.agent.nombre || '';
    const lastName = property.agent.lastName || property.agent.apellido || '';
    property.agent.name = property.agent.nombreCompleto || property.agent.name || `${firstName} ${lastName}`.trim();
    // Asegurar que fotoPerfilUrl se preserve y se asigne a avatar para compatibilidad
    if (property.agent.fotoPerfilUrl && !property.agent.avatar) {
      property.agent.avatar = property.agent.fotoPerfilUrl;
    } else if (property.agent.photo && !property.agent.avatar && !property.agent.fotoPerfilUrl) {
      property.agent.avatar = property.agent.photo;
      property.agent.fotoPerfilUrl = property.agent.photo;
    }
    if (!property.agent.name) {
      property.agent.name = property.agent.email || 'Agente';
    }
    // Asegurar que el slug esté disponible (priorizar slug sobre ID)
    if (!property.agent.slug && property.agent.id) {
      // Si no hay slug, el ID se usará como fallback en los enlaces
      console.log('Agent slug not found, will use ID as fallback:', property.agent.id);
    }
  }

  const images = property.galleryImages?.map((img: any) => {
    return getImageUrl(img.url || img);
  }) || (property.featuredImage ? [getImageUrl(property.featuredImage)] : ['/images/placeholder.jpg']);

  const formatPrice = (price: number, currency: string) => {
    const formattedPrice = new Intl.NumberFormat('es-PY').format(price);
    return `${formattedPrice} ${currency}`;
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    
    // Debug para amenidades
    if (section === 'amenities') {
      console.log('Property amenities:', property.amenities);
      console.log('Property amenitiesDetails:', property.amenitiesDetails);
      if (property.amenitiesDetails && property.amenitiesDetails.length > 0) {
        console.log('First amenity detail structure:', property.amenitiesDetails[0]);
        console.log('First amenity detail keys:', Object.keys(property.amenitiesDetails[0] || {}));
      }
    }
  };

  // Generar structured data para SEO
  const structuredData = property ? generatePropertyStructuredData({
    id: property.id,
    title: property.title,
    description: property.description,
    price: property.price || 0,
    currencyCode: property.currencyCode || 'PYG',
    address: property.address,
    cityName: property.cityName,
    stateName: property.stateName,
    countryName: property.countryName,
    zipCode: property.zipCode,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    propertyType: property.propertyType,
    operacion: property.operacion,
    featuredImage: property.featuredImage,
    slug: property.slug,
    agent: property.agent ? {
      name: property.agent.name,
      email: property.agent.email,
      phone: property.agent.phone || property.agent.mobile,
    } : undefined,
  }) : null;

  return (
    <main className="min-h-screen bg-white">
      {/* Structured Data para SEO */}
      {structuredData && (
        <Script
          id="property-structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(structuredData)}
        </Script>
      )}
      
      {/* Header con información principal - Diseño Premium */}
      <section className="relative pt-0 pb-0 overflow-visible">
        {/* Imagen de fondo de la propiedad con overlay mejorado */}
        <div className="absolute inset-0 z-0 min-h-[100vh] sm:min-h-[85vh] lg:min-h-[70vh]">
          <img 
            src={images[0]} 
            alt={property.title} 
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          {/* Overlay premium con gradiente más sofisticado */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none"></div>
          
          {/* Indicador visual premium */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Opening gallery from header button');
              setLightboxIndex(0);
              setLightboxOpen(true);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Touch - Opening gallery from header button');
              setLightboxIndex(0);
              setLightboxOpen(true);
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/10 backdrop-blur-md text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border border-white/20 hover:bg-white/20 active:bg-white/30 transition-all duration-300 shadow-xl cursor-pointer"
            style={{ zIndex: 9999, pointerEvents: 'auto' }}
            aria-label="Ver galería completa"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline pointer-events-none">Ver galería completa</span>
            <span className="sm:hidden pointer-events-none">Galería</span>
          </button>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-32 pb-16 sm:pb-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Información principal - Diseño Premium */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Badge y título premium */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="inline-flex items-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold tracking-wider uppercase bg-white/95 backdrop-blur-sm text-gray-900 shadow-xl border border-white/50">
                    <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-blue-600" />
                    {property.operacion === 'SALE' ? 'EN VENTA' : 'EN ALQUILER'}
                  </span>
                  {property.featured && (
                    <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg">
                      ⭐ Destacada
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                  <span className="block">{property.title}</span>
                </h1>
                <div className="flex items-center gap-2 sm:gap-3 text-white/95">
                  <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span className="text-base sm:text-xl font-medium">{property.cityName || property.address || 'Ubicación no disponible'}</span>
                </div>
              </div>

              {/* Características principales - Diseño Premium */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/20 shadow-2xl hover:bg-white/15 hover:scale-105 transition-all duration-300 group">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl group-hover:bg-white/30 transition-colors">
                      <HomeModernIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{property.bedrooms}</div>
                    <div className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wider">Habitaciones</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/20 shadow-2xl hover:bg-white/15 hover:scale-105 transition-all duration-300 group">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl group-hover:bg-white/30 transition-colors">
                      <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{property.bathrooms}</div>
                    <div className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wider">Baños</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/20 shadow-2xl hover:bg-white/15 hover:scale-105 transition-all duration-300 group">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl group-hover:bg-white/30 transition-colors">
                      <CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{property.area}</div>
                    <div className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wider">m²</div>
                  </div>
                </div>
                {property.parking && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/20 shadow-2xl hover:bg-white/15 hover:scale-105 transition-all duration-300 group">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl group-hover:bg-white/30 transition-colors">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="11" width="18" height="7" rx="2" />
                          <path d="M7 18v2m10-2v2" />
                        </svg>
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{property.parking}</div>
                      <div className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wider">Estacionamientos</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Precio destacado - Diseño Premium */}
              <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/30 shadow-2xl">
                <div className="text-white/80 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2 sm:mb-3">Precio</div>
                <div className="text-2xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-1 sm:mb-2 tracking-tight leading-tight break-words">
                  {formatPrice(property.price || 0, property.currencyCode || 'PYG')}
                </div>
                {property.operacion === 'RENT' && (
                  <div className="text-white/70 text-xs sm:text-base font-medium">por mes</div>
                )}
              </div>
            </div>

            {/* Card del agente - Diseño Premium */}
            <div className="lg:col-span-1 mt-8 lg:mt-0">
              {(property.agent?.slug || property.agent?.id) ? (
                <div 
                  onClick={(e) => {
                    // Prevenir cualquier navegación por defecto
                    e.preventDefault();
                    e.stopPropagation();
                    // Navegar al perfil del agente
                    const agentSlug = property.agent?.slug || property.agent?.id;
                    if (agentSlug) {
                      console.log('Navigating to agent profile:', agentSlug);
                      router.push(`/agente/${agentSlug}`);
                    }
                  }}
                  onMouseDown={(e) => {
                    // Prevenir el comportamiento por defecto del mouse down
                    e.stopPropagation();
                  }}
                  className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 lg:sticky lg:top-24 hover:shadow-3xl transition-all duration-300 cursor-pointer group backdrop-blur-sm"
                  style={{ position: 'relative', zIndex: 10 }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const agentSlug = property.agent?.slug || property.agent?.id;
                      if (agentSlug) {
                        router.push(`/agente/${agentSlug}`);
                      }
                    }
                  }}
                >
                    <div className="text-center mb-8">
                      <div className="relative w-28 h-28 mx-auto mb-5">
                        {property.agent?.fotoPerfilUrl || property.agent?.avatar || property.agent?.photo ? (
                          <img 
                            src={getImageUrl(property.agent.fotoPerfilUrl || property.agent.avatar || property.agent.photo)} 
                            alt={property.agent?.name || property.agentName || 'Agente'} 
                            className="w-full h-full rounded-full object-cover border-4 border-gray-100 shadow-xl group-hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (property.agent?.name || property.agentName) ? (
                          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center border-4 border-gray-100 shadow-xl group-hover:scale-105 transition-transform duration-300">
                            <span className="text-white text-4xl font-bold">
                              {(property.agent?.name || property.agentName).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        ) : property.agencyName ? (
                          <div className="w-full h-full bg-gradient-to-br from-slate-600 to-blue-700 rounded-full flex items-center justify-center border-4 border-gray-100 shadow-xl group-hover:scale-105 transition-transform duration-300">
                            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center border-4 border-gray-100 shadow-xl group-hover:scale-105 transition-transform duration-300">
                            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        {(property.agent?.name || property.agentName) && (
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Nombre y badge */}
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {property.agent?.name || property.agentName || property.agencyName || 'Propietario'}
                        </h3>
                        
                        {/* Badge de tipo */}
                        {(property.agent?.name || property.agentName) ? (
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 shadow-sm">
                              <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Agente Verificado
                            </span>
                          </div>
                        ) : property.agencyName ? (
                          <p className="text-blue-600 font-semibold text-base">
                            Agencia Inmobiliaria
                          </p>
                        ) : null}
                        
                        {/* Agencia del agente */}
                        {(property.agent?.name || property.agentName) && property.agencyName && (
                          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="font-medium">{property.agencyName}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Rating - Solo mostrar si hay datos */}
                      {property.agent?.rating && (
                        <div className="flex items-center justify-center gap-1 mb-6">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-5 h-5 ${
                                i < Math.floor(property.agent.rating || 0) 
                                  ? 'text-amber-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-sm font-bold text-gray-700 ml-2">
                            {property.agent.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {(property.agent?.phone || property.agent?.mobile) && (
                        <a 
                          href={`tel:${property.agent.phone || property.agent.mobile}`} 
                          onClick={(e) => e.stopPropagation()}
                          className="group flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100"
                        >
                          <PhoneIcon className="w-5 h-5" />
                          <span>Llamar Ahora</span>
                        </a>
                      )}
                      {(property.agent?.phone || property.agent?.mobile) && (
                        <a 
                          href={`https://wa.me/${(property.agent.phone || property.agent.mobile).replace(/[^\d]/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="group flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100"
                        >
                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {property.agent?.email && (
                        <a 
                          href={`mailto:${property.agent.email}`} 
                          onClick={(e) => e.stopPropagation()}
                          className="group flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-slate-700 to-gray-700 hover:from-slate-800 hover:to-gray-800 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100"
                        >
                          <EnvelopeIcon className="w-5 h-5" />
                          <span>Enviar Email</span>
                        </a>
                      )}
                      
                      {/* Información adicional del agente/agencia */}
                      {(property.agent?.bio || property.agent?.description || property.agencyName) && (
                        <div className="pt-4 mt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {property.agent?.bio || property.agent?.description || `Contacta con ${property.agencyName} para más información sobre esta propiedad.`}
                          </p>
                        </div>
                      )}
                      
                      {/* Stats del agente - Solo mostrar si hay datos */}
                      {(property.views || property.agent?.propertiesCount || property.agent?.rating) && (
                        <div className="pt-4 grid grid-cols-3 gap-3 border-t border-gray-200">
                          {property.views !== undefined && property.views !== null && (
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{property.views}</div>
                              <div className="text-xs text-gray-500">Vistas</div>
                            </div>
                          )}
                          {property.agent?.propertiesCount !== undefined && property.agent?.propertiesCount !== null && (
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{property.agent.propertiesCount}</div>
                              <div className="text-xs text-gray-500">Propiedades</div>
                            </div>
                          )}
                          {property.agent?.rating !== undefined && property.agent?.rating !== null && (
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{property.agent.rating.toFixed(1)}★</div>
                              <div className="text-xs text-gray-500">Rating</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
              ) : (
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30 sticky top-24">
                  <div className="text-center mb-6">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      {property.agent?.fotoPerfilUrl || property.agent?.avatar || property.agent?.photo ? (
                        <img 
                          src={getImageUrl(property.agent.fotoPerfilUrl || property.agent.avatar || property.agent.photo)} 
                          alt={property.agent?.name || property.agentName || 'Agente'} 
                          className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg" 
                        />
                      ) : (property.agent?.name || property.agentName) ? (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                          <span className="text-white text-3xl font-bold">
                            {(property.agent?.name || property.agentName).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      ) : property.agencyName ? (
                        <div className="w-full h-full bg-gradient-to-br from-slate-600 to-blue-700 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      {(property.agent?.name || property.agentName) && (
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white shadow-lg">
                          <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Nombre y badge */}
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {property.agent?.name || property.agentName || property.agencyName || 'Propietario'}
                      </h3>
                      
                      {/* Badge de tipo */}
                      {(property.agent?.name || property.agentName) ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Agente Verificado
                          </span>
                        </div>
                      ) : property.agencyName ? (
                        <p className="text-blue-600 font-semibold text-sm">
                          Agencia Inmobiliaria
                        </p>
                      ) : null}
                      
                      {/* Agencia del agente */}
                      {(property.agent?.name || property.agentName) && property.agencyName && (
                        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-600">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="font-medium">{property.agencyName}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Rating - Solo mostrar si hay datos */}
                    {property.agent?.rating && (
                      <div className="flex items-center justify-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-5 h-5 ${
                              i < Math.floor(property.agent.rating || 0) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-sm font-semibold text-gray-700 ml-2">
                          {property.agent.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {(property.agent?.phone || property.agent?.mobile) && (
                      <a 
                        href={`tel:${property.agent.phone || property.agent.mobile}`} 
                        className="group flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                      >
                        <PhoneIcon className="w-5 h-5 group-hover:animate-pulse" />
                        <span>Llamar Ahora</span>
                      </a>
                    )}
                    {(property.agent?.phone || property.agent?.mobile) && (
                      <a 
                        href={`https://wa.me/${(property.agent.phone || property.agent.mobile).replace(/[^\d]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5 group-hover:animate-pulse" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {property.agent?.email && (
                      <a 
                        href={`mailto:${property.agent.email}`} 
                        className="group flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                      >
                        <EnvelopeIcon className="w-5 h-5 group-hover:animate-pulse" />
                        <span>Enviar Correo</span>
                      </a>
                    )}
                    
                    {/* Información adicional del agente/agencia */}
                    {(property.agent?.bio || property.agent?.description || property.agencyName) && (
                      <div className="pt-4 mt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {property.agent?.bio || property.agent?.description || `Contacta con ${property.agencyName} para más información sobre esta propiedad.`}
                        </p>
                      </div>
                    )}
                    
                    {/* Stats del agente - Solo mostrar si hay datos */}
                    {(property.views || property.agent?.propertiesCount || property.agent?.rating) && (
                      <div className="pt-4 grid grid-cols-3 gap-3 border-t border-gray-200">
                        {property.views !== undefined && property.views !== null && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{property.views}</div>
                            <div className="text-xs text-gray-500">Vistas</div>
                          </div>
                        )}
                        {property.agent?.propertiesCount !== undefined && property.agent?.propertiesCount !== null && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{property.agent.propertiesCount}</div>
                            <div className="text-xs text-gray-500">Propiedades</div>
                          </div>
                        )}
                        {property.agent?.rating !== undefined && property.agent?.rating !== null && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{property.agent.rating.toFixed(1)}★</div>
                            <div className="text-xs text-gray-500">Rating</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Galería de imágenes - Diseño Premium */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 md:space-y-12">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">Galería de Imágenes</h2>
              <p className="text-gray-600 text-lg">Explora cada detalle de esta propiedad</p>
            </div>
            
            {/* Grid de imágenes premium */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {images.map((img: string, idx: number) => (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Opening lightbox for image', idx);
                    setLightboxIndex(idx);
                    setLightboxOpen(true);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Touch - Opening lightbox for image', idx);
                    setLightboxIndex(idx);
                    setLightboxOpen(true);
                  }}
                  className="relative group cursor-pointer aspect-square overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 active:scale-95 md:hover:scale-[1.02] bg-gray-100 touch-manipulation border border-gray-200/50"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setLightboxIndex(idx);
                      setLightboxOpen(true);
                    }
                  }}
                  aria-label={`Ver imagen ${idx + 1} en pantalla completa`}
                >
                  <img
                    src={img}
                    alt={`${property.title} - Imagen ${idx + 1}`}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    loading={idx < 4 ? "eager" : "lazy"}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  
                  {/* Overlay hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
                  
                  {/* Indicador */}
                  {images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium pointer-events-none z-10">
                      {idx + 1}/{images.length}
                    </div>
                  )}
                  
                  {/* Icono de expandir en hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Información adicional */}
            <div className="text-center text-gray-600">
              <p className="text-sm">
                Haz clic en cualquier imagen para verla en tamaño completo
              </p>
              <p className="text-xs mt-1 text-gray-500">
                {images.length} {images.length === 1 ? 'imagen' : 'imágenes'} disponible{images.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Información detallada - Diseño Premium */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Descripción Premium */}
          <div className="bg-white rounded-3xl p-10 md:p-12 shadow-xl border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Descripción</h2>
            </div>
            <div className="text-gray-700 leading-relaxed text-base md:text-lg">
              {property.description ? (
                <div 
                  className="max-w-none break-words prose prose-lg max-w-none"
                  style={{ whiteSpace: 'pre-line' }}
                  dangerouslySetInnerHTML={{ 
                    __html: stripHtml(property.description).replace(/\n/g, '<br/>') 
                  }}
                />
              ) : (
                <p className="text-gray-500 italic text-lg">Descripción no disponible.</p>
              )}
            </div>
          </div>

          {/* Características Principales - Premium */}
          <div className="bg-white rounded-3xl p-10 md:p-12 shadow-xl border border-gray-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                <CheckCircleIcon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Características Principales</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between py-4 px-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow">
                <span className="flex items-center gap-4 text-gray-700">
                  <div className="p-2.5 bg-blue-100 rounded-lg">
                    <HomeModernIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="font-semibold text-lg">Habitaciones</span>
                </span>
                <span className="font-bold text-2xl text-gray-900">{property.bedrooms}</span>
              </div>
              <div className="flex items-center justify-between py-4 px-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow">
                <span className="flex items-center gap-4 text-gray-700">
                  <div className="p-2.5 bg-indigo-100 rounded-lg">
                    <UserIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="font-semibold text-lg">Baños</span>
                </span>
                <span className="font-bold text-2xl text-gray-900">{property.bathrooms}</span>
              </div>
              <div className="flex items-center justify-between py-4 px-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow">
                <span className="flex items-center gap-4 text-gray-700">
                  <div className="p-2.5 bg-emerald-100 rounded-lg">
                    <CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-lg">Área Total</span>
                </span>
                <span className="font-bold text-2xl text-gray-900">{property.area} m²</span>
              </div>
              {property.landArea && (
                <div className="flex items-center justify-between py-4 px-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow">
                  <span className="flex items-center gap-4 text-gray-700">
                    <div className="p-2.5 bg-amber-100 rounded-lg">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <span className="font-semibold text-lg">Área del Terreno</span>
                  </span>
                  <span className="font-bold text-2xl text-gray-900">{property.landArea} m²</span>
                </div>
              )}
              {property.parking && (
                <div className="flex items-center justify-between py-4 px-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow">
                  <span className="flex items-center gap-4 text-gray-700">
                    <div className="p-2.5 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="7" rx="2" />
                        <path d="M7 18v2m10-2v2" />
                      </svg>
                    </div>
                    <span className="font-semibold text-lg">Estacionamientos</span>
                  </span>
                  <span className="font-bold text-2xl text-gray-900">{property.parking}</span>
                </div>
              )}
              {property.floors && (
                <div className="flex items-center justify-between py-4 px-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow">
                  <span className="flex items-center gap-4 text-gray-700">
                    <div className="p-2.5 bg-rose-100 rounded-lg">
                      <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="font-semibold text-lg">Pisos</span>
                  </span>
                  <span className="font-bold text-2xl text-gray-900">{property.floors}</span>
                </div>
              )}
              {property.yearBuilt && (
                <div className="flex items-center justify-between py-4 px-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow">
                  <span className="flex items-center gap-4 text-gray-700">
                    <div className="p-2.5 bg-cyan-100 rounded-lg">
                      <ClockIcon className="w-6 h-6 text-cyan-600" />
                    </div>
                    <span className="font-semibold text-lg">Año de Construcción</span>
                  </span>
                  <span className="font-bold text-2xl text-gray-900">{property.yearBuilt}</span>
                </div>
              )}
              {property.propertyType && (
                <div className="flex items-center justify-between py-4 px-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow">
                  <span className="flex items-center gap-4 text-gray-700">
                    <div className="p-2.5 bg-teal-100 rounded-lg">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="font-semibold text-lg">Tipo de Propiedad</span>
                  </span>
                  <span className="font-bold text-2xl text-gray-900">{property.propertyType}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amenidades - Expandible */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <button 
              onClick={() => toggleSection('amenities')}
              className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <WifiIcon className="w-6 h-6 text-blue-500" />
                Amenidades y Servicios
              </h2>
              {expandedSections.amenities ? (
                <ChevronUpIcon className="w-6 h-6 text-gray-500" />
              ) : (
                <ChevronDownIcon className="w-6 h-6 text-gray-500" />
              )}
            </button>
            {expandedSections.amenities && (
              <div className="px-8 pb-8 border-t border-gray-100">
                <div className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(property.amenitiesDetails || property.amenities)?.map((amenity: any, index: number) => {
                      let amenityName = 'Amenidad';
                      
                      if (typeof amenity === 'string') {
                        amenityName = amenity;
                      } else if (typeof amenity === 'number') {
                        // Si es un ID, intentar buscar en amenitiesDetails
                        const amenityDetail = property.amenitiesDetails?.find((detail: any) => detail.id === amenity);
                        amenityName = amenityDetail?.name || amenityDetail?.title || `Amenidad ${amenity}`;
                      } else if (amenity && typeof amenity === 'object') {
                        amenityName = amenity.name || 
                                     amenity.title || 
                                     amenity.label || 
                                     amenity.description ||
                                     amenity.amenityName ||
                                     amenity.amenity_name ||
                                     amenity.value ||
                                     JSON.stringify(amenity);
                      }
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <span className="text-gray-700">{amenityName}</span>
                        </div>
                      );
                    }) || (
                      <div className="col-span-3 text-gray-500 italic text-center py-8">
                        No hay amenidades específicas listadas para esta propiedad.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Información Financiera - Expandible */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <button 
              onClick={() => toggleSection('financial')}
              className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BanknotesIcon className="w-6 h-6 text-green-500" />
                Información Financiera
              </h2>
              {expandedSections.financial ? (
                <ChevronUpIcon className="w-6 h-6 text-gray-500" />
              ) : (
                <ChevronDownIcon className="w-6 h-6 text-gray-500" />
              )}
            </button>
            {expandedSections.financial && (
              <div className="px-8 pb-8 border-t border-gray-100">
                <div className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-700 font-medium">Precio</span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatPrice(property.price || 0, property.currencyCode || 'PYG')}
                      </span>
                    </div>
                    {property.operacion && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-700 font-medium">Operación</span>
                        <span className="font-semibold text-gray-900">
                          {property.operacion === 'SALE' ? 'Venta' : 'Alquiler'}
                        </span>
                      </div>
                    )}
                    {property.featured && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-700 font-medium">Propiedad</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⭐ Destacada
                        </span>
                      </div>
                    )}
                    {property.createdAt && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-700 font-medium">Publicado</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(property.createdAt).toLocaleDateString('es-PY')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ubicación Detallada - Expandible */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <button 
              onClick={() => toggleSection('location')}
              className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <MapPinIcon className="w-6 h-6 text-red-500" />
                Ubicación Detallada
              </h2>
              {expandedSections.location ? (
                <ChevronUpIcon className="w-6 h-6 text-gray-500" />
              ) : (
                <ChevronDownIcon className="w-6 h-6 text-gray-500" />
              )}
            </button>
            {expandedSections.location && (
              <div className="px-8 pb-8 border-t border-gray-100">
                <div className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.address && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-700 font-medium">Dirección</span>
                        <span className="font-semibold text-gray-900 text-right max-w-xs">
                          {property.address}
                        </span>
                      </div>
                    )}
                    {property.cityName && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-700 font-medium">Ciudad</span>
                        <span className="font-semibold text-gray-900">{property.cityName}</span>
                      </div>
                    )}
                    {property.stateName && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-700 font-medium">Estado/Departamento</span>
                        <span className="font-semibold text-gray-900">{property.stateName}</span>
                      </div>
                    )}
                    {property.countryName && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-700 font-medium">País</span>
                        <span className="font-semibold text-gray-900">{property.countryName}</span>
                      </div>
                    )}
                    {property.zipCode && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-700 font-medium">Código Postal</span>
                        <span className="font-semibold text-gray-900">{property.zipCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Información Adicional - Expandible */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <button 
              onClick={() => toggleSection('additional')}
              className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <InformationCircleIcon className="w-6 h-6 text-purple-500" />
                Información Adicional
              </h2>
              {expandedSections.additional ? (
                <ChevronUpIcon className="w-6 h-6 text-gray-500" />
              ) : (
                <ChevronDownIcon className="w-6 h-6 text-gray-500" />
              )}
            </button>
            {expandedSections.additional && (
              <div className="px-8 pb-8 border-t border-gray-100">
                <div className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.propertyStatus && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-700 font-medium">Estado de la Propiedad</span>
                        <span className="font-semibold text-gray-900">{property.propertyStatus}</span>
                      </div>
                    )}
                    {(property.houzezId || property.agencyPropertyNumber || property.id) && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-700 font-medium">Código de Referencia</span>
                        <span className="font-mono text-sm text-gray-600 font-semibold">
                          {property.houzezId || property.agencyPropertyNumber || `#${property.id}`}
                        </span>
                      </div>
                    )}
                    {property.views && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-700 font-medium">Visualizaciones</span>
                        <span className="font-semibold text-gray-900">{property.views}</span>
                      </div>
                    )}
                    {property.agencyName && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-700 font-medium">Agencia</span>
                        <span className="font-semibold text-gray-900">{property.agencyName}</span>
                      </div>
                    )}
                    {property.slug && (
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-700 font-medium">URL Slug</span>
                        <span className="font-mono text-xs text-gray-500 break-all max-w-xs text-right">
                          {property.slug}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Lightbox optimizado para mobile */}
      {typeof mounted !== 'undefined' && mounted && lightboxOpen && createPortal(
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex flex-col overscroll-none"
          onClick={(e) => {
            // Solo cerrar si se hace clic directamente en el fondo (no en elementos hijos)
            if (e.target === e.currentTarget) {
              console.log('Closing lightbox');
              setLightboxOpen(false);
            }
          }}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            maxHeight: '100vh',
            overflow: 'hidden',
            zIndex: 9999999,
          }}
        >
          {/* Header con botón cerrar y contador - Mejorado para mobile */}
          <div 
            className="flex items-center justify-between p-3 sm:p-4 bg-black/50 backdrop-blur-md border-b border-white/10 flex-shrink-0 relative z-50"
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 50 }}
          >
            <div className="text-white text-sm sm:text-base font-medium">
              {lightboxIndex + 1} / {images.length}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setLightboxOpen(false);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
              }}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white active:bg-white/80 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg active:scale-95 relative z-50"
              style={{ zIndex: 50 }}
              aria-label="Cerrar galería"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black pointer-events-none" />
            </button>
          </div>

          {/* Contenedor de imagen con navegación - Optimizado para mobile */}
          <div 
            className="flex-1 flex items-center justify-center relative px-2 sm:px-4 py-2 sm:py-4 min-h-0 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              touchAction: 'pan-y pinch-zoom',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* Botones de navegación - Mejorados para mobile */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { 
                    e.stopPropagation();
                    e.preventDefault();
                    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length); 
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/95 hover:bg-white active:bg-white/90 rounded-full flex items-center justify-center transition-all duration-200 z-50 shadow-xl active:scale-95 touch-manipulation"
                  style={{ zIndex: 50 }}
                  aria-label="Imagen anterior"
                >
                  <ArrowLeftIcon className="w-6 h-6 sm:w-7 sm:h-7 text-black pointer-events-none" />
                </button>
                <button
                  onClick={(e) => { 
                    e.stopPropagation();
                    e.preventDefault();
                    setLightboxIndex((prev) => (prev + 1) % images.length); 
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/95 hover:bg-white active:bg-white/90 rounded-full flex items-center justify-center transition-all duration-200 z-50 shadow-xl active:scale-95 touch-manipulation"
                  style={{ zIndex: 50 }}
                  aria-label="Imagen siguiente"
                >
                  <ArrowRightIcon className="w-6 h-6 sm:w-7 sm:h-7 text-black pointer-events-none" />
                </button>
              </>
            )}
            
            {/* Imagen - Optimizada para mobile */}
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                minHeight: 0,
                maxHeight: '100%',
              }}
            >
              <img
                src={images[lightboxIndex]}
                alt={`${property.title} - Imagen ${lightboxIndex + 1} de ${images.length}`}
                className="max-w-full max-h-full w-auto h-auto object-contain select-none pointer-events-none"
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 140px)',
                  width: 'auto',
                  height: 'auto',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'none',
                  pointerEvents: 'none',
                }}
                loading="eager"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>

          {/* Indicadores de puntos en mobile - Mejorados */}
          {images.length > 1 && images.length <= 10 && (
            <div 
              className="flex items-center justify-center gap-2 pb-4 sm:hidden flex-shrink-0 bg-black/50 backdrop-blur-md border-t border-white/10 pt-3 relative z-50"
              onClick={(e) => e.stopPropagation()}
              style={{ zIndex: 50 }}
            >
              {images.map((_img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={(e) => { 
                    e.stopPropagation();
                    e.preventDefault();
                    setLightboxIndex(idx); 
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                  }}
                  className={`h-2 rounded-full transition-all duration-300 touch-manipulation relative z-50 ${
                    idx === lightboxIndex 
                      ? 'bg-white w-8' 
                      : 'bg-white/50 w-2 hover:bg-white/75'
                  }`}
                  style={{ zIndex: 50 }}
                  aria-label={`Ir a imagen ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Soporte para gestos táctiles en mobile - Mejorado */}
          {images.length > 1 && (
            <SwipeHandler
              onSwipeLeft={() => setLightboxIndex((prev) => (prev + 1) % images.length)}
              onSwipeRight={() => setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)}
            />
          )}
        </div>
      , document.body)}

      {/* Botón Volver flotante - Premium */}
      <button
        onClick={() => router.back()}
        className="fixed top-6 left-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/95 backdrop-blur-md hover:bg-white text-gray-900 font-bold text-sm shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-100 transition-all duration-300 border border-gray-200/50"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span className="hidden sm:inline">Volver</span>
      </button>

    </main>
  );
}
