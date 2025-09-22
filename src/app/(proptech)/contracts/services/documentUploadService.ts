import { Contract } from "../components/types";

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
    const response = await fetch(`/api/contracts/${contractId}/documents`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
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
    const response = await fetch(contract.scannedDocumentUrl);
    if (!response.ok) {
      throw new Error('Error al descargar el documento.');
    }

    const blob = await response.blob();
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
    const response = await fetch(`/api/contracts/${contractId}/documents/${documentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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