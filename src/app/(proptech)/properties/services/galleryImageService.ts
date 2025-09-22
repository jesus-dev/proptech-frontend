import { getApiUrl, getEndpoint } from '@/lib/api-config';

// Servicio para manejar imágenes de galería asociadas a propiedades

export interface GalleryImage {
  id: number;
  propertyId: number;
  url: string;
  altText?: string;
  orderIndex?: number;
  fileSize?: number;
}

// Función helper para convertir URLs relativas a completas
function getFullImageUrl(url: string): string {
  if (!url) return '';
  
  // Si ya es una URL completa, devolverla tal como está
  if (url.startsWith('http')) {
    return url;
  }
  
  // Si es una URL relativa del backend, convertirla a URL completa
  if (url.startsWith('/api/')) {
    return getEndpoint(url);
  }
  
  // Si es solo un nombre de archivo, asumir que está en la carpeta de archivos
  return getEndpoint(`/api/files/${url}`);
}

export async function getGalleryImages(propertyId: number | string): Promise<GalleryImage[]> {
  const apiUrl = getApiUrl();
  const fullUrl = `${apiUrl}/api/gallery-images/property/${propertyId}`;
  console.log('GalleryImageService - API URL:', apiUrl);
  console.log('GalleryImageService - Full URL:', fullUrl);
  
  const res = await fetch(fullUrl);
  console.log('GalleryImageService - Response status:', res.status);
  
  if (!res.ok) {
    if (res.status === 404) {
      // Si no hay imágenes, devolver array vacío
      console.log('GalleryImageService - No images found, returning empty array');
      return [];
    }
    console.error('GalleryImageService - Error response:', res.status, res.statusText);
    throw new Error('Error al obtener imágenes de galería');
  }
  const images = await res.json();
  console.log('GalleryImageService - Images received:', images);
  
  // Convertir URLs relativas a completas
  return images.map((image: GalleryImage) => ({
    ...image,
    url: getFullImageUrl(image.url)
  }));
}

export async function uploadGalleryImage(propertyId: number | string, file: File): Promise<GalleryImage> {
  const apiUrl = getApiUrl();
  const fullUrl = `${apiUrl}/api/gallery-images/property/${propertyId}`;
  console.log('GalleryImageService - Upload URL:', fullUrl);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  
  const res = await fetch(fullUrl, {
    method: 'POST',
    body: formData,
  });
  
  console.log('GalleryImageService - Upload response status:', res.status);
  
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
  console.log('GalleryImageService - Delete URL:', fullUrl);
  
  const res = await fetch(fullUrl, { method: 'DELETE' });
  console.log('GalleryImageService - Delete response status:', res.status);
  
  if (!res.ok) {
    console.error('GalleryImageService - Delete error:', res.status, res.statusText);
    throw new Error('Error al eliminar imagen de galería');
  }
} 