import { getApiUrl, getEndpoint } from '@/lib/api-config';

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
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/private-files/property/${propertyId}`);
  if (!res.ok) {
    if (res.status === 404) {
      // Si no hay archivos, devolver array vacío
      return [];
    }
    throw new Error('Error al obtener archivos privados');
  }
  const files = await res.json();
  
  // Convertir URLs relativas a completas
  return files.map((file: PrivateFile) => ({
    ...file,
    url: getFullFileUrl(file.url)
  }));
}

export async function uploadPrivateFile(propertyId: number | string, file: File): Promise<PrivateFile> {
  const apiUrl = getApiUrl();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  
  const res = await fetch(`${apiUrl}/api/private-files/property/${propertyId}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Error al subir archivo privado');
  const uploadedFile = await res.json();
  
  // Convertir URL relativa a completa
  return {
    ...uploadedFile,
    url: getFullFileUrl(uploadedFile.url)
  };
}

export async function deletePrivateFile(fileId: number | string): Promise<void> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/private-files/${fileId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar archivo privado');
} 