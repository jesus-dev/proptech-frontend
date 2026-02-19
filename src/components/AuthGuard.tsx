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
  const publicRoutes = ['/login', '/register', '/registrarse', '/forgot-password', '/reset-password'];
  const isPublicRoute = pathname ? (publicRoutes.includes(pathname) || pathname.startsWith('/agendar')) : false;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let fallbackTimeoutId: NodeJS.Timeout;

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

      // Verificar datos de usuario en localStorage como fallback
      const userData = localStorage.getItem('user');
      let hasValidLocalStorageData = false;
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.id && parsedUser.email) {
            hasValidLocalStorageData = true;
          }
        } catch (e) {
          // Datos corruptos
        }
      }

      // Si hay token y datos válidos en localStorage, pero el contexto aún no carga,
      // esperar un poco, pero no más de 3 segundos
      if (isLoading && hasValidLocalStorageData) {
        // Timeout de fallback: si después de 2 segundos sigue cargando, usar localStorage
        fallbackTimeoutId = setTimeout(() => {
          if (isChecking) {
            console.log('⚠️ AuthGuard - Usando datos de localStorage (fallback por timeout de carga)');
            setIsChecking(false);
          }
        }, 2000);
        return;
      }

      // Si isLoading pero no hay datos válidos en localStorage, esperar un poco más
      if (isLoading) {
        return;
      }

      // Si no está autenticado según el contexto, verificar localStorage como fallback
      if (!isAuthenticated || !user) {
        if (hasValidLocalStorageData) {
          // Hay datos válidos en localStorage, permitir acceso (fallback)
          console.log('⚠️ AuthGuard - Usando datos de localStorage (fallback)');
          setIsChecking(false);
          return;
        }
        // No hay datos válidos, redirigir
        localStorage.clear();
        router.push(redirectTo);
        return;
      }

      // Todo está bien, permitir acceso
      setIsChecking(false);
    };

    // Timeout de seguridad: si después de 5 segundos seguimos esperando, usar localStorage o redirigir
    timeoutId = setTimeout(() => {
      if (isChecking && requireAuth) {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.id && user.email) {
              // Hay datos válidos, permitir acceso
              console.log('⚠️ AuthGuard - Timeout pero hay datos válidos en localStorage, permitiendo acceso');
              setIsChecking(false);
              return;
            }
          } catch (e) {
            // Datos corruptos
          }
        }
        // No hay datos válidos, redirigir
        console.warn('⚠️ Auth check timeout - redirecting to login');
        localStorage.clear();
        router.push(redirectTo);
      }
    }, 5000);

    checkAuth();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (fallbackTimeoutId) clearTimeout(fallbackTimeoutId);
    };
  }, [isAuthenticated, user, isLoading, isPublicRoute, requireAuth, redirectTo, router, pathname, isChecking]);

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
