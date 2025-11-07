import { MetadataRoute } from 'next';

const baseUrl = 'https://proptech.com.py';

const staticRoutes = [
  '/',
  '/proptech',
  '/propiedades',
  '/proyectos',
  '/asesores',
  '/recomendaciones',
  '/contact',
  '/register'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route === '/' ? '' : route}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: route === '/' ? 1 : 0.7
  }));
}

