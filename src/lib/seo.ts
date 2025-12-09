/**
 * Utilidades para SEO y Structured Data
 */

export interface PropertyStructuredData {
  id: number;
  title: string;
  description?: string;
  price: number;
  currencyCode?: string;
  address?: string;
  cityName?: string;
  stateName?: string;
  countryName?: string;
  zipCode?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  propertyType?: string;
  operacion?: 'SALE' | 'RENT';
  featuredImage?: string;
  slug?: string;
  agent?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

/**
 * Genera structured data para una propiedad individual
 */
export function generatePropertyStructuredData(property: PropertyStructuredData) {
  const baseUrl = 'https://proptech.com.py';
  const propertyUrl = property.slug 
    ? `${baseUrl}/propiedad/${property.slug}`
    : `${baseUrl}/propiedades/${property.id}`;

  const addressParts = [];
  if (property.address) addressParts.push(property.address);
  if (property.cityName) addressParts.push(property.cityName);
  if (property.stateName) addressParts.push(property.stateName);
  if (property.zipCode) addressParts.push(property.zipCode);
  if (property.countryName) addressParts.push(property.countryName);

  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: property.title,
    description: property.description || `${property.title} en ${property.cityName || 'Paraguay'}`,
    url: propertyUrl,
    image: property.featuredImage 
      ? (property.featuredImage.startsWith('http') 
          ? property.featuredImage 
          : `${baseUrl}${property.featuredImage}`)
      : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.cityName,
      addressRegion: property.stateName,
      postalCode: property.zipCode,
      addressCountry: property.countryName || 'PY',
    },
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.currencyCode || 'PYG',
      availability: 'https://schema.org/InStock',
      url: propertyUrl,
    },
  };

  // Agregar número de habitaciones y baños si están disponibles
  if (property.bedrooms || property.bathrooms || property.area) {
    structuredData.numberOfRooms = property.bedrooms;
    structuredData.numberOfBathroomsTotal = property.bathrooms;
    if (property.area) {
      structuredData.floorSize = {
        '@type': 'QuantitativeValue',
        value: property.area,
        unitCode: 'MTK', // metros cuadrados
      };
    }
  }

  // Agregar tipo de propiedad
  if (property.propertyType) {
    structuredData.category = property.propertyType;
  }

  // Agregar información del agente si está disponible
  if (property.agent?.name) {
    structuredData.agent = {
      '@type': 'RealEstateAgent',
      name: property.agent.name,
      email: property.agent.email,
      telephone: property.agent.phone,
    };
  }

  return structuredData;
}

/**
 * Genera structured data para una lista de propiedades
 */
export function generatePropertyListStructuredData(properties: PropertyStructuredData[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: properties.map((property, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: generatePropertyStructuredData(property),
    })),
  };
}

/**
 * Genera breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Genera FAQ structured data
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

