'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { SectorProvider } from '@/context/SectorContext';

/**
 * Providers para rutas públicas que NO requieren autenticación.
 * No incluye ContactProvider porque hace llamadas a endpoints privados.
 */
export function PublicProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <SectorProvider>
          {children}
        </SectorProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

