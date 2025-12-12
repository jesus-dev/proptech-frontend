"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  XMarkIcon,
  PhotoIcon,
  ArrowLeftIcon,
  TrashIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { webGalleryService, Gallery } from '@/services/webGalleryService';
import { toast } from 'sonner';
import Image from 'next/image';
import { getEndpoint } from '@/lib/api-config';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { processImageFiles, isHeicFile } from '@/lib/image-utils';
import { analytics } from '@/lib/analytics';

interface SelectedFile {
  file: File;
  preview: string;
  id: string;
}

export default function CreateAlbumPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const getImageUrl = (url: string) => {
    if (!url) return '/images/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return getEndpoint(url);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = async (files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter(file => {
      return file.type.startsWith('image/') || isHeicFile(file);
    });

    if (imageFiles.length === 0) {
      toast.error('Por favor selecciona solo archivos de imagen');
      return;
    }

    try {
      // Convertir HEIC a JPG antes de mostrar el preview
      const convertedFiles = await processImageFiles(imageFiles);
      
      const newFiles: SelectedFile[] = convertedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(2, 15)
      }));

      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      const heicCount = imageFiles.filter(f => isHeicFile(f)).length;
      if (heicCount > 0) {
        toast.success(`${imageFiles.length} foto(s) agregada(s)${heicCount > 0 ? ` (${heicCount} convertida(s) de HEIC a JPG)` : ''}`);
      } else {
        toast.success(`${imageFiles.length} foto(s) agregada(s)`);
      }
    } catch (error: any) {
      console.error('Error processing files:', error);
      toast.error(error?.message || 'Error al procesar las imágenes');
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    await processFiles(e.dataTransfer.files);
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleCreateAlbum = async () => {
    if (!title.trim()) {
      toast.error('Por favor ingresa un título para el álbum');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error('Por favor agrega al menos una foto al álbum');
      return;
    }

    try {
      setIsCreating(true);

      // Crear el álbum primero
      const gallery = await webGalleryService.createGallery({
        title: title.trim(),
        description: description?.trim() || undefined,
      });

      toast.success('Álbum creado. Subiendo fotos...');

      // Subir todas las fotos
      setIsUploading(true);
      let uploadedCount = 0;
      const totalFiles = selectedFiles.length;

      for (const selectedFile of selectedFiles) {
        try {
          await webGalleryService.uploadPhoto(gallery.id, selectedFile.file);
          uploadedCount++;
          
          // Limpiar preview
          URL.revokeObjectURL(selectedFile.preview);
        } catch (error) {
          console.error('Error uploading photo:', error);
        }
      }

      if (uploadedCount === totalFiles) {
        toast.success(`Álbum creado exitosamente con ${uploadedCount} foto(s)`);
      } else {
        toast.warning(`Álbum creado, pero ${totalFiles - uploadedCount} foto(s) no se pudieron subir`);
      }

      // Track conversion
      analytics.trackAlbumCreated(gallery.id, {
        title: gallery.title,
        photo_count: uploadedCount,
        total_photos: totalFiles,
      });

      // Redirigir a la página de content con tab de galerías
      router.push('/cms/content?tab=galleries');
    } catch (error: any) {
      console.error('Error creating album:', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          'Error al crear álbum';
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
      setIsUploading(false);
    }
  };

  // Limpiar previews al desmontar
  React.useEffect(() => {
    return () => {
      selectedFiles.forEach(file => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Crear Nuevo Álbum
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Comparte tus fotos organizadas en un álbum
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateAlbum}
              disabled={isCreating || isUploading || !title.trim() || selectedFiles.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
            >
              {(isCreating || isUploading) ? (
                <>
                  <LoadingSpinner />
                  {isUploading ? 'Subiendo...' : 'Creando...'}
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-5 h-5" />
                  Crear Álbum
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Album Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título del Álbum *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Evento ACIAPP 2024, Reunión de Bienvenida..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cuenta la historia detrás de estas fotos..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {description.length}/1000 caracteres
              </p>
            </div>
          </div>
        </div>

        {/* Photos Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Fotos del Álbum
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedFiles.length === 0 
                ? 'Agrega fotos arrastrándolas o haciendo clic en el área de abajo'
                : `${selectedFiles.length} foto(s) seleccionada(s)`}
            </p>
          </div>

          {/* Drop Zone */}
          {selectedFiles.length === 0 ? (
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <PhotoIcon className={`w-16 h-16 mx-auto mb-4 ${
                isDragging 
                  ? 'text-blue-500' 
                  : 'text-gray-400 dark:text-gray-500'
              }`} />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isDragging ? 'Suelta las fotos aquí' : 'Arrastra y suelta fotos aquí'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                o haz clic para seleccionar archivos
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                PNG, JPG, GIF, HEIC hasta 10MB cada uno (HEIC se convertirá automáticamente a JPG)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif,.hif"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          ) : (
            <>
              {/* Add More Button */}
              <div className="mb-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  <PhotoIcon className="w-5 h-5" />
                  Agregar Más Fotos
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.heic,.heif,.hif"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedFiles.map((selectedFile, index) => (
                  <div
                    key={selectedFile.id}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
                  >
                    <img
                      src={selectedFile.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(selectedFile.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                      title="Eliminar foto"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">
                        {selectedFile.file.name}
                      </p>
                      <p className="text-white/80 text-xs">
                        {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Drop Zone Overlay for adding more */}
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                <PhotoIcon className={`w-10 h-10 mx-auto mb-2 ${
                  isDragging 
                    ? 'text-blue-500' 
                    : 'text-gray-400 dark:text-gray-500'
                }`} />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isDragging ? 'Suelta para agregar más fotos' : 'Arrastra más fotos aquí o haz clic en "Agregar Más Fotos"'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Bottom Action Bar (Sticky on mobile) */}
        <div className="sticky bottom-0 mt-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 -mx-4 rounded-t-lg shadow-lg sm:hidden">
          <button
            onClick={handleCreateAlbum}
            disabled={isCreating || isUploading || !title.trim() || selectedFiles.length === 0}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
          >
            {(isCreating || isUploading) ? (
              <>
                <LoadingSpinner />
                {isUploading ? 'Subiendo...' : 'Creando...'}
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="w-5 h-5" />
                Crear Álbum ({selectedFiles.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
