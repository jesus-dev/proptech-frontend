"use client";

import React from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  showLoader?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallback,
  showLoader = true,
}) => {
  const router = useRouter();
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    hasPermission, 
    hasAllPermissions, 
    hasRole, 
    hasAnyRole 
  } = useAuthContext();

  console.log('🛡️ PROTECTED ROUTE - Estado actual:', {
    isAuthenticated,
    isLoading,
    user: user ? 'Usuario presente' : 'Sin usuario',
    requiredPermissions,
    requiredRoles
  });

  // Mostrar loader mientras se verifica la autenticación
  if (isLoading) {
    console.log('🛡️ PROTECTED ROUTE - Mostrando loader...');
    return showLoader ? (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    ) : null;
  }

  // Usuario no autenticado
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-500 mb-4">
            Debes iniciar sesión para acceder a esta página.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  // Verificar permisos requeridos
  if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
    const missingPermissions = requiredPermissions.filter(permission => !hasPermission(permission));
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Permisos Insuficientes
          </h2>
          <p className="text-gray-500 mb-2">
            No tienes los permisos necesarios para acceder a esta página.
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Permisos requeridos: {missingPermissions.join(', ')}
          </p>
          {fallback || (
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Volver
            </button>
          )}
        </div>
      </div>
    );
  }

  // Verificar roles requeridos
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Rol Insuficiente
          </h2>
          <p className="text-gray-500 mb-2">
            Tu rol actual ({user.role}) no tiene acceso a esta página.
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Roles requeridos: {requiredRoles.join(', ')}
          </p>
          {fallback || (
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Volver
            </button>
          )}
        </div>
      </div>
    );
  }

  // Usuario tiene todos los permisos y roles necesarios
  return <>{children}</>;
};

// Componentes de conveniencia para roles específicos
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute requiredRoles={[UserRole.ADMIN]} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const ManagerOrAdmin: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute requiredRoles={[UserRole.MANAGER, UserRole.ADMIN]} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const AgentOrHigher: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute requiredRoles={[UserRole.AGENT, UserRole.MANAGER, UserRole.ADMIN]} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

// Componentes de conveniencia para permisos específicos
export const SubscriptionPlansManager: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute 
    requiredPermissions={["MANAGE_SUBSCRIPTION_PLANS"]} 
    fallback={fallback}
  >
    {children}
  </ProtectedRoute>
);

export const SalesAgentsManager: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute 
    requiredPermissions={["MANAGE_SALES_AGENTS"]} 
    fallback={fallback}
  >
    {children}
  </ProtectedRoute>
);

export const CommissionsManager: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute 
    requiredPermissions={["MANAGE_COMMISSIONS"]} 
    fallback={fallback}
  >
    {children}
  </ProtectedRoute>
); 