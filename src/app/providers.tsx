'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { ContactProvider } from '@/context/ContactContext';
import { SectorProvider } from '@/context/SectorContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <ContactProvider>
          <SectorProvider>
            {children}
          </SectorProvider>
        </ContactProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
