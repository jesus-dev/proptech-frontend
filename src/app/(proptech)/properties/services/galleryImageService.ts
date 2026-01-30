import { getApiUrl, getEndpoint } from '@/lib/api-config';
import { apiClient } from '@/lib/api';

// Servicio para manejar imágenes de galería asociadas a propiedades

export interface GalleryImage {
  id: number;
  propertyId: number;
  url: string;
  altText?: string;
  orderIndex?: number;
  fileSize?: number;
  isFeatured?: boolean;
}

// Base URL del API (sin barra final) para montar URLs de imágenes
function getBaseUrl(): string {
  const url = getApiUrl();
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

// Normaliza path de galería: /uploads/67/xxx -> /uploads/gallery/67/xxx (el backend guarda en gallery/{propertyId}/)
function normalizeGalleryPath(path: string): string {
  if (!path || !path.startsWith('/uploads/')) return path;
  const afterUploads = path.slice('/uploads/'.length);
  // Si es /uploads/{número}/{filename} sin "gallery", reescribir a /uploads/gallery/{número}/{filename}
  const galleryMatch = afterUploads.match(/^(\d+)\/([^/]+)$/);
  if (galleryMatch) {
    return `/uploads/gallery/${galleryMatch[1]}/${galleryMatch[2]}`;
  }
  return path;
}

// Función helper para convertir URLs relativas a completas.
// Siempre usar /uploads/ para mostrar imágenes (el backend las sirve en GET /uploads/{path}).
function getFullImageUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const base = getBaseUrl();

  // Si ya es una URL completa
  if (trimmed.startsWith('http')) {
    try {
      const u = new URL(trimmed);
      let path = u.pathname;
      // Reescribir .../api/files/67/... a .../uploads/properties/67/... para que carguen
      if (path.startsWith('/api/files/')) {
        const afterFiles = path.slice('/api/files/'.length);
        const rel = afterFiles.startsWith('properties/') ? afterFiles : `properties/${afterFiles}`;
        return `${u.origin}/uploads/${rel}`;
      }
      if (path.startsWith('/uploads/')) {
        path = normalizeGalleryPath(path);
        return `${u.origin}${path}`;
      }
    } catch {
      // ignorar
    }
    return trimmed;
  }

  // Rutas /uploads/ — normalizar gallery y añadir base
  if (trimmed.startsWith('/uploads/')) {
    const path = normalizeGalleryPath(trimmed);
    return `${base}${path}`;
  }

  // Paths /api/files/... — reescribir a /uploads/ para que carguen
  if (trimmed.startsWith('/api/files/')) {
    const afterFiles = trimmed.slice('/api/files/'.length);
    const rel = afterFiles.startsWith('properties/') ? afterFiles : `properties/${afterFiles}`;
    return `${base}/uploads/${rel}`;
  }

  if (trimmed.startsWith('/api/')) {
    return `${base}${trimmed}`;
  }

  return `${base}/uploads/${trimmed}`;
}

export async function getGalleryImages(propertyId: number | string): Promise<GalleryImage[]> {
  try {
    const response = await apiClient.get(`/api/gallery-images/property/${propertyId}`);
    const images = response.data;
    
    console.log('📥 Imágenes recibidas del backend:', images);
    
    // Convertir URLs relativas a completas
    const normalizedImages = images.map((image: GalleryImage) => {
      const normalizedUrl = getFullImageUrl(image.url);
      console.log('🔄 URL normalizada:', { original: image.url, normalized: normalizedUrl });
      return {
        ...image,
        url: normalizedUrl
      };
    });
    
    return normalizedImages;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    console.error('GalleryImageService - Error response:', error);
    throw new Error('Error al obtener imágenes de galería');
  }
}

export async function uploadGalleryImage(propertyId: number | string, file: File): Promise<GalleryImage> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  
  console.log('📤 Subiendo imagen:', { propertyId, fileName: file.name, fileSize: file.size });
  
  try {
    // El interceptor de apiClient detecta FormData automáticamente y configura el Content-Type con boundary
    const response = await apiClient.post(`/api/gallery-images/property/${propertyId}`, formData);
    
    const image = response.data;
    console.log('✅ Imagen subida, respuesta del backend:', image);
    
    // Convertir URL relativa a completa
    const normalizedUrl = getFullImageUrl(image.url);
    console.log('🔄 URL normalizada:', { original: image.url, normalized: normalizedUrl });
    
    return {
      ...image,
      url: normalizedUrl
    };
  } catch (error: any) {
    console.error('GalleryImageService - Upload error:', error.response?.data || error.message);
    throw new Error('Error al subir imagen de galería');
  }
}

export async function deleteGalleryImage(imageId: number | string): Promise<void> {
  try {
    await apiClient.delete(`/api/gallery-images/${imageId}`);
  } catch (error: any) {
    console.error('GalleryImageService - Delete error:', error);
    throw new Error('Error al eliminar imagen de galería');
  }
}

export async function setImageAsFeatured(imageId: number | string): Promise<void> {
  try {
    await apiClient.put(`/api/gallery-images/${imageId}/set-featured`);
  } catch (error: any) {
    console.error('GalleryImageService - Set featured error:', error);
    throw new Error('Error al establecer imagen destacada');
  }
}

export async function updateImageOrder(imageId: number | string, orderIndex: number): Promise<GalleryImage> {
  try {
    const response = await apiClient.put(`/api/gallery-images/${imageId}/order?orderIndex=${orderIndex}`);
    const image = response.data;
    return {
      ...image,
      url: getFullImageUrl(image.url)
    };
  } catch (error: any) {
    console.error('GalleryImageService - Update order error:', error);
    throw new Error('Error al actualizar orden de imagen');
  }
} 