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
  Edit,
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
  userType?: string;
  status?: string;
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
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    console.log('Profile data changed:', profileData);
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

  // Validar en tiempo real
  useEffect(() => {
    if (!showPasswordDialog) return;
    setPasswordErrors(validatePassword(securityData));
  }, [securityData, showPasswordDialog]);

  // Guardado automático con debounce
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) return;
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    setAutoSaved(false);
    setAutoSaving(true);
    autoSaveTimeout.current = setTimeout(async () => {
      setAutoSaving(true);
      try {
        // Simular guardado automático
        setAutoSaved(true);
        setFormSuccess('Cambios guardados automáticamente');
      } catch (error) {
        setFormSuccess(null);
      } finally {
        setAutoSaving(false);
      }
    }, 1500);
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
   
  }, [profileData, formErrors]);

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
          console.log('📋 User data from localStorage:', parsedUser);
          
          // Buscar nombre y apellido en todas las propiedades posibles
          const firstName = parsedUser.firstName || parsedUser.name || parsedUser.first_name || parsedUser.nombre || parsedUser.primerNombre || parsedUser.first || parsedUser.givenName || parsedUser.displayName || '';
          const lastName = parsedUser.lastName || parsedUser.surname || parsedUser.last_name || parsedUser.apellido || parsedUser.segundoNombre || parsedUser.last || parsedUser.familyName || '';
          const phone = parsedUser.phone || parsedUser.telephone || parsedUser.telefono || '';
          
          console.log('🔍 DEBUG - firstName encontrado:', firstName);
          console.log('🔍 DEBUG - lastName encontrado:', lastName);
          console.log('🔍 DEBUG - phone encontrado:', phone);
          
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
      console.log('✅ Setting profile data from localStorage:', profileDataToSet);
      setProfileData(profileDataToSet);
      setProfileUser(parsedUser);
      setIsLoadingUser(false);
    } else {
      // Si no hay token, redirigir al login
      console.log('❌ No token found, redirecting to login');
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('❌ Error loading user data:', error);
    setApiError('Error al cargar datos del usuario');
    setIsLoadingUser(false);
  }
};

