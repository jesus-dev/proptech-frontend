import { config, getImageBaseUrl } from '@/config/environment';

const API_BASE_URL = config.API_BASE_URL;
const UPLOADS_BASE_URL = config.UPLOADS_BASE_URL;
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
    // Ensure we don't double-concatenate URLs
    let fullUrl;
    if (correctedPath.startsWith('/') && IMAGE_BASE_URL.endsWith('/')) {
      fullUrl = `${IMAGE_BASE_URL.slice(0, -1)}${correctedPath}`;
    } else {
      fullUrl = `${IMAGE_BASE_URL}${correctedPath}`;
    }
    
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
      const response = await fetch(imageUrl, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
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

  // Obtener todas las imágenes de un post con validación
  static async getPostImages(post: Post): Promise<string[]> {
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
      
      // Corregir rutas que tienen /uploads/network/network_ por /uploads/social/posts/
      if (normalized.includes('/uploads/network/network_')) {
        normalized = normalized.replace('/uploads/network/network_', '/uploads/social/posts/');
      }
      
      // Si la ruta no empieza con /uploads/, agregar el prefijo
      if (!normalized.startsWith('/uploads/')) {
        normalized = `/uploads/social/posts/${normalized}`;
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
      additionalImages.forEach((img, index) => {
        const normalizedPath = normalizeImagePath(img);
        const imageUrl = this.buildImageUrl(normalizedPath);
        console.log(`  Imagen ${index + 1}: ${img} -> ${normalizedPath} -> ${imageUrl}`);
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
      post.allImages.forEach((img, index) => {
        const normalizedPath = normalizeImagePath(img);
        const imageUrl = this.buildImageUrl(normalizedPath);
        console.log(`  Imagen ${index + 1}: ${img} -> ${normalizedPath} -> ${imageUrl}`);
        addImageIfNotDuplicate(imageUrl);
      });
    }
    
    console.log(`  - URLs únicas encontradas: ${images.length}`);
    console.log(`  - URLs: [${images.join(', ')}]`);
    
    // Validar que las imágenes existan (opcional, puede ser lento)
    const validImages: string[] = [];
    for (const imageUrl of images) {
      if (imageUrl && await this.checkImageExists(imageUrl)) {
        validImages.push(imageUrl);
      }
    }
    
    
    const result = validImages.length > 0 ? validImages : images; // Fallback a todas si la validación falla
    
    return result;
  }

  // Obtener todos los posts con paginación SIN CACHE (siempre desde BD)
  static async getPosts(page: number = 0, size: number = 20): Promise<Post[]> {
    // NO usar cache - siempre obtener datos frescos de la BD
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/social/posts?page=${page}&size=${size}`, {
        signal: AbortSignal.timeout(10000) // 10 segundos timeout
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener posts: ${response.status}`);
      }
      
      // Obtener el texto primero para poder manejarlo si falla el parsing
      const text = await response.text();
      
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
      const response = await fetch(`${API_BASE_URL}/api/social/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
        signal: AbortSignal.timeout(15000) // 15 segundos timeout
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear post: ${response.status}`);
      }
      
      // Ya no hay cache que limpiar - los datos siempre vienen de la BD
      
      return await response.json();
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // Eliminar un post
  static async deletePost(postId: number, userId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/social/posts/${postId}?userId=${userId}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permiso para eliminar este post');
        }
        throw new Error(`Error al eliminar post: ${response.status}`);
      }
      
      console.log('✅ Post eliminado correctamente');
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Dar like a un post con rate limiting
  static async likePost(likeData: LikePostRequest): Promise<void> {
    if (!this.checkRateLimit('like', likeData.userId.toString())) {
      throw new Error('Rate limit exceeded. Please wait before liking another post.');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/social/posts/${likeData.postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: likeData.userId }),
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        throw new Error(`Error al dar like: ${response.status}`);
      }
      
      // Ya no hay cache que limpiar - los datos siempre vienen de la BD
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  // Upload de imágenes para posts
  static async uploadPostImages(images: File[]): Promise<UploadImageResponse[]> {
    try {

      // const uploadPromises = images.map(async (image) => {
      //   const formData = new FormData();
      //   formData.append('image', image);
      //   formData.append('fileName', image.name);
      //   formData.append('fileType', 'post-image');
      // 
      //   const response = await fetch(`${API_BASE_URL}/api/social/posts/upload/images`, {
      //     method: 'POST',
      //     body: formData,
      //     signal: AbortSignal.timeout(30000) // 30 segundos para upload de imágenes
      //   });
      // 
      //   if (!response.ok) {
      //     throw new Error(`Error uploading image ${image.name}: ${response.status}`);
      //   }
      // 
      //   return await response.json();
      // });
      // 
      // return await Promise.all(uploadPromises);
      
      const uploadPromises = images.map(async (image) => {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('fileName', image.name);

        const response = await fetch(`${API_BASE_URL}/api/social/upload-image`, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(30000) // 30 segundos para upload de imágenes
        });

        if (!response.ok) {
          throw new Error(`Error uploading image ${image.name}: ${response.status}`);
        }

        const result = await response.json();
        return {
          url: result.fileUrl,
          fileName: result.fileName,
          fileSize: image.size,
          mimeType: image.type
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
      const response = await fetch(`${API_BASE_URL}/api/social/posts/${commentData.postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: commentData.userId, 
          content: commentData.content 
        }),
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        throw new Error(`Error al comentar: ${response.status}`);
      }
      
      // Ya no hay cache que limpiar - los datos siempre vienen de la BD
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
