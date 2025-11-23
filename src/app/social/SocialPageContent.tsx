'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CommentList } from '@/components/comments/CommentList';
import { Post, SocialService, CreatePostRequest } from '@/services/socialService';
import { commentService } from '@/services/commentService';
import { PropShot, PropShotService, CreatePropShotRequest } from '@/services/propShotService';
import CreatePropShotModal from '@/components/social/CreatePropShotModal';
import LocationMap from '@/components/LocationMap';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  MapPin, 
  Clock, 
  User,
  ThumbsUp,
  MessageSquare,
  Share,
  Play,
  Heart as HeartIcon,
  MessageCircle as MessageIcon,
  Camera,
  Building2
} from 'lucide-react';
import PropShotReelViewer from '@/components/social/PropShotReelViewer';
import { createTimeoutSignal } from '@/utils/createTimeoutSignal';

// Función para convertir URLs en texto a enlaces clickeables
const convertUrlsToLinks = (text: string): string => {
  // Verificar si estamos en el cliente
  if (typeof window === 'undefined') return text;
  
  // Regex para detectar URLs (http, https, www)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  
  return text.replace(urlRegex, (url) => {
    // Si no tiene protocolo, agregar https://
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 underline break-all">${url}</a>`;
  });
};

// Función para detectar URLs en tiempo real
const detectUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches ? matches : [];
};

// Función para detectar el país por IP (solo para determinar si es Paraguay)
const detectCountryByIP = async (): Promise<string> => {
  try {
    const signal = createTimeoutSignal(3000);
    const response = await fetch('https://ipapi.co/json/', {
      ...(signal ? { signal } : {})
    });
    const data = await response.json();
    return data.country_name || data.country || 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
};

// Función para obtener ubicación por IP (BLOQUEADA para Paraguay)
const getLocationByIP = async (): Promise<string> => {
  try {
    // Primero detectar si estamos en Paraguay
    const country = await detectCountryByIP();
    
    // Si es Paraguay, BLOQUEAR completamente la detección por IP
    if (country === 'Paraguay' || country === 'PY') {
      return 'IP bloqueada para Paraguay - Usar GPS para precisión';
    }
    
    // Solo usar IP para otros países donde sea más precisa
    
    // Interfaz común para los resultados de ubicación
    interface LocationResult {
      city: string;
      country: string;
      region?: string;
      region_name?: string;
      state_prov?: string;
    }
    
    // Servicios ordenados por precisión
    const services = [
      {
        url: 'https://ipapi.co/json/',
        name: 'ipapi.co',
        parser: (data: any): LocationResult | null => {
          if (data.city && data.country_name) {
            return { city: data.city, country: data.country_name, region: data.region };
          }
          return null;
        }
      },
      {
        url: 'https://ipinfo.io/json',
        name: 'ipinfo.io',
        parser: (data: any): LocationResult | null => {
          if (data.city && data.country) {
            return { city: data.city, country: data.country, region: data.region };
          }
          return null;
        }
      }
    ];
    
    for (const service of services) {
      try {
        const signal = createTimeoutSignal(4000);
        const response = await fetch(service.url, {
          ...(signal ? { signal } : {})
        });
        
        if (response.ok) {
          const data = await response.json();
          const result = service.parser(data);
          
          if (result) {
            if (result.region || result.region_name || result.state_prov) {
              return `${result.city}, ${result.region || result.region_name || result.state_prov}, ${result.country}`;
            } else {
              return `${result.city}, ${result.country}`;
            }
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return 'Ubicación por IP no disponible';
  } catch (error) {
    console.error('❌ Error obteniendo ubicación por IP:', error);
    return 'Ubicación por IP no disponible';
  }
};

// Función para obtener ubicación por GPS del navegador con alta precisión
const getLocationByGPS = (): Promise<{ location: string; accuracy: number; method: string }> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ location: 'GPS no disponible', accuracy: 0, method: 'none' });
      return;
    }
    
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Usar múltiples servicios de reverse geocoding para máxima precisión
          let cityName = '';
          let countryName = '';
          let regionName = '';
          let bestService = '';
          
          // Servicio 1: BigDataCloud (muy preciso, gratuito)
          try {
            const bigDataSignal = createTimeoutSignal(4000);
            const bigDataResponse = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`,
              {
                ...(bigDataSignal ? { signal: bigDataSignal } : {})
              }
            );
            const bigDataData = await bigDataResponse.json();
            
            if (bigDataData.city && bigDataData.countryName) {
              cityName = bigDataData.city;
              countryName = bigDataData.countryName;
              regionName = bigDataData.principalSubdivision || bigDataData.locality || '';
              bestService = 'BigDataCloud';
            }
          } catch (error) {
          }
          
          // Servicio 2: OpenStreetMap Nominatim (gratuito, buena precisión)
          if (!cityName) {
            try {
              const nominatimSignal = createTimeoutSignal(4000);
              const nominatimResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&accept-language=es`,
                {
                  ...(nominatimSignal ? { signal: nominatimSignal } : {})
                }
              );
              const nominatimData = await nominatimResponse.json();
              
              if (nominatimData.display_name) {
                const parts = nominatimData.display_name.split(', ');
                cityName = parts[0];
                countryName = parts[parts.length - 1];
                regionName = parts.length > 2 ? parts[1] : '';
                bestService = 'Nominatim';
              }
            } catch (error) {
            }
          }
          
          // Servicio 3: LocationIQ (gratuito, muy preciso)
          if (!cityName) {
            try {
              const locationIqSignal = createTimeoutSignal(4000);
              const locationIQResponse = await fetch(
                `https://eu1.locationiq.com/v1/reverse.php?key=pk.1f029f930f7826dee6d16e0d9d9f06cb&lat=${latitude}&lon=${longitude}&format=json`,
                {
                  ...(locationIqSignal ? { signal: locationIqSignal } : {})
                }
              );
              const locationIQData = await locationIQResponse.json();
              
              if (locationIQData.address) {
                cityName = locationIQData.address.city || locationIQData.address.town || locationIQData.address.village;
                countryName = locationIQData.address.country;
                regionName = locationIQData.address.state || locationIQData.address.county;
                bestService = 'LocationIQ';
              }
            } catch (error) {
            }
          }
          
          // Determinar el mejor resultado
          if (cityName && countryName) {
            let finalLocation = '';
            
            // Construir ubicación con el máximo detalle disponible
            if (regionName && regionName !== cityName && regionName !== countryName) {
              finalLocation = `${cityName}, ${regionName}, ${countryName}`;
            } else {
              finalLocation = `${cityName}, ${countryName}`;
            }
            
            resolve({
              location: finalLocation,
              accuracy: accuracy,
              method: `GPS + ${bestService}`
            });
          } else {
            // Fallback: coordenadas con máxima precisión
            resolve({
              location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              accuracy: accuracy,
              method: 'GPS (coordenadas)'
            });
          }
        } catch (error) {
          console.error('Error en reverse geocoding:', error);
          resolve({
            location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
            accuracy: position.coords.accuracy || 0,
            method: 'GPS (error en geocoding)'
          });
        }
      },
      (error) => {
        let errorMessage = 'GPS no disponible';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'GPS: Permiso denegado';
            console.error('❌ GPS: Usuario denegó permiso de ubicación');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'GPS: Posición no disponible';
            console.error('❌ GPS: Información de ubicación no disponible');
            break;
          case error.TIMEOUT:
            errorMessage = 'GPS: Tiempo agotado';
            console.error('❌ GPS: Tiempo de espera agotado');
            break;
          default:
            errorMessage = 'GPS: Error desconocido';
            console.error('❌ GPS: Error desconocido:', error.code, error.message);
        }
        
        resolve({ location: errorMessage, accuracy: 0, method: 'GPS error' });
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, // 20 segundos para máxima precisión
        maximumAge: 0 // Siempre obtener ubicación fresca
      }
    );
  });
};

