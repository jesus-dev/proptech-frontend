/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de producción - SEGURA
  typescript: {
    ignoreBuildErrors: false, // ✅ Habilitar verificación de tipos
  },
  eslint: {
    ignoreDuringBuilds: false, // ✅ Habilitar verificación de ESLint
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
  
  // 🔒 HEADERS DE SEGURIDAD
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
        hostname: 'api.onproptech.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'onproptech.com',
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