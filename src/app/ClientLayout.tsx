'use client';

import { AuthProvider } from "@/context/AuthContext";
import MobileOptimizer from "@/components/mobile/MobileOptimizer";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

/**
 * Layout del cliente que envuelve toda la aplicación.
 * AuthProvider está en todas las rutas porque incluso las públicas necesitan saber el estado de auth.
 */
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <MobileOptimizer>
        <Providers>
          {children}
          <div id="modal-root" />
          <Toaster />
        </Providers>
      </MobileOptimizer>
    </AuthProvider>
  );
}

