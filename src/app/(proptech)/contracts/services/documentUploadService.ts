import { Contract } from "../components/types";
import { apiClient } from '@/lib/api';

export interface UploadResponse {
  success: boolean;
  message: string;
  documentUrl?: string;
  documentName?: string;
  documentSize?: number;
  documentType?: string;
}

export const uploadSignedContract = async (
  contractId: string | number, 
  file: File
): Promise<UploadResponse> => {
  try {
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);
    // propertyId es opcional, puedes pasarlo como parámetro si lo necesitas
    // formData.append('propertyId', propertyId?.toString() || '');

    // Validar el archivo antes de subir
    const validation = validateFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.error || 'Error de validación desconocido'
      };
    }

    // Llamada al backend
    // axios detecta automáticamente FormData y configura el Content-Type correctamente
    const response = await apiClient.post(`/api/contracts/${contractId}/documents`, formData);

    const result = response.data;
    
    return {
      success: true,
      message: 'Documento subido exitosamente',
      documentUrl: result.fileUrl,
      documentName: result.fileName,
      documentSize: file.size,
      documentType: result.fileType
    };

  } catch (error) {
    console.error('Error uploading signed contract:', error);
    return {
      success: false,
      message: 'Error al subir el documento. Intente nuevamente.'
    };
  }
};

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Validar tipo de archivo
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/tiff',
    'image/tif'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de archivo no permitido. Solo se aceptan PDF e imágenes (JPG, PNG, TIFF).'
    };
  }

  // Validar tamaño (máximo 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo es demasiado grande. Máximo 10MB.'
    };
  }

  // Validar nombre del archivo
  if (file.name.length > 255) {
    return {
      isValid: false,
      error: 'El nombre del archivo es demasiado largo.'
    };
  }

  return { isValid: true };
};

export const downloadScannedDocument = async (contract: Contract): Promise<void> => {
  if (!contract.scannedDocumentUrl) {
    throw new Error('No hay documento escaneado disponible para descargar.');
  }

  try {
    // Si es URL absoluta, usar fetch directo; si es relativa, usar apiClient
    let blob: Blob;
    if (contract.scannedDocumentUrl.startsWith('http://') || contract.scannedDocumentUrl.startsWith('https://')) {
      const response = await fetch(contract.scannedDocumentUrl);
      if (!response.ok) {
        throw new Error('Error al descargar el documento.');
      }
      blob = await response.blob();
    } else {
      // URL relativa - usar apiClient para autenticación
      const response = await apiClient.get(contract.scannedDocumentUrl, {
        responseType: 'blob',
      });
      blob = new Blob([response.data]);
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = contract.scannedDocumentName || `contrato-firmado-${contract.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error downloading scanned document:', error);
    throw new Error('Error al descargar el documento escaneado.');
  }
};

export const deleteScannedDocument = async (contractId: string | number, documentId: string | number): Promise<boolean> => {
  try {
    await apiClient.delete(`/api/contracts/${contractId}/documents/${documentId}`);

    return true;
  } catch (error) {
    console.error('Error deleting scanned document:', error);
    return false;
  }
};

export const getDocumentPreviewUrl = (contract: Contract): string | null => {
  if (!contract.scannedDocumentUrl) return null;
  
  // Si es una imagen, podemos mostrarla directamente
  if (contract.scannedDocumentType?.startsWith('image/')) {
    return contract.scannedDocumentUrl;
  }
  
  // Si es PDF, necesitamos un visor especial
  if (contract.scannedDocumentType === 'application/pdf') {
    return contract.scannedDocumentUrl;
  }
  
  return null;
}; 