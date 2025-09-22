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
  Menu,
  PlusCircle,
  RefreshCw
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
} from '@/components/ui/table/index';
import ModernPopup from '@/components/ui/ModernPopup';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { toast } from 'sonner';
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface MenuPermissionForm {
  path: string;
  resource: string;
  description: string;
  actions: string[];
}

const AVAILABLE_ACTIONS = [
  { value: 'READ', label: 'Leer' },
  { value: 'CREATE', label: 'Crear' },
  { value: 'UPDATE', label: 'Actualizar' },
  { value: 'DELETE', label: 'Eliminar' },
  { value: 'EXPORT', label: 'Exportar' },
  { value: 'IMPORT', label: 'Importar' },
  { value: 'APPROVE', label: 'Aprobar' },
  { value: 'REJECT', label: 'Rechazar' },
  { value: 'ASSIGN', label: 'Asignar' },
  { value: 'MANAGE', label: 'Gestionar' }
];

export default function MenuPermissionsPage() {
  const { hasPermission } = useAuthContext();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<MenuPermissionForm>({
    path: '',
    resource: '',
    description: '',
    actions: []
  });

  // Estado para edición y borrado
  const [editingMenuPermission, setEditingMenuPermission] = useState<any | null>(null);
  const [showMenuPermissionModal, setShowMenuPermissionModal] = useState(false);
  const [menuPermissionForm, setMenuPermissionForm] = useState<MenuPermissionForm>({
    path: '',
    resource: '',
    description: '',
    actions: []
  });
  const [deletingMenuPermission, setDeletingMenuPermission] = useState<any | null>(null);

  // Check permissions
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

  const handleScanPermissions = async () => {
    try {
      setIsScanning(true);
      await authService.scanPermissions();
      toast.success('Escaneo de permisos completado');
      await loadData(); // Recargar datos
    } catch (error) {
      toast.error('Error al escanear permisos');
      console.error('Error scanning permissions:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddMenuPermission = async () => {
    try {
      if (!formData.path || !formData.resource || !formData.description || formData.actions.length === 0) {
        toast.error('Todos los campos son requeridos');
        return;
      }

      await authService.addMenuPermission(formData);
      toast.success('Permisos agregados exitosamente');
      setIsAddDialogOpen(false);
      setFormData({ path: '', resource: '', description: '', actions: [] });
      await loadData(); // Recargar datos
    } catch (error) {
      toast.error('Error al agregar permisos');
      console.error('Error adding menu permission:', error);
    }
  };

  const handleActionToggle = (action: string) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.includes(action)
        ? prev.actions.filter(a => a !== action)
        : [...prev.actions, action]
    }));
  };

  // Handler para editar
  const handleEditMenuPermission = (perm: any) => {
    setEditingMenuPermission(perm);
    setMenuPermissionForm({
      path: perm.path,
      resource: perm.resource,
      description: perm.description,
      actions: perm.actions || [],
    });
    setShowMenuPermissionModal(true);
  };
  // Handler para guardar edición
  const handleSaveMenuPermission = async () => {
    try {
      if (editingMenuPermission) {
        // await authService.updateMenuPermission(editingMenuPermission.id, menuPermissionForm);
        toast.success('Permiso de menú actualizado (simulado)');
      }
      setShowMenuPermissionModal(false);
      setEditingMenuPermission(null);
      await loadData();
    } catch (error) {
      toast.error('Error al actualizar el permiso de menú');
    }
  };
  // Handler para eliminar
  const handleDeleteMenuPermission = async () => {
    if (!deletingMenuPermission) return;
    try {
      // await authService.deleteMenuPermission(deletingMenuPermission.id);
      toast.success('Permiso de menú eliminado (simulado)');
      setDeletingMenuPermission(null);
      await loadData();
    } catch (error) {
      toast.error('Error al eliminar el permiso de menú');
    }
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (permission.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || 
                           (categoryFilter === 'sin-categoria' ? !permission.category : permission.category === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(permissions.map(p => p.category))).sort();

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">
            No tienes los permisos necesarios para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Permisos de Menús</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los permisos automáticamente basados en la estructura de menús
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleScanPermissions}
            disabled={isScanning}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Escaneando...' : 'Escanear Menús'}
          </Button>
          {canCreate && (
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Agregar Menú
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar permisos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category || 'sin-categoria'}>
                {category || 'Sin categoría'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Nombre</TableCell>
              <TableCell isHeader>Descripción</TableCell>
              <TableCell isHeader>Recurso</TableCell>
              <TableCell isHeader>Acción</TableCell>
              <TableCell isHeader>Categoría</TableCell>
              <TableCell isHeader>Estado</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <LoadingSpinner message="Cargando permisos del sistema" />
                    <span className="ml-2">Cargando permisos...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPermissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No se encontraron permisos
                </TableCell>
              </TableRow>
            ) : (
              filteredPermissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-indigo-600" />
                      {permission.name}
                    </div>
                  </TableCell>
                  <TableCell>{permission.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{permission.resource}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{permission.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{permission.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={permission.active ? "default" : "destructive"}>
                      {permission.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Editar"
                        onClick={() => handleEditMenuPermission(permission)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Eliminar"
                        onClick={() => setDeletingMenuPermission(permission)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-indigo-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Permisos</p>
              <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Key className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {permissions.filter(p => p.active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Folder className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Categorías</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Menu className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Menús Escaneados</p>
              <p className="text-2xl font-bold text-gray-900">
                {Array.from(new Set(permissions.map(p => p.resource))).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Popup for Add Menu Permission */}
      <ModernPopup
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Agregar Permisos de Menú"
        subtitle="Define los permisos para un nuevo menú o ruta del sistema"
        icon={<PlusCircle className="w-6 h-6 text-white" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleAddMenuPermission(); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ruta *
              </label>
              <input
                type="text"
                value={formData.path}
                onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
                placeholder="/nuevo-menu"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Recurso *
              </label>
              <input
                type="text"
                value={formData.resource}
                onChange={(e) => setFormData(prev => ({ ...prev, resource: e.target.value.toUpperCase() }))}
                placeholder="NUEVO_RECURSO"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Descripción *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del menú"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Acciones *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              {AVAILABLE_ACTIONS.map((action) => (
                <div key={action.value} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={action.value}
                    checked={formData.actions.includes(action.value)}
                    onChange={() => handleActionToggle(action.value)}
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600"
                  />
                  <label htmlFor={action.value} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {action.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => setIsAddDialogOpen(false)}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 border border-transparent rounded-xl hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center gap-2">
                <span>✅</span>
                Agregar Permisos
              </div>
            </button>
          </div>
        </form>
      </ModernPopup>
      {/* Modal de editar menú */}
      <ModernPopup
        isOpen={showMenuPermissionModal}
        onClose={() => setShowMenuPermissionModal(false)}
        title={editingMenuPermission ? 'Editar Permiso de Menú' : 'Nuevo Permiso de Menú'}
        icon={<Edit className="w-6 h-6 text-white" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={e => { e.preventDefault(); handleSaveMenuPermission(); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ruta *
              </label>
              <input
                type="text"
                value={menuPermissionForm.path}
                onChange={e => setMenuPermissionForm(prev => ({ ...prev, path: e.target.value }))}
                placeholder="/ruta"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Recurso *
              </label>
              <input
                type="text"
                value={menuPermissionForm.resource}
                onChange={e => setMenuPermissionForm(prev => ({ ...prev, resource: e.target.value }))}
                placeholder="RECURSO"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Descripción *
            </label>
            <input
              type="text"
              value={menuPermissionForm.description}
              onChange={e => setMenuPermissionForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Acciones *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              {AVAILABLE_ACTIONS.map((action) => (
                <div key={action.value} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={action.value + '-edit'}
                    checked={menuPermissionForm.actions.includes(action.value)}
                    onChange={() => setMenuPermissionForm(prev => ({
                      ...prev,
                      actions: prev.actions.includes(action.value)
                        ? prev.actions.filter(a => a !== action.value)
                        : [...prev.actions, action.value]
                    }))}
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600"
                  />
                  <label htmlFor={action.value + '-edit'} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {action.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => setShowMenuPermissionModal(false)}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 border border-transparent rounded-xl hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center gap-2">
                <span>💾</span>
                Guardar Cambios
              </div>
            </button>
          </div>
        </form>
      </ModernPopup>
      {/* Modal de confirmación de borrado */}
      <ModernPopup
        isOpen={!!deletingMenuPermission}
        onClose={() => setDeletingMenuPermission(null)}
        title="Eliminar Permiso de Menú"
        icon={<Trash2 className="w-6 h-6 text-white" />}
        maxWidth="max-w-md"
      >
        <div className="space-y-6 max-w-md">
          <p className="text-lg text-gray-700 dark:text-gray-200">
            ¿Estás seguro de que deseas eliminar el permiso de menú <span className="font-bold">{deletingMenuPermission?.path}</span>?
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setDeletingMenuPermission(null)}>Cancelar</Button>
            <Button type="button" variant="default" onClick={handleDeleteMenuPermission} className="bg-red-600 hover:bg-red-700 text-white">Eliminar</Button>
          </div>
        </div>
      </ModernPopup>
    </div>
  );
} 