import { getImageBaseUrl } from '@/config/environment';
import { createTimeoutSignal } from '@/utils/createTimeoutSignal';
import { apiClient } from '@/lib/api';
import type { AxiosError } from 'axios';

const IMAGE_BASE_URL = getImageBaseUrl();

// Cache para imágenes para evitar requests repetidos
const imageCache = new Map<string, { url: string; timestamp: number; valid: boolean }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Rate limiting para evitar spam
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = { maxRequests: 10, windowMs: 60000 }; // 10 requests por minuto

export interface Post {
  id: number;
  content: string;
  userId: number;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  time?: string;
  location?: string;
  hasImage?: boolean;
  imageUrl?: string;
  allImages?: string[];
  likesCount: number;
  commentsCount: number;
  shares?: number;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImage?: string;
  images?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  userId: number;
  content: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImage?: string;
  images?: string[];
  location?: string;
}

export interface UploadImageResponse {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface LikePostRequest {
  postId: number;
  userId: number;
}

export interface CommentPostRequest {
  postId: number;
  userId: number;
  content: string;
}

export class SocialService {
  // Rate limiting helper
  private static checkRateLimit(action: string, userId: string): boolean {
    const key = `${action}:${userId}`;
    const now = Date.now();
    const userLimit = rateLimitMap.get(key);
    
    if (!userLimit || now > userLimit.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
      return true;
    }
    
    if (userLimit.count >= RATE_LIMIT.maxRequests) {
      return false;
    }
    
    userLimit.count++;
    return true;
  }

  // Construir URL completa de imagen con cache
  static buildImageUrl(imagePath: string | null | undefined): string | undefined {
    if (!imagePath) return undefined;
    
    // Si ya es una URL completa, devolverla tal como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si es un blob URL, devolverlo tal como está
    if (imagePath.startsWith('blob:')) {
      return imagePath;
    }
    
    // Verificar cache
    const cacheKey = `image:${imagePath}`;
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.url;
    }
    
    // Corregir rutas incorrectas del backend
    let correctedPath = imagePath;
    
    // Corregir rutas que tienen /uploads/network/network_ por /uploads/social/posts/
    if (correctedPath.includes('/uploads/network/network_')) {
      correctedPath = correctedPath.replace('/uploads/network/network_', '/uploads/social/posts/');
    }
    
    // Construir URL completa usando la base configurable
    const base = IMAGE_BASE_URL.endsWith('/') ? IMAGE_BASE_URL.slice(0, -1) : IMAGE_BASE_URL;
    const path = correctedPath.startsWith('/') ? correctedPath : `/${correctedPath}`;
    const fullUrl = `${base}${path}`;
    
    // Guardar en cache
    imageCache.set(cacheKey, { url: fullUrl, timestamp: Date.now(), valid: true });
    
    return fullUrl;
  }

  // Verificar si una imagen existe con cache
  static async checkImageExists(imageUrl: string): Promise<boolean> {
    const cacheKey = `exists:${imageUrl}`;
    const cached = imageCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.valid;
    }
    
