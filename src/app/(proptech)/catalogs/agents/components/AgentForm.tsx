"use client";

import React, { useState } from 'react';
import { AgentFormData } from '../types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { paraguayUtils } from '@/lib/paraguay-config';
import { Upload, Edit } from 'lucide-react';
import { getEndpoint } from '@/lib/api-config';
import ImageCropModal from '@/components/common/ImageCropModal';

interface AgentFormProps {
  formData: AgentFormData;
  setFormData: (data: AgentFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
  agencies: Array<{id: string, name: string, active: boolean}>;
}

export default function AgentForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing = false,
  isLoading = false,
  agencies,
}: AgentFormProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pendingImageBlob, setPendingImageBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string>('');

  const handleInputChange = (field: keyof AgentFormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePhoneChange = (value: string) => {
    const formattedPhone = paraguayUtils.formatPhone(value);
    handleInputChange('phone', formattedPhone);
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
      if (!originalPhotoUrl && formData.photo) {
        setOriginalPhotoUrl(formData.photo.split('?')[0]);
      }
      
    } catch (error) {
      console.error('Error processing image:', error);
      setUploadError('Error al procesar la imagen. Por favor intenta nuevamente.');
    } finally {
      setSelectedImage(null);
    }
  };

  const handleDeletePhoto = () => {
    // Si hay una imagen pendiente, solo limpiar el estado local
    if (pendingImageBlob || previewUrl) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPendingImageBlob(null);
      setPreviewUrl(null);
      return;
    }
    
    // Si hay una foto guardada en el servidor, marcarla para eliminar al guardar
    if (formData.photo) {
      if (!originalPhotoUrl) {
        setOriginalPhotoUrl(formData.photo.split('?')[0]);
      }
      handleInputChange('photo', '');
      handleInputChange('fotoPerfilUrl', '');
    }
  };

  const uploadPendingImage = async (): Promise<string | null> => {
    if (!pendingImageBlob) return null;

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', pendingImageBlob, 'photo.jpg');
      uploadFormData.append('fileName', 'photo.jpg');
      
      // Enviar URL de foto anterior para que la elimine del servidor
      if (originalPhotoUrl) {
        uploadFormData.append('oldPhotoUrl', originalPhotoUrl);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(getEndpoint('/api/agents/upload-photo'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la foto');
      }

      const result = await response.json();
      return result.fileUrl;
      
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const deletePhotoFromServer = async () => {
    if (!originalPhotoUrl) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(getEndpoint('/api/agents/delete-photo'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoUrl: originalPhotoUrl }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la foto');
      }
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
        const newPhotoUrl = await uploadPendingImage();
        if (newPhotoUrl) {
          handleInputChange('photo', newPhotoUrl);
          handleInputChange('fotoPerfilUrl', newPhotoUrl);
          
          // Esperar un momento para que el estado se actualice
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Limpiar el estado local
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPendingImageBlob(null);
        setPreviewUrl(null);
        setOriginalPhotoUrl('');
      } 
      // Si se eliminó la foto pero había una original, eliminarla del servidor
      else if (!formData.photo && originalPhotoUrl) {
        await deletePhotoFromServer();
        setOriginalPhotoUrl('');
      }

      // Llamar al onSubmit original
      onSubmit(e);
      
    } catch (error) {
      console.error('Error in form submit:', error);
      setUploadError('Error al procesar la imagen. Por favor intenta nuevamente.');
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
            name="nombre"
            required
            value={formData.nombre || formData.firstName || ''}
            onChange={(e) => {
              handleInputChange('nombre', e.target.value);
              handleInputChange('firstName', e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Nombre del agente"
          />
        </div>

        {/* Apellido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Apellido *
          </label>
          <input
            type="text"
            name="apellido"
            required
            value={formData.apellido || formData.lastName || ''}
            onChange={(e) => {
              handleInputChange('apellido', e.target.value);
              handleInputChange('lastName', e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Apellido del agente"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email ?? ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="email@ejemplo.com"
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
            value={formData.phone ?? ''}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="+595 981 123-456"
          />
          <p className="text-xs text-gray-500 mt-1">Formato paraguayo: +595 981 123-456</p>
        </div>

        {/* Documento de Identidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Documento de Identidad
          </label>
          <input
            type="text"
            name="dni"
            value={formData.dni ?? ''}
            onChange={(e) => handleInputChange('dni', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="12345678"
          />
        </div>

        {/* Licencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Licencia
          </label>
          <input
            type="text"
            name="license"
            value={formData.license ?? ''}
            onChange={(e) => handleInputChange('license', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="AG-001"
          />
        </div>

        {/* Posición */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Posición
          </label>
          <input
            type="text"
            name="position"
            value={formData.position ?? ''}
            onChange={(e) => handleInputChange('position', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Agente Principal"
          />
        </div>

        {/* Agencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Agencia
          </label>
          <select
            name="agencyId"
            value={formData.agencyId ?? ''}
            onChange={(e) => handleInputChange('agencyId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Seleccionar agencia</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name}
              </option>
            ))}
          </select>
        </div>

        {/* Foto de Perfil */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Foto de Perfil
          </label>
          
          <div className="flex flex-col md:flex-row gap-4 items-start">
            {/* Preview de la foto */}
            <div className="flex-shrink-0 relative">
              {(previewUrl || formData.photo) ? (
                <>
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                    <img 
                      key={previewUrl || formData.photo}
                      src={
                        previewUrl || 
                        (formData.photo?.startsWith('http') ? formData.photo : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${formData.photo}`)
                      }
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ccircle fill="%23ddd" cx="50" cy="50" r="50"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EFoto%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <label
                    htmlFor="agent-photo-upload"
                    className="absolute -bottom-2 -right-2 p-2 bg-brand-600 text-white rounded-full cursor-pointer hover:bg-brand-700 transition-colors shadow-lg"
                    title="Editar foto"
                  >
                    <Edit className="w-4 h-4" />
                  </label>
                </>
              ) : (
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Controles de carga */}
            <div className="flex-1 space-y-3">
              {/* Botón de carga */}
              <div>
                <label 
                  htmlFor="agent-photo-upload" 
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <LoadingSpinner />
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Seleccionar Foto</span>
                    </>
                  )}
                </label>
                <input
                  id="agent-photo-upload"
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

              {/* Botón para eliminar foto */}
              {(previewUrl || formData.photo) && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  disabled={uploading}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                >
                  {uploading ? 'Eliminando...' : 'Eliminar foto'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Biografía */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Biografía
          </label>
          <textarea
            name="bio"
            rows={3}
            value={formData.bio ?? ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Descripción del agente..."
          />
        </div>

        {/* Estado Activo */}
        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={formData.active ?? true}
              onChange={(e) => handleInputChange('active', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Agente activo
            </span>
          </label>
        </div>

        {/* Estado de Autenticación */}
        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive ?? true}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Puede iniciar sesión
            </span>
          </label>
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rol
          </label>
          <select
            value={formData.role ?? 'agente'}
            onChange={(e) => handleInputChange('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="agente">Agente</option>
            <option value="admin">Administrador</option>
            <option value="supervisor">Supervisor</option>
          </select>
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

      {isLoading && (
        <div className="flex justify-center items-center">
          <LoadingSpinner />
        </div>
      )}

      {/* Modal de edición de imagen */}
      {showCropModal && selectedImage && (
        <ImageCropModal
          imageSrc={selectedImage}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          circularCrop={true}
        />
      )}
    </form>
  );
} 