'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Cargar el contenido de la página social solo en el cliente
const SocialPageContent = dynamic(() => import('./SocialPageContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando red social...</p>
                  </div>
                    </div>
  )
});

export default function SocialPage() {
                  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando red social...</p>
                    </div>
              </div>
    }>
      <SocialPageContent />
    </Suspense>
  );
}
