"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getEndpoint } from '@/lib/api-config';
import { toast } from 'sonner';
import { processImageFiles, isHeicFile } from '@/lib/image-utils';

interface Media {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: string;
  altText: string;
  createdAt: string;
  uploadedByName: string;
}

export default function MediaLibraryPage() {
  // Media state
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'>('all');

  // Load data on mount
  useEffect(() => {
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(getEndpoint('/api/cms/media'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMedia(data);
      }
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const fileArray = Array.from(files);
      
      // Separar imágenes de otros archivos
      const imageFiles = fileArray.filter(file => 
        file.type.startsWith('image/') || isHeicFile(file)
      );
      const otherFiles = fileArray.filter(file => 
        !file.type.startsWith('image/') && !isHeicFile(file)
      );

      // Convertir imágenes HEIC a JPG
      let processedFiles: File[] = [];
      try {
        if (imageFiles.length > 0) {
          processedFiles = await processImageFiles(imageFiles);
        }
        processedFiles = [...processedFiles, ...otherFiles];
      } catch (error: any) {
        console.error('Error processing files:', error);
        toast.error(error?.message || 'Error al procesar las imágenes');
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      const heicCount = imageFiles.filter(f => isHeicFile(f)).length;

      // Subir archivos uno por uno
      for (const file of processedFiles) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          uploadFormData.append('fileName', file.name);
          uploadFormData.append('category', 'GENERAL');

          const response = await fetch(getEndpoint('/api/cms/media/upload'), {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: uploadFormData,
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Error uploading ${file.name}:`, response.statusText);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error uploading ${file.name}:`, error);
        }
      }

      // Mostrar resultado
      if (successCount > 0) {
        loadMedia();
        let message = '';
        if (processedFiles.length === 1) {
          message = 'Archivo subido exitosamente';
        } else {
          message = `${successCount} archivo(s) subido(s) exitosamente${errorCount > 0 ? `. ${errorCount} fallaron.` : ''}`;
        }
        if (heicCount > 0) {
          message += ` (${heicCount} imagen${heicCount > 1 ? 'es' : ''} HEIC convertida${heicCount > 1 ? 's' : ''} a JPG)`;
        }
        toast.success(message);
      } else {
        toast.error(`Error al subir ${fileArray.length > 1 ? 'los archivos' : 'el archivo'}`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Error al subir archivos');
    } finally {
      setUploading(false);
      // Limpiar el input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getEndpoint(`/api/cms/media/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadMedia();
        toast.success('Archivo eliminado');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Error al eliminar archivo');
    }
  };




  const getImageUrl = (url: string) => {
    if (!url) return '/images/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return getEndpoint(url);
  };

  const filteredMedia = media.filter(item => {
    if (filter !== 'all' && item.fileType !== filter) return false;
    return true;
  });

  const stats = {
    total: media.length,
    images: media.filter(m => m.fileType === 'IMAGE').length,
    videos: media.filter(m => m.fileType === 'VIDEO').length,
    documents: media.filter(m => m.fileType === 'DOCUMENT').length,
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'IMAGE': return <PhotoIcon className="w-8 h-8" />;
      case 'VIDEO': return <VideoCameraIcon className="w-8 h-8" />;
      case 'AUDIO': return <MusicalNoteIcon className="w-8 h-8" />;
      case 'DOCUMENT': return <DocumentIcon className="w-8 h-8" />;
      default: return <DocumentIcon className="w-8 h-8" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Galería de Medios</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Administra archivos multimedia (imágenes, videos, documentos)
          </p>
        </div>
        <label className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium cursor-pointer">
          {uploading ? (
            <>
              <LoadingSpinner />
              Subiendo...
            </>
          ) : (
            <>
              <PlusIcon className="w-5 h-5" />
              Subir Archivos
            </>
          )}
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
            multiple
            accept="image/*,.heic,.heif,.hif,video/*,application/pdf,.doc,.docx"
            title="Selecciona uno o más archivos (imágenes, videos, documentos, etc.). Las imágenes HEIC se convertirán automáticamente a JPG."
          />
        </label>
      </div>

      {/* Media Content */}
      <div>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Imágenes</p>
              <p className="text-2xl font-bold text-blue-600">{stats.images}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Videos</p>
              <p className="text-2xl font-bold text-purple-600">{stats.videos}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Documentos</p>
              <p className="text-2xl font-bold text-orange-600">{stats.documents}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('IMAGE')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'IMAGE'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
            >
              Imágenes
            </button>
            <button
              onClick={() => setFilter('VIDEO')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'VIDEO'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setFilter('DOCUMENT')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'DOCUMENT'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
            >
              Documentos
            </button>
          </div>

          {/* Grid View */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredMedia.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
                  No hay archivos para mostrar
                </div>
              ) : (
                filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {item.fileType === 'IMAGE' ? (
                        <img
                          src={getEndpoint(item.fileUrl)}
                          alt={item.altText || item.fileName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400">
                          {getFileIcon(item.fileType)}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate" title={item.fileName}>
                        {item.fileName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(item.fileSize)}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {item.category}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg"
                        title="Eliminar"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getEndpoint(item.fileUrl));
                        toast.success('URL copiada al portapapeles');
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Click para copiar URL"
                    />
                  </div>
                ))
              )}
            </div>
          )}
      </div>
    </div>
  );
}
