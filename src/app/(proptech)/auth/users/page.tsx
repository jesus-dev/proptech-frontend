"use client";

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { User, UserRole, Role } from '@/types/auth';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Eye,
  Shield,
  Mail,
  Calendar,
  Clock,
  Filter,
  Download,
  RefreshCw,
  PlusCircle,
  Users,
  UserPlus,
  Activity,
  Settings,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  Unlock,
  Crown,
  Briefcase,
  User as UserIcon,
  Eye as EyeIcon,
  Building,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import ModernPopup from '@/components/ui/ModernPopup';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { toast } from 'sonner';
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_ACTIVATION' | 'LOCKED';
  tenantId?: number;
  agencyId?: number;
  agentId?: number;
}

const USER_TYPE_ICONS = {
  SUPER_ADMIN: Crown,
  TENANT_ADMIN: Building,
  AGENCY_ADMIN: Briefcase,
  AGENT: UserCheck,
  MANAGER: Settings,
  VIEWER: EyeIcon,
  CUSTOMER: UserIcon
};

const USER_TYPE_LABELS = {
  SUPER_ADMIN: 'Super Administrador',
  TENANT_ADMIN: 'Admin Tenant',
  AGENCY_ADMIN: 'Admin Agencia',
  AGENT: 'Agente',
  MANAGER: 'Gerente',
  VIEWER: 'Visualizador',
  CUSTOMER: 'Cliente'
};

const USER_TYPE_DESCRIPTIONS = {
  SUPER_ADMIN: 'Control total del SaaS - Gestiona todos los tenants',
  TENANT_ADMIN: 'Administra un tenant - Gestiona agencias del tenant',
  AGENCY_ADMIN: 'Administra una agencia - Gestiona agentes de la agencia',
  AGENT: 'Agente inmobiliario - Gestiona sus propias propiedades',
  MANAGER: 'Gerente/Supervisor - Puede ver pero tiene acceso limitado',
  VIEWER: 'Solo lectura - No puede modificar nada',
  CUSTOMER: 'Cliente final - Búsqueda y favoritos'
};

