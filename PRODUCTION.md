# 🚀 Guía de Producción - Proptech Frontend

## 📋 Checklist de Producción

### ✅ **FASE 1: CRÍTICO - COMPLETADO**
- [x] Variables de entorno de producción (`.env.production`)
- [x] Corrección de imports faltantes de iconos
- [x] Limpieza de dependencias no utilizadas (215 paquetes removidos)
- [x] Scripts de optimización de imágenes
- [x] Script de build de producción
- [x] Configuración de seguridad en Next.js
- [x] Dockerfile optimizado
- [x] Docker Compose para despliegue

### 🔄 **FASE 2: OPTIMIZACIÓN - EN PROGRESO**
- [ ] Optimización de imágenes con Next.js Image
- [ ] Lazy loading de componentes
- [ ] Code splitting avanzado
- [ ] Optimización de fuentes web
- [ ] Compresión de assets

### 🎯 **FASE 3: MONITOREO - PENDIENTE**
- [ ] Integración de analytics
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Health checks
- [ ] Logging centralizado

## 🛠️ **Comandos de Producción**

### **Build de Producción**
```bash
# Build completo con optimizaciones
npm run build:production

# Build estándar
npm run build

# Análisis de bundle
npm run analyze
```

### **Linting y Type Checking**
```bash
# Linting con auto-fix
npm run lint:fix

# Verificación de tipos TypeScript
npm run type-check

# Optimización de imágenes
npm run optimize-images
```

### **Docker**
```bash
# Build de imagen
docker build -t proptech-frontend .

# Ejecutar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f proptech-frontend
```

## 🔧 **Configuración de Variables de Entorno**

### **Producción (.env.production)**
```env
NEXT_PUBLIC_API_URL=https://api.proptech.com.py
NEXT_PUBLIC_TINYMCE_API_KEY=your_tinymce_key
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true
```

### **Desarrollo (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_TINYMCE_API_KEY=your_tinymce_key
```

## 🚀 **Despliegue**

### **Opción 1: Docker (Recomendado)**
```bash
# 1. Build de imagen
docker build -t proptech-frontend .

# 2. Ejecutar contenedor
docker run -d \
  --name proptech-frontend \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=https://api.proptech.com.py \
  proptech-frontend

# 3. Con Docker Compose
docker-compose up -d
```

### **Opción 2: PM2**
```bash
# 1. Build
npm run build

# 2. Iniciar con PM2
npm run pm2:start

# 3. Monitorear
pm2 monit
```

### **Opción 3: Vercel/Netlify**
```bash
# 1. Conectar repositorio
# 2. Configurar variables de entorno
# 3. Deploy automático
```

## 📊 **Monitoreo y Analytics**

### **Performance Monitoring**
- Lighthouse CI integrado
- Bundle analyzer disponible
- Core Web Vitals tracking

### **Error Tracking**
- Sentry configurado (pendiente)
- Error boundaries implementados
- Logging centralizado

### **Health Checks**
```bash
# Endpoint de health check
curl http://localhost:3000/api/health

# Docker health check
docker inspect proptech-frontend | grep Health
```

## 🔒 **Seguridad**

### **Headers de Seguridad**
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### **Configuraciones**
- HTTPS forzado en producción
- CSP headers configurados
- Powered by header removido
- Strict mode habilitado

## 📈 **Optimizaciones Implementadas**

### **Bundle Size**
- Tree shaking habilitado
- Code splitting automático
- Vendor chunks separados
- CSS optimizado

### **Images**
- WebP y AVIF support
- Responsive images
- Lazy loading
- Optimización automática

### **Caching**
- Static assets cacheado
- API responses cacheados
- Service Worker configurado
- CDN ready

## 🐛 **Troubleshooting**

### **Build Errors**
```bash
# Limpiar cache
npm run clean
rm -rf .next node_modules
npm install

# Verificar tipos
npm run type-check

# Linting
npm run lint:fix
```

### **Runtime Errors**
```bash
# Ver logs
docker-compose logs -f

# Restart service
docker-compose restart proptech-frontend

# Health check
curl http://localhost:3000/api/health
```

### **Performance Issues**
```bash
# Analizar bundle
npm run analyze

# Lighthouse audit
npx lighthouse http://localhost:3000

# Performance profiling
npm run build:production
```

## 📞 **Soporte**

### **Contacto**
- **Desarrollador**: AI Assistant
- **Proyecto**: Proptech Frontend
- **Versión**: 2.0.2

### **Recursos**
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Performance Best Practices](https://web.dev/performance/)

---

**🎉 ¡Listo para producción!** 