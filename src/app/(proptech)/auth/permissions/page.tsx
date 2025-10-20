"use client";

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Permission } from '@/types/auth';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield,
  Key,
  Folder,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Download,
  Eye,
  Settings,
  BarChart3,
  Zap,
  Lock,
  Unlock,
  Activity,
  Calendar,
  Star,
  Award,
  Bell,
  Cog,
  Database,
  Server,
  Globe,
  Monitor,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Building
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

export default function PermissionsPage() {
  const { hasPermission, user } = useAuthContext();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionForm, setPermissionForm] = useState({
    name: '',
    description: '',
    resource: '',
    action: '',
    category: '',
    active: true,
  });
  const [deletingPermission, setDeletingPermission] = useState<Permission | null>(null);

  // Check permissions - AuthContext now handles admin detection
  const canCreate = hasPermission('PERMISSION_CREATE');
  const canUpdate = hasPermission('PERMISSION_UPDATE');
  const canDelete = hasPermission('PERMISSION_DELETE');
  const canView = hasPermission('PERMISSION_READ');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const permissionsData = await authService.getPermissions();
      setPermissions(permissionsData);
    } catch (error) {
      toast.error('Error al cargar los datos');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || permission.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || permission.active === (statusFilter === 'active');
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (active: boolean) => {
    if (active) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-400 border border-green-200 dark:border-green-700 shadow-sm">
            Activo
          </Badge>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <Badge className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900/20 dark:to-pink-900/20 dark:text-red-400 border border-red-200 dark:border-red-700 shadow-sm">
            Inactivo
          </Badge>
        </div>
      );
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      'USERS': { 
        color: 'from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-700',
        icon: <Users className="h-3 w-3 mr-1" />
      },
      'DEVELOPMENTS': { 
        color: 'from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400 border-green-200 dark:border-green-700',
        icon: <Building className="h-3 w-3 mr-1" />
      },
      'RESERVATIONS': { 
        color: 'from-purple-100 to-violet-100 text-purple-800 dark:from-purple-900/30 dark:to-violet-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-700',
        icon: <Calendar className="h-3 w-3 mr-1" />
      },
      'REPORTS': { 
        color: 'from-orange-100 to-amber-100 text-orange-800 dark:from-orange-900/30 dark:to-amber-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-700',
        icon: <BarChart3 className="h-3 w-3 mr-1" />
      },
      'SYSTEM': { 
        color: 'from-gray-100 to-slate-100 text-gray-800 dark:from-gray-900/30 dark:to-slate-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-700',
        icon: <Settings className="h-3 w-3 mr-1" />
      }
    };
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || {
      color: 'from-gray-100 to-slate-100 text-gray-800 dark:from-gray-900/30 dark:to-slate-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-700',
      icon: <Folder className="h-3 w-3 mr-1" />
    };
    
    return (
      <Badge className={`bg-gradient-to-r ${config.color} border shadow-sm inline-flex items-center`}>
        {config.icon}
        {category}
      </Badge>
    );
  };

  const getActionBadge = (action: string) => {
    const actionConfig = {
      'READ': { 
        color: 'from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-700',
        icon: <Eye className="h-3 w-3 mr-1" />
      },
      'CREATE': { 
        color: 'from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400 border-green-200 dark:border-green-700',
        icon: <Plus className="h-3 w-3 mr-1" />
      },
      'UPDATE': { 
        color: 'from-yellow-100 to-amber-100 text-yellow-800 dark:from-yellow-900/30 dark:to-amber-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700',
        icon: <Edit className="h-3 w-3 mr-1" />
      },
      'DELETE': { 
        color: 'from-red-100 to-pink-100 text-red-800 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-400 border-red-200 dark:border-red-700',
        icon: <Trash2 className="h-3 w-3 mr-1" />
      },
      'MANAGE': { 
        color: 'from-purple-100 to-violet-100 text-purple-800 dark:from-purple-900/30 dark:to-violet-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-700',
        icon: <Settings className="h-3 w-3 mr-1" />
      }
    };
    
    const config = actionConfig[action as keyof typeof actionConfig] || {
      color: 'from-gray-100 to-slate-100 text-gray-800 dark:from-gray-900/30 dark:to-slate-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-700',
      icon: <Key className="h-3 w-3 mr-1" />
    };
    
    return (
      <Badge className={`bg-gradient-to-r ${config.color} border shadow-sm inline-flex items-center`}>
        {config.icon}
        {action}
      </Badge>
    );
  };

  const categories = Array.from(new Set(permissions.map(p => p.category).filter(Boolean)));

  // Abrir modal de edición/creación
  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setPermissionForm({
      name: permission.name,
      description: permission.description || '',
      resource: permission.resource || '',
      action: permission.action || '',
      category: permission.category || '',
      active: permission.active || false,
    });
    setShowPermissionModal(true);
  };
  const handleNewPermission = () => {
    setEditingPermission(null);
    setPermissionForm({
      name: '',
      description: '',
      resource: '',
      action: '',
      category: '',
      active: true,
    });
    setShowPermissionModal(true);
  };
  // Guardar cambios
  const handleSavePermission = async () => {
    try {
      if (editingPermission) {
        await authService.updatePermission(editingPermission.id, permissionForm);
        toast.success('Permiso actualizado correctamente');
      } else {
        await authService.createPermission(permissionForm);
        toast.success('Permiso creado correctamente');
      }
      setShowPermissionModal(false);
      setEditingPermission(null);
      await loadData();
    } catch (error) {
      toast.error('Error al guardar el permiso');
    }
  };
  // Eliminar permiso
  const handleDeletePermission = async () => {
    if (!deletingPermission) return;
    try {
      await authService.deletePermission(deletingPermission.id);
      toast.success('Permiso eliminado correctamente');
      setDeletingPermission(null);
      await loadData();
    } catch (error) {
      toast.error('Error al eliminar el permiso');
    }
  };

  if (!canView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="p-6 bg-red-100 dark:bg-red-900/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">Acceso Denegado</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No tienes permisos para acceder a esta página. Contacta al administrador del sistema.
          </p>
          <Button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-2 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg shadow-sm">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white mb-0.5">
                  Gestión de Permisos
                </h1>
                <p className="text-purple-100 text-xs">
                  Administra permisos del sistema organizados por categorías
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {canCreate && (
                <Button className="px-3 py-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium rounded-md shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 border border-white/30 text-xs" onClick={handleNewPermission}>
                  <Plus className="w-3 h-3 mr-1" />
                  Nuevo Permiso
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-1 mb-2">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-1.5 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {permissions.length}
                </p>
              </div>
              <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-sm shadow-sm">
                <Key className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-1.5 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Activos
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {permissions.filter(p => p.active).length}
                </p>
              </div>
              <div className="p-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-sm shadow-sm">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-1.5 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Inactivos
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {permissions.filter(p => !p.active).length}
                </p>
              </div>
              <div className="p-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-sm shadow-sm">
                <XCircle className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-1.5 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Categorías
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {categories.length}
                </p>
              </div>
              <div className="p-1 bg-gradient-to-r from-purple-500 to-violet-600 rounded-sm shadow-sm">
                <Folder className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
      </div>

        {/* Search and Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-2 mb-2">
          <div className="flex flex-col sm:flex-row gap-1 items-center">
        <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar permisos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-xs transition-all duration-200"
          />
        </div>
            
            <div className="flex gap-1">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2 py-1.5 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-xs transition-all duration-200"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
              
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-xs transition-all duration-200"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto max-w-full">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/80 dark:to-gray-800/80 border-b border-gray-200/50 dark:border-gray-600/50">
                  <TableCell className="font-semibold text-gray-900 dark:text-white py-1 px-2 text-xs uppercase tracking-wider w-1/5">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-purple-500" />
                      Permiso
            </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-white py-1 px-2 text-xs uppercase tracking-wider w-1/4">
                    <div className="flex items-center gap-2">
                      <span>Descripción</span>
            </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-white py-1 px-2 text-xs uppercase tracking-wider w-1/6">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-500" />
                      Recurso
          </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-white py-1 px-2 text-xs uppercase tracking-wider w-1/6">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Acción
        </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-white py-1 px-2 text-xs uppercase tracking-wider w-1/6">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-green-500" />
                      Categoría
            </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-white py-1 px-2 text-xs uppercase tracking-wider w-1/6">
                    <div className="flex items-center gap-2">
                      <span>Estado</span>
            </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-gray-900 dark:text-white py-1 px-2 text-xs uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <span>Acciones</span>
          </div>
                  </TableCell>
            </TableRow>
          </TableHeader>
              <TableBody className="divide-y divide-gray-100/50 dark:divide-gray-700/50">
            {loading ? (
              <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex items-center justify-center space-x-3">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                        <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                          Cargando permisos...
                        </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPermissions.length === 0 ? (
              <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="text-center">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Shield className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' ? "No se encontraron permisos" : "No hay permisos registrados"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                            ? "No se encontraron permisos que coincidan con los filtros aplicados."
                            : "Comienza creando tu primer permiso para gestionar el acceso al sistema."}
                        </p>
                        {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && canCreate && (
                          <Button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                            <Plus className="w-5 h-5 mr-2" />
                            Crear Primer Permiso
                          </Button>
                        )}
                      </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPermissions.map((permission) => (
                    <TableRow 
                      key={permission.id} 
                      className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/10 dark:hover:to-pink-900/10 transition-all duration-200 group"
                    >
                      <TableCell className="py-1 px-2 w-1/5">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                            <Key className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                              {permission.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              ID: {permission.id}
                            </p>
                      </div>
                    </div>
                  </TableCell>
                      <TableCell className="py-1 px-2 w-1/4">
                        <div className="max-w-xs">
                          <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            {permission.description || (
                              <span className="italic text-gray-400 dark:text-gray-500">Sin descripción</span>
                            )}
                    </span>
                        </div>
                  </TableCell>
                      <TableCell className="py-1 px-2 w-1/6">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg shadow-sm">
                            <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                            {permission.resource}
                          </Badge>
                        </div>
                  </TableCell>
                      <TableCell className="py-1 px-2 w-1/6">
                    {getActionBadge(permission.action || '')}
                  </TableCell>
                      <TableCell className="py-1 px-2 w-1/6">
                    {permission.category ? getCategoryBadge(permission.category) : 
                         <span className="text-gray-400 dark:text-gray-500 italic">Sin categoría</span>}
                      </TableCell>
                      <TableCell className="py-1 px-2 w-1/6">
                        {getStatusBadge(permission.active || false)}
                  </TableCell>
                      <TableCell className="py-1 px-2 w-1/6 text-right">
                    <div className="flex justify-end space-x-2">
                      {canUpdate && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200 p-2 rounded-lg"
                          title="Editar permiso"
                          onClick={() => handleEditPermission(permission)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200 p-2 rounded-lg"
                          title="Eliminar permiso"
                          onClick={() => setDeletingPermission(permission)}
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
      {/* Modal de crear/editar permiso */}
      <ModernPopup
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        title={editingPermission ? 'Editar Permiso' : 'Nuevo Permiso'}
        icon={<Key className="w-6 h-6 text-white" />}
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSavePermission();
          }}
          className="space-y-6 max-h-[80vh] overflow-y-auto pr-2"
        >
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={permissionForm.name}
              onChange={e => setPermissionForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={permissionForm.description}
              onChange={e => setPermissionForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Recurso</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={permissionForm.resource}
              onChange={e => setPermissionForm(f => ({ ...f, resource: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Acción</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={permissionForm.action}
              onChange={e => setPermissionForm(f => ({ ...f, action: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={permissionForm.category}
              onChange={e => setPermissionForm(f => ({ ...f, category: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Activo</label>
            <input
              type="checkbox"
              checked={permissionForm.active}
              onChange={e => setPermissionForm(f => ({ ...f, active: e.target.checked }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowPermissionModal(false)}>Cancelar</Button>
            <Button type="submit" variant="default">Guardar</Button>
          </div>
        </form>
      </ModernPopup>
      {/* Modal de confirmación de borrado */}
      <ModernPopup
        isOpen={!!deletingPermission}
        onClose={() => setDeletingPermission(null)}
        title="Eliminar Permiso"
        icon={<Trash2 className="w-6 h-6 text-white" />}
      >
        <div className="space-y-6 max-w-md">
          <p className="text-lg text-gray-700 dark:text-gray-200">
            ¿Estás seguro de que deseas eliminar el permiso <span className="font-bold">{deletingPermission?.name}</span>?
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setDeletingPermission(null)}>Cancelar</Button>
            <Button type="button" variant="outline" onClick={handleDeletePermission}>Eliminar</Button>
          </div>
        </div>
      </ModernPopup>
    </div>
  );
} 