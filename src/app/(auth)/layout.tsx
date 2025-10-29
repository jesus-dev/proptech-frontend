'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function AuthLayout({ children }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    // Si ya está autenticado, redirigir al dashboard
    if (!isLoading && isAuthenticated) {
      router.push('/dash');
    }
  }, [isAuthenticated, isLoading, router]);

  // Timeout de seguridad: después de 2.5 segundos, mostrar el formulario aunque esté cargando
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading && !isAuthenticated) {
        console.warn('⚠️ Auth layout timeout - showing login form');
        setForceShow(true);
      }
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, [isLoading, isAuthenticated]);

  // Si está cargando y no hemos forzado mostrar, mostrar loading
  if (isLoading && !forceShow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Verificando autenticación" />
      </div>
    );
  }

  // Si ya está autenticado, no mostrar nada (se redirigirá)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 