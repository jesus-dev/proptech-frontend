import type { Metadata } from 'next';

export const asesoresMetadata: Metadata = {
  title: 'Asesores Inmobiliarios en Paraguay | PropTech CRM',
  description: 'Encuentra los mejores asesores inmobiliarios certificados en Paraguay. Profesionales especializados en venta, alquiler y gestión de propiedades. Conecta con agentes inmobiliarios de confianza.',
  keywords: 'asesores inmobiliarios Paraguay, agentes inmobiliarios, corredores de propiedades, inmobiliaria Paraguay, asesores certificados, agentes de bienes raíces',
  openGraph: {
    title: 'Asesores Inmobiliarios en Paraguay | PropTech CRM',
    description: 'Encuentra los mejores asesores inmobiliarios certificados en Paraguay. Profesionales especializados en venta, alquiler y gestión de propiedades.',
    type: 'website',
    locale: 'es_PY',
    siteName: 'PropTech CRM',
    images: [
      {
        url: 'https://proptech.com.py/images/og-asesores.jpg',
        width: 1200,
        height: 630,
        alt: 'Asesores Inmobiliarios en Paraguay',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Asesores Inmobiliarios en Paraguay',
    description: 'Encuentra los mejores asesores inmobiliarios certificados en Paraguay.',
    images: ['https://proptech.com.py/images/og-asesores.jpg'],
  },
  alternates: {
    canonical: 'https://proptech.com.py/asesores',
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

