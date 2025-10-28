#!/bin/bash
set -euo pipefail

# ========================
# FIX PRODUCCIÓN - ARCHIVOS ESTÁTICOS NO SE CARGAN
# ========================
# Problema: Los archivos /_next/static/* retornan HTML (404) en lugar de JS/CSS
# Causa: Configuración incorrecta del servidor o build corrupto
# ========================

PROD_DIR="/home/dan/next-app"
SERVICE_NAME="proptech-frontend"

echo "======================================="
echo "🔧 FIX: Archivos Estáticos no se Cargan"
echo "📅 $(date)"
echo "======================================="

# ========================
# 1. Verificar estado actual
# ========================
echo ""
echo "🔍 DIAGNÓSTICO:"
echo "----------------------------------------"

echo "1. Verificando servicio..."
if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
    echo "✅ Servicio está corriendo"
    sudo systemctl status "$SERVICE_NAME" --no-pager -l | head -5
else
    echo "❌ Servicio NO está corriendo"
fi

echo ""
echo "2. Verificando directorio de producción..."
if [ -d "$PROD_DIR" ]; then
    echo "✅ Directorio existe: $PROD_DIR"
    ls -lh "$PROD_DIR" | head -10
else
    echo "❌ Directorio NO existe: $PROD_DIR"
    exit 1
fi

echo ""
echo "3. Verificando archivos .next..."
if [ -d "$PROD_DIR/.next" ]; then
    echo "✅ Directorio .next existe"
    echo "📂 Contenido de .next:"
    ls -lh "$PROD_DIR/.next" | head -10
    
    if [ -d "$PROD_DIR/.next/static" ]; then
        echo "✅ Directorio .next/static existe"
        echo "📂 Contenido de .next/static:"
        ls -lh "$PROD_DIR/.next/static" | head -10
    else
        echo "❌ Directorio .next/static NO existe"
    fi
else
    echo "❌ Directorio .next NO existe"
    echo "🔄 Se requiere rebuild completo"
fi

echo ""
echo "4. Verificando puerto 3007..."
if lsof -ti:3007 >/dev/null 2>&1; then
    echo "✅ Puerto 3007 está en uso (esperado)"
    lsof -i:3007
else
    echo "❌ Puerto 3007 NO está en uso (problema)"
fi

# ========================
# 2. Soluciones
# ========================
echo ""
echo "======================================="
echo "🔧 APLICANDO SOLUCIONES:"
echo "======================================="

# Solución 1: Verificar configuración de Next.js
echo ""
echo "Solución 1: Verificando next.config.js..."
if [ -f "$PROD_DIR/next.config.js" ]; then
    echo "✅ next.config.js existe"
    echo "📄 Contenido relevante:"
    grep -E "(assetPrefix|basePath|output)" "$PROD_DIR/next.config.js" || echo "Sin configuraciones de rutas"
else
    echo "⚠️ next.config.js NO existe"
fi

# Solución 2: Verificar variables de entorno
echo ""
echo "Solución 2: Verificando variables de entorno..."
if [ -f "$PROD_DIR/.env.production" ]; then
    echo "✅ .env.production existe"
    echo "📄 Variables (sin valores sensibles):"
    grep -E "^(NEXT_PUBLIC_|NODE_ENV)" "$PROD_DIR/.env.production" || echo "Sin variables NEXT_PUBLIC"
else
    echo "⚠️ .env.production NO existe"
fi

# Solución 3: Detener servicio y limpiar caché
echo ""
echo "Solución 3: Limpiando y reiniciando servicio..."
echo "🛑 Deteniendo servicio..."
sudo systemctl stop "$SERVICE_NAME" || true
sleep 2

# Verificar que el puerto esté libre
if lsof -ti:3007 >/dev/null 2>&1; then
    echo "⚠️ Puerto 3007 todavía en uso, forzando..."
    sudo kill -9 $(lsof -ti:3007) 2>/dev/null || true
    sleep 1
fi

# Solución 4: Limpiar caché de Next.js
echo ""
echo "Solución 4: Limpiando caché de Next.js..."
if [ -d "$PROD_DIR/.next/cache" ]; then
    echo "🧹 Eliminando caché..."
    sudo rm -rf "$PROD_DIR/.next/cache"
    echo "✅ Caché eliminado"
fi

