import { useRouter } from 'next/router';
import { useEffect } from 'react';

/**
 * Página pública de propiedades por ID
 * Redirecciona a la ruta pública /propiedad/[id]
 * 
 * Esta página permite acceder a propiedades públicas usando:
 * https://proptech.com.py/properties/82
 * 
 * Y se redirige a:
 * https://proptech.com.py/propiedad/82
 */
export default function PublicPropertyById() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      // Redirigir a la ruta pública
      router.replace(`/propiedad/${id}`);
    }
  }, [id, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando propiedad...</p>
      </div>
    </div>
  );
}

