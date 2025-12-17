# Guía de Llamadas API - Frontend

## ✅ Regla de Oro: SIEMPRE usar `apiClient` para llamadas autenticadas

### ¿Por qué `apiClient`?

1. **Manejo automático de autenticación**: Agrega el token JWT automáticamente
2. **Manejo automático de 401**: Redirige al login cuando el token expira
3. **Consistencia**: Todas las llamadas siguen el mismo patrón
4. **Interceptores**: Maneja errores de red, timeouts, y reintentos automáticamente

## 📋 Patrones de Uso

### ✅ CORRECTO: Usar `apiClient`

```typescript
import { apiClient } from '@/lib/api';

// GET request
const response = await apiClient.get('/api/cms/events');
const events = response.data;

// POST request
const response = await apiClient.post('/api/cms/events', {
  title: 'Evento',
  eventDate: '2024-01-01'
});
const newEvent = response.data;

// PUT request
const response = await apiClient.put(`/api/cms/events/${id}`, {
  title: 'Evento actualizado'
});

// DELETE request
await apiClient.delete(`/api/cms/events/${id}`);

// POST con FormData (upload de archivos)
const formData = new FormData();
formData.append('file', file);
formData.append('fileName', file.name);

const response = await apiClient.post('/api/cms/media/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

### ❌ INCORRECTO: Usar `fetch()` directamente

```typescript
// ❌ NO HACER ESTO
const token = localStorage.getItem('token');
const response = await fetch(getEndpoint('/api/cms/events'), {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

if (response.status === 401) {
  // Manejo manual de 401 - redundante
  localStorage.clear();
  window.location.href = '/login';
}
```

## 🔧 Manejo de Errores

### Patrón Recomendado

```typescript
try {
  const response = await apiClient.get('/api/cms/events');
  setEvents(response.data);
} catch (error: any) {
  console.error('Error loading events:', error);
  // 401 es manejado automáticamente por el interceptor de apiClient
  if (error?.response?.status !== 401) {
    toast.error('Error al cargar eventos');
  }
}
```

### ¿Por qué no verificar 401 manualmente?

El interceptor en `api.ts` ya maneja 401 automáticamente:
- Limpia `localStorage`
- Redirige a `/login`
- No necesitas hacerlo manualmente

## 📁 Estructura de Servicios

Para operaciones complejas o reutilizables, crear servicios:

```typescript
// services/webGalleryService.ts
import { apiClient } from '@/lib/api';

class WebGalleryService {
  async getMyGalleries(): Promise<Gallery[]> {
    const response = await apiClient.get<Gallery[]>('/api/cms/galleries/my-galleries');
    return response.data || [];
  }

  async createGallery(data: CreateGalleryData): Promise<Gallery> {
    const response = await apiClient.post<Gallery>('/api/cms/galleries', data);
    return response.data;
  }
}

export const webGalleryService = new WebGalleryService();
```

## 🎯 Casos Especiales

### Endpoints Públicos (sin autenticación)

Si necesitas hacer una llamada sin autenticación, puedes usar `fetch()` directamente:

```typescript
// Solo para endpoints públicos
const response = await fetch(getEndpoint('/api/public/properties'));
const data = await response.json();
```

O mejor aún, crear un cliente separado sin interceptores.

### URLs de Imágenes

Para construir URLs de imágenes, usar `getEndpoint`:

```typescript
import { getEndpoint } from '@/lib/api-config';

const getImageUrl = (url: string) => {
  if (!url) return '/images/placeholder.jpg';
  if (url.startsWith('http')) return url;
  return getEndpoint(url);
};
```

## 📝 Checklist para Nuevas Funcionalidades

- [ ] ¿Usa `apiClient` en lugar de `fetch()`?
- [ ] ¿Maneja errores correctamente (excepto 401)?
- [ ] ¿Usa TypeScript types para las respuestas?
- [ ] ¿Está en un servicio si es reutilizable?

## 🔍 Archivos que Necesitan Actualización

Si encuentras archivos usando `fetch()` directamente, actualízalos:

```bash
# Buscar archivos con fetch
grep -r "await fetch(getEndpoint" frontend/src/app/(proptech)/cms
```

## 📚 Referencias

- `frontend/src/lib/api.ts` - Configuración de `apiClient` e interceptores
- `frontend/src/lib/api-config.ts` - Helper para construir URLs
- `frontend/src/services/` - Ejemplos de servicios
