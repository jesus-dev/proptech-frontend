import { getEndpoint } from '@/lib/api-config';
import { apiClient } from '@/lib/api';

export class ImageService {
  /**
   * Convert backend image URL to full URL
   */
  getFullImageUrl(imageUrl: string, propertyId?: string): string {
    if (!imageUrl) return '';
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a relative URL from backend (like /uploads/gallery/...), prepend the base URL
    if (imageUrl.startsWith('/uploads/')) {
      return `${getEndpoint(imageUrl)}`;
    }
    
    // If it's a relative URL from backend, prepend the base URL
    if (imageUrl.startsWith('/api/')) {
      return `${getEndpoint(imageUrl)}`;
    }
    
    // If we have a propertyId, use the gallery endpoint
    if (propertyId) {
      return `${getEndpoint(`/api/files/gallery/${propertyId}/${imageUrl}`)}`;
    }
    
    // If it's just a filename without propertyId, use the properties endpoint
    return `${getEndpoint(`/api/files/properties/${imageUrl}`)}`;
  }

  /**
   * Convert array of backend image objects to frontend image URLs
   */
  convertBackendImagesToUrls(backendImages: unknown[], propertyId?: string): string[] {
    if (!Array.isArray(backendImages)) {
      return [];
    }
    
    return backendImages
      .filter((img: any) => img && img.url)
      .map((img: any) => {
        // If the URL is already a full URL, return it as is
        if (img.url.startsWith('http')) {
          return img.url;
        }
        
        // If it's a relative URL, convert it to full URL
        if (img.url.startsWith('/')) {
          return getEndpoint(img.url);
        }
        
        // If it's just a filename, use the appropriate endpoint
        return this.getFullImageUrl(img.url, propertyId);
      });
  }

  /**
   * Get featured image URL from backend images
   */
  getFeaturedImageUrl(backendImages: unknown[]): string {
    if (!Array.isArray(backendImages)) return '';
    
    const featuredImage = backendImages.find(img => 
      typeof img === 'object' && img !== null && 'isPrimary' in img && (img as any).isPrimary
    );
    
    if (featuredImage && typeof featuredImage === 'object' && 'url' in featuredImage) {
      return this.getFullImageUrl((featuredImage as any).url);
    }
    
    // If no primary image, return the first one
    if (backendImages.length > 0) {
      const firstImage = backendImages[0];
      const url = typeof firstImage === 'string' ? firstImage : 
                  (typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage) ? 
                  (firstImage as any).url : '';
      return this.getFullImageUrl(url);
    }
    
    return '';
  }

  /**
   * Get gallery images URLs (excluding featured image)
   */
  getGalleryImageUrls(backendImages: unknown[]): string[] {
    if (!Array.isArray(backendImages)) return [];
    
    return backendImages
      .filter(img => {
        // Exclude primary image from gallery
        if (typeof img === 'object' && img !== null && 'isPrimary' in img && (img as any).isPrimary) {
          return false;
        }
        return true;
      })
      .map(img => {
        const url = typeof img === 'string' ? img : 
                   (typeof img === 'object' && img !== null && 'url' in img) ? 
                   (img as any).url : '';
        return this.getFullImageUrl(url);
      })
      .filter(url => url);
  }

  async uploadImage(file: File, propertyId: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);

    try {
      // axios detecta automáticamente FormData y configura el Content-Type correctamente
      const response = await apiClient.post('/api/files/upload/properties', formData);
      return response.data.url;
    } catch (error: any) {
      throw new Error(error.response?.data || 'Failed to upload image');
    }
  }

  async saveImageReference(propertyId: string, imageUrl: string, isPrimary: boolean = false): Promise<void> {
    try {
      await apiClient.post(`/api/properties/${propertyId}/images`, {
        imageUrl,
        fileName: imageUrl.split('/').pop(),
        isPrimary,
      });
    } catch (error: any) {
      throw new Error(error.response?.data || 'Failed to save image reference');
    }
  }
}

// Create singleton instance
export const imageService = new ImageService(); 