'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/context/ThemeContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { ContactProvider } from '@/context/ContactContext';
import { SectorProvider } from '@/context/SectorContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Rutas que NO necesitan ContactProvider (rutas públicas que no usan agentes)
  const publicRoutes = [
    '/public',
    '/login', 
    '/register', 
    '/forgot-password',
    '/reset-password',
    '/social',
    '/propshots'
  ];
  
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
  
  return (
    <ThemeProvider>
      <SidebarProvider>
        {isPublicRoute ? (
          // Rutas públicas: SIN ContactProvider (que hace llamadas a APIs privadas)
          <SectorProvider>
            {children}
          </SectorProvider>
        ) : (
          // Rutas privadas: CON ContactProvider
          <ContactProvider>
            <SectorProvider>
              {children}
            </SectorProvider>
          </ContactProvider>
        )}
      </SidebarProvider>
    </ThemeProvider>
  );
}
