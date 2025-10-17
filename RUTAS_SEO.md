# Rutas SEO Optimizadas - PropTech CRM

## URLs Amigables para Propiedades

### Estructura de URLs

Las URLs están optimizadas para SEO siguiendo el patrón:
```
/propiedades/[categoria]
```

### Categorías Disponibles

| URL | Título SEO | Descripción |
|-----|-----------|-------------|
| `/propiedades/casa` | Casas en Venta y Alquiler en Paraguay | Casas con jardín, garaje y comodidades |
| `/propiedades/departamento` | Departamentos en Venta y Alquiler en Paraguay | Departamentos modernos con amenities |
| `/propiedades/terreno` | Terrenos en Venta en Paraguay | Lotes urbanos y terrenos de inversión |
| `/propiedades/comercial` | Locales Comerciales en Venta y Alquiler | Oficinas y espacios comerciales |
| `/propiedades/quinta` | Quintas y Chalets en Venta y Alquiler | Propiedades con amplio terreno |
| `/propiedades/edificio` | Edificios en Venta en Paraguay | Edificios completos para inversión |

### Características SEO

#### 1. **Meta Tags Dinámicos**
- Título único por categoría
- Descripción optimizada con palabras clave
- Keywords específicos por tipo de propiedad
- Canonical URLs para evitar contenido duplicado

#### 2. **Open Graph (Redes Sociales)**
- Títulos y descripciones personalizados
- Imágenes optimizadas (1200x630px)
- Locale: es_PY (Paraguay)

#### 3. **Structured Data (JSON-LD)**
- Schema.org CollectionPage
- Breadcrumbs estructurados
- Información de organización

#### 4. **Accesibilidad**
- H1 semántico por categoría
- Etiquetas ARIA
- Navegación estructurada

### Ejemplos de Uso

```typescript
// Enlace a casas
<Link href="/propiedades/casa">Ver Casas</Link>

// Enlace a departamentos
<Link href="/propiedades/departamento">Ver Departamentos</Link>

// Enlace a terrenos
<Link href="/propiedades/terreno">Ver Terrenos</Link>
```

### Redirecciones

Si se accede a una categoría inválida, se redirige automáticamente a `/propiedades`.

### Beneficios SEO

✅ URLs descriptivas y legibles
✅ Mejor indexación en Google
✅ Rich snippets en resultados de búsqueda
✅ Breadcrumbs visibles en Google
✅ Mejor CTR en resultados de búsqueda
✅ Optimizado para búsquedas locales (Paraguay)
✅ Compatible con Google Search Console

### Palabras Clave por Categoría

#### Casa
- casas Paraguay
- casas en venta
- casas en alquiler
- casas Asunción
- comprar casa Paraguay

#### Departamento
- departamentos Paraguay
- departamentos en venta
- departamentos en alquiler
- apartamentos Asunción

#### Terreno
- terrenos Paraguay
- terrenos en venta
- lotes Paraguay
- terrenos Asunción
- comprar terreno

#### Comercial
- locales comerciales Paraguay
- oficinas en alquiler
- espacios comerciales
- locales Asunción

#### Quinta
- quintas Paraguay
- chalets en venta
- quintas en alquiler
- casas de campo Paraguay

#### Edificio
- edificios Paraguay
- edificios en venta
- inversión inmobiliaria
- edificios Asunción

### Próximas Mejoras

- [ ] Agregar parámetros de ciudad: `/propiedades/casa/asuncion`
- [ ] Agregar filtros en URL: `/propiedades/casa?precio=100000-200000`
- [ ] Sitemap XML automático
- [ ] Paginación SEO-friendly
- [ ] AMP pages para móviles

