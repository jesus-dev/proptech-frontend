"use client";

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Role } from '@/types/auth';
import { Shield } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import UserForm from '../components/UserForm';

export default function NewUserPage() {
  const { hasPermission } = useAuthContext();
  const [roles, setRoles] = useState<Role[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const canCreate = hasPermission('USER_CREATE');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [rolesData, tenantsData] = await Promise.all([
        authService.getRoles().catch(() => []),
        authService.getTenants().catch(() => [])
      ]);

      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setTenants(Array.isArray(tenantsData) ? tenantsData : []);

      // Cargar agencias
      try {
        const { getAllAgencies } = await import('@/app/(proptech)/catalogs/agencies/services/agencyService');
        const agenciesData = await getAllAgencies().catch(() => []);
        setAgencies(Array.isArray(agenciesData) ? agenciesData : []);
      } catch {
        setAgencies([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!canCreate) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para crear usuarios.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Cargando formulario..." />
      </div>
    );
  }

  return (
    <UserForm
      roles={roles}
      tenants={tenants}
      agencies={agencies}
      isEditing={false}
    />
  );
}
