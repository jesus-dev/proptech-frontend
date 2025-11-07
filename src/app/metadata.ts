import { Metadata } from "next";

// Metadata por defecto para el sitio
export const metadata: Metadata = {
  title: {
    default: "PropTech — Plataforma Bienes Raíces en Paraguay",
    template: "%s | PropTech Paraguay"
  },
  description: "PropTech CRM ayuda a agencias y agentes inmobiliarios de Paraguay a gestionar propiedades, clientes y ventas con tecnología SaaS.",
  keywords: [
    "crm inmobiliario", "software inmobiliario", "propiedades paraguay", "proptech", "agencia inmobiliaria", "ventas inmobiliarias",
    "bienes raíces paraguay", "tecnología inmobiliaria", "gestion de propiedades",
    "crm para agentes", "crm para inmobiliarias paraguay", "plataforma inmobiliaria"
  ],
  authors: [{ name: "OnTech" }],
  creator: "OnTech",
  publisher: "OnTech",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://proptech.com.py'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_PY',
    url: 'https://proptech.com.py',
    title: 'PropTech — Plataforma Bienes Raíces en Paraguay',
    description: 'Plataforma Bienes Raíces para gestionar propiedades, clientes y ventas en Paraguay.',
    siteName: 'PropTech Paraguay',
    images: [
      {
        url: '/images/logo/ProptechSocial.png',
        width: 1200,
        height: 630,
        alt: 'PropTech Py — Plataforma Bienes Raíces',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PropTech Py — Plataforma Bienes Raíces',
    description: 'Gestiona propiedades, clientes y ventas con PropTech CRM.',
    images: ['/images/logo/ProptechSocial.png'],
    creator: '@proptechpy',
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
  verification: {
    google: 'verificacion-google-proptech',
    // yandex: 'tu-codigo-de-verificacion',
    // yahoo: 'tu-codigo-de-verificacion',
  },
}; 