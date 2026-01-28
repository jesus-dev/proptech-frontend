"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Image as ImageIcon } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { getEndpoint } from '@/lib/api-config';
import { isHeicFile, processImageFiles } from '@/lib/image-utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Importar el editor de forma dinámica para evitar problemas con SSR (mismo que en propiedades)
const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
    <LoadingSpinner />
  </div>
});

interface BlogPostFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export default function BlogPostForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false,
}: BlogPostFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    status: 'DRAFT',
    featuredImage: '',
    featured: false,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Si es HEIC, no se puede mostrar en el navegador - retornar vacío para mostrar placeholder
    if (url.toLowerCase().endsWith('.heic') || url.toLowerCase().endsWith('.heif') || url.toLowerCase().endsWith('.hif')) {
      return '';
    }
    return getEndpoint(url.startsWith('/') ? url : `/${url}`);
  };

  useEffect(() => {
    if (initialData) {
      console.log('Loading initialData:', initialData);
      console.log('featuredImage from initialData:', initialData.featuredImage);
      const featuredImg = initialData.featuredImage || '';
      setFormData({
        title: initialData.title || '',
        slug: initialData.slug || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        category: initialData.category || '',
        tags: initialData.tags || '',
        status: initialData.status || 'DRAFT',
        featuredImage: featuredImg,
        featured: initialData.featured || false,
      });
      if (featuredImg) {
        const imgUrl = getImageUrl(featuredImg);
        setPreviewUrl(imgUrl);
        setImageError(false); // Reset error state when loading new image
      }
    }
  }, [initialData]);

  useEffect(() => {
    console.log('formData.featuredImage changed:', formData.featuredImage);
  }, [formData.featuredImage]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generar slug del título
    if (field === 'title' && !isEditing) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Aceptar todos los formatos de imagen (JPEG, PNG, WEBP, GIF, HEIC, etc.)
    const isImage = file.type.startsWith('image/') || 
                   isHeicFile(file) ||
                   ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.heic', '.heif', '.hif'].some(ext => 
                     file.name.toLowerCase().endsWith(ext)
                   );
    if (!isImage) {
      alert('Solo se permiten archivos de imagen');
      return;
    }

    try {
      setUploadingImage(true);

      // Convertir HEIC a JPG si es necesario - NO permitir subir HEIC sin convertir
      let fileToUpload: File;
      
      if (isHeicFile(file)) {
        console.log('Detected HEIC file, attempting conversion...');
        try {
          const processedFiles = await processImageFiles([file]);
          console.log('Processed files result:', processedFiles.length, processedFiles);
          
          if (processedFiles.length === 0 || !processedFiles[0]) {
            // Si la conversión falla completamente, NO subir el archivo HEIC
            console.error('HEIC conversion failed - no files returned');
            alert('No se pudo convertir la imagen HEIC. Por favor, convierte la imagen a JPG o PNG antes de subirla.\n\nEl navegador no puede mostrar archivos HEIC directamente.');
            setUploadingImage(false);
            return;
          }
          
          fileToUpload = processedFiles[0];
          
          // Verificar que el archivo convertido NO sea HEIC
          if (isHeicFile(fileToUpload)) {
            console.error('Converted file is still HEIC - conversion failed');
            alert('La conversión de HEIC falló. Por favor, convierte la imagen a JPG o PNG antes de subirla.');
            setUploadingImage(false);
            return;
          }
          
          console.log('HEIC converted successfully to:', fileToUpload.name, fileToUpload.type);
        } catch (error: any) {
          console.error('Error processing HEIC file:', file.name, error);
          const errorMessage = error?.message || 'Error desconocido';
          alert(
            `No se pudo convertir la imagen HEIC.\n\n` +
            `Error: ${errorMessage}\n\n` +
            `Por favor, convierte la imagen a JPG o PNG antes de subirla.\n\n` +
            `Puedes usar herramientas como:\n` +
            `- iCloud Photos (convertir a JPG)\n` +
            `- Online converters (heictojpg.com)\n` +
            `- Aplicaciones de conversión`
          );
          setUploadingImage(false);
          return;
        }
      } else {
        fileToUpload = file;
      }

      const uploadFormData = new FormData();
      uploadFormData.append('file', fileToUpload);
      uploadFormData.append('fileName', fileToUpload.name);
      uploadFormData.append('category', 'BLOG');
      uploadFormData.append('altText', formData.title);

      // axios detecta automáticamente FormData y configura el Content-Type correctamente
      const res = await apiClient.post('/api/cms/media/upload', uploadFormData);

      const data = res.data as { fileUrl: string };
      console.log('Upload response:', data);
      console.log('fileUrl received:', data.fileUrl);
      
      if (!data.fileUrl) {
        throw new Error('El servidor no devolvió la URL de la imagen');
      }
      
      console.log('Setting featuredImage to:', data.fileUrl);
      handleChange('featuredImage', data.fileUrl);
      setPreviewUrl(getImageUrl(data.fileUrl));
      console.log('After handleChange, formData should update...');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      if (error?.message && !error.message.includes('401')) {
        alert(error.message || 'Error al subir la imagen');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título del Post *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ingresa un título atractivo..."
            />
          </div>

          {/* Slug */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL Slug *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">/blog/</span>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="url-del-post"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Se genera automáticamente del título</p>
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Extracto / Resumen
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Breve resumen del artículo..."
            />
          </div>

          {/* Content Editor */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenido *
            </label>
            <div className="border rounded-lg border-gray-300 dark:border-gray-600">
              <Editor
                value={formData.content}
                onChange={(content) => handleChange('content', content)}
              />
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Box */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Publicar</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="DRAFT">Borrador</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="ARCHIVED">Archivado</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => handleChange('featured', e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Marcar como destacado
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
              >
                {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Imagen Destacada</h3>
            
            {(formData.featuredImage || previewUrl) ? (
              <div className="space-y-3">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                  {(() => {
                    const featuredImageUrl = formData.featuredImage || '';
                    const isHeic = featuredImageUrl.toLowerCase().endsWith('.heic') || 
                                  featuredImageUrl.toLowerCase().endsWith('.heif') ||
                                  featuredImageUrl.toLowerCase().endsWith('.hif');
                    
                    // Si es HEIC, mostrar placeholder (el navegador no puede mostrarlo)
                    if (isHeic) {
                      return (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gray-50 dark:bg-gray-800">
                          <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Imagen HEIC guardada
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            El navegador no puede mostrar archivos HEIC
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                            Por favor, sube una nueva imagen en formato JPG o PNG
                          </p>
                        </div>
                      );
                    }
                    
                    // Para imágenes normales, intentar mostrar
                    const imageUrl = previewUrl || getImageUrl(featuredImageUrl);
                    
                    if (!imageUrl || imageError) {
                      return (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gray-50 dark:bg-gray-800">
                          <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            No se pudo cargar la imagen
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <img
                        src={imageUrl}
                        alt="Featured"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Error loading image:', featuredImageUrl);
                          console.error('Preview URL:', previewUrl);
                          console.error('Constructed URL:', imageUrl);
                          setImageError(true);
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', imageUrl);
                          setImageError(false);
                        }}
                      />
                    );
                  })()}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleChange('featuredImage', '');
                    setPreviewUrl(null);
                    setImageError(false);
                  }}
                  className="w-full text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Eliminar imagen
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-indigo-500 transition-colors">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {uploadingImage ? 'Subiendo...' : 'Click para subir imagen'}
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*,.heic,.heif,.hif"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            )}
          </div>

          {/* Category and Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Organización</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Sin categoría</option>
                  <option value="Noticias">Noticias</option>
                  <option value="Guías">Guías</option>
                  <option value="Consejos">Consejos</option>
                  <option value="Mercado">Mercado</option>
                  <option value="Tendencias">Tendencias</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Etiquetas
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="propiedad, venta, alquiler"
                />
                <p className="text-xs text-gray-500 mt-1">Separadas por comas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

