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

  // Obtener todas las imágenes de un post con validación
  static async getPostImages(post: Post): Promise<string[]> {
    const images: string[] = [];
    const seenUrls = new Set<string>();
    const seenFileNames = new Set<string>(); // Para evitar duplicados por nombre de archivo
    
    console.log(`🔍 DEBUG getPostImages para post ${post.id}:`, {
      linkImage: post.linkImage,
      images: post.images,
      imageUrl: post.imageUrl,
      allImages: post.allImages,
      hasImage: post.hasImage
    });
    
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
        console.log(`❌ Imagen undefined o null ignorada`);
        return;
      }
      
      // Filtrar blob URLs (imágenes temporales que no funcionan)
      if (imageUrl.startsWith('blob:')) {
        console.log(`🚫 Blob URL ignorada (imagen temporal): ${imageUrl}`);
        return;
      }
      
      const fileName = getFileName(imageUrl);
      console.log(`🔍 Procesando imagen: ${imageUrl} (nombre: ${fileName})`);
      
      // Verificar si ya tenemos una imagen con el mismo nombre de archivo
      if (seenFileNames.has(fileName)) {
        console.log(`⚠️ Imagen con nombre duplicado ignorada: ${fileName} (${imageUrl})`);
        return;
      }
      
      // Verificar si ya tenemos la misma URL
      if (seenUrls.has(imageUrl)) {
        console.log(`⚠️ URL duplicada ignorada: ${imageUrl}`);
        return;
      }
      
      images.push(imageUrl);
      seenUrls.add(imageUrl);
      seenFileNames.add(fileName);
      console.log(`✅ Agregada imagen: ${imageUrl} (nombre: ${fileName})`);
    };
    
    // Agregar imagen principal si existe
    if (post.linkImage) {
      const normalizedPath = normalizeImagePath(post.linkImage);
      const mainImage = this.buildImageUrl(normalizedPath);
      console.log(`📸 Procesando linkImage: ${post.linkImage} -> ${normalizedPath} -> ${mainImage}`);
      addImageIfNotDuplicate(mainImage);
    }
    
    // Agregar imágenes adicionales si existen
    if (post.images) {
      const additionalImages = post.images.split(',').map(img => img.trim()).filter(img => img.length > 0);
      console.log(`🖼️ Procesando campo images: ${post.images} -> [${additionalImages.join(', ')}]`);
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
      console.log(`🖼️ Procesando imageUrl: ${post.imageUrl} -> ${normalizedPath} -> ${imageUrl}`);
      addImageIfNotDuplicate(imageUrl);
    }
    
    if (post.allImages && Array.isArray(post.allImages)) {
      console.log(`🖼️ Procesando allImages: [${post.allImages.join(', ')}]`);
      post.allImages.forEach((img, index) => {
        const normalizedPath = normalizeImagePath(img);
        const imageUrl = this.buildImageUrl(normalizedPath);
        console.log(`  Imagen ${index + 1}: ${img} -> ${normalizedPath} -> ${imageUrl}`);
        addImageIfNotDuplicate(imageUrl);
      });
    }
    
    console.log(`📊 Resumen del post ${post.id}:`);
    console.log(`  - URLs únicas encontradas: ${images.length}`);
    console.log(`  - URLs: [${images.join(', ')}]`);
    
    // Validar que las imágenes existan (opcional, puede ser lento)
    const validImages: string[] = [];
    for (const imageUrl of images) {
      if (imageUrl && await this.checkImageExists(imageUrl)) {
        validImages.push(imageUrl);
      }
    }
    
    console.log(`  - Imágenes válidas: ${validImages.length}`);
    console.log(`  - Imágenes válidas: [${validImages.join(', ')}]`);
    
    const result = validImages.length > 0 ? validImages : images; // Fallback a todas si la validación falla
    console.log(`🎯 Resultado final para post ${post.id}: ${result.length} imágenes`);
    
    return result;
  }

  // Obtener todos los posts con paginación y cache
  static async getPosts(page: number = 0, size: number = 20): Promise<Post[]> {
    const cacheKey = `posts:${page}:${size}`;
    const cached = imageCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return JSON.parse(cached.url); // Reutilizamos el campo url para los datos
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/social/posts?page=${page}&size=${size}`, {
        signal: AbortSignal.timeout(10000) // 10 segundos timeout
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener posts: ${response.status}`);
      }
      
      const posts = await response.json();
      

      
      // Guardar en cache
      imageCache.set(cacheKey, { 
        url: JSON.stringify(posts), 
        timestamp: Date.now(), 
        valid: true 
      });
      
      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
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
      
      // Limpiar cache de posts
      this.clearPostsCache();
      
      return await response.json();
    } catch (error) {
      console.error('Error creating post:', error);
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
      
      // Limpiar cache de posts
      this.clearPostsCache();
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
      
      // Limpiar cache de posts
      this.clearPostsCache();
    } catch (error) {
      console.error('Error commenting post:', error);
      throw error;
    }
  }

  // Limpiar cache de posts
  private static clearPostsCache(): void {
    for (const [key] of imageCache) {
      if (key.startsWith('posts:')) {
        imageCache.delete(key);
      }
    }
  }

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
