/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de TypeScript y ESLint
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  
  // Forzar HTTPS en producción
  async redirects() {
    return [
      {
        source: '/(.*)',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://onproptech.com/$1',
        permanent: true,
      },
    ]
  },
  
  // Configuración de imágenes - Deshabilitada para evitar errores 400
  images: {
    unoptimized: true,
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

module.exports = nextConfig;