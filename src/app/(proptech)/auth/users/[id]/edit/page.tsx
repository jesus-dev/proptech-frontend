"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { User, Role } from '@/types/auth';
import { Shield } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import UserForm from '../../components/UserForm';

export default function EditUserPage() {
  const params = useParams();
  const userId = params.id as string;
  const { hasPermission } = useAuthContext();
  
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canUpdate = hasPermission('USER_UPDATE');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [userData, rolesData, tenantsData] = await Promise.all([
        authService.getUserById(Number(userId)),
        authService.getRoles().catch(() => []),
        authService.getTenants().catch(() => [])
      ]);

      if (!userData) {
        setError('Usuario no encontrado');
        return;
      }

      setUser(userData);
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
      setError('Error al cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!canUpdate) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para editar usuarios.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Cargando usuario..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <UserForm
      user={user}
      roles={roles}
      tenants={tenants}
      agencies={agencies}
      isEditing={true}
    />
  );
}
