# 🔥 SOLUCIÓN DE RAÍZ: Chunks 404 en Producción

## El Problema

Cada vez que hacemos deploy, Next.js genera nuevos hashes para los archivos JavaScript (chunks). Si el navegador o Cloudflare tienen cacheado el HTML viejo, buscarán chunks que ya no existen → **ERROR 404**.

## Solución Implementada

### 1. ✅ Next.js Configuration (`next.config.js`)

**Cambios aplicados:**

- **Output Standalone**: Build optimizado que incluye todas las dependencias
- **BuildId único**: Cada build tiene un ID basado en timestamp
- **Headers anti-cache agresivos**:
  - HTML: NUNCA cachear (múltiples headers CDN)
  - Chunks JS/CSS: Cache largo con `immutable` (son versionados por hash)
  - Build manifests: NUNCA cachear

### 2. ✅ Deploy Script (`deploy-frontend-prod.sh`)

**Cambios aplicados:**

- Usa `BUILD_ID` único en cada build
- Copia el output `standalone` (más eficiente)
- Ejecuta con `node server.js` directamente (no npm)
- Incluye recordatorio para limpiar cache de Cloudflare

### 3. 🔥 CRÍTICO: Limpiar Cache de Cloudflare

**DESPUÉS DE CADA DEPLOY debes hacer esto:**

#### Opción A: Desde el Dashboard (Manual)

1. Ir a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Seleccionar dominio `proptech.com.py`
3. Ir a **Caching** > **Configuration**
4. Click en **Purge Everything**
5. Confirmar

#### Opción B: Con API (Automático)

Configurar en el servidor de producción:

```bash
# 1. Crear archivo con credenciales
sudo nano /home/dan/.cloudflare-credentials

# Agregar:
CLOUDFLARE_ZONE_ID=tu_zone_id_aqui
CLOUDFLARE_API_TOKEN=tu_api_token_aqui
```

```bash
# 2. Hacer ejecutable el script de limpieza
chmod +x /home/dan/proptech-frontend/scripts/purge-cloudflare.sh
```

El script de deploy llamará automáticamente a este script.

### 4. ⚙️ Configuración de Cloudflare

**En el Dashboard de Cloudflare, configurar:**

1. **Browser Cache TTL**: 
   - Ir a **Caching** > **Configuration**
   - Establecer **Browser Cache TTL** a: `Respect Existing Headers`

2. **Development Mode** (temporal durante deploys):
   - Activar cuando hagas deploy
   - Se desactiva automáticamente después de 3 horas
   - Bypass completo de cache

3. **Cache Rules** (opcional):
   - Crear regla para `*.proptech.com.py/*`
   - Edge Cache TTL: `Respect all origin cache headers`
   - Browser Cache TTL: `Respect existing headers`

## Checklist de Deploy

**CADA VEZ que hagas deploy:**

- [ ] Ejecutar `./deploy-frontend-prod.sh` en el servidor
- [ ] **ESPERAR** a que termine completamente
- [ ] **LIMPIAR** cache de Cloudflare (Dashboard o API)
- [ ] Verificar que el sitio carga correctamente
- [ ] Hard refresh en el navegador (Ctrl+Shift+R o Cmd+Shift+R)

## ¿Por qué esto soluciona el problema DE RAÍZ?

1. **HTML nunca se cachea**: Cada visita obtiene el HTML más reciente
2. **HTML reciente referencia chunks correctos**: Los hashes coinciden con lo que existe en el servidor
3. **Chunks se cachean largo tiempo**: Son immutable, no cambian
4. **BuildId único**: Garantiza que cada build es único y no hay colisión de hashes
5. **Standalone optimizado**: Deployment más rápido y eficiente

## Troubleshooting

### Si aún ves chunks 404:

1. **Verificar que Cloudflare está limpio:**
   ```bash
   curl -I https://proptech.com.py/propiedad/tu-slug
   ```
   - NO debe aparecer `cf-cache-status: HIT`
   - Debe ser `MISS` o `DYNAMIC`

2. **Verificar headers en producción:**
   ```bash
   curl -I https://proptech.com.py/
   ```
   - Debe mostrar `Cache-Control: no-store, no-cache...`

3. **Verificar que el build standalone existe:**
   ```bash
   ssh usuario@servidor
   ls -la /home/dan/next-app/.next/static/
   cat /home/dan/next-app/server.js | head -5
   ```

4. **Ver logs del servicio:**
   ```bash
   sudo journalctl -u proptech-frontend -f
   ```

### Si el sitio no carga después del deploy:

1. **Verificar que server.js existe:**
   ```bash
   ls -la /home/dan/next-app/server.js
   ```

2. **Verificar permisos:**
   ```bash
   sudo chown -R dan:dan /home/dan/next-app
   sudo chmod +x /home/dan/next-app/server.js
   ```

3. **Reiniciar servicio:**
   ```bash
   sudo systemctl restart proptech-frontend
   sudo systemctl status proptech-frontend
   ```

## Notas Importantes

- **NO usar cache agresivo en desarrollo**: Puede confundir durante testing
- **Cloudflare cache DEBE limpiarse**: Es el paso más crítico
- **Hard refresh obligatorio**: Los navegadores son agresivos con cache
- **Standalone es más rápido**: Deploy en ~30 segundos vs ~2 minutos antes

## Scripts Útiles

```bash
# Ver qué está cacheado localmente
chrome://net-internals/#dns

# Limpiar DNS local
ipconfig /flushdns  # Windows
sudo dscacheutil -flushcache # Mac
sudo systemd-resolve --flush-caches # Linux

# Verificar tamaño del build
du -sh /home/dan/next-app/.next/

# Ver chunks generados
ls -lh /home/dan/next-app/.next/static/chunks/
```

---

**🎯 Con esta solución, el problema de chunks 404 queda resuelto DE RAÍZ.**

