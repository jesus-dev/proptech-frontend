"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { User, Role } from '@/types/auth';
import { 
  Search, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Shield,
  Mail,
  Clock,
  Filter,
  RefreshCw,
  PlusCircle,
  Users,
  UserPlus,
  Activity,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  Crown,
  Briefcase,
  User as UserIcon,
  Building,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  Eye
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
import { toast } from 'sonner';
import LoadingSpinner from "@/components/common/LoadingSpinner";

const USER_TYPE_ICONS = {
  SUPER_ADMIN: Crown,
  TENANT_ADMIN: Building,
  AGENCY_ADMIN: Briefcase,
  AGENT: UserCheck,
  MANAGER: Shield,
  VIEWER: Eye,
  CUSTOMER: UserIcon
};

const USER_TYPE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  TENANT_ADMIN: 'Admin Tenant',
  AGENCY_ADMIN: 'Admin Agencia',
  AGENT: 'Agente',
  MANAGER: 'Gerente',
  VIEWER: 'Visualizador',
  CUSTOMER: 'Cliente'
};

export default function UsersPage() {
  const router = useRouter();
  const { hasPermission } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

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
        authService.getUsers().catch(() => []),
        authService.getRoles().catch(() => [])
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
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
      default:
        aValue = a.fullName;
        bValue = b.fullName;
    }
    return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
  });

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await authService.deleteUser(userToDelete.id);
      toast.success('Usuario eliminado exitosamente');
      loadData();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Error al eliminar el usuario');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-emerald-100 !text-gray-900 border-emerald-300 flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-600" />Activo</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-red-100 !text-gray-900 border-red-300 flex items-center gap-1"><XCircle className="h-3 w-3 text-red-600" />Inactivo</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-orange-100 !text-gray-900 border-orange-300 flex items-center gap-1"><AlertCircle className="h-3 w-3 text-orange-600" />Suspendido</Badge>;
      case 'LOCKED':
        return <Badge className="bg-gray-100 !text-gray-900 border-gray-300 flex items-center gap-1"><Lock className="h-3 w-3 text-gray-600" />Bloqueado</Badge>;
      default:
        return <Badge className="bg-gray-100 !text-gray-900 border-gray-300">{status}</Badge>;
    }
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
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    try {
      for (const userId of selectedUsers) {
        switch (action) {
          case 'activate': await authService.activateUser(userId); break;
          case 'deactivate': await authService.deactivateUser(userId); break;
          case 'delete': await authService.deleteUser(userId); break;
        }
      }
      toast.success(`Acción completada para ${selectedUsers.length} usuarios`);
      setSelectedUsers([]);
      loadData();
    } catch (error) {
      toast.error(`Error al ejecutar acción`);
    }
  };

  const getActiveUsersCount = () => users.filter(u => u.status === 'ACTIVE').length;
  const getInactiveUsersCount = () => users.filter(u => u.status === 'INACTIVE').length;
  const getRecentUsersCount = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return users.filter(u => u.createdAt && new Date(u.createdAt) > oneWeekAgo).length;
  };

  const getDemoUsers = () => users.filter(user => 
    user.email.toLowerCase().includes('test') ||
    user.email.toLowerCase().includes('demo') ||
    user.email.toLowerCase().includes('ejemplo') ||
    user.email.toLowerCase().includes('example') ||
    user.email.toLowerCase().includes('prueba') ||
    (user.roles && user.roles.includes('CUSTOMER'))
  );

  const handleDeleteDemoUsers = async () => {
    const demoUsers = getDemoUsers();
    
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

      toast.success(`✅ ${deleted} usuarios demo eliminados${failed > 0 ? ` (${failed} fallaron)` : ''}`);
      loadData();
    } catch (error) {
      toast.error('Error al eliminar usuarios demo');
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
    <div className="space-y-6">
      {/* Header */}
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
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            <Button variant="outline" onClick={loadData} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
            {canDelete && getDemoUsers().length > 0 && (
              <Button
                variant="outline"
                onClick={handleDeleteDemoUsers}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar Demo ({getDemoUsers().length})
              </Button>
            )}
            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleBulkAction('activate')} className="border-green-200 text-green-700 hover:bg-green-50">
                  <UserCheck className="h-4 w-4 mr-1" />Activar ({selectedUsers.length})
                </Button>
                <Button variant="outline" onClick={() => handleBulkAction('deactivate')} className="border-red-200 text-red-700 hover:bg-red-50">
                  <UserX className="h-4 w-4 mr-1" />Desactivar ({selectedUsers.length})
                </Button>
              </div>
            )}
            {canCreate && (
              <Button 
                onClick={() => router.push('/auth/users/new')} 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Filtrar por estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activos</SelectItem>
                <SelectItem value="INACTIVE">Inactivos</SelectItem>
                <SelectItem value="SUSPENDED">Suspendidos</SelectItem>
                <SelectItem value="LOCKED">Bloqueados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger><SelectValue placeholder="Filtrar por rol" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Usuarios</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Activos</p>
              <p className="text-2xl font-bold">{getActiveUsersCount()}</p>
            </div>
            <UserCheck className="h-8 w-8 text-emerald-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Inactivos</p>
              <p className="text-2xl font-bold">{getInactiveUsersCount()}</p>
            </div>
            <UserX className="h-8 w-8 text-red-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Nuevos (7 días)</p>
              <p className="text-2xl font-bold">{getRecentUsersCount()}</p>
            </div>
            <UserPlus className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Lista de Usuarios
          </h3>
          <span className="bg-white px-3 py-1 rounded-full border border-gray-200 text-sm text-gray-500">
            {filteredUsers.length} de {users.length} usuarios
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableCell isHeader className="w-12">
                  <button onClick={handleSelectAll} className="p-1 hover:bg-gray-200 rounded">
                    {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 
                      ? <CheckSquare className="h-4 w-4 text-indigo-600" />
                      : <Square className="h-4 w-4 text-gray-400" />
                    }
                  </button>
                </TableCell>
                <TableCell isHeader>
                  <button onClick={() => { setSortBy('name'); setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center gap-1 hover:text-indigo-600">
                    Usuario
                    {sortBy === 'name' ? (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                  </button>
                </TableCell>
                <TableCell isHeader className="hidden md:table-cell">Email</TableCell>
                <TableCell isHeader className="hidden lg:table-cell">Roles</TableCell>
                <TableCell isHeader className="hidden md:table-cell">Estado</TableCell>
                <TableCell isHeader className="hidden md:table-cell">Último Login</TableCell>
                <TableCell isHeader className="text-right">Acciones</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <LoadingSpinner message="Cargando usuarios..." />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No se encontraron usuarios</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const primaryRole = user.roles?.[0];
                  const UserTypeIcon = primaryRole ? (USER_TYPE_ICONS[primaryRole as keyof typeof USER_TYPE_ICONS] || UserIcon) : UserIcon;
                  const roleLabel = primaryRole ? (USER_TYPE_LABELS[primaryRole as keyof typeof USER_TYPE_LABELS] || primaryRole) : 'Sin rol';
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
                  
                  return (
                    <TableRow key={user.id} className={`hover:bg-gray-50 ${selectedUsers.includes(user.id) ? 'bg-indigo-50' : ''}`}>
                      <TableCell>
                        <button onClick={() => handleSelectUser(user.id)} className="p-1 hover:bg-gray-200 rounded">
                          {selectedUsers.includes(user.id) 
                            ? <CheckSquare className="h-4 w-4 text-indigo-600" />
                            : <Square className="h-4 w-4 text-gray-400" />
                          }
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                            {(user as any).photoUrl ? (
                              <img 
                                src={(user as any).photoUrl.startsWith('http') ? (user as any).photoUrl : `${apiUrl}${(user as any).photoUrl}`}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <span className="text-sm font-bold text-white">
                                {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre'}</p>
                              {/* Indicador de estado visible solo en móvil */}
                              <span className={`md:hidden w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`} title={user.status === 'ACTIVE' ? 'Activo' : 'Inactivo'} />
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <UserTypeIcon className="h-3 w-3" />
                              {roleLabel}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map((role, i) => (
                            <Badge key={i} className="bg-blue-100 text-blue-800 border-blue-300 text-xs">{role}</Badge>
                          )) || <span className="text-gray-400 text-xs italic">Sin roles</span>}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{getStatusBadge(user.status || 'ACTIVE')}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'Nunca'
                          }
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {canUpdate && (
                            <button 
                              onClick={() => router.push(`/auth/users/${user.id}/edit`)}
                              className="p-2 hover:bg-blue-50 rounded-lg"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </button>
                          )}
                          {user.status === 'ACTIVE' ? (
                            <button onClick={() => handleDeactivateUser(user.id)} className="p-2 hover:bg-orange-50 rounded-lg" title="Desactivar">
                              <UserX className="h-4 w-4 text-orange-600" />
                            </button>
                          ) : (
                            <button onClick={() => handleActivateUser(user.id)} className="p-2 hover:bg-green-50 rounded-lg" title="Activar">
                              <UserCheck className="h-4 w-4 text-green-600" />
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              onClick={() => { setUserToDelete(user); setShowDeleteModal(true); }}
                              className="p-2 hover:bg-red-50 rounded-lg"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
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

      {/* Modal de confirmación de eliminación */}
      <ModernPopup
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setUserToDelete(null); }}
        title="Confirmar Eliminación"
        subtitle={`¿Estás seguro de eliminar al usuario "${userToDelete?.fullName}"?`}
        icon={<Trash2 className="w-6 h-6 text-white" />}
        maxWidth="max-w-md"
      >
        <div className="flex justify-end gap-3 pt-6">
          <Button variant="outline" onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </ModernPopup>
    </div>
  );
}
