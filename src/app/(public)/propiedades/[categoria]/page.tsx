'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PropertiesSection from '@/components/public/sections/PropertiesSection';
import SearchHeroSection from '@/components/public/sections/SearchHeroSection';
import Head from 'next/head';

// Mapeo de categorías válidas
const CATEGORIAS_VALIDAS = {
  casa: {
    title: 'Casas en Venta y Alquiler en Paraguay',
    description: 'Encuentra las mejores casas en venta y alquiler en Paraguay. Amplias opciones de casas con jardín, garaje y más comodidades.',
    keywords: 'casas Paraguay, casas en venta, casas en alquiler, casas Asunción, comprar casa Paraguay',
    h1: 'Casas en Venta y Alquiler en Paraguay',
  },
  departamento: {
    title: 'Departamentos en Venta y Alquiler en Paraguay',
    description: 'Descubre los mejores departamentos en venta y alquiler en Paraguay. Departamentos modernos con amenities y excelente ubicación.',
    keywords: 'departamentos Paraguay, departamentos en venta, departamentos en alquiler, apartamentos Asunción',
    h1: 'Departamentos en Venta y Alquiler en Paraguay',
  },
  terreno: {
    title: 'Terrenos en Venta en Paraguay',
    description: 'Encuentra terrenos en venta en Paraguay. Lotes urbanos, terrenos para construcción y terrenos de inversión en las mejores zonas.',
    keywords: 'terrenos Paraguay, terrenos en venta, lotes Paraguay, terrenos Asunción, comprar terreno',
    h1: 'Terrenos en Venta en Paraguay',
  },
  comercial: {
    title: 'Locales Comerciales en Venta y Alquiler en Paraguay',
    description: 'Locales comerciales, oficinas y espacios para negocios en venta y alquiler en Paraguay. Ubicaciones estratégicas para tu negocio.',
    keywords: 'locales comerciales Paraguay, oficinas en alquiler, espacios comerciales, locales Asunción',
    h1: 'Locales Comerciales en Venta y Alquiler en Paraguay',
  },
  quinta: {
    title: 'Quintas y Chalets en Venta y Alquiler en Paraguay',
    description: 'Quintas y chalets en venta y alquiler en Paraguay. Propiedades con amplio terreno, piscina y espacios al aire libre.',
    keywords: 'quintas Paraguay, chalets en venta, quintas en alquiler, casas de campo Paraguay',
    h1: 'Quintas y Chalets en Venta y Alquiler en Paraguay',
  },
  edificio: {
    title: 'Edificios en Venta en Paraguay',
    description: 'Edificios completos en venta en Paraguay. Oportunidades de inversión en edificios residenciales y comerciales.',
    keywords: 'edificios Paraguay, edificios en venta, inversión inmobiliaria, edificios Asunción',
    h1: 'Edificios en Venta en Paraguay',
  },
};

export default function PropiedadesPorCategoria() {
  const params = useParams();
  const router = useRouter();
  const categoria = params?.categoria as string;

  // Validar categoría
  useEffect(() => {
    if (!CATEGORIAS_VALIDAS[categoria as keyof typeof CATEGORIAS_VALIDAS]) {
      router.push('/propiedades');
    }
  }, [categoria, router]);

  const categoriaInfo = CATEGORIAS_VALIDAS[categoria as keyof typeof CATEGORIAS_VALIDAS];

  if (!categoriaInfo) {
    return null;
  }

  // Structured Data (JSON-LD) para SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categoriaInfo.title,
    description: categoriaInfo.description,
    url: `https://proptech.com.py/propiedades/${categoria}`,
    publisher: {
      '@type': 'Organization',
      name: 'PropTech CRM',
      logo: {
        '@type': 'ImageObject',
        url: 'https://proptech.com.py/images/logo/proptech.png',
      },
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
        {
          '@type': 'ListItem',
          position: 3,
          name: categoriaInfo.h1,
          item: `https://proptech.com.py/propiedades/${categoria}`,
        },
      ],
    },
  };

  return (
    <>
      {/* Dynamic Meta Tags */}
      <Head>
        <title>{categoriaInfo.title} | PropTech CRM</title>
        <meta name="description" content={categoriaInfo.description} />
        <meta name="keywords" content={categoriaInfo.keywords} />
        <link rel="canonical" href={`https://proptech.com.py/propiedades/${categoria}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={categoriaInfo.title} />
        <meta property="og:description" content={categoriaInfo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://proptech.com.py/propiedades/${categoria}`} />
        <meta property="og:locale" content="es_PY" />
        <meta property="og:site_name" content="PropTech CRM" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={categoriaInfo.title} />
        <meta name="twitter:description" content={categoriaInfo.description} />
      </Head>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Main Content */}
      <main className="min-h-screen">
        <h1 className="sr-only">
          {categoriaInfo.h1}
        </h1>
        <SearchHeroSection />
        <PropertiesSection defaultCategory={categoria} />
      </main>
    </>
  );
}

