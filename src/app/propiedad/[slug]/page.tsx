"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { publicPropertyService } from "@/services/publicPropertyService";
import { getImageBaseUrl } from "@/config/environment";
import { PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, HomeModernIcon, UserIcon, MapPinIcon, CurrencyDollarIcon, StarIcon, CheckCircleIcon, VideoCameraIcon, MapIcon, ArrowLeftIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon, WifiIcon, ShieldCheckIcon, ClockIcon, BanknotesIcon, DocumentTextIcon, InformationCircleIcon, XMarkIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

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
  
  // Estados para secciones expandibles
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    amenities: false,
    financial: false,
    location: false,
    additional: false
  });

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
        'z-index: 2147483647',
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
    // Evitar llamadas duplicadas
    let isCancelled = false;
    
    const fetchProperty = async () => {
      if (!slug || isCancelled) return;
      
      try {
        setLoading(true);
        setError('');
        
        let propertyData = null;
        
        // Detectar si el slug es un número
        const isNumeric = /^\d+$/.test(slug);
        
        // OPTIMIZACIÓN: Cargar en dos fases
        // Fase 1: Cargar summary RÁPIDO y mostrar inmediatamente
        const summary = await publicPropertyService.getPropertySummaryBySlug(slug);
        
        if (isCancelled) return;
        
        if (!summary) {
          setError(`Propiedad no encontrada: ${slug}`);
          return;
        }
        
        // Mostrar summary inmediatamente (carga rápida ~35ms)
        setProperty(summary);
        setLoading(false); // ⚡ MOSTRAR CONTENIDO INMEDIATAMENTE
        
        // Fase 2: Cargar detalles en background (gallery y amenities)
        Promise.allSettled([
          publicPropertyService.getPropertyGallery(slug),
          publicPropertyService.getPropertyAmenities(slug)
        ]).then(([gallery, amenities]) => {
          if (isCancelled) return;
          
          // Actualizar con detalles adicionales
          setProperty((prev: any) => ({
            ...prev,
            galleryImages: gallery.status === 'fulfilled' ? gallery.value.galleryImages : [],
            amenityIds: amenities.status === 'fulfilled' ? amenities.value.amenityIds : [],
            amenitiesDetails: amenities.status === 'fulfilled' ? amenities.value.amenities : []
          }));
        });
      } catch (err: any) {
        if (isCancelled) return;
        
        // Mensajes de error más específicos
        if (err.message?.includes('404')) {
          setError(`La propiedad con identificador '${slug}' no existe o ya no está disponible.`);
        } else if (err.message?.includes('500')) {
          setError('Error del servidor. Por favor, intenta nuevamente en unos momentos.');
        } else if (err.message?.includes('Failed to fetch') || err.message?.includes('Network')) {
          setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
          setError(err.message || 'No se pudo cargar la propiedad. Verifica tu conexión al backend.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchProperty();
    
    // Cleanup function para evitar memory leaks
    return () => {
      isCancelled = true;
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
    const firstName = property.agent.firstName || '';
    const lastName = property.agent.lastName || '';
    property.agent.name = `${firstName} ${lastName}`.trim();
    property.agent.avatar = property.agent.photo;
    if (!property.agent.name) {
      property.agent.name = property.agent.email || 'Agente';
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header con información principal */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Imagen de fondo de la propiedad */}
        <div className="absolute inset-0 z-0">
          <img 
            src={images[0]} 
            alt={property.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
          />
          {/* Overlay para mejor legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-blue-900/75 to-cyan-900/70"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
          
          {/* Indicador visual de que es clickeable */}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium opacity-80 hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Haz clic para ver en grande
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Badge y título */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg">
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    {property.operacion === 'SALE' ? 'EN VENTA' : 'EN ALQUILER'}
                  </span>
                  {property.featured && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⭐ Destacada
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-xl">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-white/90">
                  <MapPinIcon className="w-5 h-5 drop-shadow-lg" />
                  <span className="text-lg font-medium drop-shadow-lg">{property.cityName || property.address || 'Ubicación no disponible'}</span>
                </div>
              </div>

              {/* Características principales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <HomeModernIcon className="w-5 h-5 text-cyan-200" />
                    <span className="text-white font-semibold text-sm">Habitaciones</span>
                  </div>
                  <div className="text-2xl font-bold text-white drop-shadow-lg">{property.bedrooms}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-5 h-5 text-cyan-200" />
                    <span className="text-white font-semibold text-sm">Baños</span>
                  </div>
                  <div className="text-2xl font-bold text-white drop-shadow-lg">{property.bathrooms}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-cyan-200" />
                    <span className="text-white font-semibold text-sm">Área</span>
                  </div>
                  <div className="text-2xl font-bold text-white drop-shadow-lg">{property.area} m²</div>
                </div>
                {property.parking && (
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="7" rx="2" />
                        <path d="M7 18v2m10-2v2" />
                      </svg>
                      <span className="text-white font-semibold text-sm">Estacionamientos</span>
                    </div>
                    <div className="text-2xl font-bold text-white drop-shadow-lg">{property.parking}</div>
                  </div>
                )}
              </div>

              {/* Precio destacado */}
              <div className="bg-white/25 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-2xl">
                <div className="text-white/90 text-lg mb-2 font-medium">Precio</div>
                <div className="text-4xl sm:text-5xl font-bold text-white drop-shadow-xl">
                  {formatPrice(property.price || 0, property.currencyCode || 'PYG')}
                </div>
                {property.operacion === 'RENT' && (
                  <div className="text-white/80 text-sm mt-2 font-medium">por mes</div>
                )}
              </div>
            </div>

            {/* Card del agente */}
            <div className="lg:col-span-1">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30 sticky top-24">
                <div className="text-center mb-6">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    {property.agent?.avatar || property.agent?.photo ? (
                      <img 
                        src={getImageUrl(property.agent.avatar || property.agent.photo)} 
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
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm font-semibold text-gray-700 ml-2">4.9</span>
                  </div>
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
                  
                  {/* Stats del agente */}
                  <div className="pt-4 grid grid-cols-3 gap-3 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{property.views || 0}</div>
                      <div className="text-xs text-gray-500">Vistas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">15+</div>
                      <div className="text-xs text-gray-500">Ventas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">5★</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Galería de imágenes tipo Instagram */}
      <section className="py-6 md:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 md:space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">Galería de Imágenes</h2>
            
            {/* Grid de imágenes */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {images.map((img: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                  className="relative group cursor-pointer aspect-square overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 md:hover:scale-105 bg-gray-100"
                >
                  <img
                    src={img}
                    alt={`${property.title} - Imagen ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Indicador */}
                  {images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium pointer-events-none">
                      {idx + 1}/{images.length}
                    </div>
                  )}
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

      {/* Información detallada - Layout vertical */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Descripción */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-blue-500" />
              Descripción
            </h2>
            <div className="text-gray-700 leading-relaxed">
              {property.description ? (
                <div 
                  className="max-w-none break-words text-sm"
                  style={{ whiteSpace: 'pre-line' }}
                  dangerouslySetInnerHTML={{ 
                    __html: stripHtml(property.description).replace(/\n/g, '<br/>') 
                  }}
                />
              ) : (
                <p className="text-gray-500 italic">Descripción no disponible.</p>
              )}
            </div>
          </div>

          {/* Características Principales */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-blue-500" />
              Características Principales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="flex items-center gap-3 text-gray-700">
                  <HomeModernIcon className="w-5 h-5 text-blue-500" />
                  Habitaciones
                </span>
                <span className="font-semibold text-gray-900">{property.bedrooms}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="flex items-center gap-3 text-gray-700">
                  <UserIcon className="w-5 h-5 text-blue-500" />
                  Baños
                </span>
                <span className="font-semibold text-gray-900">{property.bathrooms}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="flex items-center gap-3 text-gray-700">
                  <CurrencyDollarIcon className="w-5 h-5 text-blue-500" />
                  Área Total
                </span>
                <span className="font-semibold text-gray-900">{property.area} m²</span>
              </div>
              {property.landArea && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Área del Terreno
                  </span>
                  <span className="font-semibold text-gray-900">{property.landArea} m²</span>
                </div>
              )}
              {property.parking && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                    </svg>
                    Estacionamientos
                  </span>
                  <span className="font-semibold text-gray-900">{property.parking}</span>
                </div>
              )}
              {property.floors && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Pisos
                  </span>
                  <span className="font-semibold text-gray-900">{property.floors}</span>
                </div>
              )}
              {property.yearBuilt && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="flex items-center gap-3 text-gray-700">
                    <ClockIcon className="w-5 h-5 text-blue-500" />
                    Año de Construcción
                  </span>
                  <span className="font-semibold text-gray-900">{property.yearBuilt}</span>
                </div>
              )}
              {property.propertyType && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Tipo de Propiedad
                  </span>
                  <span className="font-semibold text-gray-900">{property.propertyType}</span>
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

      {/* Lightbox nuestro - SIMPLE y FUNCIONAL */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-black z-[99999] flex flex-col"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Header con botón cerrar y contador */}
          <div className="flex items-center justify-between p-3 sm:p-4">
            <div className="text-white text-sm font-medium">
              {lightboxIndex + 1} / {images.length}
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </button>
          </div>

          {/* Contenedor de imagen con navegación */}
          <div className="flex-1 flex items-center justify-center relative px-3 sm:px-4 pb-3 sm:pb-4">
            {/* Botones de navegación */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + images.length) % images.length); }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors z-10"
                >
                  <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % images.length); }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors z-10"
                >
                  <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                </button>
              </>
            )}
            
            {/* Imagen */}
            <img
              src={images[lightboxIndex]}
              alt={`Imagen ${lightboxIndex + 1}`}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Indicadores de puntos en mobile */}
          {images.length > 1 && images.length <= 10 && (
            <div className="flex items-center justify-center gap-2 pb-4 sm:hidden">
              {images.map((_img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === lightboxIndex 
                      ? 'bg-white w-6' 
                      : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Botón Volver flotante */}
      <button
        onClick={() => router.back()}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-black/80 hover:bg-black text-white font-semibold text-sm shadow-xl hover:scale-105 transition-all duration-200 backdrop-blur-sm"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Volver</span>
      </button>

    </main>
  );
}
