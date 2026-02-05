'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SocialService } from '@/services/socialService';
import { getEndpoint } from '@/lib/api-config';
import { decodePostSlug } from '@/lib/post-slug';
import { ArrowLeft, X, ChevronLeft, ChevronRight, ThumbsUp, MessageSquare, Share2, Clock, MapPin, Maximize2, Minimize2 } from 'lucide-react';
import { CommentList } from '@/components/comments/CommentList';

interface Post {
  id: number;
  linkImage?: string;
  images?: string;
  user?: { id: number; firstName?: string; lastName?: string; email?: string };
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
  const params = useParams();
  const slug = params?.postId as string | undefined;
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
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const getFullImageUrl = useCallback((url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
    return getEndpoint(url.startsWith('/') ? url : `/${url}`);
  }, []);

  useEffect(() => {
    const index = searchParams?.get('i') ?? searchParams?.get('index');
    if (index) {
      const n = parseInt(index, 10);
      if (!Number.isNaN(n)) setCurrentIndex(n);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    const id = decodePostSlug(slug);
    if (id == null) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    SocialService.getPost(id)
      .then((foundPost) => {
        if (cancelled || !foundPost) return;
        setPost(foundPost);
        setCommentCount(foundPost.commentsCount || 0);
        const postImages = SocialService.getPostImages(foundPost);
        if (postImages?.length) {
          setImages(postImages);
        } else {
          const toPath = (p: string) => {
            const t = p.trim();
            if (!t) return '';
            if (t.startsWith('/')) return t;
            if (t.startsWith('uploads/')) return `/${t}`;
            return `/uploads/social/posts/${t}`;
          };
          const fallback: string[] = [];
          if (foundPost.linkImage) {
            const path = toPath(foundPost.linkImage);
            if (path) fallback.push(getFullImageUrl(path));
          }
          if (foundPost.images) {
            foundPost.images.split(',').map((s) => toPath(s)).filter(Boolean).forEach((path) => fallback.push(getFullImageUrl(path)));
          }
          if (fallback.length) setImages(fallback);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug, getFullImageUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return;
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        else handleBack();
      }
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, isFullscreen]);

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
    // Use referrer to check if user came from same site, otherwise go to /yvu
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    const isSameOrigin = referrer && referrer.includes(window.location.origin);
    if (isSameOrigin && window.history.length > 2) {
      router.back();
    } else {
      router.push('/yvu');
    }
  };
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoading(false);
  };
  const handleLike = async () => {
    if (!isAuthenticated || !user || !post) return;
    try {
      await SocialService.likePost({ postId: post.id, userId: user.id });
      setPost((prev) => (prev ? { ...prev, likesCount: (prev.likesCount || 0) + 1 } : null));
    } catch (_) {}
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
  const convertUrlsToLinks = (text: string): string =>
    text.replace(/(https?:\/\/[^\s]+)/g, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 underline">${url}</a>`);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="w-14 h-14 border-[3px] border-slate-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-gray-400 font-medium">Cargando publicación...</p>
        </div>
      </div>
    );
  }
  if (!slug || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-black flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-5 max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-slate-500 dark:text-gray-400" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Post no encontrado</h1>
          <p className="text-slate-600 dark:text-gray-400 text-sm">
            El enlace puede ser incorrecto o la publicación ya no existe.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <button onClick={handleBack} className="px-5 py-2.5 bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-slate-800 dark:text-gray-200 rounded-xl font-medium transition-colors">
              Volver
            </button>
            <button
              onClick={() => router.push('/yvu/gallery')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all"
            >
              Ir a galería
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black lg:bg-gradient-to-b lg:from-slate-50 lg:to-slate-100 dark:lg:from-gray-900 dark:lg:to-black overflow-hidden">
      <main className="flex-1 min-h-0 flex flex-col w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] flex-1 min-h-0 h-full items-stretch w-full">
          {/* Imagen principal - usa todo el espacio disponible */}
          <div className="flex flex-col min-h-0 h-full">
            {images.length > 0 ? (
              <div className="bg-black flex-1 min-h-0 flex flex-col h-full">
                <div className="relative flex-1 min-h-0 flex items-center justify-center bg-black">
                  <button onClick={handleBack} className="absolute top-3 left-3 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all active:scale-95" aria-label="Volver">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                      <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                  <img
                    src={getFullImageUrl(images[currentIndex])}
                    alt={`Imagen ${currentIndex + 1} de ${images.length}`}
                    className={`max-w-full max-h-full w-auto h-auto object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={handleImageLoad}
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.jpg';
                      setImageLoading(false);
                    }}
                  />
                  {images.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-50" disabled={imageLoading} aria-label="Anterior">
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </button>
                      <button onClick={nextImage} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-50" disabled={imageLoading} aria-label="Siguiente">
                        <ChevronRight className="w-6 h-6 text-white" />
                      </button>
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2">
                        <button onClick={toggleFullscreen} className="w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group" title="Pantalla completa (F)">
                          <Maximize2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                        </button>
                        <span className="px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white text-sm font-medium">{currentIndex + 1} / {images.length}</span>
                      </div>
                    </>
                  )}
                  {images.length === 1 && (
                    <button onClick={toggleFullscreen} className="absolute top-3 right-3 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group" title="Pantalla completa (F)">
                      <Maximize2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </button>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="p-2 bg-black/80 flex-shrink-0">
                    <div className="flex gap-1.5 overflow-x-auto justify-center">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded overflow-hidden transition-all ${index === currentIndex ? 'ring-2 ring-white opacity-100' : 'opacity-50 hover:opacity-80'}`}
                        >
                          <img src={getFullImageUrl(img)} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative bg-black h-full flex flex-col items-center justify-center">
                <button onClick={handleBack} className="absolute top-3 left-3 p-2 rounded-full hover:bg-white/10 text-white" aria-label="Volver">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <p className="text-gray-400">Este post no tiene imágenes</p>
              </div>
            )}
          </div>

          {/* Panel lateral - ancho fijo reducido */}
          <div className="hidden lg:flex lg:flex-col lg:min-w-0 h-full">
            <div className="bg-white dark:bg-gray-800/60 h-full flex flex-col overflow-y-auto">
              <div className="p-3 border-b border-slate-100 dark:border-gray-700/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/30 flex-shrink-0">
                    {post.user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-slate-900 dark:text-white truncate text-sm">
                      {post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Usuario'}
                    </h2>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>{formatDateLikeFacebook(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {post.location && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 dark:text-gray-400">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{post.location}</span>
                  </div>
                )}
              </div>
              {post.content && (
                <div className="p-3 border-b border-slate-100 dark:border-gray-700/70">
                  <div className="text-slate-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words text-sm" dangerouslySetInnerHTML={{ __html: convertUrlsToLinks(post.content) }} />
                </div>
              )}
              {post.linkUrl && (
                <div className="p-3 border-b border-slate-100 dark:border-gray-700/70">
                  <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="block rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700/50 p-2 -m-2 transition-colors">
                    {post.linkImage && (
                      <img src={getFullImageUrl(post.linkImage.startsWith('/') ? post.linkImage : `/${post.linkImage}`)} alt={post.linkTitle || 'Link'} className="w-full h-24 object-cover rounded-lg mb-2" />
                    )}
                    {post.linkTitle && <h4 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm">{post.linkTitle}</h4>}
                    {post.linkDescription && <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-2">{post.linkDescription}</p>}
                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">{new URL(post.linkUrl).hostname}</p>
                  </a>
                </div>
              )}
              <div className="p-2 border-b border-slate-100 dark:border-gray-700/70">
                <div className="flex items-center justify-around">
                  <button onClick={handleLike} disabled={!isAuthenticated} className="flex items-center gap-1.5 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700/70 transition-colors disabled:opacity-50 text-slate-700 dark:text-gray-300">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{post.likesCount || 0}</span>
                  </button>
                  <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-1.5 px-2 py-2 rounded-lg transition-colors ${showComments ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-gray-700/70 text-slate-700 dark:text-gray-300'}`}>
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">{commentCount}</span>
                  </button>
                  <button className="flex items-center gap-1.5 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700/70 transition-colors text-slate-700 dark:text-gray-300" aria-label="Compartir">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className={showComments ? 'flex-1 min-h-0 overflow-y-auto' : ''}>
                {showComments && <CommentList postId={post.id} onCommentCountChange={setCommentCount} />}
              </div>
            </div>
          </div>
        </div>
      </main>

      {isFullscreen && images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white font-medium">{currentIndex + 1} / {images.length}</div>
              <div className="flex items-center gap-2">
                <button onClick={toggleFullscreen} className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group" title="Salir de pantalla completa (Esc o F)">
                  <Minimize2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </button>
                <button onClick={toggleFullscreen} className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group">
                  <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
            <img
              src={getFullImageUrl(images[currentIndex])}
              alt={`Imagen ${currentIndex + 1} de ${images.length}`}
              className={`max-w-full max-h-full w-auto h-auto object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={handleImageLoad}
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder.jpg';
                setImageLoading(false);
              }}
            />
          </div>
          {images.length > 1 && (
            <>
              <div className="absolute left-0 top-0 w-1/4 h-full z-20 cursor-w-resize sm:hidden" onClick={prevImage} />
              <div className="absolute right-0 top-0 w-1/4 h-full z-20 cursor-e-resize sm:hidden" onClick={nextImage} />
              <button onClick={prevImage} className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center transition-all group" disabled={imageLoading}>
                <ChevronLeft className="w-7 h-7 text-white group-hover:-translate-x-1 transition-transform" />
              </button>
              <button onClick={nextImage} className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center transition-all group" disabled={imageLoading}>
                <ChevronRight className="w-7 h-7 text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex justify-center items-center gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    disabled={imageLoading}
                    className={`transition-all duration-200 rounded-full ${index === currentIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'}`}
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
