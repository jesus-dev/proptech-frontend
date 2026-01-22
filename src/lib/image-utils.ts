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
 * Convierte un archivo HEIC/HEIF a JPG/PNG usando múltiples estrategias
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
    // Intentar usar heic-to primero (más moderna y compatible)
    let convertedBlob: Blob | Blob[] | null = null;
    let targetType = 'image/jpeg';
    let targetExtension = '.jpg';
    let lastError: any = null;
    
    // Estrategia 1: Intentar con heic-to (más moderna) - solo si está disponible
    let heicToAvailable = false;
    try {
      // Intentar importar heic-to dinámicamente (puede no estar instalado)
      // @ts-ignore - heic-to puede no estar instalado, manejamos el error
      const heicToModule = await import('heic-to').catch((err) => {
        console.log('heic-to library not installed, will use heic2any fallback');
        return null;
      });
      
      if (heicToModule) {
        heicToAvailable = true;
        // Verificar la API de heic-to (puede variar según la versión)
        const heicTo = (heicToModule as any).default || heicToModule;
        const isHeicFn = (heicToModule as any).isHeic || (heicToModule as any).default?.isHeic;
        const convertFn = typeof heicTo === 'function' ? heicTo : (heicTo?.heicTo || heicTo);
        
        if (convertFn && typeof convertFn === 'function') {
          console.log('✅ heic-to library found, attempting conversion...');
          try {
            const jpegBlob = await convertFn({
              blob: file,
              type: 'image/jpeg',
              quality: 0.9,
            });
            convertedBlob = jpegBlob;
            targetType = 'image/jpeg';
            targetExtension = '.jpg';
            console.log('✅ HEIC conversion successful with heic-to (JPEG)');
          } catch (convertError: any) {
            console.warn('heic-to conversion failed:', convertError);
            lastError = convertError;
          }
        }
      }
    } catch (heicToError: any) {
      // heic-to no está disponible o falló - continuar con heic2any
      console.warn('heic-to library not available:', heicToError?.message || heicToError);
      if (!lastError) lastError = heicToError;
    }
    
    // Estrategia 2: Si heic-to falló, intentar con heic2any (fallback)
    if (!convertedBlob) {
      try {
        const heic2any = (await import('heic2any')).default;
        console.log('Attempting HEIC conversion with heic2any (fallback)...');
        
        const conversionStrategies = [
          { toType: 'image/jpeg' as const, quality: 0.95 },
          { toType: 'image/jpeg' as const, quality: 0.8 },
          { toType: 'image/png' as const, quality: 0.95 },
          { toType: 'image/png' as const, quality: 0.8 },
        ];
        
        for (const strategy of conversionStrategies) {
          try {
            console.log(`Attempting HEIC conversion with heic2any: ${strategy.toType} at quality ${strategy.quality}`);
            convertedBlob = await heic2any({
              blob: file,
              toType: strategy.toType,
              quality: strategy.quality,
            });
            
            targetType = strategy.toType;
            targetExtension = strategy.toType === 'image/png' ? '.png' : '.jpg';
            console.log(`✅ HEIC conversion successful with heic2any: ${targetType}`);
            break; // Éxito, salir del loop
          } catch (error: any) {
            lastError = error;
            console.warn(`heic2any conversion failed with ${strategy.toType}:`, error);
            // Continuar con la siguiente estrategia
            continue;
          }
        }
      } catch (heic2anyError: any) {
        console.warn('heic2any library not available or failed:', heic2anyError);
        if (!lastError) lastError = heic2anyError;
      }
    }
    
    // Si todas las estrategias fallaron
    if (!convertedBlob) {
      const errorDetails = lastError?.message || 'Error desconocido';
      const suggestion = heicToAvailable 
        ? 'Ambas librerías (heic-to y heic2any) fallaron al convertir este archivo HEIC.'
        : 'La librería heic2any no puede procesar este archivo HEIC. Considera instalar "heic-to" para mejor compatibilidad.';
      
      throw new Error(
        `No se pudo convertir la imagen HEIC.\n\n` +
        `Error: ${errorDetails}\n\n` +
        `${suggestion}\n\n` +
        `Solución: Por favor, convierte la imagen a JPG o PNG manualmente antes de subirla.\n` +
        `Opciones:\n` +
        `- iCloud Photos (convertir a JPG)\n` +
        `- heictojpg.com (conversor online)\n` +
        `- Aplicaciones de conversión en tu dispositivo`
      );
    }

    // heic2any puede retornar un array si hay múltiples imágenes
    // Normalmente es un solo archivo, así que tomamos el primero
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    
    if (!blob || !(blob instanceof Blob)) {
      throw new Error('La conversión no produjo un Blob válido');
    }
    
    // Verificar que el blob tenga el tipo correcto
    const finalMimeType = blob.type || targetType;
    const finalExtension = finalMimeType === 'image/png' ? '.png' : '.jpg';
    
    // Crear un nuevo File a partir del Blob convertido
    const newFileName = file.name
      .replace(/\.heic$/i, finalExtension)
      .replace(/\.heif$/i, finalExtension)
      .replace(/\.hif$/i, finalExtension);
    
    const convertedFile = new File(
      [blob],
      newFileName,
      {
        type: finalMimeType,
        lastModified: file.lastModified,
      }
    );

    console.log(`✅ HEIC file converted: ${file.name} -> ${newFileName} (${finalMimeType})`);
    return convertedFile;
  } catch (error: any) {
    console.error('❌ Error converting HEIC to JPG:', error);
    // Lanzar error descriptivo
    const errorMessage = error?.message || 'Error desconocido al convertir HEIC';
    throw new Error(
      `No se pudo convertir la imagen HEIC: ${errorMessage}. ` +
      `Por favor, convierte la imagen a JPG o PNG antes de subirla.`
    );
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
