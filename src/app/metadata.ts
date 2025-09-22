import { Metadata } from "next";

// Metadata por defecto para el sitio
export const metadata: Metadata = {
  title: {
    default: "ON PropTech - Inmobiliaria Digital | Propiedades en Paraguay",
    template: "%s | ON PropTech"
  },
  description: "Encuentra las mejores propiedades en Paraguay. Casas, departamentos, terrenos y locales comerciales. Inmobiliaria digital con tecnología avanzada.",
  keywords: ["inmobiliaria", "propiedades", "casas", "departamentos", "Paraguay", "venta", "alquiler", "terrenos"],
  authors: [{ name: "ON PropTech" }],
  creator: "ON PropTech",
  publisher: "ON PropTech",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://onproptech.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_PY',
    url: 'https://onproptech.com',
    title: 'ON PropTech - Inmobiliaria Digital | Propiedades en Paraguay',
    description: 'Encuentra las mejores propiedades en Paraguay. Casas, departamentos, terrenos y locales comerciales.',
    siteName: 'ON PropTech',
    images: [
      {
        url: '/images/logo/on-logo.png',
        width: 1200,
        height: 630,
        alt: 'ON PropTech - Inmobiliaria Digital',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ON PropTech - Inmobiliaria Digital | Propiedades en Paraguay',
    description: 'Encuentra las mejores propiedades en Paraguay. Casas, departamentos, terrenos y locales comerciales.',
    images: ['/images/logo/on-logo.png'],
    creator: '@onproptech',
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
    google: 'tu-codigo-de-verificacion',
    // yandex: 'tu-codigo-de-verificacion',
    // yahoo: 'tu-codigo-de-verificacion',
  },
}; 