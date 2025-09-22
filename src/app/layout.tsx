'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import FooterCRM from "@/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import MobileOptimizer from "@/components/mobile/MobileOptimizer";
import { usePathname } from "next/navigation";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true
});

// Schema.org para la organización principal
const mainOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ON PropTech",
  "alternateName": "ON Inmobiliaria",
  "description": "Inmobiliaria digital líder en Paraguay con tecnología avanzada para la gestión y comercialización de propiedades",
  "url": "https://onproptech.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://onproptech.com/images/logo/on-logo.png",
    "width": 200,
    "height": 60
  },
  "image": "https://onproptech.com/images/logo/on-logo.png",
  "foundingDate": "2024",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "PY",
    "addressRegion": "Central",
    "addressLocality": "Asunción"
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Spanish",
      "telephone": "+595-21-123-456"
    },
    {
      "@type": "ContactPoint",
      "contactType": "sales",
      "availableLanguage": "Spanish",
      "telephone": "+595-21-123-457"
    }
  ],
  "sameAs": [
    "https://facebook.com/onproptech",
    "https://instagram.com/onproptech",
    "https://linkedin.com/company/onproptech"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Catálogo de Propiedades",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Venta de Propiedades",
          "description": "Propiedades en venta en Paraguay"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Alquiler de Propiedades",
          "description": "Propiedades en alquiler en Paraguay"
        }
      }
    ]
  }
};

// Schema.org para el sitio web
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "ON PropTech",
  "url": "https://onproptech.com",
  "description": "Portal inmobiliario digital líder en Paraguay",
  "publisher": {
    "@type": "Organization",
    "name": "ON PropTech"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://onproptech.com/public/propiedades?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

// Schema.org para el negocio local
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "ON PropTech",
  "description": "Inmobiliaria digital especializada en propiedades residenciales y comerciales en Paraguay",
  "url": "https://onproptech.com",
  "telephone": "+595-21-123-456",
  "email": "info@onproptech.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Av. España 1234",
    "addressLocality": "Asunción",
    "addressRegion": "Central",
    "postalCode": "1121",
    "addressCountry": "PY"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -25.2637,
    "longitude": -57.5759
  },
  "openingHours": "Mo-Fr 08:00-18:00, Sa 09:00-14:00",
  "priceRange": "$$",
  "areaServed": {
    "@type": "Country",
    "name": "Paraguay"
  },
  "serviceArea": {
    "@type": "Country",
    "name": "Paraguay"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Servicios Inmobiliarios",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Venta de Propiedades",
          "description": "Asesoramiento y gestión de venta de propiedades en Paraguay"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Alquiler de Propiedades",
          "description": "Gestión de alquileres residenciales y comerciales en Paraguay"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Tasación de Propiedades",
          "description": "Valoración profesional de propiedades en Paraguay"
        }
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isPublic = pathname?.startsWith("/public");

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ON PropTech" />
        <link rel="apple-touch-icon" href="/images/logo/logo-icon-192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/images/logo/logo-icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/logo/logo-icon-180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/images/logo/logo-icon-167.png" />
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(mainOrganizationSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema)
          }}
        />
      </head>
      <body className={inter.className}>
        {isPublic ? (
          <MobileOptimizer>
            <Providers>
              {children}
              <div id="modal-root" />
              <Toaster />
            </Providers>
          </MobileOptimizer>
        ) : (
          <AuthProvider>
            <MobileOptimizer>
              <Providers>
                {children}
                <div id="modal-root" />
                <Toaster />
              </Providers>
            </MobileOptimizer>
          </AuthProvider>
        )}
      </body>
    </html>
  );
}
