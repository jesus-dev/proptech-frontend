"use client";

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Role, Permission } from '@/types/auth';
import { 
  Shield, 
  Crown, 
  Building, 
  Briefcase, 
  UserCheck, 
  Settings, 
  Eye, 
  ShoppingCart,
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
  AlertCircle,
  Users,
  BarChart3,
  Key,
  Folder,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface PermissionGroup {
  category: string;
  permissions: Permission[];
}

const ROLE_ICONS: Record<string, any> = {
  SUPER_ADMIN: Crown,
  TENANT_ADMIN: Building,
  AGENCY_ADMIN: Briefcase,
  AGENT: UserCheck,
  MANAGER: Settings,
  VIEWER: Eye,
  CUSTOMER: ShoppingCart
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'from-purple-500 to-purple-600',
  TENANT_ADMIN: 'from-blue-500 to-blue-600',
  AGENCY_ADMIN: 'from-green-500 to-green-600',
  AGENT: 'from-orange-500 to-orange-600',
  MANAGER: 'from-gray-500 to-gray-600',
  VIEWER: 'from-slate-500 to-slate-600',
  CUSTOMER: 'from-pink-500 to-pink-600'
};

export default function RolePermissionsPage() {
  const { hasPermission } = useAuthContext();
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const canManage = hasPermission('ROLE_ASSIGN_PERMISSIONS');

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
      setAllPermissions(permissionsData);
      
      if (rolesData.length > 0) {
        selectRole(rolesData[0]);
      }
    } catch (error) {
      toast.error('Error al cargar los datos');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (role: Role) => {
    setSelectedRole(role);
    const permissionIds = new Set(role.permissionDetails?.map(p => p.id) || []);
    setRolePermissions(permissionIds);
  };

  const togglePermission = (permissionId: number) => {
    if (!canManage) {
      toast.error('No tienes permisos para modificar roles');
      return;
    }

    setRolePermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const saveRolePermissions = async () => {
    if (!selectedRole || !canManage) return;

    setSaving(true);
    try {
      await authService.updateRole(selectedRole.id, {
        ...selectedRole,
        permissionIds: Array.from(rolePermissions)
      });
      
      toast.success('Permisos actualizados exitosamente');
      await loadData();
    } catch (error) {
      toast.error('Error al guardar los permisos');
      console.error('Error saving permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  // Agrupar permisos por categoría
  const groupedPermissions: PermissionGroup[] = allPermissions.reduce((groups, permission) => {
    const category = permission.category || 'OTROS';
    const existingGroup = groups.find(g => g.category === category);
    
    if (existingGroup) {
      existingGroup.permissions.push(permission);
    } else {
      groups.push({
        category,
        permissions: [permission]
      });
    }
    
    return groups;
  }, [] as PermissionGroup[]);

  // Ordenar grupos por categoría
  groupedPermissions.sort((a, b) => a.category.localeCompare(b.category));

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      USERS: Users,
      PROPERTIES: Building,
      DEVELOPMENTS: Briefcase,
      REPORTS: BarChart3,
      SETTINGS: Settings,
      PERMISSIONS: Shield,
      ROLES: Key
    };
    return icons[category] || Folder;
  };

  if (loading) {
    return <LoadingSpinner message="Cargando roles y permisos..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestión de Roles y Permisos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configura los permisos para cada rol del sistema de forma visual e intuitiva
              </p>
            </div>
          </div>

          {!canManage && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-5 w-5" />
                <p className="text-sm font-medium">
                  Solo puedes ver los permisos. No tienes autorización para modificarlos.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar - Lista de Roles */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Roles del Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {roles.map((role) => {
                  const Icon = ROLE_ICONS[role.name] || Shield;
                  const gradient = ROLE_COLORS[role.name] || 'from-gray-500 to-gray-600';
                  const isSelected = selectedRole?.id === role.id;
                  
                  return (
                    <button
                      key={role.id}
                      onClick={() => selectRole(role)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                        isSelected 
                          ? `bg-gradient-to-r ${gradient} text-white shadow-lg scale-105` 
                          : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${
                            isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
                          }`}>
                            {role.name.replace(/_/g, ' ')}
                          </p>
                          <p className={`text-xs ${
                            isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {role.permissionDetails?.length || 0} permisos
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Permisos del Rol Seleccionado */}
          <div className="lg:col-span-3">
            {selectedRole ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 bg-gradient-to-r ${ROLE_COLORS[selectedRole.name] || 'from-gray-500 to-gray-600'} rounded-xl`}>
                        {React.createElement(ROLE_ICONS[selectedRole.name] || Shield, {
                          className: "h-6 w-6 text-white"
                        })}
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          {selectedRole.name.replace(/_/g, ' ')}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {selectedRole.description}
                        </p>
                      </div>
                    </div>
                    
                    {canManage && (
                      <Button 
                        onClick={saveRolePermissions}
                        disabled={saving}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Estadísticas */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {rolePermissions.size}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Permisos Asignados
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {allPermissions.length}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Permisos Totales
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {Math.round((rolePermissions.size / Math.max(allPermissions.length, 1)) * 100)}%
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Cobertura
                      </p>
                    </div>
                  </div>

                  {/* Permisos agrupados por categoría */}
                  <div className="space-y-6">
                    {groupedPermissions.map((group) => {
                      const CategoryIcon = getCategoryIcon(group.category);
                      const categoryPermissions = group.permissions.filter(p => p.active);
                      const assignedInCategory = categoryPermissions.filter(p => rolePermissions.has(p.id)).length;
                      
                      return (
                        <div key={group.category} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                          {/* Header de categoría */}
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                                  <CategoryIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {group.category}
                                  </h3>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {assignedInCategory} de {categoryPermissions.length} asignados
                                  </p>
                                </div>
                              </div>
                              
                              {canManage && categoryPermissions.length > 0 && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newSet = new Set(rolePermissions);
                                      categoryPermissions.forEach(p => newSet.add(p.id));
                                      setRolePermissions(newSet);
                                    }}
                                    className="text-xs"
                                  >
                                    Todos
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newSet = new Set(rolePermissions);
                                      categoryPermissions.forEach(p => newSet.delete(p.id));
                                      setRolePermissions(newSet);
                                    }}
                                    className="text-xs"
                                  >
                                    Ninguno
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Lista de permisos */}
                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {categoryPermissions.map((permission) => {
                                const isAssigned = rolePermissions.has(permission.id);
                                
                                return (
                                  <div
                                    key={permission.id}
                                    onClick={() => canManage && togglePermission(permission.id)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                      canManage ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
                                    } ${
                                      isAssigned
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`mt-0.5 flex-shrink-0 ${
                                        isAssigned ? 'text-green-600' : 'text-gray-400'
                                      }`}>
                                        {isAssigned ? (
                                          <CheckCircle className="h-5 w-5" />
                                        ) : (
                                          <XCircle className="h-5 w-5" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className={`font-semibold text-sm ${
                                            isAssigned 
                                              ? 'text-green-900 dark:text-green-100' 
                                              : 'text-gray-700 dark:text-gray-300'
                                          }`}>
                                            {permission.name}
                                          </p>
                                          <Badge variant="secondary" className="text-xs">
                                            {permission.action}
                                          </Badge>
                                        </div>
                                        <p className={`text-xs ${
                                          isAssigned
                                            ? 'text-green-700 dark:text-green-300'
                                            : 'text-gray-600 dark:text-gray-400'
                                        }`}>
                                          {permission.description}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                          Recurso: {permission.resource}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Botón flotante de guardar */}
                  {canManage && (
                    <div className="fixed bottom-8 right-8">
                      <Button
                        onClick={saveRolePermissions}
                        disabled={saving}
                        size="lg"
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-2xl hover:shadow-3xl transition-all duration-300"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecciona un rol para ver sus permisos</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Botón de recargar */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={loadData}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recargar Datos
          </Button>
        </div>
      </div>
    </div>
  );
}

