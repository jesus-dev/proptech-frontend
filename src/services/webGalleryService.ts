import { apiClient } from '@/lib/api';
import { getEndpoint } from '@/lib/api-config';

export interface Gallery {
  id: number;
  title: string;
  description?: string;
  photos: GalleryPhoto[];
  createdById?: number;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
  isPublished: boolean;
  viewsCount: number;
  photoCount: number;
}

export interface GalleryPhoto {
  id: number;
  galleryId: number;
  url: string;
  fileName?: string;
  altText?: string;
  orderIndex: number;
  createdAt: string;
}

export interface CreateGalleryData {
  title: string;
  description?: string;
}

export interface UpdateGalleryData {
  title?: string;
  description?: string;
  isPublished?: boolean;
}

class WebGalleryService {
  // Public endpoints
  async getPublishedGalleries(): Promise<Gallery[]> {
    const response = await apiClient.get<Gallery[]>('/api/cms/galleries/public');
    return response.data || [];
  }

  async getPublishedGalleryById(id: number): Promise<Gallery> {
    const response = await apiClient.get<Gallery>(`/api/cms/galleries/public/${id}`);
    return response.data;
  }

  // Protected endpoints (require authentication)
  async getMyGalleries(): Promise<Gallery[]> {
    const response = await apiClient.get<Gallery[]>('/api/cms/galleries/my-galleries');
    return response.data || [];
  }

  async getGalleryById(id: number): Promise<Gallery> {
    const response = await apiClient.get<Gallery>(`/api/cms/galleries/${id}`);
    return response.data;
  }

  async createGallery(data: CreateGalleryData): Promise<Gallery> {
    const response = await apiClient.post<Gallery>('/api/cms/galleries', data);
    return response.data;
  }

  async updateGallery(id: number, data: UpdateGalleryData): Promise<Gallery> {
    const response = await apiClient.put<Gallery>(`/api/cms/galleries/${id}`, data);
    return response.data;
  }

  async deleteGallery(id: number): Promise<void> {
    await apiClient.delete(`/api/cms/galleries/${id}`);
  }

  async uploadPhoto(galleryId: number, file: File): Promise<GalleryPhoto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);

    const headers: Record<string, string> = {};
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && token !== 'undefined' && token !== 'null') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const selectedTenant = typeof window !== 'undefined' ? localStorage.getItem('selectedTenant') : null;
    if (selectedTenant) {
      try {
        const tenant = JSON.parse(selectedTenant);
        if (tenant?.id && tenant.id !== 0 && tenant.id != null) {
          headers['X-Selected-Tenant-Id'] = String(tenant.id);
        }
      } catch (_) {}
    }

    const res = await fetch(getEndpoint(`/api/cms/galleries/${galleryId}/photos`), {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || 'Error al subir la foto');
    }

    return (await res.json()) as GalleryPhoto;
  }

  async deletePhoto(photoId: number): Promise<void> {
    await apiClient.delete(`/api/cms/galleries/photos/${photoId}`);
  }
}

export const webGalleryService = new WebGalleryService();

