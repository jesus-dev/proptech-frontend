'use client';

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import MobileOptimizer from "@/components/mobile/MobileOptimizer";
import { Providers } from "./providers";
import { PublicProviders } from "./publicProviders";
import { Toaster } from "@/components/ui/toaster";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Rutas públicas (no requieren autenticación ni providers con APIs privadas)
  const publicRoutes = [
    '/public',
    '/login', 
    '/register', 
    '/forgot-password',
    '/reset-password',
    '/social',
    '/propshots'
  ];
  
  const isPublic = publicRoutes.some(route => pathname?.startsWith(route));

  return (
    <>
      {isPublic ? (
        <MobileOptimizer>
          <PublicProviders>
            {children}
            <div id="modal-root" />
            <Toaster />
          </PublicProviders>
        </MobileOptimizer>
      ) : (
        <AuthProvider>
          <MobileOptimizer>
            <Providers>
              {children}
              <div id="modal-root" />
              <Toaster />
            </Providers>
          </MobileOptimizer>
        </AuthProvider>
      )}
    </>
  );
}

