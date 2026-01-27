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

// Función helper para convertir URLs relativas a completas
function getFullImageUrl(url: string): string {
  if (!url) return '';
  
  // Si ya es una URL completa, devolverla tal como está
  if (url.startsWith('http')) {
    return url;
  }
  
  // Si es una URL relativa del backend (como /uploads/gallery/...), convertir a /api/files/
  if (url.startsWith('/uploads/')) {
    // Convertir /uploads/gallery/64/file.HEIC a /api/files/gallery/64/file.HEIC
    const pathWithoutUploads = url.substring('/uploads/'.length);
    return getEndpoint(`/api/files/${pathWithoutUploads}`);
  }
  
  // Si ya es una URL de API, usar getEndpoint
  if (url.startsWith('/api/')) {
    return getEndpoint(url);
  }
  
  // Si es solo un nombre de archivo, asumir que está en la carpeta de archivos
  return getEndpoint(`/api/files/${url}`);
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
    const response = await apiClient.post(`/api/gallery-images/property/${propertyId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
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