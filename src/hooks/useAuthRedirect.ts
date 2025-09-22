"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

interface UseAuthRedirectOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
  const { redirectTo = '/login', requireAuth = true } = options;
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // No hacer nada si está cargando
    if (isLoading) return;

    // Si es una ruta pública, no verificar autenticación
    if (isPublicRoute) return;

    // Si no requiere autenticación, permitir acceso
    if (!requireAuth) return;

    // Verificar token en localStorage
    const token = localStorage.getItem('token');
    
    if (!token || token === 'undefined' || token === 'null') {
      // No hay token válido, redirigir al login
      localStorage.clear();
      router.push(redirectTo);
      return;
    }

    // Si hay token pero no está autenticado según el contexto, redirigir
    if (!isAuthenticated || !user) {
      localStorage.clear();
      router.push(redirectTo);
      return;
    }
  }, [isAuthenticated, user, isLoading, isPublicRoute, requireAuth, redirectTo, router, pathname]);

  return {
    isAuthenticated,
    isLoading,
    user,
    isPublicRoute,
  };
};

export default useAuthRedirect;
