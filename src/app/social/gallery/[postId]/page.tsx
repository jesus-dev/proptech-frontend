'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SocialService } from '@/services/socialService';
import { ArrowLeft, X, ChevronLeft, ChevronRight, ThumbsUp, MessageSquare, Share2, MoreHorizontal, Clock, MapPin, Maximize2, Minimize2 } from 'lucide-react';
import { CommentList } from '@/components/comments/CommentList';

interface Post {
  id: number;
  linkImage?: string;
  images?: string;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  createdAt: string;
  content?: string;
  likesCount: number;
  commentsCount: number;
  location?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
}

export default function GalleryPage() {
  const { postId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);

  useEffect(() => {
    if (postId) {
      loadPostData();
      const index = searchParams.get('index');
      if (index) {
        setCurrentIndex(parseInt(index));
      }
    }
  }, [postId]);

  // Atajos de teclado (solo si hay más de una imagen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return;
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          handleBack();
        }
      }
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, isFullscreen]);

  const loadPostData = async () => {
    try {
      setLoading(true);
      
      const allPosts = await SocialService.getPosts(0, 100);
      const foundPost = allPosts.find(p => p.id === Number(postId));
      
      if (!foundPost) {
        console.error('Post not found for ID:', postId);
        return;
      }
      
      setPost(foundPost);
      setCommentCount(foundPost.commentsCount || 0);
      
      const postImages = await SocialService.getPostImages(foundPost);
      
      if (postImages && postImages.length > 0) {
        setImages(postImages);
      }
      
    } catch (error) {
      console.error('Error loading post data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (images.length > 1) {
      setImageLoading(true);
      setImageDimensions(null);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setImageLoading(true);
      setImageDimensions(null);
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const goToImage = (index: number) => {
    setImageLoading(true);
    setImageDimensions(null);
    setCurrentIndex(index);
  };

  const handleBack = () => {
    router.back();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    setImageLoading(false);
  };

  const handleLike = async () => {
    if (!isAuthenticated || !user || !post) return;
    
    try {
      await SocialService.likePost({ postId: post.id, userId: user.id });
      setPost(prev => prev ? { ...prev, likesCount: (prev.likesCount || 0) + 1 } : null);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const formatDateLikeFacebook = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Justo ahora';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)} d`;
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 604800)} sem`;
    if (diffInSeconds < 31536000) return `hace ${Math.floor(diffInSeconds / 2592000)} mes`;
    return `hace ${Math.floor(diffInSeconds / 31536000)} año`;
  };

  const convertUrlsToLinks = (text: string): string => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-orange-500 hover:text-orange-600 underline">${url}</a>`;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="text-gray-700 text-lg">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-gray-900 text-xl font-semibold">Post no encontrado</div>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-full text-white transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900">Publicación</h1>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Galería de imágenes */}
          <div className="lg:col-span-2">
            {images.length > 0 ? (
              <div className="bg-black rounded-xl overflow-hidden shadow-lg">
                {/* Imagen principal */}
                <div 
                  className="relative bg-black flex items-center justify-center"
                  style={{
                    minHeight: imageDimensions 
                      ? `${Math.max(400, Math.min(800, (imageDimensions.height / imageDimensions.width) * 600))}px`
                      : '60vh'
                  }}
                >
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  <img
                    src={images[currentIndex]}
                    alt={`Imagen ${currentIndex + 1} de ${images.length}`}
                    className={`w-full h-full object-contain transition-opacity duration-300 ${
                      imageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    onLoad={handleImageLoad}
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.jpg';
                      setImageLoading(false);
                    }}
                  />

                  {/* Navegación en la imagen */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
                        disabled={imageLoading}
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </button>
                      
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
                        disabled={imageLoading}
                      >
                        <ChevronRight className="w-6 h-6 text-white" />
                      </button>

                      {/* Contador y botón fullscreen */}
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button
                          onClick={toggleFullscreen}
                          className="w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group"
                          title="Ver en pantalla completa (F)"
                        >
                          <Maximize2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                        </button>
                        <div className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                          {currentIndex + 1} / {images.length}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Miniaturas */}
                {images.length > 1 && (
                  <div className="bg-gray-900 p-4">
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentIndex
                              ? 'border-orange-500 ring-2 ring-orange-500/50'
                              : 'border-transparent hover:border-gray-600'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Miniatura ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <p className="text-gray-500">Este post no tiene imágenes</p>
              </div>
            )}
          </div>

          {/* Columna derecha - Detalles del post */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              {/* Header del usuario */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                    {post.user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Usuario'}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDateLikeFacebook(post.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                {post.location && (
                  <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{post.location}</span>
                  </div>
                )}
              </div>

              {/* Contenido del post */}
              {post.content && (
                <div className="p-4 border-b border-gray-200">
                  <div 
                    className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ 
                      __html: convertUrlsToLinks(post.content) 
                    }}
                  />
                </div>
              )}

              {/* Link preview */}
              {post.linkUrl && (
                <div className="p-4 border-b border-gray-200">
                  <a
                    href={post.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {post.linkImage && (
                      <img
                        src={post.linkImage}
                        alt={post.linkTitle || 'Link preview'}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    {post.linkTitle && (
                      <h4 className="font-semibold text-gray-900 mb-1">{post.linkTitle}</h4>
                    )}
                    {post.linkDescription && (
                      <p className="text-sm text-gray-600 line-clamp-2">{post.linkDescription}</p>
                    )}
                    <p className="text-xs text-orange-500 mt-1">{new URL(post.linkUrl).hostname}</p>
                  </a>
                </div>
              )}

              {/* Acciones */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-around">
                  <button
                    onClick={handleLike}
                    disabled={!isAuthenticated}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ThumbsUp className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{post.likesCount || 0}</span>
                  </button>
                  
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{commentCount}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Comentarios */}
              <div className="max-h-96 overflow-y-auto">
                {showComments && (
                  <CommentList
                    postId={post.id}
                    onCommentCountChange={setCommentCount}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Fullscreen */}
      {isFullscreen && images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          {/* Header fullscreen */}
          <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white font-medium">
                {currentIndex + 1} / {images.length}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group"
                  title="Salir de pantalla completa (Esc o F)"
                >
                  <Minimize2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </button>
                
                <button
                  onClick={toggleFullscreen}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group"
                >
                  <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>

          {/* Imagen fullscreen */}
          <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
            
            <img
              src={images[currentIndex]}
              alt={`Imagen ${currentIndex + 1} de ${images.length}`}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder.jpg';
                setImageLoading(false);
              }}
            />
          </div>

          {/* Navegación fullscreen */}
          {images.length > 1 && (
            <>
              {/* Zona táctil izquierda (mobile) */}
              <div 
                className="absolute left-0 top-0 w-1/4 h-full z-20 cursor-w-resize sm:hidden"
                onClick={prevImage}
              />
              
              {/* Zona táctil derecha (mobile) */}
              <div 
                className="absolute right-0 top-0 w-1/4 h-full z-20 cursor-e-resize sm:hidden"
                onClick={nextImage}
              />

              {/* Botones de navegación (desktop) */}
              <button
                onClick={prevImage}
                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center transition-all group"
                disabled={imageLoading}
              >
                <ChevronLeft className="w-7 h-7 text-white group-hover:-translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={nextImage}
                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center transition-all group"
                disabled={imageLoading}
              >
                <ChevronRight className="w-7 h-7 text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}

          {/* Indicadores fullscreen */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex justify-center items-center gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    disabled={imageLoading}
                    className={`transition-all duration-200 rounded-full ${
                      index === currentIndex 
                        ? 'w-8 h-2 bg-white' 
                        : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
