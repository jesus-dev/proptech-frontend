"use client";

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Role, Permission } from '@/types/auth';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield,
  Users,
  Key,
  UserCheck,
  UserX,
  Lock,
  AlertTriangle
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
import { toast } from 'sonner';
import ModernPopup from '@/components/ui/ModernPopup';

export default function RolesPage() {
  const { hasPermission } = useAuthContext();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    active: true,
  });

  // Check permissions
  const canCreate = hasPermission('ROLE_CREATE');
  const canUpdate = hasPermission('ROLE_UPDATE');
  const canDelete = hasPermission('ROLE_DELETE');
  const canView = hasPermission('ROLE_READ');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        authService.getRoles(),
        authService.getPermissions()
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      toast.error('Error al cargar los datos');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || role.active === (statusFilter === 'active');
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (active: boolean) => {
    return active ? 
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Activo</Badge> : 
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Inactivo</Badge>;
  };

  const getPermissionBadge = (permission: string) => {
    return <Badge variant="secondary" className="text-xs">{permission}</Badge>;
  };

  // Abrir modal de edición
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissions: Array.isArray(role.permissions) 
        ? role.permissions.map((p: string | Permission) => typeof p === 'string' ? p : p.name) 
        : [],
      active: !!role.active,
    });
    setShowRoleModal(true);
  };

  // Guardar cambios
  const handleSaveRole = async () => {
    if (!editingRole) return;
    try {
      // Mapear nombres de permisos seleccionados a IDs
      const permissionIds = permissions
        .filter(p => roleForm.permissions.includes(p.name))
        .map(p => p.id);
      await authService.updateRole(editingRole.id, {
        name: roleForm.name,
        description: roleForm.description,
        active: roleForm.active,
        permissionIds,
      });
      toast.success('Rol actualizado correctamente');
      setShowRoleModal(false);
      setEditingRole(null);
      await loadData();
    } catch (error) {
      toast.error('Error al actualizar el rol');
    }
  };

  // Cerrar modal
  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setEditingRole(null);
  };

  if (!canView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">No tienes permisos para ver esta página.</p>
          <Button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando roles y permisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Title Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-pink-900 dark:from-white dark:via-red-200 dark:to-pink-200 bg-clip-text text-transparent">
                  Gestión de Roles
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Administra roles y sus permisos asignados de manera segura
              </p>
        </div>

            {/* Action Button */}
        {canCreate && (
              <Button className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-500/30">
                <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
            Nuevo Rol
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
          </Button>
        )}
      </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Roles</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{roles.length}</p>
        </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Activos</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {roles.filter(r => r.active).length}
              </p>
            </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactivos</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {roles.filter(r => !r.active).length}
              </p>
            </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <UserX className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Permisos</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{permissions.length}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Key className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-sm transition-all duration-200"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-sm transition-all duration-200"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {filteredRoles.length} de {roles.length} roles
              </span>
          </div>
        </div>
      </div>

      {/* Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
        <Table>
          <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/80 dark:to-gray-800/80 border-b border-gray-200/50 dark:border-gray-600/50">
                  <TableCell className="font-semibold text-gray-900 dark:text-white py-4 px-6 text-sm uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      Rol
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-white py-4 px-6 text-sm uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>Descripción</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-white py-4 px-6 text-sm uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-purple-500" />
                      Permisos
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-white py-4 px-6 text-sm uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>Estado</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-white py-4 px-6 text-sm uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      Usuarios
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-gray-900 dark:text-white py-4 px-6 text-sm uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <span>Acciones</span>
                  </div>
                </TableCell>
              </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100/50 dark:divide-gray-700/50">
                {filteredRoles.length === 0 ? (
              <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="text-center">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Shield className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {searchTerm || statusFilter !== 'all' ? "No se encontraron roles" : "No hay roles registrados"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          {searchTerm || statusFilter !== 'all' 
                            ? "No se encontraron roles que coincidan con los filtros aplicados."
                            : "Comienza creando tu primer rol para gestionar los permisos del sistema."}
                        </p>
                        {!searchTerm && statusFilter === 'all' && canCreate && (
                          <Button className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                            <Plus className="w-5 h-5 mr-2" />
                            Crear Primer Rol
                          </Button>
                        )}
                      </div>
                </TableCell>
              </TableRow>
            ) : (
                  filteredRoles.map((role, index) => (
                    <TableRow 
                      key={role.id} 
                      className="hover:bg-gradient-to-r hover:from-red-50/50 hover:to-pink-50/50 dark:hover:from-red-900/10 dark:hover:to-pink-900/10 transition-all duration-200 group"
                    >
                      <TableCell className="py-6 px-6">
                        <div className="flex items-center space-x-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                            <Shield className="h-7 w-7 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-base group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200">
                              {role.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                              ID: {role.id}
                            </p>
                      </div>
                    </div>
                  </TableCell>
                      <TableCell className="py-6 px-6">
                        <div className="max-w-xs">
                          <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {role.description || (
                              <span className="italic text-gray-400 dark:text-gray-500">Sin descripción</span>
                            )}
                    </span>
                        </div>
                  </TableCell>
                      <TableCell className="py-6 px-6">
                        <div className="flex flex-wrap gap-2">
                      {role.permissions?.slice(0, 3).map((permission, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900/30 dark:to-purple-800/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                              <Key className="h-3 w-3 mr-1" />
                              {typeof permission === 'string' ? permission : permission.name}
                            </span>
                      ))}
                      {role.permissions && role.permissions.length > 3 && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                            >
                          +{role.permissions.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                      <TableCell className="py-6 px-6">
                        <div className="flex items-center">
                          {role.active ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-400 border border-green-200 dark:border-green-700 shadow-sm">
                                Activo
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <Badge className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900/20 dark:to-pink-900/20 dark:text-red-400 border border-red-200 dark:border-red-700 shadow-sm">
                                Inactivo
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg shadow-sm">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {role.permissions?.length || 0}
                      </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">permisos</p>
                          </div>
                    </div>
                  </TableCell>
                      <TableCell className="py-6 px-6 text-right">
                    <div className="flex justify-end space-x-2">
                      {canUpdate && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 p-2 rounded-lg"
                              title="Editar rol"
                              onClick={() => handleEditRole(role)}
                            >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 p-2 rounded-lg"
                              title="Eliminar rol"
                            >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
          </div>
        </div>
      </div>

      {/* Modal de edición de rol */}
      <ModernPopup
        isOpen={showRoleModal}
        onClose={handleCloseRoleModal}
        title={editingRole ? 'Editar Rol' : 'Nuevo Rol'}
        icon={<Edit className="w-6 h-6 text-white" />}
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSaveRole();
          }}
          className="space-y-6 max-h-[80vh] overflow-y-auto pr-2"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={roleForm.name}
              onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={roleForm.description}
              onChange={e => setRoleForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permisos</label>
            <div className="flex flex-wrap gap-2">
              {permissions.map(p => (
                <label key={p.name} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roleForm.permissions.includes(p.name)}
                    onChange={e => {
                      setRoleForm(f => ({
                        ...f,
                        permissions: e.target.checked
                          ? [...f.permissions, p.name]
                          : f.permissions.filter(x => x !== p.name),
                      }));
                    }}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activo</label>
            <input
              type="checkbox"
              checked={roleForm.active}
              onChange={e => setRoleForm(f => ({ ...f, active: e.target.checked }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseRoleModal}>Cancelar</Button>
            <Button type="submit" variant="default">Guardar</Button>
          </div>
        </form>
      </ModernPopup>
    </div>
  );
} 