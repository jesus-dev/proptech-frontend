import type { Metadata } from 'next';
import React from 'react';
import PropertiesSection from '@/components/public/sections/PropertiesSection';
import StatsSection from '@/components/public/sections/StatsSection';
import FeaturesSection from '@/components/public/sections/FeaturesSection';

export const metadata: Metadata = {
  metadataBase: new URL('https://proptech.com.py'),
  title: 'PropTech Paraguay - Plataforma de Bienes Raíces y CRM Inmobiliario',
  description: 'La plataforma líder en Paraguay para agentes y agencias inmobiliarias. Gestiona propiedades, clientes y ventas de forma eficiente con nuestro CRM. Encuentra tu propiedad ideal o gestiona tu negocio inmobiliario.',
  keywords: 'proptech, crm inmobiliario, bienes raíces Paraguay, gestión de propiedades, software inmobiliario, agentes inmobiliarios, Paraguay, propiedades en venta, propiedades en alquiler, casas, departamentos, terrenos',
  openGraph: {
    title: 'PropTech Paraguay - Plataforma de Bienes Raíces y CRM Inmobiliario',
    description: 'La plataforma líder en Paraguay para agentes y agencias inmobiliarias. Encuentra tu propiedad ideal o gestiona tu negocio inmobiliario.',
    url: 'https://proptech.com.py',
    siteName: 'PropTech Paraguay',
    images: [
      {
        url: 'https://proptech.com.py/images/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'PropTech Paraguay - Plataforma de Bienes Raíces',
      },
    ],
  },
  twitter: {
    title: 'PropTech Paraguay - Plataforma de Bienes Raíces y CRM Inmobiliario',
    description: 'La plataforma líder en Paraguay para agentes y agencias inmobiliarias.',
    card: 'summary_large_image',
  },
  alternates: {
    canonical: 'https://proptech.com.py',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function PublicHome() {
  // Structured Data para SEO
  const homepageStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'PropTech Paraguay - Inicio',
    description: 'Plataforma líder en Paraguay para gestión inmobiliaria y búsqueda de propiedades',
    url: 'https://proptech.com.py',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Búsqueda de Propiedades',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Gestión de Propiedades',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'CRM Inmobiliario',
        },
      ],
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageStructuredData) }}
      />
      
    <div className="min-h-screen">
        {/* Sección Principal de Propiedades (incluye Hero con búsqueda) */}
      <PropertiesSection />
        
        {/* Sección de Estadísticas del Mercado */}
        <StatsSection />
        
        {/* Sección de Características de la Plataforma */}
        <FeaturesSection />
      </div>
    </>
  );
}


