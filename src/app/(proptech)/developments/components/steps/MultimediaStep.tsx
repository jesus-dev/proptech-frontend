"use client";
import React, { useCallback, useState } from "react";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";
import { processImageFiles, isHeicFile } from '@/lib/image-utils';
import { getImageBaseUrl } from '@/config/environment';

interface MultimediaStepProps {
  formData: DevelopmentFormData;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
  addImages: (newFiles: File[]) => void;
  removeImage: (index: number) => void;
}

export default function MultimediaStep({ formData, errors, addImages, removeImage }: MultimediaStepProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Helper para construir URL de imagen (igual que en DevelopmentCard y page.tsx)
  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return '/images/placeholder.jpg';
    // Manejar URLs blob (previsualización de archivos nuevos)
    if (imagePath.startsWith('blob:')) return imagePath;
    // Manejar URLs completas
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const baseUrl = getImageBaseUrl();
    // Si la ruta es /uploads/1/... debería ser /uploads/developments/1/...
    let correctedPath = imagePath;
    if (imagePath.startsWith('/uploads/') && !imagePath.includes('/developments/')) {
      // Extraer el ID del desarrollo de la ruta /uploads/1/... 
      // y reconstruir como /uploads/developments/1/...
      const parts = imagePath.split('/');
      if (parts.length >= 4 && parts[1] === 'uploads' && /^\d+$/.test(parts[2])) {
        // Formato: /uploads/1/filename.jpg -> /uploads/developments/1/filename.jpg
        const developmentId = parts[2];
        const fileName = parts.slice(3).join('/');
        correctedPath = `/uploads/developments/${developmentId}/${fileName}`;
      }
    }
    return `${baseUrl}${correctedPath.startsWith('/') ? '' : '/'}${correctedPath}`;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const filesArray = Array.from(files);
      const heicCount = filesArray.filter(f => isHeicFile(f)).length;
      
      if (heicCount > 0) {
        console.log(`🔄 Convirtiendo ${heicCount} archivo(s) HEIC a JPG...`);
      }
      
      // Procesar imágenes (convertir HEIC a JPG si es necesario)
      const processedFiles = await processImageFiles(filesArray);
      
      if (heicCount > 0) {
        console.log(`✅ ${heicCount} archivo(s) HEIC convertido(s) a JPG`);
      }
      
      // Agregar las imágenes procesadas
      addImages(processedFiles);
    } catch (error) {
      console.error('❌ Error procesando imágenes:', error);
      alert('Error al procesar las imágenes. Por favor, intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Limpiar el input para permitir volver a seleccionar las mismas imágenes
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Imágenes
        </label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
            isDragActive 
              ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" 
              : "border-gray-300 dark:border-gray-600"
          } ${errors.images ? "border-red-500" : ""} ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-brand-500"}`}
        >
          <div className="space-y-1 text-center">
            {uploading ? (
              <>
                <Loader2 className="mx-auto h-12 w-12 text-brand-500 animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Procesando imágenes...</p>
              </>
            ) : (
              <>
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                  <label
                    htmlFor="images-upload"
                    className="relative cursor-pointer rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none focus-within:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                  >
                    <span>Subir archivos</span>
                    <input
                      id="images-upload"
                      type="file"
                      accept="image/*,.heic,.heif,.hif"
                      multiple
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">o arrastrar y soltar</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF, HEIC hasta 10MB
                </p>
              </>
            )}
          </div>
        </div>
        {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
      </div>

      {formData.images && formData.images.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vista Previa ({formData.images.length} imagen{formData.images.length !== 1 ? 'es' : ''})
          </label>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {formData.images.map((imageUrl, index) => {
              const fullImageUrl = getImageUrl(imageUrl);
              console.log('🖼️ MultimediaStep: Mostrando imagen', { index, imageUrl, fullImageUrl });
              return (
              <div key={index} className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <div className="relative w-full h-32 bg-gray-200 dark:bg-gray-700">
                  <img
                    src={fullImageUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Ocultar imagen si falla al cargar
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const placeholder = target.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                  {/* Placeholder si la imagen falla */}
                  <div className="image-placeholder absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 pointer-events-none" style={{ display: 'none' }}>
                    <div className="text-center text-xs px-2">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                      <p className="text-[10px] text-red-500">Error al cargar</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Eliminar imagen"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 