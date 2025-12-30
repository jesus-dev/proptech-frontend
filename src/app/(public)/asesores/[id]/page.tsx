// Ruta legacy: antes se renderizaba con datos ficticios.
// Para evitar mantener datos ficticios, redirigimos a la ruta pública real del agente.
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AsesorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    const id = params?.id;
    if (id) {
      router.replace(`/agente/${id}`);
    } else {
      router.replace('/asesores');
    }
  }, [params?.id, router]);

  return null;
}
