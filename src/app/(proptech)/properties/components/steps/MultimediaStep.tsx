"use client";
import React, { useState, useEffect } from "react";
import { PropertyFormData, PropertyFormErrors } from "../../hooks/usePropertyForm";
import { X, Upload, Image as ImageIcon, Loader2, Video, Star } from "lucide-react";
import { 
  getGalleryImages, 
  uploadGalleryImage, 
  deleteGalleryImage,
  setImageAsFeatured,
  type GalleryImage 
} from "../../services/galleryImageService";

interface MultimediaStepProps {
  formData: PropertyFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  removeFeaturedImage: () => void;
  errors: PropertyFormErrors;
  propertyId?: string;
  setFormData?: (data: Partial<PropertyFormData>) => void;
  validate?: () => boolean;
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
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [settingFeaturedId, setSettingFeaturedId] = useState<number | null>(null);

  // Cargar imágenes de galería si tenemos propertyId
  useEffect(() => {
    if (propertyId) {
      loadGalleryImages();
    }
  }, [propertyId]);

  const loadGalleryImages = async () => {
    if (!propertyId) return;
    
    setLoadingGallery(true);
    try {
      const images = await getGalleryImages(propertyId);
      console.log('🖼️ Loaded gallery images:', images.length, images);
      setGalleryImages(images);
    } catch (error) {
      console.error('Error loading gallery images:', error);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!propertyId) {
      console.warn('Cannot upload gallery image without propertyId');
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      // Subir todas las imágenes seleccionadas
      const uploadPromises = Array.from(files).map(file => 
        uploadGalleryImage(propertyId, file)
      );
      
      const uploadedImages = await Promise.all(uploadPromises);
      console.log('✅ Uploaded gallery images:', uploadedImages);
      
      // Recargar la galería
      await loadGalleryImages();
      
      // Limpiar el input
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading gallery image:', error);
      alert('Error al subir las imágenes. Por favor, intenta nuevamente.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteGalleryImage = async (imageId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
      return;
    }

    setDeletingImageId(imageId);
    try {
      await deleteGalleryImage(imageId);
      console.log('✅ Deleted gallery image:', imageId);
      
      // Actualizar la lista local
      setGalleryImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      alert('Error al eliminar la imagen. Por favor, intenta nuevamente.');
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleSetAsFeatured = async (imageId: number, imageUrl: string) => {
    setSettingFeaturedId(imageId);
    try {
      await setImageAsFeatured(imageId);
      console.log('✅ Set image as featured:', imageId);
      
      // Actualizar la imagen destacada en el formData
      if (setFormData) {
        setFormData({ featuredImage: imageUrl });
      }
      
      alert('Imagen establecida como destacada correctamente');
    } catch (error) {
      console.error('Error setting featured image:', error);
      alert('Error al establecer imagen destacada. Por favor, intenta nuevamente.');
    } finally {
      setSettingFeaturedId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Featured Image */}
      <div>
        <label
          htmlFor="featuredImage"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Imagen Destacada
        </label>
        
        {formData.featuredImage ? (
          <div className="relative group">
            <img
              src={formData.featuredImage}
              alt="Imagen destacada"
              className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={removeFeaturedImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-brand-500 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Haz clic para subir una imagen destacada
            </p>
            <input
              type="file"
              id="featuredImage"
              name="featuredImage"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="featuredImage"
              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-500 hover:bg-brand-600 cursor-pointer"
            >
              Seleccionar Imagen
            </label>
          </div>
        )}
        
        {errors.featuredImage && (
          <p className="mt-1 text-sm text-red-500">{errors.featuredImage}</p>
        )}
      </div>

      {/* Gallery Images - Para propiedades existentes */}
      {propertyId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Galería de Imágenes (Backend)
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Estas imágenes están almacenadas en el servidor y asociadas a esta propiedad
          </p>

          {/* Loading State */}
          {loadingGallery && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Cargando galería...
              </span>
            </div>
          )}

          {/* Gallery Grid */}
          {!loadingGallery && galleryImages.length > 0 && (
            <>
              <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                Total de imágenes: {galleryImages.length}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {galleryImages.map((image, index) => {
                  console.log(`🖼️ Rendering image ${index + 1}/${galleryImages.length}:`, image.url);
                  const isFeatured = formData.featuredImage === image.url;
                  return (
                    <div key={image.id} className={`relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden ${isFeatured ? 'ring-2 ring-yellow-500' : ''}`}>
                      <div className="relative w-full h-32">
                        <img
                          src={image.url}
                          alt={image.altText || `Imagen ${image.id}`}
                          className="w-full h-full object-cover"
                          onLoad={() => {
                            console.log(`✅ Successfully loaded image ${index + 1}:`, image.url);
                          }}
                          onError={(e) => {
                            console.error(`❌ Failed to load image ${index + 1}:`, image.url);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        {/* Placeholder que aparece si la imagen falla */}
                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500" style={{ zIndex: -1 }}>
                          <div className="text-center text-xs">
                            <svg className="w-8 h-8 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <p>Imagen {index + 1}</p>
                          </div>
                        </div>
                        {/* Badge de destacada */}
                        {isFeatured && (
                          <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                            <Star className="h-3 w-3 fill-current" />
                            <span>Destacada</span>
                          </div>
                        )}
                      </div>
                      {/* Botones de acción */}
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          type="button"
                          onClick={() => handleSetAsFeatured(image.id, image.url)}
                          disabled={settingFeaturedId === image.id || isFeatured}
                          className={`${
                            isFeatured 
                              ? 'bg-yellow-600' 
                              : 'bg-yellow-500 hover:bg-yellow-600'
                          } text-white rounded-full p-1 disabled:opacity-50`}
                          title={isFeatured ? 'Ya es destacada' : 'Marcar como destacada'}
                        >
                          {settingFeaturedId === image.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Star className={`h-3 w-3 ${isFeatured ? 'fill-current' : ''}`} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryImage(image.id)}
                          disabled={deletingImageId === image.id}
                          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                          title="Eliminar imagen"
                        >
                          {deletingImageId === image.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Empty State */}
          {!loadingGallery && galleryImages.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                No hay imágenes en la galería
              </p>
            </div>
          )}

          {/* Upload Button */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-brand-500 transition-colors">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {uploadingImage ? 'Subiendo imágenes...' : 'Agregar más imágenes a la galería'}
            </p>
            <input
              type="file"
              id="galleryImages"
              accept="image/*"
              multiple
              onChange={handleGalleryImageUpload}
              disabled={uploadingImage}
              className="hidden"
            />
            <label
              htmlFor="galleryImages"
              className={`mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                uploadingImage 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-brand-500 hover:bg-brand-600 cursor-pointer'
              }`}
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar Imágenes
                </>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Gallery Images - Para propiedades nuevas (sin propertyId) */}
      {!propertyId && formData.images && formData.images.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Galería de Imágenes (Temporal)
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Estas imágenes se subirán cuando guardes la propiedad
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload for new properties */}
      {!propertyId && (
        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Agregar Imágenes
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-brand-500 transition-colors">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>
            <input
              type="file"
              id="images"
              name="images"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="images"
              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-500 hover:bg-brand-600 cursor-pointer"
            >
              Seleccionar Imágenes
            </label>
          </div>
          
          {errors.images && (
            <p className="mt-1 text-sm text-red-500">{errors.images}</p>
          )}
        </div>
      )}

      {/* Video URL */}
      <div>
        <label
          htmlFor="videoUrl"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          URL del Video
        </label>
        <div className="relative">
          <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="url"
            id="videoUrl"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className={`w-full pl-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.videoUrl ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
        {errors.videoUrl && (
          <p className="mt-1 text-sm text-red-500">{errors.videoUrl}</p>
        )}
      </div>

      {/* Virtual Tour URL */}
      <div>
        <label
          htmlFor="virtualTourUrl"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          URL del Tour Virtual
        </label>
        <input
          type="url"
          id="virtualTourUrl"
          name="virtualTourUrl"
          value={formData.virtualTourUrl}
          onChange={handleChange}
          placeholder="https://..."
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.virtualTourUrl ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.virtualTourUrl && (
          <p className="mt-1 text-sm text-red-500">{errors.virtualTourUrl}</p>
        )}
      </div>
    </div>
  );
}

