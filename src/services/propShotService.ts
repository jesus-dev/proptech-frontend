/**
 * Servicio de PropShots
 * Usa apiClient que YA TIENE reintentos automáticos
 */

import { apiClient } from '@/lib/api';

export interface PropShot {
  id: number;
  title: string;
  description: string;
  mediaUrl?: string;
  linkUrl?: string;
  agentId?: number;
  agentFirstName?: string;
  agentLastName?: string;
  agentEmail?: string;
  agentPhoto?: string;
  likes: number;
  comments?: number;
  shares?: number;
  views?: number;
  createdAt: string;
  updatedAt: string;
  status?: string;
}

export interface CreatePropShotRequest {
  title: string;
  description: string;
  duration: string;
  link?: string;
  videoFile: File;
  thumbnailFile?: File;
  userId: number;
}

export interface UpdatePropShotRequest {
  title?: string;
  description?: string;
  link?: string;
  thumbnailFile?: File;
}

export interface UploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface PropShotComment {
  id: number;
  propShotId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
}

export class PropShotService {
  static async getPropShots(): Promise<PropShot[]> {
    try {
      const response = await apiClient.get('/api/social/propshots');
      return response.data;
    } catch (error) {
      console.error('Error fetching PropShots:', error);
      return [];
    }
  }

  static async getPropShotById(id: number): Promise<PropShot> {
    try {
      const response = await apiClient.get(`/api/social/propshots/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching PropShot:', error);
      throw new Error('Error al cargar el PropShot');
    }
  }

  static async uploadVideo(videoFile: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('fileName', videoFile.name);
      
      const response = await apiClient.post('/api/social/propshots/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const videoUrl = typeof response.data === 'string' ? response.data : response.data.url;
      
      return {
        url: videoUrl,
        fileName: videoFile.name,
        fileSize: videoFile.size,
        mimeType: videoFile.type
      };
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error('Error al subir el video');
    }
  }

  static async uploadThumbnail(thumbnailFile: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('thumbnail', thumbnailFile);
      formData.append('fileName', thumbnailFile.name);
      
      const response = await apiClient.post('/api/social/propshots/upload/thumbnail', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const thumbnailUrl = typeof response.data === 'string' ? response.data : response.data.url;
      
      return {
        url: thumbnailUrl,
        fileName: thumbnailFile.name,
        fileSize: thumbnailFile.size,
        mimeType: thumbnailFile.type
      };
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      throw new Error('Error al subir el thumbnail');
    }
  }

  static async createPropShot(data: CreatePropShotRequest): Promise<PropShot> {
    try {
      const videoUpload = await this.uploadVideo(data.videoFile);
      
      let thumbnailUpload: UploadResponse | null = null;
      if (data.thumbnailFile) {
        thumbnailUpload = await this.uploadThumbnail(data.thumbnailFile);
      }

      const propShotData = {
        title: data.title,
        description: data.description,
        duration: data.duration,
        link: data.link,
        videoUrl: videoUpload.url,
        thumbnailUrl: thumbnailUpload?.url || null,
        userId: data.userId
      };
      
      const response = await apiClient.post('/api/social/propshots', propShotData);
      return response.data;
    } catch (error) {
      console.error('Error creating PropShot:', error);
      throw new Error('Error al crear el PropShot');
    }
  }

  static async updatePropShot(id: number, data: UpdatePropShotRequest): Promise<PropShot> {
    try {
      const updateData: any = { ...data };
      
      if (data.thumbnailFile) {
        const thumbnailUpload = await this.uploadThumbnail(data.thumbnailFile);
        updateData.thumbnailUrl = thumbnailUpload.url;
        delete updateData.thumbnailFile;
      }
      
      const response = await apiClient.put(`/api/social/propshots/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating PropShot:', error);
      throw new Error('Error al actualizar el PropShot');
    }
  }

  static async deletePropShot(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/social/propshots/${id}`);
    } catch (error) {
      console.error('Error deleting PropShot:', error);
      throw new Error('Error al eliminar el PropShot');
    }
  }

  static async likePropShot(id: number, userId: number = 0): Promise<void> {
    try {
      await apiClient.post(`/api/social/propshots/${id}/like?userId=${userId}`);
    } catch (error) {
      console.error('Error liking PropShot:', error);
      throw new Error('Error al dar like');
    }
  }

  static async addComment(id: number, content: string, userId: number = 0, userName: string = 'Usuario Anónimo'): Promise<void> {
    try {
      const commentData = {
        content,
        userId,
        userName
      };
      
      await apiClient.post(`/api/social/propshots/${id}/comment`, commentData);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Error al agregar comentario');
    }
  }

  static async getComments(id: number): Promise<PropShotComment[]> {
    try {
      const response = await apiClient.get(`/api/social/propshots/${id}/comments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  static async incrementViews(id: number): Promise<void> {
    try {
      await apiClient.post(`/api/social/propshots/${id}/view`);
    } catch (error) {
      // Silencioso - no es crítico
    }
  }

  static async getUserPropShots(userId: number): Promise<PropShot[]> {
    try {
      const response = await apiClient.get(`/api/social/propshots/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user PropShots:', error);
      return [];
    }
  }
}