// Función para extraer el título de una URL con timeout
const extractUrlTitle = async (url: string): Promise<string> => {
  try {
    // Agregar protocolo si no lo tiene
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Crear un AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
    
    // Usar un proxy CORS para evitar problemas de CORS
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}`;
    const response = await fetch(proxyUrl, { 
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    const data = await response.json();
    
    if (data.contents) {
      // Extraer el título del HTML
      const titleMatch = data.contents.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        return titleMatch[1].trim();
      }
    }
    
    return url; // Fallback: devolver la URL si no se puede extraer el título
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Timeout al extraer título de:', url);
      return 'Tiempo de espera agotado';
    }
    console.error('Error extracting URL title:', error);
    return url; // Fallback: devolver la URL en caso de error
  }
};

export default function SocialPageContent() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // Panache usa índice 0 para la primera página
  const [postsPerPage] = useState(10); // Con manejo robusto de errores
  const [newPost, setNewPost] = useState('');
  const [detectedUrls, setDetectedUrls] = useState<string[]>([]);
  const [urlTitles, setUrlTitles] = useState<{ [url: string]: string }>({});
  const [urlLoadingStates, setUrlLoadingStates] = useState<{ [url: string]: boolean }>({});
  const [selectedPostImages, setSelectedPostImages] = useState<File[]>([]);
  const [userLocation, setUserLocation] = useState<string>('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string; fullAddress?: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [postImagePreviews, setPostImagePreviews] = useState<string[]>([]);
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [commentCounts, setCommentCounts] = useState<{ [key: number]: number }>({});
  const [showMessages, setShowMessages] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [openShareMenu, setOpenShareMenu] = useState<number | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [imageGallery, setImageGallery] = useState<{ postId: number; images: string[]; startIndex: number } | null>(null);
  const [postImages, setPostImages] = useState<Map<number, string[]>>(new Map());
  const [propShots, setPropShots] = useState<PropShot[]>([]);
  const [propShotsLoading, setPropShotsLoading] = useState(true);
  const [selectedPropShot, setSelectedPropShot] = useState<PropShot | null>(null);
  const [showCreatePropShot, setShowCreatePropShot] = useState(false);
  const [newPropShot, setNewPropShot] = useState({ title: '', description: '', duration: '90:00', link: '' });
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [creatingPropShot, setCreatingPropShot] = useState(false);

  // Función para abrir selector de ubicación
  const openLocationPicker = () => {
    setShowLocationPicker(true);
  };

  // Función para confirmar ubicación seleccionada
  const confirmSelectedLocation = (location: { lat: number; lng: number; address: string; fullAddress?: string }) => {
    setSelectedLocation(location);
    setUserLocation(location.address);
    setShowLocationPicker(false);
  };

  // Función para detectar ubicación automáticamente
  const detectLocation = async () => {
    setLocationLoading(true);
    try {
      // Intentar GPS primero
      const gpsResult = await getLocationByGPS();
      if (gpsResult.location && !gpsResult.location.includes('GPS requerido') && !gpsResult.location.includes('GPS no disponible')) {
        setUserLocation(gpsResult.location);
        return;
      }
      
      // Si GPS falla, intentar IP
      const ipLocation = await getLocationByIP();
      setUserLocation(ipLocation);
    } catch (error) {
      console.error('Error detecting location:', error);
      setUserLocation('Ubicación no disponible');
    } finally {
      setLocationLoading(false);
    }
  };



  // useEffect para montaje del componente
  useEffect(() => {
    setMounted(true);
  }, []);

  // useEffect para extraer títulos de URLs detectadas
  useEffect(() => {
    const extractTitlesForUrls = async () => {
      for (const url of detectedUrls) {
        // Solo extraer si no se ha procesado antes y no está cargando
        if (!urlTitles[url] && !urlLoadingStates[url]) {
          // Marcar como cargando
          setUrlLoadingStates(prev => ({ ...prev, [url]: true }));
          
          try {
            const title = await extractUrlTitle(url);
            setUrlTitles(prev => ({ ...prev, [url]: title }));
          } catch (error) {
            setUrlTitles(prev => ({ ...prev, [url]: url })); // Fallback
          } finally {
            // Marcar como no cargando
            setUrlLoadingStates(prev => ({ ...prev, [url]: false }));
          }
        }
      }
    };

    if (detectedUrls.length > 0) {
      extractTitlesForUrls();
    }
  }, [detectedUrls, urlTitles, urlLoadingStates]);

  const [conversations] = useState([
    {
      id: 1,
      name: 'María González',
      avatar: 'M',
      lastMessage: 'Hola, me interesa la propiedad...',
      lastMessageTime: '12:30',
      unread: true
    },
    {
      id: 2,
      name: 'Carlos Mendoza',
      avatar: 'C',
      lastMessage: '¿Tienes más fotos de la casa?',
      lastMessageTime: 'Ayer',
      unread: false
    }
  ]);

  const [messages] = useState<{ [key: number]: Array<{ text: string; sent: boolean }> }>({
    1: [
      { text: 'Hola, me interesa la propiedad que publicaste en Las Mercedes. ¿Podrías darme más detalles?', sent: false },
      { text: '¡Hola María! Por supuesto, es una hermosa casa de 3 habitaciones con vista al río. ¿Te gustaría que te envíe más fotos?', sent: true }
    ],
    2: [
      { text: '¿Tienes más fotos de la casa?', sent: false },
      { text: 'Claro Carlos, te envío un enlace con la galería completa', sent: true }
    ]
  });

  // Cargar posts iniciales
  useEffect(() => {
    const loadInitialPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Panache usa índice 0 para la primera página
        const fetchedPosts = await SocialService.getPosts(0, postsPerPage);
        
        if (!fetchedPosts || fetchedPosts.length === 0) {
          console.log('ℹ️ No se encontraron posts');
          setPosts([]);
          setHasMorePosts(false);
        } else {
          setPosts(fetchedPosts);
          
          // Verificar si hay más posts
          setHasMorePosts(fetchedPosts.length === postsPerPage);
          
          // Cargar conteo de comentarios para cada post
          fetchedPosts.forEach(post => {
            loadCommentCounts(post.id);
            if (post.linkImage || post.images) {
              loadPostImages(post);
            }
          });
        }
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('No se pudieron cargar los posts en este momento');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialPosts();
  }, [postsPerPage]);

  // Cargar TODOS los PropShots (público)
  useEffect(() => {
    const loadPropShots = async () => {
      try {
        setPropShotsLoading(true);
        // Cargar TODOS los PropShots (público)
        const fetchedPropShots = await PropShotService.getPropShots();
        setPropShots(fetchedPropShots);
      } catch (err) {
        console.error('Error loading PropShots:', err);
        setPropShots([]);
      } finally {
        setPropShotsLoading(false);
      }
    };

    loadPropShots();
  }, []);

  // Manejar navegación con teclado para la galería de imágenes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!imageGallery) return;
      
      switch (e.key) {
        case 'Escape':
          closeImageGallery();
          break;
        case 'ArrowLeft':
          setImageGallery(prev => prev ? { 
            ...prev, 
            startIndex: prev.startIndex > 0 ? prev.startIndex - 1 : prev.images.length - 1 
          } : null);
          break;
        case 'ArrowRight':
          setImageGallery(prev => prev ? { 
            ...prev, 
            startIndex: prev.startIndex < prev.images.length - 1 ? prev.startIndex + 1 : 0 
          } : null);
          break;
      }
    };

    if (imageGallery) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [imageGallery]);

  // Función para cargar conteo de comentarios
  const loadCommentCounts = async (postId: number) => {
    try {
      const count = await commentService.getCommentCountByPostId(postId);
      setCommentCounts(prev => ({ ...prev, [postId]: count }));
    } catch (error) {
      console.error('Error loading comment count:', error);
    }
  };

  // Función para cargar imágenes de un post
  const loadPostImages = async (post: Post) => {
    try {
      
      // Primero verificar si el post ya tiene imágenes en el estado
      const existingImages = postImages.get(post.id);
      if (existingImages && existingImages.length > 0) {
        return;
      }
      
      // Intentar cargar imágenes del servicio
      const images = await SocialService.getPostImages(post);
      
      // Si no hay imágenes del servicio, verificar si el post tiene linkImage
      if (!images || images.length === 0) {
        if (post.linkImage) {
          const linkImages = [post.linkImage!];
          setPostImages(prev => {
            const newMap = new Map(prev);
            newMap.set(post.id, linkImages);
            return newMap;
          });
          return;
        }
        
        // Si el post tiene images, procesarlas
        if (post.images) {
          let processedImages: string[] = [];
          if (typeof post.images === 'string') {
            processedImages = post.images.split(',').filter(img => img.trim());
          } else if (Array.isArray(post.images)) {
            processedImages = post.images;
          }
          
          if (processedImages.length > 0) {
            setPostImages(prev => {
              const newMap = new Map(prev);
              newMap.set(post.id, processedImages);
              return newMap;
            });
            return;
          }
        }
        
        return;
      }
      
      // Si hay imágenes del servicio, actualizar el estado
      setPostImages(prev => {
        const newMap = new Map(prev);
        newMap.set(post.id, images);
        return newMap;
      });
    } catch (error) {
      console.error(`❌ Error al cargar imágenes del post ${post.id}:`, error);
      
      // Fallback: intentar usar linkImage o images del post
      if (post.linkImage) {
        setPostImages(prev => {
          const newMap = new Map(prev);
          if (post.linkImage) {
            newMap.set(post.id, [post.linkImage]);
          }
          return newMap;
        });
      } else if (post.images) {
        let processedImages: string[] = [];
        if (typeof post.images === 'string') {
          processedImages = post.images.split(',').filter(img => img.trim());
        } else if (Array.isArray(post.images)) {
          processedImages = post.images;
        }
        
        if (processedImages.length > 0) {
          setPostImages(prev => {
            const newMap = new Map(prev);
            newMap.set(post.id, processedImages);
            return newMap;
          });
        }
      }
    }
  };

  // Función para compartir un post
  const handleShare = async (postId: number, method: 'copy' | 'facebook' | 'twitter' | 'whatsapp') => {
    const postUrl = `${window.location.origin}/social/posts/${postId}`;
    const post = posts.find(p => p.id === postId);
    const postText = post?.content ? post.content.substring(0, 100) + '...' : 'Mira este post interesante';
    
    try {
      switch (method) {
        case 'copy':
          await navigator.clipboard.writeText(postUrl);
          alert('✅ Enlace copiado al portapapeles');
          break;
          
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
          break;
          
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postText)}`, '_blank');
          break;
          
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(postText + ' ' + postUrl)}`, '_blank');
          break;
      }
      
      setOpenShareMenu(null);
    } catch (error) {
      console.error('Error al compartir:', error);
      alert('Error al compartir. Intenta nuevamente.');
    }
  };

  // Función para eliminar un post
  const handleDeletePost = async (postId: number) => {
    if (!isAuthenticated || !user) {
      alert('Debes iniciar sesión para eliminar posts');
      return;
    }

    // Confirmar eliminación
    if (!confirm('¿Estás seguro de que deseas eliminar este post? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await SocialService.deletePost(postId, user.id || 0);
      
      // Cerrar dropdown
      setOpenDropdown(null);
      
      // Recargar posts desde BD
      const updatedPosts = await SocialService.getPosts(0, postsPerPage);
      setPosts(updatedPosts);
      
      // Recargar conteos de comentarios
      updatedPosts.forEach(post => {
        loadCommentCounts(post.id);
      });
      
      // Notificación de éxito (opcional, puedes quitar el alert si prefieres)
      console.log('✅ Post eliminado correctamente');
    } catch (error: any) {
      console.error('Error al eliminar post:', error);
      alert(error.message || 'Error al eliminar el post. Intenta nuevamente.');
    }
  };

  // Función para manejar likes (permite usuarios anónimos)
  const handleLike = async (postId: number) => {
    try {
      // Si está autenticado, usar su ID
      // Si no, usar ID 0 para representar usuario anónimo
      const userId = isAuthenticated && user ? user.id || 0 : 0;
      
      // Si es anónimo, verificar si ya dio like antes (usando localStorage)
      if (!isAuthenticated) {
        const anonymousLikes = JSON.parse(localStorage.getItem('anonymousLikes') || '[]');
        if (anonymousLikes.includes(postId)) {
          alert('Ya diste me gusta a este post. Inicia sesión para gestionar tus likes.');
          return;
        }
        // Registrar el like anónimo
        anonymousLikes.push(postId);
        localStorage.setItem('anonymousLikes', JSON.stringify(anonymousLikes));
      }

      await SocialService.likePost({
        postId,
        userId
      });
      
      // Refrescar posts desde BD con los mismos parámetros (página 0 = primera página)
      const updatedPosts = await SocialService.getPosts(0, postsPerPage);
      setPosts(updatedPosts);
      
      // Recargar conteos de comentarios
      updatedPosts.forEach(post => {
        loadCommentCounts(post.id);
      });
    } catch (error) {
      console.error('Error al dar like:', error);
      alert('Error al dar like. Intenta nuevamente.');
    }
  };

  // Función para manejar selección de imágenes en posts
  const handlePostImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Limitar a máximo 5 imágenes
      const selectedFiles = files.slice(0, 5);
      setSelectedPostImages(selectedFiles);
      
      // Crear previews
      const previews = selectedFiles.map(file => URL.createObjectURL(file));
      setPostImagePreviews(previews);
    }
  };

  // Función para remover imagen de post
  const removePostImage = (index: number) => {
    setSelectedPostImages(prev => prev.filter((_, i) => i !== index));
    setPostImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Función para crear post
  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    // Validar que el usuario esté autenticado
    if (!isAuthenticated || !user || !user.id) {
      alert('Debes iniciar sesión para crear un post.');
      return;
    }

    try {
      const postData: CreatePostRequest = {
        content: newPost,
        userId: user.id,
        location: userLocation || undefined
      };

      // Upload de imágenes si se seleccionaron
      if (selectedPostImages.length > 0) {
        try {
          const imageUploads = await SocialService.uploadPostImages(selectedPostImages);
          postData.images = imageUploads.map(upload => upload.url);
        } catch (error) {
          console.error('Error uploading images:', error);
          alert('Error al subir las imágenes. El post se creará sin imágenes.');
        }
      }

      const createdPost = await SocialService.createPost(postData);
      
      // Mostrar notificación de éxito
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
      // Limpiar el formulario
      setNewPost('');
      setSelectedPostImages([]);
      setPostImagePreviews([]);
      setUserLocation('');
      setDetectedUrls([]);
      setUrlTitles({});
      setUrlLoadingStates({});
      
      // Recargar posts frescos de la BD con los mismos parámetros de paginación (página 0 = primera página)
      console.log('✅ Post creado, recargando lista desde BD...');
      const updatedPosts = await SocialService.getPosts(0, postsPerPage);
      
      // Actualizar estado con posts frescos
      setPosts(updatedPosts);
      
      // Cargar imágenes y comentarios para cada post
      updatedPosts.forEach(post => {
        loadCommentCounts(post.id);
        if (post.linkImage || post.images) {
          loadPostImages(post);
        }
      });
      
      console.log(`✅ Lista recargada: ${updatedPosts.length} posts desde BD`);
    } catch (error: any) {
      console.error('Error al crear post:', error);
      const errorMessage = error?.response?.data?.error || error?.response?.data || error?.message || 'Error al crear el post. Intenta nuevamente.';
      alert(errorMessage);
    }
  };

  // Función para enviar mensaje
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setNewMessage('');
  };

  // Función para crear PropShot
  const handleCreatePropShot = async () => {
    if (!selectedVideo || !newPropShot.title.trim()) return;

    try {
      setCreatingPropShot(true);
      
      const propShotData: CreatePropShotRequest = {
        title: newPropShot.title,
        description: newPropShot.description,
        duration: newPropShot.duration,
        link: newPropShot.link || undefined,
        videoFile: selectedVideo,
        thumbnailFile: selectedThumbnail || undefined,
        userId: user?.id || 0
      };

      const createdPropShot = await PropShotService.createPropShot(propShotData);
      
      // Recargar TODOS los PropShots para mostrar el nuevo
      const updatedPropShots = await PropShotService.getPropShots();
        setPropShots(updatedPropShots);
      
      // Limpiar el formulario
      setNewPropShot({ title: '', description: '', duration: '90:00', link: '' });
      setSelectedVideo(null);
      setVideoPreview(null);
      setSelectedThumbnail(null);
      setThumbnailPreview(null);
      setShowCreatePropShot(false);
        
        // Mostrar mensaje de éxito
      alert('PropShot creado exitosamente');
      } catch (error) {
      console.error('Error creating PropShot:', error);
      alert('Error al crear el PropShot. Intenta nuevamente.');
    } finally {
      setCreatingPropShot(false);
    }
  };

  // Función para dar like a un PropShot
  const handleLikePropShot = async (propShotId: number) => {
    // Verificar si ya dio like (localStorage para anónimos)
    const likedPropShots = JSON.parse(localStorage.getItem('likedPropShots') || '[]');
    if (likedPropShots.includes(propShotId)) {
      alert('Ya diste like a este PropShot');
      return;
    }
    
    try {
      const userId = user?.id || 0;
      await PropShotService.likePropShot(propShotId, userId);
      
      // Guardar en localStorage si es anónimo
      if (!isAuthenticated) {
        likedPropShots.push(propShotId);
        localStorage.setItem('likedPropShots', JSON.stringify(likedPropShots));
      }
      
      // Actualizar el PropShot en la lista
      setPropShots(prev => prev.map(shot =>
        shot.id === propShotId
          ? { ...shot, likes: shot.likes + 1 }
          : shot
      ));
      
      // Si es el PropShot seleccionado, actualizarlo también
      if (selectedPropShot?.id === propShotId) {
        setSelectedPropShot(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
    } catch (error) {
      console.error('Error liking PropShot:', error);
      alert('Error al dar like. Intenta nuevamente.');
    }
  };

  // Función para incrementar vistas
  const handleViewPropShot = async (propShotId: number) => {
    try {
      await PropShotService.incrementViews(propShotId);
      
    
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  // Función para agregar comentario a un PropShot
  const handleCommentPropShot = async (propShotId: number, content: string, userId: number, userName: string) => {
    try {
      await PropShotService.addComment(propShotId, content, userId, userName);
      
      // Actualizar el PropShot en la lista (incrementar contador)
      setPropShots(prev => prev.map(shot =>
        shot.id === propShotId
          ? { ...shot, comments: (shot.comments || 0) + 1 }
          : shot
      ));
      
      // Si es el PropShot seleccionado, actualizarlo también
      if (selectedPropShot?.id === propShotId) {
        setSelectedPropShot(prev => prev ? { ...prev, comments: (prev.comments || 0) + 1 } : null);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  // Función para convertir URLs relativas en URLs completas (usando env)
  const getFullUrl = (url: string): string => {
    if (!url) return '';
    
    // Si ya es una URL completa, retornarla
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    
    // Determinar la URL base del API
    let apiBaseUrl: string;
    if (process.env.NEXT_PUBLIC_UPLOADS_BASE_URL) {
      apiBaseUrl = process.env.NEXT_PUBLIC_UPLOADS_BASE_URL;
    } else if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    } else if (process.env.NEXT_PUBLIC_API_URL) {
      apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    } else if (typeof window !== 'undefined') {
      // En el navegador, detectar el entorno
      const isLocalhost = window.location.origin.includes('localhost') || 
                         window.location.origin.includes('127.0.0.1') ||
                         window.location.origin.includes('192.168.');
      apiBaseUrl = isLocalhost ? 'http://localhost:8080' : 'https://api.proptech.com.py';
    } else {
      // En el servidor (SSR), usar producción por defecto
      apiBaseUrl = 'https://api.proptech.com.py';
    }
    
    // Limpiar la URL base (remover trailing slash)
    apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
    
    // Manejar URLs de PropShots - convertir a ruta directa de uploads
    if (url.includes('/api/prop-shots/media/') || url.includes('/prop-shots/media/')) {
      const filename = url.split('/').pop();
      url = `/uploads/social/propshots/${filename}`;
    }
    
    // Si la URL ya empieza con /prop-shots/media/, convertirla a /uploads/social/propshots/
    if (url.startsWith('/prop-shots/media/')) {
      const filename = url.replace('/prop-shots/media/', '');
      url = `/uploads/social/propshots/${filename}`;
    }
    
    // Si solo es el nombre del archivo (sin ruta), agregar la ruta completa
    if (!url.startsWith('/') && !url.includes('/')) {
      url = `/uploads/social/propshots/${url}`;
    }
    
    // Construir URL completa
    const fullUrl = `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`;
    
    // Log para debugging en producción
    if (typeof window !== 'undefined' && !window.location.origin.includes('localhost')) {
      console.log('🔍 getFullUrl:', { original: url, full: fullUrl, apiBase: apiBaseUrl });
    }
    
    return fullUrl;
  };

  // Función para formatear fecha como Facebook
  const formatDateLikeFacebook = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `hace ${diffInDays} días`;
    if (diffInDays < 30) return `hace ${Math.floor(diffInDays / 7)} sem`;
    if (diffInDays < 365) return `hace ${Math.floor(diffInDays / 30)} mes`;
    return `hace ${Math.floor(diffInDays / 365)} año`;
  };

  // Redirigir a la galería existente (/social/gallery/[postId])
  const openImageGallery = (postId: number, imageIndex: number = 0) => {
    const target = imageIndex > 0 
      ? `/social/gallery/${postId}?i=${imageIndex}` 
      : `/social/gallery/${postId}`;
    if (typeof window !== 'undefined') {
      window.location.href = target;
    }
  };

  // Función para cerrar galería
  const closeImageGallery = () => {
    console.log('closeImageGallery called');
    setImageGallery(null);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="ml-4 text-gray-600">Cargando red social...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar posts</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Notificación de éxito */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold">¡Post creado exitosamente!</p>
              <p className="text-sm text-green-100">Tu publicación ya está visible en el feed.</p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-auto text-white hover:text-green-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Campo para crear post */}
      {isAuthenticated && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Botones de prueba temporal */}

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                    <textarea
                      value={newPost}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewPost(value);
                        const urls = detectUrls(value);
                        setDetectedUrls(urls);
                      }}
                      placeholder={`¿Qué quieres compartir, ${user?.fullName || 'Usuario'}?`}
                      className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                                        />
                    
                    {/* URLs detectadas en tiempo real */}
                    {detectedUrls.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                          </svg>
                          <span className="text-sm font-medium text-blue-800">Enlaces detectados:</span>
                        </div>
                        <div className="space-y-3">
                          {detectedUrls.map((url, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                                    {urlLoadingStates[url] ? (
                                      <span className="flex items-center text-blue-600">
                                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Cargando título...
                                      </span>
                                    ) : (
                                      urlTitles[url] || url
                                    )}
                                  </h4>
                                  <p className="text-xs text-gray-500 break-all">
                                    {url.startsWith('http') ? url : `https://${url}`}
                                  </p>
                                </div>
                                <a 
                                  href={url.startsWith('http') ? url : `https://${url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-3 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-indigo-700 transition-colors flex-shrink-0"
                                >
                                  Abrir
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ubicación detectada */}
                    {userLocation && (
                      <div className={`mt-3 p-3 border rounded-lg ${
                        userLocation.includes('GPS requerido') 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MapPin className={`w-4 h-4 mr-2 ${
                              userLocation.includes('GPS requerido') 
                                ? 'text-blue-600' 
                                : 'text-gray-600'
                            }`} />
                            <span className={`text-sm font-medium ${
                              userLocation.includes('GPS requerido') 
                                ? 'text-blue-800' 
                                : 'text-gray-800'
                            }`}>Ubicación:</span>
                            <span className={`text-sm ml-2 ${
                              userLocation.includes('GPS requerido') 
                                ? 'text-blue-700' 
                                : 'text-gray-700'
                            }`}>{userLocation}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={detectLocation}
                              disabled={locationLoading}
                              className={`text-xs underline disabled:opacity-50 ${
                                userLocation.includes('GPS requerido') 
                                  ? 'text-blue-600 hover:text-blue-800' 
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              {locationLoading ? 'Detectando...' : 'Redetectar'}
                            </button>
                            <div className="flex flex-col items-end">
                              <span className={`text-xs px-2 py-1 rounded-full mb-1 ${
                                userLocation.includes('GPS requerido') 
                                  ? 'text-blue-500 bg-blue-100' 
                                  : userLocation.includes('GPS no disponible') || userLocation.includes('Ubicación no disponible')
                                    ? 'text-gray-500 bg-gray-100'
                                    : 'text-green-500 bg-green-100'
                              }`}>
                                {userLocation.includes('GPS requerido') 
                                  ? 'GPS OBLIGATORIO' 
                                  : userLocation.includes('GPS no disponible') || userLocation.includes('Ubicación no disponible')
                                    ? 'IP'
                                    : 'GPS'
                                }
                              </span>
                              <span className={`text-xs ${
                                userLocation.includes('GPS requerido') 
                                  ? 'text-blue-400' 
                                  : userLocation.includes('GPS no disponible') || userLocation.includes('Ubicación no disponible')
                                    ? 'text-gray-400'
                                    : 'text-green-400'
                              }`}>
                                {userLocation.includes('GPS requerido') 
                                  ? 'Alta precisión requerida' 
                                  : userLocation.includes('GPS no disponible') || userLocation.includes('Ubicación no disponible')
                                    ? 'Baja precisión'
                                    : 'Alta precisión'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mensaje especial para Paraguay */}
                        {userLocation.includes('GPS requerido') && (
                          <div className="mt-2 p-2 bg-blue-100 border border-blue-200 rounded">
                            <p className="text-xs text-blue-800">
                              <strong>⚠️ Para Paraguay:</strong> Los servicios de IP siempre detectan Asunción (400km de error). 
                              <br />
                              <strong>✅ Solución:</strong> Permite acceso a GPS para ubicación precisa en tu ciudad.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                              {/* Preview de imágenes seleccionadas */}
                {postImagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {postImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removePostImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors cursor-pointer">
                      <Camera className="w-5 h-5" />
                      <span className="text-sm">Fotos (máx. 5)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handlePostImageSelect}
                      />
                    </label>
                    <button
                      onClick={openLocationPicker}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                      title="Seleccionar ubicación en mapa"
                    >
                      <MapPin className="w-5 h-5" />
                      <span className="text-sm">
                        {userLocation ? userLocation : 'Seleccionar ubicación'}
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Publicar
                  </button>
                </div>
                </div>
              </div>
        </div>
      )}

      {/* Mensaje de bienvenida para usuarios no autenticados */}
      {!isAuthenticated && (
        <div className="max-w-4xl mx-auto mb-4 px-2">
          <div className="w-full bg-white/70 backdrop-blur-md border border-gray-200 rounded-full shadow-sm px-3 sm:px-4 py-2 flex items-center justify-between">
            {/* Izquierda: avatar + texto */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px]">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">Únete a la red inmobiliaria</p>
                <p className="text-[10px] sm:text-xs text-gray-600 leading-tight mt-0.5">Explora y comparte propiedades</p>
              </div>
            </div>

            {/* Derecha: CTAs */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { if (typeof window !== 'undefined') window.location.href = '/login'; }}
                className="px-2.5 sm:px-3 py-1 rounded-full text-white bg-blue-600 hover:bg-indigo-700 text-[11px] sm:text-xs font-medium transition-colors"
              >
                Empezar ahora
              </button>
              <button
                onClick={() => { if (typeof window !== 'undefined') window.location.href = '/register'; }}
                className="px-2.5 sm:px-3 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-[11px] sm:text-xs"
              >
                Crear cuenta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PropShots */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
              PropShots
            </h3>
            <p className="text-gray-600 text-sm">Descubre propiedades en formato video</p>
          </div>
          <div className="flex items-center space-x-2">
            {isAuthenticated && (
                <button 
                onClick={() => setShowCreatePropShot(true)}
                className="text-gray-600 hover:text-blue-500 transition-colors font-medium flex items-center space-x-1 text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4v6h6c1.1 0 2 .9 2 2s-.9 2-2 2h-6v6c0 1.1-.9 2-2 2s-2-.9-2-2v-6H4c-1.1 0-2-.9-2-2s.9-2 2-2h6V4c0-1.1.9-2 2-2z"/>
                </svg>
                  <span>Publicar Tour</span>
              </button>
            )}
            <span className="text-gray-300">•</span>
                            <button
              onClick={() => {
                // Redirigir a la página de propshots
                if (typeof window !== 'undefined') {
                  window.location.href = '/social/propshots';
                }
              }}
              disabled={propShotsLoading || propShots.length === 0}
              className="text-gray-600 hover:text-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Ver todos los tours
                </button>
          </div>
              </div>
              
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {propShotsLoading ? (
            // Loading state
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[9/16] bg-gray-200 rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))
          ) : propShots.length > 0 ? (
            propShots.slice(0, 4).map((shot) => (
              <div 
                key={shot.id} 
                className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                onClick={() => {
                  setSelectedPropShot(shot);
                  handleViewPropShot(shot.id);
                }}
                  >
                    {/* Thumbnail del video */}
              <div className="relative mb-3">
                {shot.mediaUrl ? (
                  <div className="aspect-[9/16] rounded-xl overflow-hidden shadow-lg relative">
                    <video
                      src={getFullUrl(shot.mediaUrl)}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      onLoadedData={(e) => {
                        const videoElement = e.currentTarget;
                        videoElement.muted = true;
                        videoElement.play()
                      }}
                    />
                    
                    {/* Overlay de información */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                    
                    {/* Indicador de PropShot */}
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-bold shadow-lg">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                        </svg>
                            <span>Tour Virtual</span>
                      </div>
                    </div>
                    
                    {/* Duración del video */}
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded-lg font-medium pointer-events-none">
                      0:30
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[9/16] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl overflow-hidden shadow-lg">
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-6 h-6 text-blue-500 ml-1" />
                      </div>
                    </div>
                    
                    {/* Indicador de PropShot */}
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white text-xs rounded-full font-bold shadow-lg">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                        </svg>
                            <span>Tour Virtual</span>
                      </div>
                    </div>
                    
                    {/* Duración del video */}
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded-lg font-medium">
                      0:30
                    </div>
                  </div>
                )}
              </div>
                    
              {/* Información del PropShot */}
              <div className="px-1">
                <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                  {shot.title}
                      </h4>
                                <p className="text-gray-600 text-xs mb-2">
                  {shot.agentFirstName} {shot.agentLastName}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                                                  <span className="flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                            <span>{shot.shares || 0}</span>
                          </span>
                        <span className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                    <span>{shot.likes}</span>
                        </span>
                      </div>
                    </div>
                  </div>
          ))
          ) : (
            // Empty state
            <div className="col-span-full text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No hay tours virtuales aún</h4>
              <p className="text-gray-600">Crea tu primer tour virtual para mostrar propiedades</p>
            </div>
          )}
              </div>
                </div>

      {/* Estado vacío cuando no hay posts */}
      {!loading && !error && posts.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">¡Sé el primero en compartir!</h3>
            <p className="text-gray-600 mb-6">
              Aún no hay publicaciones en la red social. Crea el primer post y comienza a compartir propiedades con la comunidad.
            </p>
            {isAuthenticated && (
              <button 
                onClick={() => {
                  // Scroll hacia el área de crear post
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4v6h6c1.1 0 2 .9 2 2s-.9 2-2 2h-6v6c0 1.1-.9 2-2 2s-2-.9-2-2v-6H4c-1.1 0-2-.9-2-2s.9-2 2-2h6V4c0-1.1.9-2 2-2z"/>
                </svg>
                Crear primer post
              </button>
            )}
          </div>
        </div>
      )}

      {/* Posts en dos columnas - Mejorado */}
            {!loading && !error && posts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {posts.map((post) => (
            <div key={post.id} className="group bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Header del Post - Mejorado */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/30 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md ring-2 ring-blue-100">
                        {post.user?.firstName?.charAt(0) || post.user?.lastName?.charAt(0) || 'U'}
                      </div>
                      {/* Indicador de verificación */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Usuario'}
                        </h4>
                        {/* Badge de agente verificado */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-[10px] sm:text-xs rounded-full font-medium shadow-sm whitespace-nowrap">
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Agente Verificado
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mt-0.5">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>{formatDateLikeFacebook(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Menú de opciones (tres puntitos) */}
                  <div className="relative flex-shrink-0">
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === post.id ? null : post.id)}
                      className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </button>
                    
                    {/* Dropdown menu */}
                    {openDropdown === post.id && (
                      <>
                        {/* Overlay para cerrar el dropdown al hacer clic fuera */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setOpenDropdown(null)}
                        />
                        
                        {/* Menú dropdown */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          {/* Solo mostrar "Eliminar" si el usuario es el dueño del post */}
                          {(() => {
                            const isOwner = isAuthenticated && user && post.user && 
                                           Number(post.user.id) === Number(user.id);
                            // Debug activo para verificar la comparación
                            console.log('🔍 Debug Post', post.id, ':', {
                              postUserId: post.user?.id,
                              postUserIdType: typeof post.user?.id,
                              currentUserId: user?.id,
                              currentUserIdType: typeof user?.id,
                              isAuthenticated,
                              hasUser: !!user,
                              hasPostUser: !!post.user,
                              isOwner
                            });
                            return isOwner;
                          })() && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar post
                            </button>
                          )}
                          
                          {/* Separador solo si hay opción de eliminar */}
                          {(() => {
                            const isOwner = isAuthenticated && user && post.user && 
                                           Number(post.user.id) === Number(user.id);
                            return isOwner && <div className="border-t border-gray-200 my-1" />;
                          })()}
                          
                          {/* Otras opciones futuras pueden ir aquí */}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/social/posts/${post.id}`);
                              setOpenDropdown(null);
                              alert('Enlace copiado al portapapeles');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copiar enlace
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

                    {/* Contenido del Post */}
              <div className="p-4">

                
                {/* Imágenes del post */}
                {(() => {
                  const currentPostImages = postImages.get(post.id) || [];
                  if (currentPostImages && currentPostImages.length > 0) {
                    return (
                      <div className="mb-4">
                        {currentPostImages.length === 1 ? (
                          // Una sola imagen - mostrar grande
                          <div className="relative cursor-pointer overflow-hidden rounded-xl">
                            <img 
                              src={currentPostImages[0]} 
                              alt="Post image"
                              className="w-full h-80 object-cover rounded-xl hover:opacity-90 transition-opacity duration-200"
                              onClick={() => {
                                openImageGallery(post.id, 0);
                              }}
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/placeholder.jpg';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none" />
                          </div>
                        ) : currentPostImages.length === 2 ? (
                          // Dos imágenes - mostrar lado a lado
                          <div className="grid grid-cols-2 gap-3">
                            {currentPostImages.map((imageUrl, index) => (
                              <div key={index} className="relative cursor-pointer overflow-hidden rounded-xl">
                                <img 
                                  src={imageUrl} 
                                  alt={`Post image ${index + 1}`}
                                  className="w-full h-48 object-cover rounded-xl hover:opacity-90 transition-opacity duration-200"
                                  onClick={() => {
                                    openImageGallery(post.id, index);
                                  }}
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/images/placeholder.jpg';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none" />
                              </div>
                            ))}
                          </div>
                        ) : currentPostImages.length === 3 ? (
                          // Tres imágenes - primera grande, otras dos pequeñas
                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2 relative cursor-pointer overflow-hidden rounded-xl">
                              <img 
                                src={currentPostImages[0]} 
                                alt="Post image 1"
                                className="w-full h-48 object-cover rounded-xl hover:opacity-90 transition-opacity duration-200"
                                onClick={() => {
                                  openImageGallery(post.id, 0);
                                }}
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/images/placeholder.jpg';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none" />
                            </div>
                            <div className="space-y-3">
                              {currentPostImages.slice(1).map((imageUrl, index) => (
                                <div key={index + 1} className="relative cursor-pointer overflow-hidden rounded-xl">
                                  <img 
                                    src={imageUrl} 
                                    alt={`Post image ${index + 2}`}
                                    className="w-full h-20 object-cover rounded-xl hover:opacity-90 transition-opacity duration-200"
                                    onClick={() => {
                                      openImageGallery(post.id, index + 1);
                                    }}
                                    loading="lazy"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/images/placeholder.jpg';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          // Cuatro o más imágenes - grid 2x2
                          <div className="grid grid-cols-2 gap-3">
                            {currentPostImages.slice(0, 4).map((imageUrl, index) => (
                              <div key={index} className="relative cursor-pointer overflow-hidden rounded-xl">
                                <img 
                                  src={imageUrl} 
                                  alt={`Post image ${index + 1}`}
                                  className="w-full h-40 object-cover rounded-xl hover:opacity-90 transition-opacity duration-200"
                                  onClick={() => {
                                    openImageGallery(post.id, index);
                                  }}
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/images/placeholder.jpg';
                                  }}
                                />
                                {currentPostImages.length > 4 && index === 3 && (
                                  <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center pointer-events-none">
                                    <span className="text-white text-xl font-bold">
                                      +{currentPostImages.length - 4}
                                    </span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                                    })()}

                {/* Contenido/Descripción del Post - Mejorado */}
                {post.content && (
                  <div className="mb-4 px-1">
                    <div 
                      className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words"
                      style={{ wordBreak: 'break-word' }}
                      dangerouslySetInnerHTML={{ 
                        __html: convertUrlsToLinks(post.content) 
                      }}
                    />
                  </div>
                )}
                    </div>

              {/* Acciones del Post - Mejoradas */}
              <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-around sm:justify-start sm:space-x-8">
                  {/* Like Button */}
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="group/like flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300"
                  >
                    <div className="relative">
                      <ThumbsUp className="w-5 h-5 text-gray-600 group-hover/like:text-blue-500 group-hover/like:scale-110 transition-all duration-300" />
                      {(post.likesCount || 0) > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold">{post.likesCount > 99 ? '99+' : post.likesCount}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover/like:text-blue-600 hidden sm:inline">
                      {post.likesCount || 0}
                    </span>
                  </button>
                  
                  {/* Comment Button */}
                  <button 
                    onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="group/comment flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300"
                  >
                    <div className="relative">
                      <MessageSquare className="w-5 h-5 text-gray-600 group-hover/comment:text-blue-500 group-hover/comment:scale-110 transition-all duration-300" />
                      {(commentCounts[post.id] || 0) > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold">{commentCounts[post.id] > 99 ? '99+' : commentCounts[post.id]}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover/comment:text-blue-600 hidden sm:inline">
                      {commentCounts[post.id] || 0}
                    </span>
                  </button>
                  
                  {/* Share Button */}
                  <div className="relative">
                    <button 
                      onClick={() => setOpenShareMenu(openShareMenu === post.id ? null : post.id)}
                      className="group/share flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 transition-all duration-300"
                    >
                      <svg className="w-5 h-5 text-gray-600 group-hover/share:text-green-500 group-hover/share:scale-110 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-700 group-hover/share:text-green-600 hidden sm:inline">
                        Compartir
                      </span>
                    </button>
                    
                    {/* Menú de compartir */}
                    {openShareMenu === post.id && (
                      <>
                        {/* Overlay para cerrar */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setOpenShareMenu(null)}
                        />
                        
                        {/* Menú desplegable */}
                        <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-xs font-medium text-gray-500 uppercase">Compartir en</p>
                          </div>
                          
                          {/* WhatsApp */}
                          <button
                            onClick={() => handleShare(post.id, 'whatsapp')}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                          >
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700 font-medium">WhatsApp</span>
                          </button>
                          
                          {/* Facebook */}
                          <button
                            onClick={() => handleShare(post.id, 'facebook')}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                          >
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700 font-medium">Facebook</span>
                          </button>
                          
                          {/* Twitter */}
                          <button
                            onClick={() => handleShare(post.id, 'twitter')}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                          >
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700 font-medium">Twitter (X)</span>
                          </button>
                          
                          <div className="border-t border-gray-100 my-1"></div>
                          
                          {/* Copiar enlace */}
                          <button
                            onClick={() => handleShare(post.id, 'copy')}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                          >
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700 font-medium">Copiar enlace</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Comentarios */}
                    {showComments[post.id] && (
                <div className="border-t border-gray-200">
                  <CommentList postId={post.id} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

      {/* Modal de Mensajes */}
      {showMessages && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMessages(false)} />
          <div className="fixed right-4 top-20 w-96 bg-white rounded-lg shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Mensajes</h3>
                <button 
                  onClick={() => setShowMessages(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
        </div>
      </div>

            <div className="h-96 flex">
              {/* Lista de conversaciones */}
              <div className="w-1/2 border-r border-gray-200">
                <div className="p-3 space-y-2">
                  {conversations.map((conv) => (
                    <div 
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation === conv.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        conv.unread ? 'bg-blue-500' : 'bg-gray-400'
                      }`}>
                        {conv.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 truncate text-sm">{conv.name}</h5>
                        <p className="text-xs text-gray-600 truncate">{conv.lastMessage}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className="text-xs text-gray-500">{conv.lastMessageTime}</span>
                        {conv.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                      </div>
                  </div>
                  
              {/* Chat activo */}
              <div className="w-1/2">
                {selectedConversation ? (
                  <div className="h-full flex flex-col">
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {conversations.find(c => c.id === selectedConversation)?.avatar}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">
                          {conversations.find(c => c.id === selectedConversation)?.name}
                        </span>
                      </div>
                </div>
                
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {messages[selectedConversation]?.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-2 py-1 rounded-lg text-xs ${
                            msg.sent 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white text-gray-800'
                          }`}>
                            {msg.text}
                  </div>
                </div>
                      ))}
              </div>

                    <div className="p-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                                                 <input
                           type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Escribe un mensaje..."
                          className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button 
                          onClick={sendMessage}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
                        >
                          Enviar
                        </button>
                      </div>
                    </div>
                    </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                        </svg>
                  </div>
                      <p className="text-sm">Selecciona una conversación</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Modal PropShot reel */}
      {selectedPropShot && (
        <PropShotReelViewer
          initialPropShot={selectedPropShot}
          allPropShots={propShots}
          onLike={handleLikePropShot}
          onView={handleViewPropShot}
          onComment={handleCommentPropShot}
          getFullUrl={getFullUrl}
          onClose={() => setSelectedPropShot(null)}
        />
      )}

      {/* Modal de Crear PropShot */}
      {showCreatePropShot && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header fijo */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Crear PropShot</h3>
            <button
                  onClick={() => {
                    setShowCreatePropShot(false);
                    // Limpiar estados
                    setSelectedVideo(null);
                    setVideoPreview(null);
                    setSelectedThumbnail(null);
                    setThumbnailPreview(null);
                    setNewPropShot({ title: '', description: '', duration: '90:00', link: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
            </div>
            
            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto p-6">
                            {/* Área de video con upload funcional */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Video del PropShot</label>
                
                {videoPreview ? (
                  /* Preview del video seleccionado */
                  <div className="relative">
                    <video
                      src={videoPreview}
                      className="w-full aspect-[9/16] rounded-xl object-cover"
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      onLoadedData={(e) => {
                        const videoElement = e.currentTarget;
                        videoElement.muted = true;
                        videoElement.play()
                      }}
                    />
                    
                    {/* Botón de sonido */}
                    <button
                      onClick={() => {
                        const videoElement = document.querySelector('video') as HTMLVideoElement;
                        if (videoElement) {
                          if (videoElement.muted) {
                            videoElement.muted = false;
                          } else {
                            videoElement.muted = true;
                          }
                        }
                      }}
                      className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.5 4.14L19.5 3.14C19.9 2.74 20.5 2.74 20.9 3.14C21.3 3.54 21.3 4.14 20.9 4.54L19.9 5.54C19.5 5.94 18.9 5.94 18.5 5.54C18.1 5.14 18.1 4.54 18.5 4.14ZM15.5 7.14L16.5 6.14C16.9 5.74 17.5 5.74 17.9 6.14C18.3 6.54 18.3 7.14 17.9 7.54L16.9 8.54C16.5 8.94 15.9 8.94 15.5 8.54C15.1 8.14 15.1 7.54 15.5 7.14ZM12.5 10.14L13.5 9.14C13.9 8.74 14.5 8.74 14.9 9.14C15.3 9.54 15.3 10.14 14.9 10.54L13.9 11.54C13.5 11.94 12.9 11.94 12.5 11.54C12.1 11.14 12.1 10.54 12.5 10.14ZM9.5 13.14L10.5 12.14C10.9 11.74 11.5 11.74 11.9 12.14C12.3 12.54 12.3 13.14 11.9 13.54L10.9 14.54C10.5 14.94 9.9 14.94 9.5 14.54C9.1 14.14 9.1 13.14 9.5 13.14ZM6.5 16.14L7.5 15.14C7.9 14.74 8.5 14.74 8.9 15.14C9.3 15.54 9.3 16.14 8.9 16.54L7.9 17.54C7.5 17.94 6.9 17.94 6.5 17.54C6.1 17.14 6.1 16.14 6.5 16.14ZM3.5 19.14L4.5 18.14C4.9 17.74 5.5 17.74 5.9 18.14C6.3 18.54 6.3 19.14 5.9 19.54L4.9 20.54C4.5 20.94 3.9 20.94 3.5 20.54C3.1 20.14 3.1 19.14 3.5 19.14Z"/>
                      </svg>
                    </button>
                    
                    {/* Botón para cambiar video */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C13.1 2 14 2.9 14 4v6h6c1.1 0 2 .9 2 2s-.9 2-2 2h-6v6c0 1.1-.9 2-2 2s-2-.9-2-2v-6H4c-1.1 0-2-.9-2-2s.9-2 2-2h6V4c0-1.1.9-2 2-2z"/>
                        </svg>
                        <span>{selectedVideo?.name}</span>
                      </div>
                      
                        <button
                        onClick={() => {
                          setSelectedVideo(null);
                          setVideoPreview(null);
                          // Limpiar el input
                          const input = document.getElementById('video-upload') as HTMLInputElement;
                          if (input) input.value = '';
                        }}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        Cambiar video
                        </button>
                    </div>
                  </div>
                ) : (
                  /* Área de upload - TODO clickeable */
                  <label htmlFor="video-upload" className="aspect-[9/16] bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl border-2 border-dashed border-blue-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors group">
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      id="video-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          
                          setSelectedVideo(file);
                          
                          // Crear preview del video
                          const videoUrl = URL.createObjectURL(file);
                          setVideoPreview(videoUrl);
                          
                          // Log adicional para verificar que el estado se actualiza
                          setTimeout(() => {
                          }, 100);
                        }
                      }}
                    />
                    <div className="text-center">
                      <svg className="w-16 h-16 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C13.1 2 14 2.9 14 4v6h6c1.1 0 2 .9 2 2s-.9 2-2 2h-6v6c0 1.1-.9 2-2 2s-2-.9-2-2v-6H4c-1.1 0-2-.9-2-2s.9-2 2-2h6V4c0-1.1.9-2 2-2z"/>
                      </svg>
                      <p className="text-blue-600 font-medium text-lg">Seleccionar Video</p>
                      <p className="text-blue-500 text-sm mt-1">o arrastra y suelta aquí</p>
                      <p className="text-blue-400 text-xs mt-2">MP4, MOV • Máximo 100MB</p>
                    </div>
                  </label>
                )}
              </div>
              
              {/* Nota sobre thumbnail */}
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Thumbnail automático</p>
                      <p className="text-xs">Se generará automáticamente del video que subas</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Formulario */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título del PropShot *</label>
                  <input
                    type="text"
                    value={newPropShot.title}
                    onChange={(e) => setNewPropShot(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Casa en Las Mercedes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">{newPropShot.title.length}/100</p>
                      </div>
                      
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={newPropShot.description}
                    onChange={(e) => setNewPropShot(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe la propiedad, características principales, ubicación..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{newPropShot.description.length}/500</p>
                      </div>        
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enlace "Ver más"</label>
                  <input
                    type="url"
                    value={newPropShot.link}
                    onChange={(e) => setNewPropShot(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://ejemplo.com/propiedad"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enlace opcional para más información de la propiedad</p>
                </div>
                
                {/* Información adicional */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Consejos para un buen PropShot:</p>
                      <ul className="mt-2 space-y-1 text-xs">
                        <li>• Muestra la propiedad desde diferentes ángulos</li>
                        <li>• Incluye detalles importantes como habitaciones y baños</li>
                        <li>• Mantén el video estable y bien iluminado</li>
                        <li>• Usa un título atractivo y descriptivo</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botones de acción fijos */}
            <div className="p-6 border-t border-gray-200 bg-white">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreatePropShot(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePropShot}
                  disabled={!newPropShot.title.trim() || !selectedVideo || creatingPropShot}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {creatingPropShot ? 'Creando...' : 'Crear PropShot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Selector de Ubicación con Mapa */}
      {showLocationPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Seleccionar Ubicación</h3>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4">
              {/* Búsqueda por dirección */}
              <div className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Buscar dirección, ciudad, propiedad..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Buscar
                  </button>
                </div>
              </div>

              {/* Mapa */}
              <div className="bg-gray-100 rounded-lg h-96 mb-4 overflow-hidden">
                <LocationMap 
                  onLocationSelect={confirmSelectedLocation}
                  selectedLocation={selectedLocation}
                />
              </div>

              {/* Información de ubicación seleccionada */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center mb-2">
                  <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Ubicación Seleccionada:</span>
                </div>
                <p className="text-sm text-blue-700 font-medium">
                  {selectedLocation ? selectedLocation.address : 'Haz clic en el mapa para seleccionar una ubicación'}
                </p>
                {selectedLocation && selectedLocation.fullAddress && selectedLocation.fullAddress !== selectedLocation.address && (
                  <details className="mt-2">
                    <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-700">
                      📍 Ver dirección completa
                    </summary>
                    <p className="text-xs text-blue-500 mt-1 pl-4 border-l-2 border-blue-200">
                      {selectedLocation.fullAddress}
                    </p>
                  </details>
                )}
                {selectedLocation && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-blue-600">
                      Coordenadas: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                    <div className="text-xs text-blue-500">
                      <span className="font-medium">Formato:</span> Calle, Barrio, Ciudad
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLocationPicker(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => selectedLocation && confirmSelectedLocation(selectedLocation)}
                  disabled={!selectedLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirmar Ubicación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
