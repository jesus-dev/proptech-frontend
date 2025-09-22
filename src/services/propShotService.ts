import { api } from '@/lib/api';
import { getEndpoint } from '@/lib/api-config';
import { config } from '@/config/environment';
import { fetchWithRetry, buildApiUrl, handleApiError } from '@/lib/api-utils';

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



export class PropShotService {
  // Obtener todos los PropShots
  static async getPropShots(): Promise<PropShot[]> {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/social/propshots`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching PropShots:', error);
      // Si falla la API, retornamos array vacío
      return [];
    }
  }

  // Obtener un PropShot por ID
  static async getPropShotById(id: number): Promise<PropShot> {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/social/propshots/${id}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching PropShot:', error);
      throw new Error('Error al cargar el PropShot');
    }
  }

  // Subir video al servidor
  static async uploadVideo(videoFile: File): Promise<UploadResponse> {
    try {
      console.log('🔍 DEBUG: Iniciando upload de video en frontend');
      console.log('🔍 DEBUG: videoFile:', videoFile);
      console.log('🔍 DEBUG: videoFile.name:', videoFile.name);
      console.log('🔍 DEBUG: videoFile.size:', videoFile.size);
      console.log('🔍 DEBUG: videoFile.type:', videoFile.type);
      
      // Verificar que el archivo sea válido
      if (!videoFile || videoFile.size === 0) {
        throw new Error('Archivo de video inválido o vacío');
      }
      
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('fileName', videoFile.name);
      
      // Verificar que el FormData se haya construido correctamente
      console.log('🔍 DEBUG: FormData creado');
      console.log('🔍 DEBUG: FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log('  -', key, ':', value);
      }
      console.log('🔍 DEBUG: API_BASE_URL:', config.API_BASE_URL);
      
      const response = await fetch(`${config.API_BASE_URL}/api/social/propshots/upload/video`, {
        method: 'POST',
        body: formData,
      });
      
      console.log('🔍 DEBUG: Response recibida:', response);
      console.log('🔍 DEBUG: Response status:', response.status);
      console.log('🔍 DEBUG: Response statusText:', response.statusText);
      console.log('🔍 DEBUG: Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ERROR: Response no OK:', errorText);
        console.error('❌ ERROR: Status:', response.status);
        console.error('❌ ERROR: StatusText:', response.statusText);
        throw new Error(`Error uploading video: ${errorText || response.statusText}`);
      }
      
      const videoUrl = await response.text();
      console.log('✅ DEBUG: Video subido exitosamente:', videoUrl);
      
      return {
        url: videoUrl,
        fileName: videoFile.name,
        fileSize: videoFile.size,
        mimeType: videoFile.type
      };
    } catch (error) {
      console.error('❌ ERROR en uploadVideo:', error);
      throw new Error('Error al subir el video');
    }
  }

  // Subir thumbnail al servidor (TEMPORAL - simulado)
  static async uploadThumbnail(thumbnailFile: File): Promise<UploadResponse> {
    try {
     
      
      const formData = new FormData();
      formData.append('thumbnail', thumbnailFile);
      formData.append('fileName', thumbnailFile.name);
      
      const response = await fetch(`${config.API_BASE_URL}/api/social/propshots/upload/thumbnail`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error uploading thumbnail: ${errorText}`);
      }
      
      const thumbnailUrl = await response.text();
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

  // Crear un nuevo PropShot con upload de archivos (TEMPORAL - simulado)
  static async createPropShot(data: CreatePropShotRequest): Promise<PropShot> {
    try {
      // TODO: Implementar upload real cuando el backend esté listo
      // Primero subir el video
      const videoUpload = await this.uploadVideo(data.videoFile);
      
      // Subir thumbnail si se proporciona
      let thumbnailUpload: UploadResponse | null = null;
      if (data.thumbnailFile) {
        thumbnailUpload = await this.uploadThumbnail(data.thumbnailFile);
      }

     
      // Crear el PropShot con las URLs de los archivos
      const propShotData = {
        title: data.title,
        description: data.description,
        duration: data.duration,
        link: data.link,
        videoUrl: videoUpload.url,
        thumbnailUrl: thumbnailUpload?.url || null,
        userId: data.userId
      };
      
      const response = await fetch(`${config.API_BASE_URL}/api/social/propshots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propShotData)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating PropShot:', error);
      throw new Error('Error al crear el PropShot');
    }
  }



  // Actualizar un PropShot
  static async updatePropShot(id: number, data: UpdatePropShotRequest): Promise<PropShot> {
    try {
      const updateData: any = { ...data };
      
      // Si se proporciona un nuevo thumbnail, subirlo primero
      if (data.thumbnailFile) {
        const thumbnailUpload = await this.uploadThumbnail(data.thumbnailFile);
        updateData.thumbnailUrl = thumbnailUpload.url;
        delete updateData.thumbnailFile; // Remover el archivo del objeto
      }
      
      const response = await fetch(`${config.API_BASE_URL}/api/social/propshots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating PropShot:', error);
      throw new Error('Error al actualizar el PropShot');
    }
  }

  // Eliminar un PropShot
  static async deletePropShot(id: number): Promise<void> {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/social/propshots/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting PropShot:', error);
      throw new Error('Error al eliminar el PropShot');
    }
  }

  // Dar like a un PropShot
  static async likePropShot(id: number): Promise<void> {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/social/propshots/${id}/like`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error liking PropShot:', error);
      throw new Error('Error al dar like al PropShot');
    }
  }

  // Quitar like de un PropShot
  static async unlikePropShot(id: number): Promise<void> {
    try {
      
      console.log('Unlike functionality not yet implemented in backend');
    } catch (error) {
      console.error('Error unliking PropShot:', error);
      throw new Error('Error al quitar like del PropShot');
    }
  }

  // Incrementar vistas de un PropShot
  static async incrementViews(id: number): Promise<void> {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/social/propshots/${id}/view`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        console.warn(`Error incrementing views: ${response.status}`);
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
      // No lanzamos error aquí porque no es crítico
    }
  }

  // Obtener PropShots por usuario
  static async getPropShotsByUser(userId: number): Promise<PropShot[]> {
    try {
      console.log('🔍 DEBUG: Fetching PropShots for user:', userId);
      
      const apiUrl = buildApiUrl(`api/social/propshots/user/${userId}`);
      console.log('🔍 DEBUG: API URL:', apiUrl);
      
      const response = await fetchWithRetry(apiUrl, {
        method: 'GET',
        retries: 3,
        retryDelay: 1000
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ DEBUG: PropShots fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ ERROR fetching user PropShots:', error);
      // Si falla la API, retornamos array vacío para no romper la UI
      return [];
    }
  }

  // Buscar PropShots
  static async searchPropShots(query: string): Promise<PropShot[]> {
    try {
      
      // Por ahora, buscar en los PropShots existentes
      const allPropShots = await this.getPropShots();
      const lowercaseQuery = query.toLowerCase();
      return allPropShots.filter(shot => 
        shot.title.toLowerCase().includes(lowercaseQuery) ||
        shot.description.toLowerCase().includes(lowercaseQuery) ||
        `${shot.agentFirstName || ''} ${shot.agentLastName || ''}`.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching PropShots:', error);
      throw new Error('Error al buscar PropShots');
    }
  }

  // Obtener URL completa de un archivo
  static getFileUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    return getEndpoint(url);
  }

  // Eliminar archivo del servidor
  static async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      
      // Simular eliminación exitosa
      await new Promise(resolve => setTimeout(resolve, 200));
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}
