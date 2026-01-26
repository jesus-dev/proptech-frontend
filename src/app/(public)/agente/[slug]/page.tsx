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
  BuildingOfficeIcon,
  StarIcon,
  ArrowLeftIcon,
  HomeModernIcon,
  UserIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { getImageBaseUrl } from "@/config/environment";
import { extractIdFromSlug, getUserProfileImage } from "@/lib/utils";

// Función helper para construir URLs completas de imágenes
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '/images/placeholder.jpg';
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }
  
  const baseUrl = getImageBaseUrl();
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
};

const formatPrice = (price: number, currency: string) => {
  const formattedPrice = new Intl.NumberFormat('es-PY').format(price);
  return `${formattedPrice} ${currency}`;
};

export default function AgentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const agentSlugOrId = params?.slug as string;
  const [agent, setAgent] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProperties, setTotalProperties] = useState(0);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        
        // Extraer ID del slug (compatibilidad con backend que usa ID)
        // Si es solo un número, usar directamente; si es slug, extraer el ID
        let agentId = agentSlugOrId;
        if (!/^\d+$/.test(agentSlugOrId)) {
          const extractedId = extractIdFromSlug(agentSlugOrId);
          if (extractedId) {
            agentId = extractedId.toString();
          }
        }
        
        // Obtener datos del agente
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/public/agents/${agentId}`;
        const agentResponse = await fetch(apiUrl);
        if (!agentResponse.ok) {
          const errorText = await agentResponse.text();
          throw new Error('Agente no encontrado');
        }
        const agentData = await agentResponse.json();
        
        // Normalizar datos del agente
        // Usar función centralizada para obtener la imagen (prioriza user.photoUrl si existe)
        const profileImage = getUserProfileImage(
          agentData.user ? { photoUrl: agentData.user.photoUrl, agent: { fotoPerfilUrl: agentData.fotoPerfilUrl } } : null,
          { fotoPerfilUrl: agentData.fotoPerfilUrl, photo: agentData.photo, avatar: agentData.avatar }
        );
        
        const normalizedAgent = {
          ...agentData,
          nombre: agentData.nombre || agentData.firstName || '',
          apellido: agentData.apellido || agentData.lastName || '',
          nombreCompleto: agentData.nombreCompleto || `${agentData.nombre || agentData.firstName || ''} ${agentData.apellido || agentData.lastName || ''}`.trim() || agentData.email || 'Agente',
          telefono: agentData.telefono || agentData.phone,
          email: agentData.email || '',
          fotoPerfilUrl: profileImage, // Usar imagen centralizada
          position: agentData.position,
          bio: agentData.bio,
          agencyName: agentData.agencyName,
          propertiesCount: agentData.propertiesCount,
          rating: agentData.rating,
          slug: agentData.slug
        };

        // Si el agente no tiene propiedades públicas, no mostrar su perfil en el sitio
        if ((normalizedAgent.propertiesCount ?? 0) <= 0) {
          router.replace('/asesores');
          return;
        }
        
        console.log('✅ Normalized agent:', normalizedAgent);
        setAgent(normalizedAgent);
        
        // Obtener propiedades del agente usando ID (el backend usa ID)
        const agentIdForProperties = normalizedAgent.id || agentData.id || agentId;
        console.log('🔍 Fetching properties for agent:', {
          slug: agentSlugOrId,
          id: agentIdForProperties,
          extractedId: agentId
        });
        
        if (agentIdForProperties) {
          const propertiesUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/public/properties/agent/${agentIdForProperties}?page=1&limit=12`;
          const propertiesResponse = await fetch(propertiesUrl);
          if (propertiesResponse.ok) {
            const propertiesData = await propertiesResponse.json();
            setProperties(propertiesData.properties || []);
            setTotalProperties(propertiesData.pagination?.totalProperties || 0);
            setHasMore((propertiesData.properties?.length || 0) < (propertiesData.pagination?.totalProperties || 0));
            setCurrentPage(1);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar el perfil del agente');
      } finally {
        setLoading(false);
      }
    };

    if (agentSlugOrId) {
      fetchAgentData();
    }
  }, [agentSlugOrId]);

  // Función para cargar más propiedades (llamada desde el botón)
  const loadMoreProperties = async () => {
    if (loadingMore || !hasMore || !agent) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      // Usar ID del agente (el backend usa ID)
      const agentId = agent.id || extractIdFromSlug(agentSlugOrId) || agentSlugOrId;
      console.log('🔄 Loading more properties - Page:', nextPage, 'Agent ID:', agentId);
      const propertiesUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/public/properties/agent/${agentId}?page=${nextPage}&limit=12`;
      
      const propertiesResponse = await fetch(propertiesUrl);
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        const newProperties = propertiesData.properties || [];
        setProperties(prev => [...prev, ...newProperties]);
        setCurrentPage(nextPage);
        setHasMore(newProperties.length === 12 && (properties.length + newProperties.length) < (propertiesData.pagination?.totalProperties || 0));
      }
    } catch (err) {
      console.error('Error loading more properties:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Cargando perfil del agente...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Agente no encontrado</h1>
          <p className="text-gray-600 mb-8">{error || 'El agente que buscas no existe o no está disponible.'}</p>
          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - Diseño Completamente Nuevo */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 h-[100vh] w-[100vw] overflow-hidden flex items-center justify-center pt-12 sm:pt-16" style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
        {/* Fondo con gradiente dinámico */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          {/* Patrón de grid sutil */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
          {/* Círculos de luz animados */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-3xl"
          />
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Columna izquierda - Foto y badge */}
            <div className="flex justify-center lg:justify-end">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative group"
              >
                {/* Anillo de luz exterior */}
                <div className="absolute -inset-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-30 group-hover:opacity-50 blur-2xl transition-opacity duration-700"></div>
                
                <div className="relative">
                  {agent.fotoPerfilUrl ? (
                    <img 
                      src={getImageUrl(agent.fotoPerfilUrl)} 
                      alt={agent.nombreCompleto}
                      className="relative w-64 h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-full object-cover object-center shadow-2xl border-8 border-white/20 transform group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="relative w-64 h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl border-8 border-white/20 transform group-hover:scale-105 transition-transform duration-700">
                      <span className="text-white text-9xl lg:text-[12rem] font-black">
                        {(agent.nombre || 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Badge verificado flotante */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-6 -right-6 lg:-bottom-8 lg:-right-8 w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center"
                  >
                    <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Columna derecha - Información */}
            <div className="text-center lg:text-left space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Nombre */}
                <div>
                  <h1 className="text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black text-white mb-4 leading-tight">
                    {agent.nombreCompleto}
                  </h1>
                  <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Agente Verificado
                  </div>
                </div>

                {/* Position y Agency */}
                {agent.position && (
                  <p className="text-2xl lg:text-3xl xl:text-4xl text-white/90 font-light">
                    {agent.position}
                  </p>
                )}

                {agent.agencyName && (
                  <div className="flex items-center justify-center lg:justify-start gap-3 text-white/80">
                    <BuildingOfficeIcon className="w-6 h-6" />
                    <span className="font-semibold text-xl">{agent.agencyName}</span>
                  </div>
                )}

                {/* Stats en línea */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-4">
                  {agent.propertiesCount !== undefined && agent.propertiesCount !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-center"
                    >
                      <div className="text-5xl lg:text-6xl font-black text-white mb-1">{agent.propertiesCount}</div>
                      <div className="text-sm text-white/70 font-medium uppercase tracking-wider">Propiedades</div>
                    </motion.div>
                  )}
                  {agent.rating && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-center"
                    >
                      <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                        <StarSolidIcon className="w-8 h-8 text-yellow-400" />
                        <span className="text-5xl lg:text-6xl font-black text-white">{agent.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-white/70 font-medium uppercase tracking-wider">Rating</div>
                    </motion.div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-6">
                  {agent.telefono && (
                    <motion.a
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      href={`tel:${agent.telefono}`}
                      className="group relative px-8 py-4 bg-white text-gray-900 rounded-xl font-bold shadow-2xl hover:shadow-white/50 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-center gap-3">
                        <PhoneIcon className="w-6 h-6" />
                        <span>Llamar</span>
                      </div>
                    </motion.a>
                  )}
                  {agent.telefono && (
                    <motion.a
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 }}
                      href={`https://wa.me/${agent.telefono.replace(/[^\d]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold shadow-xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <ChatBubbleLeftRightIcon className="w-6 h-6" />
                        <span>WhatsApp</span>
                      </div>
                    </motion.a>
                  )}
                  {agent.email && (
                    <motion.a
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 }}
                      href={`mailto:${agent.email}`}
                      className="group relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold shadow-xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="w-6 h-6" />
                        <span>Email</span>
                      </div>
                    </motion.a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Indicador de scroll */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="flex flex-col items-center gap-2 text-white/60">
            <span className="text-xs font-medium uppercase tracking-wider">Scroll</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* Bio del agente */}
      {agent.bio && (
        <section className="py-12 bg-white border-b border-gray-100 relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre el Agente</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{agent.bio}</p>
          </div>
        </section>
      )}

      {/* Propiedades del agente */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Propiedades
            </h2>
            <p className="text-gray-600">
              Mostrando {properties.length} de {totalProperties} {totalProperties === 1 ? 'propiedad disponible' : 'propiedades disponibles'}
            </p>
          </div>
          
          {properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property, index) => (
                  <Link 
                    href={`/propiedad/${property.slug || property.id}`}
                    key={property.id || index}
                    className="block group"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200"
                    >
                      {/* Imagen */}
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        {property.featuredImage ? (
                          <img 
                            src={getImageUrl(property.featuredImage)} 
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500">
                            <HomeModernIcon className="w-16 h-16 text-white/50" />
                          </div>
                        )}
                        {property.featured && (
                          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <StarSolidIcon className="w-4 h-4" />
                            Destacada
                          </div>
                        )}
                        {property.operacion && (
                          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                            property.operacion === 'SALE' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-blue-500 text-white'
                          }`}>
                            {property.operacion === 'SALE' ? 'Venta' : 'Alquiler'}
                          </div>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {property.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-gray-600 mb-3 text-sm">
                          <MapPinIcon className="w-4 h-4 text-gray-400" />
                          <span>{property.cityName || property.address || 'Ubicación no disponible'}</span>
                        </div>

                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 text-sm">
                          {property.bedrooms && (
                            <div className="flex items-center gap-1 text-gray-700">
                              <span className="font-semibold">{property.bedrooms}</span>
                              <span className="text-gray-500">hab.</span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center gap-1 text-gray-700">
                              <span className="font-semibold">{property.bathrooms}</span>
                              <span className="text-gray-500">baños</span>
                            </div>
                          )}
                          {property.area && (
                            <div className="flex items-center gap-1 text-gray-700">
                              <span className="font-semibold">{property.area}</span>
                              <span className="text-gray-500">m²</span>
                            </div>
                          )}
                        </div>

                        <div className="text-xl font-bold text-green-600">
                          {formatPrice(Number(property.price || 0), property.currencyCode || 'PYG')}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
              
              {/* Botón Cargar Más */}
              {hasMore && !loadingMore && (
                <div className="flex justify-center py-8">
                  <button
                    onClick={loadMoreProperties}
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl active:scale-95 transition-all duration-300 flex items-center gap-3"
                  >
                    <span>Cargar más propiedades</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Indicador de carga */}
              {loadingMore && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Cargando más propiedades...</span>
                </div>
              )}
              
              {/* Mensaje cuando no hay más propiedades */}
              {!hasMore && properties.length > 0 && (
                <div className="text-center py-8 text-gray-600">
                  <p>No hay más propiedades para mostrar</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-200">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HomeModernIcon className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sin propiedades aún</h3>
              <p className="text-gray-600">Este agente aún no tiene propiedades publicadas.</p>
            </div>
          )}
        </div>
      </section>

      {/* Botón Volver */}
      <button
        onClick={() => router.back()}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-900 font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span className="hidden sm:inline">Volver</span>
      </button>
    </main>
  );
}

