'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingHouse } from '@/components/common/LoadingSpinner';

/**
 * Página raíz que redirige a la página pública principal
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página pública de propiedades
    router.replace('/public');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingHouse />
    </div>
  );
}