# Solución 5: Rebuild COMPLETO
echo ""
echo "Solución 5: ¿Necesita rebuild completo?"
echo "Si los archivos estáticos no existen o están corruptos, se requiere rebuild."
read -p "¿Desea hacer un rebuild completo? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "🔨 Iniciando rebuild completo..."
    
    # Ir al directorio del repositorio
    REPO_DIR="/home/dan/proptech-frontend"
    if [ -d "$REPO_DIR" ]; then
        cd "$REPO_DIR"
        
        echo "📦 Instalando dependencias..."
        npm ci --production=false
        
        echo "🔨 Compilando aplicación..."
        npm run build
        
        if [ -d ".next" ]; then
            echo "✅ Build exitoso"
            
            # Backup del build anterior
            if [ -d "$PROD_DIR/.next" ]; then
                BACKUP_DIR="$PROD_DIR/backups"
                sudo mkdir -p "$BACKUP_DIR"
                TIMESTAMP=$(date +%Y%m%d_%H%M%S)
                echo "💾 Creando backup..."
                sudo tar -czf "$BACKUP_DIR/next-build-$TIMESTAMP.tar.gz" -C "$PROD_DIR" .next 2>/dev/null || true
            fi
            
            # Copiar nuevo build
            echo "📂 Copiando nuevo build a producción..."
            sudo rm -rf "$PROD_DIR/.next"
            sudo cp -r .next "$PROD_DIR/"
            sudo chown -R dan:dan "$PROD_DIR/.next"
            sudo chmod -R 755 "$PROD_DIR/.next"
            
            echo "✅ Build copiado correctamente"
        else
            echo "❌ Error: Build falló"
            exit 1
        fi
    else
        echo "❌ Error: Repositorio no encontrado en $REPO_DIR"
        echo "ℹ️  Ejecute el script de deploy completo: deploy-frontend-prod.sh"
        exit 1
    fi
fi

# Solución 6: Verificar permisos
echo ""
echo "Solución 6: Verificando y corrigiendo permisos..."
sudo chown -R dan:dan "$PROD_DIR"
sudo chmod -R 755 "$PROD_DIR"
echo "✅ Permisos corregidos"

# Solución 7: Reiniciar servicio
echo ""
echo "Solución 7: Reiniciando servicio..."
sudo systemctl daemon-reload
sudo systemctl start "$SERVICE_NAME"
sleep 5

if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "✅ Servicio reiniciado correctamente"
else
    echo "❌ Error: Servicio no se inició"
    echo "📋 Logs:"
    sudo journalctl -u "$SERVICE_NAME" --no-pager -l -n 30
    exit 1
fi

# ========================
# 3. Verificación final
# ========================
echo ""
echo "======================================="
echo "🔍 VERIFICACIÓN FINAL:"
echo "======================================="

echo "1. Verificando servicio..."
if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "✅ Servicio está corriendo"
else
    echo "❌ Servicio NO está corriendo"
fi

echo ""
echo "2. Verificando endpoint..."
MAX_WAIT=30
WAIT_COUNT=0
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if curl -s http://localhost:3007 > /dev/null 2>&1; then
        echo "✅ Endpoint responde correctamente"
        break
    fi
    WAIT_COUNT=$((WAIT_COUNT + 1))
    if [ $((WAIT_COUNT % 5)) -eq 0 ]; then
        echo "⏳ Esperando... ($WAIT_COUNT/$MAX_WAIT)"
    fi
    sleep 1
done

if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
    echo "⚠️ Endpoint no responde después de $MAX_WAIT segundos"
fi

# ========================
# 4. Instrucciones adicionales
# ========================
echo ""
echo "======================================="
echo "📋 INSTRUCCIONES ADICIONALES:"
echo "======================================="
echo ""
echo "🌐 CLOUDFLARE:"
echo "Si el problema persiste, puede ser un problema de Cloudflare Tunnel o caché:"
echo ""
echo "1. Verificar Cloudflare Tunnel:"
echo "   sudo systemctl status cloudflare-tunnel"
echo "   sudo systemctl restart cloudflare-tunnel"
echo ""
echo "2. Limpiar caché de Cloudflare:"
echo "   - Ir a https://dash.cloudflare.com"
echo "   - Seleccionar dominio proptech.com.py"
echo "   - Ir a 'Caching' > 'Configuration'"
echo "   - Click en 'Purge Everything'"
echo ""
echo "3. Verificar configuración del tunnel:"
echo "   cat ~/.cloudflared/config.yml"
echo ""
echo "🌐 NGINX (si aplica):"
echo "Si hay nginx como reverse proxy:"
echo "   sudo systemctl status nginx"
echo "   sudo nginx -t"
echo "   sudo systemctl restart nginx"
echo ""
echo "💻 NAVEGADOR:"
echo "Limpiar caché del navegador:"
echo "   - Chrome: Ctrl+Shift+Delete > Clear cache"
echo "   - Firefox: Ctrl+Shift+Delete > Clear cache"
echo "   - Safari: Cmd+Option+E"
echo ""
echo "🔍 VERIFICAR LOGS:"
echo "   sudo journalctl -u proptech-frontend -f"
echo "   sudo journalctl -u cloudflare-tunnel -f"
echo ""
echo "======================================="

