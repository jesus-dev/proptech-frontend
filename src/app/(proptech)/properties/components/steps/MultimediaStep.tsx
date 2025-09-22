"use client";
import Image from 'next/image';
import React, { useEffect, useState, useCallback } from "react";
import { PropertyFormData, PropertyFormErrors } from "../../hooks/usePropertyForm";
import { X, Upload, Image as ImageIcon, AlertCircle, CheckCircle, Loader2, Info, Trash2, Eye, Download, Star } from "lucide-react";
import { getGalleryImages, uploadGalleryImage, deleteGalleryImage, GalleryImage } from '../../services/galleryImageService';
import ValidatedInput from "@/components/form/input/ValidatedInput";
import { getEndpoint } from "@/lib/api-config";

interface MultimediaStepProps {
  formData: PropertyFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  removeFeaturedImage: () => void;
  errors: PropertyFormErrors;
  propertyId?: string;
  setFormData?: (data: PropertyFormData) => void;
  validate?: () => void;
}

export default function MultimediaStep({ 
  formData, 
  handleChange, 
  handleFileChange, 
  removeImage, 
  removeFeaturedImage, 
  errors, 
  propertyId,
  setFormData,
  validate 
}: MultimediaStepProps) {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featuredImageId, setFeaturedImageId] = useState<number | null>(null);

  // Función para sincronizar imágenes con formData
  const syncImagesWithFormData = useCallback((images: GalleryImage[]) => {
    if (setFormData && validate) {
      const imageUrls = images.map(img => img.url);
      setFormData({
        ...formData,
        images: imageUrls
      });
      // Validar después de sincronizar
      setTimeout(() => validate(), 100);
    }
  }, [setFormData, validate, formData]);

  // Cargar imágenes de galería
  const loadGalleryImages = useCallback(async () => {
    if (!propertyId) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const images = await getGalleryImages(propertyId);
      
      setGalleryImages(images);
      
      // Sincronizar con formData solo si no hay imágenes ya cargadas
      if (images.length > 0) {
        syncImagesWithFormData(images);
      }
    } catch (err) {
      setError('Error al cargar imágenes de galería. Asegúrate de que la propiedad esté guardada primero.');
      setGalleryImages([]);
    } finally {
      setLoading(false);
    }
  }, [propertyId, syncImagesWithFormData]);

  // Cargar imágenes al montar el componente
  useEffect(() => {
    loadGalleryImages();
  }, [loadGalleryImages]);

  // Sincronizar featuredImageId con formData al cargar imágenes
  useEffect(() => {
    if (galleryImages.length > 0) {
      // Si ya hay una imagen destacada en formData, buscar su id
      if (formData.featuredImage) {
        const found = galleryImages.find(img => img.url === formData.featuredImage);
        if (found) {
          setFeaturedImageId(found.id);
        } else {
          setFeaturedImageId(galleryImages[0].id);
          if (setFormData && formData.featuredImage !== galleryImages[0].url) {
            setFormData({ ...formData, featuredImage: galleryImages[0].url });
          }
        }
      } else {
        setFeaturedImageId(galleryImages[0].id);
        if (setFormData && formData.featuredImage !== galleryImages[0].url) {
          setFormData({ ...formData, featuredImage: galleryImages[0].url });
        }
      }
    }
  }, [galleryImages, formData.featuredImage, setFormData]);

  // Cuando el usuario selecciona una imagen destacada
  const handleSetFeatured = async (image: GalleryImage) => {
    
    try {
      // Actualizar estado local inmediatamente
      setFeaturedImageId(image.id);
      if (setFormData) {
        setFormData({ ...formData, featuredImage: image.url });
      }
      
      // Guardar en el backend solo si hay propertyId
      if (propertyId) {
        
        const response = await fetch(getEndpoint(`/api/properties/${propertyId}/featured-image`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            featuredImageUrl: image.url
          }),
        });
        
        if (response.ok) {
        } else {
          const errorText = await response.text();
        }
      }
    } catch (error) {
      // Revertir estado local en caso de error
      setFeaturedImageId(null);
      if (setFormData) {
        setFormData({ ...formData, featuredImage: "" });
      }
    }
  };

  // Subir nueva imagen
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);
    setError(null);
    
    try {
      if (!propertyId) {
        // Si no hay propertyId, crear una imagen temporal
        const tempImage: GalleryImage = {
          id: Date.now(), // ID temporal
          propertyId: 0,
          url: URL.createObjectURL(file),
          altText: file.name,
          fileSize: file.size
        };
        
        const updatedImages = [...galleryImages, tempImage];
        setGalleryImages(updatedImages);
        syncImagesWithFormData(updatedImages);
        
      } else {
        // Subir al servidor si hay propertyId
        const newImage = await uploadGalleryImage(propertyId, file);
        
        const updatedImages = [...galleryImages, newImage];
        setGalleryImages(updatedImages);
        syncImagesWithFormData(updatedImages);
      }
      
      // Limpiar input
      e.target.value = '';
    } catch (err) {
      setError('Error al subir imagen. Asegúrate de que la propiedad esté guardada primero.');
    } finally {
      setUploading(false);
    }
  };

  // Eliminar imagen de galería
  const handleDeleteGalleryImage = async (imageId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Si es una imagen temporal (ID muy alto), solo eliminarla localmente
      if (imageId > 1000000) {
        const updatedImages = galleryImages.filter(img => img.id !== imageId);
        setGalleryImages(updatedImages);
        syncImagesWithFormData(updatedImages);
        return;
      }
      
      // Si hay propertyId, eliminar del servidor
      if (propertyId) {
        await deleteGalleryImage(imageId);
      }
      
      const updatedImages = galleryImages.filter(img => img.id !== imageId);
      setGalleryImages(updatedImages);
      syncImagesWithFormData(updatedImages);
    } catch (err) {
      setError('Error al eliminar imagen del servidor');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const totalImages = galleryImages.length;
  const totalSize = galleryImages.reduce((acc, img) => acc + (img.fileSize || 0), 0);
  
  // Extraer tipos de archivo de manera más inteligente
  const imageTypes = [...new Set(galleryImages.map(img => {
    const url = img.url;
    // Buscar extensión en la URL
    const extension = url.split('.').pop()?.split('?')[0]?.toUpperCase();
    if (extension && ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'AVIF'].includes(extension)) {
      return extension;
    }
    // Si no hay extensión clara, intentar detectar por el tipo MIME
    if (url.includes('image/')) {
      const mimeType = url.match(/image\/([^;?]+)/)?.[1]?.toUpperCase();
      return mimeType || 'IMG';
    }
    return 'IMG';
  }))];

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ImageIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Multimedia</h3>
              <p className="text-sm text-gray-600">Gestiona las imágenes de tu propiedad</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            {error && <AlertCircle className="w-4 h-4 text-red-500" />}
            {!loading && !error && galleryImages.length > 0 && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
        </div>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Imágenes</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalImages}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Tamaño Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {totalSize > 0 ? (
                totalSize > 1024 * 1024 ? 
                  `${(totalSize / 1024 / 1024).toFixed(1)} MB` : 
                  `${(totalSize / 1024).toFixed(1)} KB`
              ) : '0 KB'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Tipos</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {imageTypes.length > 0 ? (
                imageTypes.length <= 3 ? 
                  imageTypes.join(', ') : 
                  `${imageTypes.slice(0, 2).join(', ')} +${imageTypes.length - 2}`
              ) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Área de carga */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Subir imágenes</h3>
            <p className="text-sm text-gray-600 mt-1">
              Arrastra y suelta imágenes aquí, o haz clic para seleccionar
            </p>
            {!propertyId && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  💡 Las imágenes se guardarán temporalmente hasta que guardes la propiedad
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Subiendo...</span>
                </div>
              ) : (
                'Seleccionar archivos'
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, JPEG hasta 10MB
          </p>
        </div>
      </div>

      {/* Galería de imágenes */}
      {galleryImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">Imágenes de galería</h4>
            {featuredImageId && (
              <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                <Star className="w-4 h-4" fill="#facc15" />
                <span>Imagen destacada seleccionada</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map((image, index) => (
              <div key={image.id} className={`relative group bg-white rounded-lg border ${featuredImageId === image.id ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-gray-200'} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.altText || `Imagen ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Botón de estrella simplificado y más grande */}
                  <button
                    type="button"
                    className={`absolute top-3 left-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 hover:bg-white transition-all duration-200 ${featuredImageId === image.id ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500'}`}
                    title={featuredImageId === image.id ? 'Imagen destacada' : 'Marcar como destacada'}
                    onClick={() => {
                      handleSetFeatured(image);
                    }}
                  >
                    <Star className="w-5 h-5" fill={featuredImageId === image.id ? '#facc15' : 'none'} />
                  </button>
                  
                  {/* Botón de eliminar en esquina superior derecha */}
                  <button
                    type="button"
                    className="absolute top-3 right-3 p-2 rounded-full bg-red-500/90 backdrop-blur-sm shadow-lg border border-red-200 hover:bg-red-500 transition-all duration-200 text-white"
                    title="Eliminar imagen"
                    onClick={() => handleDeleteGalleryImage(image.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  {/* Botón de ver en esquina inferior derecha */}
                  <button
                    type="button"
                    className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 hover:bg-white transition-all duration-200 text-gray-700"
                    title="Ver imagen"
                    onClick={() => window.open(image.url, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Información de la imagen */}
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {image.url.split('/').pop()?.split('.')[0] || 'Imagen'}
                    </span>
                    {image.fileSize && (
                      <span className="text-xs text-gray-500">
                        {(image.fileSize / 1024 / 1024).toFixed(1)} MB
                      </span>
                    )}
                  </div>
                  {image.altText && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {image.altText}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay imágenes */}
      {!loading && galleryImages.length === 0 && (
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {!propertyId ? 'Guarda la propiedad primero' : 'No hay imágenes'}
          </h3>
          <p className="text-sm text-gray-600">
            {!propertyId 
              ? 'Guarda la propiedad para poder subir imágenes a la galería'
              : 'Sube algunas imágenes para crear una galería atractiva para tu propiedad'
            }
          </p>
          {!propertyId && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Puedes continuar con los otros pasos y volver aquí después de guardar
              </p>
            </div>
          )}
        </div>
      )}

      {/* Validación de errores */}
      {errors.images && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <X className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-800">{errors.images}</span>
          </div>
        </div>
      )}

      {/* Campos adicionales de multimedia */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900">Videos y Tours Virtuales</h4>
        
        {/* Video URL */}
        <div>
          <ValidatedInput
            type="url"
            id="videoUrl"
            name="videoUrl"
            label="URL del Video"
            value={formData.videoUrl || ""}
            onChange={handleChange}
            placeholder="https://youtube.com/watch?v=..."
            error={errors.videoUrl}
          />
          <p className="mt-1 text-sm text-gray-500">
            Enlace a video de YouTube, Vimeo u otra plataforma
          </p>
        </div>

        {/* Virtual Tour URL */}
        <div>
          <ValidatedInput
            type="url"
            id="virtualTourUrl"
            name="virtualTourUrl"
            label="URL del Tour Virtual"
            value={formData.virtualTourUrl || ""}
            onChange={handleChange}
            placeholder="https://example.com/tour..."
            error={errors.virtualTourUrl}
          />
          <p className="mt-1 text-sm text-gray-500">
            Enlace a tour virtual 360° o similar
          </p>
        </div>

        {/* Featured Image URL */}
        <div>
          <ValidatedInput
            type="url"
            id="featuredImage"
            name="featuredImage"
            label="URL de Imagen Destacada"
            value={formData.featuredImage || ""}
            onChange={handleChange}
            placeholder="https://example.com/featured-image.jpg"
            error={errors.featuredImage}
          />
          <p className="mt-1 text-sm text-gray-500">
            URL de la imagen principal de la propiedad
          </p>
        </div>
      </div>
    </div>
  );
} 