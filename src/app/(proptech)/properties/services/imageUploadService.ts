import { getEndpoint } from '@/lib/api-config';

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

    const response = await fetch(getEndpoint(`/api/files/upload/${subDirectory}`), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error uploading image: ${errorText}`);
    }

    return response.json();
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

      const response = await fetch(getEndpoint(`/api/files/${subDirectory}/${fileName}`), {
        method: 'DELETE',
      });

      return response.ok;
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

  const response = await fetch(getEndpoint('/api/files/upload/properties'), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const result = await response.json();
  return result.url;
};

export const saveImageReference = async (propertyId: string, imageUrl: string, isPrimary: boolean = false): Promise<void> => {
  const response = await fetch(getEndpoint(`/api/properties/${propertyId}/images`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageUrl,
      fileName: imageUrl.split('/').pop(),
      isPrimary,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save image reference');
  }
}; 