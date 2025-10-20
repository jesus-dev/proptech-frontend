'use client';

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import MobileOptimizer from "@/components/mobile/MobileOptimizer";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublic = pathname?.startsWith("/public");

  return (
    <>
      {isPublic ? (
        <MobileOptimizer>
          <Providers>
            {children}
            <div id="modal-root" />
            <Toaster />
          </Providers>
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

