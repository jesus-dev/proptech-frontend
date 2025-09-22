# Configuración del Entorno - Frontend

## Variables de Entorno

Para configurar el frontend correctamente, crea un archivo `.env.local` en el directorio `frontend/` con las siguientes variables:

### Desarrollo Local
```bash
# URLs del backend local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_UPLOADS_URL=http://localhost:8080
NEXT_PUBLIC_IMAGE_BASE_URL=http://localhost:8080
```

### Producción
```bash
# URLs del backend en producción
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_UPLOADS_URL=https://api.tudominio.com
NEXT_PUBLIC_IMAGE_BASE_URL=https://api.tudominio.com
```

## Explicación de las Variables

- **NEXT_PUBLIC_API_URL**: URL base para las llamadas a la API del backend
- **NEXT_PUBLIC_UPLOADS_URL**: URL base para subir archivos al backend
- **NEXT_PUBLIC_IMAGE_BASE_URL**: URL base para servir imágenes desde el backend

## Configuración Automática

El sistema detecta automáticamente el entorno:
- **Desarrollo**: Usa `localhost:8080` por defecto
- **Producción**: Usa las variables de entorno configuradas

## Notas Importantes

1. **Las imágenes se sirven directamente desde el backend** para evitar problemas de CORS y proxy
2. **En producción**, asegúrate de que el backend tenga CORS configurado correctamente
3. **Las variables deben empezar con `NEXT_PUBLIC_`** para ser accesibles en el cliente
4. **Reinicia el frontend** después de cambiar las variables de entorno

## Ejemplo de Uso

```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local

# Editar las variables según tu entorno
nano .env.local

# Reiniciar el frontend
npm run dev
```
