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
  userType: 'ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER' | 'CUSTOMER';
  roles: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_ACTIVATION' | 'LOCKED';
}

const USER_TYPE_ICONS = {
  ADMIN: Crown,
  MANAGER: Building,
  AGENT: Briefcase,
  VIEWER: EyeIcon,
  CUSTOMER: UserIcon
};

const USER_TYPE_LABELS = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  AGENT: 'Agente',
  VIEWER: 'Visualizador',
  CUSTOMER: 'Cliente'
};

export default function UsersPage() {
  const { hasPermission } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
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
    userType: 'ADMIN',
    roles: [],
    status: 'ACTIVE'
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
        authService.getUsers(),
        authService.getRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      toast.error('Error al cargar los datos');
      console.error('Error loading data:', error);
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
        aValue = a.lastLogin || new Date(0);
        bValue = b.lastLogin || new Date(0);
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
      await authService.deleteUser(userId);
      toast.success('Usuario eliminado exitosamente');
      loadData();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Error al eliminar el usuario');
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
      
      if (selectedUser) {
        // Update user
        await authService.updateUser(selectedUser.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          userType: formData.userType,
          status: formData.status
        });
        toast.success('Usuario actualizado exitosamente');
      } else {
        // Create user
        await authService.createUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
          roleIds: roles.filter(r => formData.roles.includes(r.name)).map(r => r.id)
        });
        toast.success('Usuario creado exitosamente');
      }
      
      setShowUserModal(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error('Error al guardar el usuario');
      console.error('Error saving user:', error);
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
      userType: 'ADMIN',
      roles: [],
      status: 'ACTIVE'
    });
    setSelectedUser(null);
  };

  const openUserModal = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        password: '',
        userType: (user.userType as any) || 'ADMIN',
        roles: user.roles || [],
        status: (user.status as any) || 'ACTIVE'
      });
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
      user.userType === 'CUSTOMER'
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
              u.userType === 'CUSTOMER'
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
                  u.userType === 'CUSTOMER'
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
                  const UserTypeIcon = USER_TYPE_ICONS[user.userType as keyof typeof USER_TYPE_ICONS] || UserIcon;
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
                                {USER_TYPE_LABELS[user.userType as keyof typeof USER_TYPE_LABELS] || user.userType || 'Sin tipo'}
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
                          {user.lastLogin ? (
                            <span className="text-sm text-gray-600 font-medium">
                              {new Date(user.lastLogin).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Nunca ha iniciado sesión</span>
                          )}
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
          
          {!selectedUser && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Contraseña *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Usuario *
              </label>
              <select
                value={formData.userType}
                onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              >
                <option value="ADMIN">Administrador</option>
                <option value="MANAGER">Gerente</option>
                <option value="AGENT">Agente</option>
                <option value="VIEWER">Visualizador</option>
                <option value="CUSTOMER">Cliente</option>
              </select>
            </div>
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
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Roles
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={role.name}
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
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600"
                  />
                  <label htmlFor={role.name} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {role.name}
                  </label>
                </div>
              ))}
            </div>
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
      >
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={() => setShowDeleteModal(false)}
            className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
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