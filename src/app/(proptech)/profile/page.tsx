"use client";

import React, { useState, useEffect, useRef } from 'react';
import { authService } from '@/services/authService';
import { authApi } from '@/lib/api';
import { handleApiError } from '@/lib/api';
import { User as BaseUser } from '@/types/auth';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Key, 
  Eye, 
  EyeOff,
  Camera,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Settings,
  Bell,
  Globe,
  Building,
  Building2,
  Briefcase,
  Crown,
  UserCheck,
  Clock,
  BarChart3,
  Heart,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Label from '@/components/form/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Avatar from '@/components/ui/avatar/Avatar';
import AvatarText from '@/components/ui/avatar/AvatarText';
import Switch from '@/components/form/switch/Switch';
import { useSpring, animated } from '@react-spring/web';
import ImageCropModal from '@/components/common/ImageCropModal';
import { Upload, Edit } from 'lucide-react';
import { getEndpoint } from '@/lib/api-config';

// Tipo extendido para el perfil del usuario
interface ProfileUser extends BaseUser {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
  website?: string;
  company?: string;
  position?: string;
  timezone?: string;
  language?: string;
  status?: string;
  photoUrl?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  bio: string;
  website: string;
  company: string;
  position: string;
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
}

interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const TIMEZONES = [
  { value: 'America/Asuncion', label: 'Asunción (GMT-3)' },
  { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
  { value: 'UTC', label: 'UTC (GMT+0)' }
];

const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' }
];

const USER_TYPE_ICONS = {
  ADMIN: Crown,
  MANAGER: Building,
  AGENT: Briefcase,
  VIEWER: Eye,
  CUSTOMER: UserIcon
};

const USER_TYPE_LABELS = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  AGENT: 'Agente',
  VIEWER: 'Visualizador',
  CUSTOMER: 'Cliente'
};

export default function ProfilePage() {
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pendingImageBlob, setPendingImageBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string>('');
 
  // Form states
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    bio: '',
    website: '',
    company: '',
    position: '',
    timezone: 'America/Asuncion',
    language: 'es',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    }
  });

  const [securityData, setSecurityData] = useState<SecurityFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Estado para errores de validación de contraseña
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Validación de campos
  const validateProfile = (data: ProfileFormData) => {
    const errors: { [key: string]: string } = {};
    if (!data.firstName.trim()) errors.firstName = 'El nombre es obligatorio';
    if (!data.lastName.trim()) errors.lastName = 'El apellido es obligatorio';
    if (!data.email.trim()) errors.email = 'El email es obligatorio';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) errors.email = 'Email inválido';
    if (data.phone && !/^\+?\d{6,20}$/.test(data.phone.replace(/\s|-/g, ''))) errors.phone = 'Teléfono inválido';
    return errors;
  };

  // Validar en tiempo real
  useEffect(() => {
    setFormErrors(validateProfile(profileData));
  }, [profileData.firstName, profileData.lastName, profileData.email, profileData.phone]);

  // Validación de cambio de contraseña
  const validatePassword = (data: SecurityFormData) => {
    const errors: { [key: string]: string } = {};
    if (!data.currentPassword) errors.currentPassword = 'Ingresa tu contraseña actual';
    if (!data.newPassword) errors.newPassword = 'Ingresa una nueva contraseña';
    else if (data.newPassword.length < 8) errors.newPassword = 'Mínimo 8 caracteres';
    else if (data.newPassword === data.currentPassword) errors.newPassword = 'Debe ser diferente a la actual';
    if (!data.confirmPassword) errors.confirmPassword = 'Confirma la nueva contraseña';
    else if (data.newPassword !== data.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';
    return errors;
  };

  // Limpiar campos de contraseña cuando se abre el diálogo
  useEffect(() => {
    if (showPasswordDialog) {
      // Limpiar todos los campos de contraseña cuando se abre el diálogo
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
      setPasswordSuccess(null);
      setShowPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [showPasswordDialog]);

  // Validar en tiempo real
  useEffect(() => {
    if (!showPasswordDialog) return;
    setPasswordErrors(validatePassword(securityData));
  }, [securityData, showPasswordDialog]);


  const [userId, setUserId] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Al montar, obtener datos del usuario desde localStorage
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoadingUser(true);
      setApiError(null);
      
      try {
        // Obtener datos del usuario desde localStorage
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData) as any;
          
          // Buscar nombre y apellido en todas las propiedades posibles
          const firstName = parsedUser.firstName || parsedUser.name || parsedUser.first_name || parsedUser.nombre || parsedUser.primerNombre || parsedUser.first || parsedUser.givenName || parsedUser.displayName || '';
          const lastName = parsedUser.lastName || parsedUser.surname || parsedUser.last_name || parsedUser.apellido || parsedUser.segundoNombre || parsedUser.last || parsedUser.familyName || '';
          const phone = parsedUser.phone || parsedUser.telephone || parsedUser.telefono || '';
          
          
          const profileDataToSet = {
            firstName: firstName,
            lastName: lastName,
            email: parsedUser.email || '',
            phone: phone,
            address: '',
            city: '',
            country: 'Paraguay',
            bio: '',
            website: '',
            company: '',
            position: '',
            timezone: 'America/Asuncion',
            language: 'es',
            notifications: {
              email: true,
              push: true,
              sms: false,
              marketing: false
            }
      };
      setProfileData(profileDataToSet);
      setProfileUser(parsedUser);
      setAvatarUrl(parsedUser.photoUrl || null);
      setOriginalPhotoUrl(parsedUser.photoUrl || '');
      
      // Establecer userId desde parsedUser
      const userIdFromUser = parsedUser.id || parsedUser.userId || parsedUser.user_id;
      if (userIdFromUser) {
        setUserId(userIdFromUser);
      }
      
      setIsLoadingUser(false);
    } else {
      // Si no hay token, redirigir al login
      window.location.href = '/login';
    }
  } catch (error) {
    setApiError('Error al cargar datos del usuario');
    setIsLoadingUser(false);
  }
};

