"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Edit, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Ruler, 
  Calendar,
  Star,
  Eye,
  DollarSign,
  Building,
  Home,
  Phone,
  Mail,
  Globe,
  Share2,
  Heart,
  Download,
  CheckCircle,
  AlertCircle,
  Wifi,
  Shield,
  Dumbbell,
  Snowflake,
  Flame,
  FileText,
  Video,
  ExternalLink,
  Clock,
  Users,
  Award,
  Zap,
  Droplets,
  Wrench,
  Bell,
  BarChart3,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  X,
  MessageCircle
} from "lucide-react";
import { propertyService } from "../services/propertyService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Property } from "../components/types";
import { useAmenities } from "@/app/(proptech)/catalogs/amenities/hooks/useAmenities";
import ContactInfo from "@/components/common/ContactInfo";
import { publicPropertyService } from "@/services/publicPropertyService";
import { useAuth } from "@/hooks/useAuth";
import { CommentList } from "@/components/comments/CommentList";

interface PageProps {
  params: Promise<{ id: string }>
}

interface AmenityDetail {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  active: boolean;
}

interface ServiceDetail {
  id: number;
  name: string;
  description: string;
  type: string;
  includedInRent: boolean;
  includedInSale: boolean;
  active: boolean;
}

interface PrivateFile {
  id: number;
  propertyId: number;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export default function PropertyDetailsPage({ params }: PageProps) {
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [commentCount, setCommentCount] = useState(0);
  
  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setPropertyId(resolvedParams.id);
    };
    getParams();
  }, [params]);
  


  // Función para convertir URLs relativas a URLs completas
  const getImageUrl = (imageUrl: string | null | undefined): string | null => {
    if (!imageUrl || imageUrl.trim() === '') return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    // Ensure we don't double-concatenate URLs
    if (imageUrl.startsWith('/') && apiBaseUrl.endsWith('/')) {
      return `${apiBaseUrl.slice(0, -1)}${imageUrl}`;
    }
    return `${apiBaseUrl}${imageUrl}`;
  };
  
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { amenities: allAmenities } = useAmenities();
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Extract amenities and services from the property data using useMemo
  const amenitiesDetails = useMemo(() => {
    if (!property) return [];
    
    let details = (property as any)?.amenitiesDetails || [];
    if ((!details || details.length === 0) && Array.isArray(property?.amenities) && allAmenities?.length > 0) {
      // Lookup local de amenities por ID
      details = property.amenities
        .map((id: number) => allAmenities.find((a: any) => a.id === id))
        .filter(Boolean) as AmenityDetail[];
    }
    return details;
  }, [property, allAmenities]);

  const servicesDetails = useMemo(() => {
    if (!property) return [];
    return (property as any).servicesDetails || [];
  }, [property]);

  const privateFiles = useMemo(() => {
    if (!property) return [];
    return (property as any).privateFiles || [];
  }, [property]);

  useEffect(() => {
    if (!propertyId) return;
    
    const fetchProperty = async () => {
      try {
        const propertyData = await propertyService.getPropertyById(propertyId);
        
        if (propertyData) {
          // Transformar galleryImages a images array
          if (propertyData.galleryImages && Array.isArray(propertyData.galleryImages)) {
            propertyData.images = propertyData.galleryImages
              .sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0))
              .map((img: any) => img.url);
          } else if (!propertyData.images) {
            propertyData.images = [];
          }
          
          setProperty(propertyData);
          setIsFavorite(propertyData.favorite || false);
          
          // Incrementar vistas después de cargar la propiedad
          try {
            await propertyService.incrementViews(propertyId);
            console.log('✅ Vista registrada para propiedad:', propertyId);
          } catch (error) {
            console.error('Error incrementing views:', error);
          }
        } else {
          setError("La propiedad no fue encontrada.");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching property:", error);
        setError("Error al cargar la propiedad.");
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  useEffect(() => {
    if (!property) return;
    
    // Usar estadísticas reales de la propiedad
    setStats({
      views: property.views || 0,
      favorites: property.favoritesCount || 0,
      shared: property.shares || 0,
      amenities: amenitiesDetails?.length || 0,
      services: servicesDetails?.length || 0,
      documents: privateFiles?.length || 0
    });
    setStatsLoading(false);
  }, [property, amenitiesDetails, servicesDetails, privateFiles]);

  if (loading) {
    return <LoadingSpinner message="Cargando detalles de la propiedad" />;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Propiedad no encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "La propiedad solicitada no existe o no está disponible."}
          </p>
          <button
            onClick={() => router.push('/properties')}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Volver a Propiedades
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number, currency: string = "USD") => {
    // Validar currency y usar USD si es null/undefined/inválido
    const validCurrency = currency && currency.trim() !== '' ? currency : 'USD';
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: validCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'casa':
        return <Home className="h-5 w-5" />;
      case 'apartamento':
        return <Building className="h-5 w-5" />;
      case 'terreno':
        return <MapPin className="h-5 w-5" />;
      case 'local':
        return <Building className="h-5 w-5" />;
      case 'oficina':
        return <Building className="h-5 w-5" />;
      default:
        return <Home className="h-5 w-5" />;
    }
  };

  const getPropertyTypeText = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'casa':
        return 'Casa';
      case 'apartamento':
        return 'Apartamento';
      case 'terreno':
        return 'Terreno';
      case 'local':
        return 'Local Comercial';
      case 'oficina':
        return 'Oficina';
      default:
        return type || 'Propiedad';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'disponible':
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'vendida':
      case 'sold':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'en proceso':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'disponible':
      case 'active':
        return 'Disponible';
      case 'vendida':
      case 'sold':
        return 'Vendida';
      case 'en proceso':
      case 'pending':
        return 'En Proceso';
      default:
        return status || 'Desconocido';
    }
  };

  const getAmenityIcon = (icon: string) => {
    switch (icon?.toLowerCase()) {
      case 'pool':
        return <Droplets className="h-5 w-5" />;
      case 'gym':
        return <Dumbbell className="h-5 w-5" />;
      case 'parking':
        return <Car className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'wifi':
        return <Wifi className="h-5 w-5" />;
      case 'garden':
        return <Home className="h-5 w-5" />;
      case 'ac':
        return <Snowflake className="h-5 w-5" />;
      case 'heating':
        return <Flame className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'mantenimiento':
        return <Wrench className="h-5 w-5" />;
      case 'seguridad':
        return <Shield className="h-5 w-5" />;
      case 'limpieza':
        return <Droplets className="h-5 w-5" />;
      case 'portería':
        return <Bell className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const handleFavorite = async () => {
    if (updatingFavorite || !property) return;
    
    setUpdatingFavorite(true);
    try {
      const newFavoriteState = await publicPropertyService.toggleFavorite(propertyId!);
      setIsFavorite(newFavoriteState);
      setProperty(prev => prev ? { ...prev, favorite: newFavoriteState } : null);
    } catch (error) {
      console.error('❌ Error al cambiar favorito:', error);
      alert('Error al cambiar favorito. Por favor, intente nuevamente.');
    } finally {
      setUpdatingFavorite(false);
    }
  };

  const handleShare = () => {
    if (!isAuthenticated) {
      // Si no está logueado, mostrar modal de login o redirigir
      alert('Debes iniciar sesión para compartir propiedades en redes sociales');
      return;
    }
    
    // Si está logueado, usar la funcionalidad nativa de compartir
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleCall = () => {
    window.open('tel:+59521123456');
  };

  const handleEmail = () => {
    window.open('mailto:info@onproptech.com?subject=Consulta sobre ' + property.title);
  };

  const handleDownloadFile = (file: PrivateFile) => {
    window.open(file.url, '_blank');
  };

  const handleViewVideo = () => {
    if (property.videoUrl) {
      window.open(property.videoUrl, '_blank');
    }
  };

  const handleVirtualTour = () => {
    if (property.virtualTourUrl) {
      window.open(property.virtualTourUrl, '_blank');
    }
  };

  // Extract additional data from property
  const createdAt = (property as any)?.createdAt;
  const updatedAt = (property as any)?.updatedAt;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full min-w-0">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between h-auto sm:h-16 gap-2 sm:gap-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/properties')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex flex-col">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {property.address}, {property.city}
                </p>
                <h1 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mt-1 sm:mt-0 leading-tight">
                  {property.title}
                </h1>
                {!isAuthenticated && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    💡 Inicia sesión para compartir esta propiedad en redes sociales
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Botón de favorito */}
              <button
                onClick={handleFavorite}
                disabled={updatingFavorite}
                className={`inline-flex items-center px-4 py-2 border-2 rounded-lg font-medium transition-colors ${
                  isFavorite
                    ? "border-pink-500 text-pink-500 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30"
                    : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                } ${updatingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}
                title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                {updatingFavorite ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <Heart className={`h-6 w-6 transition-colors duration-200 ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-400 fill-none"}`} />
                )}
              </button>
              
              <button
                onClick={() => propertyId && router.push(`/properties/${propertyId}/edit`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
              
              <button
                onClick={() => propertyId && router.push(`/properties/${propertyId}/statistics`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Estadísticas
              </button>
              
              <button 
                onClick={handleShare}
                disabled={!isAuthenticated}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${
                  isAuthenticated 
                    ? 'text-white bg-brand-500 hover:bg-brand-600' 
                    : 'text-gray-400 bg-gray-300 cursor-not-allowed'
                }`}
                title={isAuthenticated ? 'Compartir en redes sociales' : 'Debes iniciar sesión para compartir'}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {isAuthenticated ? 'Compartir' : 'Inicia sesión para compartir'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 w-full min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full min-w-0">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-full min-w-0">
              {property.images && property.images.length > 0 ? (
                <div className="relative">
                  <div className="w-full aspect-w-16 aspect-h-9 max-h-72 sm:max-h-96">
                    {getImageUrl(property.images[currentImageIndex]) ? (
                      <img
                        src={getImageUrl(property.images[currentImageIndex]) || ''}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Ocultar imagen que no se puede cargar sin generar error en consola
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
                  {property.images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between p-4">
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : property.images.length - 1)}
                        className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev < property.images.length - 1 ? prev + 1 : 0)}
                        className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                      >
                        <ChevronLeft className="h-5 w-5 rotate-180" />
                      </button>
                    </div>
                  )}
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </div>
              ) : (
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Sin imágenes disponibles</p>
                  </div>
                </div>
              )}
              
              {/* Thumbnail Gallery */}
              {property.images && property.images.length > 1 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                    {property.images.map((image: string, index: number) => (
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
                            src={getImageUrl(image) || ''}
                            alt={`${property.title} - Imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Ocultar imagen que no se puede cargar sin generar error en consola
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

            {/* Property Details with Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-full min-w-0">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="grid grid-cols-2 gap-2 px-2 sm:flex sm:gap-4 sm:px-6 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700" aria-label="Tabs">
                  {[
                    { id: 'overview', label: 'Resumen', icon: <Eye className="h-4 w-4" /> },
                    { id: 'amenities', label: 'Amenidades', icon: <Star className="h-4 w-4" /> },
                    { id: 'services', label: 'Servicios', icon: <Zap className="h-4 w-4" /> },
                    { id: 'files', label: 'Documentos', icon: <FileText className="h-4 w-4" /> },
                    { id: 'media', label: 'Multimedia', icon: <Video className="h-4 w-4" /> },
                    { 
                      id: 'comments', 
                      label: 'Comentarios', 
                      icon: <MessageCircle className="h-4 w-4" />,
                      badge: commentCount > 0 ? commentCount : undefined
                    }
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
                      {tab.badge && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    {/* Header centrado */}
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {property.title}
                      </h2>
                      <div className="flex flex-wrap items-center justify-center gap-3 text-gray-600 dark:text-gray-400 mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{property.address}, {property.city}</span>
                        </div>
                        <div className="flex items-center">
                          {getPropertyTypeIcon(property.type)}
                          <span className="ml-1">{getPropertyTypeText(property.type)}</span>
                        </div>
                        {property.operacion && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                              property.operacion === 'SALE'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
                                : property.operacion === 'RENT'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400'
                            } whitespace-nowrap`}>
                              {property.operacion === 'SALE' ? 'Venta' : property.operacion === 'RENT' ? 'Alquiler' : 'Ambos'}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Estatus centrado */}
                      <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
                        {getStatusText(property.status)}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-8">
                      <div className="text-4xl font-bold text-brand-600 dark:text-brand-400 mb-2">
                        {formatPrice(property.price, property.currency)}
                      </div>
                      {property.featured && (
                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-sm font-medium border border-amber-200">
                          <Star className="h-4 w-4 mr-2" />
                          Propiedad Destacada
                        </div>
                      )}
                    </div>

                    {/* Key Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8 max-w-3xl mx-auto">
                      <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                        <Bed className="h-8 w-8 text-brand-600 dark:text-brand-400 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{property.bedrooms}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Dormitorios</div>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                        <Bath className="h-8 w-8 text-brand-600 dark:text-brand-400 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{property.bathrooms}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Baños</div>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                        <Ruler className="h-8 w-8 text-brand-600 dark:text-brand-400 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{property.area}m²</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Área</div>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                        <Car className="h-8 w-8 text-brand-600 dark:text-brand-400 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{property.parking}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Estacionamientos</div>
                      </div>
                    </div>

                    {/* Description */}
                    {property.description && (
                      <div className="text-center mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Descripción</h3>
                        <div 
                          className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm max-w-3xl mx-auto dark:prose-invert text-left"
                          dangerouslySetInnerHTML={{ __html: property.description }}
                        />
                      </div>
                    )}

                    {/* Additional Details */}
                    <div className="max-w-4xl mx-auto">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Información Detallada</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 text-center">Detalles Adicionales</h4>
                          <div className="space-y-3">
                            {(property.houzezId || property.agencyPropertyNumber) && (
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <FileText className="h-5 w-5 mr-3 text-brand-500" />
                                <span>Código de Referencia: {property.houzezId || property.agencyPropertyNumber}</span>
                              </div>
                            )}
                            {property.yearBuilt && property.yearBuilt > 0 && (
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <Calendar className="h-5 w-5 mr-3 text-brand-500" />
                                <span>Año de construcción: {property.yearBuilt}</span>
                              </div>
                            )}
                            {property.state && (
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <MapPin className="h-5 w-5 mr-3 text-brand-500" />
                                <span>Departamento: {property.state}</span>
                              </div>
                            )}
                            {property.zip && (
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <MapPin className="h-5 w-5 mr-3 text-brand-500" />
                                <span>Código Postal: {property.zip}</span>
                              </div>
                            )}
                            {property.country && (
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <Globe className="h-5 w-5 mr-3 text-brand-500" />
                                <span>País: {property.country}</span>
                              </div>
                            )}
                            {property.operacion && (
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <DollarSign className="h-5 w-5 mr-3 text-brand-500" />
                                <span>Operación: {
                                  property.operacion === 'SALE' ? 'Venta' : 
                                  property.operacion === 'RENT' ? 'Alquiler' : 
                                  'Venta y Alquiler'
                                }</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 text-center">Información del Sistema</h4>
                          <div className="space-y-3">
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <Eye className="h-5 w-5 mr-3 text-brand-500" />
                              <span>Visibilidad: {property.featured ? 'Destacada' : 'Normal'}</span>
                            </div>
                            {property.premium && (
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <Award className="h-5 w-5 mr-3 text-brand-500" />
                                <span>Propiedad Premium</span>
                              </div>
                            )}
                            {createdAt && (
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <Calendar className="h-5 w-5 mr-3 text-brand-500" />
                                <span>Publicada: {formatDate(createdAt)}</span>
                              </div>
                            )}
                            {updatedAt && (
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <Clock className="h-5 w-5 mr-3 text-brand-500" />
                                <span>Actualizada: {formatDate(updatedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amenities Tab */}
                {activeTab === 'amenities' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Amenidades Disponibles</h3>
                    {Array.isArray(amenitiesDetails) && amenitiesDetails.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {amenitiesDetails.map((amenity: AmenityDetail) => (
                          <div key={amenity.id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex-shrink-0 mr-3 text-brand-500">
                              {getAmenityIcon(amenity.icon)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{amenity.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{amenity.description}</p>
                              <span className="inline-block mt-1 px-2 py-1 text-xs bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300 rounded-full">
                                {amenity.category}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          {Array.isArray(amenitiesDetails) && amenitiesDetails.length === 0
                            ? 'No hay amenidades registradas para esta propiedad'
                            : 'No se pudo obtener la información de amenities para esta propiedad'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Servicios Incluidos</h3>
                    {servicesDetails.length > 0 ? (
                      <div className="space-y-4">
                        {servicesDetails.map((service: ServiceDetail) => (
                          <div key={service.id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex-shrink-0 mr-3 text-brand-500">
                              {getServiceIcon(service.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{service.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                              <div className="flex items-center mt-2 space-x-2">
                                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                                  {service.type}
                                </span>
                                {service.includedInRent && (
                                  <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">
                                    Incluido en Alquiler
                                  </span>
                                )}
                                {service.includedInSale && (
                                  <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded-full">
                                    Incluido en Venta
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No hay servicios registrados para esta propiedad</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Files Tab */}
                {activeTab === 'files' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documentos Privados</h3>
                    {privateFiles.length > 0 ? (
                      <div className="space-y-3">
                        {privateFiles.map((file: PrivateFile) => (
                          <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-gray-500 mr-3" />
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{file.fileName}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {file.fileType.toUpperCase()} • {formatFileSize(file.fileSize)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownloadFile(file)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-brand-700 bg-brand-100 hover:bg-brand-200 dark:text-brand-300 dark:bg-brand-900 dark:hover:bg-brand-800 transition-colors"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No hay documentos privados para esta propiedad</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Media Tab */}
                {activeTab === 'media' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Multimedia</h3>
                    <div className="space-y-4">
                      {/* Featured Image */}
                      {property.featuredImage && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden mr-4">
                              <img
                                src={property.featuredImage}
                                alt="Imagen destacada"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">Imagen Destacada</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Imagen principal de la propiedad</p>
                            </div>
                          </div>
                          <button
                            onClick={() => window.open(property.featuredImage, '_blank')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-brand-700 bg-brand-100 hover:bg-brand-200 dark:text-brand-300 dark:bg-brand-900 dark:hover:bg-brand-800 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver Imagen
                          </button>
                        </div>
                      )}

                      {/* Video */}
                      {property.videoUrl && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center">
                            <Video className="h-5 w-5 text-gray-500 mr-3" />
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">Video de la Propiedad</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Video promocional</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {property.videoUrl}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleViewVideo}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-brand-700 bg-brand-100 hover:bg-brand-200 dark:text-brand-300 dark:bg-brand-900 dark:hover:bg-brand-800 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver Video
                          </button>
                        </div>
                      )}
                      
                      {/* Virtual Tour */}
                      {property.virtualTourUrl && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center">
                            <Globe className="h-5 w-5 text-gray-500 mr-3" />
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">Tour Virtual</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Recorrido virtual 360°</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {property.virtualTourUrl}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleVirtualTour}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-brand-700 bg-brand-100 hover:bg-brand-200 dark:text-brand-300 dark:bg-brand-900 dark:hover:bg-brand-800 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver Tour
                          </button>
                        </div>
                      )}
                      
                      {/* No Content Message */}
                      {!property.featuredImage && !property.videoUrl && !property.virtualTourUrl && (
                        <div className="text-center py-8">
                          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">No hay contenido multimedia disponible</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                            Agrega videos, tours virtuales o imágenes destacadas para mejorar la presentación de la propiedad.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <div className="max-w-4xl mx-auto">
                    {/* Header centrado */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Comentarios</h3>
                      {commentCount > 0 ? (
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {commentCount} comentario{commentCount !== 1 ? 's' : ''}
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">
                          Comunidad de PropTech
                        </p>
                      )}
                    </div>
                    
                    {/* Mensaje informativo cuando no hay comentarios */}
                    {commentCount === 0 && (
                      <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl mb-8 border border-gray-200 dark:border-gray-600">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-10 w-10 text-brand-600 dark:text-brand-400" />
                        </div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                          Sé el primero en comentar
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                          Comparte tu opinión sobre esta propiedad y ayuda a otros usuarios a tomar decisiones informadas sobre su próxima inversión inmobiliaria.
                        </p>
                        {!isAuthenticated && (
                          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 rounded-lg text-sm font-medium border border-orange-200">
                            💡 Inicia sesión para poder comentar
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Lista de comentarios centrada */}
                    <div className="flex justify-center">
                      <div className="w-full max-w-3xl">
                        <CommentList 
                          postId={parseInt(propertyId!)} 
                          onCommentCountChange={setCommentCount}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información de Contacto</h3>
              
              <ContactInfo 
                agent={property.agent ? {
                  name: `${property.agent.firstName || ''} ${property.agent.lastName || ''}`.trim(),
                  phone: property.agent.phone,
                  email: property.agent.email
                } : undefined}
                showAddress={false}
                showSocial={false}
                compact={false}
              />
              

              
              <div className="mt-6 space-y-3">
                <button 
                  onClick={handleCall}
                  className="w-full bg-brand-500 text-white py-2 px-4 rounded-lg hover:bg-brand-600 transition-colors flex items-center justify-center"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar Ahora
                </button>
                <button 
                  onClick={handleEmail}
                  className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            {/* Eliminado el bloque de Acciones Rápidas para dejar solo el botón de favorito en el header */}

            {/* Property Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estadísticas</h3>
              {statsLoading ? (
                <div className="text-gray-500">Cargando estadísticas...</div>
              ) : stats ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Vistas</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.views ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Favoritos</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.favorites ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Compartido</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{stats.shared ?? 0}</span>
                      {!isAuthenticated && (
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          Solo usuarios logueados
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Comentarios</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{commentCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Amenidades</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.amenities ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Servicios</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.services ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Documentos</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.documents ?? 0}</span>
                  </div>
                </div>
              ) : (
                <div className="text-red-500">No se pudieron cargar las estadísticas.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 