import { getEndpoint } from '@/lib/api-config';
import { apiClient } from '@/lib/api';

// Servicio para manejar archivos privados asociados a propiedades

export interface PrivateFile {
  id: number;
  propertyId: number;
  url: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
}

// Función helper para convertir URLs relativas a completas
function getFullFileUrl(url: string): string {
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

export async function getPrivateFiles(propertyId: number | string): Promise<PrivateFile[]> {
  try {
    const response = await apiClient.get(`/api/private-files/property/${propertyId}`);
    const files = response.data;
    
    // Convertir URLs relativas a completas
    return files.map((file: PrivateFile) => ({
      ...file,
      url: getFullFileUrl(file.url)
    }));
  } catch (error: any) {
    if (error.response?.status === 404) {
      // Si no hay archivos, devolver array vacío
      return [];
    }
    console.error('Error getting private files:', error);
    throw new Error('Error al obtener archivos privados');
  }
}

export async function uploadPrivateFile(propertyId: number | string, file: File): Promise<PrivateFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  
  try {
    // axios detecta automáticamente FormData y configura el Content-Type correctamente
    const response = await apiClient.post(`/api/private-files/property/${propertyId}`, formData);
    
    const uploadedFile = response.data;
    
    // Convertir URL relativa a completa
    return {
      ...uploadedFile,
      url: getFullFileUrl(uploadedFile.url)
    };
  } catch (error: any) {
    console.error('Error uploading private file:', error);
    throw new Error(error.response?.data || 'Error al subir archivo privado');
  }
}

export async function deletePrivateFile(fileId: number | string): Promise<void> {
  try {
    await apiClient.delete(`/api/private-files/${fileId}`);
  } catch (error: any) {
    console.error('Error deleting private file:', error);
    throw new Error(error.response?.data || 'Error al eliminar archivo privado');
  }
} 