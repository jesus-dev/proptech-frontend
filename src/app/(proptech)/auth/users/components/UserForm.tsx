"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { User, Role } from '@/types/auth';
import { 
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  Camera,
  Trash2,
  Briefcase,
  User as UserIcon,
  Building,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ImageCropModal from '@/components/common/ImageCropModal';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  roles: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_ACTIVATION' | 'LOCKED';
  tenantId?: number;
  agencyId?: number;
  agentId?: number;
  position?: string;
  company?: string;
  website?: string;
  bio?: string;
  license?: string;
  photoUrl?: string;
}

interface UserFormProps {
  user?: User | null;
  roles: Role[];
  tenants: any[];
  agencies: any[];
  isEditing?: boolean;
}

export default function UserForm({ user, roles, tenants, agencies, isEditing = false }: UserFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    password: '',
    roles: user?.roles || [],
    status: (user?.status as any) || 'ACTIVE',
    tenantId: (user as any)?.tenantId || undefined,
    agencyId: (user as any)?.agencyId || undefined,
    agentId: (user as any)?.agentId || undefined,
    position: (user as any)?.position || '',
    company: (user as any)?.company || '',
    website: (user as any)?.website || '',
    bio: (user as any)?.bio || '',
    license: '',
    photoUrl: (user as any)?.photoUrl || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para manejo de foto
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingImageBlob, setPendingImageBlob] = useState<Blob | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const isAgent = formData.roles.includes('AGENT') || formData.roles.includes('AGENCY_ADMIN');

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Manejar crop completo
  const handleCropComplete = (croppedImageBlob: Blob) => {
    setShowCropModal(false);
    const localUrl = URL.createObjectURL(croppedImageBlob);
    setPendingImageBlob(croppedImageBlob);
    setPreviewUrl(localUrl);
    setSelectedImage(null);
  };

  // Eliminar foto
  const handleDeletePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPendingImageBlob(null);
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, photoUrl: '' }));
  };

  // Subir foto al servidor
  const uploadPhoto = async (userId: number, blob: Blob): Promise<string | null> => {
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', blob, 'photo.jpg');
      uploadFormData.append('fileName', 'photo.jpg');

      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiUrl}/api/auth/users/${userId}/upload-photo`, {
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
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      // Validaciones
      if (!formData.firstName?.trim()) {
        toast.error('El nombre es obligatorio');
        return;
      }
      if (!formData.lastName?.trim()) {
        toast.error('El apellido es obligatorio');
        return;
      }
      if (!formData.email?.trim()) {
        toast.error('El email es obligatorio');
        return;
      }
      if (!isEditing && !formData.password?.trim()) {
        toast.error('La contraseña es obligatoria');
        return;
      }
      if (!formData.tenantId) {
        toast.error('Debe seleccionar un tenant');
        return;
      }

      const selectedRoleIds = roles.filter(r => formData.roles.includes(r.name)).map(r => r.id);
      if (selectedRoleIds.length === 0) {
        toast.error('Debe seleccionar al menos un rol');
        return;
      }

      const userData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        roleIds: selectedRoleIds,
        tenantId: formData.tenantId,
        status: formData.status
      };

      if (formData.phone?.trim()) {
        userData.phone = formData.phone.trim();
      }

      if (formData.agencyId) {
        userData.agencyId = formData.agencyId;
      }

      // Datos profesionales si es agente
      if (isAgent) {
        if (formData.position) userData.position = formData.position.trim();
        if (formData.company) userData.company = formData.company.trim();
        if (formData.website) userData.website = formData.website.trim();
        if (formData.bio) userData.bio = formData.bio.trim();
      }

      let savedUser: any;

      if (isEditing && user) {
        // Actualizar
        if (formData.password?.trim()) {
          userData.password = formData.password;
        }
        savedUser = await authService.updateUser(user.id, userData);
        
        // Subir foto si hay una pendiente
        if (pendingImageBlob) {
          await uploadPhoto(user.id, pendingImageBlob);
        }
        
        toast.success('Usuario actualizado exitosamente');
      } else {
        // Crear
        userData.password = formData.password;
        savedUser = await authService.createUser(userData);
        
        // Subir foto si hay una pendiente
        if (pendingImageBlob && savedUser?.id) {
          await uploadPhoto(savedUser.id, pendingImageBlob);
        }
        
        toast.success('Usuario creado exitosamente');
      }

      router.push('/auth/users');
      
    } catch (error: any) {
      console.error('Error saving user:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Error al guardar el usuario';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPhotoUrl = previewUrl || formData.photoUrl;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/auth/users')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEditing ? 'Modifica la información del usuario' : 'Completa los datos para crear un nuevo usuario'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Actualizar' : 'Crear Usuario'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Sección: Foto de Perfil */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5 text-indigo-500" />
              Foto de Perfil
            </h2>
            
            <div className="flex items-center gap-6">
              {/* Preview de foto */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  {currentPhotoUrl ? (
                    <img
                      src={currentPhotoUrl.startsWith('http') ? currentPhotoUrl : `${apiUrl}${currentPhotoUrl}`}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {formData.firstName?.charAt(0)?.toUpperCase() || formData.email?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                {currentPhotoUrl && (
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    className="absolute -bottom-1 -right-1 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                    title="Eliminar foto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Botón de subir */}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {currentPhotoUrl ? 'Cambiar Foto' : 'Subir Foto'}
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  JPG, PNG, GIF o WEBP. Máximo 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Información Personal */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-indigo-500" />
              Información Personal
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Juan"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Pérez"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="juan.perez@ejemplo.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+595 981 123-456"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña {!isEditing && '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={isEditing ? "Dejar vacío para mantener actual" : "••••••••"}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all"
                  required={!isEditing}
                />
                {isEditing && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Deja vacío para mantener la contraseña actual
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                  <option value="SUSPENDED">Suspendido</option>
                  <option value="LOCKED">Bloqueado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección: Organización */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-indigo-500" />
              Organización
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tenant *
                </label>
                <select
                  value={formData.tenantId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, tenantId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all"
                  required
                >
                  <option value="">Seleccionar tenant...</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name || `Tenant ${tenant.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agencia
                </label>
                <select
                  value={formData.agencyId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, agencyId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all"
                >
                  <option value="">Sin agencia asignada</option>
                  {agencies.filter(a => a.active || a.isActive).map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sección: Roles */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              Roles y Permisos
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.roles.includes(role.name)
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, roles: [...prev.roles, role.name] }));
                      } else {
                        setFormData(prev => ({ ...prev, roles: prev.roles.filter(r => r !== role.name) }));
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {role.name}
                  </span>
                </label>
              ))}
            </div>
            {formData.roles.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                {formData.roles.length} rol(es) seleccionado(s)
              </p>
            )}
          </div>

          {/* Sección: Información Profesional (solo si es agente) */}
          {isAgent && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-green-200 dark:border-green-700 p-6">
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Información Profesional del Agente
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cargo / Posición
                  </label>
                  <input
                    type="text"
                    value={formData.position || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Ej: Agente Inmobiliario Senior"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Ej: Inmobiliaria ABC"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sitio Web
                  </label>
                  <input
                    type="text"
                    value={formData.website || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="Ej: miempresa.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Licencia Inmobiliaria
                  </label>
                  <input
                    type="text"
                    value={formData.license || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, license: e.target.value }))}
                    placeholder="Ej: LIC-2024-001"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Biografía / Descripción
                  </label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Cuéntanos sobre tu experiencia profesional..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          )}

        </form>
      </div>

      {/* Modal de Crop */}
      {showCropModal && selectedImage && (
        <ImageCropModal
          imageSrc={selectedImage}
          onComplete={handleCropComplete}
          onCancel={() => {
            setShowCropModal(false);
            setSelectedImage(null);
          }}
          aspectRatio={1}
          circularCrop={true}
        />
      )}
    </div>
  );
}