    try {
      const signal = createTimeoutSignal(5000);
      const response = await fetch(imageUrl, {
        method: 'HEAD',
        ...(signal ? { signal } : {})
      });
      const exists = response.ok;
      
      // Guardar en cache
      imageCache.set(cacheKey, { url: imageUrl, timestamp: Date.now(), valid: exists });
      
      return exists;
    } catch (error) {
      // Guardar en cache como no válida
      imageCache.set(cacheKey, { url: imageUrl, timestamp: Date.now(), valid: false });
      return false;
    }
  }

  // Parsear posts individuales cuando el JSON completo está malformado
  private static parseIndividualPosts(text: string): Post[] {
    const validPosts: Post[] = [];
    
    // Eliminar corchetes iniciales y finales del array
    let arrayContent = text.trim();
    if (arrayContent.startsWith('[')) arrayContent = arrayContent.substring(1);
    if (arrayContent.endsWith(']')) arrayContent = arrayContent.substring(0, arrayContent.length - 1);
    
    // Dividir en objetos individuales usando una estrategia de conteo de llaves
    const postStrings: string[] = [];
    let currentPost = '';
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < arrayContent.length; i++) {
      const char = arrayContent[i];
      
      if (escapeNext) {
        currentPost += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        currentPost += char;
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        currentPost += char;
        continue;
      }
      
      if (!inString) {
        if (char === '{') {
          braceCount++;
          currentPost += char;
        } else if (char === '}') {
          braceCount--;
          currentPost += char;
          
          if (braceCount === 0 && currentPost.trim().length > 0) {
            postStrings.push(currentPost.trim());
            currentPost = '';
          }
        } else if (char !== ',' || braceCount > 0) {
          currentPost += char;
        }
      } else {
        currentPost += char;
      }
    }
    
    console.log(`📦 Se encontraron ${postStrings.length} objetos de post para parsear`);
    
    // Intentar parsear cada post individual
    let skippedPosts = 0;
    postStrings.forEach((postStr, index) => {
      try {
        const post = JSON.parse(postStr);
        validPosts.push(post);
      } catch (error: any) {
        skippedPosts++;
        console.warn(`⚠️ Post ${index + 1} omitido debido a error de parsing:`, error.message);
        
        // Intentar extraer el ID del post problemático
        const idMatch = postStr.match(/"id"\s*:\s*(\d+)/);
        if (idMatch) {
          console.warn(`   Post ID: ${idMatch[1]}`);
        }
      }
    });
    
    if (skippedPosts > 0) {
      console.warn(`⚠️ Se omitieron ${skippedPosts} posts con formato incorrecto`);
      console.warn(`✅ Se recuperaron ${validPosts.length} posts válidos`);
    }
    
    return validPosts;
  }

  // Obtener URLs de imágenes de un post (síncrono; sin peticiones al backend)
  static getPostImages(post: Post): string[] {
    const images: string[] = [];
    const seenUrls = new Set<string>();
    const seenFileNames = new Set<string>(); // Para evitar duplicados por nombre de archivo
    
    // Función helper para extraer nombre de archivo
    const getFileName = (imagePath: string): string => {
      return imagePath.split('/').pop() || imagePath;
    };
    
    // Función helper para normalizar ruta de imagen
    const normalizeImagePath = (imagePath: string): string => {
      let normalized = imagePath.trim();
      
      // Si ya es una URL completa, devolverla tal como está
      if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
        return normalized;
      }
      
      // Si es un blob URL, devolverlo tal como está
      if (normalized.startsWith('blob:')) {
        return normalized;
      }
      
      if (normalized.includes('/uploads/network/network_')) {
        normalized = normalized.replace(/\/uploads\/network\/network_/g, '/uploads/social/posts/');
      }
      if (!normalized.startsWith('/')) {
        normalized = normalized.startsWith('uploads/') ? `/${normalized}` : `/uploads/social/posts/${normalized}`;
      }
      return normalized;
    };
    
    // Función helper para agregar imagen sin duplicados
    const addImageIfNotDuplicate = (imageUrl: string | undefined) => {
      if (!imageUrl) {
        return;
      }
      
      // Filtrar blob URLs (imágenes temporales que no funcionan)
      if (imageUrl.startsWith('blob:')) {
        return;
      }
      
      const fileName = getFileName(imageUrl);
      
      // Verificar si ya tenemos una imagen con el mismo nombre de archivo
      if (seenFileNames.has(fileName)) {
        return;
      }
      
      // Verificar si ya tenemos la misma URL
      if (seenUrls.has(imageUrl)) {
        return;
      }
      
      images.push(imageUrl);
      seenUrls.add(imageUrl);
      seenFileNames.add(fileName);
    };
    
    // Agregar imagen principal si existe
    if (post.linkImage) {
      const normalizedPath = normalizeImagePath(post.linkImage);
      const mainImage = this.buildImageUrl(normalizedPath);
      addImageIfNotDuplicate(mainImage);
    }
    
    // Agregar imágenes adicionales si existen
    if (post.images) {
      const additionalImages = post.images.split(',').map(img => img.trim()).filter(img => img.length > 0);
      additionalImages.forEach((img) => {
        const normalizedPath = normalizeImagePath(img);
        const imageUrl = this.buildImageUrl(normalizedPath);
        addImageIfNotDuplicate(imageUrl);
      });
    }
    
    // Verificar otros campos de imagen
    if (post.imageUrl) {
      const normalizedPath = normalizeImagePath(post.imageUrl);
      const imageUrl = this.buildImageUrl(normalizedPath);
      addImageIfNotDuplicate(imageUrl);
    }
    
    if (post.allImages && Array.isArray(post.allImages)) {
      post.allImages.forEach((img) => {
        const normalizedPath = normalizeImagePath(img);
        const imageUrl = this.buildImageUrl(normalizedPath);
        addImageIfNotDuplicate(imageUrl);
      });
    }
    
    return images;
  }

  // Obtener un post por ID
  static async getPost(id: number): Promise<Post | null> {
    try {
      const signal = createTimeoutSignal(10000);
      const response = await apiClient.get<Post>(`/api/social/posts/${id}`, { signal });
      return response.data;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  }

  // Obtener todos los posts con paginación SIN CACHE (siempre desde BD)
  static async getPosts(page: number = 0, size: number = 20): Promise<Post[]> {
    // NO usar cache - siempre obtener datos frescos de la BD
    
    try {
      const signal = createTimeoutSignal(10000);
      const response = await apiClient.get(`/api/social/posts`, {
        params: { page, size },
        signal,
        responseType: 'text',
        transformResponse: [(data) => data]
      });

      const text = response.data as string;
      
      let posts: Post[];
      try {
        posts = JSON.parse(text);
      } catch (jsonError: any) {
        console.error('❌ Error parsing JSON:', jsonError.message);
        
        // Extraer información del error
        const errorMatch = jsonError.message.match(/position (\d+)/);
        const errorPosition = errorMatch ? parseInt(errorMatch[1]) : 0;
        
        // Mostrar contexto alrededor del error
        const contextStart = Math.max(0, errorPosition - 200);
        const contextEnd = Math.min(text.length, errorPosition + 200);
        const context = text.substring(contextStart, contextEnd);
        
        console.error('📍 Contexto del error (400 chars):');
        console.error(context);
        console.error('👆 El error está aproximadamente en el medio de este texto');
        
        // Intentar identificar el post problemático
        const postsBeforeError = text.substring(0, errorPosition);
        const postMatches = postsBeforeError.match(/"id":\s*\d+/g);
        if (postMatches && postMatches.length > 0) {
          const lastPostId = postMatches[postMatches.length - 1].match(/\d+/);
          console.error('🔍 El error probablemente está en el post con ID:', lastPostId ? lastPostId[0] : 'desconocido');
        }
        
        // ESTRATEGIA 1: Intentar limpiar el JSON
        console.log('🔧 Estrategia 1: Limpiando JSON...');
        try {
          const cleanedText = text
            .replace(/\r\n/g, '\\n')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\n')
            .replace(/\t/g, '\\t');
          
          posts = JSON.parse(cleanedText);
          console.log('✅ JSON limpiado y parseado exitosamente');
        } catch (secondError) {
          console.error('❌ Estrategia 1 falló');
          
          // ESTRATEGIA 2: Intentar parsear posts individuales
          console.log('🔧 Estrategia 2: Parseando posts individuales...');
          try {
            posts = this.parseIndividualPosts(text);
            console.log(`✅ Se recuperaron ${posts.length} posts válidos de forma individual`);
          } catch (thirdError) {
            console.error('❌ Estrategia 2 falló');
            console.error('💡 SOLUCIÓN: Ir al backend y revisar el post identificado arriba.');
            console.error('   El contenido del post probablemente tiene comillas o saltos de línea sin escapar.');
            // [[memory:10170653]] - Devolver array vacío en lugar de fallar
            return [];
          }
        }
      }
      
      // NO guardar en cache - siempre obtener datos frescos de la BD
      
      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      // [[memory:10170653]] - Devolver array vacío en lugar de lanzar error
      return [];
    }
  }

  // Crear un nuevo post con rate limiting
  static async createPost(postData: CreatePostRequest): Promise<Post> {
    if (!this.checkRateLimit('create', postData.userId.toString())) {
      throw new Error('Rate limit exceeded. Please wait before creating another post.');
    }
    
    try {
      const signal = createTimeoutSignal(15000);
      const response = await apiClient.post('/api/social/posts', postData, {
        signal,
      });

      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // Actualizar un post (solo campos enviados)
  static async updatePost(postId: number, data: { content?: string; location?: string; linkUrl?: string; linkTitle?: string; linkDescription?: string; linkImage?: string; images?: string }): Promise<Post> {
    try {
      const signal = createTimeoutSignal(10000);
      const response = await apiClient.put(`/api/social/posts/${postId}`, data, { signal });
      return response.data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  // Eliminar un post
  static async deletePost(postId: number, userId: number): Promise<void> {
    try {
      const signal = createTimeoutSignal(10000);
      await apiClient.delete(`/api/social/posts/${postId}`, {
        data: { userId },
        signal,
      });

      console.log('✅ Post eliminado correctamente');
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError?.response?.status === 403) {
        throw new Error('No tienes permiso para eliminar este post');
      }
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Dar like a un post con rate limiting
  static async likePost(likeData: LikePostRequest): Promise<{ likes: number }> {
    console.log('🔵 [SERVICE] likePost llamado con:', likeData);
    
    // Verificar rate limit (pero ser más permisivo)
    if (!this.checkRateLimit('like', likeData.userId.toString())) {
      console.warn('⚠️ [SERVICE] Rate limit alcanzado, pero continuando...');
      // No bloquear completamente, solo advertir
    }
    
    try {
      console.log('🔵 [SERVICE] Haciendo POST a /api/social/posts/' + likeData.postId + '/like');
      const signal = createTimeoutSignal(10000);
      const response = await apiClient.post(`/api/social/posts/${likeData.postId}/like`, { userId: likeData.userId }, {
        signal,
      });
      console.log('✅ [SERVICE] Respuesta del servidor:', response.data);
      
      // Retornar el nuevo conteo de likes
      return response.data as { likes: number };
    } catch (error: any) {
      console.error('❌ [SERVICE] Error liking post:', error);
      console.error('❌ [SERVICE] Error response:', error?.response?.data);
      console.error('❌ [SERVICE] Error status:', error?.response?.status);
      throw error;
    }
  }

  // Upload de imágenes para posts
  // Subida de imágenes igual que en gallery (FormData sin Content-Type manual para que axios ponga boundary)
  static async uploadPostImages(images: File[]): Promise<UploadImageResponse[]> {
    if (!images.length) return [];
    try {
      const uploadPromises = images.map(async (image) => {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('fileName', image.name);

        const signal = createTimeoutSignal(30000);
        const response = await apiClient.post<{ fileUrl: string; fileName: string; success?: boolean }>('/api/social/upload-image', formData, {
          signal
          // No enviar Content-Type: apiClient con FormData lo setea con boundary (ver lib/api.ts)
        });

        const data = response.data;
        return {
          url: data.fileUrl,
          fileName: data.fileName,
          fileSize: image.size,
          mimeType: image.type || ''
        };
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading post images:', error);
      throw new Error('Error al subir las imágenes del post');
    }
  }

  // Comentar un post con rate limiting
  static async commentPost(commentData: CommentPostRequest): Promise<void> {
    if (!this.checkRateLimit('comment', commentData.userId.toString())) {
      throw new Error('Rate limit exceeded. Please wait before commenting again.');
    }
    
    try {
      const signal = createTimeoutSignal(10000);
      const response = await apiClient.post(`/api/social/posts/${commentData.postId}/comments`, { 
          userId: commentData.userId, 
          content: commentData.content 
        }, {
        signal,
      });

      return response.data;
    } catch (error) {
      console.error('Error commenting post:', error);
      throw error;
    }
  }

  // Cache eliminado - los posts siempre se obtienen frescos de la BD
  // para evitar mezclar datos viejos con nuevos
  // El cache de imágenes (checkImageExists) se mantiene para optimizar validación

  // Limpiar cache expirado
  static cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of imageCache) {
      if (now - value.timestamp > CACHE_DURATION) {
        imageCache.delete(key);
      }
    }
  }

  // Obtener estadísticas de cache
  static getCacheStats(): { size: number; hitRate: number } {
    return {
      size: imageCache.size,
      hitRate: 0.8 // Placeholder, implementar lógica real si es necesario
    };
  }
}