export default function UsersPage() {
  const { hasPermission } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roles: [],
    status: 'ACTIVE',
    tenantId: undefined,
    agencyId: undefined,
    agentId: undefined
  });

  // Check permissions
  const canCreate = hasPermission('USER_CREATE');
  const canUpdate = hasPermission('USER_UPDATE');
  const canDelete = hasPermission('USER_DELETE');
  const canView = hasPermission('USER_READ');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        authService.getUsers().catch((err) => {
          console.error('Error loading users:', err);
          return [];
        }),
        authService.getRoles().catch((err) => {
          console.error('Error loading roles:', err);
          return [];
        })
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      
      // Cargar catálogos adicionales
      try {
        const { getAllAgencies } = await import('@/app/(proptech)/catalogs/agencies/services/agencyService');
        const { getAllAgents } = await import('@/app/(proptech)/catalogs/agents/services/agentService');
        
        // Cargar tenants primero
        const tenantsData = await authService.getTenants().catch((err) => { 
          console.error('❌ Error loading tenants:', err); 
          return []; 
        });
        
        // Cargar agencias
        const agenciesData = await getAllAgencies().catch((err) => { 
          console.error('❌ Error loading agencies:', err.message || err); 
          return []; 
        });
        
        // Cargar agentes
        const agentsData = await getAllAgents().catch((err) => { 
          console.error('❌ Error loading agents:', err.message || err);
          return []; 
        });
        
        setTenants(Array.isArray(tenantsData) ? tenantsData : []);
        setAgencies(Array.isArray(agenciesData) ? agenciesData : []);
        setAgents(Array.isArray(agentsData) ? agentsData : []);
      } catch (error) {
        console.error('💥 Error general loading catalogs:', error);
        setTenants([]);
        setAgencies([]);
        setAgents([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setUsers([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.roles?.includes(roleFilter);
    
    return matchesSearch && matchesStatus && matchesRole;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.fullName || `${a.firstName || ''} ${a.lastName || ''}`.trim();
        bValue = b.fullName || `${b.firstName || ''} ${b.lastName || ''}`.trim();
        break;
      case 'email':
        aValue = a.email;
        bValue = b.email;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'lastLogin':
        aValue = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
        bValue = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
        break;
      default:
        aValue = a.fullName;
        bValue = b.fullName;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleDeleteUser = async (userId: number) => {
    try {
      console.log('Intentando eliminar usuario con ID:', userId);
      await authService.deleteUser(userId);
      toast.success('Usuario eliminado exitosamente');
      loadData();
      setShowDeleteModal(false);
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Error al eliminar el usuario';
      toast.error(errorMessage);
    }
  };

  const handleActivateUser = async (userId: number) => {
    try {
      await authService.activateUser(userId);
      toast.success('Usuario activado exitosamente');
      loadData();
    } catch (error) {
      toast.error('Error al activar el usuario');
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    try {
      await authService.deactivateUser(userId);
      toast.success('Usuario desactivado exitosamente');
      loadData();
    } catch (error) {
      toast.error('Error al desactivar el usuario');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validar campos obligatorios
      if (!formData.firstName || formData.firstName.trim() === '') {
        toast.error('El nombre es obligatorio');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.lastName || formData.lastName.trim() === '') {
        toast.error('El apellido es obligatorio');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.email || formData.email.trim() === '') {
        toast.error('El email es obligatorio');
        setIsSubmitting(false);
        return;
      }
      
      // Validar que se haya seleccionado al menos un rol
      const selectedRoleIds = roles.filter(r => formData.roles.includes(r.name)).map(r => r.id);
      if (selectedRoleIds.length === 0) {
        toast.error('Debe seleccionar al menos un rol para el usuario');
        setIsSubmitting(false);
        return;
      }
      
      // Validar que los roleIds sean números válidos
      const invalidRoleIds = selectedRoleIds.filter(id => !id || isNaN(Number(id)));
      if (invalidRoleIds.length > 0) {
        console.error('❌ RoleIds inválidos:', invalidRoleIds);
        toast.error('Error: algunos roles seleccionados no son válidos');
        setIsSubmitting(false);
        return;
      }
      
      // Validar tenantId (obligatorio)
      if (!formData.tenantId) {
        toast.error('Debe seleccionar un tenant para el usuario');
        setIsSubmitting(false);
        return;
      }
      
      // Validar que tenantId sea un número válido
      if (isNaN(Number(formData.tenantId))) {
        console.error('❌ TenantId inválido:', formData.tenantId);
        toast.error('Error: el tenant seleccionado no es válido');
        setIsSubmitting(false);
        return;
      }
      
      // Validar password solo al crear (no al actualizar)
      if (!selectedUser && (!formData.password || formData.password.trim() === '')) {
        toast.error('La contraseña es obligatoria al crear un nuevo usuario');
        setIsSubmitting(false);
        return;
      }

      if (selectedUser) {
        // Validación frontend antes de enviar
        if (!formData.email || formData.email.trim() === '') {
          toast.error('El email es obligatorio');
          setIsSubmitting(false);
          return;
        }
        if (!formData.firstName || formData.firstName.trim() === '') {
          toast.error('El nombre es obligatorio');
          setIsSubmitting(false);
          return;
        }
        if (!formData.lastName || formData.lastName.trim() === '') {
          toast.error('El apellido es obligatorio');
          setIsSubmitting(false);
          return;
        }
        if (!selectedRoleIds || selectedRoleIds.length === 0) {
          toast.error('Debe seleccionar al menos un rol');
          setIsSubmitting(false);
          return;
        }
        if (!formData.tenantId) {
          toast.error('El tenant es obligatorio');
          setIsSubmitting(false);
          return;
        }
        
        // Update user - construir objeto sin campos undefined
        const updateData: any = {
          email: formData.email.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          roleIds: selectedRoleIds,
          tenantId: formData.tenantId
        };
        
        // Solo incluir status si tiene valor
        if (formData.status !== undefined && formData.status !== null) {
          updateData.status = formData.status;
        }
        
        // Solo incluir campos opcionales si tienen valor (no undefined)
        if (formData.agencyId !== undefined && formData.agencyId !== null) {
          updateData.agencyId = formData.agencyId;
        }
        
        if (formData.agentId !== undefined && formData.agentId !== null) {
          updateData.agentId = formData.agentId;
        }
        
        // Solo incluir password si se proporciona una nueva
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password;
        }
        
        // Log para debugging - mostrar datos exactos que se envían
        console.log('📤 Actualizando usuario con datos:', JSON.stringify({
          ...updateData,
          password: updateData.password ? '***' : 'no proporcionada'
        }, null, 2));
        console.log('📤 Tipos de datos:', {
          firstName: typeof updateData.firstName,
          lastName: typeof updateData.lastName,
          email: typeof updateData.email,
          password: typeof updateData.password,
          roleIds: Array.isArray(updateData.roleIds) ? `array[${updateData.roleIds.length}]` : typeof updateData.roleIds,
          tenantId: typeof updateData.tenantId,
          roleIdsValues: updateData.roleIds,
          tenantIdValue: updateData.tenantId
        });
        
        await authService.updateUser(selectedUser.id, updateData);
        toast.success('Usuario actualizado exitosamente');
      } else {
        // Create user - construir objeto sin campos undefined
        const createData: any = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          roleIds: selectedRoleIds,
          tenantId: formData.tenantId
        };
        
        // Solo incluir campos opcionales si tienen valor
        if (formData.agencyId) {
          createData.agencyId = formData.agencyId;
        }
        
        if (formData.agentId) {
          createData.agentId = formData.agentId;
        }
        
        // Log para debugging - mostrar datos exactos que se envían
        console.log('📤 Creando usuario con datos:', JSON.stringify({
          ...createData,
          password: createData.password ? '***' : 'no proporcionada'
        }, null, 2));
        console.log('📤 Tipos de datos:', {
          firstName: typeof createData.firstName,
          lastName: typeof createData.lastName,
          email: typeof createData.email,
          password: typeof createData.password,
          roleIds: Array.isArray(createData.roleIds) ? `array[${createData.roleIds.length}]` : typeof createData.roleIds,
          tenantId: typeof createData.tenantId,
          roleIdsValues: createData.roleIds,
          tenantIdValue: createData.tenantId
        });
        
        await authService.createUser(createData);
        toast.success('Usuario creado exitosamente');
      }
      
      setShowUserModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      // Log completo del error para debugging
      console.error('❌ Error saving user - Detalles completos:', {
        error,
        message: error?.message,
        response: error?.response,
        responseData: error?.response?.data,
        responseStatus: error?.response?.status,
        responseStatusText: error?.response?.statusText,
        requestData: selectedUser ? 'update' : 'create',
        stack: error?.stack
      });
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al guardar el usuario';
      
      if (error?.response) {
        // Error con respuesta del servidor
        const responseData = error.response?.data;
        
        // Intentar extraer el mensaje de error de diferentes formatos
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.errors && Array.isArray(responseData.errors)) {
          // Errores de validación en formato array
          errorMessage = responseData.errors.map((e: any) => 
            e.message || e.field || String(e)
          ).join(', ');
        } else if (typeof responseData === 'object') {
          // Intentar extraer cualquier mensaje del objeto
          const keys = Object.keys(responseData);
          if (keys.length > 0) {
            errorMessage = responseData[keys[0]] || JSON.stringify(responseData);
          }
        }
        
        // Errores específicos por código de estado
        if (error.response.status === 400) {
          // Error de validación - usar el mensaje del backend
          if (!errorMessage || errorMessage === 'Error al guardar el usuario') {
            errorMessage = 'Error de validación. Por favor, verifica que todos los campos estén completos y sean válidos.';
          }
        } else if (error.response.status === 409) {
          // Email duplicado
          errorMessage = errorMessage || 'El email ya está registrado';
        } else if (error.response.status === 403) {
          // Sin permisos
          errorMessage = 'No tienes permisos para realizar esta acción';
        } else if (error.response.status >= 500) {
          // Error del servidor
          errorMessage = 'Error del servidor. Por favor, intenta nuevamente más tarde.';
        }
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network')) {
        // Error de red
        errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.';
      } else if (error?.message) {
        // Usar el mensaje del error si está disponible
        errorMessage = error.message;
      }
      
      // Limitar la longitud del mensaje para evitar mensajes muy largos
      if (errorMessage.length > 200) {
        errorMessage = errorMessage.substring(0, 200) + '...';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      roles: [],
      status: 'ACTIVE',
      tenantId: undefined,
      agencyId: undefined,
      agentId: undefined
    });
    setSelectedUser(null);
  };

  const openUserModal = async (user?: User) => {
    if (user) {
      try {
        // Cargar los detalles completos del usuario
        const fullUser = await authService.getUserById(user.id);
        const formDataToSet = {
          firstName: fullUser.firstName || '',
          lastName: fullUser.lastName || '',
          email: fullUser.email || '',
          password: '',
          roles: fullUser.roles || [],
          status: (fullUser.status as any) || 'ACTIVE',
          tenantId: (fullUser as any).tenantId || undefined,
          agencyId: (fullUser as any).agencyId || undefined,
          agentId: (fullUser as any).agentId || undefined
        };
        setSelectedUser(fullUser);
        setFormData(formDataToSet);
      } catch (error) {
        console.error('Error loading user details:', error);
        toast.error('Error al cargar los detalles del usuario');
        // Fallback a usar los datos del listado
        setSelectedUser(user);
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          password: '',
          roles: user.roles || [],
          status: (user.status as any) || 'ACTIVE',
          tenantId: (user as any).tenantId || undefined,
          agencyId: (user as any).agencyId || undefined,
          agentId: (user as any).agentId || undefined
        });
      }
    } else {
      resetForm();
    }
    setShowUserModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 flex items-center gap-1 px-2 py-1 text-sm font-medium">
          <CheckCircle className="h-3 w-3" />
          Activo
        </Badge>;
      case 'INACTIVE':
        return <Badge className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1 px-2 py-1 text-sm font-medium">
          <XCircle className="h-3 w-3" />
          Inactivo
        </Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300 flex items-center gap-1 px-2 py-1 text-sm font-medium">
          <AlertCircle className="h-3 w-3" />
          Suspendido
        </Badge>;
      case 'LOCKED':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300 flex items-center gap-1 px-2 py-1 text-sm font-medium">
          <Lock className="h-3 w-3" />
          Bloqueado
        </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300 px-2 py-1 text-sm font-medium">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-2 py-1 text-sm font-medium">{role}</Badge>;
  };

  const getActiveUsersCount = () => users.filter(u => u.status === 'ACTIVE').length;
  const getInactiveUsersCount = () => users.filter(u => u.status === 'INACTIVE').length;
  const getRecentUsersCount = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return users.filter(u => u.createdAt && new Date(u.createdAt) > oneWeekAgo).length;
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    try {
      for (const userId of selectedUsers) {
        switch (action) {
          case 'activate':
            await authService.activateUser(userId);
            break;
          case 'deactivate':
            await authService.deactivateUser(userId);
            break;
          case 'delete':
            await authService.deleteUser(userId);
            break;
        }
      }
      toast.success(`Acción ${action} completada para ${selectedUsers.length} usuarios`);
      setSelectedUsers([]);
      loadData();
    } catch (error) {
      toast.error(`Error al ejecutar acción ${action}`);
    }
  };

  const handleDeleteDemoUsers = async () => {
    const demoUsers = users.filter(user => 
      user.email.toLowerCase().includes('test') ||
      user.email.toLowerCase().includes('demo') ||
      user.email.toLowerCase().includes('ejemplo') ||
      user.email.toLowerCase().includes('example') ||
      user.email.toLowerCase().includes('prueba') ||
      (user.roles && user.roles.includes('CUSTOMER')) ||
      // Usuarios de prueba específicos del sistema
      user.email === 'maria.gonzalez@proptech.com' ||
      user.email === 'carlos.mendoza@proptech.com' ||
      user.email === 'ana.silva@proptech.com' ||
      user.email === 'ana.patricia@proptech.com' ||
      // Usuarios sin tenant/agencia asignados y sin roles (probablemente demo)
      (!user.tenantId && user.roles && user.roles.length === 0 && user.id !== 1)
    );
    
    if (demoUsers.length === 0) {
      toast.info('No hay usuarios demo/prueba para eliminar');
      return;
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar ${demoUsers.length} usuarios demo/prueba?\n\n` +
      `Esto incluye:\n` +
      `- Usuarios con emails de prueba/demo\n` +
      `- Usuarios tipo CUSTOMER\n\n` +
      `Esta acción NO se puede deshacer.`
    );

    if (!confirmDelete) return;

    try {
      let deleted = 0;
      let failed = 0;

      for (const user of demoUsers) {
        try {
          await authService.deleteUser(user.id);
          deleted++;
        } catch (error) {
          failed++;
          console.error(`Error al eliminar usuario ${user.email}:`, error);
        }
      }

      toast.success(`✅ ${deleted} usuarios demo eliminados exitosamente${failed > 0 ? ` (${failed} fallaron)` : ''}`);
      loadData();
    } catch (error) {
      toast.error('Error al eliminar usuarios demo');
      console.error('Error:', error);
    }
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para ver esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            </div>
            <p className="text-gray-600 text-sm">Administra usuarios, roles y permisos del sistema</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Filtros
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            <Button
              variant="outline"
              onClick={loadData}
              className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
            {canDelete && users.filter(u => 
              u.email.toLowerCase().includes('test') ||
              u.email.toLowerCase().includes('demo') ||
              u.email.toLowerCase().includes('ejemplo') ||
              u.email.toLowerCase().includes('example') ||
              u.email.toLowerCase().includes('prueba') ||
              (u.roles && u.roles.includes('CUSTOMER')) ||
              u.email === 'maria.gonzalez@proptech.com' ||
              u.email === 'carlos.mendoza@proptech.com' ||
              u.email === 'ana.silva@proptech.com' ||
              u.email === 'ana.patricia@proptech.com' ||
              (!u.tenantId && u.roles && u.roles.length === 0 && u.id !== 1)
            ).length > 0 && (
              <Button
                variant="outline"
                onClick={handleDeleteDemoUsers}
                className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50 font-semibold"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar Usuarios Demo ({users.filter(u => 
                  u.email.toLowerCase().includes('test') ||
                  u.email.toLowerCase().includes('demo') ||
                  u.email.toLowerCase().includes('ejemplo') ||
                  u.email.toLowerCase().includes('example') ||
                  u.email.toLowerCase().includes('prueba') ||
                  (u.roles && u.roles.includes('CUSTOMER')) ||
                  u.email === 'maria.gonzalez@proptech.com' ||
                  u.email === 'carlos.mendoza@proptech.com' ||
                  u.email === 'ana.silva@proptech.com' ||
                  u.email === 'ana.patricia@proptech.com' ||
                  (!u.tenantId && u.roles && u.roles.length === 0 && u.id !== 1)
                ).length})
              </Button>
            )}
            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleBulkAction('activate')}
                  className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
                >
                  <UserCheck className="h-4 w-4" />
                  Activar ({selectedUsers.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleBulkAction('deactivate')}
                  className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
                >
                  <UserX className="h-4 w-4" />
                  Desactivar ({selectedUsers.length})
                </Button>
                {canDelete && (
                  <Button
                    variant="outline"
                    onClick={() => handleBulkAction('delete')}
                    className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar ({selectedUsers.length})
                  </Button>
                )}
              </div>
            )}
            {canCreate && (
              <Button 
                onClick={() => openUserModal()} 
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
              >
                <PlusCircle className="h-4 w-4" />
                Nuevo Usuario
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros Avanzados
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="ACTIVE">Activos</SelectItem>
                  <SelectItem value="INACTIVE">Inactivos</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendidos</SelectItem>
                  <SelectItem value="LOCKED">Bloqueados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Usuarios</p>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-blue-200 text-xs mt-1">En el sistema</p>
            </div>
            <div className="bg-blue-400/20 p-2 rounded-lg">
              <Users className="h-6 w-6 text-blue-200" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Activos</p>
              <p className="text-2xl font-bold">{getActiveUsersCount()}</p>
              <p className="text-emerald-200 text-xs mt-1">Usuarios activos</p>
            </div>
            <div className="bg-emerald-400/20 p-2 rounded-lg">
              <UserCheck className="h-6 w-6 text-emerald-200" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium mb-1">Inactivos</p>
              <p className="text-2xl font-bold">{getInactiveUsersCount()}</p>
              <p className="text-red-200 text-xs mt-1">Usuarios inactivos</p>
            </div>
            <div className="bg-red-400/20 p-2 rounded-lg">
              <UserX className="h-6 w-6 text-red-200" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Nuevos (7 días)</p>
              <p className="text-2xl font-bold">{getRecentUsersCount()}</p>
              <p className="text-purple-200 text-xs mt-1">Registros recientes</p>
            </div>
            <div className="bg-purple-400/20 p-2 rounded-lg">
              <UserPlus className="h-6 w-6 text-purple-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Lista de Usuarios
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="bg-white px-3 py-1 rounded-full border border-gray-200">
                {filteredUsers.length} de {users.length} usuarios
              </span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 border-b border-gray-100">
                <TableCell isHeader className="font-semibold text-gray-700 w-12">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleSelectAll}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-indigo-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </TableCell>
                <TableCell isHeader className="font-semibold text-gray-700">
                  <button
                    onClick={() => {
                      setSortBy('name');
                      setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                  >
                    Usuario
                    {sortBy === 'name' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    )}
                  </button>
                </TableCell>
                <TableCell isHeader className="font-semibold text-gray-700">
                  <button
                    onClick={() => {
                      setSortBy('email');
                      setSortOrder(sortBy === 'email' && sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                  >
                    Email
                    {sortBy === 'email' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    )}
                  </button>
                </TableCell>
                <TableCell isHeader className="font-semibold text-gray-700">Roles</TableCell>
                <TableCell isHeader className="font-semibold text-gray-700">
                  <button
                    onClick={() => {
                      setSortBy('status');
                      setSortOrder(sortBy === 'status' && sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                  >
                    Estado
                    {sortBy === 'status' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    )}
                  </button>
                </TableCell>
                <TableCell isHeader className="font-semibold text-gray-700">
                  <button
                    onClick={() => {
                      setSortBy('lastLogin');
                      setSortOrder(sortBy === 'lastLogin' && sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                  >
                    Último Login
                    {sortBy === 'lastLogin' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    )}
                  </button>
                </TableCell>
                <TableCell isHeader className="font-semibold text-gray-700 text-right">Acciones</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex items-center justify-center">
                      <LoadingSpinner message="Cargando usuarios del sistema" />
                      <span className="ml-3 text-gray-600">Cargando usuarios...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="text-center max-w-md mx-auto">
                      <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm || statusFilter !== 'all' || roleFilter !== 'all' 
                          ? 'Intenta ajustar los filtros de búsqueda'
                          : 'No hay usuarios registrados en el sistema'
                        }
                      </p>
                      {canCreate && (
                        <Button 
                          onClick={() => openUserModal()} 
                          className="flex items-center gap-2 mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                        >
                          <PlusCircle className="h-4 w-4" />
                          Crear Primer Usuario
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : null;
                  const UserTypeIcon = primaryRole ? (USER_TYPE_ICONS[primaryRole as keyof typeof USER_TYPE_ICONS] || UserIcon) : UserIcon;
                  const roleLabel = primaryRole ? (USER_TYPE_LABELS[primaryRole as keyof typeof USER_TYPE_LABELS] || primaryRole) : 'Sin rol';
                  return (
                    <TableRow key={user.id} className={`hover:bg-gray-50/50 border-b border-gray-100 ${selectedUsers.includes(user.id) ? 'bg-indigo-50' : ''}`}>
                      <TableCell className="w-12">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleSelectUser(user.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {selectedUsers.includes(user.id) ? (
                              <CheckSquare className="h-4 w-4 text-indigo-600" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-sm font-bold text-white">
                              {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario sin nombre'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <UserTypeIcon className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                {roleLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 font-medium">
                            {user.email || <span className="text-gray-400 italic">Sin email</span>}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role, index) => (
                              <span key={index}>{getRoleBadge(role)}</span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">Sin roles asignados</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status || 'ACTIVE')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 font-medium">
                            {(() => {
                              try {
                                const dateToShow = user.lastLogin || user.createdAt;
                                if (!dateToShow) return 'Fecha no disponible';
                                const date = new Date(dateToShow);
                                if (isNaN(date.getTime())) return 'Fecha inválida';
                                const formattedDate = date.toLocaleString('es-PY', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                });
                                return formattedDate;
                              } catch (error) {
                                return 'Fecha inválida';
                              }
                            })()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button 
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                            onClick={() => openUserModal(user)}
                          >
                            <Eye className="h-5 w-5 text-blue-600" />
                          </button>
                          {canUpdate && (
                            <button 
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Editar"
                              onClick={() => openUserModal(user)}
                            >
                              <Edit className="h-5 w-5 text-green-600" />
                            </button>
                          )}
                          {user.status === 'ACTIVE' ? (
                            <button 
                              className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Desactivar"
                              onClick={() => handleDeactivateUser(user.id)}
                            >
                              <UserX className="h-5 w-5 text-orange-600" />
                            </button>
                          ) : (
                            <button 
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Activar"
                              onClick={() => handleActivateUser(user.id)}
                            >
                              <UserCheck className="h-5 w-5 text-green-600" />
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                              onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                            >
                              <Trash2 className="h-5 w-5 text-red-600" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Enhanced User Modal */}
      <ModernPopup
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        subtitle={selectedUser ? 'Modifica la información del usuario' : 'Crea un nuevo usuario en el sistema'}
        icon={selectedUser ? <Edit className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Juan"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Pérez"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="juan.perez@ejemplo.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Contraseña {!selectedUser && '*'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder={selectedUser ? "Dejar vacío para mantener la contraseña actual" : "••••••••"}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              required={!selectedUser}
            />
            {selectedUser && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Deja vacío para mantener la contraseña actual, o ingresa una nueva para cambiarla
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Estado *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
                <option value="SUSPENDED">Suspendido</option>
                <option value="LOCKED">Bloqueado</option>
              </select>
            </div>
          </div>

          {/* Campos de asignación: Tenant, Agencia, Agente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tenant *
              </label>
              <select
                value={formData.tenantId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tenantId: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              >
                <option value="">Seleccionar tenant...</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name || `Tenant ${tenant.id}`}
                  </option>
                ))}
              </select>
              {tenants.length === 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  ⚠️ No hay tenants disponibles. Cargando...
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Organización (obligatorio)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Agencia
              </label>
              <select
                value={formData.agencyId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, agencyId: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              >
                <option value="">Sin agencia asignada</option>
                {agencies.filter(a => a.active || a.isActive).map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
              {agencies.length === 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  ⚠️ No hay agencias disponibles. Cargando...
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Agencia inmobiliaria (opcional)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Agente
              </label>
              {(() => {
                const canHaveAgent = formData.roles.includes('AGENT') || formData.roles.includes('AGENCY_ADMIN');
                return (
                  <>
                    <select
                      value={formData.agentId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, agentId: e.target.value ? Number(e.target.value) : undefined }))}
                      disabled={!canHaveAgent}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ${!canHaveAgent ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60' : ''}`}
                    >
                      {canHaveAgent ? (
                        <>
                          <option value="">Se creará automáticamente con los datos del usuario</option>
                          {agents.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {agent.firstName || agent.nombre} {agent.lastName || agent.apellido}
                            </option>
                          ))}
                        </>
                      ) : (
                        <option value="">No aplica - Este usuario no tiene el rol AGENT o AGENCY_ADMIN</option>
                      )}
                    </select>
                    {canHaveAgent ? (
                      agents.length === 0 ? (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          ℹ️ Se creará automáticamente un perfil de agente con el Nombre y Apellido que ingreses arriba.
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Deja vacío para crear un nuevo agente automáticamente, o selecciona uno existente
                        </p>
                      )
                    ) : (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        ⚠️ Solo los usuarios con el rol "AGENT" o "AGENCY_ADMIN" tienen perfil de agente. Este usuario NO tendrá agente.
                      </p>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Roles
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
              {roles.map((role) => (
                <label
                  key={role.id}
                  htmlFor={`role-${role.id}`}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`role-${role.id}`}
                    checked={formData.roles.includes(role.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          roles: [...prev.roles, role.name]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          roles: prev.roles.filter(r => r !== role.name)
                        }));
                      }
                    }}
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-2 focus:ring-brand-500 focus:ring-offset-0 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-brand-600 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {role.name}
                  </span>
                </label>
              ))}
              {roles.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4 col-span-full">
                  No hay roles disponibles
                </p>
              )}
            </div>
            {formData.roles.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {formData.roles.length} rol(es) seleccionado(s)
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => setShowUserModal(false)}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 border border-transparent rounded-xl hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  {selectedUser ? 'Actualizar' : 'Crear'}
                </div>
              )}
            </button>
          </div>
        </form>
      </ModernPopup>

      {/* Enhanced Delete Confirmation Modal */}
      <ModernPopup
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
        subtitle={`¿Estás seguro de que quieres eliminar al usuario "${selectedUser?.fullName}"? Esta acción no se puede deshacer.`}
        icon={<Trash2 className="w-6 h-6 text-white" />}
        maxWidth="max-w-md"
        closeOnBackdropClick={false}
      >
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDeleteModal(false);
            }}
            className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Botón de eliminar clickeado, selectedUser:', selectedUser);
              if (selectedUser) {
                handleDeleteUser(selectedUser.id);
              } else {
                console.error('No hay usuario seleccionado para eliminar');
                toast.error('No se ha seleccionado ningún usuario');
              }
            }}
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 border border-transparent rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Eliminar Usuario
            </div>
          </button>
        </div>
      </ModernPopup>
    </div>
  );
} 