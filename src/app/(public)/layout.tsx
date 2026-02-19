"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import Header from '@/components/public/layout/Header';
import Footer from '@/components/public/layout/Footer';
import SkipToContent from '@/components/public/common/SkipToContent';
import ErrorBoundary from '@/components/public/common/ErrorBoundary';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PropTech Paraguay',
  alternateName: ['PropTech CRM', 'PropTech Py'],
  url: 'https://proptech.com.py',
  logo: {
    '@type': 'ImageObject',
    url: 'https://proptech.com.py/images/logo/ProptechSocial.png',
    width: 512,
    height: 512,
  },
  sameAs: [
    'https://www.facebook.com/proptechpy',
    'https://www.instagram.com/proptechpy',
    'https://www.linkedin.com/company/proptech-py'
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+595-000-000000',
      contactType: 'sales',
      areaServed: {
        '@type': 'Country',
        name: 'Paraguay',
      },
      availableLanguage: ['es', 'en']
    }
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'PY',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PropTech Paraguay',
  url: 'https://proptech.com.py',
  description: 'Plataforma líder en Paraguay para agentes y agencias inmobiliarias. Gestiona propiedades, clientes y ventas de forma eficiente.',
  publisher: {
    '@type': 'Organization',
    name: 'PropTech Paraguay',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://proptech.com.py/propiedades?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string'
  },
  inLanguage: 'es-PY',
};

export default function PublicLayout({ children }: any) {
  const pathname = usePathname();
  const isPropertiesPage = pathname?.startsWith('/propiedades');
  const isHomePage = pathname === '/';
  const isAsesoresPage = pathname === '/asesores' || pathname?.startsWith('/asesores');
  const isProfesionalesPage = pathname === '/profesionales' || pathname?.startsWith('/profesionales');
  const isContactPage = pathname === '/contact' || pathname === '/contact/';
  const isRegisterPage = pathname === '/register' || pathname === '/register/';
  const isRegistrarsePage = pathname === '/registrarse' || pathname === '/registrarse/';
  const isProptechPage = pathname === '/proptech' || pathname === '/proptech/';
  const isAgentePage = pathname?.startsWith('/agente/');
  const isTerminosPage = pathname === '/terminos' || pathname === '/terminos/';
  const isPrivacidadPage = pathname === '/privacidad' || pathname === '/privacidad/';
  const isAyudaPage = pathname === '/ayuda' || pathname === '/ayuda/';
  const isSeguridadPage = pathname === '/seguridad' || pathname === '/seguridad/';
  const isInstructivosPage = pathname === '/instructivos' || pathname?.startsWith('/instructivos');
  const isAgendarPage = pathname?.startsWith('/agendar');
  const hasHeroSection = isHomePage || isPropertiesPage || isAsesoresPage || isProfesionalesPage || isContactPage || isRegisterPage || isRegistrarsePage || isProptechPage || isAgentePage || isTerminosPage || isPrivacidadPage || isAyudaPage || isSeguridadPage || isInstructivosPage || isAgendarPage;

  return (
    <>
      <Script
        id="proptech-organization-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >{JSON.stringify(organizationSchema)}</Script>
      <Script
        id="proptech-website-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >{JSON.stringify(websiteSchema)}</Script>
      <SkipToContent />
      <Header />
      <ErrorBoundary>
      <main 
        id="main-content"
        className={`min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 antialiased ${
            hasHeroSection ? '' : 'pt-14 sm:pt-16 px-3 sm:px-4'
        }`}
        role="main"
        aria-label="Contenido principal"
      >
          <div className={`${hasHeroSection ? 'w-full' : 'max-w-7xl mx-auto w-full'} selection:bg-brand-200 selection:text-brand-900 dark:selection:bg-brand-400/30 dark:selection:text-white`}>
            <div className={hasHeroSection ? '' : 'space-y-10 sm:space-y-14 lg:space-y-20'}>
            {children}
          </div>
        </div>
      </main>
      </ErrorBoundary>
      <Footer />
    </>
  );
}


