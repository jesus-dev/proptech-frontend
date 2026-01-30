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
import { processImageFiles, isHeicFile } from '@/lib/image-utils';
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
      {/* Handle de arrastre - siempre visible para reordenar */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 bg-gray-900 dark:bg-gray-700 text-white rounded-md p-2 cursor-grab active:cursor-grabbing z-20 shadow-lg ring-2 ring-white/30 hover:ring-white/50"
        title="Arrastra para reordenar"
      >
        <GripVertical className="h-5 w-5 shrink-0" aria-hidden />
      </div>

      <div className="relative w-full h-32 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
        <img
          src={image.url}
          alt={image.altText || `Imagen ${image.id}`}
          className="w-full h-full object-cover bg-white pointer-events-none"
          style={{ minHeight: '100%' }}
          onLoad={(e) => {
            console.log('✅ Imagen cargada:', image.id, image.url);
            const placeholder = (e.target as HTMLElement).parentElement?.querySelector('.image-placeholder') as HTMLElement;
            if (placeholder) placeholder.style.display = 'none';
          }}
          onError={(e) => {
            console.error('❌ Error cargando imagen:', image.id, image.url);
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const placeholder = target.parentElement?.querySelector('.image-placeholder') as HTMLElement;
            if (placeholder) {
              placeholder.style.display = 'flex';
              const loadingText = placeholder.querySelector('.loading-text') as HTMLElement;
              const errorMsg = placeholder.querySelector('.error-message') as HTMLElement;
              if (loadingText) loadingText.style.display = 'none';
              if (errorMsg) {
                errorMsg.classList.remove('hidden');
                if (image.url.toLowerCase().endsWith('.heic') || image.url.toLowerCase().endsWith('.heif')) {
                  errorMsg.textContent = 'Formato HEIC no compatible';
                } else {
                  errorMsg.textContent = 'Error al cargar imagen';
                }
              }
            }
          }}
        />
        {/* Placeholder de fondo - visible si la imagen falla o está cargando */}
        <div className="image-placeholder absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 pointer-events-none" style={{ zIndex: 0 }}>
          <div className="text-center text-xs px-2">
            <ImageIcon className="w-6 h-6 mx-auto mb-1 text-gray-400" />
            <p className="text-[10px] loading-text">Cargando...</p>
            <p className="error-message text-[10px] text-red-500 mt-1 font-medium hidden"></p>
            {image.url.toLowerCase().endsWith('.heic') || image.url.toLowerCase().endsWith('.heif') ? (
              <p className="text-[10px] text-orange-600 mt-1 font-medium">
                ⚠️ Formato HEIC no compatible con navegadores
              </p>
            ) : null}
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
  reorderImages?: (oldIndex: number, newIndex: number) => void;
  removeFeaturedImage: () => void;
  errors: PropertyFormErrors;
  propertyId?: string;
  setFormData?: (data: Partial<PropertyFormData>) => void;
  validate?: () => boolean;
  isProcessingImages?: boolean;
}

