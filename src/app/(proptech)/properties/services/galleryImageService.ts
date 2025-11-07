import { getApiUrl, getEndpoint } from '@/lib/api-config';

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
  
  // Si es una URL relativa del backend (como /uploads/gallery/...), usar getEndpoint
  if (url.startsWith('/uploads/')) {
    return getEndpoint(url);
  }
  
  // Si ya es una URL de API, usar getEndpoint
  if (url.startsWith('/api/')) {
    return getEndpoint(url);
  }
  
  // Si es solo un nombre de archivo, asumir que está en la carpeta de archivos
  return getEndpoint(`/api/files/${url}`);
}

export async function getGalleryImages(propertyId: number | string): Promise<GalleryImage[]> {
  const apiUrl = getApiUrl();
  const fullUrl = `${apiUrl}/api/gallery-images/property/${propertyId}`;
  
  const res = await fetch(fullUrl);
  
  if (!res.ok) {
    if (res.status === 404) {
      // Si no hay imágenes, devolver array vacío
      return [];
    }
    console.error('GalleryImageService - Error response:', res.status, res.statusText);
    throw new Error('Error al obtener imágenes de galería');
  }
  const images = await res.json();
  
  // Convertir URLs relativas a completas
  return images.map((image: GalleryImage) => ({
    ...image,
    url: getFullImageUrl(image.url)
  }));
}

export async function uploadGalleryImage(propertyId: number | string, file: File): Promise<GalleryImage> {
  const apiUrl = getApiUrl();
  const fullUrl = `${apiUrl}/api/gallery-images/property/${propertyId}`;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  
  const res = await fetch(fullUrl, {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) {
    console.error('GalleryImageService - Upload error:', res.status, res.statusText);
    throw new Error('Error al subir imagen de galería');
  }
  const image = await res.json();
  
  // Convertir URL relativa a completa
  return {
    ...image,
    url: getFullImageUrl(image.url)
  };
}

export async function deleteGalleryImage(imageId: number | string): Promise<void> {
  const apiUrl = getApiUrl();
  const fullUrl = `${apiUrl}/api/gallery-images/${imageId}`;
  
  const res = await fetch(fullUrl, { method: 'DELETE' });
  
  if (!res.ok) {
    console.error('GalleryImageService - Delete error:', res.status, res.statusText);
    throw new Error('Error al eliminar imagen de galería');
  }
}

export async function setImageAsFeatured(imageId: number | string): Promise<void> {
  const apiUrl = getApiUrl();
  const fullUrl = `${apiUrl}/api/gallery-images/${imageId}/set-featured`;
  
  const res = await fetch(fullUrl, { method: 'PUT' });
  
  if (!res.ok) {
    console.error('GalleryImageService - Set featured error:', res.status, res.statusText);
    throw new Error('Error al establecer imagen destacada');
  }
}

export async function updateImageOrder(imageId: number | string, orderIndex: number): Promise<GalleryImage> {
  const apiUrl = getApiUrl();
  const fullUrl = `${apiUrl}/api/gallery-images/${imageId}/order?orderIndex=${orderIndex}`;
  
  const res = await fetch(fullUrl, { method: 'PUT' });
  
  if (!res.ok) {
    console.error('GalleryImageService - Update order error:', res.status, res.statusText);
    throw new Error('Error al actualizar orden de imagen');
  }
  
  const image = await res.json();
  return {
    ...image,
    url: getFullImageUrl(image.url)
  };
} 