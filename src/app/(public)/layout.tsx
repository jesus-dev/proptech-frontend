"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import Header from '@/components/public/layout/Header';
import Footer from '@/components/public/layout/Footer';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PropTech Paraguay',
  alternateName: ['PropTech CRM', 'PropTech Py'],
  url: 'https://proptech.com.py',
  logo: 'https://proptech.com.py/images/logo/ProptechSocial.png',
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
      areaServed: 'PY',
      availableLanguage: ['es', 'en']
    }
  ]
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PropTech Paraguay',
  url: 'https://proptech.com.py',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://proptech.com.py/propiedades?search={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
};

export default function PublicLayout({ children }: any) {
  const pathname = usePathname();
  const isPropertiesPage = pathname?.startsWith('/propiedades');

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


