"use client";

import React, { useState } from 'react';
import { AgencyFormData } from '../types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Upload, Image as ImageIcon, Edit } from 'lucide-react';
import { apiClient } from '@/lib/api';
import ImageCropModal from '@/components/common/ImageCropModal';

interface AgencyFormProps {
  formData: AgencyFormData;
  setFormData: (data: AgencyFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

export default function AgencyForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing = false,
  isLoading = false,
}: AgencyFormProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pendingImageBlob, setPendingImageBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalLogoUrl, setOriginalLogoUrl] = useState<string>('');

  const handleInputChange = (field: keyof AgencyFormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    // Leer la imagen y mostrar el modal de edición
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setShowCropModal(true);
      setUploadError(null);
    };
    reader.readAsDataURL(file);

    // Resetear el input
    e.target.value = '';
  };

  const handleCropComplete = (croppedImageBlob: Blob) => {
    try {
      setShowCropModal(false);
      setUploadError(null);

      // Guardar el blob para subirlo después al guardar el formulario
      setPendingImageBlob(croppedImageBlob);
      
      // Crear URL local para previsualización
      const localUrl = URL.createObjectURL(croppedImageBlob);
      setPreviewUrl(localUrl);
      
      // Guardar la URL original si aún no lo hemos hecho
      if (!originalLogoUrl && formData.logoUrl) {
        setOriginalLogoUrl(formData.logoUrl.split('?')[0]);
      }
      
    } catch (error) {
      console.error('Error processing image:', error);
      setUploadError('Error al procesar la imagen. Por favor intenta nuevamente.');
    } finally {
      setSelectedImage(null);
    }
  };

  const handleDeleteLogo = () => {
    // Si hay una imagen pendiente, solo limpiar el estado local
    if (pendingImageBlob || previewUrl) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPendingImageBlob(null);
      setPreviewUrl(null);
      return;
    }
    
    // Si hay un logo guardado en el servidor, marcarlo para eliminar al guardar
    if (formData.logoUrl) {
      if (!originalLogoUrl) {
        setOriginalLogoUrl(formData.logoUrl.split('?')[0]);
      }
      handleInputChange('logoUrl', '');
    }
  };

  const uploadPendingImage = async (): Promise<string | null> => {
    if (!pendingImageBlob) return null;

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', pendingImageBlob, 'logo.jpg');
      uploadFormData.append('fileName', 'logo.jpg');
      
      // Enviar URL de logo anterior para que lo elimine del servidor
      if (originalLogoUrl) {
        uploadFormData.append('oldLogoUrl', originalLogoUrl);
      }

      // axios detecta automáticamente FormData y configura el Content-Type correctamente
      const response = await apiClient.post('/api/agencies/upload-logo', uploadFormData);

      const result = response.data;
      return result.fileUrl;
      
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const deleteLogoFromServer = async () => {
    if (!originalLogoUrl) return;
    
    try {
      await apiClient.delete('/api/agencies/delete-logo', {
        data: { logoUrl: originalLogoUrl },
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedImage(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      setUploadError(null);

      // Si hay una imagen pendiente, subirla primero
      if (pendingImageBlob) {
        const newLogoUrl = await uploadPendingImage();
        if (newLogoUrl) {
          handleInputChange('logoUrl', newLogoUrl);
          
          // Esperar un momento para que el estado se actualice
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Limpiar el estado local
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPendingImageBlob(null);
        setPreviewUrl(null);
        setOriginalLogoUrl('');
      } 
      // Si se eliminó el logo pero había uno original, eliminarlo del servidor
      else if (!formData.logoUrl && originalLogoUrl) {
        await deleteLogoFromServer();
        setOriginalLogoUrl('');
      }

      // Llamar al onSubmit original
      onSubmit(e);
      
    } catch (error) {
      console.error('Error in form submit:', error);
      setUploadError('Error al procesar el logo. Por favor intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Nombre de la agencia"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="+595 21 555-1234"
            pattern="^\+595\s?\d{2,3}\s?\d{3}\s?\d{3}$"
            title="Formato: +595 21 555-1234"
          />
          <p className="text-xs text-gray-500 mt-1">Formato paraguayo: +595 21 555-1234</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="contacto@agencia.com"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sitio Web
          </label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="www.agencia.com"
          />
        </div>

        {/* Logo */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Logo de la Agencia
          </label>
          
          <div className="flex flex-col md:flex-row gap-4 items-start">
            {/* Preview del logo */}
            <div className="flex-shrink-0 relative">
              {(previewUrl || formData.logoUrl) ? (
                <>
                  <div className="relative w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
                    <img
                      key={previewUrl || formData.logoUrl}
                      src={previewUrl || getEndpoint(formData.logoUrl)}
                      alt="Logo preview"
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ELogo%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <label
                    htmlFor="logo-upload"
                    className="absolute -bottom-2 -right-2 p-2 bg-brand-600 text-white rounded-full cursor-pointer hover:bg-brand-700 transition-colors shadow-lg"
                    title="Editar logo"
                  >
                    <Edit className="w-4 h-4" />
                  </label>
                </>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Controles de carga */}
            <div className="flex-1 space-y-3">
              {/* Botón de carga */}
              <div>
                <label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {uploading ? (
                    <>
                      <LoadingSpinner />
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Seleccionar Logo</span>
                    </>
                  )}
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Formatos: JPG, PNG, GIF, WEBP (máx. 5MB)
                </p>
              </div>

              {/* Error de carga */}
              {uploadError && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                  {uploadError}
                </div>
              )}

              {/* Campo de URL manual (opcional) */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  O ingresa una URL manualmente
                </label>
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl || ''}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>

              {/* Botón para eliminar logo */}
              {(previewUrl || formData.logoUrl) && (
                <button
                  type="button"
                  onClick={handleDeleteLogo}
                  disabled={uploading}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                >
                  {uploading ? 'Eliminando...' : 'Eliminar logo'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Dirección
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Av. Principal 123, Ciudad"
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Descripción de la agencia..."
          />
        </div>

        {/* Estado Activo */}
        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={(e) => handleInputChange('active', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Agencia activa
            </span>
          </label>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner />
              {isEditing ? 'Actualizando...' : 'Creando...'}
            </div>
          ) : (
            isEditing ? 'Actualizar' : 'Crear'
          )}
        </button>
      </div>

      {/* Modal de edición de imagen */}
      {showCropModal && selectedImage && (
        <ImageCropModal
          imageSrc={selectedImage}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          circularCrop={false}
        />
      )}
    </form>
  );
} 