loadUserData();
}, []);

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
    } catch (error) {
      setApiError(handleApiError(error));
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Guardado automático: igual, pero llama a handleProfileUpdate si no hay errores
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) return;
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    setAutoSaved(false);
    setAutoSaving(true);
    autoSaveTimeout.current = setTimeout(async () => {
      setAutoSaving(true);
      try {
        await handleProfileUpdate();
        setAutoSaved(true);
        setFormSuccess('Cambios guardados automáticamente');
      } catch (error) {
        setFormSuccess(null);
      } finally {
        setAutoSaving(false);
      }
    }, 1500);
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
   
  }, [profileData, formErrors]);

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
          userType: profileUser.userType,
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
    console.log('🔐 Iniciando cambio de contraseña...');
    console.log('📝 Datos de seguridad:', securityData);
    
    const errors = validatePassword(securityData);
    console.log('❌ Errores de validación:', errors);
    
    setPasswordErrors(errors);
    setPasswordSuccess(null);
    setApiError(null);
    
    if (Object.keys(errors).length > 0) {
      toast.error('Corrige los errores antes de continuar');
      return;
    }
    
    setPasswordLoading(true);
    try {
      console.log('🚀 Llamando a la API de cambio de contraseña...');
      const result = await authApi.changePassword({ 
        oldPassword: securityData.currentPassword, 
        newPassword: securityData.newPassword 
      });
      console.log('✅ Respuesta de la API:', result);
      
      setPasswordSuccess('Contraseña cambiada exitosamente');
      toast.success('Contraseña cambiada exitosamente');
      setShowPasswordDialog(false);
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('❌ Error en cambio de contraseña:', error);
      const errorMessage = handleApiError(error);
      console.log('📝 Mensaje de error procesado:', errorMessage);
      
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };



  // Manejar cambio de imagen de perfil
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    // Simular subida (reemplazar por API real si existe)
    setTimeout(() => {
      // updateUser({ ...user, avatarUrl: 'url-subida' }); // Aquí iría la URL real
    }, 1200);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Activo
        </Badge>;
      case 'INACTIVE':
        return <Badge className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Inactivo
        </Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">{status}</Badge>;
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
        console.error('Error cargando estadísticas:', err);
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



  const UserTypeIcon = USER_TYPE_ICONS[profileUser.userType as keyof typeof USER_TYPE_ICONS] || UserIcon;

  return (
    <div className="space-y-8">
      {/* Header con avatar editable - Mejorado */}
      <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-8 mb-4 lg:mb-0">
            <div className="relative group">
              {avatarUrl ? (
                <Avatar src={avatarUrl} size="xlarge" alt="Foto de perfil" />
              ) : (
                <AvatarText name={profileUser?.fullName || profileUser?.email || 'Usuario'} className="h-28 w-28 text-4xl" />
              )}
              <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full p-3 shadow-xl cursor-pointer transition-all duration-300 opacity-90 group-hover:opacity-100 border-4 border-white hover:scale-110">
                <Camera className="h-6 w-6" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
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
                  <span>{USER_TYPE_LABELS[profileUser.userType as keyof typeof USER_TYPE_LABELS] || profileUser.userType || 'USER'}</span>
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
        
        {/* Indicador de auto-guardado */}
        {autoSaving && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
            Guardando automáticamente...
          </div>
        )}
        {autoSaved && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            Cambios guardados automáticamente
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-indigo-600" />
              Información Personal
              {isLoadingUser && (
                <span className="text-sm text-gray-500 ml-2">(Cargando...)</span>
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">Nombre</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Tu nombre"
                  className={`border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 ${formErrors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.firstName && <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Apellido</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Tu apellido"
                  className={`border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 ${formErrors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.lastName && <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="tu@email.com"
                  className={`border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 ${formErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Teléfono</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+595 123 456 789"
                  className={`border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 ${formErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium">Empresa</Label>
                <Input
                  id="company"
                  value={profileData.company}
                  onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Nombre de tu empresa"
                  className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium">Cargo</Label>
                <Input
                  id="position"
                  value={profileData.position}
                  onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Tu cargo o posición"
                  className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium">Sitio Web</Label>
                <Input
                  id="website"
                  value={profileData.website}
                  onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://tu-sitio.com"
                  className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">País</Label>
                <select 
                  value={profileData.country} 
                  onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
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
                <Label htmlFor="address" className="text-sm font-medium">Dirección</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Tu dirección completa"
                  className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">Ciudad</Label>
                  <Input
                    id="city"
                    value={profileData.city}
                    onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Tu ciudad"
                    className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm font-medium">Zona Horaria</Label>
                                  <select 
                  value={profileData.timezone} 
                  onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
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
                <Label htmlFor="bio" className="text-sm font-medium">Biografía</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Cuéntanos un poco sobre ti..."
                  rows={4}
                  className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Preferences & Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-600" />
              Preferencias y Notificaciones
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium">Idioma</Label>
                <select 
                  value={profileData.language} 
                  onChange={(e) => setProfileData(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notificaciones por Email</p>
                    <p className="text-sm text-gray-500">Recibe actualizaciones importantes por email</p>
                  </div>
                  <Switch
                    label="Notificaciones por Email"
                    defaultChecked={profileData.notifications.email}
                    onChange={(checked) => setProfileData(prev => ({ ...prev, notifications: { ...prev.notifications, email: checked } }))}
                    color="blue"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notificaciones Push</p>
                    <p className="text-sm text-gray-500">Recibe notificaciones en tiempo real</p>
                  </div>
                  <Switch
                    label="Notificaciones Push"
                    defaultChecked={profileData.notifications.push}
                    onChange={(checked) => setProfileData(prev => ({ ...prev, notifications: { ...prev.notifications, push: checked } }))}
                    color="blue"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notificaciones SMS</p>
                    <p className="text-sm text-gray-500">Recibe alertas por mensaje de texto</p>
                  </div>
                  <Switch
                    label="Notificaciones SMS"
                    defaultChecked={profileData.notifications.sms}
                    onChange={(checked) => setProfileData(prev => ({ ...prev, notifications: { ...prev.notifications, sms: checked } }))}
                    color="blue"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Marketing</p>
                    <p className="text-sm text-gray-500">Recibe ofertas y promociones especiales</p>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Actividad y Seguridad
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sesión Actual</p>
                    <p className="text-xs text-gray-500">Activa desde {new Date().toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Activa</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Último Acceso</p>
                    <p className="text-xs text-gray-500">
                      {profileUser.lastLogin ? new Date(profileUser.lastLogin).toLocaleString('es-ES') : 'Nunca'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ubicación</p>
                    <p className="text-xs text-gray-500">Asunción, Paraguay</p>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center mb-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {profileUser.fullName?.charAt(0) || profileUser.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{profileUser.fullName}</h3>
              <p className="text-gray-600">{profileUser.email}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <UserTypeIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {USER_TYPE_LABELS[profileUser.userType as keyof typeof USER_TYPE_LABELS] || profileUser.userType}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Estado:</span>
                {getStatusBadge(profileUser.status || 'ACTIVE')}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Miembro desde:</span>
                <span className="text-gray-900">
                  {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Último login:</span>
                <span className="text-gray-900">
                  {profileUser.lastLogin ? new Date(profileUser.lastLogin).toLocaleDateString('es-ES') : 'Nunca'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Estadísticas Rápidas
            </h3>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Propiedades Gestionadas</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats?.properties ?? 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vistas</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats?.views ?? 0}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Favoritos</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats?.favorites ?? 0}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Acciones de Cuenta
            </h3>
            <div className="space-y-3">
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
                <Bell className="h-4 w-4 mr-2" />
                Notificaciones
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-gray-200 hover:bg-gray-50"
              >
                <Globe className="h-4 w-4 mr-2" />
                Privacidad
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportData('json')}
                disabled={exportLoading}
                className="w-full justify-start border-gray-200 hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                {exportLoading ? 'Exportando JSON...' : 'Exportar JSON'}
              </Button>
              {exportSuccess && <span className="text-green-600 text-xs ml-2">{exportSuccess}</span>}
              <Button
                variant="outline"
                onClick={() => handleExportData('csv')}
                disabled={exportLoading}
                className="w-full justify-start border-gray-200 hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                {exportLoading ? 'Exportando CSV...' : 'Exportar CSV'}
              </Button>

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
                  placeholder="••••••••"
                  className={`border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 pr-10 ${passwordErrors.currentPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
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
                  placeholder="••••••••"
                  className={`border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 pr-10 ${passwordErrors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
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
                  placeholder="••••••••"
                  className={`border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 pr-10 ${passwordErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
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


    </div>
  );
} 