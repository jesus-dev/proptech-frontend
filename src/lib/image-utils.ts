/**
 * Detecta si un archivo es formato HEIC/HEIF
 */
export function isHeicFile(file: File): boolean {
  const heicExtensions = ['.heic', '.heif', '.hif'];
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  return (
    heicExtensions.some(ext => fileName.endsWith(ext)) ||
    mimeType.includes('heic') ||
    mimeType.includes('heif')
  );
}

/**
 * Convierte un archivo HEIC/HEIF a JPG
 * Si el archivo no es HEIC, lo retorna sin modificar
 */
export async function convertHeicToJpg(file: File): Promise<File> {
  // Si no es HEIC, retornar el archivo original
  if (!isHeicFile(file)) {
    return file;
  }

  // Verificar que estamos en el cliente
  if (typeof window === 'undefined') {
    throw new Error('HEIC conversion is only available in the browser');
  }

  try {
    // Importación dinámica de heic2any para evitar problemas de SSR
    const heic2any = (await import('heic2any')).default;
    
    // Convertir HEIC a JPG usando heic2any
    // heic2any retorna un Blob o ArrayBuffer dependiendo de la configuración
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.95, // Alta calidad
    });

    // heic2any puede retornar un array si hay múltiples imágenes
    // Normalmente es un solo archivo, así que tomamos el primero
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    
    // Crear un nuevo File a partir del Blob convertido
    // Cambiar la extensión del nombre de archivo de .heic/.heif a .jpg
    const newFileName = file.name
      .replace(/\.heic$/i, '.jpg')
      .replace(/\.heif$/i, '.jpg')
      .replace(/\.hif$/i, '.jpg');
    
    const convertedFile = new File(
      [blob as Blob],
      newFileName,
      {
        type: 'image/jpeg',
        lastModified: file.lastModified,
      }
    );

    return convertedFile;
  } catch (error) {
    console.error('Error converting HEIC to JPG:', error);
    // Si falla la conversión, retornar el archivo original
    // El backend intentará manejarlo si tiene soporte
    throw new Error('No se pudo convertir la imagen HEIC. Por favor, convierte la imagen a JPG antes de subirla.');
  }
}

/**
 * Procesa múltiples archivos, convirtiendo HEIC a JPG cuando sea necesario
 * Optimizado: solo procesa HEIC, el resto se retorna sin modificar
 */
export async function processImageFiles(files: File[]): Promise<File[]> {
  // Separar archivos HEIC de los demás
  const heicFiles: File[] = [];
  const otherFiles: File[] = [];

  for (const file of files) {
    if (isHeicFile(file)) {
      heicFiles.push(file);
    } else {
      // JPEG, PNG, WEBP, etc. se retornan sin procesar
      otherFiles.push(file);
    }
  }

  // Procesar solo archivos HEIC en paralelo para mayor velocidad
  const processedHeicFiles = await Promise.allSettled(
    heicFiles.map(file => convertHeicToJpg(file))
  );

  // Agregar archivos HEIC convertidos exitosamente
  const convertedFiles: File[] = [];
  for (const result of processedHeicFiles) {
    if (result.status === 'fulfilled') {
      convertedFiles.push(result.value);
    } else {
      console.error('Error converting HEIC file:', result.reason);
      // Si falla la conversión, no incluimos el archivo
      // El usuario verá el error en el toast
    }
  }

  // Retornar archivos convertidos + archivos normales (sin procesar)
  return [...convertedFiles, ...otherFiles];
}