loadUserData();
}, []);

  // Referencia al input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejar selección de archivo para foto de perfil
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      // Resetear el input si no hay archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 5MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Leer la imagen y mostrar el modal de edición
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setShowCropModal(true);
    };
    reader.onerror = () => {
      toast.error('Error al leer el archivo');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // Manejar crop completo
  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      setShowCropModal(false);
      setUploadError(null);
      
      // Crear URL local para previsualización PRIMERO
      const localUrl = URL.createObjectURL(croppedImageBlob);
      
      // Guardar el blob para subirlo después
      setPendingImageBlob(croppedImageBlob);
      
      // Guardar la URL original si aún no lo hemos hecho
      if (!originalPhotoUrl && profileUser?.photoUrl) {
        setOriginalPhotoUrl(profileUser.photoUrl.split('?')[0]);
      }
      
      // Establecer previewUrl INMEDIATAMENTE para que se muestre
      setPreviewUrl(localUrl);
      
      // Forzar un re-render inmediato usando flushSync (si está disponible)
      // Si no, usar un pequeño delay
      await new Promise(resolve => {
        // Usar setTimeout para dar tiempo a React de actualizar el estado
        setTimeout(() => {
          resolve(undefined);
        }, 50);
      });
      
      // Subir la imagen (el previewUrl se mantiene visible durante la subida)
      await uploadPhoto(croppedImageBlob);
      
    } catch (error) {
      toast.error('Error al procesar la imagen. Por favor intenta nuevamente.');
      // Si hay error, limpiar el preview
      setPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      setPendingImageBlob(null);
    } finally {
      setSelectedImage(null);
    }
  };

  // Subir foto al servidor
  const uploadPhoto = async (blob: Blob) => {
    if (!userId) {
      toast.error('No se pudo identificar el usuario');
      return;
    }

    try {
      setUploadingPhoto(true);
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', blob, 'photo.jpg');
      uploadFormData.append('fileName', 'photo.jpg');
      
      // Enviar URL de foto anterior para que la elimine del servidor
      if (originalPhotoUrl) {
        uploadFormData.append('oldPhotoUrl', originalPhotoUrl);
      }

      const token = localStorage.getItem('token');
      const endpoint = getEndpoint(`/api/auth/users/${userId}/upload-photo`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al subir la foto');
      }

      const result = await response.json();
      
      // Limpiar previewUrl ANTES de actualizar avatarUrl para evitar conflictos
      const currentPreviewUrl = previewUrl;
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }
      
      // Actualizar estado local
      setAvatarUrl(result.fileUrl);
      setOriginalPhotoUrl(result.fileUrl);
      setPreviewUrl(null);
      setPendingImageBlob(null);
      
      // Actualizar profileUser
      if (profileUser) {
        setProfileUser({ ...profileUser, photoUrl: result.fileUrl });
      }
      
      // Actualizar localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        parsedUser.photoUrl = result.fileUrl;
        localStorage.setItem('user', JSON.stringify(parsedUser));
      }
      
      toast.success('Foto de perfil actualizada exitosamente');
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Error al subir la foto');
      toast.error(error instanceof Error ? error.message : 'Error al subir la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Manejar cancelación del crop
  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Eliminar foto
  const handleDeletePhoto = async () => {
    // Si hay una imagen pendiente, solo limpiar el estado local
    if (pendingImageBlob || previewUrl) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPendingImageBlob(null);
      setPreviewUrl(null);
      return;
    }
    
    // Si hay una foto guardada en el servidor, eliminarla
    if (!userId) return;
    
    try {
      setUploadingPhoto(true);
      
      // Actualizar usuario sin foto
      await authService.updateUser(userId, {
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        photoUrl: null
      });
      
      setAvatarUrl(null);
      setOriginalPhotoUrl('');
      setPreviewUrl(null);
      setPendingImageBlob(null);
      
      if (profileUser) {
        setProfileUser({ ...profileUser, photoUrl: undefined });
      }
      
      // Actualizar localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        parsedUser.photoUrl = null;
        localStorage.setItem('user', JSON.stringify(parsedUser));
      }
      
      toast.success('Foto de perfil eliminada');
      
    } catch (error) {
      toast.error('Error al eliminar la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Guardar cambios en la API
  const handleProfileUpdate = async () => {
    const errors = validateProfile(profileData);
    
    setFormErrors(errors);
    setFormSuccess(null);
    setApiError(null);
    
    if (Object.keys(errors).length > 0) {
      toast.error('Corrige los errores antes de guardar');
      return;
    }
    
    if (!userId) {
      setApiError('No se pudo identificar el usuario.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Solo enviar campos permitidos y requeridos
      const updateData: any = {
        email: profileData.email, // <-- ¡Siempre incluir!
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
      };
      
      await authService.updateUser(userId, updateData);
      
      setFormSuccess('Perfil actualizado exitosamente');
      toast.success('Perfil actualizado exitosamente');
      
      // Actualizar profileUser con los nuevos datos
      if (profileUser) {
        setProfileUser({
          ...profileUser,
          email: updateData.email,
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          phone: updateData.phone,
          fullName: `${updateData.firstName} ${updateData.lastName}`.trim(),
        });
      }
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Exportar datos en JSON o CSV
  const handleExportData = async (format: 'json' | 'csv') => {
    if (!profileUser) return;
    setExportLoading(true);
    setExportSuccess(null);
    try {
      // Simular datos
      const userData = {
        personalInfo: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          country: profileData.country,
          bio: profileData.bio,
          website: profileData.website,
          company: profileData.company,
          position: profileData.position
        },
        preferences: {
          timezone: profileData.timezone,
          language: profileData.language,
          notifications: profileData.notifications
        },
        accountInfo: {
          status: profileUser.status,
          createdAt: profileUser.createdAt,
          lastLogin: profileUser.lastLogin
        }
      };
      let dataStr = '';
      let mime = '';
      let ext = '';
      if (format === 'json') {
        dataStr = JSON.stringify(userData, null, 2);
        mime = 'application/json';
        ext = 'json';
      } else {
        // CSV plano (solo info básica)
        const csvRows = [
          'Campo,Valor',
          ...Object.entries(userData.personalInfo).map(([k, v]) => `${k},${v}`),
          ...Object.entries(userData.preferences).map(([k, v]) => `${k},${typeof v === 'object' ? JSON.stringify(v) : v}`),
          ...Object.entries(userData.accountInfo).map(([k, v]) => `${k},${v}`)
        ];
        dataStr = csvRows.join('\n');
        mime = 'text/csv';
        ext = 'csv';
      }
      const dataBlob = new Blob([dataStr], { type: mime });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
              link.download = `perfil-${profileUser.email}-${new Date().toISOString().split('T')[0]}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportSuccess(`Datos exportados como ${format.toUpperCase()}`);
      toast.success(`Datos exportados como ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Error al exportar datos');
    } finally {
      setExportLoading(false);
    }
  };

  // Cambiar contraseña usando la API real
  const handlePasswordChange = async () => {
    
    const errors = validatePassword(securityData);
    
    setPasswordErrors(errors);
    setPasswordSuccess(null);
    setApiError(null);
    
    if (Object.keys(errors).length > 0) {
      toast.error('Corrige los errores antes de continuar');
      return;
    }
    
    setPasswordLoading(true);
    try {
      const result = await authApi.changePassword({ 
        oldPassword: securityData.currentPassword, 
        newPassword: securityData.newPassword,
        confirmPassword: securityData.confirmPassword
      });
      
      setPasswordSuccess('Contraseña cambiada exitosamente');
      toast.success('Contraseña cambiada exitosamente');
      setShowPasswordDialog(false);
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const errorMessage = handleApiError(error);
      
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };



  // handleAvatarChange ya no se usa, se usa handleFileSelect en su lugar

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="!bg-emerald-100 !text-emerald-950 border-emerald-200 dark:!bg-emerald-900/40 dark:!text-emerald-100 dark:border-emerald-800/60 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Activo
        </Badge>;
      case 'INACTIVE':
        return <Badge className="!bg-red-100 !text-red-950 border-red-200 dark:!bg-red-900/40 dark:!text-red-100 dark:border-red-800/60 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Inactivo
        </Badge>;
      default:
        return <Badge className="!bg-gray-200 !text-gray-950 border-gray-300 dark:!bg-gray-700/60 dark:!text-gray-100 dark:border-gray-600/60">{status}</Badge>;
    }
  };

  // Estado para estadísticas dinámicas
  const [stats, setStats] = useState<{ properties: number; views: number; favorites: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Cargar estadísticas reales al cargar el perfil
  useEffect(() => {
    if (!userId) return;
    setStatsLoading(true);
    setStatsError(null);
    authService.getUserStats(userId)
      .then((data) => {
        setStats(data);
        setStatsLoading(false);
      })
      .catch((err) => {
        let errorMsg = 'No se pudieron cargar las estadísticas.';
        if (err?.response?.data?.error) {
          errorMsg = err.response.data.error;
        } else if (err?.message) {
          errorMsg = err.message;
        }
        setStatsError(errorMsg);
        setStatsLoading(false);
        // Log para depuración
      });
  }, [userId]);

  // Animaciones de conteo
  const propsProperties = useSpring({ val: stats?.properties || 0, from: { val: 0 }, reset: true, delay: 200, config: { duration: 600 } });
  const propsViews = useSpring({ val: stats?.views || 0, from: { val: 0 }, reset: true, delay: 400, config: { duration: 600 } });
  const propsFavorites = useSpring({ val: stats?.favorites || 0, from: { val: 0 }, reset: true, delay: 600, config: { duration: 600 } });

  // Validación del usuario después de todos los hooks
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner message="Cargando perfil del usuario" />
          <p className="text-gray-600 mt-4">Cargando información del perfil...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600">No se pudo cargar el perfil. Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  // DEBUG: Mostrar datos del usuario en la consola



  // Obtener el rol principal del usuario (reemplaza userType)
  const primaryRole = profileUser.roles && profileUser.roles.length > 0 ? profileUser.roles[0] : null;
  const UserTypeIcon = primaryRole ? (USER_TYPE_ICONS[primaryRole as keyof typeof USER_TYPE_ICONS] || UserIcon) : UserIcon;

  const inputBaseClass =
    "w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

  const inputErrorClass =
    "border-red-500 focus:border-red-500 focus:ring-red-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full min-w-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
      {/* Header con avatar editable - Mejorado */}
      <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-8 mb-4 lg:mb-0">
            <div className="relative group">
              {(previewUrl || avatarUrl || profileUser?.photoUrl) ? (
                <div className="relative">
                  <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
                    {(() => {
                      // Priorizar previewUrl sobre todo lo demás
                      let imageSrc: string;
                      if (previewUrl) {
                        imageSrc = previewUrl;
                      } else if (avatarUrl) {
                        imageSrc = avatarUrl.startsWith('http') 
                          ? avatarUrl
                          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${avatarUrl}`;
                      } else if (profileUser?.photoUrl) {
                        imageSrc = profileUser.photoUrl.startsWith('http')
                          ? profileUser.photoUrl
                          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${profileUser.photoUrl}`;
                      } else {
                        imageSrc = '';
                      }
                      
                      return (
                        <img
                          key={previewUrl ? `preview-${previewUrl}` : `avatar-${imageSrc}`}
                          src={imageSrc}
                          alt="Foto de perfil"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="h-28 w-28 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg"><span class="text-4xl font-bold text-white">${(profileUser?.fullName || profileUser?.email || 'U').charAt(0).toUpperCase()}</span></div>`;
                            }
                          }}
                        />
                      );
                    })()}
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full p-3 shadow-xl cursor-pointer transition-all duration-300 opacity-90 group-hover:opacity-100 border-4 border-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Editar foto"
                  >
                    <Edit className="h-6 w-6" />
                  </label>
                  {avatarUrl && !uploadingPhoto && (
                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-xl transition-all duration-300 opacity-90 hover:opacity-100 border-2 border-white hover:scale-110"
                      title="Eliminar foto"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <AvatarText name={profileUser?.fullName || profileUser?.email || 'Usuario'} className="h-28 w-28 text-4xl" />
                  <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full p-3 shadow-xl cursor-pointer transition-all duration-300 opacity-90 group-hover:opacity-100 border-4 border-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Camera className="h-6 w-6" />
                  </label>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  Mi Perfil
                </h1>
                {getStatusBadge(profileUser.status || 'ACTIVE')}
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-400">Gestiona tu información personal y configuración de cuenta</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <UserTypeIcon className="h-4 w-4" />
                  <span>{primaryRole ? (USER_TYPE_LABELS[primaryRole as keyof typeof USER_TYPE_LABELS] || primaryRole) : 'Sin rol'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <span>Miembro desde {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('es-ES') : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(true)}
              className="flex items-center gap-2 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <Key className="h-4 w-4" />
              Cambiar Contraseña
            </Button>
            <Button
              onClick={handleProfileUpdate}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-indigo-600" />
              Información Personal
              {isLoadingUser && (
                <span className="text-sm text-gray-500 ml-2">(Cargando...)</span>
              )}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Mantén tus datos actualizados para mejorar la comunicación y la seguridad de tu cuenta.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Nombre</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Ej: Juan"
                  className={`${inputBaseClass} ${formErrors.firstName ? inputErrorClass : ""}`}
                />
                {formErrors.firstName && <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Apellido</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Ej: González"
                  className={`${inputBaseClass} ${formErrors.lastName ? inputErrorClass : ""}`}
                />
                {formErrors.lastName && <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Ej: juan@empresa.com"
                  className={`${inputBaseClass} ${formErrors.email ? inputErrorClass : ""}`}
                />
                {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Teléfono</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ej: +595 981 123 456"
                  className={`${inputBaseClass} ${formErrors.phone ? inputErrorClass : ""}`}
                />
                {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Empresa</Label>
                <Input
                  id="company"
                  value={profileData.company}
                  onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Ej: PropTech S.A."
                  className={inputBaseClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Cargo</Label>
                <Input
                  id="position"
                  value={profileData.position}
                  onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Ej: Agente / Administrador / Gerente"
                  className={inputBaseClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Sitio web</Label>
                <Input
                  id="website"
                  value={profileData.website}
                  onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="Ej: https://miempresa.com"
                  className={inputBaseClass}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Opcional. Útil para tu perfil público.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">País</Label>
                <select 
                  value={profileData.country} 
                  onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200 text-sm shadow-sm hover:shadow-md focus:shadow-lg cursor-pointer"
                >
                  <option value="Paraguay">Paraguay</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Brasil">Brasil</option>
                  <option value="Uruguay">Uruguay</option>
                  <option value="Chile">Chile</option>
                  <option value="Bolivia">Bolivia</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Dirección</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Ej: Av. Santa Teresa 1234"
                  className={inputBaseClass}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Ciudad</Label>
                  <Input
                    id="city"
                    value={profileData.city}
                    onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Ej: Asunción"
                    className={inputBaseClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Zona horaria</Label>
                  <select 
                    value={profileData.timezone} 
                    onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200 text-sm shadow-sm hover:shadow-md focus:shadow-lg cursor-pointer"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Biografía</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Ej: Especialista en ventas de desarrollos, con experiencia en atención al cliente y cierres."
                  rows={4}
                  className={`${inputBaseClass} min-h-[110px] resize-y`}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Opcional. Máximo recomendado: 2–3 líneas.</p>
              </div>
            </div>
          </div>

          {/* Preferences & Notifications */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-600" />
              Preferencias y Notificaciones
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Personaliza el idioma y cómo quieres recibir avisos del sistema.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Idioma</Label>
                <select 
                  value={profileData.language} 
                  onChange={(e) => setProfileData(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200 text-sm shadow-sm hover:shadow-md focus:shadow-lg cursor-pointer"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones</h3>
              <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/60 dark:bg-gray-700/40 border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
                  <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Notificaciones por email</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recibe avisos importantes y actualizaciones.</p>
                  </div>
                  <Switch
                    label="Notificaciones por Email"
                    defaultChecked={profileData.notifications.email}
                    onChange={(checked) => setProfileData(prev => ({ ...prev, notifications: { ...prev.notifications, email: checked } }))}
                    color="blue"
                  />
                </div>
                <div className="flex items-center justify-between bg-white/60 dark:bg-gray-700/40 border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Notificaciones push</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Alertas en tiempo real dentro de la app.</p>
                  </div>
                  <Switch
                    label="Notificaciones Push"
                    defaultChecked={profileData.notifications.push}
                    onChange={(checked) => setProfileData(prev => ({ ...prev, notifications: { ...prev.notifications, push: checked } }))}
                    color="blue"
                  />
                </div>
                <div className="flex items-center justify-between bg-white/60 dark:bg-gray-700/40 border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Notificaciones SMS</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Solo para alertas críticas.</p>
                  </div>
                  <Switch
                    label="Notificaciones SMS"
                    defaultChecked={profileData.notifications.sms}
                    onChange={(checked) => setProfileData(prev => ({ ...prev, notifications: { ...prev.notifications, sms: checked } }))}
                    color="blue"
                  />
                </div>
                <div className="flex items-center justify-between bg-white/60 dark:bg-gray-700/40 border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Marketing</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Novedades, ofertas y promociones.</p>
                  </div>
                  <Switch
                    label="Marketing"
                    defaultChecked={profileData.notifications.marketing}
                    onChange={(checked) => setProfileData(prev => ({ ...prev, notifications: { ...prev.notifications, marketing: checked } }))}
                    color="blue"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Activity & Security */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Actividad y Seguridad
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-700/40 border border-gray-200/60 dark:border-gray-700/60 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Sesión actual</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Activa desde {new Date().toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">Activa</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-700/40 border border-gray-200/60 dark:border-gray-700/60 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Último acceso</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {profileUser.lastLogin ? new Date(profileUser.lastLogin).toLocaleString('es-ES') : 'Nunca'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-700/40 border border-gray-200/60 dark:border-gray-700/60 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Ubicación</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Asunción, Paraguay</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(true)}
                className="w-full justify-start border-gray-200 hover:bg-gray-50"
              >
                <Key className="h-4 w-4 mr-2" />
                Cambiar Contraseña
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-gray-200 hover:bg-gray-50"
              >
                <Shield className="h-4 w-4 mr-2" />
                Autenticación de Dos Factores
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-gray-200 hover:bg-gray-50"
              >
                <Clock className="h-4 w-4 mr-2" />
                Historial de Actividad
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="text-center mb-6">
              <div className="relative inline-block mb-4">
                {(previewUrl || avatarUrl || profileUser.photoUrl) ? (
                  <>
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img 
                        src={
                          previewUrl || 
                          (avatarUrl || profileUser.photoUrl)?.startsWith('http') 
                            ? (avatarUrl || profileUser.photoUrl)
                            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${avatarUrl || profileUser.photoUrl}`
                        }
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                        key={previewUrl ? `sidebar-preview-${previewUrl}` : `sidebar-avatar-${avatarUrl || profileUser.photoUrl}`}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="text-2xl font-bold text-white">${profileUser.fullName?.charAt(0) || profileUser.email.charAt(0).toUpperCase()}</span>`;
                            parent.className = 'w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg';
                          }
                        }}
                      />
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg"
                      title="Editar foto"
                    >
                      <Edit className="w-4 h-4" />
                    </label>
                  </>
                ) : (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {profileUser.fullName?.charAt(0) || profileUser.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg"
                      title="Agregar foto"
                    >
                      <Camera className="w-4 h-4" />
                    </label>
                  </div>
                )}
                {/* Input único compartido - no se renderiza aquí, está en el header principal */}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{profileUser.fullName}</h3>
              <p className="text-gray-600 dark:text-gray-400">{profileUser.email}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <UserTypeIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {primaryRole ? (USER_TYPE_LABELS[primaryRole as keyof typeof USER_TYPE_LABELS] || primaryRole) : 'Sin rol'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                {getStatusBadge(profileUser.status || 'ACTIVE')}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Miembro desde:</span>
                <span className="text-gray-900 dark:text-white">
                  {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Último login:</span>
                <span className="text-gray-900 dark:text-white">
                  {profileUser.lastLogin ? new Date(profileUser.lastLogin).toLocaleDateString('es-ES') : 'Nunca'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Estadísticas Rápidas
            </h3>
            <div className="space-y-4">
              <div className="bg-white/60 dark:bg-gray-700/40 p-6 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Propiedades gestionadas</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.properties ?? 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-700/40 p-6 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vistas</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.views ?? 0}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-700/40 p-6 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favoritos</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.favorites ?? 0}</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Key className="h-5 w-5 text-indigo-600" />
              </div>
              Cambiar Contraseña
            </DialogTitle>
            <DialogDescription>
              Ingresa tu contraseña actual y la nueva contraseña para actualizar tu cuenta.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder=""
                  className={`${inputBaseClass} pr-10 ${passwordErrors.currentPassword ? inputErrorClass : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>}
              {passwordSuccess && <p className="text-green-600 text-sm font-medium mt-2">{passwordSuccess}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder=""
                  className={`${inputBaseClass} pr-10 ${passwordErrors.newPassword ? inputErrorClass : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={securityData.confirmPassword}
                  onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder=""
                  className={`${inputBaseClass} pr-10 ${passwordErrors.confirmPassword ? inputErrorClass : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>}
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordDialog(false)}
              className="border-gray-200 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handlePasswordChange}
              disabled={passwordLoading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Input único de archivo compartido por todos los labels */}
      <input
        ref={fileInputRef}
        id="avatar-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploadingPhoto}
      />

      {/* Modal de crop de imagen */}
      {showCropModal && selectedImage && (
        <ImageCropModal
          imageSrc={selectedImage}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          circularCrop={true}
        />
      )}

    </div>
  );
} 