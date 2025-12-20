"use client";
import React, { useState, useEffect } from "react";
import { PropertyFormData, PropertyFormErrors } from "../../hooks/usePropertyForm";
import { X, Upload, Image as ImageIcon, Loader2, Video, Star, GripVertical } from "lucide-react";
import { 
  getGalleryImages, 
  uploadGalleryImage, 
  deleteGalleryImage,
  setImageAsFeatured,
  updateImageOrder,
  type GalleryImage 
} from "../../services/galleryImageService";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableImageItemProps {
  image: GalleryImage;
  index: number;
  isFeatured: boolean;
  onSetFeatured: (imageId: number, imageUrl: string) => void;
  onDelete: (imageId: number) => void;
  settingFeaturedId: number | null;
  deletingImageId: number | null;
}

function SortableImageItem({ 
  image, 
  index, 
  isFeatured, 
  onSetFeatured, 
  onDelete, 
  settingFeaturedId, 
  deletingImageId 
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden ${
        isFeatured ? 'ring-2 ring-yellow-500' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 bg-gray-700/80 text-white rounded p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Arrastra para reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="relative w-full h-32">
        <img
          src={image.url}
          alt={image.altText || `Imagen ${image.id}`}
          className="w-full h-full object-cover"
          onLoad={() => {
            // Image loaded successfully
          }}
          onError={(e) => {
            // Silenciosamente ocultar imagen si no se puede cargar (archivo no existe)
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            // No generar error en consola - es esperado que algunas imágenes puedan no existir
          }}
        />
        {/* Placeholder */}
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
          <div className="absolute top-1 left-12 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
            <Star className="h-3 w-3 fill-current" />
            <span>Destacada</span>
          </div>
        )}
      </div>
      {/* Botones de acción */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          onClick={() => onSetFeatured(image.id, image.url)}
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
          onClick={() => onDelete(image.id)}
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
}

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

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      setGalleryImages(images);
    } catch (error) {
      console.error('❌ Error loading gallery images:', error);
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
      
      await Promise.all(uploadPromises);
      
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
      
      // Actualizar la imagen destacada en el formData usando handleChange
      const syntheticEvent = {
        target: {
          name: 'featuredImage',
          value: imageUrl
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      handleChange(syntheticEvent);
      
      // Recargar galería para actualizar el flag isFeatured
      await loadGalleryImages();
      
      alert('✅ Imagen establecida como destacada correctamente');
    } catch (error) {
      console.error('Error setting featured image:', error);
      alert('❌ Error al establecer imagen destacada. Por favor, intenta nuevamente.');
    } finally {
      setSettingFeaturedId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = galleryImages.findIndex((img) => img.id === active.id);
    const newIndex = galleryImages.findIndex((img) => img.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Guardar el orden anterior por si necesitamos revertir
    const previousImages = [...galleryImages];

    // Actualizar orden localmente
    const reorderedImages = arrayMove(galleryImages, oldIndex, newIndex);
    setGalleryImages(reorderedImages);

    // Actualizar todos los orderIndex en el backend
    try {
      // Actualizar cada imagen con su nuevo orderIndex
      const updatePromises = reorderedImages.map((image, index) => {
        if (image.orderIndex !== index) {
          return updateImageOrder(image.id, index);
        }
        return Promise.resolve(image);
      });
      
      await Promise.all(updatePromises);
      
      // Recargar para sincronizar con el backend
      await loadGalleryImages();
    } catch (error) {
      console.error('❌ Error updating image order:', error);
      // Revertir cambios en caso de error
      setGalleryImages(previousImages);
      alert('Error al actualizar el orden. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Gallery Images - Para propiedades existentes */}
      {propertyId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Galería de Imágenes
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Arrastra las imágenes para ordenarlas. Haz clic en la estrella para marcar como destacada.
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
              <div className="mb-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span>Total de imágenes: {galleryImages.length}</span>
                <span className="text-xs text-gray-500">• Arrastra para reordenar</span>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={galleryImages.map((img) => img.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    {galleryImages.map((image, index) => {
                      const isFeatured = image.isFeatured || formData.featuredImage === image.url;
                      return (
                        <SortableImageItem
                          key={image.id}
                          image={image}
                          index={index}
                          isFeatured={isFeatured}
                          onSetFeatured={handleSetAsFeatured}
                          onDelete={handleDeleteGalleryImage}
                          settingFeaturedId={settingFeaturedId}
                          deletingImageId={deletingImageId}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
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
                  onError={(e) => {
                    // Silenciosamente ocultar imagen si no se puede cargar
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
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

      {/* Reel Video URL */}
      <div>
        <label
          htmlFor="reelVideoUrl"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          URL del Video Reel (Vertical)
        </label>
        <div className="relative">
          <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="url"
            id="reelVideoUrl"
            name="reelVideoUrl"
            value={formData.reelVideoUrl || ''}
            onChange={handleChange}
            placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
            className={`w-full pl-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.reelVideoUrl ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Video corto tipo Reels (formato vertical 9:16)
        </p>
        {errors.reelVideoUrl && (
          <p className="mt-1 text-sm text-red-500">{errors.reelVideoUrl}</p>
        )}
      </div>

      {/* Full Video URL */}
      <div>
        <label
          htmlFor="fullVideoUrl"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          URL del Video Completo (Horizontal)
        </label>
        <div className="relative">
          <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="url"
            id="fullVideoUrl"
            name="fullVideoUrl"
            value={formData.fullVideoUrl || ''}
            onChange={handleChange}
            placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
            className={`w-full pl-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.fullVideoUrl ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Video completo tipo tradicional (formato horizontal 16:9)
        </p>
        {errors.fullVideoUrl && (
          <p className="mt-1 text-sm text-red-500">{errors.fullVideoUrl}</p>
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

