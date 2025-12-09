import React from 'react';
import { Metadata } from 'next';
import SearchHeroSection from '@/components/public/sections/SearchHeroSection';
import PropertiesSection from '@/components/public/sections/PropertiesSection';

// Metadata para SEO
export const metadata: Metadata = {
  title: 'Propiedades en Venta y Alquiler en Paraguay | PropTech CRM',
  description: 'Encuentra las mejores propiedades en venta y alquiler en Paraguay. Casas, departamentos, terrenos y locales comerciales. Busca tu propiedad ideal con PropTech CRM.',
  keywords: 'propiedades Paraguay, casas en venta, departamentos en alquiler, terrenos, bienes raíces Paraguay, inmobiliaria Paraguay, propiedades Asunción',
  openGraph: {
    title: 'Propiedades en Venta y Alquiler en Paraguay | PropTech CRM',
    description: 'Encuentra las mejores propiedades en venta y alquiler en Paraguay. Casas, departamentos, terrenos y locales comerciales.',
    type: 'website',
    locale: 'es_PY',
    siteName: 'PropTech CRM',
    images: [
      {
        url: '/images/og-propiedades.jpg',
        width: 1200,
        height: 630,
        alt: 'Propiedades en Paraguay',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Propiedades en Venta y Alquiler en Paraguay',
    description: 'Encuentra tu propiedad ideal en Paraguay. Casas, departamentos, terrenos y más.',
    images: ['/images/og-propiedades.jpg'],
  },
  alternates: {
    canonical: 'https://proptech.com.py/propiedades',
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

export default function PublicPropiedades() {
  // Structured Data (JSON-LD) mejorado para SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'PropTech CRM - Propiedades en Paraguay',
    description: 'Encuentra las mejores propiedades en venta y alquiler en Paraguay. Casas, departamentos, terrenos y locales comerciales.',
    url: 'https://proptech.com.py/propiedades',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PY',
      addressRegion: 'Paraguay',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Paraguay',
    },
    serviceType: ['Real Estate Sales', 'Property Rental', 'Property Management'],
    publisher: {
      '@type': 'Organization',
      name: 'PropTech CRM',
      logo: {
        '@type': 'ImageObject',
        url: 'https://proptech.com.py/images/logo/proptech.png',
      },
      sameAs: [
        'https://proptech.com.py',
      ],
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: 'https://proptech.com.py',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Propiedades',
          item: 'https://proptech.com.py/propiedades',
        },
      ],
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://proptech.com.py/propiedades?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Main Content */}
      <main className="min-h-screen">
        <h1 className="sr-only">
          Propiedades en Venta y Alquiler en Paraguay - Casas, Departamentos, Terrenos
        </h1>
        <PropertiesSection />
      </main>
    </>
  );
}


