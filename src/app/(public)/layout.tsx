"use client";

import React from 'react';
import Header from '@/components/public/layout/Header';
import Footer from '@/components/public/layout/Footer';

export default function PublicLayout({ children }: any) {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}


