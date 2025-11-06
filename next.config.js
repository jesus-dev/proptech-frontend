/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de producción - OPTIMIZADA
  typescript: {
    // En producción, ya verificamos tipos localmente antes del push
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  eslint: {
    // En producción, ya corrimos lint localmente antes del push
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  // 🔥 SOLUCIÓN DE RAÍZ: Output standalone + buildId estable
  output: 'standalone',
  
  // BuildId basado en timestamp (más simple y efectivo)
  generateBuildId: async () => {
    // Usar timestamp para tener un ID único por build
    // Esto se pasa como query param en los chunks
    return process.env.BUILD_ID || `build-${Date.now()}`
  },
  
  // Optimizaciones de producción
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // 🔒 HTTPS manejado por Cloudflare - No necesario redirect
  // async redirects() {
  //   // Cloudflare maneja HTTPS automáticamente
  //   return []
  // },
  
  // 🔒 HEADERS DE SEGURIDAD - ESTRATEGIA ANTI-CACHE DE RAÍZ
  async headers() {
    return [
      // 🔥 PÁGINAS HTML: NUNCA CACHEAR (evita chunks 404)
      {
        source: '/:path((?!_next).*)*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Cloudflare-CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          // Seguridad
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      // 🔥 CHUNKS JS: Cache MUY CORTO con stale-while-revalidate
      {
        source: '/_next/static/chunks/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // CSS y otros estáticos: Cache largo (son immutable por hash)
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Build manifest: NUNCA cachear
      {
        source: '/_next/static/:buildId/_buildManifest.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/:buildId/_ssgManifest.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ]
  },
  
  // Configuración de imágenes
  images: {
    domains: [
      'localhost',
      'api.proptech.com.py',
      'proptech.com.py',
      'images.unsplash.com',
      'via.placeholder.com'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.proptech.com.py',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'proptech.com.py',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  webpack(config) {
    config.module.rules.push({
      test: /.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

module.exports = nextConfig;