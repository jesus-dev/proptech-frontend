## [1.0.1] - 2025-07-30

### 🐛 Correcciones
- 

# Backend Changelog

Todos los cambios notables en el backend de ON PropTech serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere al [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-19

### 🚀 Lanzamiento inicial del backend

#### ✨ Características principales
- API REST con Spring Boot 3
- Autenticación JWT
- Gestión de usuarios y roles
- CRUD de propiedades
- Gestión de agentes y agencias
- Sistema de contratos
- Notificaciones push
- Integración con servicios externos

#### 🏗️ Arquitectura
- **Framework**: Spring Boot 3
- **Java**: 17
- **Database**: PostgreSQL
- **Cache**: Redis
- **Search**: Elasticsearch
- **Security**: Spring Security + JWT
- **Documentation**: OpenAPI 3 (Swagger)

#### 🔐 Seguridad
- JWT authentication
- Role-based access control (RBAC)
- API rate limiting
- CORS configuration
- Input validation
- SQL injection protection
- XSS protection

#### 📊 API Endpoints
- **Auth**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Properties**: `/api/properties/*`
- **Agents**: `/api/agents/*`
- **Agencies**: `/api/agencies/*`
- **Contracts**: `/api/contracts/*`
- **Payments**: `/api/payments/*`

#### 🔧 Configuración
- **Profiles**: dev, test, prod
- **Logging**: Logback con ELK stack
- **Monitoring**: Actuator + Micrometer
- **Health Checks**: Database, Redis, External APIs

---

## Tipos de cambios

- **🚀 Cambios importantes**: Cambios que rompen la compatibilidad hacia atrás
- **✨ Nuevas características**: Nuevas funcionalidades agregadas
- **🐛 Correcciones**: Correcciones de bugs
- **📚 Documentación**: Cambios en la documentación
- **⚡ Rendimiento**: Mejoras de rendimiento
- **🔧 Mantenimiento**: Cambios de mantenimiento y refactoring
- **🔐 Seguridad**: Mejoras de seguridad 