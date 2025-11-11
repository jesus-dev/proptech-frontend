import type { Metadata } from 'next';
import React from 'react';
import PropertiesSection from '@/components/public/sections/PropertiesSection';
import DiscoverProptechBanner from '@/components/public/sections/DiscoverProptechBanner';
import SimpleContactSection from '@/components/public/sections/SimpleContactSection';

export const metadata: Metadata = {
  title: 'PropTech Paraguay - Plataforma de Bienes Raíces y CRM Inmobiliario',
  description: 'La plataforma líder en Paraguay para agentes y agencias inmobiliarias. Gestiona propiedades, clientes y ventas de forma eficiente con nuestro CRM.',
  keywords: 'proptech, crm inmobiliario, bienes raíces Paraguay, gestión de propiedades, software inmobiliario, agentes inmobiliarios, Paraguay',
  openGraph: {
    title: 'PropTech Paraguay - Plataforma de Bienes Raíces y CRM Inmobiliario',
    description: 'La plataforma líder en Paraguay para agentes y agencias inmobiliarias.',
    url: 'https://proptech.com.py',
    siteName: 'PropTech Paraguay',
  },
  twitter: {
    title: 'PropTech Paraguay - Plataforma de Bienes Raíces y CRM Inmobiliario',
    description: 'La plataforma líder en Paraguay para agentes y agencias inmobiliarias.',
  },
  alternates: {
    canonical: 'https://proptech.com.py',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PublicHome() {
  return (
    <div className="min-h-screen">
      <PropertiesSection />
      <div className="px-4 pb-10 sm:px-6 lg:px-8">
        <DiscoverProptechBanner />
      </div>
      <SimpleContactSection />
    </div>
  );
}


