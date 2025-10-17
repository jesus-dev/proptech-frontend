"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/public/layout/Header';
import Footer from '@/components/public/layout/Footer';

export default function PublicLayout({ children }: any) {
  const pathname = usePathname();
  const isPropertiesPage = pathname?.startsWith('/propiedades');

  return (
    <>
      <Header />
      <main className={`min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 antialiased ${
        isPropertiesPage ? '' : 'pt-14 sm:pt-16 px-3 sm:px-4'
      }`}>
        <div className={`${isPropertiesPage ? 'w-full' : 'max-w-7xl mx-auto w-full'} selection:bg-brand-200 selection:text-brand-900 dark:selection:bg-brand-400/30 dark:selection:text-white`}>
          <div className={isPropertiesPage ? '' : 'space-y-10 sm:space-y-14 lg:space-y-20'}>
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}


