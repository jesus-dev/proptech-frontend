"use client";
import React, { useEffect, useState } from "react";
import { PropertyFormData, PropertyFormErrors } from "../../hooks/usePropertyForm";
import { 
  ArrowDownTrayIcon, 
  TrashIcon, 
  DocumentIcon,
  PhotoIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { getPrivateFiles, uploadPrivateFile, deletePrivateFile, PrivateFile } from '../../services/privateFileService';
import { imageUploadService } from '../../services/imageUploadService';
import ValidatedInput from "@/components/form/input/ValidatedInput";

interface PrivateFilesStepProps {
  formData: PropertyFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  errors: PropertyFormErrors;
  removePrivateFile: (indexToRemove: number) => void;
}

const downloadPrivateFile = async (fileUrl: string, fileName: string) => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Error al descargar el archivo');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    alert('Error al descargar el archivo');
  }
};

// Función para obtener el icono según el tipo de archivo
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
    return PhotoIcon;
  }
  if (['pdf'].includes(extension || '')) {
    return DocumentIcon;
  }
  if (['doc', 'docx'].includes(extension || '')) {
    return DocumentTextIcon;
  }
  if (['xls', 'xlsx'].includes(extension || '')) {
    return DocumentTextIcon;
  }
  if (['zip', 'rar', '7z'].includes(extension || '')) {
    return ArchiveBoxIcon;
  }
  return DocumentIcon;
};

// Función para formatear el tamaño del archivo
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function PrivateFilesStep({ formData, handleChange, errors, removePrivateFile }: PrivateFilesStepProps) {
  const [privateFiles, setPrivateFiles] = useState<PrivateFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const propertyId = (formData as any).id || formData.propertyId;

  // Cargar archivos privados al montar o cuando cambia el propertyId
  useEffect(() => {
    if (propertyId) {
      setLoading(true);
      getPrivateFiles(propertyId)
        .then(setPrivateFiles)
        .catch(() => setPrivateFiles([]))
        .finally(() => setLoading(false));
    }
  }, [propertyId]);

  // Sincronizar archivos del formData cuando no hay propertyId
  useEffect(() => {
    if (!propertyId) {
      const formFiles = formData.privateFiles || [];
      setPrivateFiles(formFiles.map((file: any, index: number) => ({
        id: index,
        propertyId: 0, // Valor temporal cuando no hay propertyId aún
        fileName: file.fileName || file.name || 'unknown',
        url: file.url || file,
        fileType: (file.fileName || file.name || '').split('.').pop()?.toUpperCase() || 'UNKNOWN',
        fileSize: 0
      })));
    }
  }, [propertyId, formData.privateFiles]);

  // Subir archivos
  const handlePrivateFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      
      if (propertyId) {
        // Si ya existe propertyId, subir directamente al backend
        for (const file of files) {
          await uploadPrivateFile(propertyId, file);
        }
        const filesList = await getPrivateFiles(propertyId);
        setPrivateFiles(filesList);
      } else {
        // Si no hay propertyId, usar handleChange que maneja la subida automáticamente
        // handleChange ya sube los archivos y actualiza formData
        // El useEffect se encargará de actualizar el estado local cuando formData.privateFiles cambie
        handleChange(e);
      }
    } catch (err) {
      console.error('Error uploading private files:', err);
      alert('Error al subir archivos. Por favor, intenta nuevamente.');
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Eliminar archivo
  const handleRemovePrivateFile = async (fileId: number) => {
    setLoading(true);
    try {
      if (propertyId) {
        // Si hay propertyId, eliminar del backend
        await deletePrivateFile(fileId);
        setPrivateFiles(privateFiles.filter(f => f.id !== fileId));
      } else {
        // Si no hay propertyId, eliminar del formData
        const fileIndex = privateFiles.findIndex(f => f.id === fileId);
        if (fileIndex !== -1) {
          removePrivateFile(fileIndex);
          setPrivateFiles(privateFiles.filter(f => f.id !== fileId));
        }
      }
    } catch (err) {
      console.error('Error deleting private file:', err);
      alert('Error al eliminar archivo. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const input = document.getElementById('privateFiles') as HTMLInputElement;
      if (input) {
        input.files = e.dataTransfer.files;
        handlePrivateFileChange({ target: { files: e.dataTransfer.files } } as any);
      }
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Área de subida de archivos */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
            <CloudArrowUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subir Archivos</h3>
        </div>

        {/* Drag & Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => {
            if (!uploading) {
              const input = document.getElementById('privateFiles') as HTMLInputElement;
              if (input) {
                input.click();
              }
            }
          }}
        >
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mx-auto">
              <CloudArrowUpIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {dragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí o haz clic para seleccionar'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP, RAR, JPG, JPEG, PNG, GIF
              </p>
            </div>

            <div className="relative">
              <input
                type="file"
                id="privateFiles"
                name="privateFiles"
                onChange={handlePrivateFileChange}
                multiple={true}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
                className="hidden"
                disabled={uploading}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!uploading) {
                    const input = document.getElementById('privateFiles') as HTMLInputElement;
                    if (input) {
                      input.click();
                    }
                  }
                }}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-5 h-5" />
                    Seleccionar Archivos
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Información de seguridad */}
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-start">
            <ShieldCheckIcon className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                Archivos Seguros y Privados
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Estos archivos solo serán visibles para ti y tu equipo. No aparecerán en el sitio público.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de archivos */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando archivos...</p>
          </div>
        </div>
      ) : privateFiles.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                <DocumentIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Archivos Privados
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {privateFiles.length} archivo{privateFiles.length !== 1 ? 's' : ''} adjunto{privateFiles.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {privateFiles.map((file) => {
              const FileIcon = getFileIcon(file.fileName);
              return (
                <div
                  key={file.id}
                  className="group relative bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-4 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                                             <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
                         <FileIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                       </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.fileName}
                        </h4>
                                                 <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                           {file.fileSize && (
                             <span>{formatFileSize(file.fileSize)}</span>
                           )}
                           {file.fileType && (
                             <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                               {file.fileType.toUpperCase()}
                             </span>
                           )}
                         </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => downloadPrivateFile(file.url, file.fileName)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200"
                        title="Descargar archivo"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Descargar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePrivateFile(file.id)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200"
                        title="Eliminar archivo"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No hay archivos privados
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sube documentos privados que solo serán visibles en tu CRM
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <ShieldCheckIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Archivos seguros y privados</span>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Tipos de archivos recomendados
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
              <div>• Contratos y documentos legales</div>
              <div>• Notas internas y comentarios</div>
              <div>• Documentos financieros</div>
              <div>• Planos y especificaciones técnicas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 