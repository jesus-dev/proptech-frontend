import { getEndpoint } from '@/lib/api-config';
import { apiClient } from '@/lib/api';

export interface UploadResponse {
  url: string;
  fileName: string;
}

export class ImageUploadService {
  /**
   * Upload a single image to the local file system
   */
  async uploadImage(file: File, subDirectory: string = 'properties'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);

    try {
      // axios detecta automáticamente FormData y configura el Content-Type correctamente
      const response = await apiClient.post(`/api/files/upload/${subDirectory}`, formData);

      return response.data;
    } catch (error: any) {
      let errorText = 'Unknown error';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorText = error.response.data;
        } else if (error.response.data.message) {
          errorText = error.response.data.message;
        } else if (error.response.data.error) {
          errorText = error.response.data.error;
        } else {
          errorText = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorText = error.message;
      }
      // Si el error contiene "Resource Endpoints", significa que el endpoint no existe (404)
      if (error.response?.status === 404 || (typeof errorText === 'string' && errorText.includes('Resource Endpoints'))) {
        errorText = `El endpoint de subida de archivos no está disponible. Verifica que el backend esté corriendo y que el endpoint /api/files/upload/${subDirectory} exista.`;
      }
      
      console.error('ImageUploadService - Upload error details:', {
        error,
        response: error.response,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        subDirectory
      });
      throw new Error(`Error uploading image: ${errorText}`);
    }
  }

  /**
   * Upload multiple images to the local file system
   */
  async uploadMultipleImages(files: File[], subDirectory: string = 'properties'): Promise<UploadResponse[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, subDirectory));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload property images (both featured and gallery)
   */
  async uploadPropertyImages(
    featuredImage: File | null,
    galleryImages: File[],
    propertyId?: string
  ): Promise<{ featuredImageUrl?: string; galleryImageUrls: string[] }> {
    const results: { featuredImageUrl?: string; galleryImageUrls: string[] } = {
      galleryImageUrls: []
    };

    // Upload featured image if provided
    if (featuredImage) {
      const subDirectory = propertyId ? `properties/${propertyId}` : 'properties';
      const featuredResult = await this.uploadImage(featuredImage, subDirectory);
      results.featuredImageUrl = featuredResult.url;
    }

    // Upload gallery images
    if (galleryImages.length > 0) {
      const subDirectory = propertyId ? `gallery/${propertyId}` : 'gallery';
      const galleryResults = await this.uploadMultipleImages(galleryImages, subDirectory);
      results.galleryImageUrls = galleryResults.map(result => result.url);
    }

    return results;
  }

  /**
   * Get the full URL for an uploaded image
   */
  getImageUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    return getEndpoint(url);
  }

  /**
   * Delete an image from the server
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract the path from the URL
      const url = new URL(imageUrl.startsWith('http') ? imageUrl : getEndpoint(imageUrl));
      const pathParts = url.pathname.split('/');
      const subDirectory = pathParts[pathParts.length - 2];
      const fileName = pathParts[pathParts.length - 1];

      await apiClient.delete(`/api/files/${subDirectory}/${fileName}`);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
}

// Create singleton instance
export const imageUploadService = new ImageUploadService();

export const uploadImage = async (file: File, propertyId: string): Promise<string> => {
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
};

export const saveImageReference = async (propertyId: string, imageUrl: string, isPrimary: boolean = false): Promise<void> => {
  try {
    await apiClient.post(`/api/properties/${propertyId}/images`, {
      imageUrl,
      fileName: imageUrl.split('/').pop(),
      isPrimary,
    });
  } catch (error: any) {
    throw new Error(error.response?.data || 'Failed to save image reference');
  }
}; 