function SortableTempImageItem({
  id,
  imageUrl,
  index,
  isFeatured,
  onSetFeatured,
  onDelete,
}: {
  id: string;
  imageUrl: string;
  index: number;
  isFeatured: boolean;
  onSetFeatured: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden ${
        isFeatured ? "ring-2 ring-yellow-500" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 bg-gray-900 dark:bg-gray-700 text-white rounded-md p-2 cursor-grab active:cursor-grabbing z-20 shadow-lg ring-2 ring-white/30 hover:ring-white/50"
        title="Arrastra para reordenar"
      >
        <GripVertical className="h-5 w-5 shrink-0" aria-hidden />
      </div>
      <button
        type="button"
        onClick={onSetFeatured}
        className={`absolute top-2 right-10 z-20 rounded-md p-2 shadow-lg transition-opacity ${
          isFeatured
            ? "bg-yellow-500 text-white ring-2 ring-yellow-300"
            : "bg-gray-900/70 text-gray-300 hover:bg-gray-800 hover:text-white opacity-0 group-hover:opacity-100"
        }`}
        title={isFeatured ? "Imagen destacada" : "Marcar como destacada"}
      >
        <Star className={`h-5 w-5 shrink-0 ${isFeatured ? "fill-current" : ""}`} aria-hidden />
      </button>
      <div className="relative w-full h-32 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
        <img
          src={imageUrl}
          alt={`Imagen ${index + 1}`}
          className="w-full h-full object-cover bg-white pointer-events-none"
          style={{ minHeight: "100%" }}
          onLoad={(e) => {
            const placeholder = (e.target as HTMLElement).parentElement?.querySelector(".image-placeholder") as HTMLElement;
            if (placeholder) placeholder.style.display = "none";
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const placeholder = target.parentElement?.querySelector(".image-placeholder") as HTMLElement;
            if (placeholder) {
              placeholder.style.display = "flex";
              const loadingText = placeholder.querySelector(".loading-text") as HTMLElement;
              const errorMsg = placeholder.querySelector(".error-message") as HTMLElement;
              if (loadingText) loadingText.style.display = "none";
              if (errorMsg) {
                errorMsg.classList.remove("hidden");
                errorMsg.textContent = "Error al cargar imagen";
              }
            }
          }}
        />
        <div className="image-placeholder absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 pointer-events-none" style={{ zIndex: 0 }}>
          <div className="text-center text-xs px-2">
            <span className="loading-text">Cargando...</span>
            <span className="error-message hidden">Error al cargar</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="absolute bottom-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
        title="Eliminar"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export default function MultimediaStep({ 
  formData, 
  handleChange, 
  handleFileChange, 
  removeImage, 
  reorderImages, 
  removeFeaturedImage, 
  errors,
  propertyId,
  setFormData,
  validate,
  isProcessingImages = false,
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
    if (!propertyId) {
      console.warn('⚠️ No propertyId, no se pueden cargar imágenes');
      return;
    }
    
    setLoadingGallery(true);
    try {
      console.log('📥 Cargando imágenes de galería para propiedad:', propertyId);
      const images = await getGalleryImages(propertyId);
      console.log('✅ Imágenes cargadas:', images.length, images);
      setGalleryImages(images);
    } catch (error) {
      console.error('❌ Error loading gallery images:', error);
      // No mostrar alerta, solo loguear el error
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
      console.log('📤 Procesando', files.length, 'imagen(es)...');
      
      // Convertir HEIC a JPG antes de subir
      const filesArray = Array.from(files);
      const heicCount = filesArray.filter(f => isHeicFile(f)).length;
      
      if (heicCount > 0) {
        console.log(`🔄 Convirtiendo ${heicCount} archivo(s) HEIC a JPG...`);
      }
      
      const processedFiles = await processImageFiles(filesArray);
      
      if (heicCount > 0) {
        console.log(`✅ ${heicCount} archivo(s) HEIC convertido(s) a JPG`);
      }
      
      // Subir todas las imágenes procesadas
      const uploadPromises = processedFiles.map(async (file) => {
        try {
          const uploaded = await uploadGalleryImage(propertyId, file);
          console.log('✅ Imagen subida:', uploaded.id, uploaded.url);
          return uploaded;
        } catch (error) {
          console.error('❌ Error subiendo imagen', file.name, ':', error);
          throw error;
        }
      });

      const uploadedImages = await Promise.all(uploadPromises);
      console.log('✅ Todas las imágenes subidas:', uploadedImages);

      // Actualizar galería localmente para previsualizar al instante
      setGalleryImages(prev => {
        const updated = [...prev, ...uploadedImages];
        console.log('🖼️ Galería actualizada, total:', updated.length);
        return updated;
      });
      
      // También recargar desde el backend para asegurar sincronización
      setTimeout(async () => {
        try {
          await loadGalleryImages();
        } catch (error) {
          console.warn('⚠️ Error al recargar galería (no crítico):', error);
        }
      }, 500);
      
      // Limpiar el input
      e.target.value = '';
    } catch (error: any) {
      console.error('❌ Error uploading gallery image:', error);
      const errorMessage = error?.message || 'Error al subir las imágenes. Por favor, intenta nuevamente.';
      alert(errorMessage);
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

          {/* Uploading indicator */}
          {uploadingImage && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm text-blue-700">Subiendo imágenes, por favor espera...</span>
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
              accept="image/*,.heic,.heif,.hif"
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

      {/* Gallery Images - Para propiedades nuevas (sin propertyId) - mismo aspecto que edición */}
      {!propertyId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Galería de Imágenes
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Arrastra las imágenes para ordenarlas. Haz clic en la estrella para marcar como destacada.
          </p>

          {/* Procesando imágenes (evita pantalla en blanco) */}
          {isProcessingImages && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
              <Loader2 className="h-6 w-6 shrink-0 animate-spin text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Procesando imágenes</p>
                <p className="text-xs text-blue-600 dark:text-blue-300">Convirtiendo y preparando las imágenes. Un momento, por favor...</p>
              </div>
            </div>
          )}

          {/* Grid de imágenes (misma estructura que en edición) */}
          {formData.images && formData.images.length > 0 ? (
            <>
              <div className="mb-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span>Total de imágenes: {formData.images.length}</span>
                <span className="text-xs text-gray-500">• Arrastra para reordenar</span>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => {
                  if (!reorderImages) return;
                  const { active, over } = event;
                  if (!over || active.id === over.id) return;
                  const oldIndex = formData.images!.findIndex((_, i) => `temp-${i}` === active.id);
                  const newIndex = formData.images!.findIndex((_, i) => `temp-${i}` === over.id);
                  if (oldIndex !== -1 && newIndex !== -1) reorderImages(oldIndex, newIndex);
                }}
              >
                <SortableContext
                  items={formData.images!.map((_, i) => `temp-${i}`)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    {formData.images.map((image, index) => (
                      <SortableTempImageItem
                        key={`temp-${index}`}
                        id={`temp-${index}`}
                        imageUrl={image}
                        index={index}
                        isFeatured={formData.featuredImage === image}
                        onSetFeatured={() =>
                          handleChange({
                            target: { name: "featuredImage", value: image },
                          } as React.ChangeEvent<HTMLInputElement>)
                        }
                        onDelete={() => removeImage(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg mb-4">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                No hay imágenes en la galería
              </p>
            </div>
          )}

          {/* Área de subida (mismo estilo que en edición) */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-brand-500 transition-colors">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Agregar más imágenes a la galería
            </p>
            <input
              type="file"
              id="images"
              name="images"
              accept="image/*,.heic,.heif,.hif"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="images"
              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-500 hover:bg-brand-600 cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              Seleccionar Imágenes
            </label>
          </div>
          {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
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
          value={formData.virtualTourUrl || ''}
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

