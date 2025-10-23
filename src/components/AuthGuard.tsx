"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = pathname ? publicRoutes.includes(pathname) : false;

  useEffect(() => {
    const checkAuth = async () => {
      // Si es una ruta pública, no verificar autenticación
      if (isPublicRoute) {
        setIsChecking(false);
        return;
      }

      // Si no requiere autenticación, permitir acceso
      if (!requireAuth) {
        setIsChecking(false);
        return;
      }


      // Verificar si hay token en localStorage
      const token = localStorage.getItem('token');
      
      if (!token || token === 'undefined' || token === 'null') {
        // No hay token válido, redirigir al login
        localStorage.clear();
        router.push(redirectTo);
        return;
      }

      // Si hay token pero el contexto no está cargado, esperar
      if (isLoading) {
        return;
      }

      // Si no está autenticado según el contexto, redirigir
      if (!isAuthenticated || !user) {
        localStorage.clear();
        router.push(redirectTo);
        return;
      }

      // Todo está bien, permitir acceso
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, user, isLoading, isPublicRoute, requireAuth, redirectTo, router, pathname]);

  // Mostrar loading mientras se verifica la autenticación
  if (isChecking || (requireAuth && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si es una ruta pública o no requiere autenticación, mostrar contenido
  if (isPublicRoute || !requireAuth) {
    return <>{children}</>;
  }

  // Si requiere autenticación y está autenticado, mostrar contenido
  if (requireAuth && isAuthenticated && user) {
    return <>{children}</>;
  }

  // En cualquier otro caso, no mostrar nada (se redirigirá)
  return null;
};

export default AuthGuard;
