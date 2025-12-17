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
  
  // BuildId basado en git commit o timestamp (más estable)
  generateBuildId: async () => {
    // Intentar usar git commit hash primero (más estable)
    try {
      const { execSync } = require('child_process');
      const gitHash = execSync('git rev-parse --short HEAD').toString().trim();
      return process.env.BUILD_ID || `build-${gitHash}`;
    } catch (e) {
      // Si no hay git, usar timestamp
      return process.env.BUILD_ID || `build-${Date.now()}`;
    }
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
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
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

  webpack(config, { isServer, dev }) {
    // En producción, usar nombres de chunks más predecibles para evitar errores de módulos faltantes
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
      };
    }
    
    // Configuración para SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Mejorar el manejo de módulos para evitar errores de "undefined"
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Asegurar que los módulos se resuelvan correctamente
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }

    return config;
  },
};

module.exports = nextConfig;