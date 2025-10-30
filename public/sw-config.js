// Configuración optimizada para Service Worker
const CACHE_NAME = 'proptech-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Archivos estáticos para cachear
const STATIC_FILES = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/images/logo/on-logo.png'
];

// Estrategias de cache
const CACHE_STRATEGIES = {
  // Cache First para archivos estáticos
  STATIC: 'cache-first',
  // Network First para datos dinámicos
  DYNAMIC: 'network-first',
  // Stale While Revalidate para recursos importantes
  IMPORTANT: 'stale-while-revalidate'
};

// Configuración de cache por tipo de archivo
const CACHE_CONFIG = {
  // Imágenes
  'image/': {
    strategy: CACHE_STRATEGIES.STATIC,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    maxEntries: 100
  },
  // CSS y JS
  'text/css': {
    strategy: CACHE_STRATEGIES.STATIC,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    maxEntries: 50
  },
  'application/javascript': {
    strategy: CACHE_STRATEGIES.STATIC,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    maxEntries: 50
  },
  // APIs - SIN CACHÉ para evitar datos viejos
  '/api/': {
    strategy: 'network-only', // Siempre desde red, nunca caché
    maxAge: 0,
    maxEntries: 0
  },
  // Páginas
  '.html': {
    strategy: CACHE_STRATEGIES.IMPORTANT,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    maxEntries: 30
  }
};

// Configuración de precaching
const PRECACHE_CONFIG = {
  // Rutas críticas para precachear
  criticalRoutes: [
    '/',
    '/login',
    '/dash',
    '/properties',
    '/partners'
  ],
  // Recursos críticos
  criticalAssets: [
    '/images/logo/on-logo.png',
    '/manifest.json'
  ]
};

// Configuración de notificaciones push
const PUSH_CONFIG = {
  title: 'ON PropTech',
  icon: '/images/logo/on-logo.png',
  badge: '/images/logo/on-logo.png',
  vibrate: [200, 100, 200]
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CACHE_NAME,
    STATIC_CACHE,
    DYNAMIC_CACHE,
    STATIC_FILES,
    CACHE_STRATEGIES,
    CACHE_CONFIG,
    PRECACHE_CONFIG,
    PUSH_CONFIG
  };
} 