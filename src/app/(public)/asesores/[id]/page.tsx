// Ruta legacy: redirigir a la nueva ruta con slug
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AsesorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    const id = params?.id;
    if (id) {
      // Mantener compatibilidad: redirigir a /agente/[slug] usando el ID como fallback
      router.replace(`/agente/${id}`);
    } else {
      router.replace('/asesores');
    }
  }, [params?.id, router]);

  return null;
}
